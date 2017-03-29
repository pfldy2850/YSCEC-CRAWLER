const readline = require('readline');
const fs = require('fs');
const path = require('path');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


var userinfo = {};

exports.check = function() {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, `/secret.json`), function(err, data) {
      if (err) {

        resolve(false);
      } else {
        userinfo = JSON.parse(data);

        resolve(true);
      }
    });
  });
}

exports.input = function(prompt) {
  return new Promise(function (resolve, reject) {
    rl.question(prompt + ' :', function (answer) {
      userinfo[prompt] = answer;

      resolve('');
    }); 
  });
}

exports.getUserinfo = function() {
  return userinfo;
}

exports.end = function() {
  return new Promise(function (resolve, reject) {
    rl.close();

    resolve('');
  });
}

exports.makeSecret = function() {
  return new Promise(function (resolve, reject) {
    fs.writeFileSync(path.join(__dirname, `/secret.json`), JSON.stringify(userinfo));

    console.log('유저 정보 저장 완료; secret.json');
    resolve('');
  });
}


exports.delete = function() {
  return new Promise(function (resolve, reject) {
    fs.unlink(path.join(__dirname, `/secret.json`), function (err) {
      if (err) throw err;

      console.log('유저 정보 삭제 완료; secret.json');
      resolve('');
    }); 
  });
}