import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from './../../providers/datalink/datalink';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'page-added-banks',
  templateUrl: 'added-banks.html',
})
export class AddedBanksPage {
  userid: any;
  bkresult: any;
  UDetails: any;
  error: any;
  banks:any;
  addBankForm: FormGroup;
  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    public storage: Storage,
    public formBuilder: FormBuilder,
    public datalink: DatalinkProvider,
    private loadingCtrl: LoadingController, public navParams: NavParams) {
    this.GetUserBankAccount();
    this.addBankForm = this.formBuilder.group({
      bankNameID: ["", Validators.compose([Validators.required])],
      bankAcctType: ["", Validators.compose([Validators.required])],
      bankName: ["", Validators.compose([Validators.required])],
      bankAcctNumber: ["", Validators.compose([Validators.maxLength(30), Validators.required])],
      bankAcctBVN: ["", Validators.compose([Validators.required])]
    });
     this.getBanks();
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

  GetUserBankAccount() {
    let loading = this.loadingCtrl.create({
    });
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          loading.present();
          this.datalink.GetUserBankAccount(String(this.userid)).subscribe(result => {
            loading.dismiss().catch(() => { });
            console.log(result);
            if (result.BankName) {
              this.bkresult = result;
            } else {
              this.error = 'nobanks'
            }
          }, (err) => {
            loading.dismiss().catch(() => { });
            this.datalink.showNtwkErrorToast();
            return false;
          });
        }
      });
    });
  }

  DeleteBank(bankid) {
    let loading = this.loadingCtrl.create({
    });
    let confirm = this.alertCtrl.create({
      title: 'Bank',
      message: 'Do you want to remove this particular Bank Account? A Bank Account is needed for Cashing Out Market Warrants.',
      buttons: [
        {
          text: 'No',
          handler: () => {

          }
        },
        {
          text: 'Yes',
          handler: () => {
            loading.present();
            this.datalink.DeleteBankDetail(String(bankid)).subscribe(successmsg => {
              this.GetUserBankAccount();
              loading.dismiss().catch(() => { });
              this.datalink.displayAlert("Bank", successmsg);
              
            }, (err) => {
              loading.dismiss().catch(() => { });
              return false;
            });
          }
        }
      ]
    });
    confirm.present();
  }

  EditBank() {
    document.getElementById("addbnkform").classList.remove("hide")
    this.addBankForm.controls['bankNameID'].setValue(this.bkresult.bankId);
    this.addBankForm.controls['bankAcctType'].setValue(this.bkresult.accountType);
    this.addBankForm.controls['bankAcctNumber'].setValue(this.bkresult.accountNumber);
    this.addBankForm.controls['bankAcctBVN'].setValue(this.bkresult.bvnNumber);

  }

  onSave() {
    let loading = this.loadingCtrl.create({});
    if ("" === this.addBankForm.value.bankNameID || "" === this.addBankForm.value.bankAcctType || "" === this.addBankForm.value.bankAcctNumber) {
      this.datalink.showToast("Please fill all the inputs");
      return false;
    } else {
      this.addbank(loading);
    }
  }

addbank(loading){
  let confirm = this.alertCtrl.create({
    title: 'Bank',
    message: 'Update your Bank Account?',
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
                  this.addBankForm.value.bankAcctType, String(this.addBankForm.value.bankAcctNumber), String(this.addBankForm.value.bankAcctBVN), "Update", String(this.bkresult.id))
                  .subscribe((result) => {
                    this.GetUserBankAccount();
                    document.getElementById("addbnkform").classList.add("hide")
                    loading.dismiss().catch(() => { });
                    this.datalink.showToast(result);
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
