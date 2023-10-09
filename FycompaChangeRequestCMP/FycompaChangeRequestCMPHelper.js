({
    getAccountRecord : function(component) {
        var recordId = component.get("v.recordId");
        
        var action = component.get("c.getAccountRec");
        action.setParams({
            'recordId' : recordId,
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                component.set("v.accountRecord", storeResponse);
                console.log('storeResponse:	'+ JSON.stringify(storeResponse));
                if(storeResponse && storeResponse.Target__c != null && (storeResponse.Target__c == 'Deceased' || storeResponse.Target__c == 'Retired')){
                    this.showError(component, 'Change Requests are not allowed for Deceased or Retired HCPs');
                    $A.get("e.force:closeQuickAction").fire();
                }else{
                    this.getRecordTypeSelectionHelper(component);
                }
            }else if (state === "ERROR") {
                let errors = response.getError();
                let message = 'Unknown error';
                
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    message = errors[0].message;
                }
                this.showError(component, message);
                component.set("v.showContainerLoading", false);
            }
        });
        $A.enqueueAction(action);
    },
    
    getRecordTypeSelectionHelper : function(component) {
        var action = component.get('c.getRecordTypeSelection');
        
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state=='SUCCESS'){
                var result = response.getReturnValue();
                var recordTypes = [];
                recordTypes.push({ key : null, value : '--None--'}); //None option
                var selectedKey = null;
                for(var key in result){
                    let recTypeName = result[key];
                    let val = '';
           
                    if(recTypeName == 'Fycompa Specialty'){
                        val = 'Change Specialty';
                    }else if(recTypeName == 'EP Address Change'){
                        val = 'Change EP Primary Address';
                    }else if(recTypeName == 'Fycompa Target'){
                        val = 'Change Target Status';
                    }else if(recTypeName == 'Make Sample Eligibility Request'){
                        val = 'Make Sample Eligibility Request';
                    }
                    
                    recordTypes.push({key: key, value: val});
                    if(!selectedKey){
                        selectedKey = key;
                    }
                    
                    
                    
                }
                console.log('selectedKey:	'+selectedKey);
                component.set("v.recordTypeOptions", recordTypes);
                this.getPicklistOptions(component);
            }else if (state === "ERROR") {
                let errors = response.getError();
                let message = 'Unknown error';
                
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    message = errors[0].message;
                }

                this.showError(component, message);
            }
        });
        $A.enqueueAction(action);
    },

    getPicklistOptions : function(component){
        var action = component.get('c.getFieldPicklistOptions');
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log('getFieldPicklistOptions state: '+state);

            if(state == 'SUCCESS'){
                console.log('return value');
                console.log(response.getReturnValue());
                let picklistOpts = response.getReturnValue();
                var invalidSpecialtyOpts = ['Cardiology', 'Pediatric Neurology', 'Pediatric/Adolescent Care'];
                console.log('invalid specialty opts');
                console.log('picklistOpts ==> ', picklistOpts);
                console.log(invalidSpecialtyOpts);
                var includedProposedTargetStatus = ['Retired', 'Deceased', 'Non-Treater', 'No Access'];
                component.set('v.proposedTargetOpts', picklistOpts.Proposed_Fycompa_Target__c.filter(picklistOpt => (picklistOpt.value != component.get('v.accountRecord.Fycompa_Target__c') && includedProposedTargetStatus.includes(picklistOpt.value))));
                
                component.set('v.proposedSpecialtyOpts', picklistOpts.Proposed_Specialty__c.filter(picklistOpt => (picklistOpt.value != component.get('v.accountRecord.Specialty__c') && !invalidSpecialtyOpts.includes(picklistOpt.value))));
                component.set('v.proposedSubSpecialtyOpts', picklistOpts.Proposed_Sub_Specialty__c.filter(picklistOpt => (picklistOpt.value != component.get('v.accountRecord.Sub_Specialty__c') && !invalidSpecialtyOpts.includes(picklistOpt.value))));
            } else if (state === "ERROR") {
                let errors = response.getError();
                let message = 'Unknown error';
                
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    message = errors[0].message;
                }
                this.showError(component, message);
            }
            
            component.set("v.showContainerLoading", false);
        });
        $A.enqueueAction(action);
    },

    validateComboboxes : function(component){
        console.log('validating');
        let isValid = true;
        if(component.get('v.showTarget') == true){
            let proposedTarget = component.find('proposedTargetStatus');
            if(!proposedTarget.checkValidity()){
                isValid = false;
            }
            proposedTarget.reportValidity();
        }
        if(component.get('v.showSpecialty') == true){
            let proposedSpecialty = component.find('proposedSpecialty');
            if(!proposedSpecialty.checkValidity()){
                isValid = false;
            }
            proposedSpecialty.reportValidity();
            
            let proposedSubSpecialty = component.find('proposedSubSpecialty');
            if(!proposedSubSpecialty.checkValidity()){
                isValid = false;
            }
            proposedSubSpecialty.reportValidity();
        }
        if(component.get('v.showEPAddress') == true){
            var addressValCountry = component.find('addressValId').get("v.country");
            console.log('@@@ addressValCountry: ' + addressValCountry);
            var addressValStreet = component.find('addressValId').get("v.fullStreetAddress");
            console.log('@@@ addressValStreet: ' + addressValStreet);
            var addressValLocality = component.find('addressValId').get("v.locality");
            console.log('@@@ addressValLocality: ' + addressValLocality);
            var addressValPostalCode = component.find('addressValId').get("v.postal_code");
            console.log('@@@ addressValPostalCode: ' + addressValPostalCode);
            var addressValAdmAreaLev1 = component.find('addressValId').get("v.administrative_area_level_1");
            console.log('@@@ addressValAdmAreaLev1: ' + addressValAdmAreaLev1);

            if((addressValCountry == null || addressValCountry == '') || (addressValStreet == null || addressValStreet == '') || (addressValLocality == null || addressValLocality == '') ||
               (addressValPostalCode == null || addressValPostalCode == '') || (addressValAdmAreaLev1 == null || addressValAdmAreaLev1 == '')){
                isValid = false;
                alert('All Address fields are required. Please fill in all fields available to proceed.');
            }
            else if(!component.find('addresschangereason').checkValidity()){
                isValid = false;
                component.find('addresschangereason').reportValidity()
            }
        }
        console.log('validate comboboxes isvalid: '+isValid);

        return isValid;
    },
    
    showSuccess : function(component) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title : 'Success',
            message: 'Successfully Saved Change Request record.',
            duration:' 5000',
            key: 'info_alt',
            type: 'success',
            mode: 'pester'
        });
        toastEvent.fire();
    },
    
    showError : function(component, message) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title : 'Error',
            message: message,
            duration:'5000',
            key: 'info_alt',
            type: 'error',
            mode: 'pester'
        });
        toastEvent.fire();
    },
})