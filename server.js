var express = require('express');
var path = require('path');
var fs = require("fs");
var fs = require("fs");
var bodyParser = require('body-parser');
var port = process.env.PORT || process.env.VCAP_APP_PORT || '3001';
var nano = require('nano')('http://localhost:' + port);
var app = express();
var multer = require('multer');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var upload = multer({ dest: __dirname + '/upload' });
var type = upload.single('file');

app.use('/', express.static(__dirname + '/'));
app.use('/', express.static(__dirname + '/Images'));

var cloudantUserName = "adfc60ec-fa4a-46a9-bcf9-e554de84b30b-bluemix";
var cloudantPassword = "0f130af356c2fcfc117f121fa37673bf41c604165888b98399dfd6bcf62dacaa";
var dbCredentials_url = "https://" + cloudantUserName + ":" + cloudantPassword + "@" + cloudantUserName + ".cloudant.com";

//Initialize the library with my account
var cloudant = require('cloudant')(dbCredentials_url);

var dbForLogin = cloudant.db.use("logindb");
var dbForApplicantData = cloudant.db.use("digitalid");
var dbForAdminRequestTable = cloudant.db.use("adminrequesttable");
var dbForApplicantDocs = cloudant.db.use("applicantdocs");


//create index on login db if not existing
	var user = {name:'userId', type:'json', index:{fields:['userId']}};
	dbForLogin.index(user, function(er, response) {
	if(er) {
	console.log("Error creating index on user ID:"+  er);
	}else{
	console.log('Index creation result on user ID :'+ response.result);
	}
	});

// viewed at http://localhost:8080
app.get('/', function (req, res) {
    console.log("Open LoginPage.html page");
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/loginData', function (req, res) {
    console.log("Got a POST request for LoginPage.html page");
   console.log(req.body);
	 var userId = req.body.username;
         var password = req.body.password;
dbForLogin.find({selector:{userId:userId}},function(err,body) { 
        console.log(body);
        if (!err) {
            var dbPassword = body.docs[0].password;
		console.log("dbPassword: " +dbPassword );
		console.log("password: " + password);
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

// Check Login Details
app.post('/verifyLogin', function(req, res) {
	console.log('Inside Express api check for login');
	console.log('Received login details : ' + JSON.stringify(req.body));
	verifyCredentialsFromCloudant(req.body.username, req.body.password).then(function(data) {
	if(data.success){
		res.json ({success : true, message:'User name verified with password successfully !'});
	}else
		res.json ({success : false, message:'User name not found !'});
	});
});


// Verify admin login credentials from cloudant DB
var verifyCredentialsFromCloudant = async (username, password) => {
	try{
		var response = await dbForLogin.get(username);
		console.log('Data found in db for the requested username');
        console.log('DB Login Response' + response)
		if (response.password === password) {
			console.log('User verification successful');
			return({ success: true, message: 'User Authentication Successful !' });
		} else {
			console.log('Invalid User name/Password ');
			return({ success: false, message: 'Invalid User name/Password !' });
		}
	}catch (err){
		console.log('Data not found in db for the requested username !' + err);
		return({ success: false, message: 'Data not found in db for the requested username !'});
	}
}

app.post('/applicantData', type, function(req, res) {
    console.log('Inside Express api to insert data for applicant');
    var applicantData = JSON.parse(JSON.stringify(req.body.data));
    applicantData = JSON.parse(applicantData);
    console.log(applicantData);
  
    fs.readFile(__dirname + '/upload/' + req.file.filename, function(err, response) {
      insertCloudantData(applicantData).then(function(data) {
      if(data.success){
          insertDocInCloudant(response, req.file, applicantData.digitalIdInfo.documentDetails).then(function(data) {
          if(data.success){
              fs.unlink(__dirname + '/upload/' + req.file.filename, function(err) {
                  if(!err)
                    console.log('File deleted !');
                  else
                    console.log('Issue deleting File');
              });
              res.json ({success : true, message:'Applicant data and document inserted successfully !'});
          }else
              res.json ({success : false, message:'Issue inserting applicant document !'});
          });
      }else
          res.json ({success : false, message:'Issue inserting applicant data !'});
      });
    });
  });

app.post('/employeeData', function (req, res) {
    var response = "";
    console.log("Got a POST request for apply_for_digital_id.html page");
    var applicantData = JSON.parse(JSON.stringify(req.body));
    dbForApplicantData.insert(applicantData, function (err, body) {
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
app.post('/userData', function (req, res) {
    var response = "";
    console.log("Got a POST request for StudentDetails.html page");
    var applicantData = JSON.parse(JSON.stringify(req.body));
    dbForApplicantData.insert(applicantData, function (err, body) {
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

app.post('/applicantDoc', type, function (req, res) {
    console.log("File :" + JSON.stringify(req.body));
    fs.readFile(__dirname + '/upload/' + req.file.filename, function (err, data) {
        if (!err) {
            dbForApplicantData.attachment.insert(req.body.id, req.file.originalname, data, req.file.mimetype, {
                rev: req.body.rev
            }, function (err, body) {
                if (!err) {
                    fs.unlink(__dirname + '/upload/' + req.file.filename, function (err) {
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


// Insert Document in cloudant DB
var insertDocInCloudant = async (data, file, docData) => {
	console.log(data);
	console.log(file);
	try{
		var response = await dbForApplicantDocs.insert(docData);
		console.log('Document related data inserted successfully !');
		var body = await dbForApplicantDocs.attachment.insert(response.id, file.originalname, data, file.mimetype, { rev: response.rev });
		console.log('Document inserted successfully !');
		return({ success: true, message: 'Document uploaded successfully !' });		
	}catch(err){
	  console.log('Document related data insertion issue ! ' + err);
	  return({ success: false, message: 'Document related data insertion issue !' });
	} 		
}
// Insert data/record in cloudant DB
var insertCloudantData = async (data) => {
	try{
		var response =  await dbForApplicantData.find({ selector: { ssn: data.ssn } });
		if(response && response.docs && response.docs.length > 0){
		  console.log('SSN already exists in DB !');
		  return({ success: false, message: 'SSN already exists in DB !'});		
		}else{
		  console.log('SSN does not exists in DB !');
		  var data = await dbForApplicantData.insert(data);
		  console.log('Applicant Data Inserted !');
		  return({ success: true, message: 'Applicant Data Inserted Successfully !'});		  
		}
	}catch(err) {
		console.log('Issue fetching/inserting data from DB ! ' + err);
		return({ success: false, message: 'Issue fetching/inserting data from DB !'});
	}
}

app.listen(port);
