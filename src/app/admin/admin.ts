import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  growthData = [
    { month: 'Jan', count: 450, percent: 30 },
    { month: 'Feb', count: 820, percent: 55 },
    { month: 'Mar', count: 1100, percent: 75 },
    { month: 'Apr', count: 950, percent: 65 },
    { month: 'May', count: 1400, percent: 95 },
    { month: 'Jun', count: 1250, percent: 85 }
  ];

  // New Feature States
  aiStats: any = null;
  auditLogs: any[] = [];
  pricingConfigs: any[] = [];
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
    private readonly confirmDialog: ConfirmDialogService
  ) {}

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
    this.authService.adminGetStats().subscribe(s => {
      this.stats = { ...this.stats, ...s };
    });
    this.resumeService.getAdminStats().subscribe(rs => {
      this.stats.totalResumes = rs.totalResumes;
    });
    this.authService.adminGetAiStats().subscribe(s => this.aiStats = s);
    this.loadPricing();
  }

  loadPricing(): void {
    this.authService.adminGetPricingConfig().subscribe(configs => {
      this.pricingConfigs = configs;
      if (configs.length === 0) {
        this.pricingConfigs = [
          { modelName: 'Gemini 1.5 Pro', costPer1kTokens: 0.005 },
          { modelName: 'Gemini 1.5 Flash', costPer1kTokens: 0.001 }
        ];
      }
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
        this.users = us;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.resumeService.getAdminAllTemplates().subscribe({
      next: (ts) => {
        this.templates = ts;
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
