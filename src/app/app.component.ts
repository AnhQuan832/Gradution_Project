import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styles: [
        `
            html {
                height: 100vh;
            }
        `,
    ],
})
export class AppComponent implements OnInit {
    constructor(private primengConfig: PrimeNGConfig) {}

    ngOnInit() {
        this.primengConfig.ripple = true;
    }
}
