import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ResumeService, Template } from '../../services/resume.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/services/toast';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { FALLBACK_TEMPLATES } from '../../modules/builder/templates/template-registry';

@Component({
  selector: 'app-template-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './templates.html',
  styleUrl: './templates.css'
})
export class TemplateGalleryComponent implements OnInit, OnDestroy {
  templates: Template[] = [];
  filteredTemplates: Template[] = [];

  styleCategories = ['All', 'Professional', 'Minimalist', 'Creative', 'ATS', 'Entry Level'];
  professionCategories = ['All', 'Tech', 'Finance', 'Design', 'Marketing', 'Healthcare', 'Legal', 'Academic', 'Sales', 'Engineering'];

  activeStyle = 'All';
  activeProfession = 'All';
  searchQuery = '';
  sortBy = 'popular';
  isLoading = true;

  // Modal state
  previewModalOpen = false;
  previewModalTemplate: Template | null = null;
  previewModalIndex = 0;
  
  debugError: string | null = null;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private resumeService: ResumeService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadTemplates();

    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      next: (ts) => {
        if (ts && ts.length > 0) {
          // Enrich backend templates with local thumbnails & corrected keys
          this.templates = ts.map(t => {
            const correctedKey = this.keyMap[t.templateKey] || t.templateKey;
            const fallback = FALLBACK_TEMPLATES.find((f: any) => f.templateKey === correctedKey);
            return {
              ...t,
              templateKey: correctedKey,
              thumbnailUrl: fallback?.thumbnailUrl || t.thumbnailUrl,
              previewImageUrl: fallback?.previewImageUrl || (t as any).previewImageUrl
            };
          });
          // Append any local-only templates not present in backend
          for (const fb of FALLBACK_TEMPLATES) {
            const exists = this.templates.some(
              t => t.templateKey === fb.templateKey || t.templateId === fb.templateId
            );
            if (!exists) {
              this.templates.push(fb as any);
            }
          }
        } else {
          this.templates = FALLBACK_TEMPLATES as any[];
        }
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        console.warn('[TemplateGallery] Backend unavailable, using fallback templates');
        this.templates = FALLBACK_TEMPLATES as any[];
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  setStyle(cat: string): void {
    this.activeStyle = cat;
    this.applyFilters();
  }

  setProfession(cat: string): void {
    this.activeProfession = cat;
    this.applyFilters();
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  applyFilters(): void {
    let result = [...this.templates];

    if (this.activeStyle !== 'All') {
      result = result.filter(t =>
        t.category?.toLowerCase() === this.activeStyle.toLowerCase()
      );
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (this.sortBy === 'popular') {
      result.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0));
    } else if (this.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    this.filteredTemplates = result;
  }

  openPreviewModal(template: Template): void {
    this.previewModalIndex = this.filteredTemplates.indexOf(template);
    this.previewModalTemplate = template;
    this.previewModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closePreviewModal(): void {
    this.previewModalOpen = false;
    this.previewModalTemplate = null;
    document.body.style.overflow = '';
  }

  navigateModal(dir: number): void {
    const next = this.previewModalIndex + dir;
    if (next >= 0 && next < this.filteredTemplates.length) {
      this.openPreviewModal(this.filteredTemplates[next]);
    }
  }

  useTemplate(template: Template): void {
    this.closePreviewModal();
    if (!this.authService.isAuthenticated()) {
      this.toastService.info('Please log in to use this template.');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/app/resumes/new?templateId=${template.templateKey || template.templateId}` }
      });
      return;
    }
    // Block free users from premium templates
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
    this.resumeService.incrementTemplateUsage(template.templateId).subscribe();
    this.router.navigate(['/app/resumes/new'], {
      queryParams: { templateId: template.templateKey || template.templateId }
    });
  }

  get resultCount(): number {
    return this.filteredTemplates.length;
  }
}
