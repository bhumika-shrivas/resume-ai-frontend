import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { OauthCallbackComponent } from './auth/oauth-callback/oauth-callback';
import { authGuard, publicOnlyGuard, adminGuard, userOnlyGuard } from './auth/auth.guard';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout';
import { DashboardHomeComponent } from './dashboard/home/home';
import { ProfileComponent } from './dashboard/profile/profile';
import { ChangePasswordComponent } from './dashboard/change-password/change-password';
import { SubscriptionComponent } from './dashboard/subscription/subscription';
import { ResumeListComponent } from './dashboard/resumes/resume-list';
import { ResumeBuilderComponent } from './dashboard/resumes/resume-builder';
import { JobsComponent } from './dashboard/jobs/jobs';
import { TemplateGalleryComponent } from './public/templates/templates';

import { AdminDashboardComponent } from './admin/admin';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';
import { LandingComponent } from './public/landing/landing';

export const routes: Routes = [
  // Public auth routes
  { path: 'login', component: LoginComponent, canActivate: [publicOnlyGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [publicOnlyGuard] },
  { path: 'oauth-callback', component: OauthCallbackComponent },

  // Marketing landing page — redirect logged-in users to dashboard
  { path: '', component: LandingComponent, canActivate: [publicOnlyGuard] },

  // Main shell
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [

      // Public browsing pages
      { path: 'templates', component: TemplateGalleryComponent },


      // Protected app pages
      {
        path: 'app',
        canActivate: [authGuard, userOnlyGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: DashboardHomeComponent },
          { path: 'resumes', component: ResumeListComponent },
          { path: 'resumes/new', component: ResumeBuilderComponent },
          { path: 'resumes/edit/:id', component: ResumeBuilderComponent },
          { path: 'jobs', component: JobsComponent },
          { path: 'profile', component: ProfileComponent },
          { path: 'change-password', component: ChangePasswordComponent },
          { path: 'subscription', component: SubscriptionComponent },
        ],
      },
    ],
  },

  // Standalone Admin Shell
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AdminDashboardComponent },
      { path: 'users', component: AdminDashboardComponent },
      { path: 'templates', component: AdminDashboardComponent },
      { path: 'ai-stats', component: AdminDashboardComponent },
      { path: 'broadcast', component: AdminDashboardComponent },
      { path: 'audit', component: AdminDashboardComponent },
    ]
  },

  // Convenience redirects
  { path: 'profile', redirectTo: 'app/profile', pathMatch: 'full' },
  { path: 'change-password', redirectTo: 'app/change-password', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];