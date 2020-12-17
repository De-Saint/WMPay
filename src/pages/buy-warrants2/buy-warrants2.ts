import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Platform } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-buy-warrants2',
  templateUrl: 'buy-warrants2.html',
})
export class BuyWarrants2Page  {
  warrants: string;
  UDetails: any;
  userid: any;
  error: any;
  email: any;
  fullname: any;
  email2: any;
  fullname2: any;
  check: string;
  WarrantsAmt = 0;
  WarrantsAmt2 = 0;
  // RRightsAmt = 0;
  // RRightsAmt2 = 0;
  PCRightsAmt = 0;
  PCRightsAmt2 = 0;
  BuyAtParForm: FormGroup;
  BuyAtDoubleForm: FormGroup;
  loadmsg: any;
  loadmsg2: any;
  amountToPay: any;
  amount2ToPay: any;
  public public_key: any; //Put your paystack Test or Live Key here
  public channels = ['card', 'bank']; //Paystack Payment Methods
  public random_id = Math.floor(Date.now() / 1000); //Line to generate reference number

  constructor(public formBuilder: FormBuilder,
    public storage: Storage,
    public loadingCtrl: LoadingController,
    public datalink: DatalinkProvider,
    public platform: Platform,
    public alertCtrl: AlertController,
    public navCtrl: NavController, public navParams: NavParams) {

    this.BuyAtParForm = formBuilder.group({
      fullname: ['', [Validators.required]],
      email: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.maxLength(7), Validators.minLength(3)]]
    });

    this.BuyAtDoubleForm = formBuilder.group({
      fullname2: ['', [Validators.required, Validators.maxLength(7), Validators.minLength(3)]],
      email2: ['', [Validators.required, Validators.maxLength(7), Validators.minLength(3)]],
      amount2: ['', [Validators.required, Validators.maxLength(7), Validators.minLength(3)]]
    })
  }
  
  ionViewWillEnter() {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          this.fullname = this.UDetails.last_name + " " + this.UDetails.first_name;
          this.email = this.UDetails.email;
          this.fullname2 = this.UDetails.last_name + " " + this.UDetails.first_name;
          this.email2 = this.UDetails.email;
          //
        }
      });
    });
    this.GetPayStackKey();
  }

  GetPayStackKey(){
     this.datalink.GetPayStackKey()
      .subscribe(res => {
        console.log(res);
        this.public_key = res;
      })
  }


  //Callback function on successful payment
  paymentDone(ref: any, check: string) {
    console.log(ref) //ref contains the response from paystack after successful payment
    let amount = 0;
    console.log(check);
    if (check === "double") {
      amount = parseInt(this.BuyAtDoubleForm.value.amount2) * 2;
    } else if (check === "single") {
      amount = this.BuyAtParForm.value.amount;
    }
    console.log(amount);
    if (isNaN(amount) || "" === String(amount)) {
      this.datalink.showToast("Please Enter The Cash Amount");
    } else if (String(amount).length < 3) {
      this.datalink.showToast("Minimum amount is #100.00");
    } else {
      let loading = this.loadingCtrl.create({
        content: 'Processing Payment...'
      });
      loading.present();
      this.datalink.MobilePayment(String(this.userid), String(amount), String(ref.reference), String(ref.transaction), "BuyWarrantswithCash").subscribe(result => {
        loading.dismiss().catch(() => { });
        if (result === "success") {
          this.datalink.showToast("Your Payment was Successful. Check your Accounts/Messages for details");
          this.navCtrl.pop();
        } else {
          this.datalink.showToast("Something went wrong! Please try again!");
        }
      }, err => {
        loading.dismiss().catch(() => { });
        this.datalink.showNtwkErrorToast();
      });
    }
  }

  //Event triggered if User cancel the payment
  paymentCancel() {
    this.datalink.showToast("You cancelled the payment!");
  }

  onPay() {
   let  amount = this.BuyAtParForm.value.amount;
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
  paymentError(){

  }
  CalculatePercentage(userAmt) {
    let addedPerc = (parseInt(userAmt) * 0.02);
    let newAmt = parseInt(userAmt) + addedPerc;
    if (parseInt(userAmt) >= 2500) {
        newAmt = parseInt(userAmt) + 100;
    }
    return newAmt;
  }

  onPay2() {
   let  amount = this.BuyAtDoubleForm.value.amount2;
    console.log(amount);
    if (isNaN(amount) || "" === String(amount)) {
      this.datalink.showToast("Please Enter The Cash Amount");
    } else if (String(amount).length < 3) {
      this.datalink.showToast("Minimum amount is #100.00");
    } else {
      this.loadmsg2 = "Please Wait ...";
      this.amount2ToPay = this.CalculatePercentage(amount);
    }
  }

  ionViewDidLoad() {
    this.warrants = 'par';
  }

  BuyAtPar() {
    this.warrants = 'par';
  }

  BuyWithReflation() {
    this.warrants = 'reflation';
  }

  onExpectedAmount(newamount) {
    if (newamount) {
      if (String(newamount).length > 6) {
        this.datalink.showToast("Maximum amount is #999,999.00");
        return false;
      } else if (isNaN(newamount)) {
        this.datalink.showToast("Only Numbers are allowed");
        return false;
      } else {
        try {
          this.WarrantsAmt = newamount;
          // this.RRightsAmt = newamount;
          this.PCRightsAmt = newamount;
        } catch (e) { }
      }
    }

  }
  onExpectedAmount2(amount) {
    if (amount) {
      var newamount = amount.toString().replace(/,/g, "");
      if (newamount.trim().length > 6) {
        this.datalink.showToast("Maximum amount is #999,999.00");
        return false;
      } else if (isNaN(newamount)) {
        this.datalink.showToast("Only Numbers are allowed");
        return false;
      } else {
        try {
          this.WarrantsAmt2 = 2 * parseInt(newamount)
          // this.RRightsAmt2 = 2 * parseInt(newamount)
          this.PCRightsAmt2 = 2 * parseInt(newamount)
        } catch (e) { }
      }
    }
  }

}
