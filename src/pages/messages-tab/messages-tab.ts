import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SuperTabs } from 'ionic2-super-tabs';
import { InboxMessagesPage } from '../inbox-messages/inbox-messages';
import { SentMessagesPage } from '../sent-messages/sent-messages';
// import { OutBoxMessagesPage } from '../out-box-messages/out-box-messages';
import { NewMessagePage } from '../new-message/new-message';


@Component({
  selector: 'page-messages-tab',
  templateUrl: 'messages-tab.html',
})
export class MessagesTabPage {
  pages = [
    { pageName: InboxMessagesPage, title: 'Inbox', icon: 'mail', id: 'inboxMessagesTab' },
    { pageName: SentMessagesPage, title: 'Sent', icon: 'mail-open', id: 'sentMessagesTab' }
    // { pageName: OutBoxMessagesPage, title: 'OutBox', icon: 'mail', id: 'outboxMessagesTab' }
  ];

  selectedTab = 0;
  userid: any;
  rootNavCtrl: NavController;
  @ViewChild(SuperTabs) superTabs: SuperTabs;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');
  }

  ionViewDidLoad() {
   
  }

  onTabSelect(ev: any) {
    this.selectedTab = ev.index;
  }
  NewMessage() {
    this.rootNavCtrl.push(NewMessagePage);
  }
}
