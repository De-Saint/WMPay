import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Storage } from '@ionic/storage';
import { TransactionDetailsPage } from '../transaction-details/transaction-details';

@Component({
  selector: 'page-online-transactions',
  templateUrl: 'online-transactions.html',
})
export class OnlineTransactionsPage {
  rootNavCtrl: NavController;
  UDetails: any;
  userid: any;
  code: any;
  message: any;
  transfers: any;
  errormsg: any;
  accountdefID: any;
  loadingProgress: any;
  constructor(
    public loadingCtrl: LoadingController,
    public datalink: DatalinkProvider, public storage: Storage, public alertCtrl: AlertController,
    public navCtrl: NavController, public navParams: NavParams) {
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');
    this.accountdefID = this.navParams.get('accountdefID');
    this.getTransactions(this.accountdefID);
  }

  ionViewDidLoad() {
    console.log("online-transactions  accountdefID   " + this.accountdefID);
  }
  getTransactions(acctdefid) {
    let loading = this.loadingCtrl.create({
    });
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          loading.present();
          this.datalink.getRecentTransfers(String(this.userid), String(acctdefid), null, null)
          .subscribe(transfers => {
            loading.dismiss().catch(() => { });
            this.code = transfers[0];
            if (this.code !== "200") {
              this.errormsg = "No Transactions";
              this.transfers = [];
            } else {
              this.transfers = transfers[1];
              console.log(this.transfers);
            }
            loading.dismiss().catch(() => { });
          }, (err) => {
            loading.dismiss().catch(() => { });
            return false;
          });
        }
      });
    });
  }

  doRefresh(refresher) {
    if (this.loadingProgress != 1) {
      let loading = this.loadingCtrl.create({
      });
      this.loadingProgress = 1;
      this.storage.ready().then(() => {
        this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
          if (loggedInUserDetails == null) {
            return false;
          } else {
            this.UDetails = loggedInUserDetails[1];
            this.userid = this.UDetails.userId;
            loading.present(); 
            refresher.complete();
            this.datalink.getRecentTransfers(String(this.userid), String(this.accountdefID), null, null).subscribe(transfers => {
              loading.dismiss().catch(() => { });
              this.code = transfers[0];
              if (this.code !== "200") {
                this.errormsg = "No Transactions";
                this.transfers = [];
              } else {
                this.transfers = transfers[1];
              }
            }, (err) => {
              loading.dismiss().catch(() => { });
              return false;
            });
          }
        });
      });
    }
  }

  onGotoDetails(transfer){
    this.rootNavCtrl.push(TransactionDetailsPage, {details: transfer, userid: this.userid});
  }
}
