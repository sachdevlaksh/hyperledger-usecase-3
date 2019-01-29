var myApp = angular.module("myModule", []);

myApp.service('fileUpload', ['$http', function ($http) {
    this.uploadFileAndFieldsToUrl = function (file, fields, uploadUrl) {
        var fd = new FormData();    // what FormData do
        fd.append('file', file);    // what is the logic behind this
        for (var i = 0; i < fields.length; i++) {
            fd.append(fields[i].name, fields[i].data);  // what is the logic behind this
        }
        $http({
            method: 'POST',
            url: uploadUrl,  //how only half url work fine we should have complete URL
            data: fd,
            transformRequest: angular.identity,    //what this will do angular.identity
            headers: {
                'Content-Type': undefined
            }
        }).then(function successCallback(response) {
            if (JSON.stringify(response) != '{}' && response.data.status == "200") {
                window.location.href = '/SuccessEntry.html';
            } else {
                alert(response.data.message);
            }
        });
    }
}]);

myApp.controller('myController', ['$scope', 'fileUpload', '$http', '$filter', '$window', function ($scope, fileUpload, $http, $filter, $window) {

    function dateTime() {
        var now = new Date();
        return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + "T" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    }
    $scope.gender = ["Male", "Female"];
    $scope.type = ["Full-Type", "Part-Type"];
    $scope.ctc = ["Less than 5 LPA", "5 - 10 LPA", "Greater than 10 LPA"];
    var uniqueId = Date.now();


    var timestamp = dateTime();

    var Employee = { CurrentEmployer: "", PreviousEmployer: "", TotalExperience: "", CurrentCTC: "" }
    var Visa = { Country: "", Duration: "", ReasonOfTraveling: "", Comments: "", Status: "" }
    var Student = { HighestEducation: "", CourseToPursue: "", Specialization: "", Type: "" }
    var User = { _id: uniqueId + '', Name: "", DOB: "", Age: "", MobileNumber: "", Gender: "", Email: "", GovermentId: "", Address: "", registrationTimeStamp: timestamp, employee: Employee, visa: Visa, student: Student }


    $scope.User = User;

    $scope.submitLoginData = function () {
        var data = {
            username: $scope.userName,
            password: $scope.password
        }


        $http({
            method: 'POST',
            url: '/loginData',
            data: data
        }).then(function successCallback(response) {
            if (JSON.stringify(response) != '{}' && response.data.status == "200") {
                window.location.href = '/ApplicationDetails.html';
            } else {
                alert(response.data.message);
            }
        });
    }

    $scope.submitUserData = function () {

        var dob = $scope.User.DOB;
        var year = Number(dob.substr(6,4));
        var month = Number(dob.substr(3, 2)) - 1;
        var day = Number(dob.substr(0, 2));
        var today = new Date();
        var age = today.getFullYear() - year;
        if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
            age--;
        }
        $scope.User.Age = age;
        console.log($scope.User);
        $http({
            method: 'POST',
            url: '/applicantData',
            data: $scope.User
        }).then(function successCallback(response) {
			console.log(JSON.stringify(response));
            if (JSON.stringify(response) != '{}' && response.data.status == "200") {
				window.location.href = '/success_entry.html';
                var fields = [{
                    "name": "id",
                    "data": response.data.id
                },
                {
                    "name": "rev",
                    "data": response.data.revid
                }
                ];
                var uploadUrl = "/applicantDoc";
                fileUpload.uploadFileAndFieldsToUrl(file, fields, uploadUrl);
            } else {
                alert(response.data.message);
            }
        });
    }
	
    $scope.submitEmployeeData = function () {

        console.log($scope.User);
        $http({
            method: 'POST',
            url: '/employeeData',
            data: $scope.User
        }).then(function successCallback(response) {
            if (JSON.stringify(response) != '{}' && response.data.status == "200") {
                var fields = [{
                    "name": "id",
                    "data": response.data.id
                },
                {
                    "name": "rev",
                    "data": response.data.revid
                }
                ];
                var uploadUrl = "/applicantDoc";
                fileUpload.uploadFileAndFieldsToUrl(file, fields, uploadUrl);
            } else {
                alert(response.data.message);
            }
        });
    }
}]);