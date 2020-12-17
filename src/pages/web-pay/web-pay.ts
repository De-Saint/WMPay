import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Storage } from '@ionic/storage';
import { SuperTabsController } from 'ionic2-super-tabs';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { NewContactPage } from '../new-contact/new-contact';


@Component({
  selector: 'page-web-pay',
  templateUrl: 'web-pay.html',
})
export class WebPayPage {
  contacts: any;
  originalcontacts: any;
  ContactResult: any;
  Originalcontacts: any;
  usertype: any;
  slidePayForm: FormGroup;
  searchTerm: string = '';
  successmsg: String;
  userid: any;
  balance: any;
  UDetails: any;
  nocontact: any;
  Nocontact: any;
  TransactionPIN: any;
  result: any;
  originalresult: any;
  checkvalue: any;
  details: any;
  rootNavCtrl: NavController;
  DECIMAL_SEPARATOR = ".";
  GROUP_SEPARATOR = ",";
  ctact: string;
  constructor(
    public storage: Storage,
    public superTabsCtrl: SuperTabsController,
    public formBuilder: FormBuilder,
    public datalink: DatalinkProvider,
    public dataservice: DataServiceProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController, public navParams: NavParams) {
    this.slidePayForm = formBuilder.group({
      selectedcontactid: ['', Validators.required],
      amount: ['', Validators.required],
      narration: ['', Validators.required],
      selectedcontid: ['', Validators.required],
      accttype: ['', Validators.required],
      searchTerm: ['', Validators.required]
    });
    this.onGetContacts();
    this.checkvalue = this.navParams.get('fromhome');
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');
  }

  ionViewDidLoad() {
    this.details = this.navParams.get("details");
    if (this.details !== undefined) {
      this.slidePayForm.controls['searchTerm'].setValue(this.details.email);
      this.onSearch();
    }
    this.ctact = 'searchC';

  }
  searchCtact() {
    this.ctact = 'searchC';
  }
  selectCtact() {
    this.ctact = 'selectC';
  }

  onSearch() {
    let loading = this.loadingCtrl.create({
    });

    let searchvalue = this.slidePayForm.value.searchTerm;
    if (searchvalue === '') {
      this.datalink.showToast("Please enter the beneficiary name/ email/ phone/ account number");
    } else {
      if (searchvalue.length >= 3) {
        loading.present();
        this.datalink.GetSearchUserDetails(searchvalue, null).subscribe(contacts => {
          this.ContactResult = contacts
          console.log(this.ContactResult);
          loading.dismiss().catch(() => { });
        }, (err) => {
          loading.dismiss().catch(() => { });
          this.datalink.showNtwkErrorToast();
          return false;
        });
      }
    }
  }

  onSelect(selectedcontactID) {
    let loading = this.loadingCtrl.create({
    });
    if (selectedcontactID === "add") {
      this.rootNavCtrl.push(NewContactPage);
    } else {
      loading.present();
      this.datalink.GetSearchUserDetails("", selectedcontactID).subscribe(result => {
        this.ContactResult = result;
        console.log(this.ContactResult);
        loading.dismiss().catch(() => { });
      }, (err) => {
        loading.dismiss().catch(() => { });
        this.datalink.showNtwkErrorToast();
        return false;
      });
    }

  }

  onSelectAcct(acctypeid) {
    let loading = this.loadingCtrl.create({

    });
    loading.present();
    this.datalink.AcctTypeBalance(String(acctypeid), String(this.userid)).subscribe(balance => {
      this.balance = balance;
      console.log(this.balance);
      loading.dismiss().catch(() => { });
    }, (err) => {
      loading.dismiss().catch(() => { });
      this.datalink.showNtwkErrorToast();
      return false;
    });
  }

  onGetContacts() {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          this.usertype = this.UDetails.usertype;
          this.datalink.GetUserConnects(String(this.userid), this.usertype, "Contact").subscribe(contacts => {
            let code: any = contacts[0];
            if (code === "400") {
              this.nocontact = "nocontact";
              this.contacts = [];
            } else {
              this.nocontact = "contact";
              this.contacts = contacts[1];
              this.originalcontacts = contacts[1];
            }
          }, err => {
            this.datalink.showNtwkErrorToast();
          });
        }
      });
    });
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

  onCheckPin(form) {
    if (this.ContactResult === undefined) {
      this.datalink.showToast(" Please Search or Select a Benecifiary.");
    } else if (form.controls['accttype'].invalid) {
      this.datalink.showToast("Please Select Account To Transfer From.");
    } else if (form.controls['amount'].invalid) {
      this.datalink.showToast("Please enter the Transaction Amount.");
    } else {
      var amount = this.slidePayForm.value.amount;
      amount = amount.toString().replace(/,/g, "");
      amount = this.dataservice.CurrencyFormat(amount);
      const prompt = this.alertCtrl.create({
        title: 'Transfer',
        message: "Please enter your transaction pin to confirm the transfer of " + amount + " to " + this.ContactResult.BeneficiaryName,
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
            text: 'Transfer',
            handler: data => {
              this.onCheckTPIN(data.pin);
            }
          }
        ]
      });
      prompt.present();
    }

  }


  onCheckTPIN(pin) {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.TransactionPIN = loggedInUserDetails[2].TransactionPin;
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          if (this.TransactionPIN === pin) {
            this.onTransfer(this.userid, pin);
          } else {
            this.datalink.showToast("Invalid Pin, Please Check Your Transaction Pin");
          }
        }
      });
    });
  }


  onTransfer(userid, pin) {
    var beneficiaryID = 0;
    if (this.ContactResult.Beneficiaryid !== "") {
      beneficiaryID = this.ContactResult.Beneficiaryid;
    } else if (this.slidePayForm.value.selectedcontactid !== "" || this.slidePayForm.value.selectedcontactid !== undefined || this.slidePayForm.value.selectedcontactid !== null) {
      beneficiaryID = this.slidePayForm.value.selectedcontactid;
    }
    if (beneficiaryID !== 1) {
      let loading = this.loadingCtrl.create({
      });
      loading.present();
      var amount = this.slidePayForm.value.amount;
      amount = amount.toString().replace(/,/g, "");
      this.datalink.FundTransfer(
        String(userid),
        String(this.slidePayForm.value.accttype),
        String(beneficiaryID),
        String(amount),
        String(pin),
        this.slidePayForm.value.narration
      ).subscribe(successMsg => {
        loading.dismiss().catch(() => { });
        this.datalink.displayAlert("Transfer", successMsg);
        this.ionViewDidLoad();
        if (this.checkvalue) {
          this.navCtrl.pop();
        }
        this.superTabsCtrl.slideTo(3);
      }, (err) => {
        loading.dismiss().catch(() => { });
        this.datalink.showToast("Error connecting to server");
        return false;
      });
    }
  }

  onShowBal() {
    const prompt = this.alertCtrl.create({
      title: 'Account Balance',
      message: "Please enter your transaction pin to view your Account Balance",
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
          text: 'View Balance',
          handler: data => {
            this.onShowAccountBalance(data.pin);
          }
        }
      ]
    });
    prompt.present();
  }

  onShowAccountBalance(pin) {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.TransactionPIN = loggedInUserDetails[2].TransactionPin;
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          if (this.TransactionPIN === pin) {
            document.getElementById("bal").classList.remove("hide");
            document.getElementById("bal").classList.add("show");
            document.getElementById("view").classList.remove("show");
            document.getElementById("view").classList.add("hide");
          } else {
            this.datalink.showToast("Invalid Pin, Please Check Transaction Pin");
          }
        }
      });
    });
  }
  onAddContact() {
    this.rootNavCtrl.push(NewContactPage);
  }
}
