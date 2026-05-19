import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  isPasswordVisible = false;
  hasSubmitted = false;


  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    console.log('[LoginComponent] Initializing');
    
    // Check for token in query parameters (OAuth callback)
    const queryMap = this.route.snapshot.queryParamMap;
    const tokenFromQuery = queryMap.get('token') || queryMap.get('access_token') || queryMap.get('jwt');

    if (tokenFromQuery) {
      console.log('[LoginComponent] Token found in query params, saving and redirecting');
      this.authService.saveTokens({ accessToken: tokenFromQuery, refreshToken: '' });
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/app/dashboard';
      this.router.navigateByUrl(returnUrl);
      return;
    }

    // Check for token in URL hash (OAuth callback fallback)
    if (isPlatformBrowser(this.platformId)) {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      const tokenFromHash = hashParams.get('token') || hashParams.get('access_token') || hashParams.get('jwt');

      if (tokenFromHash) {
        console.log('[LoginComponent] Token found in hash, saving and redirecting');
        this.authService.saveTokens({ accessToken: tokenFromHash, refreshToken: '' });
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/app/dashboard';
        this.router.navigateByUrl(returnUrl);
        return;
      }
    }

    // Redirect to dashboard if already authenticated
    if (this.authService.isAuthenticated()) {
      console.log('[LoginComponent] User already authenticated, redirecting');
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (returnUrl) {
        this.router.navigateByUrl(returnUrl);
      } else if (this.authService.isAdmin()) {
        this.router.navigateByUrl('/admin');
      } else {
        this.router.navigateByUrl('/app/dashboard');
      }
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  login(): void {
    this.hasSubmitted = true;
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    console.log('[LoginComponent] Attempting login for:', this.email);

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.authService.saveTokens(res);
        const role = res.role?.toUpperCase();
        const isAdmin = role === 'ADMIN';
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        console.log('[LoginComponent] Login successful, redirecting...');
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (isAdmin) {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/app/dashboard');
        }
      },
      error: (err) => {
        console.error('[LoginComponent] Login failed:', err);
        this.errorMessage = err.message || 'Invalid email or password. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  continueWithGoogle(): void {
    console.log('[LoginComponent] Initiating Google OAuth flow');
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/app/dashboard';
    // In production, route through the Cloudflare tunnel URL. In dev, use localhost directly.
    const authBase = window.location.hostname === 'localhost'
      ? 'http://localhost:8081'
      : 'https://approximately-toddler-affected-configuration.trycloudflare.com';
    const baseUrl = `${authBase}/oauth2/authorization/google`;
    window.location.href = `${baseUrl}?redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback?returnUrl=' + returnUrl)}`;
  }
}