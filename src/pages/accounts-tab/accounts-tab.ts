import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { OfflineAccountPage } from '../offline-account/offline-account';
import { OnlineAccountPage } from '../online-account/online-account';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { SuperTabsController } from 'ionic2-super-tabs';
import { QrCodeSinglePage } from '../qr-code-single/qr-code-single';
import { BuyWarrants2Page } from '../buy-warrants2/buy-warrants2';
@Component({
  selector: 'page-accounts-tab',
  templateUrl: 'accounts-tab.html',
})
export class AccountsTabPage {
  offlineBalance: any;
  rootNavCtrl: NavController;
  UDetails: any;
  userid: any;
  noaccount: any;
  accounts: any;
  currentdate: any;
  constructor(
    public sqlite: SQLite,
    public superTabsCtrl: SuperTabsController,
    public datalink: DatalinkProvider,
    public dataservice: DataServiceProvider,
    public storage: Storage,
    private actionSheetCtrl: ActionSheetController,
    public platform: Platform,
    public navCtrl: NavController, public navParams: NavParams) {
    
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');
    this.currentdate = this.dataservice.getFormattedDate();
  }
  ionViewDidLoad() {
  }

  ionViewWillEnter(){
    this.GetAccounts();
    this.GetUserOfflineBalance();
  }

  GetAccounts() {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          this.datalink.GetAccounts(String(this.userid))
            .subscribe(accounts => {
              if (accounts) {
                this.accounts = accounts[0];
              } else {
                this.noaccount = "error";
              }
            }, err => {
              this.noaccount = "error";
              this.datalink.showNtwkErrorToast();
              return false;
            })
        }
      });
    });
  }
  onTransaction(accountdefID) {
    this.rootNavCtrl.push(OnlineAccountPage, { accountdefID })
  }

  GetUserOfflineBalance() {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
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
                    let oldbalance = parseInt(res.rows.item(0).offlinebalance);
                    this.offlineBalance = oldbalance;
                    console.log("New OfflineBalance  " + this.offlineBalance);
                  }
                })
                .catch(e => {
                  console.log("SELECT error" + JSON.stringify(e));
                });
            }, (error) => {
              console.log("db creation error:  " + error);
              this.datalink.showToast("Error Getting Offline Balance");
            });
          });
        }
      });
    });

  }

  onTransaction2() {
    this.rootNavCtrl.push(OfflineAccountPage);
  }

  Buy() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Market Warrants',
          handler: () => {
            this.rootNavCtrl.push(BuyWarrants2Page);
          }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  Send() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Market Warrants',
          handler: () => {
            this.superTabsCtrl.slideTo(1);
          }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
  
  Recieve() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Market Warrants',
          handler: () => {
            this.rootNavCtrl.push(QrCodeSinglePage);
          }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

}
