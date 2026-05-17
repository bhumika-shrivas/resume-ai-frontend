import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  
  getToasts(): Observable<ToastMessage> {
    return this.toastSubject.asObservable();
  }
  
  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 4000): void {
    this.toastSubject.next({ message, type, duration });
  }
  
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }
  
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }
  
  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
  
  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }
}
