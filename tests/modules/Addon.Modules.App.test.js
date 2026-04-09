require('..');
const { Addon, Common } = require('../../src/Addon');

describe('Common.Modules.App', () => {
    beforeEach(() => {
        PropertiesService.getScriptProperties().deleteAllProperties();
        PropertiesService.getUserProperties().deleteAllProperties();
        PropertiesService.getDocumentProperties().deleteAllProperties();
    });

    it('should get and set script properties correctly', () => {
        const scriptProperties = PropertiesService.getScriptProperties();
        scriptProperties.setProperty('test_key', 'test_value');

        const retrievedValue = scriptProperties.getProperty('test_key');
        expect(retrievedValue).toBe('test_value');
    });

    it('should get and set user properties correctly', () => {
        const userProperties = PropertiesService.getUserProperties();
        userProperties.setProperty('user_key', 'user_value');

        const retrievedValue = userProperties.getProperty('user_key');
        expect(retrievedValue).toBe('user_value');
    });

    it('should get and set document properties correctly', () => {
        const documentProperties = PropertiesService.getDocumentProperties();
        documentProperties.setProperty('doc_key', 'doc_value');
        const retrievedValue = documentProperties.getProperty('doc_key');
        expect(retrievedValue).toBe('doc_value');
    });

    // getData test
    it('should retrieve correct data from App module', () => {
        const membershipInfo = {
            [Common.INPUT.SYSTEM.MEMBERSHIP.EXPIRES_AT]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            [Common.INPUT.SYSTEM.MEMBERSHIP.BALANCE]: 10
        };
        Common.Modules.CRM.Membership.setMembershipInfo(membershipInfo);
        const data = Addon.getData();
        expect(data).toBeDefined();
        expect(data[Common.INPUT.SYSTEM.MEMBERSHIP.IS_PREMIUM]).toBe(true);
        expect(data[Common.INPUT.SYSTEM.MEMBERSHIP.BALANCE]).toBe(10);
        expect(data[Common.INPUT.SYSTEM.MEMBERSHIP.EXPIRES_AT]).toBeInstanceOf(Date);
    });
});