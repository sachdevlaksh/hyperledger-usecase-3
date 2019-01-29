var express = require('express');
var path = require('path');
var fs = require("fs");
var bodyParser = require('body-parser');
var port = process.env.PORT || process.env.VCAP_APP_PORT || '3001';
var nano = require('nano')('http://localhost:'+port);            
var app = express();
var multer  = require('multer');         
app.use(bodyParser.json());                
app.use(bodyParser.urlencoded({ extended: true }));        

var upload = multer({dest:__dirname + '/upload'});            
var type = upload.single('file');                             

app.use('/', express.static(__dirname + '/'));                 
app.use('/', express.static(__dirname +'/Images'));            

var cloudantUserName = "adfc60ec-fa4a-46a9-bcf9-e554de84b30b-bluemix";
var cloudantPassword = "0f130af356c2fcfc117f121fa37673bf41c604165888b98399dfd6bcf62dacaa";
var dbCredentials_url = "https://"+cloudantUserName+":"+cloudantPassword+"@"+cloudantUserName+".cloudant.com"; 

//Initialize the library with my account
var cloudant = require('cloudant')(dbCredentials_url);               

var dbForLogin = cloudant.db.use("logindetails");
var dbForApplicantData = cloudant.db.use("digitalid");
var dbForAdminRequestTable = cloudant.db.use("adminrequesttable");


// viewed at http://localhost:8080
app.get('/', function(req, res) {
    console.log("Open LoginPage.html page");
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/loginData', function(req, res) {
    console.log("Got a POST request for LoginPage.html page");
    var userName = req.body.username;
    var password = req.body.password;
    dbForLogin.get(userName, function(err, body) {
        if (!err) {
            var dbPassword = body.agentPassword;
            if (dbPassword === password) {
                var response = {
                    status: 200,
                    message: 'Success'
                }
                res.send(JSON.stringify(response));
            } else {
                var response = {
                    status: 300,
                    message: 'Username and Password does not match'
                }
                res.send(JSON.stringify(response));
            }
        } else {
            var response = {
                status: 400,
                message: 'Username does not exists'
            }
            res.send(JSON.stringify(response));
        }
    });
});

app.post('/applicantData', function(req, res) {
    var response = "";
    console.log("Got a POST request for apply_for_digital_id.html page");
    var applicantData = JSON.parse(JSON.stringify(req.body)); 
	console.log(applicantData);
	dbForApplicantData.insert(applicantData, function(err, body) {
		if (!err) {
			response = {
				status: 200,
				message: 'Data inserted successfully in applicant data table.',
				id: body.id,
				revid: body.rev
			}
		} else {
			response = {
				status: 300,
				message: 'Data not inserted successfully in applicant data table.'
			}
		}
		res.send(JSON.stringify(response));
	});
});

app.post('/employeeData', function(req, res) {
    var response = "";
    console.log("Got a POST request for apply_for_digital_id.html page");
    var applicantData = JSON.parse(JSON.stringify(req.body)); 
	dbForApplicantData.insert(applicantData, function(err, body) {
		if (!err) {
			response = {
				status: 200,
				message: 'Data inserted successfully in applicant data table.',
				id: body.id,
				revid: body.rev
			}
		} else {
			response = {
				status: 300,
				message: 'Data not inserted successfully in applicant data table.'
			}
		}
		res.send(JSON.stringify(response));
	});
});
app.post('/userData', function(req, res) {
    var response = "";
    console.log("Got a POST request for StudentDetails.html page");
    var applicantData = JSON.parse(JSON.stringify(req.body)); 
	dbForApplicantData.insert(applicantData, function(err, body) {
		if (!err) {
			response = {
				status: 200,
				message: 'Data inserted successfully in applicant data table.',
				id: body.id,
				revid: body.rev
			}
		} else {
			response = {
				status: 300,
				message: 'Data not inserted successfully in applicant data table.'
			}
		}
		res.send(JSON.stringify(response));
	});
});

app.post('/applicantDoc', type, function(req, res) {
    console.log("File :"+JSON.stringify(req.body));
    fs.readFile(__dirname + '/upload/' + req.file.filename, function(err, data) {
        if (!err) {
            dbForApplicantData.attachment.insert(req.body.id, req.file.originalname, data, req.file.mimetype, {
                rev: req.body.rev
            }, function(err, body) {
                if (!err) {
                    fs.unlink(__dirname + '/upload/' + req.file.filename, function(err) {
                        if (!err)
                            console.log('File deleted!');
                        else
                            console.log(err);
                    });
                    var response = {
                        status: 200,
                        message: 'Document uploaded successfully in applicant data table.'
                    }
                    res.send(JSON.stringify(response));
                } else {
                    var response = {
                        status: 300,
                        message: 'Document not uploaded successfully in applicant data table.'
                    }
                    res.send(JSON.stringify(response));
                }
            });
        }
    });
});
app.listen(port);
