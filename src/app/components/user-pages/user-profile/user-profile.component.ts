import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChatComponent } from '../chat/chat.component';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InvoiceService } from 'src/app/services/invoice.service';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.less'],
    providers: [DialogService, ChatComponent],
})
export class UserProfileComponent implements OnInit {
    user: any;
    isLoading: boolean = true;
    ref: DynamicDialogRef;
    isBought = false;
    protected genderOptions = [
        {
            id: 'FEMALE',
            value: 'Nữ',
        },
        {
            id: 'MALE',
            value: 'Nam',
        },
        {
            id: 'OTHER',
            value: 'Khác',
        },
    ];
    protected avatarFile: FileList;
    listTransactions;
    formGroup: FormGroup;
    cart;
    cartId;
    selectedProducts: any[] = [];
    isLogin: boolean = false;
    originalData: any;
    constructor(
        private formBuilder: FormBuilder,
        private userSerivce: UserService,
        private invoiceService: InvoiceService,
        private dialogSerivce: DialogService,
        private chat: ChatComponent,
        private router: Router,
        private msgService: MessageService,
        private storageSerivce: StorageService
    ) {}

    ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            userId: [null],
            userEmail: [null, Validators.required],
            userFirstName: [null, Validators.required],
            userLastName: [null, Validators.required],
            userPhoneNumber: [null],
            memberPoint: [null, Validators.required],
            userAvatar: [null, Validators.required],
            addressList: this.formBuilder.group({}),
        });
        const info = this.storageSerivce.getItemLocal('userInfo');
        if (info?.userId) this.getData();
        else this.router.navigate(['/user/home']);
        this.formGroup.get('userEmail').disable();
        this.formGroup.get('memberPoint').disable();
    }

    selectedAvatar(event) {
        this.avatarFile = event.target.files;
        const imgInput = <HTMLImageElement>document.getElementById('imgInput');
        imgInput.src = URL.createObjectURL(this.avatarFile[0]);
    }

    updateUserProfile() {}
    getData() {
        this.isLoading = true;
        forkJoin([
            this.userSerivce.getProfile(),
            this.invoiceService.getPaymentInfo(),
        ]).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.formGroup.patchValue(res[0]);
                this.listTransactions = res[1];
            },
        });
    }

    onRowSelect(row) {
        console.log(row);
        this.invoiceService.getPaymentDetail(row.invoiceId).subscribe({
            next: (res) => {
                this.cart = res;
            },
        });
        this.isBought = row.status === 'COMPLETED';
    }

    addRating(row) {
        // this.ref = this.dialogSerivce.open(RatingComponent, {
        //   header: 'Write a Review',
        //   data: row,
        // });
    }

    contactAdmin() {
        sessionStorage.setItem('reciepientID', 'USER_1697033158735');
        this.chat.connect();
        setTimeout(() => {
            this.chat.setReceipientId('USER_1697033158735');
            this.chat.sendValue('Start');
            this.router.navigate(['/user/message']);
        }, 1000);
    }

    getSeverity(status: string) {
        switch (status) {
            case 'COMPLETED':
            case 'PAID':
                return 'success';
            case 'PENDING':
                return 'info';
            case 'RETURN':
                return 'warning';
            default:
                return 'danger';
        }
    }

    updateData() {
        this.userSerivce.update(this.formGroup.getRawValue()).subscribe({
            next: (res) => {
                this.msgService.add({
                    key: 'toast',
                    severity: 'success',
                    detail: 'Updated',
                });
            },
        });
        this.getData();
    }
}
