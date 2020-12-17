import { Component } from '@angular/core';
import { NavController, Platform, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';
import { DatalinkProvider } from '../../providers/datalink/datalink';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Storage } from '@ionic/storage';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { NetworkInterface } from '@ionic-native/network-interface';
@Component({
  selector: 'page-offline-pay',
  templateUrl: 'offline-pay.html',
})
export class OfflinePayPage{
  sellerPortNumber: number = 2000;
  SellerIpAddress: any;
  SellerLocalAddressAndPort: string;
  SellerEncryptedPaymentCode: string;
  SellerDecryptedPaymentCode: string;
  userofflinecode: string;
  endekey: any;
  userid: any;
  username: any;
  userofflinebalance: number;
  createdCode = null;
  scannedCode = null;
  SellerCarrierIpAddress: any;
  TransactionAmount: any;
  SellerOfflineCode: any;
  TransactionPIN: any;
  sepc: any;
  soc: any;
  ta: any;
  acceptedText: any;
  UDetails: any;
  balerror: boolean = false;;
  pinerror: boolean = false;;
  constructor(public alertCtrl: AlertController,
    public sqlite: SQLite,
    public loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private barcodeScanner: BarcodeScanner,
    public dataservice: DataServiceProvider,
    public datalink: DatalinkProvider,
    public storage: Storage,
    public networkInterface: NetworkInterface,
    public navCtrl: NavController, public platform: Platform) {

  }
  ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.networkInterface.getCarrierIPAddress()
        .then(address => {
          this.SellerCarrierIpAddress = address.ip;
        }).catch(error => {
          console.log(error);
        });
    });
  }

  DisconnectServerSocket(acceptInfo, socketInfo) {
    (<any>window).chrome.socket.getInfo(socketInfo.socketId, function (info) {
      console.log("INFO :  " + JSON.stringify(info));
      (<any>window).chrome.socket.disconnect(acceptInfo.socketId);
      (<any>window).chrome.socket.destroy(acceptInfo.socketId);
      (<any>window).chrome.socket.disconnect(socketInfo.socketId);
      (<any>window).chrome.socket.destroy(socketInfo.socketId);
      (<any>window).chrome.socket.getInfo(socketInfo.socketId, function (info) {
        console.log("INFO :  " + JSON.stringify(info));
      })
    });
    (<any>window).chrome.socket.disconnect(acceptInfo.socketId);
    (<any>window).chrome.socket.destroy(acceptInfo.socketId);
    (<any>window).chrome.socket.disconnect(socketInfo.socketId);
    (<any>window).chrome.socket.destroy(socketInfo.socketId);

  }

  DisconnectClientSocket(socketInfo) {
    (<any>window).chrome.socket.getInfo(socketInfo.socketId, function (info) {
      console.log("INFO :  " + JSON.stringify(info));
      (<any>window).chrome.socket.disconnect(socketInfo.socketId);
      (<any>window).chrome.socket.destroy(socketInfo.socketId);
      (<any>window).chrome.socket.getInfo(socketInfo.socketId, function (info) {
        console.log("INFO :  " + JSON.stringify(info));
      })
    });
    (<any>window).chrome.socket.disconnect(socketInfo.socketId);
    (<any>window).chrome.socket.destroy(socketInfo.socketId);
  }



  ViewTransactionDetails(comment) {
    alert("Offline Transaction Completed" + '\n' + comment);
  }


  //---------------------------------------------------------Start Server Code Here---------------------------------------------------------//

  generatePaymentDetails() {
    let tamount = this.alertCtrl.create({
      title: 'Transaction Amount',
      message: "Please type the transaction amount.",
      inputs: [
        {
          name: 'amount',
          placeholder: 'Transaction Amount (Max ₦15,000)',
          type: 'number'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Generate',
          handler: data => {
            if (data.amount <= 15000) {
              this.GenerateCode(data.amount);
            } else {
              this.datalink.showToast("Maximum offline amount exceeded!");
            }
          }
        }
      ]
    });
    tamount.present();
  }

  GenerateCode(amount) {
    this.platform.ready().then(() => {
      this.networkInterface.getCarrierIPAddress()
        .then(address => {
          if (this.SellerCarrierIpAddress) {
            this.SellerIpAddress = this.SellerCarrierIpAddress;
            this.endekey = this.dataservice.GenerateEnDeKey();
            let PaymentCode = this.dataservice.ConvertIpAddresstToText(this.SellerIpAddress, this.endekey);
            this.SellerEncryptedPaymentCode = PaymentCode + "" + this.dataservice.convertNumToLett(this.endekey);
            this.createdCode = String(this.SellerEncryptedPaymentCode).trim();
            let port = this.sellerPortNumber;
            let addr = this.SellerCarrierIpAddress;
            this.ServerCreateListen(addr, port, amount, this.userofflinecode, this.username);
          } else {
            this.SellerIpAddress = address.ip;
            this.endekey = this.dataservice.GenerateEnDeKey();
            let PaymentCode = this.dataservice.ConvertIpAddresstToText(this.SellerIpAddress, this.endekey);
            this.SellerEncryptedPaymentCode = PaymentCode + "" + this.dataservice.convertNumToLett(this.endekey)
            this.createdCode = String(this.SellerEncryptedPaymentCode).trim();
            let port = this.sellerPortNumber;
            let addr = address.ip;
            this.ServerCreateListen(addr, port, amount, this.userofflinecode, this.username);
          }
          var instructionsInfo3 = document.getElementById("instructionsInfo");
          instructionsInfo3.classList.remove("show");
          instructionsInfo3.classList.add("hide");
          var paymentInfo3 = document.getElementById("paymentInfo");
          paymentInfo3.classList.add("show");
          paymentInfo3.classList.remove("hide");
        }).catch(error => {
          this.datalink.showToast("Please its only the Seller that can Generate Invoice, Create Hotspot Connection and Tap the button again.");
        });
    });
  }
  DisplayMessage(msg) {
    var accept = document.getElementById("acceptedText");
    accept.textContent = msg;
    accept.classList.add("show");
    accept.classList.add("greenbtn");
    accept.classList.remove("hide");
  }

  ServerCreateListen(addr, port, amount, payeeid, payeeusername) {
    var _saint = this;
    (<any>window).chrome.socket.create('tcp', {}, function (socketInfo) {
      console.log("Server creating:  " + socketInfo.socketId);
      (<any>window).chrome.socket.listen(socketInfo.socketId, addr, port, function (listenResult) {
        _saint.DisplayMessage("Waiting for Connection");
        (<any>window).chrome.socket.accept(socketInfo.socketId, function (acceptInfo) {
          _saint.DisplayMessage("Seller Accepting Connection");
          (<any>window).chrome.socket.read(acceptInfo.socketId, function (readResult) {
            _saint.DisplayMessage("Connection Established  ");
            let serverArrayBufferResponse = new Uint16Array(readResult.data);
            let convertedResponseResult = _saint.dataservice.ArrayBufferToString(serverArrayBufferResponse);
            console.log("converted string:  " + convertedResponseResult);//check+success=Connection Has Been Established
            //Extract the converted resp result
            let respcheck = String(convertedResponseResult).split("+")[0];
            if (respcheck === "msg") {
              let resp = String(convertedResponseResult).split("+")[1];
              let respvalue = String(resp).split("=")[0];
              if (respvalue === "success") {
                // let msg = String(resp).split("=")[1];
                _saint.DisplayMessage("Sending Payment Invoice");
                let Invoice = "msg+invoice=" + amount + "&" + payeeid + "*" + payeeusername;
                let paydetails = _saint.dataservice.StringToArrayBuffer(Invoice);
                (<any>window).chrome.socket.write(acceptInfo.socketId, paydetails, function (writeResult) {
                  _saint.DisplayMessage("Sending Invoice to the Buyer");
                });

                (<any>window).chrome.socket.read(acceptInfo.socketId, function (readResult) {
                  _saint.DisplayMessage("Checking Buyer Payment Response");
                  let serverBufferResponse = new Uint16Array(readResult.data);
                  let convertedResponseRes = _saint.dataservice.ArrayBufferToString(serverBufferResponse);
                  console.log("Checking Buyer Payment Response:  " + convertedResponseRes);
                  //Extract the converted resp result
                  let respcheck = String(convertedResponseRes).split("+")[0];
                  if (respcheck === "msg") {
                    let resp2 = String(convertedResponseRes).split("+")[1];
                    let resvalue2 = String(resp2).split("=")[0];
                    if (resvalue2 === "pay") {
                      let BuyerOfflineCode = String(resp2).split("=")[1];
                      let TransactionType = "Credit";
                      let SellerOfflineCode = payeeid;
                      let userid = _saint.userid; // write a function that return user id or get it from the offline db or ionic persistent storage
                      _saint.sqlite.create({
                        name: "wmpaybd.db",
                        location: 'default'
                      }).then((db: SQLiteObject) => {
                        db.executeSql("SELECT * FROM users WHERE userid = ?", [userid])
                          .then(res => {
                            if (res.rows.length > 0) {
                              let oldAmount = res.rows.item(0).offlinebalance;
                              let status = "Completed";
                              let newAmount = parseInt(oldAmount) + parseInt(amount);
                              _saint.userofflinebalance = newAmount;
                              let tid = _saint.dataservice.generateId();
                              let date = _saint.dataservice.getDate();
                              let time = _saint.dataservice.getTime();
                              let datenow = String(date).replace("/", "").replace("/", "");
                              let timenow = String(time).replace(":", "").replace(":", "");
                              let transactionId = "OP" + "" + BuyerOfflineCode + "" + SellerOfflineCode + "" + datenow + "" + timenow;
                              let comment = "Your Offline Account has been " + TransactionType + "ed with " + _saint.dataservice.CurrencyFormat(amount) + " at " + date + " " + time + ". New balance is " + _saint.dataservice.CurrencyFormat(newAmount);
                              _saint.DisplayMessage(comment);
                              db.executeSql("INSERT INTO transactions VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", [tid, TransactionType, userid, BuyerOfflineCode, SellerOfflineCode, amount, transactionId, oldAmount, newAmount, date, time, comment, status])
                                .then(transres => {
                                  console.log("Save Transaction Successful " + JSON.stringify(transres));
                                  db.executeSql('UPDATE users SET offlinebalance = ? WHERE userid = ?', [newAmount, userid])
                                    .then(userres => {
                                      console.log("Offline Balance Updated " + JSON.stringify(userres));
                                      let paydetails = _saint.dataservice.StringToArrayBuffer("msg+success=completed");
                                      (<any>window).chrome.socket.write(acceptInfo.socketId, paydetails, function (writeResult) {
                                        _saint.DisplayMessage("Loading Transactions Details");
                                        _saint.DisconnectServerSocket(acceptInfo, socketInfo);
                                        _saint.ViewTransactionDetails(comment);
                                        return false;
                                      });
                                    })
                                    .catch(e => {
                                      let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=error");
                                      (<any>window).chrome.socket.write(acceptInfo.socketId, paydetails, function (writeResult) {
                                        _saint.DisplayMessage("Storage error transaction terminated");
                                        _saint.DisconnectServerSocket(acceptInfo, socketInfo);
                                        return false;
                                      });
                                    });
                                })
                                .catch(e => {
                                  let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=error");
                                  (<any>window).chrome.socket.write(acceptInfo.socketId, paydetails, function (writeResult) {
                                    _saint.DisplayMessage("Storage error transaction terminated");
                                    _saint.DisconnectServerSocket(acceptInfo, socketInfo);
                                    return false;
                                  });
                                });
                            }
                          }).catch(e => {
                            console.log("Get each user data error" + JSON.stringify(e));
                            let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=error");
                            (<any>window).chrome.socket.write(acceptInfo.socketId, paydetails, function (writeResult) {
                              _saint.DisplayMessage("Storage error transaction terminated");
                              _saint.DisconnectServerSocket(acceptInfo, socketInfo);
                              return false;
                            });
                          });
                      }).catch(e => {
                        console.log("db error " + JSON.stringify(e));
                        let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=error");
                        (<any>window).chrome.socket.write(acceptInfo.socketId, paydetails, function (writeResult) {
                          _saint.DisplayMessage("Storage error transaction terminated");
                          _saint.DisconnectServerSocket(acceptInfo, socketInfo);
                          return false;
                        });
                      });
                    } else if (resvalue2 === "cancelled") {
                      let resmsg = (String(resp2).split("=")[1]);
                      _saint.DisplayMessage(resmsg);
                      _saint.DisconnectServerSocket(acceptInfo, socketInfo);
                      _saint.ShowInfo();
                      return false;
                    }
                  }
                });
              } else if (respvalue === "failed") {
                // let msg = String(resp).split("=")[1];
                _saint.DisplayMessage("The transaction failed and transaction has been terminated.");
                _saint.DisconnectServerSocket(acceptInfo, socketInfo);
                var instructionsInfo5 = document.getElementById("instructionsInfo");
                instructionsInfo5.classList.remove("hide");
                instructionsInfo5.classList.add("show");
                var paymentInfo = document.getElementById("paymentInfo");
                paymentInfo.classList.add("hide");
                paymentInfo.classList.remove("show");
                return false;
              } else if (respvalue === "cancelled") {
                // let msg = String(resp).split("=")[1];
                _saint.DisplayMessage("The transaction was cancelled and transaction terminated.");
                _saint.DisconnectServerSocket(acceptInfo, socketInfo);
                var instructionsInfo2 = document.getElementById("instructionsInfo");
                instructionsInfo2.classList.remove("hide");
                instructionsInfo2.classList.add("show");
                var paymentInfo2 = document.getElementById("paymentInfo");
                paymentInfo2.classList.add("hide");
                paymentInfo2.classList.remove("show");
                return false;
              }
            }
          });
        });

      });
    });
  }
  //---------------------------------------------------------End Server Code Here---------------------------------------------------------//





  //---------------------------------------------------------Start Client Code Here---------------------------------------------------------//
  selectPaymentOption() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Scan Payment Details',
          handler: () => {
            this.scanPaymentCode();
          }
        }, {
          text: 'Type Payment Details',
          handler: () => {
            this.typePaymentCode()
          }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  scanPaymentCode() {
    this.barcodeScanner.scan().then(barcodeData => {
      this.scannedCode = barcodeData.text;
      this.decodeScannedCode(this.scannedCode);
      var instructionsInfo = document.getElementById("instructionsInfo");
      instructionsInfo.classList.remove("show");
      instructionsInfo.classList.add("hide");
      var paymentInfo = document.getElementById("paymentInfo");
      paymentInfo.classList.add("show");
      paymentInfo.classList.remove("hide");
    }, (err) => {
      console.log('Error: ' + err);
    });
  }

  decodeScannedCode(scannedCode) {
    this.sepc = scannedCode;
    this.CreateClientConnection(scannedCode);
  }

  typePaymentCode() {
    let pay = this.alertCtrl.create({
      message: "Please fill the payment details below.",
      inputs: [
        {
          name: 'sellerencryptedpaymentcode',
          placeholder: 'Seller Payment Code (All Caps)',
          type: 'text'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Pay',
          handler: data => {
            this.CreateClientConnection(data.sellerencryptedpaymentcode);
          }
        }
      ]
    });
    pay.present();
  }

  CreateClientConnection(SellerEncryptedPaymentCode) {
    let encryptedkey = String(SellerEncryptedPaymentCode).trim().slice(-1);
    let key = this.dataservice.decrypt(encryptedkey);
    let selleriptext = SellerEncryptedPaymentCode.slice(0, -1);
    let sellerIPAddress = this.dataservice.ConvertTextToIpAddress(selleriptext, key);
    let sellerPortNumber = this.sellerPortNumber;
    this.ClientConnection(sellerPortNumber, sellerIPAddress);
  }

  ClientConnection(sellerPortNumber, sellerIPAddress) {
    var _saint = this;
    (<any>window).chrome.socket.create('tcp', {}, function (socketInfo) {
      (<any>window).chrome.socket.connect(socketInfo.socketId, sellerIPAddress, sellerPortNumber, function (connectResult) {
        _saint.DisplayMessage("Verifying Seller's Details");
        var connected = (connectResult === 0);
        if (connected) {
          (<any>window).chrome.socket.getInfo(socketInfo.socketId, function (info) {
            console.log("INFO :  " + JSON.stringify(info));
            let cxnmsg = "msg+success=Connection Establish"
            let cxnstring = _saint.dataservice.StringToArrayBuffer(cxnmsg);
            (<any>window).chrome.socket.write(socketInfo.socketId, cxnstring, function (writeResult) {
              _saint.DisplayMessage("Connection Has Been Established");
            });

            (<any>window).chrome.socket.read(socketInfo.socketId, function (readResult) {
              _saint.DisplayMessage("Payment Invoice Received");
              var serverrecv = new Uint16Array(readResult.data);
              var convertedInvoiceResponseResult = _saint.dataservice.ArrayBufferToString(serverrecv);
              console.log("converted string:  " + convertedInvoiceResponseResult);
              let respcheck2 = String(convertedInvoiceResponseResult).split("+")[0]; //pay||msg
              if (respcheck2 === "msg") {
                let resp2 = String(convertedInvoiceResponseResult).split("+")[1];
                let respvalue = String(resp2).split("=")[0];
                if (respvalue === "invoice") {
                  let msg2 = String(resp2).split("=")[1];
                  let transactionamount = String(msg2).split("&")[0];
                  let sellerdetails = String(msg2).split("&")[1];
                  let sellerofflinecode = String(sellerdetails).split("*")[0];
                  let sellerofflinename = String(sellerdetails).split("*")[1];
                  let buyerofflinecode = _saint.userofflinecode;
                  let verifyingamount = _saint.dataservice.CurrencyFormat(transactionamount);
                  let verifyInvoice = _saint.alertCtrl.create({
                    title: 'Confirm Transaction Amount',
                    message: "Enter your correct 4-digit transaction pin to confirm transaction amount of " + verifyingamount + " to " + sellerofflinename + ". Two attempts only.",
                    inputs: [
                      {
                        name: 'pin',
                        placeholder: 'Transaction PIN (e.g: 1234)',
                        type: 'password'
                      },
                    ],
                    buttons: [
                      {
                        text: 'Cancel',
                        handler: data => {
                          console.log('Disagree clicked');
                          _saint.DisplayMessage("The transaction was cancelled and its terminated. Please scan or type the code again.");
                          let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=The transaction was cancelled and its terminated. Please generate the invoice again.");
                          (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                            console.log("Transaction Cancelled Message:  " + JSON.stringify(writeResult));
                            _saint.DisconnectClientSocket(socketInfo);
                            _saint.ShowInfo();
                            return false;
                          });
                        }
                      },
                      {
                        text: 'Pay',
                        handler: data => {
                          if (data.pin === "" || data.pin === undefined || isNaN(parseInt(data.pin)) || data.pin === null) {
                            _saint.DisplayMessage("The Transaction Pin input was wrong. Please scan or type the code again. (What did you expect?)");
                            let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=The Transaction Pin input was wrong. Please generate the invoice again.");
                            (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                              console.log("Transaction Failed Message:  " + JSON.stringify(writeResult));
                              _saint.DisconnectClientSocket(socketInfo);
                              return false;
                            });
                          } else {
                            _saint.platform.ready().then(() => {
                              _saint.sqlite.create({
                                name: "wmpaybd.db",
                                location: "default"
                              }).then((db: SQLiteObject) => {
                                db.executeSql('CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)', [])
                                  .then(res => { console.log('usersTable SELECT created ' + JSON.stringify(res)) })
                                  .catch(e => { console.log("usersTable SELECT created " + JSON.stringify(e)) });
                                db.executeSql("SELECT * FROM users WHERE userid = ?", [_saint.userid])
                                  .then(res => {
                                    if (res.rows.length > 0) {
                                      let transpin = res.rows.item(0).transactionpin;
                                      if (parseInt(transpin) === parseInt(data.pin)) {
                                        let oldAmount = res.rows.item(0).offlinebalance;
                                        if (parseInt(oldAmount) > parseInt(transactionamount)) {
                                          let TransactionType = "Debit";
                                          let oldAmount = res.rows.item(0).offlinebalance;
                                          let status = "Pending";
                                          let userid = _saint.userid;
                                          let newAmount = parseInt(oldAmount) - parseInt(transactionamount);
                                          _saint.userofflinebalance = newAmount;
                                          let tid = _saint.dataservice.generateId();
                                          let date = _saint.dataservice.getDate();
                                          let time = _saint.dataservice.getTime();
                                          let datenow = String(date).replace("/", "").replace("/", "");
                                          let timenow = String(time).replace(":", "").replace(":", "");
                                          let transactionId = "OP" + "" + buyerofflinecode + "" + sellerofflinecode + "" + datenow + "" + timenow;
                                          let comment = "Your Offline Account has been " + TransactionType + "ed with " + _saint.dataservice.CurrencyFormat(transactionamount) + " at " + time + " " + date + ". New balance is " + _saint.dataservice.CurrencyFormat(newAmount);

                                          db.executeSql("INSERT INTO transactions VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", [tid, TransactionType, userid, buyerofflinecode, sellerofflinecode, transactionamount, transactionId, oldAmount, newAmount, date, time, comment, status])
                                            .then(transres => {
                                              db.executeSql('UPDATE users SET offlinebalance = ? WHERE userid = ?', [newAmount, userid])
                                                .then(userres => {
                                                  _saint.DisplayMessage("Please wait for the Seller to process transaction");
                                                  let paydetails = _saint.dataservice.StringToArrayBuffer("msg+pay=" + buyerofflinecode);
                                                  (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                    console.log("sending payment response to seller");
                                                  });

                                                  (<any>window).chrome.socket.read(socketInfo.socketId, function (readResult) {
                                                    _saint.DisplayMessage("Checking Seller's Payment Response");
                                                    let clientArrayBufferResponse = new Uint16Array(readResult.data);
                                                    let convertedMsgResponseResult = _saint.dataservice.ArrayBufferToString(clientArrayBufferResponse);
                                                    console.log("converted string: " + convertedMsgResponseResult);
                                                    let msgcheck = String(convertedMsgResponseResult).split("+")[0];
                                                    if (msgcheck === "msg") {
                                                      let res = String(convertedMsgResponseResult).split("+")[1];
                                                      let resvalue2 = String(res).split("=")[0];
                                                      if (resvalue2 === "success") {
                                                        //Update debit transaction status to Completed
                                                        let newstatus = "Completed";
                                                        db.executeSql("UPDATE transactions SET status = ? WHERE transid = ?", [newstatus, tid])
                                                          .then(userres => {
                                                            console.log("Transaction Status Update Successful" + JSON.stringify(userres));
                                                            _saint.DisplayMessage("Loading Transactions Details");
                                                            _saint.DisconnectClientSocket(socketInfo);
                                                            _saint.ViewTransactionDetails(comment)
                                                          })
                                                          .catch(e => {
                                                            _saint.DisconnectClientSocket(socketInfo);
                                                            _saint.DisplayMessage("Failed");
                                                          });
                                                      } else if (res === "failed") {
                                                        //Revert the logged credit transaction
                                                        _saint.DisplayMessage("Transaction failed and its reverting please wait");
                                                        db.executeSql("SELECT * FROM transactions WHERE transid = ?", [tid])
                                                          .then(res => {
                                                            if (res.rows.length > 0) {
                                                              let transactionAmount = res.rows.item(0).amount;
                                                              let userid = _saint.userid; // write a function that returns user id from the offline db or ionic persistent storage
                                                              db.executeSql("SELECT * FROM users WHERE userid = ?", [userid])
                                                                .then(res => {
                                                                  if (res.rows.length > 0) {
                                                                    let currentOfflineBalance = res.rows.item(0).offlinebalance;
                                                                    let newOfflineBalance = parseInt(currentOfflineBalance) - parseInt(transactionAmount);
                                                                    _saint.userofflinebalance = newOfflineBalance;
                                                                    //update the user offline bal with the new amount
                                                                    db.executeSql('UPDATE users SET offlinebalance = ? WHERE userid = ?', [newOfflineBalance, userid])
                                                                      .then(userres => {
                                                                        console.log("Offline Balance Updated Success " + JSON.stringify(userres));
                                                                        _saint.DisplayMessage("Balance Updated Completed");
                                                                      })
                                                                      .catch(e => {
                                                                        console.log("Offline Balance Updated Failed " + JSON.stringify(e));
                                                                        _saint.DisconnectClientSocket(socketInfo);
                                                                        _saint.DisplayMessage("Balance Updated Failed");
                                                                      });
                                                                    //delete the transaction
                                                                    db.executeSql('DELETE FROM transactions WHERE transid = ?', [tid])
                                                                      .then(res => {
                                                                        console.log("Delete Reverted Transaction Success " + JSON.stringify(res));
                                                                        _saint.DisconnectClientSocket(socketInfo);
                                                                        _saint.DisplayMessage("Delete Reverted Transaction Completed");
                                                                      })
                                                                      .catch(e => {
                                                                        let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=An error occured please try again");
                                                                        (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                          console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                                          _saint.DisplayMessage("Failed");
                                                                          _saint.DisconnectClientSocket(socketInfo);
                                                                        });
                                                                      });
                                                                  }
                                                                }).catch(e => {
                                                                  let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=An error occured please try again");
                                                                  (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                    console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                                    _saint.ShowInfo();
                                                                    _saint.DisconnectClientSocket(socketInfo);
                                                                  });
                                                                });
                                                            }
                                                          }).catch(e => {
                                                            let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=An error occured please try again");
                                                            (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                              console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                              _saint.ShowInfo();
                                                              _saint.DisconnectClientSocket(socketInfo);
                                                            });
                                                          });
                                                      }
                                                    }
                                                  });
                                                }).catch(e => {
                                                  let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=An error occured please try again");
                                                  (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                    console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                    _saint.ShowInfo();
                                                    _saint.DisconnectClientSocket(socketInfo);
                                                  });
                                                });
                                            })
                                            .catch(e => {
                                              let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=An error occured please try again");
                                              (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                _saint.ShowInfo();
                                                _saint.DisconnectClientSocket(socketInfo);
                                              });
                                            });
                                        } else {
                                          _saint.DisplayMessage("Insufficient Offline Balance, please fund your offline account.");
                                          let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=Payer has Insufficient Offline Balance. Please generate the invoice again if the payer is still willing to pay.");
                                          (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                            console.log("Transaction Cancelled Message:  " + JSON.stringify(writeResult));
                                            _saint.DisconnectClientSocket(socketInfo);
                                            _saint.ShowInfo();
                                            return false;
                                          });
                                        }
                                      } else {
                                        _saint.DisplayMessage("Invalid Transaction Pin");
                                        let newalert = _saint.alertCtrl.create({
                                          title: 'Invalid Transaction Pin',
                                          message: "This is your last attempt. Enter your correct 4-digit pin to confirm transaction amount of " + verifyingamount + " to " + sellerofflinename + ", the transaction will be terminated if the pin is incorrect. Do you wish to try again?",
                                          inputs: [
                                            {
                                              name: 'pin',
                                              placeholder: 'Transaction PIN (e.g: 1234)',
                                              type: 'password'
                                            },
                                          ],
                                          buttons: [
                                            {
                                              text: 'No',
                                              handler: data => {
                                                console.log('Disagree clicked');
                                                _saint.DisplayMessage("The transaction was cancelled and it's terminated. Please scan or type the code again.");
                                                let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=The transaction was cancelled and its terminated. Please generate the invoice again.");
                                                (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                  console.log("Transaction Cancelled Message:  " + JSON.stringify(writeResult));
                                                  _saint.DisconnectClientSocket(socketInfo);
                                                  _saint.ShowInfo();
                                                  return false;
                                                });
                                              }
                                            },
                                            {
                                              text: 'Yes',
                                              handler: data2 => {
                                                if (data2.pin === "" || data2.pin === undefined || isNaN(parseInt(data2.pin)) || data2.pin === null) {
                                                  _saint.DisplayMessage("The Transaction Pin input was wrong. Please scan or type the code again. (What did you expect?)");
                                                  let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=The Transaction Pin input was wrong. Please generate the invoice again.");
                                                  (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                    console.log("Transaction Failed Message:  " + JSON.stringify(writeResult));
                                                    _saint.ShowInfo();
                                                    _saint.DisconnectClientSocket(socketInfo);
                                                  });
                                                } else {
                                                  _saint.platform.ready().then(() => {
                                                    _saint.sqlite.create({
                                                      name: "wmpaybd.db",
                                                      location: "default"
                                                    }).then((db: SQLiteObject) => {
                                                      db.executeSql('CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)', [])
                                                        .then(res => { console.log('usersTable SELECT created ' + JSON.stringify(res)) })
                                                        .catch(e => { console.log("usersTable SELECT created " + JSON.stringify(e)) });
                                                      db.executeSql("SELECT * FROM users WHERE userid = ?", [_saint.userid])
                                                        .then(res => {
                                                          if (res.rows.length > 0) {
                                                            let transactionpin = res.rows.item(0).transactionpin;
                                                            if (parseInt(transactionpin) === parseInt(data2.pin)) {
                                                              let oldAmount = res.rows.item(0).offlinebalance;
                                                              if (parseInt(oldAmount) > parseInt(transactionamount)) {
                                                                let TransactionType = "Debit";
                                                                let oldAmount = res.rows.item(0).offlinebalance;
                                                                let status = "Pending";
                                                                let userid = _saint.userid;
                                                                let newAmount = parseInt(oldAmount) - parseInt(transactionamount);
                                                                _saint.userofflinebalance = newAmount;
                                                                let tid = _saint.dataservice.generateId();
                                                                let date = _saint.dataservice.getDate();
                                                                let time = _saint.dataservice.getTime();
                                                                let datenow = String(date).replace("/", "").replace("/", "");
                                                                let timenow = String(time).replace(":", "").replace(":", "");
                                                                let transactionId = "OP" + "" + buyerofflinecode + "" + sellerofflinecode + "" + datenow + "" + timenow;
                                                                let comment = "Your Offline Account has been " + TransactionType + "ed with " + _saint.dataservice.CurrencyFormat(transactionamount) + " at " + time + " " + date + ". New balance is " + _saint.dataservice.CurrencyFormat(newAmount);
                                                                db.executeSql("INSERT INTO transactions VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", [tid, TransactionType, userid, buyerofflinecode, sellerofflinecode, transactionamount, transactionId, oldAmount, newAmount, date, time, comment, status])
                                                                  .then(transres => {
                                                                    db.executeSql('UPDATE users SET offlinebalance = ? WHERE userid = ?', [newAmount, userid])
                                                                      .then(userres => {
                                                                        _saint.DisplayMessage("Please wait for the Seller to process transaction");
                                                                        let paydetails = _saint.dataservice.StringToArrayBuffer("msg+pay=" + buyerofflinecode);
                                                                        (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                          console.log("sending payment response to seller");
                                                                        });

                                                                        (<any>window).chrome.socket.read(socketInfo.socketId, function (readResult) {
                                                                          _saint.DisplayMessage("Checking Seller's Payment Response");
                                                                          let clientArrayBufferResponse = new Uint16Array(readResult.data);
                                                                          let convertedMsgResponseResult = _saint.dataservice.ArrayBufferToString(clientArrayBufferResponse);
                                                                          console.log("converted string: " + convertedMsgResponseResult);
                                                                          let msgcheck = String(convertedMsgResponseResult).split("+")[0];
                                                                          if (msgcheck === "msg") {
                                                                            let res = String(convertedMsgResponseResult).split("+")[1];
                                                                            let resvalue2 = String(res).split("=")[0];
                                                                            if (resvalue2 === "success") {
                                                                              //Update debit transaction status to Completed
                                                                              let newstatus = "Completed";
                                                                              db.executeSql("UPDATE transactions SET status = ? WHERE transid = ?", [newstatus, tid])
                                                                                .then(userres => {
                                                                                  console.log("Transaction Status Update Successful" + JSON.stringify(userres));
                                                                                  _saint.DisplayMessage("Loading Transactions Details");
                                                                                  _saint.DisconnectClientSocket(socketInfo);
                                                                                  _saint.ViewTransactionDetails(comment)
                                                                                })
                                                                                .catch(e => {
                                                                                  _saint.DisplayMessage("Invalid Transaction Pin, please try again maximum trail exceeded.");
                                                                                  let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=Transaction Cancelled");
                                                                                  (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                                    console.log("Transaction Cancelled Message:  " + JSON.stringify(writeResult));
                                                                                    _saint.DisconnectClientSocket(socketInfo);
                                                                                    _saint.ShowInfo();
                                                                                    return false;
                                                                                  });
                                                                                });
                                                                            } else if (res === "failed") {
                                                                              //Revert the logged credit transaction
                                                                              _saint.DisplayMessage("Transaction failed and its reverting please wait");
                                                                              db.executeSql("SELECT * FROM transactions WHERE transid = ?", [tid])
                                                                                .then(res => {
                                                                                  if (res.rows.length > 0) {
                                                                                    let transactionAmount = res.rows.item(0).amount;
                                                                                    let userid = _saint.userid; // write a function that returns user id from the offline db or ionic persistent storage
                                                                                    db.executeSql("SELECT * FROM users WHERE userid = ?", [userid])
                                                                                      .then(res => {
                                                                                        if (res.rows.length > 0) {
                                                                                          let currentOfflineBalance = res.rows.item(0).offlinebalance;
                                                                                          let newOfflineBalance = parseInt(currentOfflineBalance) - parseInt(transactionAmount);
                                                                                          _saint.userofflinebalance = newOfflineBalance;
                                                                                          //update the user offline bal with the new amount
                                                                                          db.executeSql('UPDATE users SET offlinebalance = ? WHERE userid = ?', [newOfflineBalance, userid])
                                                                                            .then(userres => {
                                                                                              console.log("Offline Balance Updated Success " + JSON.stringify(userres));
                                                                                              _saint.DisplayMessage("Balance Updated Completed");
                                                                                            })
                                                                                            .catch(e => {
                                                                                              console.log("Offline Balance Updated Failed " + JSON.stringify(e));
                                                                                              _saint.DisconnectClientSocket(socketInfo);
                                                                                              _saint.DisplayMessage("Balance Updated Failed");
                                                                                            });
                                                                                          //delete the transaction
                                                                                          db.executeSql('DELETE FROM transactions WHERE transid = ?', [tid])
                                                                                            .then(res => {
                                                                                              console.log("Delete Reverted Transaction Success " + JSON.stringify(res));
                                                                                              _saint.DisconnectClientSocket(socketInfo);
                                                                                              _saint.DisplayMessage("Delete Reverted Transaction Completed");
                                                                                            })
                                                                                            .catch(e => {
                                                                                              let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=An error occured please try again");
                                                                                              (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                                                console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                                                                _saint.ShowInfo();
                                                                                                _saint.DisconnectClientSocket(socketInfo);
                                                                                              });
                                                                                            });
                                                                                        }
                                                                                      }).catch(e => {
                                                                                        let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=An error occured please try again");
                                                                                        (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                                          console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                                                          _saint.DisplayMessage("Failed");
                                                                                          _saint.DisconnectClientSocket(socketInfo);
                                                                                        });
                                                                                      });
                                                                                  }
                                                                                }).catch(e => {
                                                                                  let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=An error occured please try again");
                                                                                  (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                                    console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                                                    _saint.ShowInfo();
                                                                                    _saint.DisconnectClientSocket(socketInfo);
                                                                                  });
                                                                                });
                                                                            }
                                                                          }
                                                                        });
                                                                      }).catch(e => {
                                                                        let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=An error occured please try again");
                                                                        (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                          console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                                          _saint.ShowInfo();
                                                                          _saint.DisconnectClientSocket(socketInfo);
                                                                        });
                                                                      });
                                                                  })
                                                                  .catch(e => {
                                                                    let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=An error occured please try again");
                                                                    (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                      console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                                      _saint.ShowInfo();
                                                                      _saint.DisconnectClientSocket(socketInfo);
                                                                    });
                                                                  });

                                                              } else {
                                                                _saint.DisplayMessage("Insufficient Offline Balance, please fund your offline account.");
                                                                let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=Payer has Insufficient Offline Balance. Please generate the invoice again if the payer is still willing to pay.");
                                                                (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                  console.log("Transaction Failed Message: " + JSON.stringify(writeResult)); _saint.ShowInfo();
                                                                  _saint.DisconnectClientSocket(socketInfo);
                                                                  return false;
                                                                });
                                                              }
                                                            } else {
                                                              _saint.DisplayMessage("Invalid Transaction Pin, please maximum attempts exceeded, scan or type the code again");
                                                              let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=Invalid Transaction Pin, maximum attempts exceeded, transaction terminated. Please generate the invoice again to receive payment.");
                                                              (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                                console.log("Transaction Cancelled Message:  " + JSON.stringify(writeResult));
                                                                _saint.DisconnectClientSocket(socketInfo);
                                                                return false;
                                                              });
                                                            }
                                                          }
                                                        })
                                                        .catch(e => {
                                                          _saint.DisplayMessage("Something went wrong checking your offline Balance");
                                                          let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=Something went wrong checking your offline Balance");
                                                          (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                            console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                            _saint.DisconnectClientSocket(socketInfo);
                                                          });
                                                          return false;
                                                        });
                                                    }, (error) => {
                                                      _saint.DisplayMessage("Something went wrong checking your offline Balance");
                                                      let paydetails = _saint.dataservice.StringToArrayBuffer("msg+failed=Something went wrong checking your offline Balance");
                                                      (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                                        console.log("Failed Payment : " + JSON.stringify(writeResult));
                                                        _saint.DisconnectClientSocket(socketInfo);
                                                      });
                                                      return false;
                                                    });
                                                  })
                                                }

                                              }
                                            }
                                          ]
                                        });
                                        newalert.present();
                                      }
                                    } else {
                                      _saint.DisplayMessage("Something went wrong getting your offline Balance.");
                                      let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=Something went wrong getting the Payer offline balance. Please generate invoice again to receive payment");
                                      (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                        console.log("Transaction Terminated Message:  " + JSON.stringify(writeResult));
                                        _saint.DisconnectClientSocket(socketInfo);
                                        _saint.ShowInfo();
                                        return false;
                                      });
                                    }
                                  })
                                  .catch(e => {
                                    _saint.DisplayMessage("Something went wrong getting your offline Balance.");
                                    let paydetails = _saint.dataservice.StringToArrayBuffer("msg+cancelled=Something went wrong getting the Payer offline balance. Please generate invoice again to receive payment");
                                    (<any>window).chrome.socket.write(socketInfo.socketId, paydetails, function (writeResult) {
                                      console.log("Transaction Terminated Message:  " + JSON.stringify(writeResult));
                                      _saint.DisconnectClientSocket(socketInfo);
                                      _saint.ShowInfo();
                                      return false;
                                    });
                                  });
                              }, (error) => {
                                _saint.DisplayMessage("Something went wrong checking your offline Balance");
                                return false;
                              });
                            })
                          }
                        }
                      }
                    ]
                  });
                  verifyInvoice.present();
                }
              }
            });
          });
        } else {
          this.DisplayMessage("Verifying Seller's Details Failed, Please check the Network Connection or the Payment Code.");
        }
      });
    });
  }




  //---------------------------------------------------------End Client Code Here---------------------------------------------------------//
  ShowInfo() {
    var instructionsInfo22 = document.getElementById("instructionsInfo");
    instructionsInfo22.classList.remove("hide");
    instructionsInfo22.classList.add("show");
    var paymentInfo22 = document.getElementById("paymentInfo");
    paymentInfo22.classList.add("hide");
    paymentInfo22.classList.remove("show");
  }

  
}
