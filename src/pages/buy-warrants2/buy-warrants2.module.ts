import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuyWarrants2Page } from './buy-warrants2';
import { Angular4PaystackModule } from 'angular4-paystack';

@NgModule({
  declarations: [
    BuyWarrants2Page,
  ],
  imports: [
    IonicPageModule.forChild(BuyWarrants2Page),
    Angular4PaystackModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class BuyWarrants2PageModule {}
