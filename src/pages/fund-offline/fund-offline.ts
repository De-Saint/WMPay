import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';
import { SuperTabsController } from 'ionic2-super-tabs';

@Component({
  selector: 'page-fund-offline',
  templateUrl: 'fund-offline.html',
})
export class FundOfflinePage {
  DECIMAL_SEPARATOR = ".";
  GROUP_SEPARATOR = ",";
  TransactionPIN: any;
  userid: any;
  UDetails: any;
  offline: any;
  slideFundForm: FormGroup;
  constructor(public storage: Storage,
    public datalink: DatalinkProvider,
    public dataservice: DataServiceProvider,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public sqlite: SQLite,
    public superTabsCtrl: SuperTabsController,
    public platform: Platform,
    public navCtrl: NavController, public navParams: NavParams) {
    this.slideFundForm = formBuilder.group({
      amount: ['', Validators.required]
    });
  }

  ionViewDidLoad() {
    this.offline = 'toOffline';
  }

  ToOffline() {
    this.offline = 'toOffline';
  }

  FromOffline() {
    this.offline = 'fromOffline';
  }

  format(valString) {
    if (!valString) {
      return '';
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
    return parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, this.GROUP_SEPARATOR)

  };

  unFormat(val) {
    if (!val) {
      return '';
    }
    val = val.replace(/^0+/, '').replace(/\D/g, '');
    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  }

  onCheckPin(check) {
    var amount = this.slideFundForm.value.amount;
    if (amount !== "") {
      var newamount = amount.toString().replace(/,/g, "");
      amount = this.dataservice.CurrencyFormat(newamount);
      const prompt = this.alertCtrl.create({
        title: 'Offline Account',
        message: "Please enter your Transaction PIN to confirm the transfer of " + amount + " " + check + " your Device Offline Account.",
        inputs: [
          {
            name: 'pin',
            placeholder: 'Transaction Pin',
            type: 'password'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Submit',
            handler: data => {
              this.onCheckTPIN(data.pin, newamount, check);
            }
          }
        ]
      });
      prompt.present();
    } else {
      this.datalink.showToast("Input field Amount is required!");
    }

  }


  onCheckTPIN(pin, amount, check) {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.TransactionPIN = loggedInUserDetails[2].TransactionPin;
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          if (this.TransactionPIN === pin) {
            this.WithDrawOnlineFund(amount, check, this.userid);
          } else {
            this.datalink.showToast("Invalid Pin, Please Check Transaction Pin");
          }
        }
      });
    });
  }

  WithDrawOnlineFund(amount, check, userid) {
    if (parseInt(amount) > 10000 || amount === "" || amount === undefined || isNaN(amount) || amount === null) {
      this.datalink.showToast("Error, please you have exceeded maximum amount is ₦10,000");
      return false;
    } else {
      // let loading = this.loadingCtrl.create({
      // });
      // loading.present();
      if (check === "To") {
        //   this.datalink.TransferToOfflineAccount(String(this.userid), String(amount)).subscribe((result) => {

        //     if (result === "success") {
        //       credit offline account
        // loading.dismiss().catch(() => { });
        this.FundUserOfflineBalance(String(userid), amount);
        //     } else {
        // loading.dismiss().catch(() => { });
        //       this.datalink.showToast("Error something went wrong or Insufficient Fund");
        //     }
        //     
        //   }, (err) => {
        //     loading.dismiss().catch(() => { });
        //     this.datalink.showToast("Error connecting to server");
        //     return false;
        //   });
      } else if (check === "From") {
        this.datalink.showToast("Coming Soon");
        // this.checkOfflineBalance(String(this.userid), amount, loading);
      }
    }
  }


  FundUserOfflineBalance(userid, amount) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: "wmpaybd.db",
        location: "default"
      }).then((db: SQLiteObject) => {
        db.executeSql('CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)', [])
          .then(res => { console.log('usersTable SELECT created ' + JSON.stringify(res)) })
          .catch(e => { console.log("usersTable SELECT created " + JSON.stringify(e)) });
        db.executeSql("SELECT * FROM users WHERE userid = ?", [userid])
          .then(res => {
            for (var i = 0; i < res.rows.length; i++) {
              let oldbalance = parseInt(res.rows.item(i).offlinebalance);
              let newAmount = oldbalance + parseInt(amount);
              this.dataservice.UpdateOfflineBalance(userid, newAmount);
              this.navCtrl.pop();
              this.superTabsCtrl.slideTo(3);
            }
          })
          .catch(e => {   console.log("SELECT error" + JSON.stringify(e)) });
      }, (error) => {   console.log("db creation error:  " + error); });
    });

  }
  checkOfflineBalance(userid, amount, loading) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: "wmpaybd.db",
        location: "default"
      }).then((db: SQLiteObject) => {
        db.executeSql('CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)', [])
          .then(res => { console.log('usersTable SELECT created ' + JSON.stringify(res)) })
          .catch(e => { console.log("usersTable SELECT created " + JSON.stringify(e)) });
        db.executeSql("SELECT * FROM users WHERE userid = ?", [userid])
          .then(res => {
            if (res.rows.length > 0) {
              let oldAmount = res.rows.item(0).offlinebalance;
              if (parseInt(oldAmount) > parseInt(amount)) {
                db.executeSql("SELECT * FROM users WHERE userid = ?", [userid])
                  .then(res => {
                    for (var i = 0; i < res.rows.length; i++) {
                      let oldbalance = parseInt(res.rows.item(i).offlinebalance);
                      let newAmount = oldbalance - parseInt(amount);
                      this.dataservice.UpdateOfflineBalance(userid, newAmount);
                      this.TransferFundOnline(loading, userid, amount);
                    }
                  })
                  .catch(e => {
                    loading.dismiss().catch(() => { });
                  });
              } else {
                loading.dismiss().catch(() => { });
                this.datalink.showToast("Insufficient Offline Balance");
              }
            }
          })
          .catch(e => {
            loading.dismiss().catch(() => { });
          });
      }, (error) => {
        this.datalink.showToast("Error Getting Offline Balance");
        loading.dismiss().catch(() => { });
      });
    });
  }


  TransferFundOnline(loading, userid, amount) {
    loading.dismiss().catch(() => { });
  }

}
