import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, LoadingController, AlertController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { SuperTabsController } from 'ionic2-super-tabs';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';


@Component({
  selector: 'page-new-contact',
  templateUrl: 'new-contact.html',
})
export class NewContactPage {
  contacts: any;
  newcontacts: any;
  originalcontacts: any;
  searchTerm: string = '';
  nocontact: any;
  usertype: any;
  UDetails: any;
  userid: any;
  createdCode = null;
  scannedCode = null;
  constructor(public datalink: DatalinkProvider,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public superTabsCtrl: SuperTabsController,
    private barcodeScanner: BarcodeScanner,
    public storage: Storage, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.onGenerateCode();
  }
  searchContact() {
    let loading = this.loadingCtrl.create({
    });

    let searchvalue = this.searchTerm;
    if (searchvalue.trim() === '') {
      this.contacts = this.originalcontacts;
    } else {
      if (searchvalue.length >= 3) {
        loading.present();
        this.datalink.SearchContacts(searchvalue).subscribe(contacts => {
          let code = contacts[0];
          if (code === "400") {
            this.contacts = [];
            this.nocontact = "nocontact";
          } else {
            this.nocontact = "full";
            this.contacts = contacts[1];
            this.originalcontacts = contacts[1];
          }
          loading.dismiss().catch(() => { });
          console.log(contacts);
        }, (err) => {
          loading.dismiss().catch(() => { });
          this.datalink.showNtwkErrorToast();
          return false;
        });
      }
    }
  }
  onClear(ev) {
    this.searchTerm = "";
    this.searchContact();
  }
  onCancel(ev) {
    this.searchTerm = "";
    this.searchContact();
  }


  goToDetails(userid, username) {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Contact Option',
      buttons: [
        {
          text: "Add Contact",
          handler: () => {
            this.addContact(userid, username);
          }
        },
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });

    actionSheet.present();

  }



  addContact(benid, benname) {
    let loading = this.loadingCtrl.create({

    });
    let confirm = this.alertCtrl.create({
      title: 'Contact',
      message: 'Do you want to add <span class=' + "bold" + ' > ' + benname + '</span> to your contact list?',
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
            loading.present();
            this.storage.ready().then(() => {
              this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
                if (loggedInUserDetails == null) {
                } else {
                  this.UDetails = loggedInUserDetails[1];
                  this.userid = this.UDetails.userId;
                  this.usertype = this.UDetails.usertype;
                  this.datalink.addContact(String(this.userid), String(benid), this.usertype, "Contact")
                  .subscribe(successmsg => {
                    loading.dismiss().catch(() => { });
                    this.datalink.displayAlert("Contact", successmsg);
                    this.navCtrl.pop();
                    this.superTabsCtrl.slideTo(2);
                  }, (err) => {
                    loading.dismiss().catch(() => { });
                    this.datalink.showNtwkErrorToast();
                    return false;
                  });
                }
              });
            });
          }
        }
      ]
    });
    confirm.present();
  }



  onScanUserCode() {
    this.barcodeScanner.scan().then(barcodeData => {
      this.scannedCode = barcodeData.text;
      this.onDecodeScannedCode(this.scannedCode);
    }, (err) => {
      console.log('Error: ' + err);
    });
  }

  onDecodeScannedCode(scannedCode) {
    let userid = scannedCode.split(":")[0];
    let username = scannedCode.split(":")[1];
    this.goToDetails(userid, username);
  }

  onGenerateCode() {
    this.platform.ready().then(() => {
      this.storage.ready().then(() => {
        this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
          if (loggedInUserDetails == null) {
          } else {
            this.UDetails = loggedInUserDetails[1];
            console.log(this.UDetails);
            let userid = this.UDetails.userId;
            let username = this.UDetails.user_name;
            this.createdCode = userid + ":" + username;
          }
        });
      });
    });
  }
}
