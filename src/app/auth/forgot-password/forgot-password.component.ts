import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  validateForm!: FormGroup;
  submitted = false;
  emailNotFound = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toastrService: ToastrService
  ) {
    this.validateForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.validateForm.controls['email'].valueChanges.subscribe((value) => {
      if (value != null) {
        this.validateForm.controls['email'].setValue(value.trim(), {
          emitEvent: false,
        });
      }
    });
  }

  get form() {
    return this.validateForm.controls;
  }

  get emailErrorMessage(): string {
    if (this.form['email'].hasError('required')) {
      return 'Email is required.';
    }
    if (this.form['email'].hasError('email')) {
      return 'Invalid email format.';
    }
    return '';
  }

  onSubmit(): void {
    this.submitted = true;
    this.emailNotFound = false;

    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const email = this.validateForm.value.email;
    this.userService.checkUserExistence('', email).subscribe((userExists) => {
      if (!userExists) {
        this.toastrService.error(
          'Email not found. Please enter a registered email.',
          'error'
        );
        return;
      }

      const otp = this.generateOtp();
      this.sendOtpToEmail(email, otp);

      this.toastrService.success('OTP has been sent to your email.', 'success');
      setTimeout(() => {
        this.router.navigateByUrl('/otppage');
        this.validateForm.reset();
        this.submitted = false;
      }, 1000);
    });
  }

  generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  sendOtpToEmail(email: string, otp: string): void {
    localStorage.setItem(
      'otpData',
      JSON.stringify({ email, otp, expiry: new Date().getTime() + 60000 })
    );
  }
}
