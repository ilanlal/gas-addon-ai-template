require('..');
const { Addon, Common } = require('../../src/Addon');

const controller = Addon.Settings.Controller;

describe('Addon.Settings.Controller', () => {
    beforeEach(() => {
        PropertiesService.getUserProperties().deleteAllProperties();
    });

    describe('Actions', () => {
        // Load test
        it('should handle Load', () => {
            // mock event parameters
            const e = { parameters: {} };
            const settingsCard = controller.PushHomeCard(e);

            expect(settingsCard).toBeDefined();
            const cardData = settingsCard.getData();
            expect(cardData).toBeDefined();
            // no notification
            expect(cardData.notification).toBeUndefined();
        });

        // Save test
        it('should handle Save', () => {
            // mock event parameters
            const e = {
                commonEventObject: {
                    formInputs: {
                        [Common.INPUT.SYSTEM.ENABLE_EVENT_LOGGING]: {
                            stringInputs: {
                                value: ['OFF']
                            }
                        },
                        [Common.INPUT.SYSTEM.DISPLAY_ERROR_CARD]: {
                            stringInputs: {
                                value: ['ON']
                            }
                        }
                    }
                }
            };
            const settingsCard = controller.SaveSettings(e);

            expect(settingsCard).toBeDefined();
            const cardData = settingsCard.getData();
            expect(cardData).toBeDefined();

            // no notification
            expect(cardData.notification).toBeUndefined();

            // verify properties were saved
            const userProperties = PropertiesService.getDocumentProperties();
            expect(userProperties.getProperty(Common.INPUT.SYSTEM.ENABLE_EVENT_LOGGING)).toBe('OFF');
            expect(userProperties.getProperty(Common.INPUT.SYSTEM.DISPLAY_ERROR_CARD)).toBe('ON');
        });


    });
});