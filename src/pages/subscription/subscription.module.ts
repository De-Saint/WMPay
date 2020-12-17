import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SubscriptionPage } from './subscription';
import { Angular4PaystackModule } from 'angular4-paystack';

@NgModule({
  declarations: [
    SubscriptionPage,
  ],
  imports: [
    IonicPageModule.forChild(SubscriptionPage),
    Angular4PaystackModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SubscriptionPageModule {}
