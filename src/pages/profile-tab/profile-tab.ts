import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, Events } from 'ionic-angular';
import { ContactsPage } from '../contacts/contacts';
import { SuperTabs, SuperTabsController } from 'ionic2-super-tabs';
import { BusinessesPage } from '../businesses/businesses';
import { Storage } from '@ionic/storage';
import { StaffPage } from '../staff/staff';
import { Platform } from 'ionic-angular/platform/platform';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { HomeTabPage } from '../home-tab/home-tab';
import { HelpPage } from '../help/help';

@Component({
  selector: 'page-profile-tab',
  templateUrl: 'profile-tab.html',
})
export class ProfileTabPage {
  memberPages = [
    { pageName: ContactsPage, title: 'Contacts', icon: 'people', id: 'contactsTab' },
    { pageName: BusinessesPage, title: 'Businesses', icon: 'briefcase', id: 'businessesTab' }
    
  ];
  businessPages = [
    { pageName: ContactsPage, title: 'Contacts', icon: 'people', id: 'contactsTab' },
    { pageName: StaffPage, title: 'Staffs', icon: 'people', id: 'staffsTab' }
    
  ];
  UDetails: any;
  selectedTab = 0;
  usertype: any;
  originaldetail: any;
  details: any;
  pin: any;
  HAS_LOGGED_IN = 'hasLoggedIn';
  loggedInUserDetails: any;
  code: any;
  UserDetails: any;
  Username: any;
  userid: any;
  rootNavCtrl: NavController;
  @ViewChild(SuperTabs) superTabs: SuperTabs;
  constructor(public navCtrl: NavController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public datalink: DatalinkProvider,
    public events: Events,
    public dataservice: DataServiceProvider,
    public superTabsCtrl: SuperTabsController,
    public storage: Storage, public navParams: NavParams) {
      this.rootNavCtrl = this.navParams.get('rootNavCtrl');
  }

  ionViewDidLoad() {
   
  }
  ionViewWillEnter() {
    this.onCheckType();
    if (this.originaldetail == undefined) {
      this.getProfileDetails();
    } else {
      this.getProfileDetails();
    }
  }

  getProfileDetails() {
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
        } else {
          this.details = loggedInUserDetails[1];
          this.pin = this.details.transactionpin;
          this.originaldetail = loggedInUserDetails[1];
        }
      });
    });
  }

  onTabSelect(ev: any) {
    this.selectedTab = ev.index;
  }


  onCheckType() {
    this.platform.ready().then(() => {
      this.storage.ready().then(() => {
        this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
          if (loggedInUserDetails == null) {
            return false;
          } else {
            this.UDetails = loggedInUserDetails[1];
            this.usertype = this.UDetails.usertype;
            if (!this.usertype) {
              this.usertype = this.UDetails.type;
            }
          }
        });
      });
    });
  }

  EditProfile() {
    this.navCtrl.push(EditProfilePage, { details: this.details });
  }

  SwitchAccount() {
    let loading = this.loadingCtrl.create({
      content: "Switching Account..."
    });
    let confirm = this.alertCtrl.create({
      title: 'Switch',
      message: 'Do you want to switch to Personal Account?',
      buttons: [
        {
          text: 'No',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.ready().then(() => {
              this.storage.set('loggedInUserDetails', null);
            });
            this.storage.get('SwitchedID').then((SwitchedID) => {
              if (SwitchedID == null) {
                return false;
              } else {
                this.userid = SwitchedID;
                this.storage.set('SwitchedID', null);
                loading.present();
                this.datalink.SwitchTo(String(this.userid))
                  .subscribe(loggedInUserDetails => {
                    this.loggedInUserDetails = loggedInUserDetails;
                    this.code = loggedInUserDetails[0];
                    if (this.code !== "200") {
                      this.datalink.displayAlert("Error ", loggedInUserDetails[1]);
                      this.events.publish('user:logout');
                      loading.dismiss().catch(() => { });

                    } else {
                      this.storage.ready().then(() => {
                        this.storage.set(this.HAS_LOGGED_IN, true);
                      });
                      this.datalink.SetloggedInUserDetails(this.loggedInUserDetails);
                      this.UserDetails = loggedInUserDetails[1];
                      this.Username = this.UserDetails.user_name;
                      this.userid = this.UserDetails.userId;
                      this.datalink.showToast("Welcome Back " + this.Username);
                      this.dataservice.GetUserLoginDetails(this.UserDetails);
                      this.gotoHomePage(loading, this.userid);
                      this.events.publish('user:login', this.Username);
                    }
                  }, (err) => {
                    loading.dismiss().catch(() => { });
                    return false;
                  });
              }
            });
          }
        }
      ]
    });
    confirm.present();
  }

  gotoHomePage(loading, userid) {
    this.navCtrl.setRoot(HomeTabPage, { userid }).then(() => {
      // this.navCtrl.setRoot(CreateUserPinPage, { userid }).then(() => {
      this.storage.set('hasSeenLogin', true);
      loading.dismiss().catch(() => { });
      this.superTabsCtrl.slideTo(0);
      this.navCtrl.setRoot(this.navCtrl.getActive().component);
      window.location.reload();
    });
  }
  onHelp(){
    this.rootNavCtrl.push(HelpPage);
  }

}
