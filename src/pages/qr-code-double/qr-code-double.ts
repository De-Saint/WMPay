import { Component } from "@angular/core";
import { NavController, NavParams, AlertController, Platform, LoadingController } from "ionic-angular";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';
import { Storage } from '@ionic/storage';
import { DatalinkProvider } from "../../providers/datalink/datalink";
import { DataServiceProvider } from "../../providers/data-service/data-service";
import { SuperTabsController } from "ionic2-super-tabs";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
@Component({
  selector: "page-qr-code-double",
  templateUrl: "qr-code-double.html"
})
export class QrCodeDoublePage {
  slideOfflineForm: FormGroup;
  amt: any;
  scanSegment: any;
  DECIMAL_SEPARATOR = ".";
  GROUP_SEPARATOR = ",";
  UDetails: any;
  createdCode: any;
  sellerCreatedCode: any;
  buyerCreatedCode: any;
  sellerUserID: any;
  sellerOfflineID: any;
  sellerName: any;
  txnAmount: any;
  userid: any;
  user_name: any;
  TransactionPIN: any;
  buyerUserID: any;
  buyerOfflineID: any;
  buyerName: any;

  constructor(public sqlite: SQLite,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public barcodeScanner: BarcodeScanner,
    public superTabsCtrl: SuperTabsController,
    public formBuilder: FormBuilder,
    public datalink: DatalinkProvider,
    public dataservice: DataServiceProvider
  ) {
    this.slideOfflineForm = formBuilder.group({
      phone: ['', Validators.required],
      amount: ['', Validators.required],
      pin: ['', Validators.required],
      narration: ['']
    });
  }


  ionViewDidLoad() {
    this.scanSegment = "toreceive"
  }
  toReceive() {
    this.scanSegment = "toreceive"
  }
  toPay() {
    this.scanSegment = "topay"
  }
  onLoadInstruction() {
    this.alertCtrl.create({
      title: "Offline Transaction",
      message: "<span class=bold >Device Battery</span> <br/> Ensure your Device Battery Level is not low. <br/> <span class=bold >2-Way Scan </span><br/> The scanning must be both ways to ensure a successful transaction<br/> <span class=bold >Reverse Transaction</span> <br/>  The buyer should use the Reverse Button in case the seller is not able to scan the buyer's code.",
      enableBackdropDismiss: !1,
      buttons: [{
        text: "I want to Make Payment",
        handler: () => {
          this.toPay()
        }
      }, {
        text: "I want to Recieve Fund",
        handler: () => {
          this.toReceive()
        }
      }]
    }).present()
  }
  format(valString) {
    if (!valString) {
      return '';
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
    this.amt = parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, this.GROUP_SEPARATOR)
    return this.amt;
  };

  unFormat(val) {
    if (!val) {
      return '';
    }
    val = val.replace(/^0+/, '').replace(/\D/g, '');
    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  }
  onGenerateCode() {
    let confirm = this.alertCtrl.create({
      title: "Invoice Amount",
      message: "Please enter the Transaction Amount to Generate Invoice",
      inputs: [
        {
          name: "amount",
          placeholder: "Transaction Amount"
        }
      ],
      buttons: [
        {
          text: "Cancel",
          handler: () => {
            console.log("Cancel clicked");
          }
        },
        {
          text: "Generate",
          handler: (data) => {
            this.platform.ready().then(() => {
              this.storage.ready().then(() => {
                this.storage.get("loggedInUserDetails").then(loggedInUserDetails => {
                  if (null == loggedInUserDetails) {
                  } else {
                    (this.UDetails = loggedInUserDetails[1]),
                      (this.createdCode = this.UDetails.userId + ":" + this.UDetails.user_name + ":" + data.amount);
                  }
                });
              });
            });
          }
        }
      ]
    });
    confirm.present();
  }

  onGenerateSellerCode() {
    let amount = this.slideOfflineForm.value.amount;
    if ("" === (amount = amount.toString().replace(/,/g, "")) || void 0 === amount || isNaN(amount) || null === amount) {
      return this.datalink.showToast("Error please enter the correct amount");
    } else {
      this.platform.ready().then(() => {
        this.storage.ready().then(() => {
          this.storage.get("loggedInUserDetails").then((loggedInUserDetails) => {
            if (loggedInUserDetails === null) {
            } else {
              this.UDetails = loggedInUserDetails[1];
              this.sellerCreatedCode = loggedInUserDetails.UDetails.userId + ":" + loggedInUserDetails.UDetails.offlineID + ":" + this.UDetails.user_name + ":" + amount;
              document.getElementById("generatedInvoice").classList.remove("hide");
              document.getElementById("generatedInvoice").classList.add("show");
              document.getElementById("Invoice").classList.add("hide");
              document.getElementById("Invoice").classList.remove("show");
            }
          })
        })
      })
    }
  }


  onScanSellerCode() {
    let options = {
      saveHistory: 0,
      resultDisplayDuration: 0,
      prompt: "Place the barcode inside the scan area to Scan Seller's details"
    }
    this.barcodeScanner.scan(options).then(result => {
      this.onDecodeSellerScannedCode(result.text);
    }, (error) => {
      console.log("Error: " + error);
    })
  }


  onDecodeSellerScannedCode(data) {
    this.sellerUserID = data.split(":")[0];
    this.sellerOfflineID = data.split(":")[1];
    this.sellerName = data.split(":")[2];
    this.txnAmount = data.split(":")[3];
    document.getElementById("sellerDetails").classList.remove("hide");
    document.getElementById("sellerDetails").classList.add("show");
  }

  onMakePayment() {
    let amount = this.txnAmount;
    if ("" === (amount = amount.toString().replace(/,/g, "")) || void 0 === amount || isNaN(amount) || null === amount) {
      return this.datalink.showToast("Please Scan the Seller's Code to validate Payment");
    }
    let loading = this.loadingCtrl.create({});
    let newAmount = this.dataservice.CurrencyFormat(this.txnAmount); //t
    let confirm = this.alertCtrl.create({
      title: "Offline Transaction (Debit)",
      message: "Do you wish to continue with this transaction and debit your Offline Account with " + newAmount,
      buttons: [{
        text: "No",
        handler: function () {
          console.log("cancelled")
        }
      }, {
        text: "Yes",
        handler: () => {
          this.platform.ready().then(() => {
            this.storage.ready().then(() => {
              this.storage.get("loggedInUserDetails").then((loggedInUserDetails) => {
                if (null == loggedInUserDetails) {
                } else {
                  this.TransactionPIN = loggedInUserDetails[2].TransactionPin;
                  this.UDetails = loggedInUserDetails[1];
                  this.userid = this.UDetails.userId;
                  this.user_name = this.UDetails.user_name;
                  this.buyerOfflineID = this.UDetails.offlineID;
                  let newData = "WM-Debit:" + this.userid + ":" + this.buyerOfflineID + ":" + this.user_name + ":Credit:" + this.sellerUserID + ":" + this.sellerOfflineID + ":" + this.sellerName + ":" + this.txnAmount;
                  if (this.TransactionPIN === this.slideOfflineForm.value.pin) {
                    loading.present();
                    document.getElementById("sellerDetails").classList.add("hide");
                    document.getElementById("sellerDetails").classList.remove("show");
                    this.onPrepareDebitTransaction(this.userid, this.buyerOfflineID, this.user_name, loading, this.sellerUserID, this.sellerOfflineID, this.sellerName, this.txnAmount, newData)
                  } else {
                    this.datalink.showToast("Invalid Pin, Please Check Transaction Pin");
                  }
                }
              })
            })
          }),
          loading.dismiss().catch(() => { })
        }
      }]
    })
    confirm.present()
  }

  onRejectPayment() {
    let confirm = this.alertCtrl.create({
      title: "Reject Payment",
      message: "Do you wish to Reject or Cancel this payment?",
      buttons: [{
        text: "No",
        handler: () => {
          console.log("Cancel clicked")
        }
      }, {
        text: "Yes",
        handler: (n) => {
          this.navCtrl.pop();
          this.datalink.showToast("You cancelled the transaction and no payment code was generated");
        }
      }]
    })
    confirm.present()
  }

  onPrepareDebitTransaction(buyerUserID, buyerOfflineID, buyerName, loading, sellerUserID, sellerOfflineID, sellerName, txnAmount, newData) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: "wmpaybd.db",
        location: "default"
      }).then((db: SQLiteObject) => {
        db.executeSql("CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)", [])
          .then(res => {
            console.log("usersTable SELECT created " + JSON.stringify(res))
          }).catch(error => {
            console.log("usersTable SELECT created " + JSON.stringify(error));
          }),
          db.executeSql("SELECT * FROM users WHERE userid = ?", [buyerUserID])
            .then(res => {
              if (res.rows.length > 0) {
                var offlinebal = res.rows.item(0).offlinebalance;
                if ((parseInt(offlinebal) <= parseInt(txnAmount))) {
                  loading.dismiss().catch(() => { });
                  return this.datalink.showToast("Insufficient Offline Balance");
                } else {
                  db.executeSql("SELECT * FROM users WHERE userid = ?", [buyerUserID]).then((result) => {
                    for (var i = 0; i < result.rows.length; i++) {
                      let buyerOldBalance = parseInt(result.rows.item(i).offlinebalance);
                      let buyerNewBalance = buyerOldBalance - parseInt(txnAmount);
                      this.buyerCreatedCode = "success:" + newData;
                      document.getElementById("payCode").classList.remove("hide");
                      document.getElementById("payCode").classList.add("show");
                      this.ComputeTransaction("Debit", buyerUserID, buyerUserID, buyerOfflineID, buyerName, sellerUserID, sellerOfflineID, sellerName, buyerOldBalance, buyerNewBalance, loading, txnAmount, newData);
                    }
                  }).catch((error) => {
                    this.datalink.showToast("Error Getting Offline Balance");
                    loading.dismiss().catch(() => { })
                  })
                }
              }
            }).catch((error) => {
              loading.dismiss().catch(() => { })
            })
      }, (error) => {
        this.datalink.showToast("Error Getting Offline Balance");
        loading.dismiss().catch(() => { })
      })
    })
  }

  onScanBuyerCode = function () {
    this.barcodeScanner.scan({
      saveHistory: 0,
      resultDisplayDuration: 0,
      prompt: "Place the barcode inside the scan area to Scan Buyer's details"
    }).then((scannedData) => {
      var result = scannedData.text;
      this.createSound();
      this.onDecodeBuyerScannedCode(result);
    }, (error) => {
      console.log("Error: " + error)
    })
  }

  onDecodeBuyerScannedCode(scanText) {
    // let newData = "success : WM-Debit : this.userid : this.buyerOfflineID : this.user_name : Credit : this.sellerUserID : this.sellerOfflineID : this.sellerName : this.txnAmount;
    this.buyerUserID = scanText.split(":")[2];
    this.buyerOfflineID = scanText.split(":")[3];
    this.buyerName = scanText.split(":")[4];
    this.txnAmount = scanText.split(":")[10];
    let loading = this.loadingCtrl.create({

    });
    let formattedAmount = this.dataservice.CurrencyFormat(this.txnAmount);
    let confirm = this.alertCtrl.create({
      title: "Offline Transaction (Credit)",
      message: "Continue with this transaction and credit your Device Offline Account with" + formattedAmount,
      buttons: [{
        text: "Ok",
        handler: function () {
          this.platform.ready().then(function () {
            this.storage.ready().then(function () {
              this.storage.get("loggedInUserDetails").then((loggedInUserDetails) => {
                if (null == loggedInUserDetails) {
                } else {
                  this.UDetails = loggedInUserDetails[1];
                  this.userid = this.UDetails.userId;
                  this.user_name = this.UDetails.user_name;
                  this.sellerOfflineID = this.UDetails.offlineID;
                  loading.present();
                  this.onPrepareCreditTransaction(this.userid, this.sellerOfflineID, this.user_name, loading, this.buyerUserID, this.buyerOfflineID, this.buyerName, this.txnAmount, scanText);
                }
              })
            })
          })
        }
      }]
    })
    confirm.present();
  }


  onPrepareCreditTransaction(sellerUserID, sellerOfflineID, sellerName, loading, buyerUserID, buyerOfflineID, buyerName, txnAmount, newData) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: "wmpaybd.db",
        location: "default"
      }).then((db: SQLiteObject) => {
        db.executeSql("CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)", [])
          .then((res) => {
            console.log("usersTable SELECT created " + JSON.stringify(res))
          }).catch((err) => {
            console.log("usersTable SELECT created " + JSON.stringify(err))
          }),
          db.executeSql("SELECT * FROM users WHERE userid = ?", [sellerUserID])
            .then((result) => {
              if (result.rows.length > 0)
                for (var i = 0; i < result.rows.length; i++) {
                  let sellerOldBalance = parseInt(result.rows.item(i).offlinebalance);
                  let sellerNewBalance = sellerOldBalance + parseInt(txnAmount);
                  this.buyerCreatedCode = "success:" + sellerUserID + ":" + sellerOfflineID + ":" + sellerName + ":" + txnAmount + ":" + newData;
                  this.ComputeTransaction("Credit", buyerUserID, buyerUserID, buyerOfflineID, buyerName, sellerUserID, sellerOfflineID, sellerName, sellerOldBalance, sellerNewBalance, loading, txnAmount, newData);
                }
            }).catch(() => {
              loading.dismiss().catch(() => { })
            })
      }, (error) => {
        this.datalink.showToast("Something went wrong checking your offline Balance");
        loading.dismiss().catch(() => { })
      })
    })
  }

  ComputeTransaction(type, UserID, fromUserID, fromUserOfflineID, fromUserName, toUserID, toUserOfflineID, toUserName, Oldbalance, NewBalance, loading, txnAmount, newData) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: "wmpaybd.db",
        location: "default"
      }).then((db: SQLiteObject) => {
        let txnid = this.dataservice.generateId();
        let date = this.dataservice.getDate();
        let time = this.dataservice.getTime();
        let txnDate = String(date).replace("/", "").replace("/", "");//remove the / in the date
        let txnTime = String(time).replace(":", "").replace(":", "");//remove the : in the time 
        let txnRef = "OP" + toUserOfflineID + fromUserOfflineID + txnDate + txnTime; // arranging the txn Reference
        let comment = "Your Offline Account has been " + type + "ed with " + this.dataservice.CurrencyFormat(txnAmount) + " at " + this.dataservice.getFormattedTime() + " " + this.dataservice.getFormattedDate() + ". New balance is " + this.dataservice.CurrencyFormat(NewBalance);
        // transactions(transid TEXT, transactiontype TEXT, userid TEXT, fromuserid TEXT, touserid TEXT, amount TEXT, transactionid TEXT, oldbalance TEXT, newbalance TEXT, date DATE, time TIME, comment TEXT, status TEXT)', [])
        db.executeSql("INSERT INTO transactions VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [txnid, type, UserID, fromUserID, toUserID, txnAmount, txnRef, Oldbalance, NewBalance, this.dataservice.getFormattedDate(), this.dataservice.getFormattedTime(), comment, newData])
          .then((l) => {
            db.executeSql("UPDATE users SET offlinebalance = ? WHERE userid = ?", [NewBalance, UserID])
              .then(function (res) {
                if (type === "Debit") {
                  this.datalink.displayAlert("Successful Transaction", comment + "\n <br/> Please show your Generated QRCode to the Seller to scan and receive payment. Go To Account's Tab <br/>To View Your Offline Transactions.");
                  this.dismiss().catch(() => { });
                } else {
                  this.datalink.displayAlert("Successful Transaction", comment + "\n<br/> Go To Account's Tab <br/>To View Your Offline Transactions.");
                  this.dismiss().catch(() => { });
                }
                this.navCtrl.pop();
                this.superTabsCtrl.slideTo(3);
              }).catch((l) => {
                loading.dismiss().catch(() => { })
              })
          }).catch(function (l) {
            loading.dismiss().catch(() => { })
          })
      }, function (l) {
        loading.dismiss().catch(() => { })
        return this.datalink.showToast("Something went wrong checking your offline Balance");
      })
    });
  }

  onClose() {
    this.navCtrl.pop();
    this.superTabsCtrl.slideTo(3);
  }


}
