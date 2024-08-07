import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingRoutingModule } from './user-pages-routing.module';
import { UserPageComponent } from './user-pages.component';
import { StyleClassModule } from 'primeng/styleclass';
import { DividerModule } from 'primeng/divider';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { CartComponent } from './cart/cart.component';
import { ChatComponent } from './chat/chat.component';
import { CheckOutComponent } from './check-out/check-out.component';
import { CompleteCheckoutComponent } from './complete-checkout/complete-checkout.component';
import { InvoiceHistoryComponent } from './invoice-history/invoice-history.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ShopViewComponent } from './shop-view/shop-view.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { CalendarModule } from 'primeng/calendar';
import { CarouselModule } from 'primeng/carousel';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { GalleriaModule } from 'primeng/galleria';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { SharedModule } from '../shared/shared.module';
import { SliderModule } from 'primeng/slider';
import { TreeModule } from 'primeng/tree';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import { MerchantRequestComponent } from './merchant-request/merchant-request.component';
import { FileUploadModule } from 'primeng/fileupload';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KeyFilterModule } from 'primeng/keyfilter';
import { LiveDetailComponent } from './live-detail/live-detail.component';
import { HomeComponent } from './landing/landing.component';
import { register } from 'swiper/element/bundle';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MerchantShopComponent } from './merchant-shop/merchant-shop.component';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';
register();
@NgModule({
    imports: [
        CommonModule,
        LandingRoutingModule,
        DividerModule,
        StyleClassModule,
        ChartModule,
        PanelModule,
        ButtonModule,
        CarouselModule,
        ButtonModule,
        TagModule,
        FormsModule,
        ReactiveFormsModule,
        DataViewModule,
        GalleriaModule,
        RatingModule,
        InputNumberModule,
        TableModule,
        DialogModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        DropdownModule,
        RadioButtonModule,
        DividerModule,
        AvatarModule,
        CalendarModule,
        ButtonModule,
        RatingModule,
        TagModule,
        SharedModule,
        SliderModule,
        TreeModule,
        TabViewModule,
        CheckboxModule,
        FileUploadModule,
        SkeletonModule,
        InputTextareaModule,
        KeyFilterModule,
        InfiniteScrollModule,
    ],
    declarations: [
        UserPageComponent,
        ShopViewComponent,
        ProductDetailComponent,
        UserProfileComponent,
        CartComponent,
        CheckOutComponent,
        ChatComponent,
        InvoiceHistoryComponent,
        CompleteCheckoutComponent,
        MerchantRequestComponent,
        LiveDetailComponent,
        HomeComponent,
        MerchantShopComponent,
        PurchaseHistoryComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserPageModule {}
