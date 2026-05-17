import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService, ConfirmDialogData } from '../../services/confirm-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-backdrop" *ngIf="visible" (click)="onCancel()">
      <div class="confirm-card" [class.confirm-danger]="data?.type === 'danger'" 
           [class.confirm-warning]="data?.type === 'warning'"
           [class.confirm-info]="data?.type === 'info'"
           (click)="$event.stopPropagation()">
        
        <div class="confirm-icon-wrap">
          <!-- Danger icon -->
          <svg *ngIf="data?.type === 'danger'" class="confirm-icon icon-danger" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <!-- Warning icon -->
          <svg *ngIf="data?.type === 'warning'" class="confirm-icon icon-warning" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <!-- Info icon -->
          <svg *ngIf="data?.type === 'info'" class="confirm-icon icon-info" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>

        <h3 class="confirm-title">{{ data?.title }}</h3>
        <p class="confirm-message">{{ data?.message }}</p>
        
        <div class="confirm-actions">
          <button *ngIf="data?.cancelText" class="confirm-btn confirm-btn-cancel" (click)="onCancel()">
            {{ data?.cancelText }}
          </button>
          <button class="confirm-btn confirm-btn-primary" [class.btn-danger]="data?.type === 'danger'"
                  [class.btn-warning]="data?.type === 'warning'" [class.btn-info]="data?.type === 'info'"
                  (click)="onConfirm()">
            {{ data?.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(6px);
      z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
      animation: confirmFadeIn 0.18s ease;
    }

    .confirm-card {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
      width: 100%; max-width: 400px;
      padding: 32px 28px 24px;
      text-align: center;
      animation: confirmSlideUp 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .confirm-icon-wrap {
      display: flex; justify-content: center; margin-bottom: 16px;
    }
    .confirm-icon { opacity: 0.9; }
    .icon-danger { color: #f87171; }
    .icon-warning { color: #fbbf24; }
    .icon-info { color: #60a5fa; }

    .confirm-title {
      margin: 0 0 8px; font-size: 1.1rem; font-weight: 700; color: #f1f5f9;
    }
    .confirm-message {
      margin: 0 0 24px; font-size: 0.9rem; color: #94a3b8; line-height: 1.55;
    }

    .confirm-actions {
      display: flex; gap: 10px; justify-content: center;
    }

    .confirm-btn {
      padding: 10px 22px; border: none; border-radius: 10px;
      font-size: 0.88rem; font-weight: 600; cursor: pointer;
      transition: all 0.15s ease; min-width: 100px;
    }

    .confirm-btn-cancel {
      background: rgba(255,255,255,0.06); color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .confirm-btn-cancel:hover {
      background: rgba(255,255,255,0.1); color: #e2e8f0;
    }

    .confirm-btn-primary.btn-danger {
      background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff;
    }
    .confirm-btn-primary.btn-danger:hover {
      background: linear-gradient(135deg, #b91c1c, #dc2626);
      box-shadow: 0 4px 14px rgba(220,38,38,0.35);
    }

    .confirm-btn-primary.btn-warning {
      background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff;
    }
    .confirm-btn-primary.btn-warning:hover {
      background: linear-gradient(135deg, #b45309, #d97706);
    }

    .confirm-btn-primary.btn-info {
      background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff;
    }
    .confirm-btn-primary.btn-info:hover {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      box-shadow: 0 4px 14px rgba(99,102,241,0.35);
    }

    @keyframes confirmFadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes confirmSlideUp {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  visible = false;
  data: ConfirmDialogData | null = null;
  private resolveRef: ((result: boolean) => void) | null = null;
  private sub!: Subscription;

  constructor(private confirmService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.sub = this.confirmService.dialog$.subscribe(({ data, resolve }) => {
      this.data = data;
      this.resolveRef = resolve;
      this.visible = true;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onConfirm(): void {
    this.visible = false;
    this.resolveRef?.(true);
    this.resolveRef = null;
  }

  onCancel(): void {
    this.visible = false;
    this.resolveRef?.(false);
    this.resolveRef = null;
  }
}
