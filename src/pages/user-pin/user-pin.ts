import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Storage } from '@ionic/storage';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { HomeTabPage } from '../home-tab/home-tab';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';
import { ResetUserPinPage } from '../reset-user-pin/reset-user-pin';


@Component({
  selector: 'page-user-pin',
  templateUrl: 'user-pin.html',
})
export class UserPinPage {
  userid: any;
  login: { pin?: string } = {};
  submitted = false;
  UDetails: any;
  constructor(public navCtrl: NavController, 
    public datalink: DatalinkProvider,
    public storage: Storage,
    public platform: Platform,
    public sqlite: SQLite,
    public dataservice: DataServiceProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    
  }
  Btn1() {
    if (this.login.pin) {
      if (this.login.pin.length < 4) {
        this.login.pin = this.login.pin + "1";
      } else {
        this.datalink.showToast("Only 4 digits");
      }
    } else {
      this.login.pin = "";
      this.login.pin = this.login.pin + "1";
    }
  }
  Btn2() {
    if (this.login.pin) {
      if (this.login.pin.length < 4) {
        this.login.pin = this.login.pin + "2";
      } else {
        this.datalink.showToast("Only 4 digits");
      }
    } else {
      this.login.pin = "";
      this.login.pin = this.login.pin + "2";
    }
  }
  Btn3() {
    if (this.login.pin) {
      if (this.login.pin.length < 4) {
        this.login.pin = this.login.pin + "3";
      } else {
        this.datalink.showToast("Only 4 digits");
      }
    } else {
      this.login.pin = "";
      this.login.pin = this.login.pin + "3";
    }
  }
  Btn4() {
    if (this.login.pin) {
      if (this.login.pin.length < 4) {
        this.login.pin = this.login.pin + "4";
      } else {
        this.datalink.showToast("Only 4 digits");
      }
    } else {
      this.login.pin = "";
      this.login.pin = this.login.pin + "4";
    }
  }
  Btn5() {
    if (this.login.pin) {
      if (this.login.pin.length < 4) {
        this.login.pin = this.login.pin + "5";
      } else {
        this.datalink.showToast("Only 4 digits");
      }
    } else {
      this.login.pin = "";
      this.login.pin = this.login.pin + "5";
    }
  }
  Btn6() {
    if (this.login.pin) {
      if (this.login.pin.length < 4) {
        this.login.pin = this.login.pin + "6";
      } else {
        this.datalink.showToast("Only 4 digits");
      }
    } else {
      this.login.pin = "";
      this.login.pin = this.login.pin + "6";
    }
  }
  Btn7() {
    if (this.login.pin) {
      if (this.login.pin.length < 4) {
        this.login.pin = this.login.pin + "7";
      } else {
        this.datalink.showToast("Only 4 digits");
      }
    } else {
      this.login.pin = "";
      this.login.pin = this.login.pin + "7";
    }
  }
  Btn8() {
    if (this.login.pin) {
      if (this.login.pin.length < 4) {
        this.login.pin = this.login.pin + "8";
      } else {
        this.datalink.showToast("Only 4 digits");
      }
    } else {
      this.login.pin = "";
      this.login.pin = this.login.pin + "8";
    }
  }
  Btn9() {
    if (this.login.pin) {
      if (this.login.pin.length < 4) {
        this.login.pin = this.login.pin + "9";
      } else {
        this.datalink.showToast("Only 4 digits");
      }
    } else {
      this.login.pin = "";
      this.login.pin = this.login.pin + "9";
    }
  }
  Btn0() {
    if (this.login.pin) {
      if (this.login.pin.length < 4) {
        this.login.pin = this.login.pin + "0";
      } else {
        this.datalink.showToast("Only 4 digits");
      }
    } else {
      this.login.pin = "";
      this.login.pin = this.login.pin + "0";
    }
  }
  BtnLess() {
    if (this.login.pin) {
      this.login.pin = this.login.pin.slice(0, -1);
    } else {
      this.login.pin = "";
    }
  }

  onUserPin(form) {
    this.submitted = true;
    if (form.valid) {
      this.getNewUserPin(this.login.pin);
    }
  }

  getNewUserPin(inputpin) {
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
              let userid = this.userid;
              db.executeSql("SELECT * FROM users WHERE userid = ?", [userid])
                .then(res => {
                  if (res.rows.length > 0) {
                    let appuserpin = res.rows.item(0).appuserpin;
                    if (inputpin === appuserpin) {
                      this.UDetails = loggedInUserDetails[1];
                      let Username = this.UDetails.Name;
                      this.navCtrl.setRoot(HomeTabPage);
                      this.datalink.showToast("Welcome Back " + Username);
                    } else {
                      this.datalink.showToast("Incorrect User Pin");
                      return false;
                    }
                  }
                })
                .catch(e => {
                  console.log("user table error:  " + e);
                });
            }, (error) => {
              console.log("db creation error:  " + error);
            });
          });
        }
      });
    });
  }


  ResetPin() {
    this.navCtrl.push(ResetUserPinPage);
  }

}
