import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ITemplateComponent, TemplateComponentData } from '../template-registry';

@Component({
  selector: 'app-executive-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ex-resume" [style.font-family]="data.customization?.fontFamily || 'Inter, sans-serif'">
      <div class="ex-header" [style.background]="accent">
        <div class="ex-name-block">
          <h1 class="ex-name">{{ r.personalInfo?.fullName || 'Your Name' }}</h1>
          <p class="ex-sub">{{ r.personalInfo?.jobTitle || 'Professional Title' }}</p>
        </div>
        <div class="ex-contact-block">
          <p>{{ r.personalInfo?.email || 'email&#64;example.com' }}</p>
          <p>{{ r.personalInfo?.phone || '+91 98765 43210' }}</p>
          <p>{{ r.personalInfo?.location || 'City, Country' }}</p>
          <p *ngIf="r.personalInfo?.linkedin">{{ r.personalInfo.linkedin }}</p>
          <p *ngIf="r.personalInfo?.website">{{ r.personalInfo.website }}</p>
        </div>
      </div>

      <div class="ex-body">
        <div class="ex-section" *ngIf="r.summary">
          <h2 class="ex-heading" [style.color]="accent" [style.border-bottom-color]="sec">Executive Summary</h2>
          <div class="ex-about" [innerHTML]="r.summary"></div>
        </div>

        <div class="ex-section" *ngIf="r.experience?.length">
          <h2 class="ex-heading" [style.color]="accent" [style.border-bottom-color]="sec">Professional Experience</h2>
          <div class="ex-entry" *ngFor="let exp of r.experience">
            <div class="ex-erow">
              <span class="ex-etitle">{{ exp.jobTitle }}</span>
              <span class="ex-edate">{{ exp.startDate }} – {{ exp.endDate || 'Present' }}</span>
            </div>
            <span class="ex-esub" [style.color]="accent">{{ exp.company }}<span *ngIf="exp.location"> · {{ exp.location }}</span></span>
            <div class="ex-edesc" [innerHTML]="exp.description"></div>
          </div>
        </div>

        <div class="ex-section" *ngIf="r.volunteer?.length">
          <h2 class="ex-heading" [style.color]="accent" [style.border-bottom-color]="sec">Volunteer Experience</h2>
          <div class="ex-entry" *ngFor="let vol of r.volunteer">
            <div class="ex-erow">
              <span class="ex-etitle">{{ vol.jobTitle }}</span>
              <span class="ex-edate">{{ vol.startDate }} – {{ vol.endDate || 'Present' }}</span>
            </div>
            <span class="ex-esub" [style.color]="accent">{{ vol.company }}<span *ngIf="vol.location"> · {{ vol.location }}</span></span>
            <div class="ex-edesc" [innerHTML]="vol.description"></div>
          </div>
        </div>

        <div class="ex-section" *ngIf="r.education?.length">
          <h2 class="ex-heading" [style.color]="accent" [style.border-bottom-color]="sec">Education</h2>
          <div class="ex-entry" *ngFor="let edu of r.education">
            <div class="ex-erow">
              <span class="ex-etitle">{{ edu.degree }}<span *ngIf="edu.fieldOfStudy"> — {{ edu.fieldOfStudy }}</span></span>
              <span class="ex-edate">{{ edu.startDate ? edu.startDate + ' – ' : '' }}{{ edu.year || edu.endDate }}</span>
            </div>
            <span class="ex-esub" [style.color]="accent">{{ edu.institution }}</span>
            <p class="ex-edesc" *ngIf="edu.gpa">GPA: {{ edu.gpa }}</p>
          </div>
        </div>

        <div class="ex-two-col">
          <div class="ex-section" *ngIf="r.skills?.length">
            <h2 class="ex-heading" [style.color]="accent" [style.border-bottom-color]="sec">Key Competencies</h2>
            <div class="ex-skills-wrap">
              <div class="ex-skill-chip" *ngFor="let skill of r.skills" [style.color]="accent" [style.background]="sec">{{ skill }}</div>
            </div>
          </div>
          <div class="ex-section" *ngIf="r.certifications?.length">
            <h2 class="ex-heading" [style.color]="accent" [style.border-bottom-color]="sec">Certifications</h2>
            <div class="ex-entry" *ngFor="let c of r.certifications">
              <strong class="ex-cert-name">{{ c.name }}</strong>
              <div class="ex-cert-issuer">{{ c.issuer }}<span *ngIf="c.issueDate"> · {{ c.issueDate }}</span></div>
            </div>
          </div>
        </div>

        <div class="ex-section" *ngIf="r.projects?.length">
          <h2 class="ex-heading" [style.color]="accent" [style.border-bottom-color]="sec">Key Projects</h2>
          <div class="ex-entry" *ngFor="let p of r.projects">
            <div class="ex-erow">
              <span class="ex-etitle">{{ p.name }}</span>
              <span class="ex-edate" *ngIf="p.techStack">{{ p.techStack }}</span>
            </div>
            <div class="ex-edesc" [innerHTML]="p.description"></div>
          </div>
        </div>

        <div class="ex-section" *ngIf="r.languages?.length">
          <h2 class="ex-heading" [style.color]="accent" [style.border-bottom-color]="sec">Languages</h2>
          <div class="ex-lang-wrap">
            <div class="ex-lang-item" *ngFor="let lang of r.languages">
              <span class="ex-lang-name">{{ lang.language }}</span>
              <span class="ex-lang-level" *ngIf="lang.proficiency">{{ lang.proficiency }}</span>
            </div>
          </div>
        </div>

        <div class="ex-section" *ngFor="let cs of r.customSections">
          <h2 class="ex-heading" [style.color]="accent" [style.border-bottom-color]="sec">{{ cs.title }}</h2>
          <div class="ex-about" [innerHTML]="cs.content"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ex-resume { max-width:800px; margin:0 auto; font-size:12.5px; line-height:1.65; color:#1e293b; background:#fff; min-height:100%; }
    .ex-header { color:#fff; padding:24px 28px; display:flex; justify-content:space-between; align-items:center; }
    .ex-name { font-size:1.6rem; font-weight:700; margin:0; color:#fff; }
    .ex-sub { font-size:0.88rem; opacity:0.9; margin:3px 0 0; color:rgba(255,255,255,.9); }
    .ex-contact-block { text-align:right; font-size:0.8rem; opacity:0.9; line-height:1.8; }
    .ex-contact-block p { margin:0; color:rgba(255,255,255,.85); }
    .ex-body { padding:20px 28px; }
    .ex-section { margin-bottom:16px; }
    .ex-heading { font-size:0.68rem; text-transform:uppercase; letter-spacing:2px; margin:0 0 10px; padding-bottom:4px; border-bottom:2px solid; }
    .ex-about { color:#475569; font-size:0.85rem; margin:0; line-height:1.7; }
    .ex-entry { margin-bottom:10px; }
    .ex-erow { display:flex; justify-content:space-between; align-items:baseline; }
    .ex-etitle { font-weight:600; font-size:0.88rem; color:#1e293b; }
    .ex-edate { font-size:0.75rem; color:#64748b; white-space:nowrap; }
    .ex-esub { font-size:0.8rem; display:block; margin:1px 0; }
    .ex-edesc { font-size:0.82rem; color:#475569; margin:3px 0 0; }
    .ex-two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .ex-skills-wrap { display:flex; flex-wrap:wrap; gap:5px; }
    .ex-skill-chip { display:inline-block; padding:2px 9px; border-radius:4px; font-size:0.78rem; }
    .ex-cert-name { font-size:0.85rem; display:block; color:#1e293b; }
    .ex-cert-issuer { font-size:0.78rem; color:#64748b; }
    .ex-lang-wrap { display:flex; flex-wrap:wrap; gap:8px 16px; }
    .ex-lang-item { display:flex; align-items:baseline; gap:6px; }
    .ex-lang-name { font-weight:600; font-size:0.85rem; color:#1e293b; }
    .ex-lang-level { font-size:0.78rem; color:#64748b; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class ExecutiveTemplateComponent implements ITemplateComponent {
  @Input() data!: TemplateComponentData;
  get r() { return this.data?.resumeData || {}; }
  get accent() { return this.data?.customization?.primaryColor || '#0891b2'; }
  get sec() { return this.data?.customization?.secondaryColor || '#e0f2fe'; }
}
