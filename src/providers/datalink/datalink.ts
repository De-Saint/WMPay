import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Platform, AlertController, ToastController } from "ionic-angular";
import { map } from "rxjs/operators";
import { HTTP } from "@ionic-native/http";
import { from } from "rxjs/observable/from";

@Injectable()
export class DatalinkProvider {
  HAS_LOGGED_IN = "hasLoggedIn";
  HAS_SEEN_WELCOME = "hasSeenWelcome";
  // baseUrl: string = "http://154.113.97.10:8084/WMPortal/"; //from netbeans local
  // baseUrl: string = "http://localhost:8084/WMPortal/"; //from netbeans local
  baseUrl: string = 'https://thewealthmarket.com/WMPortal/'; //from server
  // baseUrl: string = "https://0487d46a.ngrok.io/WMPortal/"; // from ngrok
  constructor(
    public nativeHttp: HTTP,
    public alertCtrl: AlertController,
    public platform: Platform,
    public http: HttpClient,
    public storage: Storage,
    public toastCtrl: ToastController
  ) { }

  hasLoggedIn() {
    return this.storage.get(this.HAS_LOGGED_IN).then(value => {
      return value === true;
    });
  }

  baseAddress() {
    return this.baseUrl;
  }

  checkHasSeenWelcome() {
    return this.storage.get(this.HAS_SEEN_WELCOME).then(value => {
      return value;
    });
  }

  SetloggedInUserDetails(loggedInUserDetails) {
    this.storage.set("loggedInUserDetails", loggedInUserDetails);
  }

  getloggedInUserDetails() {
    return this.storage.get("loggedInUserDetails").then(value => {
      return value;
    });
  }

  displayAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ["Ok"]
    });
    alert.present();
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      showCloseButton: true,
      closeButtonText: "Ok!",
      duration: 4000,
      position: "bottom",
      cssClass: "dark-trans"
    });
    toast.present(toast);
  }

  showNtwkErrorToast() {
    let toast = this.toastCtrl.create({
      message:
        "We could not connect to the WM Server. Please check your network connection and try again.",
      showCloseButton: true,
      closeButtonText: "Ok!",
      duration: 4e3,
      position: "bottom",
      cssClass: "dark-trans"
    });
    toast.present(toast);
  }

  onNativeServerCall(url, data) {
    this.nativeHttp.setDataSerializer("json");
    this.nativeHttp.setSSLCertMode("nocheck");
    let nativeCall = this.nativeHttp.post(url, data, {
      "Content-Type": "application/json"
    });
    return from(nativeCall).pipe(
      map(result => {
        return JSON.parse(result.data);
      })
    )
  }

  onStandardServerCall(url, data) {
    return this.http.post(url, data).pipe(
      map(res => {
        return res;
      })
    );
  }

  login(emailphone, password) {
    let url = this.baseUrl + "MUserServlet";
    let type = "Login";
    if (this.platform.is("cordova")) {
      let data = {
        emailphone: emailphone,
        password: password,
        type:type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ emailphone, password, type });
      return this.onStandardServerCall(url, data);
    }
  }


  checkAppVersion() {
    let url = this.baseUrl + "MUserServlet";
    let type = "checkAppVersion";
    if (this.platform.is("cordova")) {
      let data = {
        type: type
      };
      return this.onNativeServerCall(url, data);
    }
    let data = JSON.stringify({ type });
    return this.onStandardServerCall(url, data);
  }

  getinboxMessages(memberid) {
    let url = this.baseUrl + "MMessageServlet";
    let type = "InboxMessages";
    if (this.platform.is("cordova")) {
      let data = {
        memberid: memberid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ memberid, type });
      return this.onStandardServerCall(url, data);
    }
  }
  getsentMessages(memberid) {
    let url = this.baseUrl + "MMessageServlet";
    let type = "SentMessages";
    if (this.platform.is("cordova")) {
      let data = {
        memberid: memberid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ memberid, type });
      return this.onStandardServerCall(url, data);
    }
  }

  deleteMessage(messageid) {
    let url = this.baseUrl + "MMessageServlet";
    let type = "DeleteMessage";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        messageid: messageid
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ type, messageid });
      return this.onStandardServerCall(url, data);
    }
  }

  MarkAsRead(messageid) {
    let url = this.baseUrl + "MMessageServlet";
    let type = "MarkAsRead";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        messageid: messageid
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ type, messageid });
      return this.onStandardServerCall(url, data);
    }
  }

  SendMessage(memberid, selectedContactID, msgTitle, msgBody) {
    let type = "SendMessage";
    let url = this.baseUrl + "MMessageServlet";
    if (this.platform.is("cordova")) {
      let data = {
        memberid: memberid,
        selectedContactID: selectedContactID,
        msgTitle: msgTitle,
        msgBody: msgBody,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({
        memberid,
        selectedContactID,
        msgTitle,
        msgBody,
        type
      });
      return this.onStandardServerCall(url, data);
    }
  }
  Logout(userid) {
    let url = this.baseUrl + "MUserServlet";
    let type = "Logout";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        userid: userid
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ type, userid });
      return this.onStandardServerCall(url, data);
    }
  }

  checkEmail(email) {
    let url = this.baseUrl + "MUserServlet";
    let type = "checkEmail";
    if (this.platform.is("cordova")) {
      let data = {
        email: email,
        type: type
      };
      return this.onNativeServerCall(url, data);
    }
    let data = JSON.stringify({ email, type });
    return this.onStandardServerCall(url, data);
  }

  Registration(
    userfirstname,
    userlastname,
    userdob,
    usergender,
    useremail,
    userphone,
    userpassword
  ) {
    let url = this.baseUrl + "MUserServlet";
    let type = "MemberRegistration";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        userfirstname: userfirstname,
        userlastname: userlastname,
        userdob: userdob,
        usergender: usergender,
        useremail: useremail,
        userphone: userphone,
        userpassword: userpassword
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({
        type,
        userfirstname,
        userlastname,
        userdob,
        usergender,
        useremail,
        userphone,
        userpassword
      });
      return this.onStandardServerCall(url, data);
    }
  }

  GetSearchUserDetails(searchvalue, userid) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "GetSearchUserDetails";
    if (this.platform.is("cordova")) {
      let data = {
        searchvalue: searchvalue,
        userid: userid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ searchvalue, userid, type });
      return this.onStandardServerCall(url, data);
    }
  }

  SearchContacts(searchvalue) {
    let url = this.baseUrl + "MUserServlet";
    let type = "SearchContacts";
    if (this.platform.is("cordova")) {
      let data = {
        searchvalue: searchvalue,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ searchvalue, type });
      return this.onStandardServerCall(url, data);
    }
  }

  GetUserConnects(userid, object1, object2) {
    let url = this.baseUrl + "MUserServlet";
    let type = "GetUserConnects";
    if (this.platform.is("cordova")) {
      let data = {
        userid: userid,
        object1: object1,
        object2: object2,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ userid, object1, object2, type });
      return this.onStandardServerCall(url, data);
    }
  }
  getDetails(userid, usertype) {
    let url = this.baseUrl + "MUserServlet";
    let type = "GetUserDetails";
    if (this.platform.is("cordova")) {
      let data = {
        userid: userid,
        usertype: usertype,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ userid, usertype, type });
      return this.onStandardServerCall(url, data);
    }
  }
  AcctTypeBalance(acctdefid, userid) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "AcctTypeBalance";
    if (this.platform.is("cordova")) {
      let data = {
        acctdefid: acctdefid,
        userid: userid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ acctdefid, userid, type });
      return this.onStandardServerCall(url, data);
    }
  }

  deleteContact(memberid, contactid, objectype1, objectype2) {
    let type = "DeleteContact";
    let url = this.baseUrl + "MUserServlet";
    if (this.platform.is("cordova")) {
      let data = {
        memberid: memberid,
        contactid: contactid,
        objectype1: objectype1,
        objectype2: objectype2,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({
        memberid,
        contactid,
        objectype1,
        objectype2,
        type
      });
      return this.onStandardServerCall(url, data);
    }
  }

  addContact(memberid, contactid, objectype1, objectype2) {
    let url = this.baseUrl + "MUserServlet";
    let type = "AddContact";
    if (this.platform.is("cordova")) {
      let data = {
        memberid: memberid,
        contactid: contactid,
        objectype1: objectype1,
        objectype2: objectype1,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({
        memberid,
        contactid,
        objectype1,
        objectype2,
        type
      });
      return this.onStandardServerCall(url, data);
    }
  }
  GetUserAccountBalances(userid, acctdefid) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "GetUserAccountBalances";
    if (this.platform.is("cordova")) {
      let data = {
        userid: userid,
        acctdefid: acctdefid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ userid, acctdefid, type });
      return this.onStandardServerCall(url, data);
    }
  }

  getBusinessIndustries() {
    let url = this.baseUrl + "MUserServlet";
    let type = "getBusinessIndustries";
    if (this.platform.is("cordova")) {
      let data = {
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ type });
      return this.onStandardServerCall(url, data);
    }
  }

  getBusinessTypes(industryid) {
    let url = this.baseUrl + "MUserServlet";
    let type = "getBusinessTypes";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        industryid: industryid
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ type, industryid });
      return this.onStandardServerCall(url, data);
    }
  }
  BusinessRegistration(
    memberuserid,
    bizindustry,
    biztype,
    bizname,
    bizdfound,
    bizcacnumber,
    bizemail,
    bizphone,
    bizwebadd,
    bizdesc
  ) {
    let url = this.baseUrl + "MUserServlet";
    let type = "BusinessRegistration";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        memberuserid: memberuserid,
        bizindustry: bizindustry,
        biztype: biztype,
        bizname: bizname,
        bizdfound: bizdfound,
        bizcacnumber: bizcacnumber,
        bizemail: bizemail,
        bizphone: bizphone,
        bizwebadd: bizwebadd,
        bizdesc: bizdesc
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({
        type,
        memberuserid,
        bizindustry,
        biztype,
        bizname,
        bizdfound,
        bizcacnumber,
        bizemail,
        bizphone,
        bizwebadd,
        bizdesc
      });
      return this.onStandardServerCall(url, data);
    }
  }

  getAccountDefinitions() {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "GetAccountDefinitions";
    if (this.platform.is("cordova")) {
      let data = {
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ type });
      return this.onStandardServerCall(url, data);
    }
  }

  GetAccounts(userid) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "GetAccounts";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        userid: userid
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ type, userid });
      return this.onStandardServerCall(url, data);
    }
  }

  getRecentTransfers(memberid, acctdefID, startdate, enddate) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "RecentTransactions";
    if (this.platform.is("cordova")) {
      let data = {
        acctdefID: acctdefID,
        type: type,
        memberid: memberid,
        startdate: startdate,
        enddate: enddate
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({
        acctdefID,
        type,
        memberid,
        startdate,
        enddate
      });
      return this.onStandardServerCall(url, data);
    }
  }

  FundTransfer(memberid, acctdefid, Beneficiaryid, amount, pin, comment) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "FundTransfer";
    if (this.platform.is("cordova")) {
      let data = {
        memberid: memberid,
        acctdefid: acctdefid,
        Beneficiaryid: Beneficiaryid,
        amount: amount,
        pin: pin,
        comment: comment,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({
        memberid,
        acctdefid,
        Beneficiaryid,
        amount,
        pin,
        comment,
        type
      });
      return this.onStandardServerCall(url, data);
    }
  }

  SwitchTo(userid) {
    let type = "SwitchTo";
    let url = this.baseUrl + "MUserServlet";
    if (this.platform.is("cordova")) {
      let data = {
        userid: userid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ userid, type });
      return this.onStandardServerCall(url, data);
    }
  }

  sendLoginPin(userid, email, pin) {
    let type = "EmailLoginPin";
    let url = this.baseUrl + "MUserServlet";
    if (this.platform.is("cordova")) {
      let data = {
        userid: userid,
        email: email,
        pin: pin,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ userid, email, pin, type });
      return this.onStandardServerCall(url, data);
    }
  }

  ChangePin(userid, pin) {
    let type = "ChangeTransactionPIN";
    let url = this.baseUrl + "MTransactionServlet";
    if (this.platform.is("cordova")) {
      var data = {
        userid: userid,
        pin: pin,
        type: type
      };
      this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ userid, pin, type });
      return this.onStandardServerCall(url, data);
    }
  }

  TransferToOfflineAccount(memberid, amount, pin) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "TransferToOfflineAccount";
    if (this.platform.is("cordova")) {
      let data = {
        memberid: memberid,
        amount: amount,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ memberid, amount, pin, type });
      return this.onStandardServerCall(url, data);
    }
  }

  TransferFromOfflineAccount(memberid, amount, pin) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "TransferFromOfflineAccount";
    if (this.platform.is("cordova")) {
      let data = {
        memberid: memberid,
        amount: amount,
        pin: pin,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ memberid, amount, pin, type });
      return this.onStandardServerCall(url, data);
    }
  }

  addPaymentCard(name, number, expiry, cvc, userid, option, cardid) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "AddPaymentCard";
    if (this.platform.is("cordova")) {
      let data = {
        name: name,
        number: number,
        expiry: expiry,
        cvc: cvc,
        userid: userid,
        option: option,
        cardid: cardid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({
        name,
        number,
        expiry,
        cvc,
        userid,
        option,
        cardid,
        type
      });
      return this.onStandardServerCall(url, data);
    }
  }

  UpdateCardDefaultValue(value, cardid, userid) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "UpdateCardDefaultValue";
    if (this.platform.is("cordova")) {
      let data = {
        value: value,
        cardid: cardid,
        userid: userid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ value, cardid, userid, type });
      return this.onStandardServerCall(url, data);
    }
  }
  DeleteCard(cardid) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "DeleteCard";
    if (this.platform.is("cordova")) {
      let data = {
        cardid: cardid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ cardid, type });
      return this.onStandardServerCall(url, data);
    }
  }

  getPaymentCard(userid) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "GetPaymentCard";
    if (this.platform.is("cordova")) {
      let data = {
        userid: userid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ userid, type });
      return this.onStandardServerCall(url, data);
    }
  }

  GetDefaultPaymentCard(userid) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "GetDefaultPaymentCard";
    if (this.platform.is("cordova")) {
      let data = {
        userid: userid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ userid, type });
      return this.onStandardServerCall(url, data);
    }
  }

  ForgetPassword(email, password) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "ForgetPassword";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        email: email,
        password: password
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ type, email, password });
      return this.onStandardServerCall(url, data);
    }
  }

  MobilePayment(userid, amount, reference, txncode, option) {
    let url = this.baseUrl + "MTransactionServlet";
    let type = "MobilePayment";
    if (this.platform.is("cordova")) {
      let data = {
        userid: userid,
        amount: amount,
        reference: reference,
        txncode: txncode,
        option: option,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({ userid, amount, reference, txncode, option, type });
      return this.onStandardServerCall(url, data);
    }
  }

  UpdateProfile(userid, firstname, lastname, password) {
    var url = this.baseUrl + "MUserServlet";
    let type = "UpdateProfile";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        userid: userid,
        firstname: firstname,
        lastname: lastname,
        password: password
      };
      return this.onNativeServerCall(url, data);
    }
    var data = JSON.stringify({
      type,
      userid,
      firstname,
      lastname,
      password
    });
    return this.onStandardServerCall(url, data);
  }

  CashOutRequest(userid, amount, acctdefID) {
    var url = this.baseUrl + "MTransactionServlet";
    let type = "CashOutRequest";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        userid: userid,
        amount: amount,
        acctdefID: acctdefID
      };
      return this.onNativeServerCall(url, data);
    }
    var data = JSON.stringify({
      type,
      userid,
      amount,
      acctdefID
    });
    return this.onStandardServerCall(url, data);
  };

  GetBanks() {
    var url = this.baseUrl + "MTransactionServlet";
    if (this.platform.is("cordova")) {
      let data = {
        type: "GetBanks"
      };
      return this.onNativeServerCall(url, data);
    }
    var data = JSON.stringify({ type: "GetBanks" });
    return this.onStandardServerCall(url, data);
  }

  AddBankDetails (
    userid,
    bankNameID,
    bankAcctType,
    bankAcctNumber,
    bankAcctBVN,
    option,
    bankid,
  ) {
    var url = this.baseUrl + "MTransactionServlet";
    let type = "AddBankDetails";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        userid: userid,
        bankNameID: bankNameID,
        bankAcctType: bankAcctType,
        bankAcctNumber: bankAcctNumber,
        bankAcctBVN: bankAcctBVN,
        option:option,
        bankid:bankid
      };
      return this.onNativeServerCall(url, data);
    } else {
      var data = JSON.stringify({
        type,
        userid,
        bankNameID,
        bankAcctType,
        bankAcctNumber,
        bankAcctBVN,
        option,
        bankid
      });
      return this.onStandardServerCall(url, data);
    }
  };

  GetCashOutRequest(userid) {
    var url = this.baseUrl + "MTransactionServlet";
    let type = "GetCashOutRequest";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        userid: userid
      };
      return this.onNativeServerCall(url, data);
    } else {
      var data = JSON.stringify({ type, userid });
      return this.onStandardServerCall(url, data);
    }
  }
  
  GetSMSNumberAndCharges() {
    var url = this.baseUrl + "MTransactionServlet";
    let type = "GetSMSNumberAndCharges";
    if (this.platform.is("cordova")) {
      let data = {
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      var data = JSON.stringify({ type });
      return this.onStandardServerCall(url, data);
    }
  }
  GetPayStackKey() {
    var url = this.baseUrl + "MTransactionServlet";
    let type = "GetPayStackKey";
    if (this.platform.is("cordova")) {
      let data = {
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      var data = JSON.stringify({ type });
      return this.onStandardServerCall(url, data);
    }
  }
  GetUserBankAccount(userid) {
    var url = this.baseUrl + "MTransactionServlet";
    let type = "GetUserBankAccount";
    if (this.platform.is("cordova")) {
      let data = {
        type: type,
        userid:userid
      };
      return this.onNativeServerCall(url, data);
    } else {
      var data = JSON.stringify({ type, userid });
      return this.onStandardServerCall(url, data);
    }
  }

  DeleteBankDetail(bankid) {
    let type = "DeleteBankDetail";
    let url = this.baseUrl + "MTransactionServlet";
    if (this.platform.is("cordova")) {
      let data = {
        bankid: bankid,
        type: type
      };
      return this.onNativeServerCall(url, data);
    } else {
      let data = JSON.stringify({
        bankid,
        type
      });
      return this.onStandardServerCall(url, data);
    }
  }

}
