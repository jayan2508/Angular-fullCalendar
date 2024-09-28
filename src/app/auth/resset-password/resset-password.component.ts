import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-new-password',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    NzGridModule,
    NzFormModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
  ],
  templateUrl: './resset-password.component.html',
  styleUrls: ['./resset-password.component.scss'],
})
export class NewPasswordPageComponent implements OnInit {
  validateForm!: FormGroup;
  submitted = false;
  hidePassword = true;
  hideConfirmPassword = true;
  email: string | null = '';
  passwordVisible = false;
  password?: string;
  confirmPasswordVisible = false;
  confirmPassword?: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userservice: UserService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.formBuilder.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    this.validateForm.controls['password'].valueChanges.subscribe((value) => {
      if (value != null) {
        this.validateForm.controls['password'].setValue(value.trim(), {
          emitEvent: false,
        });
      }
    });

    this.validateForm.controls['confirmPassword'].valueChanges.subscribe(
      (value) => {
        if (value != null) {
          this.validateForm.controls['confirmPassword'].setValue(value.trim(), {
            emitEvent: false,
          });
        }
      }
    );

    if (typeof localStorage !== 'undefined') {
      const otpData = localStorage.getItem('otpData');
      if (otpData) {
        const parsedData = JSON.parse(otpData);
        this.email = parsedData.email || null;
      }

      if (!this.email) {
        this.toastrService.error('Email not found in local storage', 'error');
        this.router.navigate(['/login']);
      }
    }
  }

  get form() {
    return this.validateForm.controls;
  }

  get passwordErrorMessage(): string {
    const errors = this.form['password'].errors;
    if (errors?.['required']) {
      return 'Password is required.';
    }
    if (errors?.['minlength']) {
      return 'Password must be at least 6 characters.';
    }
    return '';
  }

  get confirmPasswordErrorMessage(): string {
    const errors = this.form['confirmPassword'].errors;
    if (errors?.['required']) {
      return 'Confirm password is required.';
    }
    if (errors?.['passwordMismatch']) {
      return 'Passwords must match.';
    }
    return '';
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    if (this.email) {
      this.userservice.getUsers().subscribe((users) => {
        const user = users.find((user: any) => user.email === this.email);

        if (user) {
          user.password = this.validateForm.value.password;
          user.confirmPassword = this.validateForm.value.password;
          this.userservice.updateUser(user).subscribe(() => {
            this.toastrService.success(
              'Password updated successfully',
              'success'
            );
            setTimeout(() => {
              this.submitted = false;
              this.validateForm.reset();
              this.router.navigate(['/login']);
            }, 1000);
          });
        } else {
          this.toastrService.error('User not found', 'error');
        }
      });
    } else {
      this.toastrService.error('Email not found in query params', 'error');
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
