import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ITemplateComponent, TemplateComponentData } from '../template-registry';

@Component({
  selector: 'app-entry-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="et-resume" [style.font-family]="data.customization?.fontFamily || 'Inter, sans-serif'">

      <!-- ── HEADER ─────────────────────────────────────────────────── -->
      <div class="et-header">
        <div class="et-name-block">
          <h1 class="et-name">{{ r.personalInfo?.fullName || 'YOUR NAME' }}</h1>
          <p class="et-job-title" [style.color]="accent">{{ r.personalInfo?.jobTitle || 'Professional Title' }}</p>
        </div>
        <div class="et-contact-col">
          <div class="et-contact-item" *ngIf="r.personalInfo?.phone">
            <span class="et-contact-text">{{ r.personalInfo.phone }}</span>
            <span class="et-icon" [style.border-color]="accent">📞</span>
          </div>
          <div class="et-contact-item" *ngIf="r.personalInfo?.email">
            <span class="et-contact-text">{{ r.personalInfo.email }}</span>
            <span class="et-icon" [style.border-color]="accent">✉</span>
          </div>
          <div class="et-contact-item" *ngIf="r.personalInfo?.linkedin">
            <span class="et-contact-text">{{ r.personalInfo.linkedin }}</span>
            <span class="et-icon" [style.border-color]="accent">in</span>
          </div>
          <div class="et-contact-item" *ngIf="r.personalInfo?.location">
            <span class="et-contact-text">{{ r.personalInfo.location }}</span>
            <span class="et-icon" [style.border-color]="accent">📍</span>
          </div>
          <div class="et-contact-item" *ngIf="r.personalInfo?.website">
            <span class="et-contact-text">{{ r.personalInfo.website }}</span>
            <span class="et-icon" [style.border-color]="accent">🌐</span>
          </div>
        </div>
      </div>

      <!-- ── CAREER OBJECTIVE / SUMMARY ─────────────────────────────── -->
      <div class="et-section" *ngIf="r.summary">
        <div class="et-section-divider" [style.border-color]="accent"></div>
        <h2 class="et-heading">Career Objective</h2>
        <div class="et-text" [innerHTML]="r.summary"></div>
      </div>

      <!-- ── EDUCATION ──────────────────────────────────────────────── -->
      <div class="et-section" *ngIf="r.education?.length">
        <div class="et-section-divider" [style.border-color]="accent"></div>
        <h2 class="et-heading">Education</h2>
        <div class="et-entry" *ngFor="let edu of r.education">
          <strong class="et-entry-title">{{ edu.degree }}<span *ngIf="edu.fieldOfStudy"> in {{ edu.fieldOfStudy }}</span></strong>
          <div class="et-entry-meta">
            {{ edu.startDate ? edu.startDate + ' / ' : '' }}{{ edu.institution }}<span *ngIf="edu.location"> / {{ edu.location }}</span>
          </div>
          <ul class="et-list" *ngIf="edu.gpa">
            <li>GPA: {{ edu.gpa }}</li>
          </ul>
          <div class="et-desc" *ngIf="edu.description" [innerHTML]="edu.description"></div>
        </div>
      </div>

      <!-- ── WORK EXPERIENCE ────────────────────────────────────────── -->
      <div class="et-section" *ngIf="r.experience?.length">
        <div class="et-section-divider" [style.border-color]="accent"></div>
        <h2 class="et-heading">Work Experience</h2>
        <div class="et-entry" *ngFor="let exp of r.experience">
          <strong class="et-entry-title">{{ exp.jobTitle }}<span *ngIf="exp.company"> / {{ exp.company }}</span></strong>
          <div class="et-entry-meta">
            {{ exp.startDate }} – {{ exp.endDate || 'Present' }}<span *ngIf="exp.location"> / {{ exp.location }}</span>
          </div>
          <div class="et-desc" [innerHTML]="exp.description"></div>
        </div>
      </div>

      <!-- ── VOLUNTEER EXPERIENCE ───────────────────────────────────── -->
      <div class="et-section" *ngIf="r.volunteer?.length">
        <div class="et-section-divider" [style.border-color]="accent"></div>
        <h2 class="et-heading">Volunteer Experience</h2>
        <div class="et-entry" *ngFor="let vol of r.volunteer">
          <strong class="et-entry-title">{{ vol.jobTitle }}<span *ngIf="vol.company"> / {{ vol.company }}</span></strong>
          <div class="et-entry-meta">
            {{ vol.startDate }} – {{ vol.endDate || 'Present' }}<span *ngIf="vol.location"> / {{ vol.location }}</span>
          </div>
          <div class="et-desc" [innerHTML]="vol.description"></div>
        </div>
      </div>

      <!-- ── KEY SKILLS ─────────────────────────────────────────────── -->
      <div class="et-section" *ngIf="r.skills?.length">
        <div class="et-section-divider" [style.border-color]="accent"></div>
        <h2 class="et-heading">Key Skills</h2>
        <div class="et-skills-wrap">
          <span class="et-skill" *ngFor="let skill of r.skills">{{ skill }}</span>
        </div>
      </div>

      <!-- ── PROJECTS ───────────────────────────────────────────────── -->
      <div class="et-section" *ngIf="r.projects?.length">
        <div class="et-section-divider" [style.border-color]="accent"></div>
        <h2 class="et-heading">Projects</h2>
        <div class="et-entry" *ngFor="let p of r.projects">
          <div class="et-row">
            <strong class="et-entry-title">{{ p.name }}</strong>
            <em class="et-tech" *ngIf="p.techStack">{{ p.techStack }}</em>
          </div>
          <div class="et-desc" [innerHTML]="p.description"></div>
        </div>
      </div>

      <!-- ── CERTIFICATIONS ─────────────────────────────────────────── -->
      <div class="et-section" *ngIf="r.certifications?.length">
        <div class="et-section-divider" [style.border-color]="accent"></div>
        <h2 class="et-heading">Certifications</h2>
        <div class="et-entry" *ngFor="let c of r.certifications">
          <strong class="et-entry-title">{{ c.name }}</strong>
          <div class="et-entry-meta">{{ c.issuer }}<span *ngIf="c.issueDate"> · {{ c.issueDate }}</span></div>
        </div>
      </div>

      <!-- ── LANGUAGES ──────────────────────────────────────────────── -->
      <div class="et-section" *ngIf="r.languages?.length">
        <div class="et-section-divider" [style.border-color]="accent"></div>
        <h2 class="et-heading">Languages</h2>
        <div class="et-lang-wrap">
          <span class="et-lang" *ngFor="let lang of r.languages">
            {{ lang.language }}<span class="et-lang-level" *ngIf="lang.proficiency"> — {{ lang.proficiency }}</span>
          </span>
        </div>
      </div>

      <!-- ── CUSTOM SECTIONS ────────────────────────────────────────── -->
      <div class="et-section" *ngFor="let cs of r.customSections">
        <div class="et-section-divider" [style.border-color]="accent"></div>
        <h2 class="et-heading">{{ cs.title }}</h2>
        <div class="et-text" [innerHTML]="cs.content"></div>
      </div>

    </div>
  `,
  styles: [`
    /* ── Resume Container ── */
    .et-resume {
      max-width: 800px; margin: 0 auto; padding: 0;
      color: #2d2d2d; font-size: 13px; line-height: 1.6;
      background: #fff; min-height: 100%;
    }

    /* ── Header ── */
    .et-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 36px 40px 20px;
    }
    .et-name-block { flex: 1; }
    .et-name {
      font-size: 2rem; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; margin: 0; color: #1a1a1a;
    }
    .et-job-title {
      font-size: 0.85rem; font-weight: 500; letter-spacing: 1.5px;
      text-transform: uppercase; margin: 4px 0 0; color: #666;
    }
    .et-contact-col {
      display: flex; flex-direction: column; gap: 5px;
      align-items: flex-end; padding-top: 4px;
    }
    .et-contact-item {
      display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: #444;
    }
    .et-contact-text { text-align: right; }
    .et-icon {
      width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #999;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; color: #555; flex-shrink: 0;
    }

    /* ── Section Divider ── */
    .et-section { padding: 0 40px; }
    .et-section-divider {
      border: none; border-top: 1px solid #d0d0d0; margin: 16px 0 12px;
    }

    /* ── Section Heading ── */
    .et-heading {
      font-size: 0.82rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 2px; color: #333; margin: 0 0 10px;
    }

    /* ── Entries ── */
    .et-entry { margin-bottom: 12px; }
    .et-entry-title {
      font-size: 0.85rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: #1a1a1a;
    }
    .et-entry-meta {
      font-size: 0.78rem; color: #666; margin: 2px 0 4px;
    }
    .et-row {
      display: flex; justify-content: space-between; align-items: baseline;
    }
    .et-tech { font-size: 0.78rem; color: #888; font-style: normal; }

    /* ── Description & Lists ── */
    .et-desc {
      font-size: 0.82rem; color: #444; margin: 4px 0 0;
      line-height: 1.65;
    }
    .et-desc ul, .et-list {
      margin: 4px 0 0 0; padding-left: 18px;
    }
    .et-desc li, .et-list li {
      margin-bottom: 2px; font-size: 0.82rem; color: #444;
    }
    .et-text { font-size: 0.82rem; color: #444; line-height: 1.7; }

    /* ── Skills ── */
    .et-skills-wrap {
      display: flex; flex-wrap: wrap; gap: 8px;
    }
    .et-skill {
      font-size: 0.78rem; color: #333;
      padding: 3px 14px; border: 1px solid #ccc;
      border-radius: 3px; background: #fafafa;
    }

    /* ── Languages ── */
    .et-lang-wrap { display: flex; flex-wrap: wrap; gap: 6px 24px; }
    .et-lang { font-size: 0.82rem; color: #333; }
    .et-lang-level { color: #888; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class EntryTemplateComponent implements ITemplateComponent {
  @Input() data!: TemplateComponentData;
  get r() { return this.data?.resumeData || {}; }
  get accent() { return this.data?.customization?.primaryColor || '#555555'; }
}
