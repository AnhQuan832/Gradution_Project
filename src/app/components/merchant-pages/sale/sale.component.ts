import { Component, Inject, OnInit } from '@angular/core';
import { StatisticService } from 'src/app/services/statistic.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ProductService } from 'src/app/services/product.service';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { OrderService } from 'src/app/services/order.service';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import { ex } from '@fullcalendar/core/internal-common';
import { BaseComponent } from 'src/app/base.component';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'app-sale',
    templateUrl: './sale.component.html',
    styleUrls: ['./sale.component.scss'],
    providers: [{ provide: 'Window', useValue: window }],
})
export class SaleComponent extends BaseComponent implements OnInit {
    lineData;
    rangeDates;
    listInvoice;
    listImport;
    genParam;
    exportColumns;
    exportImColumns;

    statOption = [
        // {
        //     id: 'day',
        //     name: 'Today',
        // },
        {
            id: 'week',
            name: 'This Week',
        },
        {
            id: 'month',
            name: 'This Month',
        },
        {
            id: 'year',
            name: 'This Year',
        },
        {
            id: 'SPECIFIC',
            name: 'Specicfic Day',
        },
    ];
    cols = [
        { field: 'createdDate', header: 'Created Date' },
        { field: 'recipientName', header: 'User Name' },
        { field: 'finalPrice', header: 'Price (VND)' },

        { field: 'paymentType', header: 'Payment Type' },
        // { field: 'status', header: 'Status' },
    ];

    selectedOption = null;
    mostView;
    mostBuy;
    role;
    constructor(
        private statisticService: StatisticService,
        private productService: ProductService,
        private orderService: OrderService,
        @Inject('Window') private window: Window
    ) {
        super();
    }

    ngOnInit(): void {
        this.role = this.getRole() === 'ROLE_ADMIN' ? 'admin' : 'merchant';
        const params = {
            start_time_millis:
                moment()
                    .clone()
                    .startOf('week')
                    .set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
                    .unix() * 1000,
            end_time_millis: moment().clone().endOf('week').unix() * 1000,
            interval: 'day',
        };
        this.getData(params);
        this.getView(7);
        this.exportColumns = this.cols.map((col) => ({
            title: col.header,
            dataKey: col.field,
        }));
    }
    initChart(data) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const reportTime = data.map((i) =>
            moment(i.reportTime).format('DD/MM')
        );
        const totalSell = data.map((i) => i.totalSell);
        const totalImport = data.map((i) => i.totalImport);
        this.lineData = {
            labels: reportTime,
            datasets: [
                {
                    label: 'Total Sell',
                    data: totalSell,
                    fill: false,
                    backgroundColor:
                        documentStyle.getPropertyValue('--primary-500'),
                    borderColor:
                        documentStyle.getPropertyValue('--primary-500'),
                    tension: 0.4,
                },
                // {
                //     label: 'Total Import',
                //     data: totalImport,
                //     fill: false,
                //     backgroundColor:
                //         documentStyle.getPropertyValue('--teal-400'),
                //     borderColor: documentStyle.getPropertyValue('--teal-400'),
                //     tension: 0.4,
                // },
            ],
        };
    }

    onDateChange() {
        this.genParam = {
            start_time_millis:
                moment(this.rangeDates[0])
                    .set({
                        hour: 7,
                        minute: 0,
                        second: 0,
                        millisecond: 0,
                    })
                    .unix() * 1000,
            end_time_millis:
                moment(this.rangeDates[1])
                    .set({
                        hour: 7,
                        minute: 0,
                        second: 0,
                        millisecond: 0,
                    })
                    .unix() * 1000,
        };
        const params = {
            start_time_millis:
                moment(this.rangeDates[0])
                    .set({
                        hour: 7,
                        minute: 0,
                        second: 0,
                        millisecond: 0,
                    })
                    .unix() * 1000,
            end_time_millis:
                moment(this.rangeDates[1])
                    .set({
                        hour: 7,
                        minute: 0,
                        second: 0,
                        millisecond: 0,
                    })
                    .unix() * 1000,
            interval: 'day',
        };

        this.getData(params);
        this.getView(
            moment(this.rangeDates[1]).diff(
                moment(this.rangeDates[0]),
                'days'
            ) + 1
        );
    }

    getData(params) {
        this.statisticService.getData(this.role, params).subscribe({
            next: (res) => {
                this.initChart(res);
            },
        });
    }

    onOptionChange() {
        if (this.selectedOption.id !== 'SPECIFIC') {
            this.rangeDates = null;
            const params = {
                start_time_millis:
                    moment()
                        .clone()
                        .startOf(this.selectedOption.id)
                        .set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
                        .unix() * 1000,
                end_time_millis:
                    moment().clone().endOf(this.selectedOption.id).unix() *
                    1000,
                interval: this.selectedOption.id === 'year' ? 'month' : 'day',
            };
            this.genParam = {
                start_time_millis:
                    moment()
                        .clone()
                        .startOf(this.selectedOption.id)
                        .set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
                        .unix() * 1000,
                end_time_millis:
                    moment().clone().endOf(this.selectedOption.id).unix() *
                    1000,
            };
            this.getData(params);
            let days = 0;
            switch (this.selectedOption.id) {
                case 'week':
                    days = 7;
                    break;
                case 'month':
                    days = 30;
                    break;
                default:
                    days = 365;
            }
            this.getView(days);
        }
    }

    getView(days) {
        const params = {
            daysAmount: days,
        };
        if (this.getRole() === 'ROLE_MERCHANT')
            params['merchantId'] = this.getUserInfo().merchantId;
        this.productService.getProdMost(params).subscribe((data) => {
            this.mostView = data;
        });
        this.productService.getProdMostBuy(params).subscribe((data) => {
            this.mostBuy = data;
        });
    }

    generatePDF() {
        let params = this.genParam;
        if (this.getRole() === 'ROLE_MERCHANT')
            params['merchantId'] = this.getUserInfo().merchantId;
        this.orderService.getPaymentInfo(params).subscribe({
            next: (res) => {
                this.listInvoice = res.content;

                this.listInvoice.forEach((item) => {
                    item.createdDate = moment(item.createdDate).format(
                        'DD/MM/YYYY'
                    );
                    item.finalPrice = item.finalPrice.toLocaleString();
                });
                import('jspdf').then((jsPDF) => {
                    import('jspdf-autotable').then((x) => {
                        const doc = new jsPDF.default('p', 'px', 'a4');
                        doc.text('INVOICE', 200, 20);

                        (doc as any).autoTable(
                            this.exportColumns,
                            this.listInvoice
                        );
                        doc.save(`report-${moment().format('DD/MM/YYYY')}.pdf`);
                    });
                });
            },
        });
    }

    getAllImports(params?) {
        this.productService.getAllImport(params).subscribe({
            next: (res) => (this.listImport = res),
        });
    }

    getOrder(params?) {
        this.orderService.getPaymentInfo(params).subscribe({
            next: (res) => {
                this.listInvoice = res;
            },
        });
    }
}
