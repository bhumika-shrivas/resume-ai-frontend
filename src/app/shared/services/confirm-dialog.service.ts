import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialogSubject = new Subject<{ data: ConfirmDialogData; resolve: (result: boolean) => void }>();
  dialog$ = this.dialogSubject.asObservable();

  /**
   * Show a confirm dialog (replaces browser confirm()).
   * Returns a Promise that resolves to true (confirmed) or false (cancelled).
   */
  confirm(message: string, title = 'Confirm', options?: Partial<ConfirmDialogData>): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.dialogSubject.next({
        data: {
          title,
          message,
          confirmText: options?.confirmText || 'Yes, Proceed',
          cancelText: options?.cancelText || 'Cancel',
          type: options?.type || 'danger',
        },
        resolve,
      });
    });
  }

  /**
   * Show an alert dialog (replaces browser alert()).
   * Returns a Promise that resolves when the user clicks OK.
   */
  alert(message: string, title = 'Notice'): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.dialogSubject.next({
        data: {
          title,
          message,
          confirmText: 'OK',
          cancelText: '',
          type: 'info',
        },
        resolve,
      });
    });
  }
}
