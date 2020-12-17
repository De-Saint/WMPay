import { SuperTabs } from 'ionic2-super-tabs';
import { AddBankPage } from './../add-bank/add-bank';
import { AddedBanksPage } from './../added-banks/added-banks';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-bank-tab',
  templateUrl: 'bank-tab.html',
})
export class BankTabPage {
  pages = [
    { pageName: AddedBanksPage, title: "My Bank Account ", icon: "home", id: "addedBanksTab" },
    {
      pageName: AddBankPage, title: "Add Bank Account", icon: "repeat", id: "addBankTab"
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
