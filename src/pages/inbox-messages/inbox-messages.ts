import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController, Platform } from 'ionic-angular';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Storage } from '@ionic/storage';
import { MessageDetailsPage } from '../message-details/message-details';


@Component({
  selector: 'page-inbox-messages',
  templateUrl: 'inbox-messages.html',
})
export class InboxMessagesPage {
  userid: any;
  UDetails: any;
  noinboxmsg: any;
  inboxmsgs: any;
  loadingProgress: any;
  rootNavCtrl: NavController;
  originalinboxmsgs: any;
  inboxsearchTerm: string = '';
  constructor(public storage: Storage,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public datalink: DatalinkProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.getInboxMsg();
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');
  }

  ionViewDidLoad() {

  }
  
  getInboxMsg() {
    let loading = this.loadingCtrl.create({
    });
    this.platform.ready().then(() => {
      this.storage.ready().then(() => {
        this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
          if (loggedInUserDetails == null) {
            return false;
          } else {
            this.UDetails = loggedInUserDetails[1];
            this.userid = this.UDetails.userId;
            loading.present();
            this.datalink.getinboxMessages(String(this.userid)).subscribe(inboxmsgs => {
              loading.dismiss().catch(() => { });
              let code: any = inboxmsgs[0];
              if (code === "400") {
                this.noinboxmsg = "noinboxmsg";
                this.inboxmsgs = [];
                let error: any = inboxmsgs[1];
                this.datalink.showToast(error);
              } else {
                this.noinboxmsg = "inboxmsg";
                this.inboxmsgs = inboxmsgs[1];
                this.originalinboxmsgs = inboxmsgs[1];
               
              }
            }, (err) => {
              loading.dismiss().catch(() => { });
              this.datalink.showToast("Error getting your messages, no connection.");
              return false;
            });
          }
        });
      });
    })
  }

  
  doRefresh(refresher) {
    if (this.loadingProgress != 1) {
      let loading = this.loadingCtrl.create({
      });
      this.loadingProgress = 1;
      this.storage.ready().then(() => {
        this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
          if (loggedInUserDetails == null) {
            return false;
          } else {
            this.UDetails = loggedInUserDetails[1];
            this.userid = this.UDetails.userId;
            loading.present(); refresher.complete();
            this.datalink.getinboxMessages(String(this.userid)).subscribe(inboxmsgs => {
              loading.dismiss().catch(() => { });
              let code: any = inboxmsgs[0];
              if (code === "400") {
                this.noinboxmsg = "noinboxmsg";
                this.inboxmsgs = [];
                let error: any = inboxmsgs[1];
                this.datalink.showToast(error);
                refresher.complete();
              } else {
                this.noinboxmsg = "inboxmsg";
                this.inboxmsgs = inboxmsgs[1];
                this.originalinboxmsgs = inboxmsgs[1];
                console.log(this.inboxmsgs);
                refresher.complete();
              }
            }, (err) => {
              loading.dismiss().catch(() => { });
              refresher.complete();
              this.datalink.showToast("Error connecting to server");
              return false;
            });
          }
        });
      });
    }
  }


  searchInboxMessages() {
    let term = this.inboxsearchTerm;
    if (term.trim() === '' || term.trim().length < 0) {
      if (this.inboxmsgs.length === 0) {
        this.noinboxmsg = "noinboxmsg";
      } else {
        this.noinboxmsg = "full";
        this.inboxmsgs = this.originalinboxmsgs;
      }
    } else {
      //to search an already popolated arraylist
      this.inboxmsgs = [];
      if (this.originalinboxmsgs) {
        this.inboxmsgs = this.originalinboxmsgs.filter((v) => {
          if (v.subject.toLocaleLowerCase().indexOf(term.toLowerCase()) > -1 || v.body.toLocaleLowerCase().indexOf(term.toLowerCase()) > -1) {
            this.noinboxmsg = "full";
            return true;
          } else {
            if (this.inboxmsgs.length === 0) {
              this.inboxmsgs = [];
              this.noinboxmsg = "noinboxmsg";
            }
            return false;
          }
        });
      }
    }
  }

  
  onMsgDetails(msgid, msg) {
    this.MarkAsRead(msgid);
    this.rootNavCtrl.push(MessageDetailsPage, { msg, ntwk: "online" });
  }

  MarkAsRead(inboxid) {
    this.datalink.MarkAsRead(inboxid).subscribe();
  }
  onInboxClear($event){
    this.inboxmsgs = [];
  }
  onInboxCancel($event){
    this.inboxmsgs = [];
  }
}
