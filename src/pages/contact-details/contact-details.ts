import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-contact-details',
  templateUrl: 'contact-details.html',
})
export class ContactDetailsPage {
details:any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  
  this.details = this.navParams.get("details");
  console.log(this.details)
  }

  ionViewDidLoad() {
    
  }

}
