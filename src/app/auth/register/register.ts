import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  isLoading = false;
  hasSubmitted = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  register(): void {
    this.hasSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.fullName || !this.email || !this.password || !this.confirmPassword || this.isLoading) {
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      passwordHash: this.password,
    }).subscribe({
      next: (res) => {
        console.log('[RegisterComponent] Registration successful');
        this.successMessage = 'Account created successfully. You can sign in now.';
        // Reset form
        this.fullName = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
        this.isLoading = false;
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (err) => {
        console.error('[RegisterComponent] Registration failed:', err);
        this.errorMessage = err.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      },
    });
  }
}
