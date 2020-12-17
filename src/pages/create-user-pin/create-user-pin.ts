import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  Platform,
  LoadingController
} from "ionic-angular";
import { DatalinkProvider } from "../../providers/datalink/datalink";
import { Storage } from "@ionic/storage";
import { DataServiceProvider } from "../../providers/data-service/data-service";
import { HomeTabPage } from "../home-tab/home-tab";
import { SQLiteObject, SQLite } from "@ionic-native/sqlite";

@Component({
  selector: "page-create-user-pin",
  templateUrl: "create-user-pin.html"
})
export class CreateUserPinPage {
  userid: any;
  login: { pin?: string } = {};
  submitted = false;
  UDetails: any;
  constructor(
    public navCtrl: NavController,
    public datalink: DatalinkProvider,
    public storage: Storage,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public sqlite: SQLite,
    public dataservice: DataServiceProvider,
    public navParams: NavParams
  ) {}

  ionViewDidLoad() {}
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
      this.GetOldUserPin(this.login.pin);
    }
  }

  GetOldUserPin(userpin) {
    this.storage.ready().then(() => {
      this.storage.get("loggedInUserDetails").then(loggedInUserDetails => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          let Username = this.UDetails.Name;
          this.UpdateUserPin(this.userid, userpin, Username);
        }
      });
    });
  }

  UpdateUserPin(userid, userpin, username) {
    let loading = this.loadingCtrl.create({});
    loading.present();
    this.platform.ready().then(() => {
      this.sqlite
        .create({
          name: "wmpaybd.db",
          location: "default"
        })
        .then(
          (db: SQLiteObject) => {
            db.executeSql(
              "CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)",
              []
            )
              .then(res => {
                console.log("usersTable SELECT created " + JSON.stringify(res));
              })
              .catch(e => {
                console.log("usersTable SELECT created " + JSON.stringify(e));
              });
            db.executeSql("UPDATE users SET appuserpin = ? WHERE userid = ?", [
              userpin,
              userid
            ])
              .then(userres => {
                this.GotoHome(loading, username);
              })
              .catch(e => {
                loading.dismiss().catch(() => {});
                console.log("user table error" + e);
              });
          },
          error => {
            console.log("db creation error:  " + error);
            loading.dismiss().catch(() => {});
          }
        );
    });
    loading.dismiss().catch(() => {});
  }

  GotoHome(loading, username){
    loading.dismiss().catch(() => {});
    this.storage.set('hasCreatedLoginPin', true);
    this.navCtrl.setRoot(HomeTabPage);
    this.datalink.showToast("Welcome Back " + username);
  }

}
