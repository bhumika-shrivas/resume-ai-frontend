import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ITemplateComponent, TemplateComponentData } from '../template-registry';

@Component({
  selector: 'app-modern-template',
  standalone: true,
  imports: [CommonModule],
  host: {
    style: 'display: flex; flex-direction: column; flex: 1; min-height: 100%;'
  },
  template: `
    <div class="mt-resume" [style.font-family]="data.customization?.fontFamily || 'Inter, sans-serif'">
      <div class="mt-left" [style.background-color]="data.customization?.secondaryColor || '#1e293b'">
        <div class="mt-header">
          <h1 class="mt-name">{{ r.personalInfo?.fullName || 'Your Name' }}</h1>
          <p class="mt-jobtitle" [style.color]="accent">{{ r.personalInfo?.jobTitle || 'Professional Title' }}</p>
        </div>

        <div class="mt-side-section">
          <h3 class="mt-side-heading">Contact</h3>
          <div class="mt-contact-item">{{ r.personalInfo?.email || 'email&#64;example.com' }}</div>
          <div class="mt-contact-item">{{ r.personalInfo?.phone || '+91 98765 43210' }}</div>
          <div class="mt-contact-item">{{ r.personalInfo?.location || 'City, Country' }}</div>
          <div class="mt-contact-item" *ngIf="r.personalInfo?.linkedin">{{ r.personalInfo.linkedin }}</div>
          <div class="mt-contact-item" *ngIf="r.personalInfo?.website">{{ r.personalInfo.website }}</div>
        </div>

        <div class="mt-side-section" *ngIf="r.skills?.length">
          <h3 class="mt-side-heading">Skills</h3>
          <div class="mt-skill-pill" *ngFor="let skill of r.skills">{{ skill }}</div>
        </div>

        <div class="mt-side-section" *ngIf="r.certifications?.length">
          <h3 class="mt-side-heading">Certifications</h3>
          <div class="mt-cert" *ngFor="let c of r.certifications">
            <div class="mt-cert-name">{{ c.name }}</div>
            <div class="mt-cert-issuer">{{ c.issuer }}<span *ngIf="c.issueDate"> · {{ c.issueDate }}</span></div>
          </div>
        </div>

        <div class="mt-side-section" *ngIf="r.languages?.length">
          <h3 class="mt-side-heading">Languages</h3>
          <div class="mt-lang" *ngFor="let lang of r.languages">
            <span class="mt-lang-name">{{ lang.language }}</span>
            <span class="mt-lang-level" *ngIf="lang.proficiency"> — {{ lang.proficiency }}</span>
          </div>
        </div>
      </div>

      <div class="mt-right">
        <div class="mt-section" *ngIf="r.summary">
          <h2 class="mt-heading" [style.color]="accent" [style.border-bottom-color]="accent">Summary</h2>
          <div class="mt-summary-text" [innerHTML]="r.summary"></div>
        </div>

        <div class="mt-section" *ngIf="r.experience?.length">
          <h2 class="mt-heading" [style.color]="accent" [style.border-bottom-color]="accent">Experience</h2>
          <div class="mt-entry" *ngFor="let exp of r.experience">
            <div class="mt-entry-header">
              <span class="mt-entry-title">{{ exp.jobTitle }}</span>
              <span class="mt-entry-date">{{ exp.startDate }} – {{ exp.endDate || 'Present' }}</span>
            </div>
            <span class="mt-entry-sub" [style.color]="accent">{{ exp.company }}<span *ngIf="exp.location"> · {{ exp.location }}</span></span>
            <div class="mt-entry-body" [innerHTML]="exp.description"></div>
          </div>
        </div>

        <div class="mt-section" *ngIf="r.volunteer?.length">
          <h2 class="mt-heading" [style.color]="accent" [style.border-bottom-color]="accent">Volunteer Experience</h2>
          <div class="mt-entry" *ngFor="let vol of r.volunteer">
            <div class="mt-entry-header">
              <span class="mt-entry-title">{{ vol.jobTitle }}</span>
              <span class="mt-entry-date">{{ vol.startDate }} – {{ vol.endDate || 'Present' }}</span>
            </div>
            <span class="mt-entry-sub" [style.color]="accent">{{ vol.company }}<span *ngIf="vol.location"> · {{ vol.location }}</span></span>
            <div class="mt-entry-body" [innerHTML]="vol.description"></div>
          </div>
        </div>

        <div class="mt-section" *ngIf="r.education?.length">
          <h2 class="mt-heading" [style.color]="accent" [style.border-bottom-color]="accent">Education</h2>
          <div class="mt-entry" *ngFor="let edu of r.education">
            <div class="mt-entry-header">
              <span class="mt-entry-title">{{ edu.degree }}<span *ngIf="edu.fieldOfStudy"> — {{ edu.fieldOfStudy }}</span></span>
              <span class="mt-entry-date">{{ edu.startDate ? edu.startDate + ' – ' : '' }}{{ edu.year || edu.endDate }}</span>
            </div>
            <span class="mt-entry-sub" [style.color]="accent">{{ edu.institution }}</span>
            <p class="mt-entry-body" *ngIf="edu.gpa">GPA: {{ edu.gpa }}</p>
          </div>
        </div>

        <div class="mt-section" *ngIf="r.projects?.length">
          <h2 class="mt-heading" [style.color]="accent" [style.border-bottom-color]="accent">Projects</h2>
          <div class="mt-entry" *ngFor="let p of r.projects">
            <div class="mt-entry-header">
              <span class="mt-entry-title">{{ p.name }}</span>
              <span class="mt-entry-date" *ngIf="p.techStack">{{ p.techStack }}</span>
            </div>
            <div class="mt-entry-body" [innerHTML]="p.description"></div>
          </div>
        </div>

        <div class="mt-section" *ngFor="let cs of r.customSections">
          <h2 class="mt-heading" [style.color]="accent" [style.border-bottom-color]="accent">{{ cs.title }}</h2>
          <div class="mt-summary-text" [innerHTML]="cs.content"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mt-resume { display:flex; flex: 1; min-height:100%; font-size:12.5px; line-height:1.6; color:#1e293b; background:#fff; }
    .mt-left { width:33%; color:#e2e8f0; padding:28px 18px; flex-shrink:0; }
    .mt-right { width:67%; padding:28px 24px; }
    .mt-name { font-size:1.5rem; font-weight:700; color:#fff; margin:0; line-height:1.2; }
    .mt-jobtitle { font-weight:500; margin:4px 0 0; font-size:0.9rem; }
    .mt-header { margin-bottom:20px; }
    .mt-side-section { margin-bottom:18px; }
    .mt-side-heading { color:#94a3b8; font-size:0.65rem; text-transform:uppercase; letter-spacing:1.5px; border-bottom:1px solid #334155; padding-bottom:5px; margin:0 0 8px; }
    .mt-contact-item { font-size:0.78rem; color:#94a3b8; margin-bottom:3px; word-break:break-all; }
    .mt-skill-pill { background:#334155; border-radius:4px; padding:3px 9px; font-size:0.78rem; display:inline-block; margin:0 4px 4px 0; color:#e2e8f0; }
    .mt-cert { margin-bottom:6px; }
    .mt-cert-name { font-size:0.82rem; font-weight:600; color:#e2e8f0; }
    .mt-cert-issuer { font-size:0.75rem; color:#94a3b8; }
    .mt-lang { margin-bottom:3px; font-size:0.8rem; }
    .mt-lang-name { color:#e2e8f0; font-weight:500; }
    .mt-lang-level { color:#94a3b8; }
    .mt-section { margin-bottom:18px; }
    .mt-heading { font-size:0.68rem; text-transform:uppercase; letter-spacing:1.5px; border-bottom:2px solid; padding-bottom:4px; margin:0 0 10px; }
    .mt-summary-text { color:#64748b; line-height:1.7; margin:0; font-size:0.85rem; }
    .mt-entry { margin-bottom:12px; }
    .mt-entry-header { display:flex; justify-content:space-between; align-items:baseline; }
    .mt-entry-title { font-weight:600; font-size:0.88rem; }
    .mt-entry-date { font-size:0.75rem; color:#64748b; white-space:nowrap; }
    .mt-entry-sub { font-size:0.8rem; font-style:italic; display:block; margin:1px 0; }
    .mt-entry-body { margin-top:3px; color:#64748b; font-size:0.82rem; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class ModernTemplateComponent implements ITemplateComponent {
  @Input() data!: TemplateComponentData;
  get r() { return this.data?.resumeData || {}; }
  get accent() { return this.data?.customization?.primaryColor || '#2563eb'; }
}
