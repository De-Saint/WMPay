import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { TransactionDetailsPage } from '../transaction-details/transaction-details';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular/platform/platform';


@Component({
  selector: 'page-offline-transactions',
  templateUrl: 'offline-transactions.html',
})
export class OfflineTransactionsPage {
  rootNavCtrl: NavController;
  accountdefID: any;
  offlinetransfers = [];
  UDetails: any;
  userid: any;
  noofflinetransfer: any;
  originalofflinetransfers = [];
  constructor(
    public sqlite: SQLite, public platform: Platform, public datalink: DatalinkProvider, public storage: Storage, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController, public navParams: NavParams) {
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');
    this.getTransactions();
  }

  ionViewDidLoad() {

  }
  getTransactions(){
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          let loading = this.loadingCtrl.create({
            
          });
          this.platform.ready().then(() => {
            this.sqlite.create({
              name: "wmpaybd.db",
              location: "default"
            }).then((db: SQLiteObject) => {
              db.executeSql('CREATE TABLE IF NOT EXISTS transactions(transid TEXT, transactiontype TEXT, userid TEXT, fromuserid TEXT, touserid TEXT, amount TEXT, transactionid TEXT, oldbalance TEXT, newbalance TEXT, date DATE, time TIME, comment TEXT, status TEXT)', [])
                .then(res => { console.log('transactionsTable  created 1 ' + JSON.stringify(res)) })
                .catch(e => { console.log("transactionsTable created 1  error " + JSON.stringify(e)) });
                loading.present();
              db.executeSql("SELECT * FROM transactions WHERE userid = ?", [this.userid])
                .then(res => {
                  this.offlinetransfers = [];
                  this.originalofflinetransfers = [];
                  if (res.rows.length > 0) {
                    for (var i = 0; i < res.rows.length; i++) {
                      this.offlinetransfers.push({
                        transid: res.rows.item(i).transid,
                        transactiontype: res.rows.item(i).transactiontype,
                        userid: res.rows.item(i).userid,
                        fromuserid: res.rows.item(i).fromuserid,
                        touserid: res.rows.item(i).touserid,
                        amount: res.rows.item(i).amount,
                        transactionid: res.rows.item(i).transactionid,
                        oldbalance: res.rows.item(i).oldbalance,
                        newbalance: res.rows.item(i).newbalance,
                        date: res.rows.item(i).date,
                        time: res.rows.item(i).time,
                        comment: res.rows.item(i).comment,
                        status: res.rows.item(i).status
                      });
                      this.originalofflinetransfers.push(this.offlinetransfers);
                    }
                    loading.dismiss().catch(() => { });
                  } else {
                    this.noofflinetransfer = "noofflinetransfer";
                  }
                  loading.dismiss().catch(() => { });
                })
                .catch(e => {
                  loading.dismiss().catch(() => { });
                  console.log("SELECT error" + JSON.stringify(e));
                  // this.datalink.showToast("Something went wrong checking your offline Balance");
                });
            }, (error) => {
              loading.dismiss().catch(() => { });
              console.log("db creation error:  " + error);
              // this.datalink.showToast("Something went wrong checking your offline Balance");
            });
          });
        }
      });
    });
  }
  onGotoDetails(transfer) {
    this.rootNavCtrl.push(TransactionDetailsPage, { details: transfer });
  }
}
