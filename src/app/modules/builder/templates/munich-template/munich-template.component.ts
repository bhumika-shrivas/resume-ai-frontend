import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ITemplateComponent, TemplateComponentData } from '../template-registry';

@Component({
  selector: 'app-munich-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mu-resume" [style.font-family]="data.customization?.fontFamily || 'Inter, sans-serif'">

      <!-- ── HEADER ─────────────────────────────────────────────────── -->
      <div class="mu-header">
        <p class="mu-jobtitle">{{ r.personalInfo?.jobTitle || 'Professional Title' }}</p>
        <h1 class="mu-name">{{ r.personalInfo?.fullName || 'YOUR NAME' }}</h1>
      </div>

      <!-- ── TWO-COLUMN BODY ────────────────────────────────────────── -->
      <div class="mu-body">

        <!-- LEFT SIDEBAR -->
        <div class="mu-sidebar">

          <!-- Contact -->
          <div class="mu-sb-section">
            <h3 class="mu-sb-heading">Contact</h3>
            <div class="mu-sb-divider"></div>
            <div class="mu-contact-list">
              <div class="mu-contact-item" *ngIf="r.personalInfo?.location">
                <span class="mu-ci-icon">📍</span>
                <span>{{ r.personalInfo.location }}</span>
              </div>
              <div class="mu-contact-item" *ngIf="r.personalInfo?.phone">
                <span class="mu-ci-icon">📞</span>
                <span>{{ r.personalInfo.phone }}</span>
              </div>
              <div class="mu-contact-item" *ngIf="r.personalInfo?.email">
                <span class="mu-ci-icon">✉️</span>
                <span>{{ r.personalInfo.email }}</span>
              </div>
              <div class="mu-contact-item" *ngIf="r.personalInfo?.linkedin">
                <span class="mu-ci-icon">in</span>
                <span>{{ r.personalInfo.linkedin }}</span>
              </div>
              <div class="mu-contact-item" *ngIf="r.personalInfo?.website">
                <span class="mu-ci-icon">🌐</span>
                <span>{{ r.personalInfo.website }}</span>
              </div>
            </div>
          </div>

          <!-- Skills -->
          <div class="mu-sb-section" *ngIf="r.skills?.length">
            <h3 class="mu-sb-heading">Skills</h3>
            <div class="mu-sb-divider"></div>
            <ul class="mu-sb-list">
              <li *ngFor="let skill of r.skills">{{ skill }}</li>
            </ul>
          </div>

          <!-- Languages -->
          <div class="mu-sb-section" *ngIf="r.languages?.length">
            <h3 class="mu-sb-heading">Languages</h3>
            <div class="mu-sb-divider"></div>
            <ul class="mu-sb-list">
              <li *ngFor="let lang of r.languages">
                {{ lang.language }}<span *ngIf="lang.proficiency"> | {{ lang.proficiency }}</span>
              </li>
            </ul>
          </div>

          <!-- Certifications -->
          <div class="mu-sb-section" *ngIf="r.certifications?.length">
            <h3 class="mu-sb-heading">Certifications</h3>
            <div class="mu-sb-divider"></div>
            <ul class="mu-sb-list">
              <li *ngFor="let c of r.certifications">
                <strong>{{ c.name }}</strong>
                <div class="mu-sb-sub">{{ c.issuer }}<span *ngIf="c.issueDate"> · {{ c.issueDate }}</span></div>
              </li>
            </ul>
          </div>

        </div>

        <!-- RIGHT MAIN CONTENT -->
        <div class="mu-main">

          <!-- Summary -->
          <div class="mu-section" *ngIf="r.summary">
            <h2 class="mu-heading">Summary</h2>
            <div class="mu-heading-line"></div>
            <div class="mu-text" [innerHTML]="r.summary"></div>
          </div>

          <!-- Work Experience -->
          <div class="mu-section" *ngIf="r.experience?.length">
            <h2 class="mu-heading">Work Experience</h2>
            <div class="mu-heading-line"></div>
            <div class="mu-entry" *ngFor="let exp of r.experience">
              <strong class="mu-role">{{ exp.jobTitle }}</strong>
              <div class="mu-meta">
                <span class="mu-company">{{ exp.company }}</span>
                <span *ngIf="exp.location"> · {{ exp.location }}</span>
                <span> | {{ exp.startDate }} - {{ exp.endDate || 'Present' }}</span>
              </div>
              <div class="mu-desc" [innerHTML]="exp.description"></div>
            </div>
          </div>

          <!-- Volunteer -->
          <div class="mu-section" *ngIf="r.volunteer?.length">
            <h2 class="mu-heading">Volunteer Experience</h2>
            <div class="mu-heading-line"></div>
            <div class="mu-entry" *ngFor="let vol of r.volunteer">
              <strong class="mu-role">{{ vol.jobTitle }}</strong>
              <div class="mu-meta">
                <span class="mu-company">{{ vol.company }}</span>
                <span *ngIf="vol.location"> · {{ vol.location }}</span>
                <span> | {{ vol.startDate }} - {{ vol.endDate || 'Present' }}</span>
              </div>
              <div class="mu-desc" [innerHTML]="vol.description"></div>
            </div>
          </div>

          <!-- Education -->
          <div class="mu-section" *ngIf="r.education?.length">
            <h2 class="mu-heading">Education</h2>
            <div class="mu-heading-line"></div>
            <div class="mu-entry" *ngFor="let edu of r.education">
              <strong class="mu-role">{{ edu.degree }}<span *ngIf="edu.fieldOfStudy"> — {{ edu.fieldOfStudy }}</span></strong>
              <div class="mu-meta">
                <span class="mu-company">{{ edu.institution }}</span>
                <span *ngIf="edu.location"> · {{ edu.location }}</span>
                <span> | {{ edu.startDate ? edu.startDate + ' - ' : '' }}{{ edu.year || edu.endDate }}</span>
              </div>
              <div class="mu-desc" *ngIf="edu.gpa">GPA: {{ edu.gpa }}</div>
              <div class="mu-desc" *ngIf="edu.description" [innerHTML]="edu.description"></div>
            </div>
          </div>

          <!-- Projects -->
          <div class="mu-section" *ngIf="r.projects?.length">
            <h2 class="mu-heading">Projects</h2>
            <div class="mu-heading-line"></div>
            <div class="mu-entry" *ngFor="let p of r.projects">
              <strong class="mu-role">{{ p.name }}</strong>
              <div class="mu-meta" *ngIf="p.techStack">{{ p.techStack }}</div>
              <div class="mu-desc" [innerHTML]="p.description"></div>
            </div>
          </div>

          <!-- Custom Sections -->
          <div class="mu-section" *ngFor="let cs of r.customSections">
            <h2 class="mu-heading">{{ cs.title }}</h2>
            <div class="mu-heading-line"></div>
            <div class="mu-text" [innerHTML]="cs.content"></div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .mu-resume {
      max-width: 800px; margin: 0 auto; padding: 0;
      color: #333; font-size: 12.5px; line-height: 1.55;
      background: #fff; min-height: 100%;
    }

    /* ── Header ── */
    .mu-header { padding: 36px 40px 16px; }
    .mu-jobtitle {
      font-size: 0.72rem; font-weight: 400; letter-spacing: 3px;
      text-transform: uppercase; color: #888; margin: 0 0 6px;
    }
    .mu-name {
      font-size: 2.6rem; font-weight: 400; letter-spacing: -0.5px;
      margin: 0; color: #1a1a1a; line-height: 1.15;
      font-family: 'Georgia', serif;
    }

    /* ── Two-column body ── */
    .mu-body {
      display: flex; gap: 0; padding: 0 40px 30px;
    }

    /* ── Sidebar ── */
    .mu-sidebar {
      width: 200px; flex-shrink: 0; padding-right: 24px;
      border-right: 1px solid #e0e0e0;
    }
    .mu-sb-section { margin-bottom: 20px; }
    .mu-sb-heading {
      font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 2px; color: #333; margin: 0 0 4px;
    }
    .mu-sb-divider {
      height: 1px; background: #ccc; margin-bottom: 10px;
    }
    .mu-contact-list { display: flex; flex-direction: column; gap: 8px; }
    .mu-contact-item {
      display: flex; align-items: flex-start; gap: 8px;
      font-size: 0.78rem; color: #444; line-height: 1.4;
    }
    .mu-ci-icon {
      font-size: 11px; width: 16px; text-align: center; flex-shrink: 0;
      margin-top: 1px; color: #888;
    }
    .mu-sb-list {
      list-style: disc; padding-left: 16px; margin: 0;
    }
    .mu-sb-list li {
      font-size: 0.78rem; color: #444; margin-bottom: 5px; line-height: 1.4;
    }
    .mu-sb-sub { font-size: 0.72rem; color: #888; margin-top: 1px; }

    /* ── Main content ── */
    .mu-main {
      flex: 1; min-width: 0; padding-left: 24px;
    }
    .mu-section { margin-bottom: 18px; }
    .mu-heading {
      font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 2.5px; color: #333; margin: 0;
    }
    .mu-heading-line {
      height: 1px; background: #ccc; margin: 4px 0 10px;
    }

    /* ── Entry blocks ── */
    .mu-entry { margin-bottom: 14px; }
    .mu-role {
      font-size: 0.82rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: #1a1a1a; display: block;
    }
    .mu-meta {
      font-size: 0.78rem; color: #666; margin: 2px 0 4px;
    }
    .mu-company { font-weight: 600; color: #444; }
    .mu-desc {
      font-size: 0.78rem; color: #444; line-height: 1.6; margin: 3px 0 0;
    }
    .mu-desc ul { margin: 3px 0 0; padding-left: 16px; }
    .mu-desc li { margin-bottom: 3px; }
    .mu-text { font-size: 0.8rem; color: #444; line-height: 1.7; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class MunichTemplateComponent implements ITemplateComponent {
  @Input() data!: TemplateComponentData;
  get r() { return this.data?.resumeData || {}; }
  get accent() { return this.data?.customization?.primaryColor || '#555555'; }
}
