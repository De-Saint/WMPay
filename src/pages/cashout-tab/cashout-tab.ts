import { NewCashoutPage } from './../new-cashout/new-cashout';
import { CashoutRequestPage } from './../cashout-request/cashout-request';
import { SuperTabs } from 'ionic2-super-tabs';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-cashout-tab',
  templateUrl: 'cashout-tab.html',
})
export class CashoutTabPage {

  pages = [
    { pageName: CashoutRequestPage, title: "My Requests", icon: "home", id: "cashoutRequestTab" },
    {
      pageName: NewCashoutPage, title: "New Request", icon: "repeat", id: "newCashoutTab"
    }
  ];

  selectedTab = 0;
  @ViewChild(SuperTabs) superTabs: SuperTabs;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('');
  }
  onTabSelect(ev: any) {
    this.selectedTab = ev.index;
  }

}
