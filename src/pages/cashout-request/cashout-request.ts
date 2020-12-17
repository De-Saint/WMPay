import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-cashout-request',
  templateUrl: 'cashout-request.html',
})
export class CashoutRequestPage {
  UDetails: any;
  userid: any;
  error: any;
  cashoutrequests: any;
  constructor(public datalink: DatalinkProvider,
    public storage: Storage,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController, public navParams: NavParams) {
    this.GetCashOutRequest();
  }

  GetCashOutRequest() {
   let loading = this.loadingCtrl.create({});
    this.storage.ready().then(() => {
      this.storage.get("loggedInUserDetails").then((loggedInUserDetails) => {
        if (null == loggedInUserDetails) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          loading.present();
          this.datalink.GetCashOutRequest(String(this.userid)).
            subscribe((result) => {
              console.log(result);
              loading.dismiss().catch(() => {});
              if ("200" === result[0]) {
                this.cashoutrequests = result[1];
                console.log(this.cashoutrequests);
                this.error = "Withdrawal";
              } else if ("400" === result[0]) {
                this.error = "No Withdrawal";
                this.cashoutrequests = [];
              }
            })
        }
      })
    })
  }
}
