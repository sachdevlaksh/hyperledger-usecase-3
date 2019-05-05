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

function RegisterUser(UserDetails){
console.log(UserDetails);
 var factory = getFactory();
var newUserDetails = factory.newResource('org.general.digitalid','User',UserDetails.user.GovermentId);
newUserDetails =  UserDetails.user;
  return getAssetRegistry('org.general.digitalid.User')
 .then(function(registry) {
   registry.add(newUserDetails)
  });
}

/**
* 
 * @param {org.general.digitalid.RegisterStudentInfo} registerStudentRecoord 
 * @transaction
 */


 function RegisterStudentInfo(registerStudentRecoord) {
   //udpate the asset after Student Admin transaction
   if (registerStudentRecoord.studentInfoStatus = 'Approved') {     
        registerStudentRecoord.user.universityAdmissionStatus = "Approved";
     	registerStudentRecoord.user.DigitalIdDataInfo.Student = registerStudentRecoord.student;
     console.log(" Student Object"+JSON.stringify(registerStudentRecoord.user.DigitalIdDataInfo));
     
    } else {         
     registerStudentInfo.user.universityAdmissionStatus  = "Pending";
   }       
   
   //get asset registry for User, and update on the ledger
   return getAssetRegistry('org.general.digitalid.User')
     .then(function (assetRegistry) {
   return assetRegistry.update(registerStudentRecoord.user);
   })                
}
/**
 function RegisterStudentInfo(registerStudentInfo) {
   
   var User = registerStudentInfo.user;
   // Get the vehicle asset registry.
   return getAssetRegistry('org.general.digitalid.User')
   .then(function (userAssetRegistry) {
    // Get the factory for creating new asset instances.
     var factory = getFactory();
    // Modify the properties of the vehicle.
 if (registerStudentInfo.studentInfoStatus = 'Approved') {
     console.log( "Student Object inside Transaction : " + JSON.stringify(registerStudentInfo.Student));
     User.Student = registerStudentInfo.Student
     User.universityAdmissionStatus = "Approved";
    }
   else { 
     console.log("Denied Cond." +registerStudentInfo);
     User.universityAdmissionStatus = false
   }
    // Update the vehicle in the vehicle asset registry.
    return userAssetRegistry.update(User);
  }).catch(function (error) {
    // Add optional error handling here.
  });
 }
*/
   
/* 
 function RegisterStudentInfo(registerStudentInfo) {
    var factory = getFactory();
	var existingUser = getAssetRegistry('org.general.digitalid.User')
   //udpate the asset after nursery response
   if (registerStudentInfo.studentInfoStatus = 'Approved') {        
     	existingUser.Student = registerStudentInfo.student
        existingUser.universityAdmissionStatus = "Approved";
     console.log( "If Condition : User Object inside Transaction : " + JSON.stringify(existingUser));
    } else { 
        console.log("Denied Cond." +registerStudentInfo);
     existingUser.universityAdmissionStatus = false
   }
     registry.update(existingUser)
     console.log( "Updated ApplicantInfo" + JSON.stringify(registerStudentInfo.User));
   
   
   //get asset registry for land records, and update on the ledger
   return getAssetRegistry('org.general.digitalid.User')
     .then(function (assetRegistry) {
     //return assetRegistry.update(registerStudentInfo.User);
     return assetRegistry.update(registerStudentInfo.User);
   })                
}
*/
