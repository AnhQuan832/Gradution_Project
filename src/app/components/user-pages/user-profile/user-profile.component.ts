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
import { BaseComponent } from 'src/app/base.component';
import { MerchantRequestComponent } from '../merchant-request/merchant-request.component';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { RatingComponent } from '../../shared/rating/rating.component';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.less'],
    providers: [DialogService, ChatComponent],
})
export class UserProfileComponent extends BaseComponent implements OnInit {
    user: any;
    isLoading: boolean = false;
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
            value: 'Other',
        },
    ];
    protected avatarFile: FileList;
    listTransactions;
    formGroup: FormGroup;
    cart;
    cartId;
    selectedInvoice;
    isLogin: boolean = false;
    originalData: any;
    constructor(
        private formBuilder: FormBuilder,
        private userService: UserService,
        private invoiceService: InvoiceService,
        private dialogService: DialogService,
        private chat: ChatComponent,
        private router: Router,
        private msgService: ToastMessageService,
        private storageService: StorageService,
        private layoutService: LayoutService
    ) {
        super();
    }

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
        this.user = this.getUserInfo();
        this.formGroup.patchValue(this.user);
        const info = this.storageService.getItemLocal('currentUser');
        this.getData();
        // if (info?.userId) this.getData();
        // else this.router.navigate(['/user/home']);
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
            this.userService.getProfile(),
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
        this.selectedInvoice = row;
        if (row.invoiceId)
            this.invoiceService.getPaymentDetail(row.invoiceId).subscribe({
                next: (res) => {
                    this.cart = res;
                    const element = document.getElementById('invoice');
                    element.scrollIntoView();
                },
            });
        else
            this.invoiceService
                .getLivePaymentDetail(row.liveInvoiceId)
                .subscribe({
                    next: (res) => {
                        this.cart = res;
                        const element = document.getElementById('invoice');
                        element.scrollIntoView();
                    },
                });
        this.isBought = row.status === 'COMPLETED';
    }

    addRating(row) {
        this.ref = this.dialogService.open(RatingComponent, {
            header: 'Write a Review',
            data: row,
        });
    }

    contactAdmin(invoice) {
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
            case 'COD':
                return 'info';
            case 'RETURN':
                return 'warning';
            default:
                return 'danger';
        }
    }

    updateData() {
        const data = this.formGroup.getRawValue();
        delete data['addressList'];
        data['userAvatar'] = null;
        let formData = new FormData();
        this.prepareFormData(formData, data, 'updateUserProfileDTO', true);
        let avatar = this.avatarFile?.length ? this.avatarFile[0] : null;
        this.prepareFormData(formData, avatar, 'userAvatar', false);
        this.userService.update(formData).subscribe({
            next: (res) => {
                this.msgService.showMessage('Updated', '', 'success');
            },
        });
    }

    registerMerchant() {
        this.dialogService.open(MerchantRequestComponent, {
            width: this.layoutService.isDesktop() ? '50%' : '100%',
        });
    }

    updateStatus(status) {
        this.invoiceService
            .updateStatus({
                invoiceId: this.selectedInvoice.invoiceId,
                status: status,
            })
            .subscribe({
                next: (res) => {
                    this.msgService.showMessage(
                        'Marked as received',
                        '',
                        'success'
                    );
                    this.getData();
                },
            });
    }
}
