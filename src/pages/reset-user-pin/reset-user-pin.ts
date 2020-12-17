import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { UserPinPage } from '../user-pin/user-pin';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';

@Component({
  selector: 'page-reset-user-pin',
  templateUrl: 'reset-user-pin.html',
})
export class ResetUserPinPage {
  login: { pin?: string } = {};
  submitted = false;
  email: any;
  userid: any;
  UDetails: any;
  constructor(public navCtrl: NavController,
    public storage: Storage,
    public platform: Platform,
    public sqlite: SQLite,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public dataservice: DataServiceProvider,
    public datalink: DatalinkProvider,
    public navParams: NavParams) {
  }
  onUserPin(form) {
    this.submitted = true;
    if (form.valid) {
      this.UpdateUserPin(this.login.pin);
    }
  }

  UpdateUserPin(inputpin) {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          this.ResetUserPin(this.userid, inputpin);
        }
      });
    });

  }

  ResetUserPin(userid, inputpin) {
    let loading = this.loadingCtrl.create({
      dismissOnPageChange: true
    });
    let confirm = this.alertCtrl.create({
      title: 'Reset Pin',
      message: 'Do you want to reset your app login pin?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            this.navCtrl.setRoot(ResetUserPinPage);
          }
        },
        {
          text: 'Yes',
          handler: () => {
            loading.present();
            this.platform.ready().then(() => {
              this.sqlite.create({
                name: "wmpaybd.db",
                location: "default"
              }).then((db: SQLiteObject) => {
                db.executeSql('CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)', [])
                  .then(res => { console.log('usersTable SELECT created ' + JSON.stringify(res)) })
                  .catch(e => { console.log("usersTable SELECT created " + JSON.stringify(e)) });
                db.executeSql('UPDATE users SET appuserpin = ? WHERE userid = ?', [inputpin, userid])
                  .then(userres => {
                    loading.dismiss().catch(() => { });
                    this.datalink.showToast("Applicaton Login Pin has been reset successfully.")
                    // this.sendLoginPinEmail(inputpin)
                    this.navCtrl.setRoot(UserPinPage);
                    loading.dismiss().catch(() => { });
                  })
                  .catch(e => {
                    loading.dismiss().catch(() => { });
                    console.log("user table error" + e);
                  });
              }, (error) => {
                console.log("db creation error:  " + error);
                loading.dismiss().catch(() => { });
              });
            });
          }
        }
      ]
    });
    confirm.present();
  }

  Back() {
    this.navCtrl.setRoot(UserPinPage);
  }

  sendLoginPinEmail(RecoveryPin) {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.email = this.UDetails.email;
          this.userid = this.UDetails.userid;
          this.datalink.sendLoginPin(String(this.userid), this.email, String(RecoveryPin))
            .subscribe((res => {
              console.log(res);
            }), err => {

            });
        }
      });
    });
  }

}
