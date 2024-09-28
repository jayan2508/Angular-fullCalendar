import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NgZorroModule } from '../../shared/ng-zorro.module';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-register-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzInputModule,
    NgZorroModule,
    NzIconModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterPageComponent implements OnInit {
  validateForm!: FormGroup;
  submitted = false;
  hidePassword = true;
  hideConfirmPassword = true;
  passwordVisible = false;
  password?: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  get form() {
    return this.validateForm.controls;
  }

  get firstNameErrorMessage(): string {
    const errors = this.form['firstName'].errors;
    if (errors?.['required']) {
      return 'First name is required.';
    }
    if (errors?.['minlength']) {
      return 'First name must be at least 2 characters.';
    }
    return '';
  }

  get lastNameErrorMessage(): string {
    const errors = this.form['lastName'].errors;
    if (errors?.['required']) {
      return 'Last name is required.';
    }
    if (errors?.['minlength']) {
      return 'Last name must be at least 2 characters.';
    }
    return '';
  }

  get usernameErrorMessage(): string {
    const errors = this.form['username'].errors;
    if (errors?.['required']) {
      return 'Username is required.';
    }
    if (errors?.['minlength']) {
      return 'Username must be at least 3 characters.';
    }
    return '';
  }

  get emailErrorMessage(): string {
    const errors = this.form['email'].errors;
    if (errors?.['required']) {
      return 'Email is required.';
    }
    if (errors?.['email']) {
      return 'Invalid email format.';
    }
    return '';
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

    const formValue = {
      ...this.validateForm.value,
      isActive: false,
    };

    this.userService
      .checkUserExistence(formValue.username, formValue.email)
      .subscribe((userExists) => {
        if (userExists) {
          this.toastrService.error(
            'Username or Email already exists.',
            'Error'
          );
          return;
        }

        this.userService.addUser(formValue).subscribe(
          () => {
            this.toastrService.success('Registration successful', 'Success');
            setTimeout(() => {
              this.submitted = false;
              this.validateForm.reset();
              this.router.navigate(['/login']);
            }, 1000);
          },
          () => {
            this.toastrService.error(
              'Registration failed. Please try again.',
              'Error'
            );
          }
        );
      });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
