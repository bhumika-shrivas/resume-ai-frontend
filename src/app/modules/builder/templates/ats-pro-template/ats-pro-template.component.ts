import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ITemplateComponent, TemplateComponentData } from '../template-registry';

@Component({
  selector: 'app-ats-pro-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ap-resume" [style.font-family]="data.customization?.fontFamily || 'Georgia, serif'">

      <!-- ── HEADER ─────────────────────────────────────────────────── -->
      <div class="ap-header" [style.background]="accent">
        <h1 class="ap-name">{{ r.personalInfo?.fullName || 'YOUR NAME' }}</h1>
        <p class="ap-title">{{ r.personalInfo?.jobTitle || 'Professional Title' }}</p>
      </div>
      <div class="ap-contact-bar" [style.background]="accentLight">
        <span *ngIf="r.personalInfo?.location">{{ r.personalInfo.location }}</span>
        <span *ngIf="r.personalInfo?.phone"> &bull; {{ r.personalInfo.phone }}</span>
        <span *ngIf="r.personalInfo?.email"> &bull; {{ r.personalInfo.email }}</span>
        <span *ngIf="r.personalInfo?.linkedin"> &bull; {{ r.personalInfo.linkedin }}</span>
        <span *ngIf="r.personalInfo?.website"> &bull; {{ r.personalInfo.website }}</span>
      </div>

      <div class="ap-body">

        <!-- ── SUMMARY ───────────────────────────────────────────── -->
        <div class="ap-section" *ngIf="r.summary">
          <div class="ap-summary" [innerHTML]="r.summary"></div>
        </div>

        <!-- ── KEY SKILLS ────────────────────────────────────────── -->
        <div class="ap-section" *ngIf="r.skills?.length">
          <h2 class="ap-heading" [style.color]="accent" [style.border-color]="accent">Key Skills</h2>
          <div class="ap-skills-center">
            <span *ngFor="let skill of r.skills; let last = last">
              {{ skill }}<span *ngIf="!last" class="ap-pipe"> | </span>
            </span>
          </div>
        </div>

        <!-- ── PROFESSIONAL EXPERIENCE ───────────────────────────── -->
        <div class="ap-section" *ngIf="r.experience?.length">
          <h2 class="ap-heading" [style.color]="accent" [style.border-color]="accent">Professional Experience</h2>
          <div class="ap-entry" *ngFor="let exp of r.experience">
            <div class="ap-company-row">
              <span class="ap-company">{{ exp.company }}<span *ngIf="exp.location"> &bull; {{ exp.location }}</span></span>
            </div>
            <div class="ap-role-row">
              <strong class="ap-role" [style.color]="accent">{{ exp.jobTitle }}</strong>
              <span class="ap-dates" [style.color]="accent">{{ exp.startDate }} – {{ exp.endDate || 'Present' }}</span>
            </div>
            <div class="ap-desc" [innerHTML]="exp.description"></div>
          </div>
        </div>

        <!-- ── VOLUNTEER EXPERIENCE ──────────────────────────────── -->
        <div class="ap-section" *ngIf="r.volunteer?.length">
          <h2 class="ap-heading" [style.color]="accent" [style.border-color]="accent">Volunteer Experience</h2>
          <div class="ap-entry" *ngFor="let vol of r.volunteer">
            <div class="ap-company-row">
              <span class="ap-company">{{ vol.company }}<span *ngIf="vol.location"> &bull; {{ vol.location }}</span></span>
            </div>
            <div class="ap-role-row">
              <strong class="ap-role" [style.color]="accent">{{ vol.jobTitle }}</strong>
              <span class="ap-dates" [style.color]="accent">{{ vol.startDate }} – {{ vol.endDate || 'Present' }}</span>
            </div>
            <div class="ap-desc" [innerHTML]="vol.description"></div>
          </div>
        </div>

        <!-- ── CERTIFICATIONS ────────────────────────────────────── -->
        <div class="ap-section" *ngIf="r.certifications?.length">
          <h2 class="ap-heading" [style.color]="accent" [style.border-color]="accent">Professional Certifications</h2>
          <div class="ap-cert" *ngFor="let c of r.certifications">
            <div class="ap-cert-row">
              <span>{{ c.issuer }} &bull; <strong>{{ c.name }}</strong></span>
              <span class="ap-dates" *ngIf="c.issueDate">{{ c.issueDate }}</span>
            </div>
          </div>
        </div>

        <!-- ── PROJECTS ──────────────────────────────────────────── -->
        <div class="ap-section" *ngIf="r.projects?.length">
          <h2 class="ap-heading" [style.color]="accent" [style.border-color]="accent">Projects</h2>
          <div class="ap-entry" *ngFor="let p of r.projects">
            <div class="ap-role-row">
              <strong class="ap-role" [style.color]="accent">{{ p.name }}</strong>
              <span class="ap-dates" *ngIf="p.techStack">{{ p.techStack }}</span>
            </div>
            <div class="ap-desc" [innerHTML]="p.description"></div>
          </div>
        </div>

        <!-- ── EDUCATION ─────────────────────────────────────────── -->
        <div class="ap-section" *ngIf="r.education?.length">
          <h2 class="ap-heading" [style.color]="accent" [style.border-color]="accent">Education</h2>
          <div class="ap-edu" *ngFor="let edu of r.education">
            <div class="ap-edu-row">
              <span>{{ edu.degree }}<span *ngIf="edu.fieldOfStudy">, {{ edu.fieldOfStudy }}</span>, {{ edu.institution }}<span *ngIf="edu.location"> &bull; {{ edu.location }}</span></span>
              <span class="ap-dates">{{ edu.startDate ? edu.startDate + ' – ' : '' }}{{ edu.year || edu.endDate }}</span>
            </div>
            <div class="ap-gpa" *ngIf="edu.gpa">GPA: {{ edu.gpa }}</div>
          </div>
        </div>

        <!-- ── LANGUAGES ─────────────────────────────────────────── -->
        <div class="ap-section" *ngIf="r.languages?.length">
          <h2 class="ap-heading" [style.color]="accent" [style.border-color]="accent">Languages</h2>
          <p class="ap-lang-line">
            <span *ngFor="let lang of r.languages; let last = last">
              {{ lang.language }}<span *ngIf="lang.proficiency"> ({{ lang.proficiency }})</span><span *ngIf="!last">, </span>
            </span>
          </p>
        </div>

        <!-- ── CUSTOM SECTIONS ───────────────────────────────────── -->
        <div class="ap-section" *ngFor="let cs of r.customSections">
          <h2 class="ap-heading" [style.color]="accent" [style.border-color]="accent">{{ cs.title }}</h2>
          <div class="ap-desc" [innerHTML]="cs.content"></div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .ap-resume {
      max-width: 800px; margin: 0 auto; padding: 0;
      color: #1a1a1a; font-size: 12.5px; line-height: 1.55;
      background: #fff; min-height: 100%;
    }

    /* ── Header ── */
    .ap-header {
      text-align: center; padding: 28px 40px 14px; color: #fff;
    }
    .ap-name {
      font-size: 1.8rem; font-weight: 700; letter-spacing: 3px;
      text-transform: uppercase; margin: 0; color: #fff;
    }
    .ap-title {
      font-size: 0.88rem; font-weight: 400; margin: 4px 0 0;
      color: rgba(255,255,255,0.9); letter-spacing: 1px;
    }
    .ap-contact-bar {
      text-align: center; padding: 6px 40px; font-size: 0.75rem;
      color: #1a1a1a; letter-spacing: 0.3px;
    }

    /* ── Body ── */
    .ap-body { padding: 12px 40px 30px; }

    /* ── Section Heading ── */
    .ap-section { margin-bottom: 14px; }
    .ap-heading {
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 2.5px; margin: 0 0 8px; padding-bottom: 4px;
      border-bottom: 2px solid;
    }

    /* ── Summary ── */
    .ap-summary { font-size: 0.82rem; color: #333; line-height: 1.7; }

    /* ── Skills (centered, pipe-separated) ── */
    .ap-skills-center {
      text-align: center; font-size: 0.82rem; color: #333; line-height: 1.8;
    }
    .ap-pipe { color: #999; margin: 0 2px; }

    /* ── Experience Entries ── */
    .ap-entry { margin-bottom: 14px; }
    .ap-company-row { margin-bottom: 1px; }
    .ap-company { font-size: 0.85rem; font-weight: 700; color: #1a1a1a; }
    .ap-role-row {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 3px;
    }
    .ap-role { font-size: 0.82rem; font-weight: 700; }
    .ap-dates { font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
    .ap-desc { font-size: 0.8rem; color: #333; line-height: 1.6; margin: 2px 0 0; }
    .ap-desc ul { margin: 4px 0 0; padding-left: 18px; }
    .ap-desc li { margin-bottom: 3px; }

    /* ── Certifications ── */
    .ap-cert { margin-bottom: 6px; }
    .ap-cert-row {
      display: flex; justify-content: space-between; align-items: baseline;
      font-size: 0.82rem; border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
    }

    /* ── Education ── */
    .ap-edu { margin-bottom: 4px; }
    .ap-edu-row {
      display: flex; justify-content: space-between; align-items: baseline;
      font-size: 0.82rem;
    }
    .ap-gpa { font-size: 0.78rem; color: #666; margin-top: 1px; }

    /* ── Languages ── */
    .ap-lang-line { font-size: 0.82rem; color: #333; margin: 0; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class AtsProTemplateComponent implements ITemplateComponent {
  @Input() data!: TemplateComponentData;
  get r() { return this.data?.resumeData || {}; }
  get accent() { return this.data?.customization?.primaryColor || '#1b3a5c'; }
  get accentLight() { return this.data?.customization?.secondaryColor || '#c5a55a'; }
}
