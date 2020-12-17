import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  Platform,
  LoadingController,
  AlertController,
  Events
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { DatalinkProvider } from "../../providers/datalink/datalink";
import { ResetUserPinPage } from "../reset-user-pin/reset-user-pin";

@Component({
  selector: "page-edit-profile",
  templateUrl: "edit-profile.html"
})
export class EditProfilePage {
  edit: { firstname?: string; lastname?: string; password?: string } = {};
  details: any;
  pin: any;
  UDetails: any;
  usertype: any;
  userid: any;
  code:any;
  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public storage: Storage,
    public events: Events,
    public alertCtrl: AlertController,
    public datalink: DatalinkProvider,
    public loadingCtrl: LoadingController,
    public navParams: NavParams
  ) {
    this.onCheckType(), this.getProfileDetails();
  }

  ionViewDidLoad() {}
  ionViewWillEnter() {
    this.onCheckType();
    this.getProfileDetails();
  }
  getProfileDetails() {
    this.storage.ready().then(() => {
      this.storage.get("loggedInUserDetails").then(loggedInUserDetails => {
        if (loggedInUserDetails == null) {
        } else {
          this.details = loggedInUserDetails[1];
          this.pin = this.details.transactionpin;
        }
      });
    });
  }

  onCheckType() {
    this.platform.ready().then(() => {
      this.storage.ready().then(() => {
        this.storage.get("loggedInUserDetails").then(loggedInUserDetails => {
          if (loggedInUserDetails == null) {
            return false;
          } else {
            this.UDetails = loggedInUserDetails[1];
            this.usertype = this.UDetails.usertype;
            if (!this.usertype) {
              this.usertype = this.UDetails.type;
            }
          }
        });
      });
    });
  }
  ChangeUserPin () {
    this.navCtrl.push(ResetUserPinPage);
  }

  onEditProfile(form) {
    if (form.valid) {
      let loading = this.loadingCtrl.create({
        
      });
      this.storage.ready().then(() => {
        this.storage.get("loggedInUserDetails").then(loggedInUserDetails => {
          if (null == loggedInUserDetails) {
            return false;
          } else {
            this.UDetails = loggedInUserDetails[1];
            this.userid = this.UDetails.userId;
            loading.present();
            this.datalink
              .UpdateProfile(
                String(this.userid),
                this.edit.firstname,
                this.edit.lastname,
                this.edit.password
              ).subscribe(
                result => {
                  loading.dismiss().catch(() =>{});
                  (this.code = result[0]),
                    200 === this.code
                      ? this.datalink.showToast("Error")
                      : (this.datalink.showToast("Successful"),
                        this.events.publish("user:logout"));
                },
                error => {
                  return (
                    loading.dismiss().catch(() =>{}),
                    this.datalink.showNtwkErrorToast()
                  );
                }
              );
          }
        });
      });
    }
  }
}
