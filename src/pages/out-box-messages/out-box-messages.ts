import { Component } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-out-box-messages',
  templateUrl: 'out-box-messages.html',
})
export class OutBoxMessagesPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OutBoxMessagesPage');
  }

}
