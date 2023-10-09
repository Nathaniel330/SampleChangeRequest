({
    doInIt : function(component, event, helper) {
        console.log('recordId: '+component.get('v.recordId'));
        component.set("v.showContainerLoading", true);
        helper.getAccountRecord(component);
    },
    
    handleNext : function(component, event, helper) {
        var selectedRecordType = component.get("v.selectedRecordType");
        var recordTypeOptions = component.get("v.recordTypeOptions");
        var selectedLabel;
        
        for(var rec in recordTypeOptions){
            if(recordTypeOptions[rec].key == selectedRecordType){
                selectedLabel = recordTypeOptions[rec].value;
            }
        }
        console.log('selectedLabel: '+ selectedLabel);
        console.log('selectedRecordType:    '+ selectedRecordType);
        
        if(selectedLabel && selectedLabel == 'Change Specialty'){
            component.set("v.showSpecialty", true);
            component.set("v.showTarget", false);
            component.set('v.showEPAddress', false);
            component.set('v.showSamplingTarget', false);
        }else if(selectedLabel && selectedLabel == 'Change Target Status'){
            component.set("v.showTarget", true);
            component.set("v.showSpecialty", false);
            component.set('v.showEPAddress', false);
            component.set('v.showSamplingTarget', false);
        }else if(selectedLabel == 'Change EP Primary Address'){
            component.set('v.showEPAddress', true);
            component.set("v.showTarget", false);
            component.set("v.showSpecialty", false);
            component.set('v.showSamplingTarget', false);
        }else if(selectedLabel == 'Make Sample Eligibility Request'){
            component.set('v.showSamplingTarget', true);
            component.set("v.showSpecialty", false);
            component.set("v.showTarget", false);
            component.set("v.showEPAddress", false);
        }
        component.set("v.openChangeRequest", false);
    },

    handleValidate : function(component, event, helper){
        console.log('handle validate');
        let areValid = helper.validateComboboxes(component);
        component.set('v.areComboboxesValid', areValid);
    },
    
    handleSubmit: function(component, event, helper) {
        console.log('handling submit');
        event.preventDefault();
        if(component.get('v.areComboboxesValid') == true){
            component.set("v.showContainerLoading", true);
            
            let fields = JSON.parse(JSON.stringify(event.getParam('fields')));
            if(component.get('v.showTarget')){
                fields["Current_Fycompa_Target__c"] = component.get('v.accountRecord.Fycompa_Target__c');
                fields["RecordTypeId"] = component.get("v.selectedRecordType");
                fields["Why_do_you_want_to_make_these_changes__c"] = component.get("v.reasonValue");
                component.find("recordEditForm").submit(JSON.parse(JSON.stringify(fields)));
            }
            if(component.get('v.showSpecialty')){
                fields["Current_Specialty__c"] = component.get('v.accountRecord.Specialty__c');
                fields["Current_Subspecialty__c"] = component.get('v.accountRecord.Sub_Specialty__c');
                fields["RecordTypeId"] = component.get("v.selectedRecordType");
                fields["Why_do_you_want_to_make_these_changes__c"] = component.get("v.reasonValue");
                component.find("recordEditForm").submit(JSON.parse(JSON.stringify(fields)));
            }
            if(component.get('v.showSamplingTarget')){
                fields["RecordTypeId"] = component.get("v.selectedRecordType");
                fields["Current_Sample_Elgibility_Status__c"] = 'Non-Sample Eligible';
                fields["Proposed_Sample_Eligibility_Status__c"] = 'Sample Eligible Requested'; 
                fields["Why_do_you_want_to_make_these_changes__c"] = component.get("v.reasonValue");
                component.find("recordEditForm").submit(JSON.parse(JSON.stringify(fields)));
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

                let addressDetails = {
                    country : addressValCountry,
                    street : addressValStreet,
                    city : addressValLocality,
                    postalCode : addressValPostalCode,
                    state : addressValAdmAreaLev1
                };

                let action = component.get('c.saveEPAddressChangeRequest');
                action.setParams({
                    recordId : component.get('v.recordId'),
                    details : addressDetails,
                    whyMakeThisChange : component.get("v.reasonValue")
                });
                action.setCallback(this, function(response){
                    var state = response.getState();
                    console.log('save ep address change state: '+state);

                    if(state === "SUCCESS") {
                        helper.showSuccess(component);
                        $A.get("e.force:closeQuickAction").fire();
                    } else if (state === 'ERROR'){
                        console.log('An error has occurred');
                        let errors = response.getError();
                        let message = 'Unknown error';
                        
                        if (errors && Array.isArray(errors) && errors.length > 0) {
                            message = errors[0].message;
                        }
                        console.log('message: '+message);
                    }
                });

                $A.enqueueAction(action);
            }

        }
    },
    
    handleSuccess : function(component, event, helper) {
        component.set("v.showContainerLoading", false);
        
        var record = event.getParam("response");
        var apiName = record.apiName;
        var recordId = record.id;
        console.log('recordId:  '+recordId);
        helper.showSuccess(component);
        $A.get("e.force:closeQuickAction").fire();
    },

    handleError : function(component, event, helper){
        console.log('An error has occurred while submitting v3');
        console.log(JSON.parse(JSON.stringify(event.getParams())));
        var message = '';
        if(JSON.parse(JSON.stringify(event.getParams())).detail == null || typeof JSON.parse(JSON.stringify(event.getParams())).detail == 'undefined'){
            message = JSON.parse(JSON.stringify(event.getParams())).message;
        }else{
            message = JSON.parse(JSON.stringify(event.getParams())).detail;
        }
        
        helper.showError(component, JSON.parse(JSON.stringify(event.getParams())).detail);
        component.set("v.showContainerLoading", false);
    },
    
    handleBack : function(component, event, helper) {
        component.set("v.openChangeRequest", true);
        component.set("v.showSpecialty", false);
        component.set("v.showTarget", false);
        component.set("v.showEPAddress", false);
        component.set("v.showSamplingTarget", false);
        component.set("v.reasonValue", '');
    },
    handleCancel : function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },
})