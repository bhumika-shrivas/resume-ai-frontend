import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ITemplateComponent, TemplateComponentData } from '../template-registry';

@Component({
  selector: 'app-classic-two-col-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ct-resume" [style.font-family]="data.customization?.fontFamily || 'Georgia, serif'">

      <!-- ── HEADER ─────────────────────────────────────────────────── -->
      <div class="ct-header">
        <h1 class="ct-name">{{ r.personalInfo?.fullName || 'YOUR NAME' }}</h1>
        <p class="ct-title" [style.color]="accent">{{ r.personalInfo?.jobTitle || 'Professional Title' }}</p>
        <div class="ct-contact">
          <span *ngIf="r.personalInfo?.phone">{{ r.personalInfo.phone }}</span>
          <span *ngIf="r.personalInfo?.email"> – {{ r.personalInfo.email }}</span>
          <span *ngIf="r.personalInfo?.website"> – {{ r.personalInfo.website }}</span>
          <span *ngIf="r.personalInfo?.linkedin"> – {{ r.personalInfo.linkedin }}</span>
          <span *ngIf="r.personalInfo?.location"><br/>{{ r.personalInfo.location }}</span>
        </div>
      </div>

      <!-- ── SUMMARY ────────────────────────────────────────────────── -->
      <div class="ct-summary" *ngIf="r.summary">
        <div class="ct-summary-text" [innerHTML]="r.summary"></div>
      </div>

      <div class="ct-body">

        <!-- ── EXPERIENCE ───────────────────────────────────────────── -->
        <div class="ct-section" *ngIf="r.experience?.length">
          <div class="ct-section-label" [style.color]="accent">Experience</div>
          <div class="ct-section-content">
            <div class="ct-entry" *ngFor="let exp of r.experience">
              <div class="ct-entry-head">
                <span><strong [style.color]="accent">{{ exp.jobTitle }}</strong>: {{ exp.company }}<span *ngIf="exp.location"> ({{ exp.location }})</span>, </span>
                <span>{{ exp.startDate }} – {{ exp.endDate || 'present' }}</span>
              </div>
              <div class="ct-desc" [innerHTML]="exp.description"></div>
            </div>
          </div>
        </div>

        <!-- ── VOLUNTEER ────────────────────────────────────────────── -->
        <div class="ct-section" *ngIf="r.volunteer?.length">
          <div class="ct-section-label" [style.color]="accent">Volunteer</div>
          <div class="ct-section-content">
            <div class="ct-entry" *ngFor="let vol of r.volunteer">
              <div class="ct-entry-head">
                <span><strong [style.color]="accent">{{ vol.jobTitle }}</strong>: {{ vol.company }}<span *ngIf="vol.location"> ({{ vol.location }})</span>, </span>
                <span>{{ vol.startDate }} – {{ vol.endDate || 'present' }}</span>
              </div>
              <div class="ct-desc" [innerHTML]="vol.description"></div>
            </div>
          </div>
        </div>

        <!-- ── EDUCATION ────────────────────────────────────────────── -->
        <div class="ct-section" *ngIf="r.education?.length">
          <div class="ct-section-label" [style.color]="accent">Education</div>
          <div class="ct-section-content">
            <div class="ct-entry" *ngFor="let edu of r.education">
              <div class="ct-entry-head">
                <span><strong [style.color]="accent">{{ edu.degree }}<span *ngIf="edu.fieldOfStudy"> of {{ edu.fieldOfStudy }}</span></strong>: {{ edu.institution }}<span *ngIf="edu.location"> ({{ edu.location }})</span>, </span>
                <span>{{ edu.startDate ? edu.startDate + ' – ' : '' }}{{ edu.year || edu.endDate }}</span>
              </div>
              <div class="ct-desc" *ngIf="edu.gpa">GPA: {{ edu.gpa }}</div>
              <div class="ct-desc" *ngIf="edu.description" [innerHTML]="edu.description"></div>
            </div>
          </div>
        </div>

        <!-- ── SKILLS ───────────────────────────────────────────────── -->
        <div class="ct-section" *ngIf="r.skills?.length">
          <div class="ct-section-label" [style.color]="accent">Skills</div>
          <div class="ct-section-content">
            <div class="ct-skills-line">
              <span *ngFor="let skill of r.skills; let last = last">{{ skill }}<span *ngIf="!last"> · </span></span>
            </div>
          </div>
        </div>

        <!-- ── PROJECTS ─────────────────────────────────────────────── -->
        <div class="ct-section" *ngIf="r.projects?.length">
          <div class="ct-section-label" [style.color]="accent">Projects</div>
          <div class="ct-section-content">
            <div class="ct-entry" *ngFor="let p of r.projects">
              <div class="ct-entry-head">
                <span><strong [style.color]="accent">{{ p.name }}</strong><span *ngIf="p.techStack">: {{ p.techStack }}</span></span>
              </div>
              <div class="ct-desc" [innerHTML]="p.description"></div>
            </div>
          </div>
        </div>

        <!-- ── CERTIFICATIONS ───────────────────────────────────────── -->
        <div class="ct-section" *ngIf="r.certifications?.length">
          <div class="ct-section-label" [style.color]="accent">Certifications</div>
          <div class="ct-section-content">
            <div class="ct-entry" *ngFor="let c of r.certifications">
              <div class="ct-entry-head">
                <span><strong [style.color]="accent">{{ c.name }}</strong> – {{ c.issuer }}</span>
                <span *ngIf="c.issueDate">{{ c.issueDate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── LANGUAGES ────────────────────────────────────────────── -->
        <div class="ct-section" *ngIf="r.languages?.length">
          <div class="ct-section-label" [style.color]="accent">Languages</div>
          <div class="ct-section-content">
            <div class="ct-skills-line">
              <span *ngFor="let lang of r.languages; let last = last">
                {{ lang.language }}<span *ngIf="lang.proficiency"> ({{ lang.proficiency }})</span><span *ngIf="!last">, </span>
              </span>
            </div>
          </div>
        </div>

        <!-- ── CUSTOM SECTIONS ──────────────────────────────────────── -->
        <div class="ct-section" *ngFor="let cs of r.customSections">
          <div class="ct-section-label" [style.color]="accent">{{ cs.title }}</div>
          <div class="ct-section-content">
            <div class="ct-desc" [innerHTML]="cs.content"></div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .ct-resume {
      max-width: 800px; margin: 0 auto; padding: 0;
      color: #2d2d2d; font-size: 12.5px; line-height: 1.55;
      background: #fff; min-height: 100%;
    }

    /* ── Header ── */
    .ct-header { padding: 32px 40px 10px; }
    .ct-name {
      font-size: 2rem; font-weight: 400; letter-spacing: 1px;
      text-transform: uppercase; margin: 0; color: #1a1a1a;
    }
    .ct-title {
      font-size: 0.95rem; font-weight: 400; margin: 2px 0 0;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .ct-contact {
      font-size: 0.75rem; color: #555; margin: 6px 0 0;
      line-height: 1.5;
    }

    /* ── Summary (no two-col) ── */
    .ct-summary {
      padding: 10px 40px 0;
      font-size: 0.82rem; color: #333; font-style: italic; line-height: 1.7;
    }

    /* ── Body two-col rows ── */
    .ct-body { padding: 8px 40px 30px; }

    .ct-section {
      display: flex; gap: 0;
      border-top: 1px solid #bbb; padding: 14px 0 4px;
    }
    .ct-section-label {
      width: 110px; flex-shrink: 0; font-size: 0.72rem;
      font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
      padding-top: 2px;
    }
    .ct-section-content { flex: 1; min-width: 0; }

    /* ── Entries ── */
    .ct-entry { margin-bottom: 12px; }
    .ct-entry-head { font-size: 0.82rem; line-height: 1.5; }
    .ct-entry-head strong { font-weight: 700; }
    .ct-desc { font-size: 0.8rem; color: #444; line-height: 1.65; margin: 3px 0 0; }
    .ct-desc ul { margin: 3px 0 0; padding-left: 18px; }
    .ct-desc li { margin-bottom: 2px; }

    /* ── Skills line ── */
    .ct-skills-line { font-size: 0.82rem; color: #333; line-height: 1.7; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class ClassicTwoColTemplateComponent implements ITemplateComponent {
  @Input() data!: TemplateComponentData;
  get r() { return this.data?.resumeData || {}; }
  get accent() { return this.data?.customization?.primaryColor || '#c06014'; }
}
