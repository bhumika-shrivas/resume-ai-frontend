import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ITemplateComponent, TemplateComponentData } from '../template-registry';

@Component({
  selector: 'app-minimal-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mn-resume" [style.font-family]="data.customization?.fontFamily || 'Inter, sans-serif'">
      <div class="mn-accent-bar" [style.background]="accent"></div>
      <div class="mn-header">
        <h1 class="mn-name">{{ r.personalInfo?.fullName || 'Your Name' }}</h1>
        <p class="mn-tagline" [style.color]="accent">{{ r.personalInfo?.jobTitle || 'Professional Title' }}</p>
        <div class="mn-contacts">
          <span>{{ r.personalInfo?.email || 'email&#64;example.com' }}</span>
          <span class="mn-sep">|</span>
          <span>{{ r.personalInfo?.phone || '+91 98765 43210' }}</span>
          <span class="mn-sep">|</span>
          <span>{{ r.personalInfo?.location || 'City, Country' }}</span>
          <ng-container *ngIf="r.personalInfo?.linkedin">
            <span class="mn-sep">|</span>
            <span>{{ r.personalInfo.linkedin }}</span>
          </ng-container>
          <ng-container *ngIf="r.personalInfo?.website">
            <span class="mn-sep">|</span>
            <span>{{ r.personalInfo.website }}</span>
          </ng-container>
        </div>
      </div>

      <div class="mn-body">
        <div class="mn-section" *ngIf="r.summary">
          <h2 class="mn-heading" [style.color]="accent">Professional Summary</h2>
          <div class="mn-text" [innerHTML]="r.summary"></div>
        </div>

        <div class="mn-section" *ngIf="r.experience?.length">
          <h2 class="mn-heading" [style.color]="accent">Work Experience</h2>
          <div class="mn-entry" *ngFor="let exp of r.experience">
            <div class="mn-row">
              <strong class="mn-entry-title">{{ exp.jobTitle }}</strong>
              <em class="mn-entry-date">{{ exp.startDate }} – {{ exp.endDate || 'Present' }}</em>
            </div>
            <div class="mn-sub">{{ exp.company }}<span *ngIf="exp.location"> · {{ exp.location }}</span></div>
            <div class="mn-desc" [innerHTML]="exp.description"></div>
          </div>
        </div>

        <div class="mn-section" *ngIf="r.volunteer?.length">
          <h2 class="mn-heading" [style.color]="accent">Volunteer Experience</h2>
          <div class="mn-entry" *ngFor="let vol of r.volunteer">
            <div class="mn-row">
              <strong class="mn-entry-title">{{ vol.jobTitle }}</strong>
              <em class="mn-entry-date">{{ vol.startDate }} – {{ vol.endDate || 'Present' }}</em>
            </div>
            <div class="mn-sub">{{ vol.company }}<span *ngIf="vol.location"> · {{ vol.location }}</span></div>
            <div class="mn-desc" [innerHTML]="vol.description"></div>
          </div>
        </div>

        <div class="mn-section" *ngIf="r.education?.length">
          <h2 class="mn-heading" [style.color]="accent">Education</h2>
          <div class="mn-entry" *ngFor="let edu of r.education">
            <div class="mn-row">
              <strong class="mn-entry-title">{{ edu.degree }}<span *ngIf="edu.fieldOfStudy"> — {{ edu.fieldOfStudy }}</span></strong>
              <em class="mn-entry-date">{{ edu.startDate ? edu.startDate + ' – ' : '' }}{{ edu.year || edu.endDate }}</em>
            </div>
            <div class="mn-sub">{{ edu.institution }}</div>
            <p class="mn-desc" *ngIf="edu.gpa">GPA: {{ edu.gpa }}</p>
          </div>
        </div>

        <div class="mn-section" *ngIf="r.projects?.length">
          <h2 class="mn-heading" [style.color]="accent">Projects</h2>
          <div class="mn-entry" *ngFor="let p of r.projects">
            <div class="mn-row">
              <strong class="mn-entry-title">{{ p.name }}</strong>
              <em class="mn-entry-date" *ngIf="p.techStack">{{ p.techStack }}</em>
            </div>
            <div class="mn-desc" [innerHTML]="p.description"></div>
          </div>
        </div>

        <div class="mn-section" *ngIf="r.certifications?.length">
          <h2 class="mn-heading" [style.color]="accent">Certifications</h2>
          <div class="mn-entry" *ngFor="let c of r.certifications">
            <div class="mn-row">
              <strong class="mn-entry-title">{{ c.name }}</strong>
              <em class="mn-entry-date" *ngIf="c.issueDate">{{ c.issueDate }}</em>
            </div>
            <div class="mn-sub">{{ c.issuer }}</div>
          </div>
        </div>

        <div class="mn-section" *ngIf="r.languages?.length">
          <h2 class="mn-heading" [style.color]="accent">Languages</h2>
          <div class="mn-lang-wrap">
            <div class="mn-lang-item" *ngFor="let lang of r.languages">
              <span>{{ lang.language }}</span>
              <span class="mn-lang-level" *ngIf="lang.proficiency"> — {{ lang.proficiency }}</span>
            </div>
          </div>
        </div>

        <div class="mn-section" *ngIf="r.skills?.length">
          <h2 class="mn-heading" [style.color]="accent">Core Skills</h2>
          <div class="mn-skills-wrap">
            <span class="mn-skill-tag" *ngFor="let skill of r.skills" [style.color]="accent" [style.border-color]="accent">{{ skill }}</span>
          </div>
        </div>

        <div class="mn-section" *ngFor="let cs of r.customSections">
          <h2 class="mn-heading" [style.color]="accent">{{ cs.title }}</h2>
          <div class="mn-text" [innerHTML]="cs.content"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mn-resume { max-width:800px; margin:0 auto; padding:0; color:#1a1a1a; font-size:13px; line-height:1.65; background:#fff; min-height:100%; }
    .mn-accent-bar { height:5px; }
    .mn-header { text-align:center; padding:24px 36px 14px; }
    .mn-name { font-size:1.9rem; font-weight:700; letter-spacing:-0.5px; margin:0; color:#111; }
    .mn-tagline { font-size:0.92rem; margin:3px 0 8px; font-weight:500; }
    .mn-contacts { font-size:0.8rem; color:#555; display:flex; justify-content:center; gap:6px; flex-wrap:wrap; }
    .mn-sep { color:#d1d5db; }
    .mn-body { padding:4px 36px 36px; }
    .mn-section { margin-bottom:16px; }
    .mn-heading { font-size:0.7rem; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px; padding-bottom:4px; border-bottom:1px solid #e5e7eb; }
    .mn-entry { margin-bottom:10px; }
    .mn-row { display:flex; justify-content:space-between; align-items:baseline; }
    .mn-entry-title { font-size:0.88rem; font-weight:600; color:#1a1a1a; }
    .mn-entry-date { font-size:0.78rem; color:#6b7280; font-style:normal; white-space:nowrap; }
    .mn-sub { font-size:0.8rem; color:#6b7280; margin:1px 0; }
    .mn-desc { color:#374151; font-size:0.83rem; margin:3px 0 0; }
    .mn-skills-wrap { display:flex; flex-wrap:wrap; gap:6px; }
    .mn-skill-tag { border:1px solid; padding:2px 10px; border-radius:999px; font-size:0.78rem; }
    .mn-text { color:#374151; font-size:0.85rem; margin:0; line-height:1.7; }
    .mn-lang-wrap { display:flex; flex-wrap:wrap; gap:6px 18px; }
    .mn-lang-item { font-size:0.85rem; color:#1a1a1a; }
    .mn-lang-level { color:#6b7280; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class MinimalTemplateComponent implements ITemplateComponent {
  @Input() data!: TemplateComponentData;
  get r() { return this.data?.resumeData || {}; }
  get accent() { return this.data?.customization?.primaryColor || '#16a34a'; }
}
