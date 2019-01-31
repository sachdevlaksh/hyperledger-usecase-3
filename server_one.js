var express = require('express');
var path = require('path');
var fs = require("fs");
var bodyParser = require('body-parser');
var port = process.env.PORT || process.env.VCAP_APP_PORT || '3001';
var nano = require('nano')('http://localhost:' + port);
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var cloudantUserName = "adfc60ec-fa4a-46a9-bcf9-e554de84b30b-bluemix";
var cloudantPassword = "0f130af356c2fcfc117f121fa37673bf41c604165888b98399dfd6bcf62dacaa";
var dbCredentials_url = "https://" + cloudantUserName + ":" + cloudantPassword + "@" + cloudantUserName + ".cloudant.com";

//Initialize the library with my account
var cloudant = require('cloudant')(dbCredentials_url);

var dbForLogin = cloudant.db.use("logindb");
var dbForApplicantData = cloudant.db.use("digitalid");
var dbForAdminRequestTable = cloudant.db.use("adminrequesttable");



app.listen(port);
