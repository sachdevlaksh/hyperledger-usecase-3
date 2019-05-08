var express = require('express');
var path = require('path');
var fs = require("fs");
var md5File = require('md5-file');
var bodyParser = require('body-parser');
var port = process.env.PORT || process.env.VCAP_APP_PORT || '3001';
var nano = require('nano')('http://localhost:' + port);
var app = express();
var multer = require('multer');
var axios = require("axios");
var nodemailer = require('nodemailer');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var Cloudant = require('@cloudant/cloudant');
var upload = multer({
    dest: __dirname + '/upload'
});
var type = upload.single('file');
const rp = require('request-promise');

app.use('/', express.static(__dirname + '/'));
app.use('/', express.static(__dirname + '/Images'));

var cloudantUserName = "adfc60ec-fa4a-46a9-bcf9-e554de84b30b-bluemix";
var cloudantPassword = "0f130af356c2fcfc117f121fa37673bf41c604165888b98399dfd6bcf62dacaa";
var cloudant_url = "https://" + cloudantUserName + ":" + cloudantPassword + "@" + cloudantUserName + ".cloudant.com";

//Initialize the library with my account
var cloudant = Cloudant(cloudant_url);

var dbForLogin = cloudant.db.use("logindb");
var dbForApplicantData = cloudant.db.use("digitalid");
var dbForAdminRequestTable = cloudant.db.use("adminrequesttable");
var dbForApplicantDocs = cloudant.db.use("applicantdocs");


//create index on login db if not existing
var user = {
    name: 'userId',
    type: 'json',
    index: {
        fields: ['userId']
    }
};
dbForLogin.index(user, function(er, response) {
    if (er) {
        console.log("Error creating index on user ID:" + er);
    } else {
        console.log('Index creation result on user ID :' + response.result);
    }
});

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    console.log("Open LoginPage.html page");
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Check Login Details
app.post('/verifyLogin', function(req, res) {
    console.log('Inside Express api check for login');
    console.log('Received login details : ' + JSON.stringify(req.body));
    verifyCredentialsFromCloudant(req.body.username, req.body.password).then(function(data) {
        if (data.success) {
            res.json({
                success: true,
                message: 'User name verified with password successfully !'
            });
        } else
            res.json({
                success: false,
                message: 'User name not found !'
            });
    });
});

//Get all digital Ids with digital Id status as 'PENDING'
app.get('/getDigitalIdRequests', function(req, res) {
    console.log('Inside Express api check to get all applicants details for digital Id');
    digitalIdWithPendingStatus().then(function(data) {
        if (data.success) {
            res.json({
                success: true,
                message: 'Data found successfully ! ',
                result: data.result.docs
            });
        } else
            res.json({
                success: false,
                message: 'Cloudant db connectivity issue !'
            });
    });
});

//Get all digital Ids with university application status  as 'PENDING'
app.get('/getUniversityApplicantRequests', function(req, res) {
    console.log('Inside Express api check to get all applicants details for university applications');
    dbForApplicantData.find({
        selector: {
            universityAdmissionStatus: 'Pending'
        }
    }, function(er, result) {
        if (er) {
            console.log('Error finding applicant information from db ' + er);
            res.json({
                success: false,
                message: 'Error : ' + er
            });
        }
        if (result && result.docs && result.docs.length > 0) {
            console.log('Data found !');
            res.json({
                success: true,
                message: 'Data found !',
                result: result.docs
            });
        } else {
            console.log('Data not found !');
            res.json({
                success: false,
                message: 'Data not found !'
            });
        }
    });
});

//Get all digital Ids with Visa application status  as 'PENDING'
app.get('/getVisaApplicantRequests', function(req, res) {
    console.log('Inside Express api check to get all applicants details for visa applications');
    dbForApplicantData.find({
        selector: {
            visaApplicationStatus: 'Pending'
        }
    }, function(er, result) {
        if (er) {
            console.log('Error finding applicant information from db ' + er);
            res.json({
                success: false,
                message: 'Error : ' + er
            });
        }
        if (result && result.docs && result.docs.length > 0) {
            console.log('Data found !');
            res.json({
                success: true,
                message: 'Data found !',
                result: result.docs
            });
        } else {
            console.log('Data not found !');
            res.json({
                success: false,
                message: 'Data not found !'
            });
        }
    });
});

//Get all digital Ids with employee application status  as 'PENDING'
app.get('/getEmployeeApplicantRequests', function(req, res) {
    console.log('Inside Express api check to get all applicants details for employee applications');
    dbForApplicantData.find({
        selector: {
            employeeApplicationStatus: 'Pending'
        }
    }, function(er, result) {
        if (er) {
            console.log('Error finding applicant information from db ' + er);
            res.json({
                success: false,
                message: 'Error : ' + er
            });
        }
        if (result && result.docs && result.docs.length > 0) {
            console.log('Data found !');
            res.json({
                success: true,
                message: 'Data found !',
                result: result.docs
            });
        } else {
            console.log('Data not found !');
            res.json({
                success: false,
                message: 'Data not found !'
            });
        }
    });
});

app.post('/applicantData', type, function(req, res) {
    console.log('Inside Express api to insert data for applicant');
    var applicantDataNew = JSON.parse(JSON.stringify(req.body.data));
    var applicantJSONdata = JSON.parse(applicantDataNew);
    console.log(applicantJSONdata);

    var url = "http://ec2-3-87-238-243.compute-1.amazonaws.com:3001/api/org.general.digitalid.User";
    var headers = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

	applicantData(url, applicantJSONdata, headers).then(function(data) {
		if (data.success) {
			res.json({
				success: true,
				deathRecordDetails: data.response
			});
		} else res.json({
			success: false,
			message: data
		});
	});
});

//Get selected _id details from DB
app.post('/getDigitalIdData', function(req, res) {
    console.log('Inside Express api check to get digital Id data : ' + req.body._id);
    getDigitalIdData(req.body._id).then(function(data) {
        if (data.success) {
            res.json({
                success: true,
                message: 'Applicant data found successfully ! ',
                result: data.response.docs
            });
        } else
            res.json({
                success: false,
                message: 'Cloudant db connectivity issue !'
            });
    });
});

//Update digital Id applicant details to DB
app.post('/updateDigitalIdData', function(req, res) {
    console.log('Inside Express api check to update digital Id data ! ');
    var applicantData = JSON.parse(JSON.stringify(req.body));
    updateCloudantData(applicantData).then(function(data) {
        if (data.success) {
            res.json({
                success: true,
                message: 'Applicant data updated successfully ! '
            });
        } else
            res.json({
                success: false,
                message: 'Applicant data updation issue !'
            });
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
    console.log("File :" + JSON.stringify(req.body));
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

// Fetch all digital Ids with pending digitalId status from cloudant DB
var digitalIdWithPendingStatus = async() => {
    try {
        var response = await dbForApplicantData.find({
            selector: {
                digitalIdStatus: 'Pending'
            }
        });
        if (response && response.docs && response.docs.length > 0) {
            console.log('Data found !');
            return ({
                success: true,
                message: 'Data found !',
                result: response
            });
        } else {
            console.log('Data not found !');
            return ({
                success: false,
                message: 'Data not found !'
            });
        }
    } catch (err) {
        console.log('Error finding details from db !' + err);
        return ({
            success: false,
            message: 'Error finding details from db !'
        });
    }
}

// Verify admin login credentials from cloudant DB
var verifyCredentialsFromCloudant = async(username, password) => {
    console.log("Username :" + username + "Password :" + password);
    try {
        var response = await dbForLogin.get(username);
        console.log('Data found in db for the requested username');
        console.log('DB Login Response' + JSON.stringify(response));
        if (response.password == password) {
            console.log('User verification successful');
            return ({
                success: true,
                message: 'User Authentication Successful !'
            });
        } else {
            console.log('Invalid User name/Password ');
            return ({
                success: false,
                message: 'Invalid User name/Password !'
            });
        }
    } catch (err) {
        console.log('Data not found in db for the requested username !' + err);
        return ({
            success: false,
            message: 'Data not found in db for the requested username !'
        });
    }
}

//Post Call
var applicantData = async(url, data, headers) => {
    console.log(data);
    try {
        var deathRecord = await axios.post(url, data);
        console.log("Data post succesfully");
        return ({
            success: true,
            response: deathRecord.data
        });
    } catch (error) {
	    console.log("Error is  :  " + error);
        return ({
	    console.log("message is  :  " + JSON.stringify(error));
            success: false,
            message: JSON.stringify(error)	  
        });
    }
}

//Fetch specific digitalId record from cloudant DB
var getDigitalIdData = async(digitalId) => {
    try {
        var response = await dbForApplicantData.find({
            selector: {
                _id: digitalId
            }
        });
        console.log('Applicant data found successfully ! ');
        return ({
            success: true,
            message: 'Applicant data found successfully ! ',
            response: response
        });
    } catch (err) {
        console.log('Applicant data not present/DB issue ! ' + err);
        return ({
            success: false,
            message: 'Applicant data not present/DB issue !'
        });
    }
}

// Update existence record in cloudant DB
var updateCloudantData = async(data) => {
    try {
        var response = await dbForApplicantData.insert(data);
        console.log('Applicant data updated successfully ! ');
        return ({
            success: true,
            message: 'Applicant data updated successfully ! '
        });
    } catch (err) {
        console.log('Applicant data updation issue ! ' + err);
        return ({
            success: false,
            message: 'Applicant data updation issue !'
        });
    }
}

// Insert Document in cloudant DB
var insertDocInCloudant = async(data, file, docData) => {
        console.log(data);
        console.log(file);
        try {
            var response = await dbForApplicantDocs.insert(docData);
            console.log('Document related data inserted successfully !');
            var body = await dbForApplicantDocs.attachment.insert(response.id, file.originalname, data, file.mimetype, {
                rev: response.rev
            });
            console.log('Document inserted successfully !');
            return ({
                success: true,
                message: 'Document uploaded successfully !'
            });
        } catch (err) {
            console.log('Document related data insertion issue ! ' + err);
            return ({
                success: false,
                message: 'Document related data insertion issue !'
            });
        }
    }
	
// Insert data/record in cloudant DB
var insertCloudantData = async(data) => {
    try {
        var response = await dbForApplicantData.find({
            selector: {
                GovermentId: data.GovermentId
            }
        });
        if (response && response.docs && response.docs.length > 0) {
            console.log('GovermentId already exists in DB !');
            return ({
                success: false,
                message: 'GovermentId already exists in DB !'
            });
        } else {
            console.log('GovermentId does not exists in DB !');
            var data = await dbForApplicantData.insert(data);
            console.log('Applicant Data Inserted !');
            return ({
                success: true,
                message: 'Applicant Data Inserted Successfully !'
            });
        }
    } catch (err) {
        console.log('Issue fetching/inserting data from DB ! ' + err);
        return ({
            success: false,
            message: 'Issue fetching/inserting data from DB !'
        });
    }
}

app.listen(port);
