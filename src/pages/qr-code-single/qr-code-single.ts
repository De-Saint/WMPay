import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Platform } from 'ionic-angular/platform/platform';
import { SuperTabsController } from 'ionic2-super-tabs';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { DataServiceProvider } from '../../providers/data-service/data-service';

@Component({
  selector: 'page-qr-code-single',
  templateUrl: 'qr-code-single.html',
})
export class QrCodeSinglePage {
  usertype: any;
  UDetails: any;
  userid: any;
  createdCode = null;
  scannedCode = null;
  TransactionPIN: any;
  constructor(public datalink: DatalinkProvider,
    public actionSheetCtrl: ActionSheetController,
    public dataservice: DataServiceProvider,
    public alertCtrl: AlertController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public superTabsCtrl: SuperTabsController,
    public barcodeScanner: BarcodeScanner,
    public storage: Storage, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    // this.onLoadInstruction();
  }

  onLoadInstruction() {
    const confirm = this.alertCtrl.create({
      title: 'Instruction',
      message: '<span class=' + "bold" + ' >To Accept Payment:</span> <br/> Present your generated code to the payer for scanning. <br/> <span class=' + "bold" + ' >To Make payment:</span>  <br/> Scan the Beneficiary' + "'" + 's code and fill the input fields.',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Ok!',
          handler: () => {
            console.log("done");
          }
        }
      ]
    });
    confirm.present();
  }

  onGenerateCode() {
    const prompt = this.alertCtrl.create({
      title: 'Invoice Amount',
      message: 'Please enter the Transaction Amount to Generate Invoice',
      inputs: [
        {
          name: 'amount',
          placeholder: 'Transaction Amount'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Generate',
          handler: data => {
            this.platform.ready().then(() => {
              this.storage.ready().then(() => {
                this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
                  if (loggedInUserDetails == null) {
                  } else {
                    this.UDetails = loggedInUserDetails[1];
                    console.log(this.UDetails);
                    let userid = this.UDetails.userId;
                    let username = this.UDetails.user_name;
                    let amount = data.amount;
                    this.createdCode = userid + ":" + username + ":" + amount;
                  }
                });
              });
            });
          }
        }
      ]
    });
    prompt.present();

  }




  onScanUserCode() {
    let options = {
      saveHistory: 0,
      resultDisplayDuration: 0,
      prompt: "Place the barcode inside the scan area to Scan details"
    }
    this.barcodeScanner.scan(options).then(barcodeData => {
      this.scannedCode = barcodeData.text;
      this.onDecodeScannedCode(this.scannedCode);
    }, (err) => {
      console.log('Error: ' + err);
    });
  }

  onDecodeScannedCode(scannedCode) {
    let userid = scannedCode.split(":")[0];
    let username = scannedCode.split(":")[1];
    let amount = scannedCode.split(":")[2];
    this.goToDetails(username, userid, amount);
  }

  goToDetails(benName, benID, amount) {
    let amt = this.dataservice.CurrencyFormat(amount);
    const prompt = this.alertCtrl.create({
      title: 'Transfer',
      message: 'Please Enter The Transaction Pin to Transfer the sum of ' + amt + ' to <span class=' + "bold" + ' > ' + benName + '</span>',
      inputs: [
        {
          name: 'pin',
          placeholder: 'Transaction Pin',
          type: 'password'
        },
        {
          name: 'narration',
          placeholder: 'Narration/Comment'
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
            this.onCheckTPIN(data.pin, amount, data.narration, benID);
          }
        }
      ]
    });
    prompt.present();

  }

  onCheckTPIN(pin, amount, narration, benid) {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.TransactionPIN = loggedInUserDetails[2].TransactionPin;
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          if (this.TransactionPIN === pin) {
            this.onTransfer(this.userid, pin, amount, narration, benid);
          } else {
            this.datalink.showToast("Invalid Pin, Please Check Transaction Pin");
          }
        }
      });
    });
  }

  onTransfer(userid, pin, amount, narration, benid) {
    let loading = this.loadingCtrl.create({
    });
    loading.present();
    this.datalink.FundTransfer(String(userid), String(1), String(benid),
      String(amount), String(pin), String(narration)
    ).subscribe(successMsg => {
      loading.dismiss().catch(() => { });
      this.datalink.displayAlert("Transfer", successMsg);
      this.navCtrl.pop();
      this.superTabsCtrl.slideTo(3);
    }, (err) => {
      loading.dismiss().catch(() => { });
      this.datalink.showNtwkErrorToast();
      return false;
    });

  }

}
