import { NewCashoutPage } from './../pages/new-cashout/new-cashout';
import { CashoutRequestPage } from './../pages/cashout-request/cashout-request';
import { CashoutTabPage } from './../pages/cashout-tab/cashout-tab';
import { AddedBanksPage } from './../pages/added-banks/added-banks';
import { BankTabPage } from './../pages/bank-tab/bank-tab';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { SuperTabsModule } from 'ionic2-super-tabs';
import { CardModule} from 'ngx-card/ngx-card';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { WMPay } from './app.component';

import { Market } from '@ionic-native/market';
import { Contacts, Contact } from '@ionic-native/contacts';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { SQLite } from '@ionic-native/sqlite';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SMS } from '@ionic-native/sms';
import { AppVersion } from '@ionic-native/app-version';
import { HeaderColor } from '@ionic-native/header-color';
import { Keyboard } from '@ionic-native/keyboard';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NetworkInterface } from '@ionic-native/network-interface';


import { DatalinkProvider } from '../providers/datalink/datalink';
import { DataServiceProvider } from '../providers/data-service/data-service';


import { HomePage } from '../pages/home/home';
import { BusinessDetailsPage } from '../pages/business-details/business-details';
import { BusinessesPage } from '../pages/businesses/businesses';
import { ContactDetailsPage } from '../pages/contact-details/contact-details';
import { ContactsPage } from '../pages/contacts/contacts';
import { CreateUserPinPage } from '../pages/create-user-pin/create-user-pin';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { FundOfflinePage } from '../pages/fund-offline/fund-offline';
import { HelpPage } from '../pages/help/help';
import { HomeTabPage } from '../pages/home-tab/home-tab';
import { InboxMessagesPage } from '../pages/inbox-messages/inbox-messages';
import { NewBusinessPage } from '../pages/new-business/new-business';
import { NewContactPage } from '../pages/new-contact/new-contact';
import { NewMessagePage } from '../pages/new-message/new-message';
import { OfflinePayPage } from '../pages/offline-pay/offline-pay';
import { OutBoxMessagesPage } from '../pages/out-box-messages/out-box-messages';
import { ProfileTabPage } from '../pages/profile-tab/profile-tab';
import { QrCodeDoublePage } from '../pages/qr-code-double/qr-code-double';
import { QrCodeSinglePage } from '../pages/qr-code-single/qr-code-single';
import { SentMessagesPage } from '../pages/sent-messages/sent-messages';
import { SmsPayPage } from '../pages/sms-pay/sms-pay';
import { TransactionDetailsPage } from '../pages/transaction-details/transaction-details';
import { UserPinPage } from '../pages/user-pin/user-pin';
import { WebPayPage } from '../pages/web-pay/web-pay';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { MessagesTabPage } from '../pages/messages-tab/messages-tab';
import { OfflineTransactionsPage } from '../pages/offline-transactions/offline-transactions';
import { OnlineTransactionsPage } from '../pages/online-transactions/online-transactions';
import { MessageDetailsPage } from '../pages/message-details/message-details';
import { PaymentTabPage } from '../pages/payment-tab/payment-tab';
import { WelcomePage } from '../pages/welcome/welcome';
import { StaffPage } from '../pages/staff/staff';
import { NewStaffPage } from '../pages/new-staff/new-staff';
import { SubscriptionPage } from '../pages/subscription/subscription';
import { OfflineAccountPage } from '../pages/offline-account/offline-account';
import { OnlineAccountPage } from '../pages/online-account/online-account';
import { ResetUserPinPage } from '../pages/reset-user-pin/reset-user-pin';
import { AddBankPage } from '../pages/add-bank/add-bank';
import { AccountsTabPage } from '../pages/accounts-tab/accounts-tab';
import { BuyWarrants2PageModule } from '../pages/buy-warrants2/buy-warrants2.module';
import { SubscriptionPageModule } from '../pages/subscription/subscription.module';

@NgModule({
  declarations: [
    WMPay,
    HomePage,
    BusinessDetailsPage,
    BusinessesPage,
    ContactDetailsPage,
    ContactsPage,
    CreateUserPinPage,
    EditProfilePage,
    FundOfflinePage,
    HelpPage,
    HomeTabPage,
    InboxMessagesPage,
    MessagesTabPage,
    NewBusinessPage,
    NewContactPage,
    NewMessagePage,
    OfflinePayPage,
    OfflineTransactionsPage,
    OnlineTransactionsPage,
    OutBoxMessagesPage,
    ProfileTabPage,
    QrCodeDoublePage,
    QrCodeSinglePage,
    SentMessagesPage,
    SmsPayPage,
    TransactionDetailsPage,
    UserPinPage,
    WebPayPage,
    LoginPage,
    RegisterPage,
    MessageDetailsPage,
    PaymentTabPage,
    WelcomePage,
    StaffPage,
    NewStaffPage,
    OfflineAccountPage,
    OnlineAccountPage,
    ResetUserPinPage,
    AddBankPage,
    AccountsTabPage,
    BankTabPage,
    AddedBanksPage,
    CashoutTabPage,
    CashoutRequestPage,
    NewCashoutPage,
  ],

  imports: [
    BrowserModule,
    HttpModule,
    CardModule,
    HttpClientModule,
    NgxQRCodeModule,
    IonicStorageModule.forRoot(),
    SuperTabsModule.forRoot(),
    IonicModule.forRoot(WMPay),
    BuyWarrants2PageModule,
    SubscriptionPageModule,
  ],
  bootstrap: [IonicApp],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  entryComponents: [
    WMPay,
    HomePage,
    BusinessDetailsPage,
    BusinessesPage,
    ContactDetailsPage,
    ContactsPage,
    CreateUserPinPage,
    EditProfilePage,
    FundOfflinePage,
    HelpPage,
    HomeTabPage,
    InboxMessagesPage,
    MessagesTabPage,
    NewBusinessPage,
    NewContactPage,
    NewMessagePage,
    OfflinePayPage,
    OfflineTransactionsPage,
    OnlineTransactionsPage,
    OutBoxMessagesPage,
    ProfileTabPage,
    QrCodeDoublePage,
    QrCodeSinglePage,
    SentMessagesPage,
    SmsPayPage,
    TransactionDetailsPage,
    UserPinPage,
    WebPayPage,
    LoginPage,
    RegisterPage,
    MessageDetailsPage,
    PaymentTabPage,
    WelcomePage,
    StaffPage,
    NewStaffPage,
    SubscriptionPage,
    OfflineAccountPage,
    OnlineAccountPage,
    ResetUserPinPage,
    AddBankPage,
    AccountsTabPage,
    BankTabPage,
    AddedBanksPage,
    CashoutTabPage,
    CashoutRequestPage,
    NewCashoutPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SQLite,
    BarcodeScanner,
    SMS,
    AppVersion,
    HeaderColor,
    Market,
    Keyboard,
    Contacts, 
    Contact,
    InAppBrowser,
    NetworkInterface,
    HTTP,
    AndroidPermissions,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatalinkProvider,
    DataServiceProvider
  ]
})
export class AppModule {}
