import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform, ToastController } from 'ionic-angular';
import { DatalinkProvider } from '../datalink/datalink';


@Injectable()
export class DataServiceProvider {
  day: any;
  month: any;
  year: any;
  today: any;
  hour: any;
  minute: any;
  second: any;

  constructor(public datalink: DatalinkProvider, public sqlite: SQLite, public toastCtrl: ToastController,
    public platform: Platform, public http: HttpClient) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: "wmpaybd.db",
        location: "default"
      }).then((db: SQLiteObject) => {
        db.executeSql('CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)', [])
          .then(res => { console.log('userstbl created  ' + JSON.stringify(res)) })
          .catch(e => { console.log("userstbl  " + JSON.stringify(e)) });
        db.executeSql('CREATE TABLE IF NOT EXISTS transactions(transid TEXT, transactiontype TEXT, userid TEXT, fromuserid TEXT, touserid TEXT, amount TEXT, transactionid TEXT, oldbalance TEXT, newbalance TEXT, date DATE, time TIME, comment TEXT, status TEXT)', [])
          .then(res => { console.log('transactionstbl  created  ' + JSON.stringify(res)) })
          .catch(e => { console.log("transactionsTable " + JSON.stringify(e)) });
      }, (e) => { console.log("db creation error:  " + JSON.stringify(e)); });

    });
  }
  //---------------------- Start Offline Storage -------------------------//
  GetUserLoginDetails(UserDetails) {
    this.platform.ready().then(()  => {
     if (this.platform.is("cordova")) {
      this.SaveUser(UserDetails.userId, UserDetails.Username, 0, "0000", "0000", "0000", UserDetails.email, UserDetails.phone_number)
     }
    })
   }

  SaveUser(userid, username, offlinebal, offlinecode, transactionpin, appuserpin, email, phone) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: "wmpaybd.db",
        location: "default"
      }).then((db: SQLiteObject) => {
        db.executeSql('CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)', [])
          .then(res => { console.log('usersTable  created 1 ' + JSON.stringify(res)) })
          .catch(e => { console.log("usersTable created 1  error " + JSON.stringify(e)) });
        db.executeSql("INSERT INTO users VALUES(?,?,?,?,?,?,?,?)", [userid, username, offlinebal, offlinecode, transactionpin, appuserpin, email, phone])
          .then(res => { console.log("INSERT User success 1 " + JSON.stringify(res)); })
          .catch(e => { console.log("INSERT error 1 :  " + JSON.stringify(e)); });
      }).catch(e => { console.log("db creation error 1 :  " + JSON.stringify(e)); });
    });
  }

  SaveTransaction(id, type, userid, fromuserid, touserid, amount, transactionid, oldbalance, newbalance, date, time, comment, status) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: "wmpaybd.db",
        location: "default"
      }).then((db: SQLiteObject) => {
        db.executeSql('CREATE TABLE IF NOT EXISTS transactions(transid TEXT, transactiontype TEXT, userid TEXT, fromuserid TEXT, touserid TEXT, amount TEXT, transactionid TEXT, oldbalance TEXT, newbalance TEXT, date DATE, time TIME, comment TEXT, status TEXT)', [])
          .then(res => { console.log('usersTable  created 1 ' + JSON.stringify(res)) })
          .catch(e => { console.log("usersTable created 1  error " + JSON.stringify(e)) });
        db.executeSql("INSERT INTO transactions VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", [id, type, userid, fromuserid, touserid, amount, transactionid, oldbalance, newbalance, date, time, comment, status])
          .then(res => {
            alert("INSERT Transaction success 1 " + JSON.stringify(res));
            alert("last insertId: " + res.insertId);
          })
          .catch(e => {
            console.log("INSERT error 1 :  " + JSON.stringify(e));
            return undefined
          });
      }).catch(e => { console.log("db creation error 1 :  " + JSON.stringify(e)); });
    });

  }


  UpdateOfflineBalance(userid, newAmount) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: "wmpaybd.db",
        location: "default"
      }).then((db: SQLiteObject) => {
        db.executeSql('CREATE TABLE IF NOT EXISTS users(userid TEXT, username TEXT, offlinebalance TEXT, offlinecode TEXT, transactionpin TEXT, appuserpin TEXT, email TEXT, phone TEXT)', [])
          .then(res => { console.log('usersTable SELECT created ' + JSON.stringify(res)) })
          .catch(e => { console.log("usersTable SELECT created " + JSON.stringify(e)) });
        db.executeSql('UPDATE users SET offlinebalance = ? WHERE userid = ?', [newAmount, userid])
          .then(userres => {
            this.datalink.showToast("Your Offline Account has been funded successfully");
          })
          .catch(e => {

          });
      }, (error) => { console.log("db creation error:  " + error); });
    });
  }


  GenerateUserId() {
    var text = 0;
    text = Math.floor(Math.random() * 9) + 1
    return text;
  }

  GenerateUserName() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabecefghijklmnopqrstuvwxyz";
    for (var i = 0; i <= 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }
  GenerateUserOfflineCode() {
    var text = "";
    var possible = "0123456789";
    for (var i = 0; i <= 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }
  GenerateUserTransactionPIN() {
    var text = "";
    var possible = "0123456789";
    for (var i = 0; i <= 3; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }
  CurrencyFormat(price) {
    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    });
    price = formatter.format(price);
    return price = price.replace("NGN", "₦");
  }
  //---------------------- End Offline Storage -------------------------//


  //---------------------- Start Conversation Process -------------------------//
  ArrayBufferToString(buffer) {
    return String.fromCharCode.apply(null, new Uint16Array(buffer));
  }


  StringToArrayBuffer(string) {
    var buf = new ArrayBuffer(string.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = string.length; i < strLen; i++) {
      bufView[i] = string.charCodeAt(i);
    }
    return buf;
  }
  GenerateEnDeKey() {
    var text = 0;
    text = Math.floor(Math.random() * 9) + 1
    return text;
  }

  ConvertIpAddresstToText(ipaddress, encryptkey) {
    var text = "";
    for (var i = 0; i < ipaddress.length; i++) {
      text += this.encrypt(ipaddress.charAt(i), encryptkey);
      if (String(text).length === 3 || String(text).length === 7 || String(text).length === 11 || String(text).length === 15) {
        text += " ";
      }
    }
    return text;
  }

  encrypt(number, key) {
    var text = "";
    let value = parseInt(number) + parseInt(key);
    if (value === 1) {
      text += "A";
    } else if (value === 2) {
      text += "B";
    } else if (value === 3) {
      text += "C";
    } else if (value === 4) {
      text += "D";
    } else if (value === 5) {
      text += "E";
    } else if (value === 6) {
      text += "F";
    } else if (value === 7) {
      text += "G";
    } else if (value === 8) {
      text += "H";
    } else if (value === 9) {
      text += "I";
    } else if (value === 10) {
      text += "J";
    } else if (value === 11) {
      text += "K";
    } else if (value === 12) {
      text += "L";
    } else if (value === 13) {
      text += "M";
    } else if (value === 14) {
      text += "N";
    } else if (value === 15) {
      text += "O";
    } else if (value === 16) {
      text += "P";
    } else if (value === 17) {
      text += "Q";
    } else if (value === 18) {
      text += "R";
    } else if (value === 19) {
      text += "S";
    } else if (value === 20) {
      text += "T";
    } else if (number === "0") {
      text += "Z";
    } else if (number === ".") {
      text += "X";
    }
    return text;
  }
  convertNumToLett(number) {
    //Z Y X W V U T S R    
    //1 2 3 4 5 6 7 8 9 
    var text = "";
    let value = parseInt(number);
    if (value === 1) {
      text = "A";
    } else if (value === 2) {
      text = "B";
    } else if (value === 3) {
      text = "C";
    } else if (value === 4) {
      text = "D";
    } else if (value === 5) {
      text = "E";
    } else if (value === 6) {
      text += "F";
    } else if (value === 7) {
      text = "G";
    } else if (value === 8) {
      text = "H";
    } else if (value === 9) {
      text = "I";
    }
    return text;
  }

  ConvertTextToIpAddress(iptext, decryptkey) {
    var text = "";
    let num = '';
    let value;
    for (var i = 0; i < iptext.length; i++) {
      num = this.decrypt(iptext.charAt(i));
      if (num === ".") {
        value = num;
      } else if (num === " ") {
        value = '';
      } else {
        value = parseInt(num) - parseInt(decryptkey);
      }
      text += value;
    }
    return text;
  }

  decrypt(char) {
    //A B C D E F G H I  J  K  L  M  N  O  P  Q  R  S  T  Z  X
    //1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20  0  .
    var text = "";
    if (char === "A") {
      text = "1";
    } else if (char === "B") {
      text = "2";
    } else if (char === "C") {
      text = "3";
    } else if (char === "D") {
      text = "4";
    } else if (char === "E") {
      text = "5";
    } else if (char === "F") {
      text = "6";
    } else if (char === "G") {
      text = "7";
    } else if (char === "H") {
      text = "8";
    } else if (char === "I") {
      text = "9";
    } else if (char === "J") {
      text = "10";
    } else if (char === "K") {
      text = "11";
    } else if (char === "L") {
      text = "12";
    } else if (char === "M") {
      text = "13";
    } else if (char === "N") {
      text = "14";
    } else if (char === "O") {
      text = "15";
    } else if (char === "P") {
      text = "16";
    } else if (char === "Q") {
      text = "17";
    } else if (char === "R") {
      text = "18";
    } else if (char === "S") {
      text = "19";
    } else if (char === "T") {
      text = "20";
    } else if (char === "Z") {
      text = "0";
    } else if (char === "X") {
      text = ".";
    } else if (char === " ") {
      text = " ";
    }
    return text;
  }
  //---------------------- End Conversation Process -------------------------//


  //---------------------- Start Other Functions -------------------------//

  getDate() {
    this.today = new Date();
    this.day = this.today.getDate();
    this.month = this.today.getMonth() + 1; //January is 0!
    this.year = this.today.getFullYear();

    if (this.day < 10) {
      this.day = '0' + this.day
    }

    if (this.month < 10) {
      this.month = '0' + this.month
    }

    this.today = this.month + '/' + this.day + '/' + this.year;
    return this.today;
  }
  getDateTime() {
    this.today = new Date();
    this.year = this.today.getFullYear();
    this.month = this.today.getMonth() + 1;
    this.day = this.today.getDate();
    this.hour = this.today.getHours();
    this.minute = this.today.getMinutes();
    this.second = this.today.getSeconds();
    if (this.day < 10) {
      this.day = '0' + this.day
    }

    if (this.month < 10) {
      this.month = '0' + this.month
    }

    if (this.hour < 10) {
      this.hour = '0' + this.hour
    }

    if (this.minute < 10) {
      this.minute = '0' + this.minute
    }

    if (this.second < 10) {
      this.second = '0' + this.second
    }
    this.today = this.month + '/' + this.day + '/' + this.year + ' ' + this.hour + ':' + this.minute + ':' + this.second;
    return this.today;
  }
  getTime() {
    this.today = new Date();
    this.hour = this.today.getHours();
    this.minute = this.today.getMinutes();
    this.second = this.today.getSeconds();

    if (this.hour < 10) {
      this.hour = '0' + this.hour
    }

    if (this.minute < 10) {
      this.minute = '0' + this.minute
    }

    if (this.second < 10) {
      this.second = '0' + this.second
    }
    this.today = this.hour + ':' + this.minute + ':' + this.second;
    return this.today;
  }
  generateId() {
    return new Date().getMilliseconds().toString();
  }
  getFormattedTime() {
    return (new Date).toLocaleString("en-US", {
     hour: "numeric",
     minute: "numeric",
     hour12: false
    })
   }
  getFormattedDate() {
    return (new Date).toLocaleString("en-us", {
     year: "numeric",
     month: "short",
     day: "numeric"
    });
   
  }
  //---------------------- End Other Functions -------------------------//
}