import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ActionSheetController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { ContactDetailsPage } from '../contact-details/contact-details';
import { NewMessagePage } from '../new-message/new-message';
import { WebPayPage } from '../web-pay/web-pay';
import { NewContactPage } from '../new-contact/new-contact';
import { BusinessDetailsPage } from '../business-details/business-details';

@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html',
})
export class ContactsPage {
  contacts:any;
  originalcontacts: any;
  searchTerm: string = '';
  rootNavCtrl: NavController;
  userid: any;
  usertype: any;
  UDetails: any;
  loadProgress: any;
  loadingProgress: any;
  nocontact: any;
  constructor(public navCtrl: NavController,
    public datalink: DatalinkProvider,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public storage: Storage, public loadingCtrl: LoadingController,
    public navParams: NavParams) {
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');

  }

  ionViewWillLoad() {
    this.getContacts();
  }
  getContacts() {
    let loading = this.loadingCtrl.create({
    });
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          this.usertype = this.UDetails.usertype;
          loading.present();
          this.datalink.GetUserConnects(String(this.userid), this.usertype, "Contact").subscribe(contacts => {
            loading.dismiss().catch(() => { });
            let code: any = contacts[0];
            if (code === "400") {
              this.nocontact = "nocontact";
              this.contacts = [];
            } else {
              this.nocontact = "contact";
              this.contacts = contacts[1];
              this.originalcontacts = contacts[1];

            }
            console.log(contacts);
          }, (err) => {
            loading.dismiss().catch(() => { });
            this.datalink.showNtwkErrorToast();
            return false;
          });
        }
      });
    });
  }
  searchContact() {
    let term = this.searchTerm;
    if (term.trim() === '' || term.trim().length < 0) {
      this.nocontact = "full";
      if (this.contacts.length === 0) {
        this.nocontact = "nocontact";
      } else {
        this.contacts = this.originalcontacts;
        this.nocontact = "full";
      }
    } else {
      //to search an already popolated arraylist
      this.contacts = [];
      if (this.originalcontacts) {
        this.contacts = this.originalcontacts.filter((v) => {
          if (v.last_name.toLocaleLowerCase().indexOf(term.toLowerCase()) > -1 || v.first_name.toLocaleLowerCase().indexOf(term.toLowerCase()) > -1 || v.Name.toLocaleLowerCase().indexOf(term.toLowerCase()) > -1) {
            this.nocontact = "full";
            return true;
          } else {
            if (this.contacts.length === 0) {
              this.contacts = [];
              this.nocontact = "nocontact";
            }
            return false;
          }
        });
      }

    }
  }

  doRefresh(refresher) {
    if (this.loadingProgress != 1) {
      this.loadingProgress = 1;
      this.datalink.GetUserConnects(String(this.userid), this.usertype, "Contact").subscribe(contacts => {
        let code: any = contacts[0];
        if (code === "400") {
          this.nocontact = "nocontact";
          this.contacts = [];
          refresher.complete();
        } else {
          this.nocontact = "contact";
          this.contacts = contacts[1];
          this.originalcontacts = contacts[1];
          refresher.complete();
        }
        this.loadingProgress = 0;
      }, (err) => {
        refresher.complete();
        this.datalink.showNtwkErrorToast();
        return false;
      });
    }
  }


  goToDetails(contact) {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Contact Options',
      buttons: [
        {
          text: "View Contact",
          handler: () => {
            if(contact.usertype === "Business"){
              this.rootNavCtrl.push(BusinessDetailsPage, { details: contact });
            }else{
              this.rootNavCtrl.push(ContactDetailsPage, { details: contact });
            }
          }
        },
        {
          text: "Send a Message",
          handler: () => {
            this.rootNavCtrl.push(NewMessagePage, { details: contact });
          }
        },
        {
          text: "Quick Transfer",
          handler: () => {
            this.rootNavCtrl.push(WebPayPage, { details: contact, fromhome: "fromhome" });
          }
        },
        {
          text: "Remove Contact",
          handler: () => {
            this.onDeleteContact(contact);
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
  onClear(ev) {
    this.searchTerm = "";
    this.nocontact = "contact";
    this.contacts = this.originalcontacts;
  }
  onCancel(ev) {
    this.searchTerm = "";
    this.nocontact = "contact";
    this.contacts = this.originalcontacts;
  }


  onDeleteContact(contact) {
    let loading = this.loadingCtrl.create({
    });
    let confirm = this.alertCtrl.create({
      title: 'Contact',
      message: 'Do you want to remove ' + contact.user_name + ' from your contact list?',
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
            this.storage.ready().then(() => {
              this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
                if (loggedInUserDetails == null) {
                  loading.dismiss().catch(() => { });
                } else {
                  this.UDetails = loggedInUserDetails[1];
                  this.userid = this.UDetails.userId;
                  this.datalink.deleteContact(String(this.userid), String(contact.userId), this.usertype, "Contact").subscribe(successmsg => {
                    loading.dismiss().catch(() => { });
                    this.datalink.displayAlert("Contact", successmsg);
                    this.getContacts();
                  }, (err) => {
                    loading.dismiss().catch(() => { });
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

  NewContact() {
    this.rootNavCtrl.push(NewContactPage);
  }
}
