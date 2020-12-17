import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, LoadingController, Events } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { SubscriptionPage } from '../subscription/subscription';



@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
  MembForm: FormGroup;
  error: any;
  check: any;
  HAS_LOGGED_IN = 'hasLoggedIn';
  loggedInUserDetails: any;
  UserDetails: any;
  code: any;
  Username: any;
  userid: any;
  constructor(
    public datalink: DatalinkProvider,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public platform: Platform,
    public events: Events,
    public dataservice: DataServiceProvider,
    public storage: Storage,
    public alertCtrl: AlertController,
    public navParams: NavParams) {
    this.MembForm = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(1), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      lastName: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(1), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', Validators.compose([Validators.maxLength(30), Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')])],
      phone: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required, Validators.maxLength(15)])],
    });
  }

  onCheckEmail(email) {
    if (email.trim().length > 3) {
      this.datalink.checkEmail(email).subscribe((result) => {
        this.check = result;
      }, (err) => {
        return false;
      })
    }
  }

  onSaveMember() {
  let loading = this.loadingCtrl.create({
    });
    if (this.MembForm.value.firstName === ""
      || this.MembForm.value.lastName === ""
      || this.MembForm.value.dob === ""
      || this.MembForm.value.gender === ""
      || this.MembForm.value.email === ""
      || this.MembForm.value.phone === ""
      || this.MembForm.value.password === ""
    ) {
      this.datalink.showToast("Please fill all the inputs");
      return false;
    } else {
      loading.present();
      this.datalink.Registration(
        this.MembForm.value.firstName,
        this.MembForm.value.lastName,
        this.MembForm.value.dob,
        this.MembForm.value.gender,
        this.MembForm.value.email,
        this.MembForm.value.phone,
        this.MembForm.value.password
      ).subscribe((result) => {
        loading.dismiss();
        let code: any = result[0];
        if (code === "200") {
          this.datalink.showToast(result[1]);
          let uid = result[2];
          this.onPayRegFees(this.MembForm.value.email, this.MembForm.value.password, uid, this.MembForm.value.firstName, this.MembForm.value.lastName)
        } else {
          this.datalink.showToast(result[1]);
        }
      }, (err) => {
        loading.dismiss();
        this.datalink.showToast("No Connection");
        return false;
      })
    }
  }


  onPayRegFees(email, password, userid, firstname, lastname) {
    const confirm = this.alertCtrl.create({
      title: 'Validation Fees',
      message: 'The sum of #1,500.00 is expected to be paid as a Validation Fees to join The WealthMarket.',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Pay Later',
          handler: () => {
            this.datalink.showToast('Please your account would be activated when your Validation Fees has been recieved. Thank You.');
            this.onValidateLogin();
          }
        },
        {
          text: 'Pay Now!',
          handler: () => {
            this.navCtrl.push(SubscriptionPage, { email, password, userid, firstname, lastname }); // with Plugin
          }
        }
      ]
    });
    confirm.present();
  }

  onValidateLogin() {
    this.navCtrl.push(LoginPage);
  }
}

