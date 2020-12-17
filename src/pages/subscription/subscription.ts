import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Events, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Storage } from '@ionic/storage';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { CreateUserPinPage } from '../create-user-pin/create-user-pin';



@IonicPage()
@Component({
  selector: 'page-subscription',
  templateUrl: 'subscription.html',
})
export class SubscriptionPage {
  payForm: FormGroup;
  email: any;
  password: any;
  UserID: any;
  HAS_LOGGED_IN = 'hasLoggedIn';
  loggedInUserDetails: any;
  UserDetails: any;
  code: any;
  Username: any;
  fullname: any;
  userid: any;
  loadmsg: any;
  amountToPay: any;
  public public_key = 'pk_test_9c32fd37430710c4b34c9376c8133c7925e899a7'; //Put your paystack Test or Live Key here
  public channels = ['card', 'bank']; //Paystack Payment Methods
  public random_id = Math.floor(Date.now() / 1000); //Line to generate reference number


  constructor(public formBuilder: FormBuilder,
    public datalink: DatalinkProvider,
    public dataservice: DataServiceProvider,
    public loadingCtrl: LoadingController,
    public storage: Storage, public events: Events,
    public platform: Platform,
    public navCtrl: NavController, public navParams: NavParams) {
    this.payForm = formBuilder.group({
      amount: ['', Validators.compose([Validators.required])],
      fullname: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required])]
    });

    this.email = this.navParams.get("email");
    this.password = this.navParams.get("password");
    this.UserID = this.navParams.get("userid");
    this.fullname = this.navParams.get("lastname") + " " + this.navParams.get("firstname");

  }


  ionViewWillEnter() {
    this.payForm.controls['amount'].setValue(1500);
    // this.datalink.GetPayStackKey()
    //   .subscribe(res => {
    //     console.log(res);
    //     alert(res);
    //     this.public_key = res;
    //   })
  }

  onPay() {
    let amount = this.payForm.value.amount;
    console.log(amount);
    if (isNaN(amount) || "" === String(amount)) {
      this.datalink.showToast("Please Enter The Cash Amount");
      return false;
    } else if (String(amount).length < 3) {
      this.datalink.showToast("Minimum amount is #100.00");
      return false;
    } else {
      this.loadmsg = "Please Wait ..."
      this.amountToPay = this.CalculatePercentage(amount);
    }
  }

  CalculatePercentage(userAmt) {
    let addedPerc = (parseInt(userAmt) * 0.02);
    let newAmt = parseInt(userAmt) + addedPerc;
    if (parseInt(userAmt) >= 2500) {
      newAmt = parseInt(userAmt) + 100;
    }
    return newAmt;
  }
  //Callback function on successful payment
  paymentDone(ref: any) {
    console.log(ref) //ref contains the response from paystack after successful payment
    let loading = this.loadingCtrl.create({
      content: 'Processing Payment...'
    });
    loading.present();
    this.datalink.MobilePayment(String(this.UserID), String(this.payForm.value.amount), String(ref.reference), String(ref.transaction), "ValidationFees").subscribe(result => {
      if (result === "success") {
        this.datalink.showToast("Your Payment was Successful. Check your Messages for details");
        this.onValidateLogin(this.email, this.password, loading);
      } else {
        loading.dismiss().catch(() => { });
        this.datalink.showToast("Please contact the WM Mobile Support if your card had been debited")
      }
    }, err => {
      loading.dismiss().catch(() => { });
      this.datalink.showToast("We could not connect to the WM Server. Please check your network connection. Contact the WM Mobile Support if your card had been debited.")
    });
  }

  //Event triggered if User cancel the payment
  paymentCancel() {
    this.datalink.showToast("You cancelled the payment!");
  }



  onValidateLogin(emailphone, password, loading) {
    this.datalink.login(emailphone, password)
      .subscribe(loggedInUserDetails => {
        this.loggedInUserDetails = loggedInUserDetails;
        console.log(this.loggedInUserDetails);
        this.code = loggedInUserDetails[0];
        loading.dismiss().catch(() => { });
        if (this.code != "200") {
          this.datalink.displayAlert("Login Error", loggedInUserDetails[1]);
          this.events.publish('user:logout');
          loading.dismiss().catch(() => { });
        } else {
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
        }
      }, (err) => {
        loading.dismiss().catch(() => { });
        this.datalink.showToast("Error connecting to server");
        return false;
      });
  }


  gotoCreateLoginPinPage(loading, userid) {
    this.navCtrl.setRoot(CreateUserPinPage, { userid }).then(() => {
      this.storage.ready().then(() => {
        this.storage.set('hasSeenLogin', true);
        loading.dismiss().catch(() => { });
      });
    });
  }

}
