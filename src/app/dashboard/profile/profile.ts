import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { finalize, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  profile: any = {
    fullName: '',
    email: '',
    headline: '',
    about: ''
  };
  isLoading = false;
  isSaving = false;
  message = '';
  isError = false;

  // Password reset state
  showResetPanel = false;
  resetStep: 'idle' | 'otp-sent' = 'idle';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  isSendingOtp = false;
  isResettingPassword = false;
  resetMessage = '';
  resetIsError = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Password validation regex patterns
  private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
  private readonly hasUppercase = /[A-Z]/;
  private readonly hasLowercase = /[a-z]/;
  private readonly hasDigit = /\d/;
  private readonly hasSpecial = /[\W_]/;

  get passwordChecks() {
    const p = this.newPassword || '';
    return {
      minLength: p.length >= 6,
      uppercase: this.hasUppercase.test(p),
      lowercase: this.hasLowercase.test(p),
      digit: this.hasDigit.test(p),
      special: this.hasSpecial.test(p),
      allPassed: this.passwordRegex.test(p)
    };
  }

  constructor(
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.isLoading = true;
    this.message = '';
    this.authService.getProfile().pipe(
      timeout(10000),
      catchError(err => {
        console.error('[Profile] Fetch error:', err);
        this.isError = true;
        this.message = 'Failed to load profile. Please check your connection.';
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe((data: any) => {
      if (data) {
        this.profile = {
          fullName: data.fullName || '',
          email: data.email || '',
          headline: data.headline || '',
          about: data.about || ''
        };
      }
      this.cdr.detectChanges();
    });
  }

  saveChanges(): void {
    if (this.isSaving) return;
    
    this.isSaving = true;
    this.message = '';
    this.isError = false;
    
    const payload = {
      fullName: this.profile.fullName,
      headline: this.profile.headline,
      about: this.profile.about
    };

    this.authService.updateProfile(payload).pipe(
      timeout(10000),
      catchError(err => {
        console.error('[Profile] Update error:', err);
        this.isError = true;
        if (err.name === 'TimeoutError') {
          this.message = 'Request timed out. Please try again.';
        } else {
          this.message = err.error?.message || 'Failed to update profile. Please try again.';
        }
        return of(null);
      }),
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe((data: any) => {
      if (data) {
        this.profile = { ...this.profile, ...data };
        this.isError = false;
        this.message = 'Profile updated successfully!';
        setTimeout(() => {
          this.message = '';
          this.cdr.detectChanges();
        }, 3000);
      }
      this.cdr.detectChanges();
    });
  }

  // ── Password Reset ──────────────────────────────────────────────

  toggleResetPanel(): void {
    this.showResetPanel = !this.showResetPanel;
    if (!this.showResetPanel) {
      this.resetState();
    }
  }

  sendOtp(): void {
    if (this.isSendingOtp || !this.profile.email) return;

    this.isSendingOtp = true;
    this.resetMessage = '';
    this.resetIsError = false;
    this.cdr.detectChanges();

    this.authService.sendPasswordResetOtp(this.profile.email).pipe(
      timeout(30000),
      catchError(err => {
        this.resetIsError = true;
        if (err.name === 'TimeoutError') {
          this.resetMessage = 'Request timed out. Please try again.';
        } else {
          this.resetMessage = err.error?.message || 'Failed to send OTP. Please try again.';
        }
        return of(null);
      }),
      finalize(() => {
        this.isSendingOtp = false;
        this.cdr.detectChanges();
      })
    ).subscribe((res: any) => {
      if (res) {
        this.resetStep = 'otp-sent';
        this.resetIsError = false;
        this.resetMessage = 'OTP sent to your email! Check your inbox.';
      }
      this.cdr.detectChanges();
    });
  }

  resetPassword(): void {
    if (this.isResettingPassword) return;

    // Validate
    if (!this.otp || this.otp.length !== 6) {
      this.resetIsError = true;
      this.resetMessage = 'Please enter the 6-digit OTP.';
      return;
    }
    if (!this.passwordChecks.allPassed) {
      this.resetIsError = true;
      this.resetMessage = 'Password does not meet all requirements.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.resetIsError = true;
      this.resetMessage = 'Passwords do not match.';
      return;
    }

    this.isResettingPassword = true;
    this.resetMessage = '';
    this.resetIsError = false;
    this.cdr.detectChanges();

    this.authService.resetPasswordWithOtp(this.profile.email, this.otp, this.newPassword).pipe(
      timeout(10000),
      catchError(err => {
        this.resetIsError = true;
        if (err.name === 'TimeoutError') {
          this.resetMessage = 'Request timed out. Please try again.';
        } else {
          this.resetMessage = err.error?.message || 'Failed to reset password. Please try again.';
        }
        return of(null);
      }),
      finalize(() => {
        this.isResettingPassword = false;
        this.cdr.detectChanges();
      })
    ).subscribe((res: any) => {
      if (res) {
        this.resetIsError = false;
        this.resetMessage = 'Password reset successfully! You can now login with your new password.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.resetState();
          this.showResetPanel = false;
          this.cdr.detectChanges();
        }, 3000);
      }
      this.cdr.detectChanges();
    });
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private resetState(): void {
    this.resetStep = 'idle';
    this.otp = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.resetMessage = '';
    this.resetIsError = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }
}
