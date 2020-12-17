import { Component, ViewChild } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { ProfileTabPage } from "../profile-tab/profile-tab";
import { MessagesTabPage } from "../messages-tab/messages-tab";
import { PaymentTabPage } from "../payment-tab/payment-tab";
import { HomePage } from "../home/home";
import { SuperTabs } from "ionic2-super-tabs";
import { AccountsTabPage } from "../accounts-tab/accounts-tab";

@Component({
  selector: "page-home-tab",
  templateUrl: "home-tab.html"
})
export class HomeTabPage {
  pages = [
    { pageName: HomePage, title: "Home", icon: "home", id: "homeTab" },
    {
      pageName: PaymentTabPage,
      title: "Payment",
      icon: "repeat",
      id: "paymentTab"
    },
    {
      pageName: ProfileTabPage,
      title: "Profile",
      icon: "contact",
      id: "profileTab"
    },
    {
      pageName: AccountsTabPage,
      title: "Accounts",
      icon: "card",
      id: "accountsTab"
    },
    {
      pageName: MessagesTabPage,
      title: "Messages",
      icon: "mail",
      id: "messagesTab"
    }
  ];

  selectedTab = 0;
  @ViewChild(SuperTabs) superTabs: SuperTabs;
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {}

  onTabSelect(ev: any) {
    this.selectedTab = ev.index;
  }
}
