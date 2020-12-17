import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { MessageDetailsPage } from '../message-details/message-details';

@Component({
  selector: 'page-sent-messages',
  templateUrl: 'sent-messages.html',
})
export class SentMessagesPage {
  userid: any;
  UDetails: any;
  msg: string;
  nosentmsg: any;
  sentmsgs: any;
  rootNavCtrl: NavController;
  originalsentmsgs: any;
  sentsearchTerm: string = '';
  loadingProgress: any;
  constructor(public datalink: DatalinkProvider,
    public modalCtrl: ModalController, public loadingCtrl: LoadingController, public storage: Storage, public navCtrl: NavController, public navParams: NavParams) {
    this.getSentMsg();
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');
  }

  ionViewDidLoad() {

  }

  getSentMsg() {
    let loading = this.loadingCtrl.create({
    });
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          loading.present();
          this.datalink.getsentMessages(String(this.userid)).subscribe(sentmsgs => {
            loading.dismiss().catch(() => { });
            console.log(sentmsgs);
            let code: any = sentmsgs[0];
            if (code === "400") {
              this.nosentmsg = "nosentmsg";
              this.sentmsgs = [];
            } else {
              this.nosentmsg = "sentmsg";
              this.sentmsgs = sentmsgs[1];
              this.originalsentmsgs = sentmsgs[1];
            }
          }, (err) => {
            loading.dismiss().catch(() => { });
            return false;
          });
        }
      });
    });
  }
  doRefresh(refresher){
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
            loading.present();
            this.datalink.getsentMessages(String(this.userid)).subscribe(sentmsgs => {
              loading.dismiss().catch(() => { });
              let code: any = sentmsgs[0];
              if (code === "400") {
                this.nosentmsg = "nosentmsg";
                this.sentmsgs = [];
                refresher.complete();
              } else {
                this.nosentmsg = "sentmsg";
                this.sentmsgs = sentmsgs[1];
                this.originalsentmsgs = sentmsgs[1];
                refresher.complete();
              }
            }, (err) => {
              refresher.complete();
              loading.dismiss().catch(() => { });
              return false;
            });
          }
        });
      });
    }
  }

  searchSentMessages() {
    let term = this.sentsearchTerm;
    if (term.trim() === '' || term.trim().length < 0) {
      if (this.sentmsgs.length === 0) {
        this.nosentmsg = "nosentmsg";
      } else {
        this.sentmsgs = this.originalsentmsgs;
        this.nosentmsg = "full";
      }
    } else {
      //to search an already popolated arraylist
      this.sentmsgs = [];
      if (this.originalsentmsgs) {
        this.sentmsgs = this.originalsentmsgs.filter((v) => {
          if (v.subject.toLocaleLowerCase().indexOf(term.toLowerCase()) > -1 || v.body.toLocaleLowerCase().indexOf(term.toLowerCase()) > -1) {
            this.nosentmsg = "full";
            return true;
          } else {
            if (this.sentmsgs.length === 0) {
              this.sentmsgs = [];
              this.nosentmsg = "nosentmsg";
            }
            return false;
          }
        });
      }
    }
  }
  onSentClear(ev) {
    this.sentsearchTerm = "";
    this.sentmsgs = this.originalsentmsgs;
  }
  onSentCancel(ev) {
    this.sentsearchTerm = "";
    this.sentmsgs = this.originalsentmsgs;
  }

  onMsgDetails(msg) {
    this.rootNavCtrl.push(MessageDetailsPage, { msg, ntwk: "online" });
  }
}
