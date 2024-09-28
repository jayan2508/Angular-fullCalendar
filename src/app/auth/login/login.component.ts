import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
  NonNullableFormBuilder,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgZorroModule } from '../../shared/ng-zorro.module';
import { SessionStorageService } from '../../services/session-storage/session-storage.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    NzFormModule,
    NzButtonModule,
    NzInputModule,
    NgZorroModule,
    NzIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginPageComponent implements OnInit {
  validateForm!: FormGroup<{
    userName: FormControl<string>;
    password: FormControl<string>;
  }>;
  submitted = false;
  errorMessage: string = '';
  hidePassword = true;
  passwordVisible = false;
  password?: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toastrService: ToastrService,
    private fb: NonNullableFormBuilder,
    private sessionStorageService: SessionStorageService
  ) {
    this.validateForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  get form() {
    return this.validateForm.controls;
  }

  get passwordErrorMessage(): string {
    if (this.form['password'].hasError('required')) {
      return 'Password is required.';
    }
    if (this.form['password'].hasError('minlength')) {
      return 'Password must be at least 6 characters.';
    }
    return '';
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const { userName, password } = this.validateForm.value;

    this.userService
      .checkUserExistence(userName!, userName!)
      .subscribe((userExists) => {
        if (!userExists) {
          this.toastrService.error('No data found', 'error');
          return;
        }

        this.userService.getUsers().subscribe((users) => {
          if (!users || users.length === 0) {
            this.toastrService.error('No data found', 'error');
            return;
          }

          const user = users.find(
            (user: any) =>
              (user.username === userName || user.email === userName) &&
              user.password === password
          );

          if (!user) {
            this.toastrService.error('Invalid credentials.', 'error');
            return;
          }

          user.isActive = true;
          this.userService.updateUser(user).subscribe(() => {
            // Store user data in session storage
            this.sessionStorageService.setItem('loggedInUser', {
              id: user.id,
              username: user.username,
              email: user.email,
              isActive: user.isActive,
            });

            this.toastrService.success('Login successfully!', 'success');
            setTimeout(() => {
              this.validateForm.reset();
              this.submitted = false;
              this.router.navigate(['/homepage']);
            }, 1000);
          });
        });
      });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
