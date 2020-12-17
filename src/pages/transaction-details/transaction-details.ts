import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-transaction-details',
  templateUrl: 'transaction-details.html',
})
export class TransactionDetailsPage {
  details: any;
  userid: any;
  entry: string;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.details = this.navParams.get('details');
    this.userid = this.navParams.get('userid');
  }

  ionViewDidLoad() {
    this.entry = 'debit';
  }


  CreditEntry() {
    this.entry = 'credit';
  }
  DebitEntry() {
    this.entry = 'debit';
  }
}
