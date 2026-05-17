import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ITemplateComponent, TemplateComponentData } from '../template-registry';

@Component({
  selector: 'app-creative-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cr-resume" [style.font-family]="data.customization?.fontFamily || 'Inter, sans-serif'">
      <div class="cr-sidebar" [style.background]="'linear-gradient(160deg, ' + accent + ', ' + sec + ')'">
        <div class="cr-avatar-wrap">
          <div class="cr-avatar">{{ getInitials(r.personalInfo?.fullName) }}</div>
        </div>
        <div class="cr-name-block">
          <h1 class="cr-name">{{ r.personalInfo?.fullName || 'Your Name' }}</h1>
          <p class="cr-role">{{ r.personalInfo?.jobTitle || 'Professional Title' }}</p>
        </div>

        <div class="cr-side-section">
          <h3 class="cr-side-heading">Contact</h3>
          <p class="cr-side-item">{{ r.personalInfo?.email || 'email&#64;example.com' }}</p>
          <p class="cr-side-item">{{ r.personalInfo?.phone || '+91 98765 43210' }}</p>
          <p class="cr-side-item">{{ r.personalInfo?.location || 'City, Country' }}</p>
          <p class="cr-side-item" *ngIf="r.personalInfo?.linkedin">{{ r.personalInfo.linkedin }}</p>
          <p class="cr-side-item" *ngIf="r.personalInfo?.website">{{ r.personalInfo.website }}</p>
        </div>

        <div class="cr-side-section" *ngIf="r.skills?.length">
          <h3 class="cr-side-heading">Skills</h3>
          <div class="cr-skill" *ngFor="let skill of r.skills">
            <span class="cr-skill-name">{{ skill }}</span>
          </div>
        </div>

        <div class="cr-side-section" *ngIf="r.certifications?.length">
          <h3 class="cr-side-heading">Certifications</h3>
          <div class="cr-cert" *ngFor="let c of r.certifications">
            <div class="cr-cert-name">{{ c.name }}</div>
            <div class="cr-cert-issuer">{{ c.issuer }}<span *ngIf="c.issueDate"> · {{ c.issueDate }}</span></div>
          </div>
        </div>

        <div class="cr-side-section" *ngIf="r.languages?.length">
          <h3 class="cr-side-heading">Languages</h3>
          <div class="cr-lang" *ngFor="let lang of r.languages">
            <span class="cr-lang-name">{{ lang.language }}</span>
            <span class="cr-lang-level" *ngIf="lang.proficiency"> — {{ lang.proficiency }}</span>
          </div>
        </div>
      </div>

      <div class="cr-main">
        <div class="cr-section" *ngIf="r.summary">
          <h2 class="cr-heading" [style.color]="accent">
            <span class="cr-dot" [style.background]="accent"></span>About Me
          </h2>
          <div class="cr-about" [innerHTML]="r.summary"></div>
        </div>

        <div class="cr-section" *ngIf="r.experience?.length">
          <h2 class="cr-heading" [style.color]="accent">
            <span class="cr-dot" [style.background]="accent"></span>Experience
          </h2>
          <div class="cr-card" *ngFor="let exp of r.experience" [style.border-left-color]="accent">
            <div class="cr-card-head">
              <span class="cr-ctitle">{{ exp.jobTitle }}</span>
              <span class="cr-cbadge" [style.background]="accent">{{ exp.startDate }} – {{ exp.endDate || 'Present' }}</span>
            </div>
            <p class="cr-csub" [style.color]="accent">{{ exp.company }}<span *ngIf="exp.location"> · {{ exp.location }}</span></p>
            <div class="cr-cdesc" [innerHTML]="exp.description"></div>
          </div>
        </div>

        <div class="cr-section" *ngIf="r.volunteer?.length">
          <h2 class="cr-heading" [style.color]="accent">
            <span class="cr-dot" [style.background]="accent"></span>Volunteer Experience
          </h2>
          <div class="cr-card" *ngFor="let vol of r.volunteer" [style.border-left-color]="accent">
            <div class="cr-card-head">
              <span class="cr-ctitle">{{ vol.jobTitle }}</span>
              <span class="cr-cbadge" [style.background]="accent">{{ vol.startDate }} – {{ vol.endDate || 'Present' }}</span>
            </div>
            <p class="cr-csub" [style.color]="accent">{{ vol.company }}<span *ngIf="vol.location"> · {{ vol.location }}</span></p>
            <div class="cr-cdesc" [innerHTML]="vol.description"></div>
          </div>
        </div>

        <div class="cr-section" *ngIf="r.education?.length">
          <h2 class="cr-heading" [style.color]="accent">
            <span class="cr-dot" [style.background]="accent"></span>Education
          </h2>
          <div class="cr-card" *ngFor="let edu of r.education" [style.border-left-color]="accent">
            <div class="cr-card-head">
              <span class="cr-ctitle">{{ edu.degree }}<span *ngIf="edu.fieldOfStudy"> — {{ edu.fieldOfStudy }}</span></span>
              <span class="cr-cbadge" [style.background]="accent">{{ edu.startDate ? edu.startDate + ' – ' : '' }}{{ edu.year || edu.endDate }}</span>
            </div>
            <p class="cr-csub" [style.color]="accent">{{ edu.institution }}</p>
            <p class="cr-cdesc" *ngIf="edu.gpa">GPA: {{ edu.gpa }}</p>
          </div>
        </div>

        <div class="cr-section" *ngIf="r.projects?.length">
          <h2 class="cr-heading" [style.color]="accent">
            <span class="cr-dot" [style.background]="accent"></span>Projects
          </h2>
          <div class="cr-card" *ngFor="let p of r.projects" [style.border-left-color]="accent">
            <div class="cr-card-head">
              <span class="cr-ctitle">{{ p.name }}</span>
              <span class="cr-cbadge" [style.background]="accent" *ngIf="p.techStack">{{ p.techStack }}</span>
            </div>
            <div class="cr-cdesc" [innerHTML]="p.description"></div>
          </div>
        </div>

        <div class="cr-section" *ngFor="let cs of r.customSections">
          <h2 class="cr-heading" [style.color]="accent">
            <span class="cr-dot" [style.background]="accent"></span>{{ cs.title }}
          </h2>
          <div class="cr-about" [innerHTML]="cs.content"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cr-resume { display:flex; min-height:100%; font-size:12.5px; line-height:1.6; background:#fff; }
    .cr-sidebar { width:30%; color:#fff; padding:28px 16px; display:flex; flex-direction:column; gap:18px; flex-shrink:0; }
    .cr-avatar-wrap { display:flex; justify-content:center; }
    .cr-avatar { width:72px; height:72px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:1.6rem; font-weight:700; border:3px solid rgba(255,255,255,0.4); color:#fff; }
    .cr-name-block { text-align:center; }
    .cr-name { font-size:1.15rem; font-weight:700; margin:6px 0 0; color:#fff; }
    .cr-role { font-size:0.8rem; opacity:0.85; margin:2px 0 0; color:rgba(255,255,255,.85); }
    .cr-side-section { }
    .cr-side-heading { font-size:0.62rem; text-transform:uppercase; letter-spacing:2px; margin:0 0 6px; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.2); color:rgba(255,255,255,0.7); }
    .cr-side-item { font-size:0.78rem; margin:0 0 3px; color:rgba(255,255,255,0.85); word-break:break-all; }
    .cr-skill { margin-bottom:4px; }
    .cr-skill-name { font-size:0.8rem; color:rgba(255,255,255,0.9); }
    .cr-cert { margin-bottom:5px; }
    .cr-cert-name { font-size:0.8rem; font-weight:600; color:#fff; }
    .cr-cert-issuer { font-size:0.72rem; color:rgba(255,255,255,0.7); }
    .cr-lang { margin-bottom:3px; }
    .cr-lang-name { font-size:0.8rem; color:rgba(255,255,255,0.9); font-weight:500; }
    .cr-lang-level { font-size:0.72rem; color:rgba(255,255,255,0.7); }
    .cr-main { width:70%; padding:24px; }
    .cr-heading { font-size:0.68rem; text-transform:uppercase; letter-spacing:2px; margin:0 0 12px; display:flex; align-items:center; gap:8px; }
    .cr-dot { width:8px; height:8px; border-radius:50%; display:inline-block; flex-shrink:0; }
    .cr-section { margin-bottom:18px; }
    .cr-about { color:#475569; font-size:0.85rem; line-height:1.7; margin:0; }
    .cr-card { background:#f8f7ff; border-left:3px solid; padding:8px 12px; border-radius:0 6px 6px 0; margin-bottom:8px; }
    .cr-card-head { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; }
    .cr-ctitle { font-weight:600; font-size:0.88rem; color:#1e1b4b; }
    .cr-cbadge { color:#fff; font-size:0.68rem; padding:1px 7px; border-radius:999px; white-space:nowrap; }
    .cr-csub { font-size:0.78rem; margin:2px 0 0; }
    .cr-cdesc { font-size:0.82rem; color:#475569; margin:3px 0 0; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class CreativeTemplateComponent implements ITemplateComponent {
  @Input() data!: TemplateComponentData;
  get r() { return this.data?.resumeData || {}; }
  get accent() { return this.data?.customization?.primaryColor || '#7c3aed'; }
  get sec() { return this.data?.customization?.secondaryColor || '#4f46e5'; }

  getInitials(name?: string): string {
    if (!name) return 'YN';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
