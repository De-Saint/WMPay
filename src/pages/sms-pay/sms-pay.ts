import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Platform } from 'ionic-angular';
import { SMS } from '@ionic-native/sms';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Contacts, Contact } from '@ionic-native/contacts';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { AndroidPermissions } from '@ionic-native/android-permissions';
@Component({
  selector: 'page-sms-pay',
  templateUrl: 'sms-pay.html',
})
export class SmsPayPage {
  smsForm: FormGroup;
  testRadioOpen: boolean;
  testRadioResult;
  DECIMAL_SEPARATOR = ".";
  GROUP_SEPARATOR = ",";
  wmSMSNumber: any;
  wmSMSCharges: any;
  UDetails: any;
  userid: any;
  TransactionPIN: any;
  amt: any;
  constructor(public sms: SMS,
    public contacts: Contacts,
    public formBuilder: FormBuilder,
    public datalink: DatalinkProvider,
    private dataservice: DataServiceProvider,
    private androidPermissions: AndroidPermissions,
    public alertCtrl: AlertController, public platform: Platform,
    public loadingCtrl: LoadingController, public storage: Storage,
    public navCtrl: NavController, public navParams: NavParams) {
    this.smsForm = formBuilder.group({
      phone: ['', Validators.required],
      amount: ['', Validators.required],
      pin: ['', Validators.required],
      narration: ['']
    });
  }

  ionViewWillEnter() {
    this.datalink.GetSMSNumberAndCharges()
      .subscribe(res => {
        console.log(res);
        this.wmSMSNumber = String(res).split(":")[0];
        this.wmSMSCharges = String(res).split(":")[1];
      })
  }
  onSMSTransfer(form) {
    let pin = this.smsForm.value.pin
    let amount = this.smsForm.value.amount;
    let phone = this.smsForm.value.phone;
    amount = amount.toString().replace(/,/g, "");
    if (phone === "" || phone === undefined || phone === null) {
      this.datalink.showToast("Please Enter or Select a WealthMarket User's Phone Number From Your Contact List");
      return false;
    } else if (amount === "" || amount === undefined || isNaN(amount) || amount === null) {
      this.datalink.showToast("Please enter a valid Transaction Amount");
      return false;
    } else if (pin === "" || pin === undefined || isNaN(pin) || pin === null) {
      this.datalink.showToast("Please enter a valid Transaction PIN.");
    }
    if (form.valid) {
      this.onValidatePin();
    }
  }

  onValidatePin() {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.TransactionPIN = loggedInUserDetails[2].TransactionPin;
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          if (this.TransactionPIN === this.smsForm.value.pin) {
            this.onSMSPayment();
          } else {
            this.datalink.showToast("Invalid Pin, Please Check The Transaction Pin");
          }
        }
      });
    });

  }


  onSMSPayment() {
    let narration = "";
    let amt = this.amt.toString().replace(/,/g, "")
    amt = this.dataservice.CurrencyFormat(amt);
    if (this.smsForm.value.narration === "") {
      narration = "The-WM-SMS-Payment";
    } else {
      let nar = this.smsForm.value.narration;
      narration = nar.toString().replace(/ /g, "-");
    }
    let msg = "pay " + this.smsForm.value.phone + " " + this.smsForm.value.amount + " " + narration;
    let loading = this.loadingCtrl.create({
    });
    let chargesAmount = this.dataservice.CurrencyFormat(this.wmSMSCharges);
    let confirm = this.alertCtrl.create({
      title: 'Transfer',
      message: 'The WealthMarket will charge you the sum of <span class=' + "bold" + ' >' + chargesAmount + '</span> Per SMS Transaction. Do You wish To Transfer <span class=' + "bold" + ' >' + amt + '</span> To <span class=' + "bold" + ' >' + this.smsForm.value.phone + '</span>?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log("cancelled");
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.sendMessage(loading, msg)
          }
        }
      ]
    });
    confirm.present();
  }

  sendMessage(loading, msg) {
    loading.present();
    this.platform.ready().then(() => {
      var option = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
        android: {
          intent: 'INTENT'  // Opens Default sms app
          // intent: '' // Sends sms without opening default sms app
        }
      }
      if (this.platform.is('cordova')) {
        this.sms.send(this.wmSMSNumber, msg, option).then((result) => {
          // alert(JSON.stringify(result));
          this.datalink.showToast("Text message sent successfully!");
          loading.dismiss().catch(() => { });
        }, (error) => {
          loading.dismiss().catch(() => { });
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS).
            then((success) => {
              this.sendMessage(loading, msg);
            },
              (err) => {
              });
          this.datalink.showToast("Text message was not sent! If the message persists, please contact The WealthMarket Mobile Service Support");
        });
      } else {
        this.datalink.showToast("Use a device to send the sms! ");
      }

    });
  }

  format(valString) {
    if (!valString) {
      return '';
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
    this.amt = parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, this.GROUP_SEPARATOR)
    return this.amt;
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

  onGetPhoneContact() {
    this.platform.ready().then(() => {
      this.contacts.pickContact()
        .then((response: Contact) => {
          let phone = response.phoneNumbers[0].value;
          phone = phone.toString().replace(/\s/g, "");
          this.smsForm.controls['phone'].setValue(phone);
        });
    })
  }


  onSMSCheckBalance() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Select Account to check the bal...');
    alert.addInput({
      type: 'radio',
      label: 'Warrants',
      value: 'w'
    });
    alert.addInput({
      type: 'radio',
      label: 'Reflation Rights',
      value: 'r'
    });
    alert.addInput({
      type: 'radio',
      label: 'Par Cash Right',
      value: 'p'
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.testRadioOpen = false;
        this.testRadioResult = data;
        this.onCheckBalance(this.testRadioResult);
      }
    });
    alert.present();
  }

  onCheckBalance(type) {
    let msg;
    if (type === "p") {
      msg = "Par Cash Right";
    } else if (type === "w") {
      msg = "Warrants";
    } else if (type === "r") {
      msg = "Reflation Rights";
    } else if (type === "" || type == undefined || type === "undefined") {
      this.datalink.showToast("Please select an account.");
      return false;
    }
    let loading = this.loadingCtrl.create({
    });
    let confirm = this.alertCtrl.create({
      title: 'Check Account Balance',
      message: 'Do You Want To Check your ' + msg + ' account balance?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log("cancelled");
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.sendMessage(loading, type);
          }
        }
      ]
    });
    confirm.present();
  }
}


