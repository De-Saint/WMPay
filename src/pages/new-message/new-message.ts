import { Component } from "@angular/core";
import { NavController, NavParams, LoadingController } from "ionic-angular";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Storage } from "@ionic/storage";
import { DataServiceProvider } from "../../providers/data-service/data-service";
import { DatalinkProvider } from "../../providers/datalink/datalink";
import { NewContactPage } from "../new-contact/new-contact";

@Component({
  selector: "page-new-message",
  templateUrl: "new-message.html"
})
export class NewMessagePage {
  contacts: any;
  originalcontacts: any;
  ContactResult: any;
  Originalcontacts: any;
  sentMsg: any;
  usertype: any;
  slideNewMsgForm: FormGroup;
  searchTerm: string = "";
  submitted = false;
  successmsg: String;
  userid: any;
  UDetails: any;
  nocontact: any;
  Nocontact: any;
  result: any;
  originalresult: any;
  details: any;
  ctact: string;
  constructor(
    public dataservice: DataServiceProvider,
    public storage: Storage,
    public formBuilder: FormBuilder,
    public datalink: DatalinkProvider,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.getContacts();
    this.slideNewMsgForm = formBuilder.group({
      selectedcontactid: ["", Validators.required],
      title: ["", Validators.required],
      body: ["", Validators.required],
      searchTerm: ["", Validators.required],
      selectcontid: ["", Validators.required]
    });
  }
  ionViewDidLoad() {
    this.details = this.navParams.get("details");
    console.log(this.details);
    if (this.details !== undefined) {
      this.slideNewMsgForm.controls["searchTerm"].setValue(this.details.email);
      this.onSearch();
    }
    this.ctact = 'searchC';
  }

  searchCtact() {
    this.ctact = 'searchC';
  }
  selectCtact() {
    this.ctact = 'selectC';
  }
  onSelect(selectedcontactID) {
    let loading = this.loadingCtrl.create({});
    if (selectedcontactID === "add") {
      this.navCtrl.push(NewContactPage);
    } else {
      loading.present();
      this.datalink.GetSearchUserDetails("", selectedcontactID).subscribe(
        result => {
          this.ContactResult = result;
          console.log(this.ContactResult);
          loading.dismiss().catch(() => { });
        },
        err => {
          loading.dismiss().catch(() => { });
          return false;
        }
      );
    }
  }

  onSearch() {
    let loading = this.loadingCtrl.create({});
    let searchvalue = this.slideNewMsgForm.value.searchTerm;
    if (searchvalue === "") {
      this.datalink.showToast(
        "Please enter the beneficiary name /email/ phone/ account number"
      );
    } else {
      if (searchvalue.length >= 3) {
        loading.present();
        this.datalink.GetSearchUserDetails(searchvalue, null).subscribe(
          contacts => {
            this.ContactResult = contacts;
            console.log(this.ContactResult);
            loading.dismiss().catch(() => { });
          },
          err => {
            loading.dismiss().catch(() => { });
            return false;
          }
        );
      }
    }
  }

  getContacts() {
    this.storage.ready().then(() => {
      this.storage.get("loggedInUserDetails").then(loggedInUserDetails => {
        if (loggedInUserDetails == null) {
        } else {
          this.UDetails = loggedInUserDetails[1];
          this.userid = this.UDetails.userId;
          this.usertype = this.UDetails.usertype;
          this.datalink
            .GetUserConnects(String(this.userid), this.usertype, "Contact")
            .subscribe(
              contacts => {
                let code: any = contacts[0];
                if (code === "400") {
                  this.nocontact = "nocontact";
                  this.contacts = [];
                } else {
                  this.nocontact = "contact";
                  this.contacts = contacts[1];
                  this.originalcontacts = contacts[1];
                }
              },
              err => {
                this.datalink.showNtwkErrorToast();
              }
            );
        }
      });
    });
  }

  onSendMessage(benid) {
    this.submitted = true;
    let loading = this.loadingCtrl.create({});
    let beneficiaryid: any;
    if (this.slideNewMsgForm.value.selectedcontactid !== "") {
      beneficiaryid = this.slideNewMsgForm.value.selectedcontactid;
    } else {
      beneficiaryid = benid;
    }
    if (beneficiaryid === null || beneficiaryid === undefined) {
      this.datalink.showToast("Please Select or Search a Beneficiary.");
      return false;
    } else if (this.slideNewMsgForm.value.title == "") {
      this.datalink.showToast("Please provide a Message Title/Subject.");
      return false;
    } else if (this.slideNewMsgForm.value.body === "") {
      this.datalink.showToast("Please provide a Message Description/Body.");
      return false;
    }

    loading.present();
    this.datalink
      .SendMessage(
        String(this.userid),
        String(beneficiaryid),
        this.slideNewMsgForm.value.title,
        this.slideNewMsgForm.value.body
      ).subscribe(
        sentMsg => {
          loading.dismiss().catch(() => { });
          this.sentMsg = sentMsg;
          this.datalink.displayAlert("Message", this.sentMsg);
          this.navCtrl.pop();
        },
        err => {
          // let recievername = this.slideNewMsgForm.value.selectedcontactid;
          // let msgID = this.dataservice.generateId();
          // this.savemsg(msgID, this.slideNewMsgForm.value.title, this.userid, beneficiaryid, this.slideNewMsgForm.value.body, recievername);
          // this.datalink.showToast("Saved in Outbox Messages");
          // this.navCtrl.pop();
          loading.dismiss().catch(() => { });
          return false;
        }
      );
  }

  savemsg(msgid, title, userid, selectedcontactid, body, recievername) {
    // let date: Date = this.dataservice.getDate();
    // let time = this.dataservice.getTime();
    // this.dataservice.setMessage(msgid, date, time, title, userid, selectedcontactid, body, recievername);
  }

  onAddContact() {
    this.navCtrl.push(NewContactPage);
  }
}
