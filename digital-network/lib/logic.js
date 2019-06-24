/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getFactory emit */

/** 
 * @param {org.general.digitalid.RegisterUser} UserDetails
 * @transaction
 */

function RegisterUser(UserDetails) {
    console.log(UserDetails);
    var factory = getFactory();
    var newUserDetails = factory.newResource('org.general.digitalid', 'User', UserDetails.user.GovermentId);
    newUserDetails = UserDetails.user;
    return getAssetRegistry('org.general.digitalid.User')
        .then(function (registry) {
            registry.add(newUserDetails)
        });
}

/**
 * 
 * @param {org.general.digitalid.digitalIdStatus} digitalStatus 
 * @transaction
 */

function digitalIdStatus(digitalStatus) {
    var userObj = digitalStatus.user;
  	userObj.digitalIdStatus = digitalStatus.status;
  
      //get asset registry for User, and update on the ledger
    return getAssetRegistry('org.general.digitalid.User').then(function (assetRegistry) {
        return assetRegistry.update(userObj);
    })
}

/**
 * 
 * @param {org.general.digitalid.RegisterStudentInfo} registerStudentRecoord 
 * @transaction
 */

function RegisterStudentInfo(registerStudentRecoord) {
    var userObj = registerStudentRecoord.user;
    console.log("user Object : " + JSON.stringify(userObj));
    console.log("student Object : " + JSON.stringify(userObj.digitalIdDataInfo.student));
    //udpate the asset after Student Admin transaction
   	userObj.digitalIdDataInfo.student.HighestEducation = registerStudentRecoord.HighestEducation;
    userObj.digitalIdDataInfo.student.CourseToPursue = registerStudentRecoord.CourseToPursue;
    userObj.digitalIdDataInfo.student.Specialization = registerStudentRecoord.Specialization;
    userObj.digitalIdDataInfo.student.Type = registerStudentRecoord.Type;
    userObj.universityAdmissionStatus = "Pending";    

   	//get asset registry for User, and update on the ledger
    return getAssetRegistry('org.general.digitalid.User').then(function (assetRegistry) {
        return assetRegistry.update(userObj);
    })
}

/**
 * 
 * @param {org.general.digitalid.universityAdmissionStatus} studentStatus 
 * @transaction
 */

function universityAdmissionStatus(studentStatus) {
    var userObj = studentStatus.user;
  	userObj.universityAdmissionStatus = studentStatus.status;
  
      //get asset registry for User, and update on the ledger
    return getAssetRegistry('org.general.digitalid.User').then(function (assetRegistry) {
        return assetRegistry.update(userObj);
    })
}
/**
 * 
 * @param {org.general.digitalid.RegisterEmployeeInfo} registerEmployeeRecoord 
 * @transaction
 */

function RegisterEmployeeInfo(registerEmployeeRecoord) {
    var userObj = registerEmployeeRecoord.user;
    console.log("user Object : " + JSON.stringify(userObj));
    console.log("employee Object : " + JSON.stringify(userObj.digitalIdDataInfo.employee));
    //udpate the asset after Student Admin transaction
    
     userObj.employeeApplicationStatus = "Approved";
     userObj.digitalIdDataInfo.employee.CurrentEmployer = registerEmployeeRecoord.CurrentEmployer;
     userObj.digitalIdDataInfo.employee.PreviousEmployer = registerEmployeeRecoord.PreviousEmployer;
     userObj.digitalIdDataInfo.employee.TotalExperience = registerEmployeeRecoord.TotalExperience;
     userObj.digitalIdDataInfo.employee.CurrentCTC = registerEmployeeRecoord.CurrentCTC;
     userObj.employeeApplicationStatus = "Pending";

    

    //get asset registry for User, and update on the ledger
    return getAssetRegistry('org.general.digitalid.User').then(function (assetRegistry) {
        return assetRegistry.update(userObj);
    })
}

/**
 * 
 * @param {org.general.digitalid.employeeApplicationStatus} employeeStatus 
 * @transaction
 */

function employeeApplicationStatus(employeeStatus) {
    var userObj = employeeStatus.user;
  	userObj.employeeApplicationStatus = employeeStatus.status;
  
      //get asset registry for User, and update on the ledger
    return getAssetRegistry('org.general.digitalid.User').then(function (assetRegistry) {
        return assetRegistry.update(userObj);
    })
}
/**
 * 
 * @param {org.general.digitalid.RegisterVisaInfo} registerVisaRecoord 
 * @transaction
 */

function RegisterVisaInfo(registerVisaRecoord) {
    var userObj = registerVisaRecoord.user;
    console.log("user Object : " + JSON.stringify(userObj));
    console.log("visa Object : " + JSON.stringify(userObj.digitalIdDataInfo.visa));
    //udpate the asset after Student Admin transaction
    userObj.digitalIdDataInfo.visa.Country = registerVisaRecoord.Country;
    userObj.digitalIdDataInfo.visa.Duration = registerVisaRecoord.Duration;
    userObj.digitalIdDataInfo.visa.ReasonOfTraveling = registerVisaRecoord.ReasonOfTraveling;
    userObj.digitalIdDataInfo.visa.Comments = registerVisaRecoord.Comments;
    userObj.digitalIdDataInfo.visa.Status = registerVisaRecoord.Status;
    userObj.visaApplicationStatus = "Pending";

   //get asset registry for User, and update on the ledger
    return getAssetRegistry('org.general.digitalid.User').then(function (assetRegistry) {
    return assetRegistry.update(userObj);
    })
}

/**
 * 
 * @param {org.general.digitalid.visaApplicationStatus} visaStatus 
 * @transaction
 */

function visaApplicationStatus(visaStatus) {
    var userObj = visaStatus.user;
  	userObj.visaApplicationStatus = visaStatus.status;
  
      //get asset registry for User, and update on the ledger
    return getAssetRegistry('org.general.digitalid.User').then(function (assetRegistry) {
        return assetRegistry.update(userObj);
    })
}
