var myApp = angular.module("myModule", []);


/* File Upload Directive */
myApp.directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function() {
        scope.$apply(function() {
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);

/* File Upload Service */
myApp.service('fileUpload', ['$http', function($http) {
    this.uploadFileAndFieldsToUrl = function(file, data, uploadUrl) {
      var fd = new FormData();
      fd.append('file', file);
      fd.append('data', JSON.stringify(data));
      $http({
        method: 'POST',
        url: uploadUrl,
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).then(function successCallback(response) {
        if(response.data.success == true && uploadUrl === '/applicantData') {
          window.location.href = '/success_entry.html';
        } else {
          alert(response.data.message);
        }
      });
    }
  }]);

myApp.controller('myController', ['$scope', 'fileUpload', '$http', '$filter', '$window', function ($scope, fileUpload, $http, $filter, $window) {

    var uniqueId = Date.now();

    function dateTime() {
        var now = new Date();
        return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + "T" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    }
    
  
    ////////////////////////////////////////////////////////
    var document = {
        _id : uniqueId + '-IdProof',
        docName : "",
        docType : "Identification Proof",
        digitalId : uniqueId + ''
      }
    
    
    
    var digitalIdData = {
        digitalId: "D-" + uniqueId,
        Name: "",
        DOB: "",
        Age: "",
        MobileNumber: "",
        Gender: "",
        Email: "",
        GovermentId: "",
        Address: "",
        createTimestamp: uniqueId,
        dateOfBirth: "",
        documentDetails: document,
        txnMsg: ""
      };

      var User = {
        _id: uniqueId + '',
        digitalIdInfo: digitalIdData,
        employee: Employee, 
        visa: Visa, 
        student: Student,
        visaAproved: false, 
        universityApproved : false,
        employeeApproved : false, 
        digitalIdApprvoed : false,
        ssn: "",
        message: "",
        txnMsg: ""   }

        $scope.User = User;

        $scope.$watch('myFile', function (newFileObj) {
            if (newFileObj)
                $scope.filename = newFileObj.name;
        });

        $scope.gender = ["Male", "Female"];
        $scope.type = ["Full-Type", "Part-Type"];
        $scope.ctc = ["Less than 5 LPA", "5 - 10 LPA", "Greater than 10 LPA"];
        var uniqueId = Date.now();

        /* $scope.submitLoginData = function () {
            var data = {
                username: $scope.userName,
                password: $scope.password
            }
            console.log(data);
            $http({
                method: 'POST',
                url: '/loginData',
                data: data
            }).then(function successCallback(response) {
                if (JSON.stringify(response) != '{}' && response.data.status == "200") {
                    window.location.href = '../AdminPages/digital_id_admin.html';
                } else {
                    alert(response.data.message);
                }
            });
        } */

        $scope.submitUserData = function () {
            var file = $scope.myFile;
            console.log(file);
            var dob = $scope.User.digitalIdInfo.DOB;
            var year = Number(dob.substr(6, 4));
            var month = Number(dob.substr(3, 2)) - 1;
            var day = Number(dob.substr(0, 2));
            var today = new Date();
            var age = today.getFullYear() - year;
            if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
                age--;
            }

            $scope.User.digitalIdInfo.Age = age;
            var file = $scope.myFile;
            $scope.User.digitalIdInfo.documentDetails.docName = file.name;
            $scope.User.ssn = $scope.User.digitalIdInfo.ssn;
            $scope.User.message = "Record inserted successfully in Cloudant DB.";
            console.log($scope.User.digitalIdInfo);
            var uploadUrl = "/applicantData";
            fileUpload.uploadFileAndFieldsToUrl(file, $scope.User, uploadUrl);
             
            /* $http({
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
                    var uploadUrl = "/applicantData";
                    fileUpload.uploadFileAndFieldsToUrl(file, $scope.applicantData, uploadUrl);
                }  else {
                    alert(response.data.message);
                } 
            }); */
        }
    
 /*      var applicantData = {
        _id: uniqueId + '',
        digitalIdInfo: digitalIdData,
        digitalIdStatus: false,
        universityAdmissionStatus: false,
        currentDegreeStatus: false,
        ssn: "",
        message: "",
        txnMsg: ""
      }; */

    ////////////////////////////////////////////////

    var timestamp = dateTime();

    var Employee = {
         CurrentEmployer: "",
         PreviousEmployer: "",
         TotalExperience: "",
         CurrentCTC: "" 
        }
    var Visa = { 
        Country: "",
        Duration: "",
        ReasonOfTraveling: "",
        Comments: "",
        Status: "" 
        }

    var Student = { 
        HighestEducation: "",
         CourseToPursue: "",
         Specialization: "",
         Type: "" 
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
