import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { SuperTabs } from 'ionic2-super-tabs';
import { OnlineTransactionsPage } from '../online-transactions/online-transactions';

@Component({
  selector: 'page-online-account',
  templateUrl: 'online-account.html',
})
export class OnlineAccountPage {
  accountdefID: any;
  pages = [
    { pageName: OnlineTransactionsPage, title: 'Recent Transactions', icon: 'globe', id: 'onlineTransactionsTab' },
  ];
  UDetails: any;
  userid: any;
  selectedTab = 0;
  account: any;
  details: {
    selectedaccttypeID?: any;
    startdate?: Date;
    enddate?: Date;
  } = {};
 
  @ViewChild(SuperTabs) superTabs: SuperTabs;
  constructor(public navCtrl: NavController,
    public datalink: DatalinkProvider,
    public storage: Storage,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public navParams: NavParams) {
    this.accountdefID = this.navParams.get('accountdefID');
      this.GetAccountDetails(this.accountdefID);
  }

  ionViewDidLoad() {
   }

  onTabSelect(ev: any) {
    this.selectedTab = ev.index;
  }

  GetAccountDetails(acctdefid) {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          this.datalink.GetUserAccountBalances(String(this.userid), String(acctdefid))
          .subscribe(accounts => {
            this.account = accounts;
            console.log(this.account);
          }, (err) => {
            this.datalink.showNtwkErrorToast();
            return false;
          });
        }
      });
    });
  }

}
