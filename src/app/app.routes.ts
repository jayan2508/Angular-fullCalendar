import { Routes } from '@angular/router';
import { RegisterPageComponent } from './auth/register/register.component';
import { LoginPageComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { OTPPageComponent } from './auth/otp-verification/otp-verification.component';
import { NewPasswordPageComponent } from './auth/resset-password/resset-password.component';
import { HomePageComponent } from './pages/home/home-page/home-page.component';
import { authGuard } from './guards/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Login',
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    title: 'Register',
  },
  {
    path: 'forgotPassword',
    component: ForgotPasswordComponent,
    title: 'Forgot Password',
  },
  {
    path: 'otppage',
    component: OTPPageComponent,
    title: 'OTPpage',
  },
  {
    path: 'newPassword',
    component: NewPasswordPageComponent,
    title: 'NewPassword',
  },
  {
    path: 'homepage',
    component: HomePageComponent,
    title: 'HomePage',
  },
];
