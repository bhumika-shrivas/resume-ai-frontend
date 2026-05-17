import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './oauth-callback.html',
  styleUrl: './oauth-callback.css',
})
export class OauthCallbackComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const queryMap = this.route.snapshot.queryParamMap;
    const tokenFromQuery = queryMap.get('token') || queryMap.get('access_token') || queryMap.get('jwt') || queryMap.get('accessToken');
    const refreshToken = queryMap.get('refreshToken') || '';

    if (tokenFromQuery) {
      this.authService.saveTokens({ accessToken: tokenFromQuery, refreshToken: refreshToken });
      const returnUrl = queryMap.get('returnUrl') || '/app/dashboard';
      this.router.navigateByUrl(returnUrl);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      const tokenFromHash = hashParams.get('token') || hashParams.get('access_token') || hashParams.get('jwt');

      if (tokenFromHash) {
        this.authService.saveTokens({ accessToken: tokenFromHash, refreshToken: '' });
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/app/dashboard';
        this.router.navigateByUrl(returnUrl);
        return;
      }
    }

    this.isLoading = false;
    this.errorMessage = 'Google sign-in could not be completed. Please try again.';
  }
}
