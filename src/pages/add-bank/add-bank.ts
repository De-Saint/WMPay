import { BankTabPage } from './../bank-tab/bank-tab';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Storage } from '@ionic/storage';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'page-add-bank',
  templateUrl: 'add-bank.html',
})
export class AddBankPage {
  addBankForm: FormGroup;
  banks: any;
  UDetails: any;
  userid: any;
  rootNavCtrl: NavController;
  constructor(public navCtrl: NavController,
    public datalink: DatalinkProvider,
    public storage: Storage,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder,
    public navParams: NavParams) {
    this.addBankForm = this.formBuilder.group({
      bankNameID: ["", Validators.compose([Validators.required])],
      bankAcctType: ["", Validators.compose([Validators.required])],
      bankAcctNumber: ["", Validators.compose([Validators.maxLength(30), Validators.required])],
      bankAcctBVN: ["", Validators.compose([Validators.required])]
    });
    this.getBanks();
    this.rootNavCtrl = this.navParams.get("rootNavCtrl");
  }

  ionViewDidLoad() {

  }
  getBanks() {
    let loading = this.loadingCtrl.create({
    });
    loading.present();
    this.datalink.GetBanks().subscribe((result) => {
      this.banks = result;
      console.log(this.banks),
        loading.dismiss().catch(() => { })
    }, (u) => {
      loading.dismiss().catch(() => { });
      this.datalink.showNtwkErrorToast()
    })
  }

  onAddBank() {
    let loading = this.loadingCtrl.create({});
    if ("" === this.addBankForm.value.bankNameID || "" === this.addBankForm.value.bankAcctType || "" === this.addBankForm.value.bankAcctNumber) {
      this.datalink.showToast("Please fill all the inputs");
      return false;
    } else {
      this.addbank(loading);
    }
  }

  addbank(loading) {
    let confirm = this.alertCtrl.create({
      title: 'Bank',
      message: 'Add your Bank Account?',
      buttons: [
        {
          text: 'No',
          handler: () => {

          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.ready().then(() => {
              this.storage.get("loggedInUserDetails").then((loggedInUserDetails) => {
                if (null == loggedInUserDetails) {
                  return false;
                } else {
                  this.UDetails = loggedInUserDetails[1];
                  this.userid = this.UDetails.userId;
                  loading.present();
                  this.datalink.AddBankDetails(String(this.userid), String(this.addBankForm.value.bankNameID),
                    this.addBankForm.value.bankAcctType, String(this.addBankForm.value.bankAcctNumber), String(this.addBankForm.value.bankAcctBVN), "Add", 0)
                    .subscribe((result) => {
                      loading.dismiss().catch(() => { });
                      this.datalink.showToast(result);
                      this.rootNavCtrl.pop();
                      this.rootNavCtrl.push(BankTabPage);
                    }, err => {
                      loading.dismiss().catch(() => { }),
                        this.datalink.showNtwkErrorToast();
                      return false;
                    });
                }

              })
            })
          }
        }
      ]
    });
    confirm.present();
  }

}
