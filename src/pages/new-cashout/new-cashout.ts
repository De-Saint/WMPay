import { CashoutTabPage } from './../cashout-tab/cashout-tab';
import { DataServiceProvider } from './../../providers/data-service/data-service';
import { DatalinkProvider } from './../../providers/datalink/datalink';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-new-cashout',
  templateUrl: 'new-cashout.html',
})
export class NewCashoutPage {
  cashoutForm: FormGroup;
  TransactionPIN: any;
  UDetails: any;
  userid: any;
  DECIMAL_SEPARATOR = ".";
  GROUP_SEPARATOR = ",";
  rootNavCtrl: NavController;
  constructor(public navCtrl: NavController,
    public storage: Storage, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public datalink: DatalinkProvider,
    public dataservice: DataServiceProvider,
    public formBuilder: FormBuilder,
    public navParams: NavParams) {
    this.cashoutForm = this.formBuilder.group({
      amount: ["", Validators.compose([Validators.required])],
      pin: ["", Validators.compose([Validators.required])],
    });
    this.rootNavCtrl = this.navParams.get("rootNavCtrl");
  }

  onCashOut(form) {
    var pin = this.cashoutForm.value.pin;
    var amount = this.cashoutForm.value.amount;
    amount = amount.toString().replace(/,/g, "");
    if ("" === pin || 0 === pin || isNaN(pin) || null === pin) {
      this.datalink.showToast("Error please enter the correct pin");
      return false;
    } else if ("" === amount || void 0 === amount || isNaN(amount) || null === amount) {
      this.datalink.showToast("Error please enter the correct amount");
      return false;
    } else {
      if (form.valid) {
        this.onValidatePin(pin)
      }
    }
  }
  onValidatePin(pin) {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.TransactionPIN = loggedInUserDetails[2].TransactionPin;
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          if (this.TransactionPIN === pin) {
            this.onCashoutRequest(this.userid);
          } else {
            this.datalink.showToast("Invalid Pin, Please Check The Transaction Pin");
          }
        }
      });
    });
  }
  onCashoutRequest(userid) {
    var amount = this.cashoutForm.value.amount.toString().replace(/,/g, "");
    let loading = this.loadingCtrl.create({});
    const prompt = this.alertCtrl.create({
      title: "CashOut Request",
      message: "Do you wish to Cashout <span class=bold >" + this.dataservice.CurrencyFormat(amount) + "</span> from your Warrants Account?",
      buttons: [{
        text: "No",
        handler: () => {
          console.log("cancelled")
        }
      }, {
        text: "Yes",
        handler: () => {
          loading.present();
          this.datalink.CashOutRequest(String(userid), String(amount), String(1)).
            subscribe((result) => {
              loading.dismiss().catch(() => { });
              this.datalink.showToast(String(result));
              this.rootNavCtrl.pop();
              this.rootNavCtrl.push(CashoutTabPage);
            }, (error) => {
              loading.dismiss().catch(() => { });
              this.datalink.showToast("Error connecting to server!")
            })
        }
      }]
    })
    prompt.present()
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
}
