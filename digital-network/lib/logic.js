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
 * @param {org.general.digitalid.RegisterStudentInfo} registerStudentRecoord 
 * @transaction
 */

function RegisterStudentInfo(registerStudentRecoord) {
    var userObj = registerStudentRecoord.user;
    console.log("user Object : " + JSON.stringify(userObj));
    console.log("student Object : " + JSON.stringify(userObj.digitalIdDataInfo.student));
    //udpate the asset after Student Admin transaction
    if (registerStudentRecoord.StudentInfoStatus = 'Approved') {
        userObj.universityAdmissionStatus = "Approved";
        userObj.digitalIdDataInfo.student.HighestEducation = registerStudentRecoord.HighestEducation;
        userObj.digitalIdDataInfo.student.CourseToPursue = registerStudentRecoord.CourseToPursue;
        userObj.digitalIdDataInfo.student.Specialization = registerStudentRecoord.Specialization;
        userObj.digitalIdDataInfo.student.Type = registerStudentRecoord.Type;

    } else {
        userObj.universityAdmissionStatus = "Pending";

    }

    //get asset registry for User, and update on the ledger
    return getAssetRegistry('org.general.digitalid.User').then(function (assetRegistry) {
        return assetRegistry.update(registerStudentRecoord.user);
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
    if (registerEmployeeRecoord.employeeInfoStatus = 'Approved') {
        userObj.employeeApplicationStatus = "Approved";
        userObj.digitalIdDataInfo.employee.CurrentEmployer = registerEmployeeRecoord.CurrentEmployer;
        userObj.digitalIdDataInfo.employee.PreviousEmployer = registerEmployeeRecoord.PreviousEmployer;
        userObj.digitalIdDataInfo.employee.TotalExperience = registerEmployeeRecoord.TotalExperience;
        userObj.digitalIdDataInfo.employee.CurrentCTC = registerEmployeeRecoord.CurrentCTC;

    } else {
        userObj.employeeApplicationStatus = "Pending";

    }

    //get asset registry for User, and update on the ledger
    return getAssetRegistry('org.general.digitalid.User').then(function (assetRegistry) {
        return assetRegistry.update(registerEmployeeRecoord.user);
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
    if (registerVisaRecoord.visaInfoStatus = 'Approved') {
        userObj.visaApplicationStatus = "Approved";
        userObj.digitalIdDataInfo.visa.Country = registerVisaRecoord.Country;
        userObj.digitalIdDataInfo.visa.Duration = registerVisaRecoord.Duration;
        userObj.digitalIdDataInfo.visa.ReasonOfTraveling = registerVisaRecoord.ReasonOfTraveling;
        userObj.digitalIdDataInfo.visa.Comments = registerVisaRecoord.Comments;
          userObj.digitalIdDataInfo.visa.Status = registerVisaRecoord.Status;

    } else {
        userObj.visaApplicationStatus = "Pending";

    }

    //get asset registry for User, and update on the ledger
    return getAssetRegistry('org.general.digitalid.User').then(function (assetRegistry) {
        return assetRegistry.update(registerVisaRecoord.user);
    })
}
