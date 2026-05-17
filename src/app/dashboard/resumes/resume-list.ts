import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResumeService, Resume } from '../../services/resume.service';
import { ToastService } from '../../shared/services/toast';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-list.html',
  styleUrl: './resume-list.css'
})
export class ResumeListComponent implements OnInit {
  resumes: Resume[] = [];
  isLoading = true;
  errorMessage = '';
  actionInProgress: number | null = null;

  constructor(
    private resumeService: ResumeService,
    private router: Router,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadResumes();
  }

  loadResumes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.resumeService.getResumes().subscribe({
      next: (res) => {
        this.resumes = res.sort((a, b) =>
          new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
        );
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load resumes. Please refresh the page.';
        this.isLoading = false;
      }
    });
  }

  createNew(): void {
    this.router.navigate(['/app/resumes/new']);
  }

  editResume(id: number): void {
    this.router.navigate(['/app/resumes/edit', id]);
  }

  async deleteResume(id: number, title: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      `"${title}" will be permanently deleted. This action cannot be undone.`,
      'Delete Resume',
      { confirmText: 'Delete', type: 'danger' }
    );
    if (!confirmed) return;
    this.actionInProgress = id;
    this.resumeService.deleteResume(id).subscribe({
      next: () => {
        this.resumes = this.resumes.filter(r => r.id !== id);
        this.actionInProgress = null;
      },
      error: () => {
        this.actionInProgress = null;
        this.toastService.error('Failed to delete resume. Please try again.');
      }
    });
  }

  duplicateResume(id: number): void {
    this.actionInProgress = id;
    this.resumeService.duplicateResume(id).subscribe({
      next: (copy) => {
        this.actionInProgress = null;
        this.router.navigate(['/app/resumes/edit', copy.id]);
      },
      error: () => {
        this.actionInProgress = null;
        this.toastService.error('Failed to duplicate resume. Please try again.');
      }
    });
  }


  getAtsClass(score: number | undefined): string {
    if (!score || score === 0) return 'ats-none';
    if (score >= 80) return 'ats-high';
    if (score >= 50) return 'ats-mid';
    return 'ats-low';
  }

  getStatusClass(status: string | undefined): string {
    return status === 'COMPLETE' ? 'status-complete' : 'status-draft';
  }

  isActing(id: number | undefined): boolean {
    return this.actionInProgress === id;
  }
}
