import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AddressService } from 'src/app/services/address.service';
import { CartService } from 'src/app/services/cart.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
    selector: 'app-check-out',
    templateUrl: './check-out.component.html',
    styleUrls: ['./check-out.component.less'],
})
export class CheckOutComponent implements OnInit {
    shipService = [
        {
            service_type_id: 2,
            name: 'E-comerce shipping',
            price: 0,
        },
        {
            service_type_id: 5,
            name: 'Traditional shipping',
            price: 0,
        },
    ];

    paymentType = [
        {
            id: 'CREDIT_CARD',
            name: 'Credit Card',
        },
        {
            id: 'COD',
            name: 'COD',
        },
    ];
    listProvince: any[] = [];
    listDistrict: any[] = [];
    listWard: any[] = [];
    listShippingService: any[] = [];
    selectedProvince: any;
    selectedDistrict: any;
    selectedWard: any;
    selectedShipping: any;
    cartItem;
    totalPrice;
    isAddNewAddress: boolean = false;
    listAddress: any[] = [];
    selectedAdd: any;
    voucherOption: any[] = [];
    selectedVoucher;
    discount = 0;
    checkOutForm: FormGroup;
    isLogin;
    constructor(
        private apiAddress: AddressService,
        private cartService: CartService,
        private storageSerive: StorageService,
        private fb: FormBuilder,
        private invoiceService: InvoiceService,
        private router: Router,
        private msgService: MessageService
    ) {}
    ngOnInit(): void {
        this.checkOutForm = this.fb.group({
            recipientName: this.fb.control('', [Validators.required]),
            phoneNumber: this.fb.control('', [Validators.required]),
            paymentType: this.fb.control('CREDIT_CARD'),
            userEmail: this.fb.control('', Validators.required),
            returnUrl: this.fb.control(''),
            voucher: this.fb.control(''),
            shippingFee: this.fb.control(''),
            address: this.fb.group({
                userId: this.fb.control(''),
                addressId: this.fb.control(''),
                streetName: this.fb.control('', [Validators.required]),
                cityName: this.fb.control('', [Validators.required]),
                districtName: this.fb.control('', [Validators.required]),
                wardName: this.fb.control('', [Validators.required]),
            }),
        });
        this.isLogin = this.storageSerive.getItemLocal('userInfo');
        if (this.isLogin) {
            this.invoiceService.getVoucher().subscribe({
                next: (res) => {
                    this.voucherOption = res;
                },
            });
            this.getListAddress();
            const info = this.storageSerive.getItemLocal('userInfo');

            this.checkOutForm.patchValue({ recipientName: info.userFullName });
            this.checkOutForm.patchValue({ phoneNumber: info.userPhoneNumber });
            this.checkOutForm.patchValue({ userEmail: info.userEmail });
        }
        this.bindProvinces();
        this.cartItem = this.storageSerive.getItemLocal('cart');
        this.totalPrice = this.cartItem.reduce((acc, currentItem) => {
            return (
                acc +
                (currentItem.totalItemPrice ||
                    currentItem.quantity * currentItem.price)
            );
        }, 0);
    }

    getListAddress() {
        this.apiAddress.getAddress().subscribe({
            next: (res) => {
                this.listAddress = res;
            },
        });
    }

    bindProvinces() {
        this.apiAddress.getProvinces().then((response: any) => {
            const rListProvince = response.data;
            this.listProvince = rListProvince.map((rListProvince) => {
                return {
                    provName: rListProvince.ProvinceName,
                    provCode: rListProvince.ProvinceID,
                };
            });
        }),
            (err) => {
                console.log(err.error.message);
            };
    }

    async provinceSelectedChange(selectedValue) {
        // this.checkOutForm.patchValue({ city: selectedValue.provName });
        let foundProvince = this.listProvince.find(
            (item) => item.provName == selectedValue.provName
        );
        await this.apiAddress
            .getDisctrictsByProvince(foundProvince.provCode)
            .then((response: any) => {
                const rListDistrict = response.data;
                (this.listDistrict = rListDistrict.map((rListDistrict) => {
                    return {
                        distName: rListDistrict.DistrictName,
                        distCode: rListDistrict.DistrictID,
                    };
                })),
                    (err) => {
                        console.log(err.error.message);
                    };
            }),
            (err) => {
                console.log(err.error.message);
            };
    }

    async districtSelectedChange(selectedValue) {
        // this.checkOutForm.patchValue({ district: selectedValue.distName });

        await this.apiAddress
            .getWardsByDistrict(selectedValue.distCode)
            .then((response: any) => {
                const rListWard = response.data;
                this.listWard = rListWard.map((rListWard) => {
                    return {
                        wardName: rListWard.WardName,
                        wardCode: rListWard.WardCode,
                    };
                });
            }),
            (err) => {
                console.log(err.error.message);
            };
    }

    async wardSelectChange(selectedValue) {
        // this.checkOutForm.patchValue({ ward: selectedValue.wardName });

        await this.apiAddress
            .getShippingService(this.selectedDistrict.distCode)
            .then((res: any) => {
                this.listShippingService = res.data;
            });
        this.listShippingService.forEach((item, index) => {
            const data = {
                to_district_id: this.selectedDistrict.distCode,
                to_ward_code: this.selectedWard.wardCode,
                insurance_value: 500000,
                service_id: item.service_id,
                height: 15,
                length: 15,
                weight: 1000,
                width: 15,
                coupon: null,
            };
            this.cartService.getShippingFee(data).subscribe((res: any) => {
                if (res.code === 200)
                    this.shipService.map((item) => {
                        if (
                            item.service_type_id ===
                            this.listShippingService[index].service_type_id
                        )
                            item.price = res.data.total;
                    });
                console.log(this.shipService);
            });
        });
    }

    shippingServiceChange(selectedValue) {}

    voucherChange() {
        if (this.selectedVoucher.type === 'PERCENTAGE') {
            this.discount =
                (this.totalPrice * this.selectedVoucher.value) / 100;
            if (this.discount > this.selectedVoucher.maxValue)
                this.discount = this.selectedVoucher.maxValue;
        } else this.discount = this.selectedVoucher.value;
    }
    onCheckOut() {
        if (this.isLogin)
            this.checkOutForm.patchValue({ address: this.selectedAdd });
        else {
            const address = {
                streetName: this.checkOutForm.value.address.streetName,
                cityName: this.selectedProvince.provName,
                districtName: this.selectedDistrict.distName,
                wardName: this.selectedWard.wardName,
            };
            this.checkOutForm.patchValue({ address: address });
        }

        this.checkOutForm.patchValue({ voucher: this.selectedVoucher });
        this.checkOutForm.patchValue({
            returnUrl: 'https://pescue-shop.vercel.app/user/complete-checkout',
        });

        this.checkOutForm.patchValue({
            shippingFee:
                this.selectedShipping?.price || this.shipService[0].price,
        });

        let data;
        if (this.cartItem[0]?.cartId) {
            data = {
                paymentInfoDTO: this.checkOutForm.value,
                cartId: this.cartItem[0].cartId,
            };
            this.invoiceService.processPayment(data).subscribe({
                next: (res) => {
                    // window.open(res);
                    if (res) {
                        window.location.href = res.paymentUrl;
                        this.storageSerive.setItemLocal(
                            'sucInvoice',
                            res.invoiceId
                        );
                    } else {
                        this.msgService.add({
                            key: 'toast',
                            severity: 'success',
                            detail: 'Your order has been sent',
                        });
                        setTimeout(() => {
                            this.router.navigate(['/user/profile']);
                        }, 1000);
                    }
                },
            });
        } else {
            data = {
                paymentInfoDTO: this.checkOutForm.value,
                varietyId: this.cartItem[0].varietyId,
                quantity: this.cartItem[0].quantity,
            };
            if (this.isLogin)
                this.invoiceService.processBuyNow(data).subscribe({
                    next: (res) => {
                        // window.open(res);
                        if (res) {
                            window.location.href = res.paymentUrl;
                            this.storageSerive.setItemLocal(
                                'sucInvoice',
                                res.invoiceId
                            );
                        } else {
                            this.msgService.add({
                                key: 'toast',
                                severity: 'success',
                                detail: 'Your order has been sent',
                            });
                            setTimeout(() => {
                                this.router.navigate(['/user/profile']);
                            }, 1000);
                        }
                    },
                });
            else
                this.invoiceService.processBuyNowUnauth(data).subscribe({
                    next: (res) => {
                        // window.open(res);
                        if (res) {
                            window.location.href = res.paymentUrl;
                            this.storageSerive.setItemLocal(
                                'sucInvoice',
                                res.invoiceId
                            );
                        } else {
                            this.msgService.add({
                                key: 'toast',
                                severity: 'success',
                                detail: 'Your order has been sent',
                            });
                            setTimeout(() => {
                                this.router.navigate(['/user/profile']);
                            }, 1000);
                        }
                    },
                });
        }
    }

    onAddress() {
        if (this.isAddNewAddress) {
            const address = {
                userId: this.storageSerive.getItemLocal('userInfo')?.userId,
                streetName: this.checkOutForm.value.address.streetName,
                cityName: this.selectedProvince.provName,
                districtName: this.selectedDistrict.distName,
                wardName: this.selectedWard.wardName,
            };
            this.apiAddress.addAddress(address).subscribe({
                next: (res) => {
                    this.listAddress.push(res);
                },
            });
        } else {
            this.isAddNewAddress = !this.isAddNewAddress;
        }
    }
    async changeAdd() {
        await this.provinceSelectedChange({
            provName: this.selectedAdd.cityName,
        });
        const dist = this.listDistrict.find(
            (item) => item.distName === this.selectedAdd.districtName
        );
        await this.districtSelectedChange({ distCode: dist.distCode });
        const ward = this.listWard.find(
            (item) => item.wardName === this.selectedAdd.wardName
        );
        await this.apiAddress
            .getShippingService(dist.distCode)
            .then((res: any) => {
                this.listShippingService = res.data;
            });
        this.listShippingService.forEach((item, index) => {
            const data = {
                to_district_id: dist.distCode,
                to_ward_code: ward.wardCode,
                insurance_value: 500000,
                service_id: item.service_id,
                height: 15,
                length: 15,
                weight: 1000,
                width: 15,
                coupon: null,
            };
            this.cartService.getShippingFee(data).subscribe((res: any) => {
                if (res.code === 200)
                    this.shipService.map((item) => {
                        if (
                            item.service_type_id ===
                            this.listShippingService[index].service_type_id
                        )
                            item.price = res.data.total;
                    });
            });
            this.selectedShipping = this.listShippingService[0];
        });
    }
}
