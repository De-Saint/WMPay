import { Component } from '@angular/core';
import { NavController, NavParams, Events, Platform, AlertController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { RegisterPage } from '../register/register';
import { CreateUserPinPage } from '../create-user-pin/create-user-pin';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { SubscriptionPage } from '../subscription/subscription';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  submitted = false;
  HAS_LOGGED_IN = 'hasLoggedIn';
  loggedInUserDetails: any;
  login: { emailphone?: string, password?: string } = {};
  UserDetails: any;
  code: any;
  Username: any;
  userid: any;

  constructor(public events: Events,
    public datalink: DatalinkProvider,
    public storage: Storage,
    public dataservice: DataServiceProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  onLogin(form) {
    this.submitted = true;
    if (form.valid) {
      this.validateLogin(this.login.emailphone, this.login.password);
    }
  }

  validateLogin(emailphone, password) {
    let loading = this.loadingCtrl.create({
    });
    loading.present();
    this.datalink.login(emailphone, password)
      .subscribe(loggedInUserDetails => {
        this.loggedInUserDetails = loggedInUserDetails;
        console.log(this.loggedInUserDetails);
        this.code = loggedInUserDetails[0];
        if (this.code === "400") {
          this.datalink.displayAlert("Login Error", loggedInUserDetails[1]);
          this.events.publish('user:logout');
          loading.dismiss().catch(() => { });
        } else  if (this.code === "200") {
          this.storage.ready().then(() => {
            this.storage.set(this.HAS_LOGGED_IN, true);
          });
          this.datalink.SetloggedInUserDetails(this.loggedInUserDetails);
          this.UserDetails = loggedInUserDetails[1];
          this.Username = this.UserDetails.Name;
          this.userid = this.UserDetails.userId;
          this.datalink.showToast("Welcome " + this.Username);
          this.dataservice.GetUserLoginDetails(this.UserDetails); 
          this.gotoCreateLoginPinPage(loading, this.userid);
          this.events.publish('user:login', this.Username);
          loading.dismiss().catch(() => { });
        }else if(this.code === "401"){
          loading.dismiss().catch(() => { });
          this.onPayRegFees(emailphone, password, loggedInUserDetails[2], loggedInUserDetails[1], loggedInUserDetails[3], loggedInUserDetails[4]);
        }
        loading.dismiss().catch(() => { });
      }, (err) => {
        // alert(JSON.stringify(err));
        loading.dismiss().catch(() => { });
        this.datalink.showNtwkErrorToast();
        return false;
      });
  }

  gotoCreateLoginPinPage(loading, userid) {
     this.navCtrl.push(CreateUserPinPage, { userid }).then(() => {
      this.storage.ready().then(() => {
        this.storage.set('hasSeenLogin', true);
        loading.dismiss().catch(() => { });
      });
    });
  }


  onRegister() {
    this.navCtrl.push(RegisterPage);
  }

  forgotPass() {
    let forgot = this.alertCtrl.create({
      title: 'Forgot Password?',
      message: "Please fill the details below.",
      inputs: [
        {
          name: 'email',
          placeholder: 'Email',
          type: 'email'
        },
        {
          name: 'password',
          placeholder: 'New Password',
          type: 'text'
        },
        {
          name: 'cpassword',
          placeholder: 'Confirm New Password',
          type: 'text'
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
            this.CheckPassword(data.email, data.password, data.cpassword)

          }
        }
      ]
    });
    forgot.present();
  }

  CheckPassword(email, password, cpassword) {
    if (password === cpassword) {
      this.UpdatePassword(email, password);
    } else {
      this.datalink.showToast("Passwords don't match")
    }

  }

  UpdatePassword(email, password) {
    this.datalink.ForgetPassword(email, password)
      .subscribe(result => {
        if (result === "success") {
          this.datalink.displayAlert("Forget Password", result);
        } else {
          this.datalink.displayAlert("Forget Password", result);
        }
      }, err => {
        this.datalink.showNtwkErrorToast();
      });
  }

  onPayRegFees(email, password, userid, msg, firstname, lastname) {
    const confirm = this.alertCtrl.create({
      title: 'Validation Fees',
      message: msg,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log("Cancelled");
          }
        },
        {
          text: 'Pay Now!',
          handler: () => {
            this.navCtrl.push(SubscriptionPage, { email, password, userid, firstname, lastname }) // Plugin

          }
        }
      ]
    });
    confirm.present();
  }
}
