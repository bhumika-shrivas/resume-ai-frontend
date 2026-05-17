import { Component, EventEmitter, HostListener, Output, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ResumeService, Notification } from '../../services/resume.service';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  @Output() menuToggle = new EventEmitter<void>();

  isProfileMenuOpen = false;
  isNotificationMenuOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  usage: any = null;

  constructor(
    private readonly router: Router,
    public readonly authService: AuthService,
    private readonly resumeService: ResumeService,
    public readonly themeService: ThemeService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.loadNotifications();
        this.loadUsage();
      }
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadNotifications();
      this.loadUsage();
    }
    // Poll for updates every 30 seconds
    setInterval(() => {
      if (this.authService.isAuthenticated()) {
        this.loadNotifications();
        this.loadUsage();
      }
    }, 30000);
  }

  loadUsage(): void {
    this.authService.getUsage().subscribe({
      next: (u) => this.usage = u,
      error: () => { /* usage service unavailable — silently ignore */ }
    });
  }

  loadNotifications(): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;

    this.resumeService.getNotifications(userId).subscribe({
      next: ns => {
        const list = Array.isArray(ns) ? ns : [];
        this.notifications = list;
        this.unreadCount = list.filter(n => !n.isRead).length;
      },
      error: () => { /* notification service unavailable — silently ignore */ }
    });
  }

  toggleNotificationMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isNotificationMenuOpen = !this.isNotificationMenuOpen;
    this.isProfileMenuOpen = false;
  }

  markAsRead(notification: Notification, event: MouseEvent): void {
    event.stopPropagation();
    if (notification.isRead) return;

    this.resumeService.markNotificationAsRead(notification.notificationId).subscribe(() => {
      notification.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    });
  }

  markAllAsRead(): void {
    this.resumeService.markAllNotificationsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    });
  }

  deleteNotification(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.resumeService.deleteNotification(id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.notificationId !== id);
      this.unreadCount = this.notifications.filter(n => !n.isRead).length;
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'ATS_COMPLETE': return 'ATS';
      case 'EXPORT_READY': return 'DOC';
      case 'AI_DONE': return 'AI';
      case 'JOB_MATCH': return 'JOB';
      case 'PLAN_CHANGE': return 'SUB';
      case 'QUOTA_WARNING': return 'WRN';
      default: return 'MSG';
    }
  }

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  goToProfile(): void {
    this.isProfileMenuOpen = false;
    this.router.navigate(['/app/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.isProfileMenuOpen = false;
    this.router.navigate(['/templates']);
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.isProfileMenuOpen = false;
    this.isNotificationMenuOpen = false;
  }
}
