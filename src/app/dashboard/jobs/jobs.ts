import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ResumeService, Resume } from '../../services/resume.service';
import { JobMatchService, JobMatch, LiveJob, AiRequest } from '../../services/job-match.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/services/toast';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

type ViewTab = 'search' | 'bookmarks' | 'history';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css'
})
export class JobsComponent implements OnInit {
  activeTab: ViewTab = 'search';

  // Search
  searchQuery = '';
  searchLocation = '';
  isSearching = false;
  linkedinJobs: LiveJob[] = [];
  hasSearched = false;



  // Bookmarks — real saved jobs
  bookmarks: JobMatch[] = [];
  isLoadingBookmarks = false;
  savingJobKey: string | null = null;

  // AI History
  aiHistory: AiRequest[] = [];
  isLoadingHistory = false;
  historyFilter = '';

  constructor(
    private readonly resumeService: ResumeService,
    private readonly jobMatchService: JobMatchService,
    private readonly toastService: ToastService,
    public readonly authService: AuthService,
    private readonly confirmDialog: ConfirmDialogService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadBookmarks();
  }

  setTab(tab: ViewTab): void {
    this.activeTab = tab;
    if (tab === 'bookmarks') this.loadBookmarks();
    if (tab === 'history' && !this.aiHistory.length) this.loadAiHistory();
  }

  // ── Data loaders ──────────────────────────────────────────────────────────

  loadBookmarks(): void {
    this.isLoadingBookmarks = true;
    this.jobMatchService.getBookmarks().subscribe({
      next: bm => { this.bookmarks = bm; this.isLoadingBookmarks = false; },
      error: () => { this.isLoadingBookmarks = false; }
    });
  }

  loadAiHistory(): void {
    this.isLoadingHistory = true;
    this.jobMatchService.getAiHistory().subscribe({
      next: h => { this.aiHistory = h; this.isLoadingHistory = false; },
      error: () => { this.isLoadingHistory = false; }
    });
  }



  // ── Job Search ────────────────────────────────────────────────────────────

  searchJobs(): void {
    if (!this.authService.isPremium()) {
      this.confirmDialog.confirm(
        'Job matching is a Premium feature. Upgrade to Premium to unlock unlimited live job matching and AI recommendations.',
        'Premium Feature',
        { confirmText: 'Upgrade Now', cancelText: 'Maybe Later', type: 'info' }
      ).then(confirmed => {
        if (confirmed) {
          this.router.navigate(['/app/subscription']);
        }
      });
      return;
    }

    if (!this.searchQuery.trim()) {
      this.toastService.error('Please enter a job title or role to search.');
      return;
    }
    this.isSearching = true;
    this.hasSearched = true;
    this.linkedinJobs = [];

    this.jobMatchService.fetchLinkedIn(this.searchQuery, this.searchLocation).subscribe({
      next: res => {
        this.linkedinJobs = res;
        this.isSearching = false;
        this.toastService.success(`Found ${this.linkedinJobs.length} listings for "${this.searchQuery}"`);
      },
      error: err => {
        this.isSearching = false;
        this.toastService.error('Failed to search jobs. Please try again later.');
        console.error(err);
      }
    });
  }

  // ── Save Job to Bookmarks (direct — no AI) ─────────────────────────────────

  saveJob(job: LiveJob): void {
    const key = `${job.title}-${job.company}`;
    if (this.savingJobKey === key) return;

    // Prevent duplicate bookmarks in same session
    if (this.bookmarks.some(b => b.jobTitle === job.title && b.companyName === job.company)) {
      this.toastService.error('Already saved to bookmarks!');
      return;
    }

    this.savingJobKey = key;
    this.jobMatchService.saveJobDirectly(job).subscribe({
      next: saved => {
        this.savingJobKey = null;
        this.bookmarks.unshift(saved);
        this.toastService.success(`"${job.title}" saved to Bookmarks!`);
        this.cdr.markForCheck();
      },
      error: () => {
        this.savingJobKey = null;
        this.toastService.error('Could not save job. Please try again.');
      }
    });
  }

  isSaving(job: LiveJob): boolean {
    return this.savingJobKey === `${job.title}-${job.company}`;
  }

  isAlreadySaved(job: LiveJob): boolean {
    return this.bookmarks.some(b => b.jobTitle === job.title && b.companyName === job.company);
  }

  // ── Remove Bookmark ────────────────────────────────────────────────────────

  async removeBookmark(bookmark: JobMatch): Promise<void> {
    if (!bookmark.matchId) return;
    const confirmed = await this.confirmDialog.confirm(
      `Remove "${bookmark.jobTitle}" from bookmarks?`,
      'Remove Bookmark',
      { confirmText: 'Remove', type: 'danger' }
    );
    if (!confirmed) return;
    this.jobMatchService.deleteMatch(bookmark.matchId).subscribe(() => {
      this.bookmarks = this.bookmarks.filter(b => b.matchId !== bookmark.matchId);
      this.toastService.success('Bookmark removed.');
    });
  }

  // ── AI History Helpers ────────────────────────────────────────────────────

  get filteredHistory(): AiRequest[] {
    if (!this.historyFilter.trim()) return this.aiHistory;
    const f = this.historyFilter.toLowerCase();
    return this.aiHistory.filter(h =>
      (h.requestType || '').toLowerCase().includes(f) ||
      (h.status || '').toLowerCase().includes(f) ||
      (h.model || '').toLowerCase().includes(f)
    );
  }

  getHistoryIcon(type: string): string {
    const icons: Record<string, string> = {
      SUMMARY: '✍️', BULLETS: '📝', COVER_LETTER: '📄',
      IMPROVE: '✨', ATS: '🎯', SKILLS: '🔧', TAILOR: '🪡', TRANSLATE: '🌐'
    };
    return icons[type] || '🤖';
  }

  getHistoryLabel(type: string): string {
    const labels: Record<string, string> = {
      SUMMARY: 'Summary Generation', BULLETS: 'Bullet Points',
      COVER_LETTER: 'Cover Letter', IMPROVE: 'Section Improve',
      ATS: 'ATS Check', SKILLS: 'Skill Suggestions',
      TAILOR: 'Job Tailoring', TRANSLATE: 'Translation'
    };
    return labels[type] || type;
  }

  get bookmarkCount(): number {
    return this.bookmarks.length;
  }
}
