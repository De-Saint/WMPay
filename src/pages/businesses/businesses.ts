import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ActionSheetController, AlertController, Events, Nav } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { BusinessDetailsPage } from '../business-details/business-details';
import { SuperTabsController } from 'ionic2-super-tabs';
import { IonicApp } from 'ionic-angular/components/app/app-root';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { NewBusinessPage } from '../new-business/new-business';
import { CreateUserPinPage } from '../create-user-pin/create-user-pin';


@Component({
  selector: 'page-businesses',
  templateUrl: 'businesses.html',
})
export class BusinessesPage {
  businesses: any;
  originalbusinesses: any;
  totalbusinesses: any;
  userid: any;
  nobusiness1: any;
  usertype: any;
  UDetails: any;
  nobusiness: any;
  rootNavCtrl: NavController;
  searchTerm: string = '';
  loadProgress: any;
  loadingProgress: any;
  HAS_LOGGED_IN = 'hasLoggedIn';
  loggedInUserDetails: any;
  username: string;
  check: any;
  code: any;

  UserDetails: any;
  Username: any;
  constructor(public datalink: DatalinkProvider,
    public storage: Storage,
    public events: Events,
    public app: IonicApp,
    public nav: Nav,
    public dataservice: DataServiceProvider,
    public superTabsCtrl: SuperTabsController,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController, public navParams: NavParams) {
    this.rootNavCtrl = this.navParams.get('rootNavCtrl');
  }

  ionViewDidLoad() {
    this.getBusinesses();
  }
  getBusinesses() {
    let loading = this.loadingCtrl.create({

    });
    this.storage.ready().then(() => {
      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
        if (loggedInUserDetails == null) {
          return false;
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          loading.present();
          this.datalink.GetUserConnects(String(this.userid), "Member", "Business").subscribe(businesses => {
            loading.dismiss().catch(() => { });
            let code: any = businesses[0];
            if (code != 200) {
              this.nobusiness = "nobusiness";
              this.businesses = [];
            } else {
              this.nobusiness = "business";
              this.businesses = businesses[1];
              this.originalbusinesses = businesses[1];
            }
            console.log(businesses);
          }, (err) => {
            loading.dismiss().catch(() => { });
            this.datalink.showNtwkErrorToast();
            return false;
          });
        }

      });
    });
  }

  searchBusiness() {
    let term = this.searchTerm;
    if (term.trim() === '' || term.trim().length < 0) {
      this.nobusiness = "full";
      if (this.businesses.length === 0) {
        this.nobusiness = "nobusiness";
      } else {
        this.businesses = this.originalbusinesses;
        this.nobusiness = "full";
      }
    } else {
      //to search an already popolated arraylist
      this.businesses = [];
      if (this.originalbusinesses) {
        this.businesses = this.originalbusinesses.filter((v) => {
          if (v.Name.toLocaleLowerCase().indexOf(term.toLowerCase()) > -1) {
            this.nobusiness = "full";
            return true;
          } else {
            if (this.businesses.length === 0) {
              this.businesses = [];
              this.nobusiness = "nobusiness";
            }
            return false;
          }
        });
      }

    }
  }

  doRefresh(refresher) {
    if (this.loadingProgress != 1) {
      this.loadingProgress = 1;
      this.datalink.GetUserConnects(String(this.userid), "Member", "Business").subscribe(businesses => {
        let code: any = businesses[0];
        if (code === "400") {
          this.nobusiness = "nobusiness";
          this.nobusiness = [];
          refresher.complete();
        } else {
          this.nobusiness = "business";
          this.businesses = businesses[1];
          this.originalbusinesses = businesses[1];
          refresher.complete();
        }
        this.loadingProgress = 0;
      }, (err) => {
        refresher.complete();
        this.datalink.showNtwkErrorToast();
        return false;
      });
    }
  }
  goToDetails(business) {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Business Options',
      buttons: [
        {
          text: "View Business",
          handler: () => {
            this.rootNavCtrl.push(BusinessDetailsPage, { details: business });
          }
        },
        // {
        //   text: "Switch To " + business.user_name,
        //   handler: () => {
        //     this.onSwitchToBusiness(business)
        //   }
        // },
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });

    actionSheet.present();

  }

  onClear(ev) {
    this.searchTerm = "";
    this.nobusiness = "business";
    this.businesses = this.originalbusinesses;
  }
  onCancel(ev) {
    this.searchTerm = "";
    this.nobusiness = "business";
    this.businesses = this.originalbusinesses;
  }



  onSwitchToBusiness(business) {
    let loading = this.loadingCtrl.create({
      content: "Switching Account..."
    });
    let confirm = this.alertCtrl.create({
      title: 'Switch',
      message: 'Do you want to switch to ' + business.user_name + '?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log("cancelled");
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.ready().then(() => {
              this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
                if (loggedInUserDetails == null) {
                  return false;
                } else {
                  this.UDetails = loggedInUserDetails[1];
                  this.userid = this.UDetails.userId;
                  // this.dataservice.deleteMemberUser(String(this.username));
                  // this.dataservice.deleteUser(String(this.username));
                  this.storage.set('SwitchedID', this.userid);
                }
              });
              loading.present();
              this.datalink.SwitchTo(String(business.userId))
                .subscribe(loggedInUserDetails => {
                  this.loggedInUserDetails = loggedInUserDetails;
                  this.code = loggedInUserDetails[0];
                  console.log(this.loggedInUserDetails);
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
                    this.datalink.showToast("Welcome " + this.Username);
                    this.dataservice.GetUserLoginDetails(this.UserDetails);
                    this.gotoHomePage(loading, this.userid);
                    this.events.publish('user:login', this.Username);
                  }
                }, (err) => {
                  loading.dismiss().catch(() => { });
                  this.datalink.showToast("Error connecting to server");
                  return false;
                });
            });
          }
        }
      ]
    });
    confirm.present();
  }

  gotoHomePage(loading, userid) {
    // this.navCtrl.setRoot(HomeTabPage, { userid }).then(() => {
      this.navCtrl.setRoot(CreateUserPinPage, { userid }).then(() => {
      this.storage.set('hasSeenLogin', true);
      loading.dismiss().catch(() => { });
      this.superTabsCtrl.slideTo(0);
      this.navCtrl.setRoot(this.navCtrl.getActive().component);
      window.location.reload();
    });

  }
  NewBusiness(){
    this.rootNavCtrl.push(NewBusinessPage);
  }
}
