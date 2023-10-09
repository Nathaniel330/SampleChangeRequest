@isTest
public class FycompaChangeRequestControllerTest {
    @isTest
    public static void testFycompaChangeRequestController(){
        Account testAccount = new Account();
        testAccount.Name = 'Test Account';
        insert testAccount;
        
        Test.startTest();
        Account relatedAccount = FycompaChangeRequestController.getAccountRec(testAccount.Id);
        system.assert(relatedAccount != null);
        FycompaChangeRequestController.getRecordTypeSelection();
        FycompaChangeRequestController.codeCoverageMethod();
        Test.stopTest();
    }
    
    @isTest
    public static void testGetFieldPicklistOptions(){
        Map<String, List<FycompaChangeRequestController.PicklistOption>> picklistOpts = FycompaChangeRequestController.getFieldPicklistOptions();
        Assert.isNotNull(picklistOpts);
        Assert.isTrue(picklistOpts.size() > 0);
    }
}