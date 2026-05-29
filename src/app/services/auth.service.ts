import { HttpClient } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  passwordHash: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role?: string;
  plan?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'accessToken';
  private readonly refreshKey = 'refreshToken';
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly subUrl = `${environment.apiBaseUrl}/api/v1/subscription`;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  private currentUserSubject = new BehaviorSubject<{ id: string; email: string; role: string; plan: string; fullName: string } | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = new BehaviorSubject<boolean>(
    typeof window !== 'undefined' && !!localStorage.getItem('accessToken')
  );

  constructor(private readonly http: HttpClient) {
    if (this.isBrowser) {
      this.refreshState();
    }
  }

  /**
   * Refreshes the internal subjects from current storage
   */
  public refreshState(): void {
    const hasToken = !!this.getAccessToken();
    const user = this.getCurrentUser();
    
    if (hasToken && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticated$.next(true);
    } else {
      this.currentUserSubject.next(null);
      this.isAuthenticated$.next(false);
    }
  }

  private initializeAuthState(): void {
    this.refreshState();
  }

  /**
   * Login with email and password
   */
  login(payload: LoginRequest): Observable<LoginResponse> {
    console.log('[AuthService] Logging in user:', payload.email);
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(res => {
        this.saveTokens(res);
        const user = this.getCurrentUser();
        this.currentUserSubject.next(user);
        this.isAuthenticated$.next(true);
      }),
      catchError((error) => {
        console.error('[AuthService] Login failed:', error);
        const errorMsg = error.error?.message || error.message || 'Login failed';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Register a new user account
   */
  register(payload: RegisterRequest): Observable<any> {
    console.log('[AuthService] Registering user:', payload.email);
    return this.http.post<any>(`${this.baseUrl}/register`, payload).pipe(
      catchError((error) => {
        console.error('[AuthService] Registration failed:', error);
        const errorMsg = error.error?.message || error.message || 'Registration failed';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Logout the current user
   */
  logout(): void {
    console.log('[AuthService] Logging out user');
    this.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticated$.next(false);
  }

  /**
   * Upgrade user to Premium (Mock Stripe)
   */
  upgrade(): Observable<any> {
    const user = this.getCurrentUser();
    if (!user) return throwError(() => new Error('User not logged in'));
    
    return this.http.post<any>(`${this.subUrl}/upgrade/${user.id}`, {}).pipe(
      tap(() => {
        // After upgrade, we need to refresh the token to get the new 'plan' in JWT
        this.refresh().subscribe();
      })
    );
  }

  /**
   * Get usage statistics
   */
  getUsage(): Observable<any> {
    const user = this.getCurrentUser();
    if (!user) return throwError(() => new Error('User not logged in'));
    return this.http.get<any>(`${this.subUrl}/usage/${user.id}`);
  }

  /**
   * Refresh authentication token
   */
  refresh(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    console.log('[AuthService] Refreshing token');
    return this.http.post<LoginResponse>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap(res => {
        this.saveTokens(res);
        const user = this.getCurrentUser();
        this.currentUserSubject.next(user);
      }),
      catchError((error) => {
        console.error('[AuthService] Token refresh failed:', error);
        this.clearTokens();
        this.currentUserSubject.next(null);
        this.isAuthenticated$.next(false);
        return throwError(() => new Error(error.error?.message || 'Token refresh failed'));
      })
    );
  }

  /**
   * Save authentication tokens to localStorage
   */
  saveTokens(tokens: TokenPair): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.tokenKey, tokens.accessToken);
    localStorage.setItem(this.refreshKey, tokens.refreshToken);
    this.refreshState(); // Crucial: Update subjects immediately!
  }

  /**
   * Get authentication token from localStorage
   */
  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.refreshKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Clear authentication tokens
   */
  clearTokens(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
  }

  /**
   * Get the current user details from the JWT token
   */
  private localPlanOverride: string | null = null;

  getCurrentUser(): { id: string; email: string; role: string; plan: string; fullName: string } | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.userId || payload.id,
        email: payload.email || payload.sub,
        role: payload.role || 'USER',
        plan: this.localPlanOverride || payload.plan || 'FREE',
        fullName: payload.fullName || payload.name || ''
      };
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }

  isPremium(): boolean {
    if (this.localPlanOverride === 'PREMIUM') return true;
    const user = this.getCurrentUser();
    return user?.plan === 'PREMIUM' || user?.role === 'ADMIN';
  }

  /**
   * Get the full profile of the current user
   */
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/profile`);
  }

  /**
   * Update the user profile
   */
  updateProfile(payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/profile`, payload);
  }

  /**
   * Send password reset OTP to user's email
   */
  sendPasswordResetOtp(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/password-reset/send-otp`, { email });
  }

  /**
   * Verify OTP and reset password
   */
  resetPasswordWithOtp(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/password-reset/verify`, { email, otp, newPassword });
  }

  // ── ADMIN METHODS ───────────────────────────────────────────────

  adminGetAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/v1/admin/users`);
  }

  adminGetStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/v1/admin/stats`);
  }

  adminUpdateUserPlan(userId: number, plan: string): Observable<any> {
    return this.http.put<any>(`${environment.apiBaseUrl}/api/v1/admin/users/${userId}/plan?plan=${plan}`, {});
  }

  adminUpdateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put<any>(`${environment.apiBaseUrl}/api/v1/admin/users/${userId}/role?role=${role}`, {});
  }

  adminSuspendUser(userId: number, suspend: boolean): Observable<any> {
    const action = suspend ? 'suspend' : 'activate';
    return this.http.post<any>(`${environment.apiBaseUrl}/api/v1/admin/users/${userId}/${action}`, {});
  }

  adminDeleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiBaseUrl}/api/v1/admin/users/${userId}`);
  }

  adminGetAiStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/v1/ai/admin/stats`);
  }

  adminGetAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/v1/admin/audit-logs`);
  }

  adminGetPlatformHealth(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/v1/admin/platform-health`);
  }

  adminGetAiQueueTime(): Observable<number> {
    return this.http.get<number>(`${environment.apiBaseUrl}/api/v1/ai/admin/health/queue-time`);
  }

  adminSendBroadcast(recipientIds: string[], title: string, message: string): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/api/v1/notifications/send-bulk`, {
      recipientIds,
      title,
      message
    });
  }
  adminGetPricingConfig(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/v1/ai/admin/pricing`);
  }

  adminUpdatePricingConfig(configs: any[]): Observable<any> {
    return this.http.put<any>(`${environment.apiBaseUrl}/api/v1/ai/admin/pricing`, configs);
  }
  /**
   * Refresh the full profile and update local subjects
   */
  refreshProfile(): Observable<any> {
    return this.getProfile().pipe(
      tap(user => {
        if (user) {
          if (user.subscriptionPlan === 'PREMIUM' || user.plan === 'PREMIUM') {
            this.localPlanOverride = 'PREMIUM';
          }
          // Sync with what getCurrentUser expects (JWT format) or direct mapping
          this.currentUserSubject.next({
            id: user.id.toString(),
            email: user.email,
            role: user.role,
            plan: this.localPlanOverride || user.subscriptionPlan,
            fullName: user.fullName || ''
          });
        }
      })
    );
  }

  /**
   * Directly update subscription plan via auth service
   */
  updateSubscriptionPlan(plan: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/subscription?plan=${plan}`, {}).pipe(
      tap(() => {
        console.log(`[AuthService] Subscription updated to: ${plan}`);
        if (plan === 'PREMIUM') {
          this.localPlanOverride = 'PREMIUM';
        }
      }),
      catchError((error) => {
        console.error('[AuthService] Subscription update failed:', error);
        return throwError(() => new Error(error.error?.message || 'Subscription update failed'));
      })
    );
  }
}
