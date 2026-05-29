import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ResumeService, Resume, Section, Template } from '../../services/resume.service';
import { ToastService } from '../../shared/services/toast';
import { ModalComponent } from '../../shared/components/modal/modal';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { TemplateEngineService } from '../../services/template-engine.service';
import { TEMPLATE_REGISTRY, FALLBACK_TEMPLATES } from '../../modules/builder/templates/template-registry';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { saveAs } from 'file-saver';

const DEFAULT_CONTENT: Record<string, any> = {
  EXPERIENCE: { company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '' },
  EDUCATION: { school: '', degree: '', field: '', startYear: '', endYear: '', gpa: '', description: '' },
  SKILLS: { skills: '' },
  PROJECTS: { projectName: '', techStack: '', url: '', description: '' },
  CERTIFICATIONS: { certName: '', issuer: '', issueDate: '', credentialUrl: '' },
  LANGUAGES: { items: [{ language: '', proficiency: 'Fluent' }] },
  SUMMARY: { text: '' },
  VOLUNTEER: { organization: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '' },
  CUSTOM: { text: '' }
};

const SECTION_LABELS: Record<string, string> = {
  EXPERIENCE: 'Work Experience', EDUCATION: 'Education', SKILLS: 'Skills',
  PROJECTS: 'Projects', CERTIFICATIONS: 'Certifications', LANGUAGES: 'Languages',
  SUMMARY: 'Summary', VOLUNTEER: 'Volunteer', CUSTOM: 'Custom Section'
};

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Beginner'];

// Active left panel tabs
type Tab = 'info' | 'content' | 'design' | 'export';

@Component({
  selector: 'app-resume-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  templateUrl: './resume-builder.html',
  styleUrl: './resume-builder.css'
})
export class ResumeBuilderComponent implements OnInit, OnDestroy, AfterViewInit {
  resumeId: number | null = null;
  resume: Resume = { title: 'My Resume', fullName: '', email: '', phone: '', location: '', linkedin: '', website: '', targetJobTitle: '', summary: '', status: 'DRAFT' };
  sections: Section[] = [];
  sectionForms: Map<number, any> = new Map();

  isLoading = true;
  isSaving = false;
  isExporting = false;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
  errorMessage = '';

  activeTab: Tab = 'info';
  collapsedSections = new Set<string>();

  // Templates
  showTemplateModal = false;
  templates: Template[] = [];
  selectedTemplate: Template | null = null;

  // Preview
  previewComponentClass: any = null;
  previewComponentData: any = null;
  isRenderingPreview = false;
  previewScale = 1;

  // AI
  isImproving = new Set<number>();
  isGeneratingSummary = false;
  isCheckingAts = false;
  isSuggestingSkills = new Set<number>();
  isGeneratingBullets = new Set<number>();
  showAtsModal = false;
  jobDescription = '';
  atsReport: any = null;

  userPlan: string = 'FREE';
  showPremiumModal: boolean = false;

  // Premium Features State
  showCoverLetterModal: boolean = false;
  clJobDescription: string = '';
  isGeneratingCL: boolean = false;
  generatedCoverLetter: string = '';

  showTailorModal: boolean = false;
  tailorJobDescription: string = '';
  isTailoring: boolean = false;

  showTranslateModal: boolean = false;
  targetLanguage: string = 'Spanish';
  isTranslating: boolean = false;

  readonly sectionTypes = Object.keys(SECTION_LABELS);
  readonly sectionLabels = SECTION_LABELS;
  readonly proficiencyLevels = PROFICIENCY_LEVELS;

  @ViewChild('previewWrap') previewWrapRef!: ElementRef<HTMLElement>;

  private destroy$ = new Subject<void>();
  private previewSubject = new Subject<void>();
  private saveSubject = new Subject<Section>();
  private previewTimer: any;
  private updateTimers = new Map<number, any>();
  private nextTempId = -1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private resumeService: ResumeService,
    private toastService: ToastService,
    public readonly authService: AuthService,
    private templateEngine: TemplateEngineService,
    private cdr: ChangeDetectorRef,
    private confirmDialog: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      if(u) this.userPlan = u.plan || 'FREE';
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const templateParam = this.route.snapshot.queryParamMap.get('templateId');
    this.resumeId = idParam ? Number(idParam) : null;

    if (this.resumeId && this.resumeId > 0) {
      this.loadResume();
    } else {
      this.isLoading = false;
      if (templateParam) {
        this.loadTemplateAndApply(templateParam);
      }
    }
    this.loadTemplates();

    // Preview debounce — 600ms after any change
    this.previewSubject.pipe(
      debounceTime(600),
      takeUntil(this.destroy$)
    ).subscribe(() => this.renderPreview());
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.calculatePreviewScale(), 100);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.calculatePreviewScale();
  }

  private calculatePreviewScale(): void {
    if (!this.previewWrapRef?.nativeElement) return;
    const containerWidth = this.previewWrapRef.nativeElement.clientWidth - 40; // 20px padding each side
    const a4Width = 794;
    this.previewScale = containerWidth < a4Width ? containerWidth / a4Width : 1;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadResume(): void {
    this.isLoading = true;
    forkJoin({
      resume: this.resumeService.getResume(this.resumeId!),
      sections: this.resumeService.getSections(this.resumeId!)
    }).subscribe({
      next: ({ resume, sections }) => {
        this.resume = resume;
        this.sections = sections;
        this.sections.forEach(s => this.parseSection(s));
        this.isLoading = false;
        if (this.resume.templateId) {
          this.loadTemplateAndApply(this.resume.templateId);
        } else {
          this.renderPreview();
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Could not load this resume.';
      }
    });
  }

  /** Map old backend templateKeys to the correct frontend registry keys */
  private readonly keyMap: Record<string, string> = {
    'modern-executive': 'modern-template',
    'clean-slate': 'minimal-template',
    'fresh-start': 'executive-template',
    'creative-canvas': 'creative-template',
    'academic-scholar': 'ats-template'
  };

  loadTemplates(): void {
    // Fetch from backend template-service, fallback to local registry
    this.resumeService.getTemplates().subscribe({
      next: ts => {
        if (ts && ts.length > 0) {
          this.templates = ts.map(t => {
            const correctedKey = this.keyMap[t.templateKey] || t.templateKey;
            const fallback = FALLBACK_TEMPLATES.find((f: any) => f.templateKey === correctedKey);
            return { ...t, templateKey: correctedKey, thumbnailUrl: fallback?.thumbnailUrl || t.thumbnailUrl };
          });
          // Append local-only templates not in backend
          for (const fb of FALLBACK_TEMPLATES) {
            const exists = this.templates.some(
              (t: any) => t.templateKey === fb.templateKey || t.templateId === fb.templateId
            );
            if (!exists) this.templates.push(fb as any);
          }
        } else {
          this.templates = FALLBACK_TEMPLATES as any[];
        }
      },
      error: () => {
        console.warn('[Builder] Backend unavailable, using fallback templates');
        this.templates = FALLBACK_TEMPLATES as any[];
      }
    });
  }

  loadTemplateAndApply(id: string): void {
    // Correct old key if needed
    const correctedId = this.keyMap[id] || id;

    // Try backend first for full template metadata
    this.resumeService.getTemplateById(id).subscribe({
      next: t => {
        // Backend may return templateKey as null — fall back to correctedId
        const key = this.keyMap[t.templateKey] || t.templateKey || correctedId;
        this.selectedTemplate = { ...t, templateKey: key } as any;
        this.resume.templateId = key;
        this.scaffoldDefaultSections();
        this.renderPreview();
      },
      error: () => {
        // Fallback: look up from local registry
        const found = FALLBACK_TEMPLATES.find((t: any) =>
          t.templateId === correctedId || t.templateKey === correctedId ||
          t.templateId === id || t.templateKey === id
        );
        if (found) {
          this.selectedTemplate = found as any;
          this.resume.templateId = correctedId;
        }
        this.scaffoldDefaultSections();
        this.renderPreview();
      }
    });
  }



  /**
   * When a new resume is created from a template, pre-populate standard sections
   * with sample data so the template renders fully and the user can edit immediately.
   */
  private scaffoldDefaultSections(): void {
    // Only scaffold if it's a new resume with no sections yet
    if (this.sections.length > 0) return;

    const defaultSections: { type: string; title: string; content: any }[] = [
      {
        type: 'SUMMARY', title: 'Summary',
        content: { text: 'Results-driven professional with 5+ years of experience in delivering high-quality solutions. Passionate about leveraging technology to solve complex problems.' }
      },
      {
        type: 'EXPERIENCE', title: 'Work Experience',
        content: { company: 'Acme Corporation', role: 'Senior Software Engineer', location: 'San Francisco, CA', startDate: 'Jan 2021', endDate: '', current: true, description: 'Led development of microservices architecture serving 1M+ users. Improved system performance by 40% through optimization and caching strategies.' }
      },
      {
        type: 'EXPERIENCE', title: 'Work Experience',
        content: { company: 'Tech Startup Inc', role: 'Software Engineer', location: 'New York, NY', startDate: 'Jun 2018', endDate: 'Dec 2020', current: false, description: 'Built and maintained RESTful APIs and React-based dashboards. Collaborated with cross-functional teams to deliver features on schedule.' }
      },
      {
        type: 'EDUCATION', title: 'Education',
        content: { school: 'University of Technology', degree: 'Bachelor of Science', field: 'Computer Science', startYear: '2014', endYear: '2018', gpa: '3.8', description: '' }
      },
      {
        type: 'SKILLS', title: 'Skills',
        content: { skills: 'JavaScript, TypeScript, Python, Java, React, Angular, Node.js, SQL, Docker, AWS, Git' }
      },
      {
        type: 'PROJECTS', title: 'Projects',
        content: { projectName: 'ResumeAI Platform', techStack: 'Angular, Spring Boot, MySQL', url: '', description: 'Built an AI-powered resume builder with live template preview and ATS optimization.' }
      },
      {
        type: 'CERTIFICATIONS', title: 'Certifications',
        content: { certName: 'AWS Solutions Architect', issuer: 'Amazon Web Services', issueDate: '2023', credentialUrl: '' }
      }
    ];

    // Assign temporary negative IDs (will be replaced when saved to backend)
    defaultSections.forEach(s => {
      const tempId = this.nextTempId--;
      const section: Section = {
        sectionId: tempId,
        resumeId: this.resumeId || 0,
        sectionType: s.type,
        title: s.title,
        content: JSON.stringify(s.content),
        displayOrder: this.sections.length,
        isVisible: true,
        aiGenerated: false
      };
      this.sections.push(section);
      this.sectionForms.set(tempId, s.content);
    });

    // Also set sample personal info
    if (!this.resume.fullName) this.resume.fullName = 'My Resume';
    if (!this.resume.targetJobTitle) this.resume.targetJobTitle = 'Professional Title';
    if (!this.resume.email) this.resume.email = 'email@example.com';
    if (!this.resume.phone) this.resume.phone = '+91 98765 43210';
    if (!this.resume.location) this.resume.location = 'City, Country';
  }

  // ── Section parsing ────────────────────────────────────────────────────────

  parseSection(section: Section): void {
    const id = section.sectionId ?? section.id ?? 0;
    if (!id) return;
    try {
      const data = section.content ? JSON.parse(section.content) : {};
      const defaults = DEFAULT_CONTENT[section.sectionType] || { text: '' };
      this.sectionForms.set(id as number, { ...defaults, ...data });
    } catch {
      this.sectionForms.set(id as number, { ...DEFAULT_CONTENT[section.sectionType] || { text: '' } });
    }
  }

  getForm(section: Section): any {
    const id = section.sectionId ?? section.id ?? 0;
    return this.sectionForms.get(id as number) || {};
  }

  onFormChange(section: Section): void {
    const id = section.sectionId ?? section.id;
    if (!id) return;
    const form = this.sectionForms.get(id as number);
    section.content = JSON.stringify(form);
    // Auto-update title
    if (section.sectionType === 'EXPERIENCE' || section.sectionType === 'VOLUNTEER')
      section.title = form.company || SECTION_LABELS[section.sectionType];
    else if (section.sectionType === 'EDUCATION')
      section.title = form.school || 'Education';
    else if (section.sectionType === 'PROJECTS')
      section.title = form.projectName || 'Project';
    else if (section.sectionType === 'CERTIFICATIONS')
      section.title = form.certName || 'Certification';

    this.debounceSectionSave(section);
    this.triggerPreviewUpdate();
  }

  // ── Preview (iframe srcdoc) ────────────────────────────────────────────────

  triggerPreviewUpdate(): void {
    this.previewSubject.next();
  }

  async renderPreview(): Promise<void> {
    if (!this.selectedTemplate) {
      this.previewComponentClass = null;
      return;
    }

    this.isRenderingPreview = true;
    const data = this.buildResumeData();

    try {
      const key = this.selectedTemplate.templateKey;
      const component = TEMPLATE_REGISTRY[key];
      console.log('[Builder] renderPreview key=', key, 'component=', component, 'registry keys=', Object.keys(TEMPLATE_REGISTRY));
      this.previewComponentClass = component || null;
      this.previewComponentData = {
        resumeData: data,
        customization: {
          primaryColor: this.selectedTemplate.primaryColor,
          secondaryColor: this.selectedTemplate.secondaryColor,
          fontFamily: this.selectedTemplate.fontFamily
        }
      };
    } catch (e) {
      console.error('Failed to load template component', e);
      this.previewComponentClass = null;
    } finally {
      this.isRenderingPreview = false;
      this.cdr.detectChanges();
    }
  }

  /** Build the structured ResumeData object for the template engine */
  private buildResumeData(): any {
    const expList: any[] = [];
    const volunteerList: any[] = [];
    const eduList: any[] = [];
    let skills: string[] = [];
    const certList: any[] = [];
    const projList: any[] = [];
    const langList: any[] = [];
    const customSections: any[] = [];
    let summaryText = this.resume.summary || '';

    this.sections.filter(s => s.isVisible).forEach(s => {
      const form = this.getForm(s);
      switch (s.sectionType) {
        case 'EXPERIENCE':
          expList.push({
            jobTitle: form.role, company: form.company, location: form.location,
            startDate: form.startDate, endDate: form.current ? 'Present' : form.endDate,
            isCurrent: !!form.current, description: form.description
          });
          break;
        case 'VOLUNTEER':
          volunteerList.push({
            jobTitle: form.role, company: form.company, location: form.location,
            startDate: form.startDate, endDate: form.current ? 'Present' : form.endDate,
            isCurrent: !!form.current, description: form.description
          });
          break;
        case 'EDUCATION':
          eduList.push({
            degree: form.degree, institution: form.school, fieldOfStudy: form.field,
            year: form.endYear, startDate: form.startYear, gpa: form.gpa
          });
          break;
        case 'SKILLS':
          skills = (form.skills || '').split(/[,\n]+/).map((x: string) => x.trim()).filter(Boolean);
          break;
        case 'CERTIFICATIONS':
          certList.push({
            name: form.certName, issuer: form.issuer,
            issueDate: form.issueDate, credentialUrl: form.credentialUrl
          });
          break;
        case 'PROJECTS':
          projList.push({
            name: form.projectName, techStack: form.techStack,
            projectUrl: form.url, description: form.description
          });
          break;
        case 'LANGUAGES':
          if (form.items && Array.isArray(form.items)) {
            form.items.forEach((item: any) => {
              if (item.language?.trim()) {
                langList.push({ language: item.language, proficiency: item.proficiency || '' });
              }
            });
          }
          break;
        case 'SUMMARY':
          summaryText = form.text || summaryText;
          break;
        case 'CUSTOM':
          customSections.push({ title: s.title || 'Other', content: form.text || '' });
          break;
      }
    });

    return {
      personalInfo: {
        fullName: this.resume.fullName || this.resume.title || '',
        jobTitle: this.resume.targetJobTitle || '',
        email: this.resume.email || '',
        phone: this.resume.phone || '',
        location: this.resume.location || '',
        linkedin: this.resume.linkedin || '',
        website: this.resume.website || '',
        initials: this.getInitials(this.resume.fullName)
      },
      summary: summaryText,
      experience: expList,
      volunteer: volunteerList,
      education: eduList,
      skills,
      certifications: certList,
      projects: projList,
      languages: langList,
      customSections
    };
  }

  private getInitials(name?: string): string {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  /**
   * When saving, the backend may return nulls for fields the user has
   * edited locally but not yet persisted.  Return an object whose keys
   * should override the server response so nothing gets blanked out.
   */
  private getLocalOverrides(saved: any): Record<string, any> {
    const overrides: Record<string, any> = {};
    const fields = [
      'fullName', 'targetJobTitle', 'email', 'phone',
      'location', 'linkedin', 'website', 'summary', 'templateId'
    ];
    for (const f of fields) {
      // Keep the local value when the server returned empty but we have data
      if ((this.resume as any)[f] && !saved[f]) {
        overrides[f] = (this.resume as any)[f];
      }
    }
    return overrides;
  }

  private buildFallbackHtml(): string {
    const name = this.resume.fullName || this.resume.title || 'Your Name';
    const job = this.resume.targetJobTitle || 'Your Job Title';
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1e293b; padding: 40px; }
      .name { font-size: 28px; font-weight: 700; color: #1e293b; }
      .role { font-size: 14px; color: #6366f1; margin-top: 4px; }
      .contact { margin-top: 12px; font-size: 12px; color: #64748b; display: flex; gap: 16px; flex-wrap: wrap; }
      hr { margin: 20px 0; border: none; border-top: 2px solid #e2e8f0; }
      .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; font-weight: 700; margin-bottom: 12px; }
      p { font-size: 13px; color: #475569; line-height: 1.6; }
    </style></head><body>
    <div class="name">${name}</div>
    <div class="role">${job}</div>
    <div class="contact">
      ${this.resume.email ? `<span>✉ ${this.resume.email}</span>` : ''}
      ${this.resume.phone ? `<span>📞 ${this.resume.phone}</span>` : ''}
      ${this.resume.location ? `<span>📍 ${this.resume.location}</span>` : ''}
    </div>
    <hr>
    ${this.resume.summary ? `<div class="section-title">Summary</div><p>${this.resume.summary}</p><hr>` : ''}
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:40px">
      Select a template from the Design tab to see a professional preview →
    </p>
    </body></html>`;
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  saveResume(): void {
    if (!this.resume.title?.trim()) {
      this.toastService.error('Please enter a resume title.');
      return;
    }
    this.saveStatus = 'saving';
    this.isSaving = true;

    const isNew = !this.resumeId || this.resumeId <= 0;

    // Strip frontend-only fields before sending to backend
    const payload: any = { ...this.resume };
    delete payload.createdAt;
    delete payload.updatedAt;

    const save$ = (!isNew)
      ? this.resumeService.updateResume(this.resumeId!, payload)
      : this.resumeService.createResume(payload);

    save$.subscribe({
      next: saved => {
        // Merge server response into local state — keep locally-edited
        // fields that may not have round-tripped through the backend
        this.resume = { ...this.resume, ...saved, ...this.getLocalOverrides(saved) };
        this.resumeId = saved.id!;
        this.isSaving = false;
        this.saveStatus = 'saved';
        this.toastService.success('Saved!');
        setTimeout(() => this.saveStatus = 'idle', 2500);
        if (!window.location.pathname.includes('/edit/')) {
          this.location.replaceState(`/app/resumes/edit/${this.resumeId}`);
        }
        // Persist scaffolded / locally-added sections
        this.persistScaffoldedSections();
      },
      error: err => {
        this.isSaving = false;
        this.saveStatus = 'error';
        const msg = err?.error?.error || err?.message || 'Failed to save.';
        this.toastService.error(msg);
        setTimeout(() => this.saveStatus = 'idle', 3000);
      }
    });
  }

  // ── Section CRUD ──────────────────────────────────────────────────────────

  addSection(type: string): void {
    // If resume is already saved, create the section on the backend directly
    if (this.resumeId && this.resumeId > 0) {
      this.createNewSection(type);
      this.activeTab = 'content';
      return;
    }
    // Otherwise, add locally with a temporary negative ID
    this.addLocalSection(type);
    this.activeTab = 'content';
  }

  /** Add a section locally with a temporary negative ID (persisted on save) */
  private addLocalSection(type: string): void {
    const tempId = this.nextTempId--;
    const defaultContent = DEFAULT_CONTENT[type] || { text: '' };
    const section: Section = {
      sectionId: tempId,
      resumeId: this.resumeId || 0,
      sectionType: type,
      title: SECTION_LABELS[type] || type,
      content: JSON.stringify(defaultContent),
      displayOrder: this.sections.length,
      isVisible: true,
      aiGenerated: false
    };
    this.sections.push(section);
    this.sectionForms.set(tempId, { ...defaultContent });
    this.triggerPreviewUpdate();
  }

  /**
   * Persist any scaffolded sections that have temporary negative IDs.
   * Replaces them in-place with the server-assigned versions.
   */
  private async persistScaffoldedSections(): Promise<void> {
    const scaffolded = this.sections.filter(s => {
      const id = (s.sectionId ?? s.id) as number;
      return id < 0;
    });
    if (scaffolded.length === 0) return;

    for (const section of scaffolded) {
      const oldId = (section.sectionId ?? section.id) as number;
      const toSave: Section = {
        ...section,
        resumeId: this.resumeId!,
        sectionId: undefined as any,
        id: undefined as any
      };
      try {
        const saved = await new Promise<Section>((resolve, reject) => {
          this.resumeService.createSection(toSave).subscribe({ next: resolve, error: reject });
        });
        // Replace the temp section in place
        const idx = this.sections.findIndex(s => (s.sectionId ?? s.id) === oldId);
        if (idx !== -1) {
          this.sections[idx] = saved;
          // Move form data to new ID
          const formData = this.sectionForms.get(oldId);
          if (formData) {
            const newId = (saved.sectionId ?? saved.id) as number;
            this.sectionForms.set(newId, formData);
            this.sectionForms.delete(oldId);
          }
        }
      } catch (e) {
        console.error('Failed to persist scaffolded section', e);
      }
    }
  }

  private createNewSection(type: string): void {
    const newSection: Section = {
      resumeId: this.resumeId!, sectionType: type,
      title: SECTION_LABELS[type] || type,
      content: JSON.stringify(DEFAULT_CONTENT[type] || { text: '' }),
      displayOrder: this.sections.length, isVisible: true, aiGenerated: false
    };
    this.resumeService.createSection(newSection).subscribe({
      next: res => { this.sections.push(res); this.parseSection(res); this.triggerPreviewUpdate(); },
      error: () => this.toastService.error('Failed to add section.')
    });
  }

  updateSection(section: Section): void {
    const id = section.sectionId ?? section.id;
    if (!id) return;
    // Never send temp/scaffolded sections (negative IDs) to the backend
    if ((id as number) < 0) return;
    this.resumeService.updateSection(id as number, section).subscribe();
  }

  private debounceSectionSave(section: Section): void {
    const id = (section.sectionId ?? section.id) as number;
    // Skip backend save for local sections
    if (id < 0) return;
    if (this.updateTimers.has(id)) clearTimeout(this.updateTimers.get(id));
    this.updateTimers.set(id, setTimeout(() => this.updateSection(section), 900));
  }

  async deleteSection(section: Section): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      `"${section.title || 'This section'}" will be removed from your resume.`,
      'Delete Section',
      { confirmText: 'Delete', type: 'danger' }
    );
    if (!confirmed) return;
    const id = section.sectionId ?? section.id;
    if (!id) return;

    // Local section (negative ID) — just remove from array
    if ((id as number) < 0) {
      this.sections = this.sections.filter(s => (s.sectionId ?? s.id) !== id);
      this.sectionForms.delete(id as number);
      this.triggerPreviewUpdate();
      return;
    }

    this.resumeService.deleteSection(id as number).subscribe({
      next: () => {
        this.sections = this.sections.filter(s => (s.sectionId ?? s.id) !== id);
        this.sectionForms.delete(id as number);
        this.triggerPreviewUpdate();
      },
      error: () => this.toastService.error('Failed to delete.')
    });
  }

  toggleVisibility(section: Section): void {
    const id = section.sectionId ?? section.id;
    if (!id) return;

    // Local section — just toggle locally
    if ((id as number) < 0) {
      section.isVisible = !section.isVisible;
      this.triggerPreviewUpdate();
      return;
    }

    this.resumeService.toggleSectionVisibility(id as number).subscribe({
      next: updated => {
        const idx = this.sections.findIndex(s => (s.sectionId ?? s.id) === id);
        if (idx !== -1) { this.sections[idx] = updated; this.triggerPreviewUpdate(); }
      }
    });
  }

  // ── Language helpers ──────────────────────────────────────────────────────

  addLanguage(section: Section): void {
    const form = this.getForm(section);
    if (!form.items) form.items = [];
    form.items.push({ language: '', proficiency: 'Fluent' });
    this.onFormChange(section);
  }

  removeLanguage(section: Section, index: number): void {
    const form = this.getForm(section);
    form.items.splice(index, 1);
    this.onFormChange(section);
  }

  // ── Rich text ─────────────────────────────────────────────────────────────

  formatText(command: string, value?: string): void {
    document.execCommand(command, false, value || undefined);
  }

  onRichTextBlur(section: Section, fieldKey: string, editorEl: HTMLElement): void {
    const form = this.getForm(section);
    if (form[fieldKey] !== editorEl.innerHTML) {
      form[fieldKey] = editorEl.innerHTML;
      this.onFormChange(section);
    }
  }

  onRichTextInput(section: Section, fieldKey: string, editorEl: HTMLElement): void {
    const form = this.getForm(section);
    form[fieldKey] = editorEl.innerHTML;
    // Update preview in real-time
    this.triggerPreviewUpdate();
    
    // Also trigger save debounce
    if (!this.resumeId) return;
    const id = section.sectionId ?? section.id;
    if (!id || (id as number) < 0) return;
    if (this.updateTimers.has(id)) clearTimeout(this.updateTimers.get(id));
    this.updateTimers.set(id, setTimeout(() => this.updateSection(section), 900));
  }

  // ── Template selection ────────────────────────────────────────────────────

  selectTemplate(template: Template): void {
    if (template.isPremium && !this.authService.isPremium()) {
      this.confirmDialog.confirm(
        'This is a Premium template. Upgrade to Premium to unlock all templates and features.',
        'Premium Feature',
        { confirmText: 'Upgrade Now', cancelText: 'Maybe Later', type: 'info' }
      ).then(confirmed => {
        if (confirmed) {
          this.router.navigate(['/app/subscription']);
        }
      });
      return;
    }
    // Apply keyMap correction so TEMPLATE_REGISTRY lookup works
    const key = this.keyMap[template.templateKey] || template.templateKey;
    this.selectedTemplate = { ...template, templateKey: key } as any;
    this.resume.templateId = key;
    this.showTemplateModal = false;
    this.resumeService.incrementTemplateUsage(template.templateId).subscribe();
    this.renderPreview();
    if (this.resumeId) this.saveResume();
  }

  exportPdfDirectly(): void {
    const wrapper = document.querySelector('.preview-scale-container') as HTMLElement;
    if (!wrapper) {
      this.toastService.error('No preview to export — select a template first.');
      return;
    }

    // ── Enforce per-day PDF export quota before generating ─────────────────
    this.resumeService.trackExport(this.resumeId || 0, 'PDF').subscribe({
      next: () => this.doExportPdf(wrapper),
      error: (err) => {
        const msg: string = err?.error?.error || 'Daily PDF export limit reached.';
        this.confirmDialog.confirm(
          msg + ' Upgrade to Premium for unlimited PDF exports.',
          'Export Limit Reached',
          { confirmText: 'Upgrade Now', cancelText: 'Maybe Later', type: 'info' }
        ).then(confirmed => {
          if (confirmed) this.router.navigate(['/app/subscription']);
        });
      }
    });
  }

  private doExportPdf(wrapper: HTMLElement): void {
    this.isExporting = true;
    this.toastService.success('Generating PDF…');

    // Temporarily remove transform scaling so html2canvas captures at full size
    const origTransform = wrapper.style.transform;
    const origWidth = wrapper.style.width;
    const origTransformOrigin = wrapper.style.transformOrigin;
    wrapper.style.transform = 'none';
    wrapper.style.width = '794px';  // A4 width at 96dpi
    wrapper.style.transformOrigin = 'top left';

    // Small delay to let the browser reflow
    setTimeout(() => {
      html2canvas(wrapper, {
        scale: 2,          // 2x resolution for crisp text
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794
      }).then(canvas => {
        // Restore original transform
        wrapper.style.transform = origTransform;
        wrapper.style.width = origWidth;
        wrapper.style.transformOrigin = origTransformOrigin;

        // A4 dimensions in mm
        const pageW = 210;
        const pageH = 297;

        // Calculate how to scale the canvas image to fit A4
        const imgW = canvas.width;
        const imgH = canvas.height;
        const ratio = Math.min(pageW / imgW, pageH / imgH) * (imgW / pageW);

        // The image should fill A4 width, scaled height
        const pdfW = pageW;
        const pdfH = (imgH * pageW) / imgW;

        // If content is taller than A4, scale it down to fit one page
        const finalW = pdfH > pageH ? pageW * (pageH / pdfH) : pdfW;
        const finalH = pdfH > pageH ? pageH : pdfH;
        const offsetX = (pageW - finalW) / 2; // center horizontally

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', offsetX, 0, finalW, finalH);

        const filename = `${(this.resume.fullName || this.resume.title || 'resume').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        pdf.save(filename);

        this.isExporting = false;
        this.toastService.success('PDF downloaded!');
      }).catch(err => {
        // Restore original transform on error
        wrapper.style.transform = origTransform;
        wrapper.style.width = origWidth;
        wrapper.style.transformOrigin = origTransformOrigin;

        this.isExporting = false;
        this.toastService.error('PDF generation failed.');
        console.error('html2canvas error:', err);
      });
    }, 100);
  }

  // ── DOCX Export (Premium only) ─────────────────────────────────────────

  exportDocx(): void {
    if (!this.authService.isPremium()) {
      this.confirmDialog.confirm(
        'DOCX export is a Premium feature. Upgrade to Premium to unlock unlimited exports.',
        'Premium Feature',
        { confirmText: 'Upgrade Now', cancelText: 'Maybe Later', type: 'info' }
      ).then(confirmed => {
        if (confirmed) {
          this.router.navigate(['/app/subscription']);
        }
      });
      return;
    }

    const data = this.buildResumeData();
    data.templateKey = this.selectedTemplate?.templateKey || 'modern-template';
    data.customization = this.resume.customization || {};
    const filename = `${(data.personalInfo.fullName || 'resume').replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    
    this.resumeService.exportDocxDirect({ ...data, filename }).subscribe({
      next: (blob: Blob) => {
        saveAs(blob, filename);
        this.toastService.success('DOCX downloaded!');
      },
      error: () => {
        this.toastService.error('DOCX generation failed.');
      }
    });
  }

  // ── JSON Export (Premium only) ─────────────────────────────────────────

  exportJson(): void {
    if (!this.authService.isPremium()) {
      this.confirmDialog.confirm(
        'JSON export is a Premium feature. Upgrade to Premium to unlock unlimited exports.',
        'Premium Feature',
        { confirmText: 'Upgrade Now', cancelText: 'Maybe Later', type: 'info' }
      ).then(confirmed => {
        if (confirmed) {
          this.router.navigate(['/app/subscription']);
        }
      });
      return;
    }

    const data = this.buildResumeData();
    const filename = `${(data.personalInfo.fullName || 'resume').replace(/[^a-zA-Z0-9]/g, '_')}.json`;

    this.resumeService.exportJsonDirect({ ...data, filename }).subscribe({
      next: (blob: Blob) => {
        saveAs(blob, filename);
        this.toastService.success('JSON downloaded!');
      },
      error: () => {
        this.toastService.error('JSON export failed.');
      }
    });
  }

  // ── AI ────────────────────────────────────────────────────────────────────

  checkPremium(): boolean {
    if (this.userPlan !== 'PREMIUM') {
      this.showPremiumModal = true;
      return false;
    }
    return true;
  }

  handleAiError(err: any, fallbackMsg: string): void {
    if (err?.status === 403) {
      this.showPremiumModal = true;
    } else {
      this.toastService.error(err?.error?.message || err?.error?.error || fallbackMsg);
    }
  }

  generateAiSummary(): void {
    this.isGeneratingSummary = true;
    const role = this.resume.targetJobTitle || 'Professional';
    const exp = this.sections.filter(s => s.sectionType === 'EXPERIENCE').map(s => s.title).join(', ');
    const currentSummary = this.resume.summary || '';
    this.resumeService.generateAiSummary(this.resumeId || 0, role, exp, currentSummary).subscribe({
      next: s => {
        this.resume.summary = s;
        // Update the form field so it shows in the UI and preview
        const summarySection = this.sections.find(sec => sec.sectionType === 'SUMMARY');
        if (summarySection) {
          const form = this.getForm(summarySection);
          form.text = s;
          this.onFormChange(summarySection);
        } else {
          this.triggerPreviewUpdate();
        }
        this.isGeneratingSummary = false;
        this.toastService.success('AI summary generated!');
      },
      error: (err) => { this.isGeneratingSummary = false; this.handleAiError(err, 'AI failed.'); }
    });
  }

  improveSection(section: Section): void {
    if (!this.checkPremium()) return;
    const id = this.getSectionId(section);
    if (this.isImproving.has(id)) return;
    this.isImproving.add(id);
    const form = this.getForm(section);
    const content = form.description || form.text || '';
    this.resumeService.improveSectionWithAi(this.resumeId || 0, content).subscribe({
      next: improved => {
        if (form.description !== undefined) form.description = improved;
        else if (form.text !== undefined) form.text = improved;
        this.onFormChange(section);
        this.isImproving.delete(id);
        this.toastService.success('Improved!');
      },
      error: (err) => { this.isImproving.delete(id); this.handleAiError(err, 'AI failed.'); }
    });
  }

  runAtsCheck(): void {
    this.isCheckingAts = true;
    const jd = this.jobDescription || '';
    const resumeData = this.buildResumeData();
    this.resumeService.checkAtsScore(this.resumeId || 0, jd, resumeData).subscribe({
      next: report => {
        this.isCheckingAts = false;
        this.resume.atsScore = report.score;
        this.atsReport = report;
        this.showAtsModal = false;
        this.toastService.success(`ATS Score: ${report.score}%`);
        
        // Save the ATS score to the database so it reflects on the dashboard if saved
        if (this.resumeId) {
          const finalScore = parseInt(report.score, 10) || 0;
          this.resumeService.updateAtsScore(this.resumeId, finalScore).subscribe({
            next: () => {
              console.log('ATS Score saved to database successfully.');
            },
            error: (err) => {
              console.error('Failed to save ATS score to database', err);
            }
          });
        }
      },
      error: (err) => { this.isCheckingAts = false; this.showAtsModal = false; this.handleAiError(err, 'ATS check failed.'); }
    });
  }

  // --- PREMIUM AI FEATURES ---

  generateCoverLetter(): void {
    if (!this.checkPremium() || !this.clJobDescription) return;
    if (!this.resumeId) { this.toastService.error('Please save your resume first.'); return; }
    this.isGeneratingCL = true;
    this.resumeService.generateCoverLetter(this.resumeId, { jobDescription: this.clJobDescription }).subscribe({
      next: (cl) => {
        this.generatedCoverLetter = cl;
        this.isGeneratingCL = false;
        this.toastService.success('Cover Letter generated!');
      },
      error: (err) => {
        this.isGeneratingCL = false;
        this.handleAiError(err, 'Failed to generate Cover Letter.');
      }
    });
  }

  tailorResume(): void {
    if (!this.checkPremium() || !this.tailorJobDescription) return;
    if (!this.resumeId) { this.toastService.error('Please save your resume first.'); return; }
    this.isTailoring = true;
    this.resumeService.tailorForJob(this.resumeId, this.tailorJobDescription).subscribe({
      next: (res: any) => {
        if (res.updatedSummary) this.resume.summary = res.updatedSummary;
        this.isTailoring = false;
        this.showTailorModal = false;
        this.triggerPreviewUpdate();
        this.toastService.success('Resume tailored to Job Description!');
      },
      error: (err) => {
        this.isTailoring = false;
        this.handleAiError(err, 'Failed to tailor resume.');
      }
    });
  }

  translateResume(): void {
    if (!this.checkPremium() || !this.targetLanguage) return;
    if (!this.resumeId) { this.toastService.error('Please save your resume first.'); return; }
    this.isTranslating = true;
    this.resumeService.translateResume(this.resumeId, this.targetLanguage).subscribe({
      next: (res: any) => {
        try {
          const translated = JSON.parse(res.translatedJson);
          if (translated.summary) this.resume.summary = translated.summary;
          if (translated.targetJobTitle) this.resume.targetJobTitle = translated.targetJobTitle;
          // Apply translated fields...
          this.triggerPreviewUpdate();
          this.isTranslating = false;
          this.showTranslateModal = false;
          this.toastService.success(`Translated to ${this.targetLanguage}!`);
        } catch (e) {
          this.isTranslating = false;
          this.toastService.error('Translation formatting error.');
        }
      },
      error: (err) => {
        this.isTranslating = false;
        this.handleAiError(err, 'Failed to translate resume.');
      }
    });
  }

  suggestAiSkills(section: Section): void {
    const id = this.getSectionId(section);
    if (this.isSuggestingSkills.has(id)) return;
    this.isSuggestingSkills.add(id);
    const role = this.resume.targetJobTitle || (this.resume as any).title || 'Software Engineer';
    this.resumeService.suggestSkills(this.resumeId || 0, role).subscribe({
      next: (skills: string[]) => {
        const form = this.getForm(section);
        const existing = (form.skills || '').trim();
        const merged = existing ? existing + ', ' + skills.join(', ') : skills.join(', ');
        form.skills = merged;
        this.onFormChange(section);
        this.isSuggestingSkills.delete(id);
        this.toastService.success(`${skills.length} skills suggested!`);
      },
      error: (err) => { this.isSuggestingSkills.delete(id); this.handleAiError(err, 'Skill suggestion failed.'); }
    });
  }

  generateAiBullets(section: Section): void {
    const id = this.getSectionId(section);
    if (this.isGeneratingBullets.has(id)) return;
    this.isGeneratingBullets.add(id);
    const form = this.getForm(section);
    const role = form.role || form.jobTitle || 'Professional';
    const desc = form.company || form.organization || '';
    this.resumeService.generateAiBullets(this.resumeId || 0, role, desc).subscribe({
      next: (bullets: string[]) => {
        const formatted = '<ul>' + bullets.map(b => `<li>${b}</li>`).join('') + '</ul>';
        const existing = (form.description || '').trim();
        form.description = existing ? existing + formatted : formatted;
        this.onFormChange(section);
        this.isGeneratingBullets.delete(id);
        this.toastService.success('AI bullets generated!');
      },
      error: (err) => { this.isGeneratingBullets.delete(id); this.handleAiError(err, 'Bullet generation failed.'); }
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  duplicateResume(): void {
    if (!this.resumeId) return;
    this.resumeService.duplicateResume(this.resumeId).subscribe({
      next: r => { this.toastService.success('Duplicated!'); this.router.navigate(['/app/resumes/edit', r.id]); },
      error: () => this.toastService.error('Failed to duplicate.')
    });
  }



  // ── Helpers ───────────────────────────────────────────────────────────────

  getSectionId(section: Section): number { return (section.sectionId ?? section.id) as number; }
  getSectionLabel(type: string): string { return SECTION_LABELS[type] || type; }

  get saveLabel(): string {
    if (this.saveStatus === 'saving') return 'Saving…';
    if (this.saveStatus === 'saved') return '✓ Saved';
    if (this.saveStatus === 'error') return 'Error';
    return this.resumeId ? 'Save Changes' : 'Create Resume';
  }

  get atsScoreClass(): string {
    const s = this.resume.atsScore ?? 0;
    if (s >= 80) return 'ats-high';
    if (s >= 50) return 'ats-mid';
    return 'ats-low';
  }

  get visibleSections(): Section[] {
    return this.sections;
  }

  onPersonalInfoChange(): void {
    this.triggerPreviewUpdate();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  toggleCollapse(key: string): void {
    if (this.collapsedSections.has(key)) {
      this.collapsedSections.delete(key);
    } else {
      this.collapsedSections.add(key);
    }
  }

  isCollapsed(key: string): boolean {
    return this.collapsedSections.has(key);
  }
}
