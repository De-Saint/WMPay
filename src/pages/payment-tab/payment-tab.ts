import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { WebPayPage } from '../web-pay/web-pay';
// import { OfflinePayPage } from '../offline-pay/offline-pay';
import { SuperTabs } from 'ionic2-super-tabs';


@Component({
  selector: 'page-payment-tab',
  templateUrl: 'payment-tab.html',
})
export class PaymentTabPage {
  pages = [
    { pageName: WebPayPage, title: 'Web Transfer', icon: 'home', id: 'webPayTab' },
    // { pageName: OfflinePayPage, title: 'Offline Pay', icon: 'mail', id: 'offlinePayTab' }
  ];

  selectedTab = 0;
  userid: any;

  @ViewChild(SuperTabs) superTabs: SuperTabs;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {

  }

  onTabSelect(ev: any) {
    this.selectedTab = ev.index;
  }
}