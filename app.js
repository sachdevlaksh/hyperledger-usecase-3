var myApp = angular.module("myModule", ['ngTable']);

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
          window.location.href = '/success_DigitalIdEntry.html';
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
        employee: Employee, 
        visa: Visa, 
        student: Student,
        txnMsg: ""
      };

      var User = {
        _id: uniqueId + '',
        digitalIdInfo: digitalIdData,
        digitalIdStatus : 'Pending',
        universityAdmissionStatus : 'Pending',
        employeeApplicationStatus: 'Pending',
        visaApplicationStatus: 'Pending',  
        GovermentId: "",
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
            $scope.User.GovermentId = $scope.User.digitalIdInfo.GovermentId;
            $scope.User.message = "Record inserted successfully in Cloudant DB.";
            console.log($scope.User.digitalIdInfo);
            var uploadUrl = "/applicantData";
            fileUpload.uploadFileAndFieldsToUrl(file, $scope.User, uploadUrl);
                      
        }
    
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


/* Apply For University Controller */
myApp.controller('applyUniversity', ['$scope', 'fileUpload', '$http', '$filter', '$window', function($scope, fileUpload, $http, $filter, $window) {

  $scope.CourseToPursueSelect = ["Hotel Management", "Enginnering", "Arts", "Finance", "Medical"];

  $scope.HighestEducationSelect = ["UG", "PG"];

  $scope.selectedUniversityNameSelect = ["DTU", "KU", "PTU"];

   $scope.SpecializationSelect = ["VLSI", "E&C", "Medicines" ,  "Pharma"];

    $scope.TypeSelect = ["Regular", "Distance", "Weekends"];
	
  $scope.Back = function () {
        $window.location.href = '/student_portal.html';
  }

  $scope.on = function () {
        document.getElementById("overlay").style.display = "block";
  }

  $scope.off = function () {
        document.getElementById("overlay").style.display = "none";
  }

  $scope.loadDigitalIdData = function() {
        var data = {
          _id : $scope.digitalId
        }

    $http({
      method: 'POST',
      url: '/getDigitalIdData',
      data: data
    }).then(function successCallback(response) {
      if(response.data.success == true  && response.data.result[0].digitalIdStatus == 'Approved') {
		$scope.digitalIdData = response.data.result[0];
		$scope.dob = new Date(response.data.result[0].digitalIdInfo.DOB);
		$scope.off();
      } else {
        alert(response.data.message);
                window.close();
      }
    });
  }

  $scope.submitUniversityData = function() {
	var universityData = { 
    universityName: $scope.selectedUniversityName,
    universityAddress: $scope.selectedUniversityAddress,
    //universityId: $scope.selectedUniversityId,
    universityId: '0000458698',
    courseAppliedFor : $scope.CourseToPursue,
    appliedDegreeType: $scope.Type,
    appliedSpecialization: $scope.Specialization,
    appliedCourseToPursue: $scope.CourseToPursue,
    appliedHighestEducation: $scope.HighestEducation,
    courseStartDate: Date.now(),
    courseEndDate: '',
    degreeCompleteStatus: false,
    digitalId: $scope.digitalIdData.digitalIdInfo.digitalId,
    universityDocument: ''
              };
	var message = $scope.digitalIdData.message + " The applicant has added his university choices.";
	$scope.digitalIdData.message = message;
	$scope.digitalIdData.digitalIdInfo.universityDetails = universityData;

	$http({
	  method: 'POST',
	  url: '/updateDigitalIdData',
	  data: $scope.digitalIdData
	}).then(function successCallback(response) {
	  if(response.data.success == true) {
		$window.location.href = '../success_UniversityIdEntry.html';
	  } else {
		alert(response.data.message);
	  }
	});	
  }
}]);

// Digital ID Admin Controller
myApp.controller('digitalIdAdminLogin', ['$scope', 'fileUpload', '$http', '$filter', '$window', function($scope, fileUpload, $http, $filter, $window) {

  $scope.verifyLogin = function() {

    var data = {
      username: $scope.username,
      password: $scope.password
    }

    $http({
      method: 'POST',
      url: '/verifyLogin',
      data: data
    }).then(function successCallback(response) {
      if(response.data.success == true) {
        window.location.href = '../AdminPages/digital_id_admin.html';
      } else {
        alert(response.data.message);
      }
    });
  }

}]);

/* Digital Id Read Only Form Controller */
myApp.controller('digitalIdReadOnlyForm', ['$scope', 'fileUpload', '$http', '$filter', '$window', function($scope, fileUpload, $http, $filter, $window) {

    var data = {
          _id : $window.sessionStorage.getItem("_id")
    }
  
    $scope.loadDigitalIdData = function() {
      $http({
        method: 'POST',
        url: '/getDigitalIdData',
            data: data
      }).then(function successCallback(response) {
        if(response.data.success == true) {
                  $scope.digitalIdData = response.data.result[0];
                  $scope.dob = new Date(response.data.result[0].digitalIdInfo.dateOfBirth);
        } else {
          alert(response.data.message);
        }
      });
    }
  
    $scope.updateDigitalIdData = function (buttonValue) {
          var message = $scope.digitalIdData.message + " The digital id request has been " + buttonValue + ".";
          $scope.digitalIdData.message = message;
  
          if(buttonValue == "Approved")
              $scope.digitalIdData.digitalIdStatus = "Approved";
          
          if(buttonValue == "Rejected")
              $scope.digitalIdData.digitalIdStatus = "Rejected";
  
      $http({
        method: 'POST',
        url: '/updateDigitalIdData',
            data: $scope.digitalIdData
      }).then(function successCallback(response) {
        if(response.data.success == true) {
              $window.location.href = '../AdminPages/digital_id_admin.html';
        } else {
          alert(response.data.message);
        }
      });
    }
  
    $scope.Back = function () {
          $window.location.href = '/consortium_admin.html';
    }
  
    $scope.Logout = function () {
          window.close();
    }
  
  }]);


  /* University Read Only Form Controller */
myApp.controller('universityReadOnlyForm', ['$scope', 'fileUpload', '$http', '$filter', '$window', function($scope, fileUpload, $http, $filter, $window) {

  var data = {
        _id : $window.sessionStorage.getItem("_id")
  }

  $scope.loadDigitalIdData = function() {
    $http({
      method: 'POST',
      url: '/getDigitalIdData',
          data: data
    }).then(function successCallback(response) {
      if(response.data.success == true) {
                $scope.digitalIdData = response.data.result[0];
                $scope.dob = new Date(response.data.result[0].digitalIdInfo.dateOfBirth);
      } else {
        alert(response.data.message);
      }
    });
  }

  $scope.updateUniversityData = function (buttonValue) {
        var message = $scope.digitalIdData.message + " The university admission request has been " + buttonValue + ".";
        $scope.digitalIdData.message = message;

        if(buttonValue == "Approved")
                $scope.digitalIdData.universityAdmissionStatus = "Approved";

    $http({
      method: 'POST',
      url: '/updateDigitalIdData',
          data: $scope.digitalIdData
    }).then(function successCallback(response) {
      if(response.data.success == true) {
                $window.location.href = '../AdminPages/university_id_admin.html';
      } else {
        alert(response.data.message);
      }
    });
  }

  $scope.Back = function () {
        $window.location.href = '../AdminPages/university_id_admin.html';
  }

  $scope.Logout = function () {
        window.close();
  }

}]);


//Fetch specific digitalId record from cloudant DB
var getDigitalIdData = async (digitalId) => {
	try{
		var response = await dbForApplicantData.find({ selector: { _id: digitalId } });
		console.log('Applicant data found successfully ! ');
        return({ success: true, message: 'Applicant data found successfully ! ', response: response });
	}catch(err) {		
        console.log('Applicant data not present/DB issue ! ' + err);
        return({ success: false, message: 'Applicant data not present/DB issue !' });
    }		
}
/* Digital Admin  Requests Form Controller */
myApp.controller('digitalIdAdmin', ['$scope', '$http', '$window', 'NgTableParams', function($scope, $http, $window, NgTableParams) {

  $scope.getDigitalIdRequests = function() {
    $http({
      method: 'GET',
      url: '/getDigitalIdRequests'
    }).then(function successCallback(response) {
      if(response.data.success == true) {
        
                $scope.tableData = response.data.result;
                /*$scope.tableParams = new NgTableParams({
                        count: 4
                }, {
                        counts: [],
                        dataset: $scope.tableData
                });*/
      } else {
        alert(response.data.message);
      }
    });
  }

  $scope.selectedDigitalId = function(digitalId) {
        $window.sessionStorage.setItem("_id", digitalId);
        $window.location.href = '../ReadOnlyPages/digitalId_read_only.html';
  }

  $scope.Logout = function () {
        window.close();
  }

}]);

/* University Admin Login Controller */
myApp.controller('universityAdminLogin', ['$scope', 'fileUpload', '$http', '$filter', '$window', function($scope, fileUpload, $http, $filter, $window) {

  $scope.verifyLogin = function() {

    var data = {
      username: $scope.username,
      password: $scope.password
    }

    $http({
      method: 'POST',
      url: '/verifyLogin',
      data: data
    }).then(function successCallback(response) {
      if(response.data.success == true) {
        window.location.href = '/AdminPages/university_id_admin.html';
      } else {
        alert(response.data.message);
      }
    });
  }

}]);

/* University Success Controller */
myApp.controller('universityAdmin', ['$scope', '$http', '$window', 'NgTableParams', function($scope, $http, $window, NgTableParams) {

  $scope.getUniversityApplicantRequests = function() {
    $http({
      method: 'GET',
      url: '/getUniversityApplicantRequests'
    }).then(function successCallback(response) {
      if(response.data.success == true) {
                $scope.tableData = response.data.result;
/*                 $scope.tableParams = new NgTableParams({
                        count: 4
                }, {
                        counts: [],
                        dataset: $scope.tableData
                }); */
      } else {
        alert(response.data.message);
      }
    });
  }

  $scope.selectedDigitalId = function(digitalId) {
        $window.sessionStorage.setItem("_id", digitalId);
        $window.location.href = '../ReadOnlyPages/university_read_only.html';
  }

}]);