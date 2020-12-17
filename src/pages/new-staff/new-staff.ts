import { Component } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-new-staff',
  templateUrl: 'new-staff.html',
})
export class NewStaffPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewStaffPage');
  }

}
