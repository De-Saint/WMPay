import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { RegisterPage } from '../register/register';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {
  slides = [
    {
      title: "Welcome to the WMPay!",
      description: "The <b>WealthMarket Pay</b> is a mobile platform with useful payment methods for it's subscribers to make and receive payment.",
      image: "assets/imgs/wealth-2.png",
    },
    {
      title: "What is WM?",
      description: "The <b>WealthMarket</b> is a closed market for the trading of values and increase purchasing power anytime, using it's powerful market instrument (Market Warrants).",
      image: "assets/imgs/wealth-1.png",
    },
    // {
    //   title: "WM Pay Offline?",
    //   description: "The <b>Offline Pay</b> is an integrated and powerful tool for P2P transaction without the use of internet on a mobile device. Its met to scale WM Transactions to areas without internet coverage.",
    //   image: "assets/imgs/wealth-4.png",
    // }
];
  constructor(public storage: Storage, 
    public navCtrl: NavController, 
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    
  }

  onLogin(){
    this.navCtrl.push(LoginPage).then(() => {
      this.storage.ready().then(() => {
        this.storage.set('hasSeenWelcome', true);
      });
    });
  }

  onRegister(){
    this.navCtrl.push(RegisterPage);
  }
}
