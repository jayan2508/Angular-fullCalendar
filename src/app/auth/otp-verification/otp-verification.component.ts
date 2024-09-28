import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgOtpInputModule } from 'ng-otp-input';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-otp-page',
  standalone: true,
  imports: [RouterModule, NgOtpInputModule, NzGridModule],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss'],
})
export class OTPPageComponent implements AfterViewInit, OnDestroy {
  email: string = '';
  countdown = 60;
  countdownSubscription!: Subscription;
  myOtp: string = '';
  otp: string = '';
  otpConfig = {
    length: 4,
    inputClass: 'otp-input',
  };

  constructor(private router: Router, private toastrService: ToastrService) {
    const otpData = this.getLocalStorageItem('otpData');
    this.email = otpData?.email || '';
    this.myOtp = otpData?.otp || '';

    if (otpData) {
      const expiryTime = otpData.expiry;
      const currentTime = new Date().getTime();
      this.countdown = Math.max(
        Math.floor((expiryTime - currentTime) / 1000),
        0
      );
    }
  }

  ngAfterViewInit() {
    this.startCountdown();
  }

  startCountdown() {
    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.countdownSubscription.unsubscribe();
      }
    });
  }

  handleOtpChange(otp: string) {
    this.otp = otp;
  }

  verifyOtp(event: Event) {
    event.preventDefault();
    const storedOtpData = this.getLocalStorageItem('otpData');
    const storedOtp = storedOtpData?.otp;

    if (!storedOtpData) {
      this.toastrService.error(
        'OTP data not found. Please request a new OTP.',
        'Error'
      );
      return;
    }

    const currentTime = new Date().getTime();
    if (currentTime > storedOtpData.expiry) {
      this.toastrService.error(
        'OTP has expired. Please request a new OTP.',
        'Error'
      );
      return;
    }

    if (this.otp === storedOtp) {
      this.toastrService.success('OTP verified successfully!', 'Success');
      setTimeout(() => {
        this.router.navigate(['/newPassword']);
      }, 1000);
    } else {
      this.toastrService.error('Invalid OTP. Please try again.', 'Error');
    }
  }

  ngOnDestroy() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  getLocalStorageItem(key: string): any {
    if (typeof localStorage !== 'undefined') {
      return JSON.parse(localStorage.getItem(key) || '{}');
    }
    return null;
  }

  setLocalStorageItem(key: string, value: any): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
