import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { StorageService } from 'src/app/services/storage.service';
import { VoucherService } from 'src/app/services/voucher.service';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.less'],
})
export class CartComponent implements OnInit {
    cart = [];
    cartId;
    voucherByMerchantMap = {};
    selectedProducts: any[] = [];
    isLogin: boolean = false;
    originalData: any;
    totalPrice: number = 0;
    discountPrice: number = 0;
    finalPrice: number = 0;
    listVoucher: any[] = [];
    cartPriceByMerchant = {};
    constructor(
        private cartService: CartService,
        private storageService: StorageService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private voucherService: VoucherService
    ) {}

    ngOnInit(): void {
        this.isLogin = this.storageService.getDataFromCookie('jwtToken');
        this.getCartData();
        if (this.isLogin) this.getVoucher();
    }

    getCartData() {
        if (this.isLogin) {
            this.getCart();
        } else {
            const cart = this.storageService.getItemLocal('cart');
            this.cartService.getUnauthCart(cart?.cartId).subscribe({
                next: (res) => {
                    this.storageService.setItemLocal('cart', res);
                    this.cart = res.cartItemList.map((item) => {
                        item.voucher = null;
                        item.isSelected = item.cartItemDTOList.every(
                            (pro) => pro.isSelected
                        );
                        item.cartItemDTOList.forEach((item) => {
                            item.qty = item.quantity;
                        });
                        return item;
                    });
                    this.calculateTotal();
                    this.onSelectedItemsChange();
                },
            });
        }
    }

    getCart() {
        this.cartService.getCart().subscribe({
            next: (res) => {
                this.cart = res.map((item) => {
                    item.voucher = null;
                    item.isSelected = item.cartItemDTOList.every(
                        (pro) => pro.isSelected
                    );
                    // this.voucherByMerchantMap[item.merchantId] = {};
                    item.cartItemDTOList.forEach((item) => {
                        item.qty = item.quantity;
                    });

                    return item;
                });
                this.calculateTotal();
                this.onSelectedItemsChange();
            },
            error: () => {},
        });
    }
    removeItem(data) {
        if (this.isLogin)
            this.cartService
                .addToCart(-data.quantity, data.varietyId)
                .subscribe({
                    next: (res) => {
                        this.getCart();
                    },
                });
        else
            this.cartService
                .addToCartUnAuth(
                    this.storageService.getItemLocal('cart').cartId,
                    -data.quantity,
                    data.varietyId
                )
                .subscribe({
                    next: (res) => {
                        this.getCartData();
                    },
                });
    }

    onCheckOut() {
        this.storageService.setItemLocal('cart', this.selectedProducts);
        this.storageService.setItemLocal('discountPrice', this.discountPrice);
        this.storageService.setItemLocal(
            'voucherByMerchantMap',
            this.voucherByMerchantMap
        );

        this.router.navigate(['/user/check-out']);
    }

    onChangeQty(data, value) {
        if (data.stockAmount < data.quantity) {
            data.quantity = data.quantity;
        } else {
            data.quantity = value;
            const change = {
                quantity: value - data.qty,
                varietyId: data.varietyId,
            };
            data.qty = value;
            this.updateCartItem(change);
        }
    }

    updateCartItem(data) {
        if (this.isLogin) {
            this.cartService
                .addToCart(data.quantity, data.varietyId)
                .subscribe({
                    next: (res) => {
                        this.getCart();
                    },
                });
        } else {
            const cartId = this.storageService.getItemLocal('cart').cartId;
            this.cartService
                .addToCartUnAuth(cartId, data.quantity, data.varietyId)
                .subscribe({
                    next: (res) => {
                        this.getCartData();
                    },
                });
        }
    }

    selectItem(merchant, item) {
        merchant.isSelected = merchant.cartItemDTOList.every(
            (pro) => pro.isSelected
        );
        this.cartService.selectItem(item.cartItemId).subscribe();
        this.calculateTotal();
        this.onSelectedItemsChange();
    }

    selectAll(merchant) {
        const requests = [];
        merchant.cartItemDTOList.forEach((item) => {
            if (item.isSelected !== merchant.isSelected)
                requests.push(this.cartService.selectItem(item.cartItemId));
            item.isSelected = merchant.isSelected;
        });
        merchant.isSelected = merchant.cartItemDTOList.every(
            (pro) => pro.isSelected
        );
        forkJoin(requests).subscribe();
        this.calculateTotal();
    }

    calculateTotal() {
        this.totalPrice = 0;
        this.discountPrice = 0;
        this.finalPrice = 0;
        this.cart.forEach((merchant) => {
            let totalSelectedPrice = 0;
            merchant.cartItemDTOList.forEach((item) => {
                if (item.isSelected) {
                    totalSelectedPrice += item.totalItemPrice;
                }
            });
            merchant.totalSelectedPrice = totalSelectedPrice;
            merchant.discountPrice = 0;
            if (merchant.voucher) {
                if (merchant.voucher.type === 'PERCENTAGE') {
                    merchant.discountPrice = Math.min(
                        merchant.totalSelectedPrice *
                            (merchant.voucher.value / 100),
                        merchant.voucher.maxValue
                    );
                } else {
                    merchant.discountPrice = Math.min(
                        merchant.voucher.value,
                        merchant.voucher.maxValue
                    );
                }
            }
            this.totalPrice += totalSelectedPrice;
            this.cartPriceByMerchant[merchant.merchantId] = totalSelectedPrice;
            this.discountPrice += merchant.discountPrice;
            this.finalPrice = this.totalPrice - this.discountPrice;
        });
        console.log(this.cart);
    }

    onSelectedItemsChange() {
        this.selectedProducts = [];
        this.cart.forEach((merchant) => {
            merchant.cartItemDTOList.forEach((item) => {
                if (item.isSelected) {
                    this.selectedProducts.push(item);
                }
            });
        });
    }

    getVoucher() {
        this.voucherService.getUserVoucher().subscribe({
            next: (res) => {
                this.listVoucher = res.map((item) => {
                    if ((item.type = 'PERCENTAGE'))
                        item.name =
                            item.value +
                            '%' +
                            ' (Max discount: ' +
                            item.maxValue.toLocaleString() +
                            'đ)';
                    else item.name = item.value.toLocaleString() + 'đ';
                    return {
                        ...item,
                    };
                });
            },
        });
    }

    onVoucherSelected(shop) {
        this.calculateTotal();
        this.voucherByMerchantMap[shop.merchantId] = shop.voucher;
        this.storageService.setItemLocal(
            'voucherByMerchantMap',
            this.voucherByMerchantMap
        );
    }

    onShowVoucher(merchantId) {
        let filteredVoucher = this.listVoucher.filter(
            (voucher) =>
                voucher.minInvoiceValue < this.cartPriceByMerchant[merchantId]
        );
        return filteredVoucher;
    }
}
