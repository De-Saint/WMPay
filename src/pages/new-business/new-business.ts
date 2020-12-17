import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { SuperTabsController } from 'ionic2-super-tabs';
@Component({
  selector: 'page-new-business',
  templateUrl: 'new-business.html',
})
export class NewBusinessPage {
  bizindustries: any;
  biztypes: any;
  bizcheck: any;
  userid: any;
  UDetails: any;
  slideBizForm: FormGroup;
  constructor(public loadingCtrl: LoadingController, public superTabsCtrl: SuperTabsController,
    public storage: Storage, public formBuilder: FormBuilder, public datalink: DatalinkProvider,
    public navCtrl: NavController, public navParams: NavParams) {
    this.getBusinessIndustries();
    this.slideBizForm = this.formBuilder.group({
      bizindustry: ['', Validators.required],
      biztype: ['', Validators.required],
      bizname: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(1), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      bizdatefounded: ['', Validators.required],
      bizcacnumber: ['', Validators.required],
      bizemail: ['', Validators.compose([Validators.maxLength(30), Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')])],
      bizphone: ['', Validators.compose([Validators.maxLength(11), Validators.minLength(11), Validators.required])],
      bizwebaddress: ['', Validators.required],
      bizdesc: ['', Validators.required]
    });

  }

  ionViewDidLoad() {

  }


  getBusinessIndustries() {
    let loading = this.loadingCtrl.create({
    });
    loading.present();
    this.datalink.getBusinessIndustries().subscribe(bizindustries => {
      this.bizindustries = bizindustries;
      loading.dismiss().catch(() => { });
    }, (err) => {
      loading.dismiss().catch(() => { });
      return false;
    });
  }
  onBusinessIndustriesSelect(industryid) {
    let loading = this.loadingCtrl.create({
    });
    loading.present();
    this.datalink.getBusinessTypes(industryid).subscribe(biztypes => {
      this.biztypes = biztypes;
      loading.dismiss().catch(() => { });
    }, (err) => {
      loading.dismiss().catch(() => { });
      return false;
    });
  }
  onBizCheckEmail(email) {
    if (email.trim().length > 3) {
      this.datalink.checkEmail(email).subscribe((result) => {
        this.bizcheck = result;
      }, (err) => {
        return false;
      })
    }
  }


  onSaveBusiness() {
    let loading = this.loadingCtrl.create({
    });
    if (this.slideBizForm.value.bizindustry === ""
      || this.slideBizForm.value.biztype === ""
      || this.slideBizForm.value.bizname === ""
      || this.slideBizForm.value.bizdatefounded === ""
      || this.slideBizForm.value.bizcacnumber === ""
      || this.slideBizForm.value.bizemail === ""
      || this.slideBizForm.value.bizphone === ""
      || this.slideBizForm.value.bizdesc === ""
    ) {
      this.datalink.showToast("Please fill all the inputs");
    } else {
      this.storage.ready().then(() => {
        this.storage.get('loggedInUserDetails').then((loggedInUserDetails) => {
          if (loggedInUserDetails == null) {
            return false;
          } else {
            this.UDetails = loggedInUserDetails[1];
            this.userid = this.UDetails.userId;
            loading.present();
            this.datalink.BusinessRegistration(String(this.userid),
              this.slideBizForm.value.bizindustry,
              this.slideBizForm.value.biztype,
              this.slideBizForm.value.bizname,
              this.slideBizForm.value.bizdatefounded,
              this.slideBizForm.value.bizcacnumber,
              this.slideBizForm.value.bizemail,
              this.slideBizForm.value.bizphone,
              this.slideBizForm.value.bizwebaddress,
              this.slideBizForm.value.bizdesc
            ).subscribe((result) => {
              loading.dismiss().catch(() => { });
              let code: any = result[0];
              if (code === "200") {
                this.datalink.showToast("Successful");
                this.navCtrl.pop();
                this.superTabsCtrl.slideTo(2);
              } else {
                this.datalink.showToast(result[1]);
              }
            }, (err) => {
              loading.dismiss().catch(() => { });
              return false;
            })

          }
        });
      });
    }
  }
}
