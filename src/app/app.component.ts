import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, Events, MenuController, App, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { HeaderColor } from '@ionic-native/header-color';
import { AppVersion } from '@ionic-native/app-version';
import { HomeTabPage } from '../pages/home-tab/home-tab';
import { LoginPage } from '../pages/login/login';
import { DataServiceProvider } from '../providers/data-service/data-service';
import { DatalinkProvider } from '../providers/datalink/datalink';
import { UserPinPage } from '../pages/user-pin/user-pin';
import { WelcomePage } from '../pages/welcome/welcome';
import { Keyboard } from '@ionic-native/keyboard';
import { CreateUserPinPage } from '../pages/create-user-pin/create-user-pin';
import { HelpPage } from '../pages/help/help';
export interface PageInterface {
  icon: string;
  color: string;
  title: string;
  logsOut?: boolean;
  component: any
};

@Component({
  templateUrl: 'app.html'
})
export class WMPay {
  @ViewChild(Nav) nav: Nav;
  Userfullname: any;
  Details: any;
  usertype: any;
  app_version: string;
  appPages: PageInterface[] = [
    // { icon: 'info-circle', color: 'faYellow', title: 'About Us', component: AboutUsPage }
  ];

  loggedInPages: PageInterface[] = [
    { icon: 'home', color: 'faGreen', title: 'Home', component: HomeTabPage },
    { icon: 'sign-out', color: 'faOrange', title: 'Logout', logsOut: true, component: LoginPage }
  ];

  loggedOutPages: PageInterface[] = [
    { icon: 'sign-in', color: 'faLightBlue', title: 'Login', component: LoginPage }
  ];

  rootPage: any;
  activePage: any;
  constructor(
    public platform: Platform,
    public headerColor: HeaderColor,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public appVersion: AppVersion,
    public events: Events,
    public menu: MenuController,
    public app: App,
    public keyboard: Keyboard,
    public storage: Storage,
    public dataservice: DataServiceProvider,
    public alertCtrl: AlertController,
    public datalink: DatalinkProvider
  ) {
    this.storage.ready().then(() => {
      this.storage.get('hasSeenWelcome') // Check if the user has already seen the LoginPage
        .then((hasSeenWelcome) => {
          if (hasSeenWelcome) {
            this.storage.get('hasSeenLogin') // Check if the user has already seen the LoginPage
              .then((hasSeenLogin) => {
                if (hasSeenLogin) {
                  this.storage.get('hasCreatedLoginPin').then((loginpin) => { //check if the user has created login pin
                    if (loginpin) {
                      this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
                        if (loggedInUserDetails === null) {
                          this.rootPage = LoginPage;
                        } else {
                          // this.rootPage = HomeTabPage;
                          this.rootPage = UserPinPage;
                        }
                      });
                    } else {
                      // this.rootPage = HomeTabPage;
                      this.rootPage = CreateUserPinPage;
                    }
                  });
                } else {
                  this.rootPage = LoginPage;
                }
              });
          } else {
            this.rootPage = WelcomePage;
          }
          this.platformReady()
        });
      this.datalink.hasLoggedIn().then((hasLoggedIn) => {
        this.storage.ready().then(() => {
          this.enableMenu(hasLoggedIn === true);
        });
      });
      this.listenToLoginEvents();
    });
  }
  platformReady() {
    this.platform.ready().then(() => {
      this.headerColor.tint('#ffffff');
      this.statusBar.show();
      this.keyboard.hideFormAccessoryBar(false);
      this.statusBar.overlaysWebView(false);
      this.statusBar.styleBlackTranslucent()
      this.statusBar.backgroundColorByHexString("#000000");
      this.statusBar.styleLightContent();
      this.hideSplash();
      this.backbutton();
      this.appVersion.getVersionNumber().then(
        (versionNumber) => {
          this.app_version = versionNumber;
        },
        (error) => {
          console.log(error);
        });
      this.storage.ready().then(() => {
        this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
          if (loggedInUserDetails == null) {
          } else {
            this.Details = loggedInUserDetails[1];
            this.Userfullname = this.Details.user_name;
            this.usertype = this.Details.usertype;
          }
        });
      });
    });
  }

  hideSplash() {
    setTimeout(() => {
      this.splashScreen.hide();
    }, 100);
  }

  isActive(page: PageInterface) {
    if (this.nav.getActive() && this.nav.getActive().component === page.component) {
      return 'primary';
    }
    return;
  }


  backbutton() {
    this.platform.registerBackButtonAction(() => {
      let nav = this.app.getActiveNavs()[0];
      let activeView = nav.getActive();

      if (nav.canGoBack()) { //Can we go back?
        nav.pop();
      } else {
        if (activeView.component === HomeTabPage) {
          let actionSheet = this.alertCtrl.create({
            title: 'Exit WealthMarketPay?',
            message: 'Do you want to exit WealthMarketPay?',
            buttons: [
              {
                text: 'Yes',
                handler: () => {
                  this.platform.exitApp(); //Exit from app
                }
              }, {
                text: 'No',
                role: 'cancel',
                handler: () => {
                }
              }
            ]
          });
          actionSheet.present();
        } else {
        }
      }
    });
  }

  openPage(page: PageInterface) {
    this.menu.close();
    this.activePage = page;
    this.nav.setRoot(page.component);
    if (page.logsOut === true) {
      let confirm = this.alertCtrl.create({
        title: 'Logging Out',
        message: 'Logging out will erase your offline data. Do you want to logout?',
        buttons: [
          {
            text: 'No',
            handler: () => {
              this.nav.setRoot(HomeTabPage);
            }
          },
          {
            text: 'Yes',
            handler: () => {
              setTimeout(() => {
                this.events.publish('user:logout');
              }, 1000);
            }
          }
        ]
      });
      confirm.present();
    }
  }

  listenToLoginEvents() {
    this.events.subscribe('user:signup', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      this.enableMenu(false);
      this.storage.ready().then(() => {
        this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
          if (loggedInUserDetails === null) {
          } else {
            this.Details = loggedInUserDetails[1];
            let userid: any = this.Details.userId;
            this.datalink.Logout(String(userid)).subscribe(msg => { console.log(msg);}, err => { });
            this.storage.remove('hasLoggedIn');
            this.storage.remove('loggedInUserDetails');
            this.storage.remove('hasSeenLogin');
            this.storage.remove('hasSeenWelcome');
            this.storage.remove('OfflineBalance');
          }
        });
      });
      this.nav.setRoot(LoginPage);
    });

    this.events.subscribe('user:login', (Userfullname) => {
      this.Userfullname = Userfullname;
      this.enableMenu(true);
    })
  }

  enableMenu(loggedIn) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }

  openHelp(){
    this.nav.setRoot(HelpPage);
  }
}

