import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { StorageService } from 'src/app/services/storage.service';
import { VoucherService } from 'src/app/services/voucher.service';
import { VoucherDetailComponent } from '../voucher-management/voucher-detail/voucher-detail.component';
import { OrderService } from 'src/app/services/order.service';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import * as moment from 'moment';
import { BaseComponent } from 'src/app/base.component';
@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'],
})
export class OrderComponent extends BaseComponent implements OnInit {
    selectedVouchers;
    listVoucher;
    ref: DynamicDialogRef;
    rangeDates;
    totalRecords: number = 1;
    first: number = 0;
    size = 10;
    liveInvoices = [];
    listStatus = [
        { label: 'All', value: 'ALL' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Delivering', value: 'DELIVERING' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Cancel', value: 'CANCEL' },
        { label: 'Return', value: 'RETURN' },
    ];
    listPaymentType = [
        { label: 'All', value: 'ALL' },

        { label: 'COD', value: 'COD' },
        { label: 'Credit card', value: 'CREDIT_CARD' },
    ];
    selectedStatus = this.listStatus[0];
    selectedPaymentType = this.listPaymentType[0];
    status = null;
    paymentType;
    constructor(
        private router: Router,
        private dialogService: DialogService,
        private storageSerive: StorageService,
        private messageService: MessageService,
        private orderService: OrderService
    ) {
        super();
    }

    ngOnInit() {
        this.getData(true);
    }

    getData(isInit = false, params?) {
        if (params) {
            if (this.status) params.status = this.status;
            if (this.paymentType) params.paymentType = this.paymentType;
        }
        const merchantId = this.getUserInfo().merchantId;
        this.orderService
            .getPaymentInfo({
                page: this.first,
                size: 10,
                merchantId,
                ...params,
            })
            .subscribe({
                next: (res) => {
                    this.listVoucher = res.content;
                    if (isInit) this.totalRecords = res.totalElements;
                },
            });

        // this.orderService
        //     .getLiveInvoices({
        //         page: this.first,
        //         size: 10,
        //         merchantId,
        //         ...params,
        //     })
        //     .subscribe({
        //         next: (res) => {
        //             this.liveInvoices = res.content;
        //             if (isInit) this.totalRecords = res.totalElements;
        //         },
        //     });
    }

    openDetail(data?) {
        this.ref = this.dialogService.open(OrderDetailComponent, {
            position: 'center',
            data: data,
            width: '650px',
        });

        this.ref.onClose.subscribe(() => {
            this.getData();
        });
    }

    showToast() {}
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    getSeverity(status: string) {
        switch (status) {
            case 'COMPLETED':
            case 'COD':
                return 'success';
            case 'PENDING':
            case 'PAID':
            case 'ALL':
                return 'info';
            case 'RETURN':
            case 'CREDIT_CARD':
            case 'DELIVERING':
                return 'warning';
            default:
                return 'danger';
        }
    }

    onDateChange(clear?) {
        if (clear) this.getData();
        else {
            const params = {
                fromDate: moment(this.rangeDates[0]).set({
                    hour: 7,
                    minute: 0,
                    second: 0,
                    millisecond: 0,
                }),
                toDate: moment(this.rangeDates[1]).set({
                    hour: 7,
                    minute: 0,
                    second: 0,
                    millisecond: 0,
                }),
                groupType: 'DAY',
            };
            this.getData(true, params);
        }
    }

    onPageChange(event) {
        this.first = event.page;
        this.getData(false, {});
    }

    onFilterStatus(event) {
        this.first = 0;
        this.status = event.value !== 'ALL' ? event.value : null;
        this.getData(true, {});
    }

    onFilterPaymentType(event) {
        this.first = 0;
        this.paymentType = event.value !== 'ALL' ? event.value : null;
        this.getData(true, {});
    }
}
