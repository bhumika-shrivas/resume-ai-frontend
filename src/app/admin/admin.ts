import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ResumeService, Template } from '../services/resume.service';
import { ConfirmDialogService } from '../shared/services/confirm-dialog.service';

type AdminTab = 'users' | 'templates' | 'analytics' | 'ai' | 'broadcast' | 'audit';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminDashboardComponent implements OnInit {
  activeTab: AdminTab = 'analytics';
  users: any[] = [];
  templates: Template[] = [];
  stats: any = {
    totalUsers: 0,
    premiumUsers: 0,
    totalResumes: 0,
    aiUsage: 0
  };

  isLoading = false;

  // Analytics Data
  growthData: { month: string, count: number, percent: number }[] = [];

  // New Feature States
  aiStats: any = null;
  auditLogs: any[] = [];
  pricingConfigs: any[] = [];
  platformHealth: any = {
    dbLatencyMs: 0,
    storageUsagePct: 0,
    aiQueueTimeSec: 0
  };
  broadcastForm = {
    targetAudience: 'ALL', // 'ALL', 'PREMIUM', 'FREE'
    title: '',
    message: ''
  };

  // Live Editor State
  showEditor = false;
  editingTemplate: Template | null = null;
  editorForm: Partial<Template> = {};

  constructor(
    public readonly authService: AuthService,
    private readonly resumeService: ResumeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly confirmDialog: ConfirmDialogService
  ) {}

  navigateTo(path: string): void {
    this.router.navigate(['/admin', path]);
  }

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      const path = segments.length > 0 ? segments[0].path : 'overview';
      if (path === 'overview' || path === 'analytics') this.setTab('analytics');
      else if (path === 'users') this.setTab('users');
      else if (path === 'templates') this.setTab('templates');
      else if (path === 'ai-stats') this.setTab('ai');
      else if (path === 'broadcast') this.setTab('broadcast');
      else if (path === 'audit') this.setTab('audit');
    });

    this.loadStats();
    this.loadUsers();
  }

  loadStats(): void {
    this.authService.adminGetStats().subscribe({
      next: s => { this.stats = { ...this.stats, ...s }; },
      error: err => console.error('Error loading admin stats', err)
    });
    this.resumeService.getAdminStats().subscribe({
      next: rs => { this.stats.totalResumes = rs.totalResumes; },
      error: err => console.error('Error loading resume stats', err)
    });
    this.authService.adminGetAiStats().subscribe({
      next: s => this.aiStats = s,
      error: err => console.error('Error loading AI stats', err)
    });
    this.authService.adminGetPlatformHealth().subscribe({
      next: ph => { this.platformHealth = { ...this.platformHealth, ...ph }; },
      error: err => console.error('Error loading platform health', err)
    });
    this.authService.adminGetAiQueueTime().subscribe({
      next: qt => { this.platformHealth.aiQueueTimeSec = qt; },
      error: err => console.error('Error loading AI queue time', err)
    });
    this.loadPricing();
  }

  loadPricing(): void {
    this.authService.adminGetPricingConfig().subscribe({
      next: configs => {
        this.pricingConfigs = configs;
        if (configs.length === 0) {
          this.pricingConfigs = [
            { modelName: 'Gemini 1.5 Pro', costPer1kTokens: 0.005 },
            { modelName: 'Gemini 1.5 Flash', costPer1kTokens: 0.001 }
          ];
        }
      },
      error: err => console.error('Error loading pricing config', err)
    });
  }

  savePricing(): void {
    this.authService.adminUpdatePricingConfig(this.pricingConfigs).subscribe(() => {
      this.confirmDialog.alert('Pricing configuration updated successfully!', 'Pricing Saved');
      this.loadStats();
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.authService.adminGetAllUsers().subscribe({
      next: (us) => {
        console.log('[Admin] Loaded users:', us);
        this.users = us || [];
        try {
          this.calculateGrowthData(us || []);
        } catch (e) {
          console.error('[Admin] Error calculating growth data:', e);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[Admin] Error loading users:', err);
        this.isLoading = false;
      }
    });
  }

  calculateGrowthData(users: any[]): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Map<string, number>();
    
    (users || []).forEach(u => {
      if (u.createdAt) {
        try {
          const date = new Date(u.createdAt);
          if (!isNaN(date.getTime())) {
            const monthKey = months[date.getMonth()];
            counts.set(monthKey, (counts.get(monthKey) || 0) + 1);
          }
        } catch (e) {}
      }
    });

    const maxCount = Math.max(...Array.from(counts.values()), 1);
    
    // Get last 6 months
    const now = new Date();
    this.growthData = [];
    for (let i = 5; i >= 0; i--) {
      let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = months[d.getMonth()];
      const count = counts.get(mKey) || 0;
      this.growthData.push({
        month: mKey,
        count: count,
        percent: Math.round((count / maxCount) * 100)
      });
    }
  }

  get aiPercentage(): number {
    const aiCalls = this.stats.totalAiCalls || 0;
    const atsChecks = this.stats.totalAtsChecks || 0;
    const total = aiCalls + atsChecks;
    return total === 0 ? 0 : Math.round((aiCalls / total) * 100);
  }

  get atsPercentage(): number {
    const aiCalls = this.stats.totalAiCalls || 0;
    const atsChecks = this.stats.totalAtsChecks || 0;
    const total = aiCalls + atsChecks;
    return total === 0 ? 0 : Math.round((atsChecks / total) * 100);
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.resumeService.getAdminAllTemplates().subscribe({
      next: (ts) => {
        // Sort templates by usage count descending for the top templates widget
        this.templates = ts.sort((a,b) => (b.usageCount || 0) - (a.usageCount || 0));
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadAuditLogs(): void {
    this.authService.adminGetAuditLogs().subscribe(logs => this.auditLogs = logs);
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
    if (tab === 'templates') this.loadTemplates();
    if (tab === 'users') {
      this.loadUsers();
      this.loadStats();
    }
    if (tab === 'analytics') {
      this.loadStats();
      this.loadTemplates();
    }
    if (tab === 'audit') this.loadAuditLogs();
    if (tab === 'ai') this.loadStats();
  }

  // Super Admin Protection
  isSuperAdmin(user: any): boolean {
    return user.email === 'bhumikashrivas.work@gmail.com';
  }

  // User Actions
  updateUserRole(userId: number, role: string): void {
    this.authService.adminUpdateUserRole(userId, role).subscribe(() => this.loadUsers());
  }

  updateUserPlan(userId: number, plan: string): void {
    this.authService.adminUpdateUserPlan(userId, plan).subscribe(() => this.loadUsers());
  }

  toggleUserStatus(user: any): void {
    this.authService.adminSuspendUser(user.id, user.active).subscribe(() => this.loadUsers());
  }

  async deleteUser(userId: number): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      'This user and all their data will be permanently deleted. This action cannot be undone.',
      'Delete User',
      { confirmText: 'Delete Permanently', type: 'danger' }
    );
    if (confirmed) {
      this.authService.adminDeleteUser(userId).subscribe(() => this.loadUsers());
    }
  }

  // Broadcast Actions
  sendBroadcast(): void {
    if(!this.broadcastForm.title || !this.broadcastForm.message) return;
    
    let targetIds = this.users.map(u => u.email); // we use email as id in notification service
    if(this.broadcastForm.targetAudience === 'PREMIUM') {
      targetIds = this.users.filter(u => u.subscriptionPlan === 'PREMIUM').map(u => u.email);
    } else if (this.broadcastForm.targetAudience === 'FREE') {
      targetIds = this.users.filter(u => u.subscriptionPlan === 'FREE').map(u => u.email);
    }

    this.authService.adminSendBroadcast(targetIds, this.broadcastForm.title, this.broadcastForm.message).subscribe({
      next: () => {
        this.confirmDialog.alert('Broadcast notification sent successfully to all selected users!', 'Broadcast Sent');
        this.broadcastForm.title = '';
        this.broadcastForm.message = '';
      },
      error: () => this.confirmDialog.alert('Failed to send broadcast. Please try again.', 'Error')
    });
  }

  // Template Editor Actions
  openEditor(template?: Template): void {
    if (template) {
      this.editingTemplate = template;
      this.editorForm = { ...template };
    } else {
      this.editingTemplate = null;
      this.editorForm = {
        name: '',
        templateKey: '',
        description: '',
        category: 'Professional',
        isPremium: false,
        isActive: true,
        usageCount: 0,
        primaryColor: '#2563eb',
        secondaryColor: '#1e293b',
        fontFamily: 'Inter',
        layoutType: 'classic'
      };
    }
    this.showEditor = true;
  }

  saveTemplate(): void {
    if (this.editingTemplate) {
      this.resumeService.updateTemplate(this.editingTemplate.templateId, this.editorForm as Template).subscribe(() => {
        this.showEditor = false;
        this.loadTemplates();
      });
    } else {
      this.resumeService.createTemplate(this.editorForm as Template).subscribe(() => {
        this.showEditor = false;
        this.loadTemplates();
      });
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      'This template will be permanently deleted and will no longer be available to users.',
      'Delete Template',
      { confirmText: 'Delete', type: 'danger' }
    );
    if (confirmed) {
      this.resumeService.deleteTemplate(id).subscribe(() => this.loadTemplates());
    }
  }

  toggleTemplateStatus(template: Template): void {
    this.resumeService.deactivateTemplate(template.templateId).subscribe(() => this.loadTemplates());
  }
}
