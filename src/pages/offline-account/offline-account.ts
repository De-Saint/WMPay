import { Component, ViewChild } from '@angular/core';
import {  NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { OfflineTransactionsPage } from '../offline-transactions/offline-transactions';
import { SuperTabs } from 'ionic2-super-tabs';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';

@Component({
  selector: 'page-offline-account',
  templateUrl: 'offline-account.html',
})
export class OfflineAccountPage {
  selectedTab = 0;
  userid: any;
  UDetails: any;
  user_name:any;
  offlineID: any;
  offlineBalance: any;
  pages = [
    { pageName: OfflineTransactionsPage, title: 'Recent Transactions', icon: 'globe', id: 'offlineTransactionsTab' },
  ];

  @ViewChild(SuperTabs) superTabs: SuperTabs;
  constructor( public sqlite: SQLite,
    public alertCtrl:AlertController,
    public platform: Platform, public storage: Storage, 
    public datalink:DatalinkProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.getOfflineBalance();
  }

  ionViewDidLoad() {
    
  }
  onTabSelect(ev: any) {
    this.selectedTab = ev.index;
  }
  getOfflineBalance() {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          this.user_name = this.UDetails.Name;
          this.offlineID = this.UDetails.offlineID;
          this.platform.ready().then(() => {
            this.sqlite.create({
              name: "wmpaybd.db",
              location: "default"
            }).then((db: SQLiteObject) => {
              db.executeSql('CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)', [])
                .then(res => { console.log('usersTable SELECT created ' + JSON.stringify(res)) })
                .catch(e => { console.log("usersTable SELECT created " + JSON.stringify(e)) });
              db.executeSql("SELECT * FROM users WHERE userid = ?", [this.userid])
                .then(res => {
                  if (res.rows.length > 0) {
                    this.offlineID = res.rows.item(0).offlinebalance;
                    this.offlineBalance = res.rows.item(0).offlinebalance;
                  }
                }).catch(e => {
                  this.datalink.showToast("Something went wrong checking your offline Balance");
                  
                });
            }, (error) => {
              this.datalink.showToast("Something went wrong checking your offline Balance");
              
            });
          });
        }
      });
    });
   
  }

  SyncOfflineTransaction (){
    this.alertCtrl.create({
     title: "Synchronize Offline Transactions",
     message: "Do you wish to synchronise (move your Offline Transactions to your Online Account)?",
     buttons: [{
      text: "No",
      handler: function(l) {
       console.log("Cancel clicked")
      }
     }, {
      text: "Yes",
      handler: function(n) {
      this.SyncTransactions()
      }
     }]
    }).present()
   }
   
  SyncTransactions = function() {
    this.datalink.showToast("Coming Soon !!!")
   }
  
}
