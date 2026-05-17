import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResumeService, Resume } from '../../services/resume.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class DashboardHomeComponent implements OnInit {
  isLoading = true;

  resumeCount = 0;
  jobMatchCount = 0;
  aiCallsUsed = 0;
  aiCallsLimit = 5;
  rawAiCalls = 0;
  rawAtsChecks = 0;
  showAiModal = false;

  recentResumes: Resume[] = [];
  userName = 'there';

  isPremium = false;

  constructor(
    private resumeService: ResumeService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      this.userName = user.email.split('@')[0];
    }
    this.isPremium = this.authService.isPremium();

    // Force a fresh fetch from the server every time the dashboard loads to prevent stale N/A scores
    this.resumeService.invalidateListCache();

    const resumes$ = this.resumeService.getResumes().pipe(catchError(() => of([])));
    const matches$ = user
      ? this.resumeService.getMatchesByUser(user.id).pipe(catchError(() => of([])))
      : of([]);
    const usage$ = this.authService.getUsage().pipe(catchError(() => of(null)));

    forkJoin({ resumes: resumes$, matches: matches$, usage: usage$ }).subscribe(({ resumes, matches, usage }) => {
      this.resumeCount = resumes.length;
      this.recentResumes = resumes.slice(0, 3);

      this.jobMatchCount = (matches as any[]).length;

      if (usage) {
        this.rawAiCalls = usage.aiCallsThisMonth ?? 0;
        this.rawAtsChecks = usage.atsChecksThisMonth ?? 0;
        this.aiCallsUsed = this.rawAiCalls + this.rawAtsChecks;
        this.aiCallsLimit = this.isPremium ? 999 : 5;
      }

      this.isLoading = false;
      this.cdr.detectChanges(); // Force UI update
    });
  }

  getAtsClass(score: number | null): string {
    if (!score) return 'ats-na';
    if (score >= 80) return 'ats-high';
    if (score >= 60) return 'ats-mid';
    return 'ats-low';
  }

  getStatusClass(status?: string): string {
    return status === 'COMPLETE' ? 'status-complete' : 'status-draft';
  }

  async deleteResume(id: number | undefined): Promise<void> {
    if (!id) return;
    const confirmed = await this.confirmDialog.confirm(
      'This resume will be permanently deleted. This action cannot be undone.',
      'Delete Resume',
      { confirmText: 'Delete', type: 'danger' }
    );
    if (!confirmed) return;
    this.resumeService.deleteResume(id).subscribe(() => {
      this.recentResumes = this.recentResumes.filter(r => r.id !== id);
      this.resumeCount--;
    });
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  get aiQuotaPercent(): number {
    if (this.isPremium) return 0;
    return Math.min(100, (this.aiCallsUsed / this.aiCallsLimit) * 100);
  }
}
