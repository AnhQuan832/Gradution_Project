import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { Component } from '@angular/core';
import {
    FormBuilder,
    Validators,
    ValidatorFn,
    AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.less'],
})
export class ForgotPasswordComponent {
    isSubmitted = false;
    msgError: string;
    email;
    otp;
    newPass;
    valid = false;
    isWrongEmail = false;
    private accessToken = '';
    constructor(
        private builder: FormBuilder,
        private authService: LoginService,
        private router: Router,
        private storageService: StorageService
    ) {}

    validateForm = this.builder.group({
        emailAddress: this.builder.control(null, Validators.email),
        otp: this.builder.control('', Validators.required),
        newPassword: this.builder.control('', Validators.required),
    });
    loginForm = this.builder.group({
        userEmail: this.builder.control('', [
            Validators.required,
            Validators.email,
        ]),
    });
    ngOnInit(): void {}

    sendOTP() {
        this.isSubmitted = true;
        this.isWrongEmail = false;

        if (this.loginForm.valid) {
            this.authService
                .sendOtpReset(this.loginForm.value.userEmail)
                .subscribe({
                    next: (res) => {
                        if (res) {
                            this.email = res;
                            this.isSubmitted = false;
                            this.validateForm.reset();
                            this.validateForm.patchValue({
                                emailAddress: this.loginForm.value.userEmail,
                            });
                        } else {
                            this.isWrongEmail = true;
                        }
                    },
                    error: (err) => console.log(err),
                });
        }
    }

    clearErrorNotification() {
        this.isSubmitted = false;
    }

    emailValidator(exceptionEmail: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const email = control.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                return { invalidEmail: true };
            } else {
                return null;
            }
        };
    }

    validate() {
        this.isSubmitted = true;

        this.authService.validateReset(this.validateForm.value).subscribe({
            next: (res) => {
                this.valid = true;
            },
        });
    }
}
