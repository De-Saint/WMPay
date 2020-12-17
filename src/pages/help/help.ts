import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';


@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
})
export class HelpPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private theInAppBrowser: InAppBrowser) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelpPage');
  }
  openwm(wmlink) {
    let options: InAppBrowserOptions = {
      location: 'yes',//Or 'no' 
      hidden: 'no', //Or  'yes'
      clearcache: 'yes',
      clearsessioncache: 'yes',
      zoom: 'yes',//Android only ,shows browser zoom controls 
      hardwareback: 'yes',
      mediaPlaybackRequiresUserAction: 'no',
      shouldPauseOnSuspend: 'no', //Android only 
      closebuttoncaption: 'Close', //iOS only
      disallowoverscroll: 'no', //iOS only 
      toolbar: 'yes', //iOS only 
      enableViewportScale: 'no', //iOS only 
      allowInlineMediaPlayback: 'no',//iOS only 
      presentationstyle: 'pagesheet',//iOS only 
      fullscreen: 'yes',//Windows only    
    };
    let target = "_blank";
    this.theInAppBrowser.create(wmlink, target, options);
  }
}
