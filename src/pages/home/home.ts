import { CashoutTabPage } from './../cashout-tab/cashout-tab';
import { Component } from "@angular/core";
import { NavController, Platform, AlertController } from "ionic-angular";
import { NavParams } from "ionic-angular/navigation/nav-params";
import { QrCodeSinglePage } from "../qr-code-single/qr-code-single";
import { QrCodeDoublePage } from "../qr-code-double/qr-code-double";
import { SmsPayPage } from "../sms-pay/sms-pay";
import { FundOfflinePage } from "../fund-offline/fund-offline";
import { AppVersion } from "@ionic-native/app-version";
import { Market } from "@ionic-native/market";
import { DatalinkProvider } from "../../providers/datalink/datalink";
import { NewBusinessPage } from "../new-business/new-business";
import { NewContactPage } from "../new-contact/new-contact";
import { NewStaffPage } from "../new-staff/new-staff";
import { Storage } from "@ionic/storage";
import { NewMessagePage } from "../new-message/new-message";
import { WebPayPage } from "../web-pay/web-pay";
import { BuyWarrants2Page } from "../buy-warrants2/buy-warrants2";
import { InAppBrowserOptions, InAppBrowser } from '@ionic-native/in-app-browser';
import { BankTabPage } from './../bank-tab/bank-tab';
import { SuperTabsController } from 'ionic2-super-tabs';


@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  rootNavCtrl: NavController;
  appversion: any;
  UDetails: any;
  usertype: any;
  subscription: any;
  constructor(
    public navCtrl: NavController,
    public appVersion: AppVersion,
    public platform: Platform,
    public datalink: DatalinkProvider,
    public market: Market,
    public inappBrowswer: InAppBrowser,
    public storage: Storage,
    public superTabsCtrl: SuperTabsController,
    public alertCtrl: AlertController,
    public navParams: NavParams
  ) {
    this.rootNavCtrl = this.navParams.get("rootNavCtrl");
  }

  ionViewWillEnter() {
    this.getVersionNumber();
    this.onCheckUserType();
  }

  async getVersionNumber() {
    if (this.platform.is("cordova")) {
      const versionNumber = await this.appVersion.getVersionNumber();
      this.CheckAppVersion(versionNumber);
      // this.CheckAppVersion("0.0.1");
    }
  }

  CheckAppVersion(appversion) {
    this.platform.ready().then(() => {
      this.datalink.checkAppVersion().subscribe(result => {
        console.log(result);
        let serverAppVAndroid = result[0];
        let serverAppViOS = result[1];
        if (this.platform.is('android')) {
          if (String(appversion) === String(serverAppVAndroid)) {
            this.onCheckUserType();
          } else {
            this.UpdateVersion();
          }
        } else if (this.platform.is('ios')) {
          if (String(appversion) === String(serverAppViOS)) {
            this.onCheckUserType();
          } else {
            this.UpdateVersion();
          }
        }
      });
    });
  }

  UpdateVersion() {
    const confirm = this.alertCtrl.create({
      title: 'Update Available!',
      message: 'A new version of The WealthMarket Pay Mobile App is available. Please update to a version now!!!',
      buttons: [
        {
          text: 'Update Later',
          handler: () => {
            this.onCheckUserType();
          }
        },
        {
          text: 'Update Now',
          handler: () => {
            this.onUpdateNow();
          }
        }
      ]
    });
    confirm.present();

  }

  onUpdateNow() {
    this.platform.ready().then(() => {
      if (this.platform.is("ios")) {
        this.openInAppStore('itms-apps://itunes.apple.com/app/1504720335');
      } else if (this.platform.is("android")) {
        this.market.open("com.thewealthmarket.wmpay").then(response => {
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      }
    });
  }

  openInAppStore(link) {
    let options: InAppBrowserOptions = {
      location: 'yes',//Or 'no' 
      hidden: 'no', //Or  'yes'
      clearcache: 'yes',
      clearsessioncache: 'yes',
      zoom: 'yes',//Android only ,shows browser zoom controls 
      hardwareback: 'yes',
      mediaPlaybackRequiresUserAction: 'no',
      shouldPauseOnSuspend: 'no', //Android only 
      closebuttoncaption: 'Close', //iOS only
      disallowoverscroll: 'no', //iOS only 
      toolbar: 'yes', //iOS only 
      enableViewportScale: 'no', //iOS only 
      allowInlineMediaPlayback: 'no',//iOS only 
      presentationstyle: 'pagesheet',//iOS only 
      fullscreen: 'yes',//Windows only    
    };
    let target = "_blank";
    this.inappBrowswer.create(link, target, options);
  }


  onCheckUserType() {
    this.platform.ready().then(() => {
      this.storage.ready().then(() => {
        this.storage.get("loggedInUserDetails").then(loggedInUserDetails => {
          if (loggedInUserDetails == null) {
            return false;
          } else {
            this.UDetails = loggedInUserDetails[1];
            this.usertype = this.UDetails.type;
            if (!this.usertype) {
              this.usertype = this.UDetails.usertype;
            }
          }
        });
      });
    });
  }


  onPaySingle() {
    this.rootNavCtrl.push(QrCodeSinglePage);
  }

  onPayDouble() {
    this.rootNavCtrl.push(QrCodeDoublePage);
  }

  ionViewWillLeave() { }
  onSMSPay() {
    this.rootNavCtrl.push(SmsPayPage);
  }
  onShowMessages() {
    this.superTabsCtrl.slideTo(4);
  }
  onShowAccounts() {
    this.superTabsCtrl.slideTo(3);
  }
  onSendMessage() {
    this.rootNavCtrl.push(NewMessagePage);
  }
  onBuyWarrants() {
    this.rootNavCtrl.push(BuyWarrants2Page);
  }
  onFundOffline() {
    this.rootNavCtrl.push(FundOfflinePage);
  }
  onNewContact() {
    this.rootNavCtrl.push(NewContactPage);
  }
  onNewBusiness() {
    this.rootNavCtrl.push(NewBusinessPage);
  }
  onAddStaff() {
    this.rootNavCtrl.push(NewStaffPage);
  }
  onQuickTransfer() {
    this.rootNavCtrl.push(WebPayPage, { fromhome: "fromhome" });
  }
  onAddBank(){
     this.rootNavCtrl.push(BankTabPage);
  }
  onCashOut(){
    this.rootNavCtrl.push(CashoutTabPage);
  }
}
