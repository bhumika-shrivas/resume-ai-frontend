import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ITemplateComponent, TemplateComponentData } from '../template-registry';

@Component({
  selector: 'app-ats-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="at-resume" [style.font-family]="data.customization?.fontFamily || 'Georgia, serif'">
      <div class="at-header">
        <h1 class="at-name">{{ r.personalInfo?.fullName || 'Your Name' }}</h1>
        <p class="at-title" [style.color]="accent">{{ r.personalInfo?.jobTitle || 'Professional Title' }}</p>
        <div class="at-contact-row">
          <span>{{ r.personalInfo?.email || 'email&#64;example.com' }}</span>
          <span class="at-sep">•</span>
          <span>{{ r.personalInfo?.phone || '+91 98765 43210' }}</span>
          <span class="at-sep">•</span>
          <span>{{ r.personalInfo?.location || 'City, Country' }}</span>
          <ng-container *ngIf="r.personalInfo?.linkedin">
            <span class="at-sep">•</span>
            <span>{{ r.personalInfo.linkedin }}</span>
          </ng-container>
        </div>
        <hr class="at-divider" [style.border-top-color]="accent">
      </div>

      <div class="at-body">
        <section *ngIf="r.summary" class="at-section">
          <h2 class="at-heading" [style.color]="accent">Professional Summary</h2>
          <div class="at-para" [innerHTML]="r.summary"></div>
        </section>

        <section *ngIf="r.experience?.length" class="at-section">
          <h2 class="at-heading" [style.color]="accent">Work Experience</h2>
          <div class="at-entry" *ngFor="let exp of r.experience">
            <div class="at-row">
              <span class="at-entry-title">{{ exp.jobTitle }}</span>
              <span class="at-entry-date">{{ exp.startDate }} – {{ exp.endDate || 'Present' }}</span>
            </div>
            <em class="at-inst" [style.color]="accent">{{ exp.company }}<span *ngIf="exp.location"> · {{ exp.location }}</span></em>
            <div class="at-desc" [innerHTML]="exp.description"></div>
          </div>
        </section>

        <section *ngIf="r.volunteer?.length" class="at-section">
          <h2 class="at-heading" [style.color]="accent">Volunteer Experience</h2>
          <div class="at-entry" *ngFor="let vol of r.volunteer">
            <div class="at-row">
              <span class="at-entry-title">{{ vol.jobTitle }}</span>
              <span class="at-entry-date">{{ vol.startDate }} – {{ vol.endDate || 'Present' }}</span>
            </div>
            <em class="at-inst" [style.color]="accent">{{ vol.company }}<span *ngIf="vol.location"> · {{ vol.location }}</span></em>
            <div class="at-desc" [innerHTML]="vol.description"></div>
          </div>
        </section>

        <section *ngIf="r.education?.length" class="at-section">
          <h2 class="at-heading" [style.color]="accent">Education</h2>
          <div class="at-entry" *ngFor="let edu of r.education">
            <div class="at-row">
              <span class="at-entry-title">{{ edu.degree }}<span *ngIf="edu.fieldOfStudy"> — {{ edu.fieldOfStudy }}</span></span>
              <span class="at-entry-date">{{ edu.startDate ? edu.startDate + ' – ' : '' }}{{ edu.year || edu.endDate }}</span>
            </div>
            <em class="at-inst" [style.color]="accent">{{ edu.institution }}</em>
            <p class="at-desc" *ngIf="edu.gpa">GPA: {{ edu.gpa }}</p>
          </div>
        </section>

        <section *ngIf="r.projects?.length" class="at-section">
          <h2 class="at-heading" [style.color]="accent">Projects</h2>
          <div class="at-entry" *ngFor="let p of r.projects">
            <div class="at-row">
              <span class="at-entry-title">{{ p.name }}</span>
              <span class="at-entry-date" *ngIf="p.techStack">{{ p.techStack }}</span>
            </div>
            <div class="at-desc" [innerHTML]="p.description"></div>
          </div>
        </section>

        <section *ngIf="r.certifications?.length" class="at-section">
          <h2 class="at-heading" [style.color]="accent">Certifications</h2>
          <div class="at-entry" *ngFor="let c of r.certifications">
            <div class="at-row">
              <span class="at-entry-title">{{ c.name }}</span>
              <span class="at-entry-date" *ngIf="c.issueDate">{{ c.issueDate }}</span>
            </div>
            <em class="at-inst" [style.color]="accent">{{ c.issuer }}</em>
          </div>
        </section>

        <section *ngIf="r.languages?.length" class="at-section">
          <h2 class="at-heading" [style.color]="accent">Languages</h2>
          <div class="at-lang-wrap">
            <div class="at-lang-item" *ngFor="let lang of r.languages">
              <span class="at-lang-name">{{ lang.language }}</span>
              <span class="at-lang-level" *ngIf="lang.proficiency"> — {{ lang.proficiency }}</span>
            </div>
          </div>
        </section>

        <section *ngIf="r.skills?.length" class="at-section">
          <h2 class="at-heading" [style.color]="accent">Technical Skills</h2>
          <div class="at-skills-row">
            <span class="at-skill" *ngFor="let skill of r.skills" [style.border-color]="accent" [style.color]="accent">{{ skill }}</span>
          </div>
        </section>

        <section *ngFor="let cs of r.customSections" class="at-section">
          <h2 class="at-heading" [style.color]="accent">{{ cs.title }}</h2>
          <div class="at-para" [innerHTML]="cs.content"></div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .at-resume { max-width:780px; margin:0 auto; padding:36px 32px; font-size:13px; line-height:1.7; color:#1c1c1c; background:#fff; min-height:100%; }
    .at-header { text-align:center; margin-bottom:16px; }
    .at-name { font-size:1.7rem; font-weight:700; letter-spacing:0.5px; color:#111; margin:0; }
    .at-title { font-size:0.92rem; margin:3px 0 8px; font-style:italic; }
    .at-contact-row { display:flex; justify-content:center; gap:6px; font-size:0.8rem; color:#555; flex-wrap:wrap; }
    .at-sep { color:#d1d5db; }
    .at-divider { margin:14px 0; border:none; border-top:2px solid; }
    .at-section { margin-bottom:16px; }
    .at-heading { font-size:0.82rem; font-variant:small-caps; letter-spacing:1px; border-bottom:1px solid #e5e7eb; padding-bottom:4px; margin:0 0 8px; }
    .at-para { color:#374151; font-size:0.85rem; margin:0; line-height:1.7; }
    .at-entry { margin-bottom:10px; }
    .at-row { display:flex; justify-content:space-between; align-items:baseline; }
    .at-entry-title { font-weight:700; font-size:0.88rem; color:#1c1c1c; }
    .at-entry-date { font-size:0.78rem; color:#6b7280; white-space:nowrap; }
    .at-inst { font-size:0.83rem; font-style:italic; display:block; }
    .at-desc { font-size:0.83rem; color:#374151; margin:3px 0 0; }
    .at-skills-row { display:flex; flex-wrap:wrap; gap:6px; }
    .at-skill { border:1px solid; padding:2px 9px; border-radius:3px; font-size:0.78rem; }
    .at-lang-wrap { display:flex; flex-wrap:wrap; gap:6px 18px; }
    .at-lang-item { font-size:0.85rem; }
    .at-lang-name { font-weight:600; }
    .at-lang-level { color:#6b7280; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class AtsTemplateComponent implements ITemplateComponent {
  @Input() data!: TemplateComponentData;
  get r() { return this.data?.resumeData || {}; }
  get accent() { return this.data?.customization?.primaryColor || '#7f1d1d'; }
}
