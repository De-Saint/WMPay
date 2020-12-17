import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-business-details',
  templateUrl: 'business-details.html',
})
export class BusinessDetailsPage {
  details: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.details = this.navParams.get("details");
  }

  ionViewDidLoad() {
    console.log(this.details);
  }

}
