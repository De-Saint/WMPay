import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-message-details',
  templateUrl: 'message-details.html',
})
export class MessageDetailsPage {
  msg: any;
  msgid: any;
  ntwk: any;
  message: any;
  constructor(public datalink: DatalinkProvider, public loadingCtrl: LoadingController,
    public viewCtrl: ViewController, public alertCtrl: AlertController,
    public storage: Storage, public navCtrl: NavController, public navParams: NavParams) {
    this.msg = this.navParams.get('msg');
    this.ntwk = this.navParams.get('ntwk');
    console.log(this.msg);
    this.msgid = this.msg.id;
    // this.getMsgDetail(this.msgid)
  }

  ionViewDidLoad() {

  }
  onClose() {
    this.viewCtrl.dismiss();
  }

  resendMessage() {
    // let loading = this.loadingCtrl.create({
    // });
    // loading.present();
    return new Promise<any>((resolve, reject) => {
      // this.dataservice.getUserMessageDetails(this.outboxid)
      //   .then((data) => {
      //     let selectedcontactid = data.rows.item(0).to_member_id;
      //     let title = data.rows.item(0).subject;
      //     let body = data.rows.item(0).body;

      //     this.storage.ready().then(() => {
      //       this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
      //         if (loggedInUserDetails == null) {
      //         } else {
      //           this.UDetails = loggedInUserDetails[1];
      //           this.userid = this.UDetails.userId;
      //           this.datalink.SendMessage(this.userid, selectedcontactid, title, body)
      //             .subscribe(sentMsg => {
      //               loading.dismiss().catch(() => { });
      //               this.sentMsg = sentMsg
      //               this.datalink.displayAlert("Message", this.sentMsg);
      //               let msg = "sent";
      //               this.dataservice.deleteMessage(this.outboxid).then().catch();
      //               this.navCtrl.setRoot(MessagesPage, { msg });
      //             }, (err) => {
      //               loading.dismiss().catch(() => { });
      //               this.dataservice.showToast("Error connecting to server");
      //               return false;
      //             });
      //         }
      //       });
      //     });
      //     loading.dismiss().catch(() => { });
      //     resolve(this.outboxMsg);
      //   }, (err) => {
      //     alert("error " + JSON.stringify(err));
      //     reject(err);
      //     loading.dismiss().catch(() => { });
      //   });
      // loading.dismiss().catch(() => { });
    });

  }

  onDelete() {
    let loading = this.loadingCtrl.create({
    });
    let confirm = this.alertCtrl.create({
      title: 'Delete',
      message: 'Do you want to delete this message?',
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
            if (this.ntwk === "online") {
              this.datalink.deleteMessage(String(this.msgid)).subscribe(successMsg => {
                loading.dismiss().catch(() => { });
                this.datalink.displayAlert("Message", successMsg);
                this.navCtrl.pop();
              }, (err) => {
                loading.dismiss().catch(() => { });
                this.datalink.showToast("Error connecting to server");
                return false;
              });
            } else {
              // this.dataservice.deleteMessage(this.outboxid).then((data) => {
              //   loading.dismiss().catch(() => { });
              //   let msg = "outbox";
              //   this.navCtrl.setRoot(MessagesPage, { msg });
              // }).catch((err) => {
              //   loading.dismiss().catch(() => { });
              //   this.dataservice.showToast("Error, please try again");
              // })
            }
          }
        }
      ]
    });
    confirm.present();
  }
}
