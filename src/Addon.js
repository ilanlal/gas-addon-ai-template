// src/Addon.js
class Addon {
    static primaryColor() {
        return '#1010ff';
    }

    static secondaryColor() {
        return '#88001b';
    }

    static accentColor() {
        return '#f4b400';
    }

    static getData() {
        const documentProperties = PropertiesService.getDocumentProperties();
        const membershipInfo = Common.Modules.CRM.Membership.getMembershipInfo() || {};

        const expiresAt = membershipInfo[Common.INPUT.SYSTEM.MEMBERSHIP.EXPIRES_AT] ? new Date(membershipInfo[Common.INPUT.SYSTEM.MEMBERSHIP.EXPIRES_AT]) : null;
        const balance = membershipInfo[Common.INPUT.SYSTEM.MEMBERSHIP.BALANCE] || 0;
        const isPremium = (expiresAt && expiresAt > new Date()) || balance > 0;
        const indentationSpaces = '4';
        const showErrorsSwitch = documentProperties.getProperty(Common.INPUT.SYSTEM.DISPLAY_ERROR_CARD) || 'OFF';
        const highlightColor = '#FFFF00';
        const terminalOutputSwitch = documentProperties.getProperty(Common.INPUT.SYSTEM.ENABLE_TERMINAL_OUTPUT) || 'ON';
        const ignoreWhitespaceSwitch = documentProperties.getProperty(Common.INPUT.SYSTEM.IGNORE_WHITE_SPACE) || 'ON';
        const geminiApiKey = Common.Modules.GeminiAgent.getApiKey();
        const apiResponseModel = Common.Modules.GeminiAgent.getModel();
        const instructionCellReference = PropertiesService.getDocumentProperties().getProperty(Common.INPUT.GEMINI.INSTRUCTION_CELL_REFERENCE) || '';
        const botApiToken = Common.Modules.TelegramBotSettings.getUserApiKey();
        const botApiEndpoint = PropertiesService.getDocumentProperties().getProperty(Common.INPUT.TELEGRAM_BOT.BOT_API_ENDPOINT_URL)

        let result = { ok: false, description: 'Not connected. Please enter your bot token to fetch webhook info.' };
        if (botApiToken) {
            const telegramBotClient = new Common.Modules.TelegramBotClient(botApiToken);
            const response = telegramBotClient.getWebhookInfo();

            if (JSON.parse(response.getContentText()).ok !== true) {
                result = { error: 'Unable to fetch webhook info. Please check your bot token and connection.' };
            } else {
                // Parse the result
                result = JSON.parse(response.getContentText()).result;
            }
        }

        const leds = Addon.getLeds({
            telegramApiKeySet: !!botApiToken,
            geminiApiKeySet: !!geminiApiKey,
            llmModelSet: !!apiResponseModel,
            webhookSet: !!result.url,
            instructionCellSet: !!instructionCellReference,
            isPremium: isPremium,
        });

        return {
            indentation_spaces: parseInt(indentationSpaces, 10),
            [Common.INPUT.SYSTEM.DISPLAY_ERROR_CARD]: showErrorsSwitch,
            highlight_color: highlightColor,
            [Common.INPUT.SYSTEM.ENABLE_TERMINAL_OUTPUT]: terminalOutputSwitch,
            [Common.INPUT.SYSTEM.IGNORE_WHITE_SPACE]: ignoreWhitespaceSwitch,
            // Telegram Bot Info
            [Common.INPUT.TELEGRAM_BOT.BOT_API_TOKEN]: botApiToken,
            // Gemini API Info
            [Common.INPUT.GEMINI.GEMINI_API_KEY]: geminiApiKey,
            [Common.INPUT.GEMINI.GEMINI_MODEL]: apiResponseModel,
            // Membership Info
            [Common.INPUT.SYSTEM.MEMBERSHIP.MEMBERSHIP_KEY]: membershipInfo,
            [Common.INPUT.SYSTEM.MEMBERSHIP.IS_PREMIUM]: isPremium,
            [Common.INPUT.SYSTEM.MEMBERSHIP.BALANCE]: balance,
            [Common.INPUT.SYSTEM.MEMBERSHIP.EXPIRES_AT]: expiresAt,
            // Gemini Instruction Cell Reference
            [Common.INPUT.GEMINI.INSTRUCTION_CELL_REFERENCE]: instructionCellReference,
            // Package Info
            package: Addon.Package,
            leds: leds,
            webhookInfo: result
        };
    }

    static getLeds(params = {
        telegramApiKeySet: false,
        geminiApiKeySet: false,
        llmModelSet: false,
        webhookSet: false,
        instructionCellSet: false,
        isPremium: false,
    }) {
        const ledsMap = [
            params.telegramApiKeySet ? '🟢' : '🔴',
            params.geminiApiKeySet ? '🟢' : '🔴',
            params.llmModelSet ? '🟢' : '🔴',
            params.webhookSet ? '🟢' : '🔴',
            params.instructionCellSet ? '🟢' : '🔴',
            params.isPremium ? '🟢' : '🔴',
        ];

        // Return string of leds.
        return ledsMap.join(' ');
    }
};

class Common { };

Common.INPUT = {
    version: '1.0.0',
    get SYSTEM() {
        return {
            get INDENTATION_SPACES() {
                return 'indentation_spaces';
            },
            get IGNORE_WHITE_SPACE() {
                return 'ignore_white_space';
            },
            get EXPORT_TOKEN() {
                return 'EXPORT_TOKEN'
            },
            get PRAITY_JSON() {
                return 'PRAITY_JSON'
            },
            get DISPLAY_ERROR_CARD() {
                return 'DISPLAY_ERROR_CARD';
            },
            get ENABLE_EVENT_LOGGING() {
                return 'enable_event_logging';
            },
            get ENABLE_TERMINAL_OUTPUT() {
                return 'enable_terminal_output';
            },
            get LANGUAGE_CODE() {
                return 'language_code';
            },
            get MEMBERSHIP() {
                return {
                    get MEMBERSHIP_KEY() {
                        return 'membership';
                    },
                    get IS_PREMIUM() {
                        return 'IS_PREMIUM';
                    },
                    get BALANCE() {
                        return 'BALANCE';
                    },
                    get EXPIRES_AT() {
                        return 'EXPIRES_AT';
                    },
                }
            }
        }
    },
    get GEMINI() {
        return {
            get GEMINI_API_KEY() {
                return 'GEMINI_API_KEY';
            },
            get GEMINI_MODEL() {
                return 'GEMINI_MODEL';
            },
            get GEMINI_TEMPERATURE() {
                return 'GEMINI_TEMPERATURE';
            },
            get GEMINI_MOOD() {
                return 'GEMINI_MOOD';
            },
            get THINKING_LEVEL() {
                return 'THINKING_LEVEL';
            },
            get THINKING_BUDGET() {
                return 'THINKING_BUDGET';
            },
            get INSTRUCTION_CELL_REFERENCE() {
                return 'INSTRUCTION_CELL_REFERENCE';
            }
        };
    },
    get TELEGRAM_BOT() {
        return {
            get BOT_API_TOKEN() {
                return 'BOT_API_TOKEN';
            },
            get CHAT_ID() {
                return 'CHAT_ID';
            },
            get BOT_FRIENDLY_NAME() {
                return 'BOT_FRIENDLY_NAME';
            },
            get BOT_USERNAME() {
                return 'BOT_USERNAME';
            },
            get BOT_API_ENDPOINT_URL() {
                return 'BOT_API_ENDPOINT_URL';
            },
            get BOT_WEBHOOK_URL() {
                return 'BOT_WEBHOOK_URL';
            },
            get BOT_IP_ADDRESS() {
                return 'BOT_IP_ADDRESS';
            },
            get BOT_MAX_CONNECTIONS() {
                return 'BOT_MAX_CONNECTIONS';
            },
            get BOT_SECRET_TOKEN() {
                return 'BOT_SECRET_TOKEN';
            },
            get DROP_PENDING_UPDATES() {
                return 'DROP_PENDING_UPDATES';
            },
        };
    },
    get MCP() {
        return {
            get MCP_API_KEY() {
                return 'MCP_API_KEY';
            }
        }
    }
};

Common.Modules = {
    Sheet: {
        version: '1.1.0',
        get WEBHOOK_EVENT_SHEET_META() {
            return {
                name: '📑 Event Log',
                columns: ['Timestamp', 'Source', 'Message', 'Event Object', 'More Info']
            };
        },
        get TERMINAL_OUTPUT_SHEET_META() {
            return {
                name: '💻 Terminal Output',
                columns: ['Timestamp', 'Event', 'Model', 'Payload', 'Prompt', 'Response', 'Generated Text', 'Usage', 'Total Tokens', 'Prompt Tokens', 'Thoughts Tokens', 'Cached Content Tokens', 'Candidates Tokens', 'Tool Use Prompt Tokens']
            };
        },
        initializeSheet(activeSpreadsheet, sheetMeta = {}) {
            if (!sheetMeta.name) {
                throw new Error('Sheet model must have a valid name property');
            }

            let sheet = activeSpreadsheet.getSheetByName(sheetMeta.name);
            if (!sheet) {
                sheet = activeSpreadsheet.insertSheet(sheetMeta.name);

                if ((sheetMeta.columns || []).length > 0) {
                    sheet.appendRow(sheetMeta.columns);
                }
            }

            return sheet;
        },
        setActiveSheet(activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet(), sheetMeta = {}) {
            return activeSpreadsheet
                .setActiveSheet(this.getSheet(activeSpreadsheet, sheetMeta));
        },
        getSheet(activeSpreadsheet, sheetMeta = {}) {
            return this._sheet = this.initializeSheet(activeSpreadsheet, sheetMeta);
        },
        bindSheetSampleData(activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet(), sheetMeta = {}) {
            const sampleData = sheetMeta.sample_data || [];
            if (sampleData.length === 0) {
                return;
            }

            const sheet = this.getSheet(activeSpreadsheet, sheetMeta);
            const existingValues = sheet.getDataRange().getValues() || [];

            // merge existing values with sample data (existing values first)
            const mergedValues = existingValues.concat(sampleData);

            // pad rows to match columns length
            const columnsLength = (sheetMeta.columns || []).length;
            for (let row = 0; row < mergedValues.length; row++) {
                while (mergedValues[row].length < columnsLength) {
                    mergedValues[row].push('');
                }
            }

            // set the merged values back to the sheet
            sheet.getRange(1, 1, mergedValues.length, mergedValues[0].length)
                .setValues(mergedValues);

            return sheet;
        },
        dumpObjectToSheet(activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet(), sheetMeta = {}, bot = '', action = '.', obj = {}, praittfyJson = false) {
            const sheet = this.getSheet(activeSpreadsheet, sheetMeta);
            const values = Object.values(obj);
            values.forEach((val, idx) => {
                // stringify objects and arrays
                if (typeof val === 'object') {
                    values[idx] = praittfyJson ? JSON.stringify(val, null, 2) : JSON.stringify(val);
                }
            });
            const row_data = [
                new Date().toISOString(),   // timestamp
                bot,                        // bot
                action,                     // action
                praittfyJson ? JSON.stringify(obj, null, 2) : JSON.stringify(obj),        // raw object data
                ...values                   // individual data fields
            ]
            // append data as a new row
            sheet.appendRow(row_data);

            // Set active selection to the last row
            const lastRow = sheet.getLastRow();
            const lastRowA1Notation = `A${lastRow}:E${lastRow}`;
            sheet.setActiveSelection(lastRowA1Notation);

            return sheet;
        },
        writeWebhookEvent(activeSpreadsheet, source, message, chatId, e, param1, param2, param3) {
            // Check if webhook event logging is enabled
            const webhookEventLoggingEnabled = PropertiesService.getScriptProperties()
                .getProperty(Common.INPUT.SYSTEM.ENABLE_EVENT_LOGGING) || 'ON';

            if (webhookEventLoggingEnabled !== 'ON') {
                return;
            }

            const sheet = Common.Modules.Sheet
                .getSheet(activeSpreadsheet, Common.Modules.Sheet.WEBHOOK_EVENT_SHEET_META);

            sheet.appendRow([
                // Created On as iso string
                new Date().toISOString(),
                // source
                source,
                // Message
                (typeof message === 'object' || Array.isArray(message) || String(message).startsWith('{')) ? JSON.stringify(message) : message,
                // Event Object
                (typeof e === 'object' || Array.isArray(e) || String(e).startsWith('{')) ? JSON.stringify(e) : e,
                // Chat ID
                chatId,
                // Details 
                (typeof param1 === 'object' || Array.isArray(param1) || String(param1).startsWith('{')) ? JSON.stringify(param1) : param1,
                (typeof param2 === 'object' || Array.isArray(param2) || String(param2).startsWith('{')) ? JSON.stringify(param2) : param2,
                (typeof param3 === 'object' || Array.isArray(param3) || String(param3).startsWith('{')) ? JSON.stringify(param3) : param3
            ]);

            return sheet;
        },
        writeGeminiResponse(activeSpreadsheet, eventObject, model, payload, response) {
            // Check if terminal output is enabled
            const terminalOutputEnabled = PropertiesService.getScriptProperties()
                .getProperty(Common.INPUT.SYSTEM.ENABLE_TERMINAL_OUTPUT) || 'ON';

            // Check if terminal output is enabled
            if (terminalOutputEnabled !== 'ON') {
                return;
            }

            const sheet = Common.Modules.Sheet
                .getSheet(activeSpreadsheet, this.TERMINAL_OUTPUT_SHEET_META);
            const genratedText = response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            sheet.appendRow([
                // Created On as iso string
                new Date().toISOString(),
                // Event Object
                (typeof eventObject === 'object' || Array.isArray(eventObject) || String(eventObject).startsWith('{')) ? JSON.stringify(eventObject) : eventObject,
                // Mode (e.g., "gemini-3-flash-preview")
                model,
                // Payload
                (typeof payload === 'object' || Array.isArray(payload) || String(payload).startsWith('{')) ? JSON.stringify(payload) : payload,
                // Prompt (if available in payload)
                payload?.contents?.[0]?.parts?.[0]?.text || '',
                // Response
                (typeof response === 'object' || Array.isArray(response) || String(response).startsWith('{')) ? JSON.stringify(response) : response,
                // Generated Text (if available in response) ({"candidates":[{"content":{"parts":[{"text": "generated text here"}]}}]})
                genratedText,
                // Usage Metadata (stringified if available in response.usageMetadata)
                response?.usageMetadata ? JSON.stringify(response.usageMetadata) : '{}',
                // Total Token Count (if available in response.usageMetadata)
                response?.usageMetadata?.totalTokenCount || 0,
                // Prompt Token Count (if available in response.usageMetadata)
                response?.usageMetadata?.promptTokenCount || 0,
                // Thoughts Token Count (if available in response.usageMetadata)
                response?.usageMetadata?.thoughtsTokenCount || 0,
                // cachedContentTokenCount (if available in response.usageMetadata)
                response?.usageMetadata?.cachedContentTokenCount || 0,
                // candidatesTokenCount (if available in response.usageMetadata)
                response?.usageMetadata?.candidatesTokenCount || 0,
                // toolUsePromptTokenCount (if available in response.usageMetadata)
                response?.usageMetadata?.toolUsePromptTokenCount || 0
            ]);

            return sheet;
        }
    },
    TelegramBotClient: class {
        constructor(botToken = '[YOUR_BOT_TOKEN]') {
            this.telegramEnpBaseUrl = "https://api.telegram.org/bot" + botToken;
        }

        setMyName({ name, language_code }) {
            const data = {
                'method': "post",
                'payload': {
                    'name': name,
                    'language_code': language_code ?? ''
                }
            };
            const url = this.getApiBaseUrl() + "/setMyName";
            return UrlFetchApp.fetch(url, data);

        }

        setMyDescription({ description, language_code }) {
            const data = {
                'method': "post",
                'payload': {
                    'description': description,
                    'language_code': language_code
                }
            };
            const url = this.getApiBaseUrl() + "/setMyDescription";
            return UrlFetchApp.fetch(url, data);
        }

        setMyShortDescription({ short_description, language_code }) {
            const data = {
                'method': "post",
                'payload': {
                    'short_description': short_description,
                    'language_code': language_code
                }
            };
            const url = this.getApiBaseUrl() + "/setMyShortDescription";
            return UrlFetchApp.fetch(url, data);
        }

        /**
        * Set the list of the bot's commands. See https://core.telegram.org/bots/api#botcommand for details on the command structure.
        * @param {Object} params - The parameters for setting the bot's commands.
        * @param {Array} params.commands - The list of commands to set.
        * @param {string} [params.language_code] - The language code for the commands.
        * @param {Object} [params.scope] - The scope of the commands.
        * @see https://core.telegram.org/bots/api#setmycommands
        * @throws {Error} If the commands parameter is empty.
        * @returns {HTTPResponse} The response from the API.
        *
        */
        setMyCommands({ commands = [], language_code }) {
            if (commands.length === 0) {
                throw new Error("commands is required!");
            }
            const data = {
                'method': "post",
                'payload': {
                    //'scope': scope,
                    'commands': JSON.stringify(commands),
                    'language_code': language_code
                }
            };
            const url = this.getApiBaseUrl() + "/setMyCommands";
            return UrlFetchApp.fetch(url, data);
        }

        getMe() {
            const url = this.getApiBaseUrl() + "/getMe";
            return UrlFetchApp.fetch(url);
        }

        getApiBaseUrl() {
            return this.telegramEnpBaseUrl;
        }

        /**
         * @see https://core.telegram.org/bots/api#getwebhookinfo
         **/
        getWebhookInfo() {
            const url = this.getApiBaseUrl() + "/getWebhookInfo";

            return UrlFetchApp.fetch(url);
        }

        /**
         * @see https://core.telegram.org/bots/api#setwebhook
         **/
        setWebhook(webAppUrl, payload) {
            if (!webAppUrl) {
                throw new Error("webAppUrl parameter is null or empty!");
            }

            // Simple setWebhook without extra payload
            if (!payload) {
                const url = this.getApiBaseUrl() + "/setWebhook?url=" + webAppUrl;
                return UrlFetchApp.fetch(url);
            }

            // setWebhook with extra payload
            const url = this.getApiBaseUrl() + "/setWebhook";
            const data = {
                'method': "post",
                'payload': {
                    ...payload,
                    // re-write url parameter if exists within payload
                    'url': webAppUrl
                }
            };
            return UrlFetchApp.fetch(url, data);
        }

        /**
         * @see https://core.telegram.org/bots/api#deletewebhook
         **/
        deleteWebhook(drop_pending_updates = false) {
            const url = this.getApiBaseUrl() + "/deleteWebhook";
            const data = {
                'method': "post",
                'payload': {
                    'drop_pending_updates': drop_pending_updates
                }
            };
            return UrlFetchApp.fetch(url, data);
        }

        getChat(chat_id) {
            const url = `${this.getApiBaseUrl()}/getChat?chat_id=${chat_id}`;
            return UrlFetchApp.fetch(url);
        }

        /**
         * @see https://core.telegram.org/bots/api#getbusinessconnection
         **/
        getBusinessConnection(business_connection_id) {
            const url = `${this.getApiBaseUrl()}/getBusinessConnection?business_connection_id=${business_connection_id}`;
            return UrlFetchApp.fetch(url);
        }

        /**
         * Executes a custom API request to the Telegram Bot API.
         * @param {string} uriAction - The API method to call.
         * @param {Object} [payload] - The payload for the API request.
         * @returns {HTTPResponse} The response from the API.
         **/
        executeApiRequest(uriAction, payload) {
            const url = this.getApiBaseUrl() + '/' + uriAction;

            // If no payload, do a simple GET request
            if (!payload) {
                return this.fetchApi(url);
            }

            // Otherwise, do a POST request with JSON payload
            const options = {
                'method': 'post',
                'contentType': 'application/json',
                'payload': JSON.stringify(payload)
            };

            return this.fetchApi(url, options);
        }

        fetchApi(url, options) {
            if (!options) {
                return UrlFetchApp.fetch(url);
            }
            return UrlFetchApp.fetch(url, options);
        }
    },
    TelegramBotSettings: {
        getScriptApiKey() {
            return PropertiesService.getScriptProperties().getProperty(Common.INPUT.TELEGRAM_BOT.BOT_API_TOKEN);
        },
        setUserApiKey(apiKey) {
            PropertiesService.getDocumentProperties().setProperty(Common.INPUT.TELEGRAM_BOT.BOT_API_TOKEN, apiKey);
        },
        getUserApiKey() {
            return PropertiesService.getDocumentProperties().getProperty(Common.INPUT.TELEGRAM_BOT.BOT_API_TOKEN);
        },
        clearUserApiKey() {
            PropertiesService.getDocumentProperties().deleteProperty(Common.INPUT.TELEGRAM_BOT.BOT_API_TOKEN);
        }
    },
    GeminiApiClient: {
        version: '1.0.0',
        get API_ENDPOINT_URL() {
            return 'https://generativelanguage.googleapis.com/v1beta/models/';
        },
        /**
         * Generates content using the Gemini API.
         * @param {string} apiKey - The API key for authentication.
         * @param {string} model - The model name to use for content generation.
         * @param {{}} payload - The payload to send in the request.
         * @returns {{}} - The response content from the Gemini API.
         * @throws {Error} - If the API request fails.
         */
        generateContent(apiKey, model, payload) {
            const url = `${this.API_ENDPOINT_URL}${model}:generateContent`;
            const options = {
                method: 'POST',
                contentType: 'application/json',
                headers: {
                    'x-goog-api-key': apiKey,
                },
                payload: JSON.stringify(payload)
            };

            let response;
            try {
                response = UrlFetchApp.fetch(url, options);
                // Log the full response for debugging purposes

                if (response && response.getResponseCode() === 200) {
                    const responseData = JSON.parse(response.getContentText());
                    Common.Modules.Sheet.writeGeminiResponse(SpreadsheetApp.getActiveSpreadsheet(), options, model, payload, responseData);
                    return responseData;
                } else if (response) {
                    throw new Error(`GeminiApiClient request failed with status ${response.getResponseCode()}: ${response.getContentText()}`);
                } else {
                    throw new Error('GeminiApiClient request failed with no response');
                }
            } catch (error) {
                // Log the error for debugging purposes
                Common.Modules.Sheet.writeGeminiResponse(
                    SpreadsheetApp.getActiveSpreadsheet(),
                    { url, options },
                    model,
                    payload,
                    { error: error.message }
                );
                throw error;
            }


        }
    },
    GeminiAgent: {
        version: '1.0.0',
        get MODELS() {
            return {
                'gemini-3-flash-preview': 'gemini-3-flash-preview',
                'gemini-2.5-pro': 'gemini-2.5-pro'
            };
        },
        get DEFAULT_MODEL() {
            return this.MODELS["gemini-3-flash-preview"];
        },
        get THINKING_LEVEL_OPTIONS() {
            return ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH'];
        },
        get MOOD_OPTIONS() {
            return ['Helpful and concise', 'Professional and detailed', 'Creative and imaginative', 'Friendly and casual', 'Formal and respectful', 'Enthusiastic and energetic', 'Calm and reassuring', 'Neutral'];
        },
        getScriptApiKey() {
            return PropertiesService.getScriptProperties()
                .getProperty(Common.INPUT.GEMINI.GEMINI_API_KEY);
        },
        getScriptModel() {
            return PropertiesService.getScriptProperties().getProperty(Common.INPUT.GEMINI.GEMINI_MODEL) || this.DEFAULT_MODEL;
        },
        saveApiKey(apiKey) {
            PropertiesService.getDocumentProperties()
                .setProperty(Common.INPUT.GEMINI.GEMINI_API_KEY, apiKey);
        },
        getApiKey() {
            return PropertiesService.getDocumentProperties()
                .getProperty(Common.INPUT.GEMINI.GEMINI_API_KEY);
        },
        clearApiKey() {
            PropertiesService.getDocumentProperties()
                .deleteProperty(Common.INPUT.GEMINI.GEMINI_API_KEY);
        },
        saveModel(model) {
            PropertiesService.getDocumentProperties().setProperty(Common.INPUT.GEMINI.GEMINI_MODEL, model);
        },
        getModel() {
            return PropertiesService.getDocumentProperties().getProperty(Common.INPUT.GEMINI.GEMINI_MODEL) || this.DEFAULT_MODEL;
        },
        clearModel() {
            PropertiesService.getDocumentProperties().deleteProperty(Common.INPUT.GEMINI.GEMINI_MODEL);
        },
        _fromRow(row = []) {
            // Convert row array into instruction object based on column order
            return {
                name: row?.[0] || 'New Agent',
                model: row?.[1] || this.DEFAULT_MODEL,
                prompt: row?.[2] || ''
            };

        },
        _toRow(agent_meta = {}) {
            // Convert instruction object into row array based on column order
            return [
                agent_meta.name || 'New Agent',
                agent_meta.model || this.DEFAULT_MODEL,
                agent_meta.prompt || ''
            ];
        },
    },
    CRM: {
        version: '1.0.1',
        // Inner Customer class
        Customer: {
            get COLUMNS() {
                return {
                    created_on: 'Created on',
                    chat_id: 'Chat ID',
                    username: 'Username',
                    first_name: 'First Name',
                    last_name: 'Last Name',
                    language_code: 'Language Code',
                    is_bot: 'Is Bot',
                    data: 'Data'
                };
            },
            get CUSTOMERS_SHEET_META() {
                return {
                    name: '👥  Members',
                    columns: Object.values(this.COLUMNS)
                };
            },
            verifyTelegramUser(activeSpreadsheet, message) {
                const chatId = message.from.id;
                const existingCustomer = this.getCustomerByChatId(activeSpreadsheet, chatId);
                if (existingCustomer) {
                    // Customer already exists, no need to update
                    return existingCustomer;
                }

                const customer = {
                    chat_id: message.from.id,
                    username: message.from.username || '',
                    first_name: message.from.first_name,
                    last_name: message.from.last_name || '',
                    language_code: message.from.language_code || '',
                    is_bot: message.from.is_bot || false,
                    message: JSON.stringify(message)
                }

                return this.addNewCustomer(activeSpreadsheet, customer);
            },
            getCustomerByChatId(activeSpreadsheet, chat_id) {
                const sheet = Common.Modules.Sheet.getSheet(activeSpreadsheet, this.CUSTOMERS_SHEET_META);
                const range = sheet.getRange('B:B');
                const textFinder = range.createTextFinder(chat_id);
                const firstOccurrence = textFinder.findNext();
                if (firstOccurrence) {
                    const values = firstOccurrence.getValues();
                    return this._fromRow(values[values.length - 1]);
                }
                return null;
            },
            addNewCustomer(activeSpreadsheet, customer = {}) {
                const sheet = Common.Modules.Sheet.getSheet(activeSpreadsheet, this.CUSTOMERS_SHEET_META);

                // add createdOn in the first column as ISO string
                const newRow = this._toRow(customer);
                sheet.appendRow(newRow);
                return newRow;
            },
            _fromRow(row = []) {
                return {
                    created_on: row?.[0] || '',
                    chat_id: row?.[1] || '',
                    username: row?.[2] || '',
                    first_name: row?.[3] || '',
                    last_name: row?.[4] || '',
                    language_code: row?.[5] || '',
                    is_bot: row?.[6] || false,
                    data: row?.[7] || ''
                };
            },
            _toRow(customer = {}) {
                return [
                    new Date().toISOString(),
                    customer.chat_id || '',
                    customer.username || '',
                    customer.first_name || '',
                    customer.last_name || '',
                    customer.language_code || '',
                    customer.is_bot || false,
                    JSON.stringify(customer)
                ];
            }
        },
        // Product class.
        Product: {
            get PRODUCTS_SHEET_META() {
                return {
                    name: '🛒  Products',
                    columns: ['sn', 'category', 'subcategory', 'name', 'description', 'tags', 'price', 'unit', 'image', 'rating', 'Data']
                };
            },
            addProduct(activeSpreadsheet, product = {}) {
                const sheet = Common.Modules.Sheet.getSheet(activeSpreadsheet, this.PRODUCTS_SHEET_META);

                // add product as a new row
                const newRow = this._toRow(product);
                sheet.appendRow(this._toRow(product));
                return newRow;
            },
            getProductBySN(activeSpreadsheet, sn) {
                const sheet = Common.Modules.Sheet.getSheet(activeSpreadsheet, this.PRODUCTS_SHEET_META);

                // Search for the product by SN in the first column
                const range = sheet.getRange('A:A');
                const textFinder = range.createTextFinder(sn);
                const firstOccurrence = textFinder.findNext();
                if (firstOccurrence) {
                    const values = firstOccurrence.getValues();
                    return this._fromRow(values[0]);
                }
                return null;
            },
            listProducts(activeSpreadsheet, category = '', subcategory = '', limit = 100, offset = 0) {
                const sheet = Common.Modules.Sheet.getSheet(activeSpreadsheet, this.PRODUCTS_SHEET_META);
                const range = sheet.getDataRange();
                const values = range.getValues() || [];
                const products = [];

                // Assuming the first row is headers, we start from index 1
                for (let i = offset + 1; (i < values.length || i < offset + limit); i++) {
                    const row = values[i];

                    const product = this._fromRow(row);
                    if (product && (category === '' || product.category === category) &&
                        (subcategory === '' || product.subcategory === subcategory)) {
                        products.push(product);
                    }
                }

                return products;
            },
            listCategories(activeSpreadsheet) {
                const sheet = Common.Modules.Sheet.getSheet(activeSpreadsheet, this.PRODUCTS_SHEET_META);
                const range = sheet.getDataRange();
                const values = range.getValues() || [];
                const categories = new Set();

                // Assuming the first row is headers, we start from index 1
                for (let i = 1; i < values.length; i++) {
                    const category = values[i][1];
                    if (category) {
                        categories.add(category);
                    }
                }
                return Array.from(categories);
            },
            _fromRow(row = []) {
                if (!row || row.length < 4) {
                    return null;
                }
                return {
                    sn: row[0],
                    category: row[1],
                    subcategory: row[2],
                    name: row[3],
                    description: row?.[4] || '',
                    tags: row?.[5] ? row[5].split(',').map(tag => tag.trim()) : [],
                    price: row?.[6] || 0.0,
                    unit: row?.[7] || '',
                    image: row?.[8] || '',
                    rating: row?.[9] || 0.0,
                    data: row?.[10] ? JSON.parse(row[10]) : {}
                };
            },
            _toRow(product = {}) {
                return [
                    product.sn || '',
                    product.category || '',
                    product.subcategory || '',
                    product.name || '',
                    product.description || '',
                    product.tags ? product.tags.join(',') : '',
                    product.price || 0.0,
                    product.unit || '',
                    product.image || '',
                    product.rating || 0.0,
                    JSON.stringify(product)
                ];
            }
        },
        Membership: {
            get DEFAULT_LICENSE_KEY() {
                return "TRIAL";
            },
            get DEFAULT_TRIAL_DAYS() {
                return 90;
            },
            get DEFAULT_TRIAL_BALANCE() {
                return 5000;
            },
            activate(days = this.DEFAULT_TRIAL_DAYS, balance = this.DEFAULT_TRIAL_BALANCE, licenseKey = this.DEFAULT_LICENSE_KEY) {
                // Create membership info with specified parameters
                const membershipInfo = this.createMembershipInfo(days, balance, licenseKey);
                // Save membership info to user properties
                this.setMembershipInfo(membershipInfo);
                return membershipInfo;
            },
            revoke() {
                // Simulate revocation logic
                PropertiesService.getUserProperties().deleteProperty(Common.INPUT.SYSTEM.MEMBERSHIP.MEMBERSHIP_KEY);
                return true;
            },
            createMembershipInfo(days = this.DEFAULT_TRIAL_DAYS, balance = this.DEFAULT_TRIAL_BALANCE, licenseKey = this.DEFAULT_LICENSE_KEY) {
                const membership = {
                    [Common.INPUT.SYSTEM.MEMBERSHIP.CREATED_ON]: new Date().toISOString(),
                    [Common.INPUT.SYSTEM.MEMBERSHIP.LICENSE_KEY]: licenseKey,
                    // Add the specified number of days to the current date
                    [Common.INPUT.SYSTEM.MEMBERSHIP.EXPIRES_AT]: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
                    [Common.INPUT.SYSTEM.MEMBERSHIP.BALANCE]: balance,
                    type: licenseKey === this.DEFAULT_LICENSE_KEY ? 'trial' : 'paid'
                }
                return membership;
            },
            getMembershipInfo() {
                const membershipData = PropertiesService.getUserProperties().getProperty(Common.INPUT.SYSTEM.MEMBERSHIP.MEMBERSHIP_KEY);
                if (!membershipData) {
                    return null;
                }

                try {
                    const {
                        [Common.INPUT.SYSTEM.MEMBERSHIP.LICENSE_KEY]: licenseKey,
                        type,
                        [Common.INPUT.SYSTEM.MEMBERSHIP.CREATED_ON]: createdOn,
                        [Common.INPUT.SYSTEM.MEMBERSHIP.EXPIRES_AT]: expiresAt,
                        [Common.INPUT.SYSTEM.MEMBERSHIP.BALANCE]: balance = 0
                    } = JSON.parse(membershipData);
                    return {
                        [Common.INPUT.SYSTEM.MEMBERSHIP.LICENSE_KEY]: licenseKey,
                        type,
                        [Common.INPUT.SYSTEM.MEMBERSHIP.CREATED_ON]: createdOn,
                        [Common.INPUT.SYSTEM.MEMBERSHIP.EXPIRES_AT]: expiresAt,
                        [Common.INPUT.SYSTEM.MEMBERSHIP.BALANCE]: balance
                    };
                } catch (error) {
                    console.error('Error parsing membership info:', error);
                    return null;
                }
            },
            setMembershipInfo(membershipInfo = {}) {
                PropertiesService.getUserProperties().setProperty(Common.INPUT.SYSTEM.MEMBERSHIP.MEMBERSHIP_KEY, JSON.stringify(membershipInfo));
                return membershipInfo;
            }
        }
    }
};

Addon.Media = {
    DEFAULT_IMAGE_URL: 'https://raw.githubusercontent.com/ilanlal/gas-addon-ai-template/refs/heads/main/assets/icons/256x256-transparent.ico',
    WELCOME_IMG_URL: 'https://raw.githubusercontent.com/ilanlal/gas-addon-ai-template/refs/heads/main/assets/icons/256x256-transparent.ico',
    YOU_GOT_IT_IMG_URL: 'https://raw.githubusercontent.com/ilanlal/gas-addon-ai-template/refs/heads/main/assets/bitmoji-you-got-it.webp',
    BIG_TIME_IMG_URL: 'https://raw.githubusercontent.com/ilanlal/gas-addon-ai-template/refs/heads/main/assets/bitmoji-big-time.webp',
    YES_IMG_URL: 'https://raw.githubusercontent.com/ilanlal/gas-addon-ai-template/refs/heads/main/assets/bitmoji-yes.webp',
    PAY_ATTENTION_IMG_URL: 'https://raw.githubusercontent.com/ilanlal/gas-addon-ai-template/refs/heads/main/assets/bitmoji-pay-attention.webp',
    LOGO_PNG_URL: 'https://raw.githubusercontent.com/ilanlal/gas-addon-ai-template/refs/heads/main/assets/icons/256x256-transparent.ico'
};

Addon.Package = {
    name: 'AI Studio',
    short_description: 'AI tools for Google Workspace',
    description: 'A collection of AI-powered tools to enhance your productivity in Google Workspace applications.',
    version: '1.0.0',
    build: '20260214.125400',
    author: 'Ilan Laloum',
    license: 'MIT',
    imageUrl: Addon.Media.LOGO_PNG_URL,
    gitRepository: 'https://github.com/ilanlal/gas-addon-ai-template'
};

Addon.PROPERTIES = {
    get responseMimeType_selector() {
        return 'responseMimeType_selector';
    },
    get topP_text_input() {
        return 'top_p_text_input';
    },
    get topK_text_input() {
        return 'top_k_text_input';
    },
    get temperature_text_input() {
        return 'temperature_text_input';
    },
    get indentation_spaces() {
        return 'indentation_spaces';
    },
    get show_errors_switch() {
        return 'show_errors_switch';
    },
    get highlight_color() {
        return 'highlight_color';
    },
    get terminal_output_switch() {
        return 'terminal_output_switch';
    },
    get focus_terminal_output() {
        return 'focus_terminal_output';
    },
    get ignore_whitespace_switch() {
        return 'ignore_whitespace_switch';
    },
    get prompt_text_input() {
        return 'prompt_text_input';
    },
    get gemini_api_key() {
        return 'GEMINI_API_KEY';
    },
    get gemini_model_selector() {
        return 'GEMINI_MODEL_SELECTOR';
    }
};

Addon.Home = {
    id: 'HomeAddon',
    name: 'AI Studio',
    short_description: 'AI tools for Google Workspace',
    description: 'A collection of AI-powered tools to enhance your productivity in Google Workspace applications.',
    version: '1.0.0',
    Controller: {
        Load: (e) => {
            // Build and return the Home Card
            const appModelData = Addon.getData();

            // Build and return the Home Card
            const homeCard = Addon.Home.View.HomeCard({ ...appModelData });

            let cardNavigation = null;
            if (e.parameters && e.parameters.refresh === 'true') {
                cardNavigation = CardService.newNavigation()
                    .updateCard(homeCard);
            } else {
                cardNavigation = CardService.newNavigation()
                    .pushCard(homeCard);
            }

            // Return action response to update card
            return CardService.newActionResponseBuilder()
                .setNavigation(cardNavigation)
                .build();
        },
        About: (e) => {
            // Build and return the About Card
            const appModelData = Addon.getData();
            return CardService.newActionResponseBuilder()
                .setNavigation(
                    CardService.newNavigation()
                        .pushCard(Addon.Home.View.AboutCard({ ...appModelData }))
                ).build();
        },
        Help: (e) => {
            // Build and return the Help Card
            const appModelData = Addon.getData();
            return CardService.newActionResponseBuilder()
                .setNavigation(
                    CardService.newNavigation()
                        .pushCard(Addon.Home.View.HelpCard({ ...appModelData }))
                ).build();
        },
        _HandleResultNavigation: (e, result) => {
            const formInputs = e?.commonEventObject?.formInputs || {};
            const showErrorsState = formInputs?.[Common.INPUT.SYSTEM.DISPLAY_ERROR_CARD]?.stringInputs?.value[0] || "OFF";
            if (result.report.length > 0) {
                if (showErrorsState === 'ON') {
                    // Build and return the result card
                    return CardService.newActionResponseBuilder()
                        .setNavigation(
                            CardService.newNavigation()
                                .pushCard(
                                    Addon.ResultWidget.View
                                        .BuildResultCard(result))
                        ).build();
                }
                else {
                    return CardService.newActionResponseBuilder()
                        .setNotification(
                            CardService.newNotification()
                                .setText('⚠️ Completed with ' + result.report.length + ' error(s). \n\nEnable "Show Errors" in Advanced Settings to view details.'))
                        .build();
                }
            }

            // show notification if no errors or if show errors is off
            return CardService.newActionResponseBuilder()
                .setNotification(
                    CardService.newNotification()
                        .setText('✅ All JSON entries are valid!'))
                .build();
        }
    },
    View: {
        HomeCard: (data = {}) => {
            const cardBuilder = CardService.newCardBuilder()
                .setName(Addon.Home.id + '-Home')
                .setHeader(CardService.newCardHeader()
                    .setTitle(Addon.Package.name)
                    .setSubtitle(Addon.Package.short_description)
                    .setImageStyle(CardService.ImageStyle.SQUARE)
                    .setImageUrl(Addon.Package.imageUrl)
                    .setImageAltText('AI Studio Logo'));


            cardBuilder.addSection(CardService.newCardSection()
                .addWidget(
                    CardService.newTextParagraph()
                        .setText(`Welcome to ${Addon.Package.name}! This add-on provides a collection of AI-powered tools to enhance your productivity in Google Workspace applications. Use the tools below to get started with editing and managing your JSON data efficiently.`)));

            // Plugin Hub Section
            cardBuilder.addSection(Addon.Home.View._BuildPluginHubSection(data));

            // Advanced Sections
            cardBuilder.addSection(Addon.Home.View._BuildAdvancedSettingsSection(data));

            // Quick Access Section
            cardBuilder.addSection(Addon.Home.View._BuildQuickAccessSection(data));

            // Premium Membership Section
            if (!data.isPremium) {
                cardBuilder.addSection(Addon.Home.View._BuildPremiumMembershipSection(data));
                cardBuilder.setFixedFooter(CardService.newFixedFooter()
                    .setPrimaryButton(CardService.newTextButton()
                        .setText('💎 Upgrade to Premium')
                        .setBackgroundColor(Addon.primaryColor())
                        .setOnClickAction(CardService.newAction()
                            .setFunctionName('Addon.UserProfile.Controller.PushHomeCard'))));
            }

            return cardBuilder.build();
        },
        AboutCard: (data = {}) => {
            const cardBuilder = CardService.newCardBuilder()
                .setName(Addon.Home.id + '-About')
                .setHeader(CardService.newCardHeader()
                    .setTitle('About ' + Addon.Package.name)
                    .setSubtitle(Addon.Package.short_description)
                    .setImageStyle(CardService.ImageStyle.SQUARE)
                    .setImageUrl(Addon.Media.BIG_TIME_IMG_URL)
                    .setImageAltText('Card Image'))
                .addSection(
                    CardService.newCardSection()
                        .setHeader('App Information')
                        .addWidget(
                            CardService.newTextParagraph()
                                .setText(`Name: ${Addon.Package.name}`))
                        .addWidget(
                            CardService.newTextParagraph()
                                .setText(`Version: ${Addon.Package.version}`))
                        .addWidget(
                            CardService.newTextParagraph()
                                .setText(`Build: ${Addon.Package.build}`))
                        .addWidget(
                            CardService.newTextParagraph()
                                .setText(`Description: ${Addon.Package.description}`))
                        .addWidget(
                            CardService.newTextParagraph()
                                .setText(`Developed by Easy ADM (https://easyadm.com).`)));

            // Add useful links section
            cardBuilder.addSection(
                CardService.newCardSection()
                    .setHeader('🔗 Useful Links')
                    .addWidget(
                        CardService.newTextButton()
                            .setText('📄 Documentation')
                            .setOpenLink(
                                CardService.newOpenLink()
                                    .setUrl(`${Addon.Package.gitRepository}#readme`)))
                    .addWidget(
                        CardService.newTextButton()
                            .setText('📢 Report Issues')
                            .setOpenLink(
                                CardService.newOpenLink()
                                    .setUrl(`${Addon.Package.gitRepository}/issues`))));

            return cardBuilder.build();
        },
        HelpCard: (data = {}) => {
            const cardBuilder = CardService.newCardBuilder()
                .setName(Addon.Home.id + '-Help')
                .setHeader(CardService.newCardHeader()
                    .setTitle('Help & Support')
                    .setSubtitle(Addon.Home.short_description)
                    .setImageStyle(CardService.ImageStyle.SQUARE)
                    .setImageUrl(Addon.Media.YES_IMG_URL)
                    .setImageAltText('Help Image'));

            // 1. Getting Started Guide Section
            cardBuilder.addSection(CardService.newCardSection()
                .setHeader('🚀 Getting Started')
                .addWidget(CardService.newTextParagraph()
                    .setText('To start editing JSON, follow these simple steps:'))
                .addWidget(CardService.newDecoratedText()
                    .setTopLabel('Step 1')
                    .setText('Open the Json Editor tool.')
                    .setWrapText(true))
                .addWidget(CardService.newDecoratedText()
                    .setTopLabel('Step 2')
                    .setText('Paste or input your JSON data.')
                    .setWrapText(true))
                .addWidget(CardService.newDecoratedText()
                    .setTopLabel('Step 3')
                    .setText('Use the tools to beautify, validate, or export.')
                    .setWrapText(true)));

            // 2. Common Issues / FAQ Section
            cardBuilder.addSection(CardService.newCardSection()
                .setHeader('💡 Quick Troubleshooting')
                .setCollapsible(true)
                .setNumUncollapsibleWidgets(1)
                .addWidget(CardService.newDecoratedText()
                    .setTopLabel('Invalid JSON?')
                    .setText('Ensure your JSON is properly formatted.')
                    .setWrapText(true))
                .addWidget(CardService.newDecoratedText()
                    .setTopLabel('Large files?')
                    .setText('Consider splitting large JSON into smaller parts.')
                    .setWrapText(true)));

            // 3. Useful Links & Support Section
            cardBuilder.addSection(CardService.newCardSection()
                .setHeader('🔗 Resources')
                .addWidget(CardService.newTextButton()
                    .setText('📄 Read Documentation')
                    .setOpenLink(CardService.newOpenLink()
                        .setUrl(`${Addon.Package.gitRepository}#readme`)))
                .addWidget(CardService.newTextButton()
                    .setText('📢 Report a Bug')
                    .setOpenLink(CardService.newOpenLink()
                        .setUrl(`${Addon.Package.gitRepository}/issues`))));
            return cardBuilder.build();
        },
        _BuildPluginHubSection: (data = {}) => {
            const listOfTools = [
                { name: 'Text', emoji: '✍️', description: 'Generate text based on prompts using AI.', icon: 'text_fields', action: 'Addon.GeminiAgent.Controller.GenerateTextFromSelection' },
                { name: 'Video', emoji: '🎬', description: 'Create videos from text prompts using AI.', icon: 'videocam', action: 'Addon.GeminiAgent.Controller.GenerateVideoFromSelection' },
                { name: 'Data Analysis', emoji: '📊', description: 'Analyze and visualize data with AI insights.', icon: 'analytics', action: 'Addon.GeminiAgent.Controller.GenerateAnalyzeFromSelection' },
                { name: 'Trend Prediction', emoji: '📈', description: 'Predict trends and outcomes using AI models.', icon: 'trending_up', action: 'Addon.GeminiAgent.Controller.GeneratePredictTrendsFromSelection' },
                { name: 'Code Generation', emoji: '🧑‍💻', description: 'Generate code snippets based on descriptions using AI.', icon: 'code', action: 'Addon.GeminiAgent.Controller.GenerateCodeFromSelection' },
                { name: 'Content Summarization', emoji: '∑', description: 'Summarize long content into concise summaries using AI.', icon: 'summarize', action: 'Addon.GeminiAgent.Controller.GenerateSummarizeFromSelection' },
            ];
            const pluginHub = CardService.newCardSection()
                .setHeader('🛠️ Available Tools')
                .setCollapsible(false);

            // Add divider
            pluginHub.addWidget(CardService.newDivider());

            // Add each tool as a decorated text with an action button
            listOfTools.forEach(tool => {
                const decoratedText = CardService.newDecoratedText()
                    .setText(`${tool.emoji} ${tool.name}`)
                    .setBottomLabel(tool.description)
                    .setWrapText(true)
                    .setButton(
                        CardService.newTextButton()
                            .setText(tool.name)
                            .setAltText(`${tool.name} JSON within selected cells`)
                            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
                            .setMaterialIcon(
                                CardService.newMaterialIcon()
                                    .setName(tool.icon)
                                    .setFill(false)
                            )
                            .setOnClickAction(
                                CardService.newAction()
                                    .setFunctionName(`${tool.action}`)
                            )
                    );

                pluginHub.addWidget(decoratedText);
            });

            // Return the completed plugin hub section
            return pluginHub;
        },
        _BuildQuickAccessSection: (data = {}) => {
            return CardService.newCardSection()
                .setHeader('⚙️ Quick Access')
                .setCollapsible(true)
                // add divider
                .addWidget(CardService.newDivider())
                .addWidget(CardService.newButtonSet()
                    .addButton(CardService.newTextButton()
                        .setText('Settings')
                        .setOnClickAction(CardService.newAction()
                            .setFunctionName('Addon.Settings.Controller.Load')))
                    .addButton(CardService.newTextButton()
                        .setText('Help & Support')
                        .setOnClickAction(CardService.newAction()
                            .setFunctionName('Addon.Home.Controller.Help')))
                    .addButton(CardService.newTextButton()
                        .setText('About')
                        .setOnClickAction(CardService.newAction()
                            .setFunctionName('Addon.Home.Controller.About')))
                );
        },
        _BuildAdvancedSettingsSection: (data = {}) => {
            const advancedSection = CardService.newCardSection()
                .setHeader('🔧 Advanced Settings')
                .setCollapsible(true)
                .setNumUncollapsibleWidgets(0);

            // Add a divider
            advancedSection.addWidget(CardService.newDivider());
            // add short info about indentation spaces
            advancedSection.addWidget(CardService.newTextParagraph()
                .setText('Select the number of spaces to use for JSON indentation when beautifying.'));

            // Create a selection input for indentation levels
            const indentationLevelSelector =
                CardService.newSelectionInput()
                    .setType(CardService.SelectionInputType.DROPDOWN)
                    // Enable for premium users
                    .setTitle('Code Indentation Spaces')
                    .setFieldName(Addon.PROPERTIES.indentation_spaces)
                    .addItem('1 {.}', '1', data.indentation_spaces === 1)
                    .addItem('2 {..} (default)', '2', data.indentation_spaces === 2) // Default selected
                    .addItem('4 {....}', '4', data.indentation_spaces === 4)
                    .addItem('6 {......}', '6', data.indentation_spaces === 6)
                    .addItem('8 {........}', '8', data.indentation_spaces === 8);

            // Add the selection input to the card section
            advancedSection.addWidget(indentationLevelSelector);

            // add divider
            advancedSection.addWidget(CardService.newDivider());

            // Create a decorated text with a switch for "Show Errors After Validation"
            const showErrorsDecoratedText = CardService.newDecoratedText()
                .setTopLabel('Show Errors After Validation')
                .setBottomLabel('Toggle to display detailed error reports after action.')
                .setWrapText(true)
                .setStartIcon(
                    CardService.newIconImage().setMaterialIcon(
                        CardService.newMaterialIcon()
                            .setName('error_outline')
                    )
                )
                .setSwitchControl(
                    CardService.newSwitch()
                        .setFieldName(Addon.PROPERTIES.show_errors_switch)
                        .setValue('ON')
                        .setSelected(data.show_errors_switch === 'ON')
                        .setControlType(CardService.SwitchControlType.CHECK_BOX)
                );

            advancedSection.addWidget(showErrorsDecoratedText);
            return advancedSection;
        },
        _BuildPremiumMembershipSection: (data = {}) => {
            const membershipSection = CardService.newCardSection()
                .setHeader('💎 Premium Membership')
                .setCollapsible(false)
                .addWidget(CardService.newDecoratedText()
                    .setTopLabel('Membership Status')
                    .setText(data.isPremium ? 'Premium Member' : 'Free Member')
                    .setStartIcon(CardService.newIconImage().setMaterialIcon(
                        CardService.newMaterialIcon().setName('workspace_premium')))
                    .setBottomLabel(data.isPremium
                        ? `Expires on: ${data.expiresAt ? data.expiresAt.toDateString() : 'N/A'} | Balance: $${data.balance.toFixed(2)}`
                        : 'Upgrade to unlock advanced AI tools.'));
            return membershipSection;
        }
    }
};

Addon.Settings = {
    id: 'SettingsPlugin',
    name: 'Settings',
    short_description: 'Manage bot settings and preferences',
    description: 'The Settings card allows you to manage and configure settings for your Telegram bot add-on. You can adjust preferences, set up integrations, and customize the behavior of your bot to suit your needs.',
    version: '2.0.0',
    imageUrl: Addon.Media.WELCOME_IMG_URL,
    Controller: {
        PushHomeCard: (e) => {
            // Build and return the Settings Home Card
            const appModelData = Addon.getData();
            return CardService.newActionResponseBuilder()
                .setNavigation(
                    CardService.newNavigation()
                        .pushCard(Addon.Settings.View.HomeCard({ ...appModelData }))
                ).build();
        },
        SaveSettings: (e) => {
            // extract and save API endpoint URL
            const apiEndpointUrl = e?.commonEventObject?.formInputs?.[Common.INPUT.TELEGRAM_BOT.BOT_API_ENDPOINT_URL]?.stringInputs?.value?.[0] || '';
            if (apiEndpointUrl) {
                PropertiesService.getDocumentProperties().setProperty(Common.INPUT.TELEGRAM_BOT.BOT_API_ENDPOINT_URL, apiEndpointUrl);
            }
            // extract and save secret private key
            const secretPrivateKey = e?.commonEventObject?.formInputs?.[Common.INPUT.TELEGRAM_BOT.BOT_SECRET_TOKEN]?.stringInputs?.value?.[0] || '';
            if (secretPrivateKey) {
                PropertiesService.getDocumentProperties().setProperty(Common.INPUT.TELEGRAM_BOT.BOT_SECRET_TOKEN, secretPrivateKey);
            }

            // Common.INPUT.SYSTEM.ENABLE_TERMINAL_OUTPUT
            const terminalOutputSwitch = e?.commonEventObject?.formInputs?.[Common.INPUT.SYSTEM.ENABLE_TERMINAL_OUTPUT]?.stringInputs?.value?.[0] || 'ON';
            PropertiesService.getDocumentProperties().setProperty(Common.INPUT.SYSTEM.ENABLE_TERMINAL_OUTPUT, terminalOutputSwitch === 'ON' ? 'ON' : 'OFF');

            // Common.INPUT.SYSTEM.ENABLE_EVENT_LOGGING
            const enableEventLogging = e?.commonEventObject?.formInputs?.[Common.INPUT.SYSTEM.ENABLE_EVENT_LOGGING]?.stringInputs?.value?.[0] || 'OFF';
            PropertiesService.getDocumentProperties().setProperty(Common.INPUT.SYSTEM.ENABLE_EVENT_LOGGING, enableEventLogging === 'ON' ? 'ON' : 'OFF');


            // Display error card after json error
            const showErrorsSwitch = e?.commonEventObject?.formInputs?.[Common.INPUT.SYSTEM.DISPLAY_ERROR_CARD]?.stringInputs?.value?.[0] || 'ON';
            PropertiesService.getDocumentProperties().setProperty(Common.INPUT.SYSTEM.DISPLAY_ERROR_CARD, showErrorsSwitch === 'ON' ? 'ON' : 'OFF');

            // gemini_api_key
            const geminiApiKey = e?.commonEventObject?.formInputs?.[Common.INPUT.GEMINI.GEMINI_API_KEY]?.stringInputs?.value?.[0] || '[YOUR GEMINI API KEY]';
            PropertiesService.getDocumentProperties().setProperty(Common.INPUT.GEMINI.GEMINI_API_KEY, geminiApiKey);

            // gemini_model_selector
            const geminiModel = e?.commonEventObject?.formInputs?.[Common.INPUT.GEMINI.GEMINI_MODEL]?.stringInputs?.value?.[0] || 'gemini-3-flash-preview';
            PropertiesService.getDocumentProperties().setProperty(Common.INPUT.GEMINI.GEMINI_MODEL, geminiModel);

            // Build and return the Home Card
            const appModelData = Addon.getData();
            return CardService.newActionResponseBuilder()
                .setNavigation(
                    CardService.newNavigation()
                        .popToRoot()
                        .updateCard(Addon.Home.View.HomeCard({ ...appModelData }))
                ).build();
        },
        ToggleAction(e) {
            try {
                const actionName = e?.commonEventObject?.parameters?.actionName;
                // actionName like: 'debug_mode_switch' or 'form_input_switch_key'
                const preState = e?.commonEventObject?.formInputs?.[actionName]?.stringInputs?.value?.[0];
                // store the new state within user properties or perform necessary actions
                PropertiesService.getDocumentProperties().setProperty(actionName, preState === 'ON' ? 'ON' : 'OFF');
                // return success notification
                return CardService.newActionResponseBuilder()
                    .setNotification(
                        CardService.newNotification()
                            .setText(`${actionName} set to ${preState}`))
                    .build();
            } catch (error) {

                return CardService.newActionResponseBuilder()
                    .setNotification(
                        CardService.newNotification()
                            .setText(
                                error.toString()))
                    .build();
            }
        }
    },
    View: {
        HomeCard: (data = {}) => {
            const cardBuilder = CardService.newCardBuilder()
                .setName(Addon.Settings.name + '-Home')
                .setHeader(CardService.newCardHeader()
                    .setTitle(Addon.Settings.name)
                    .setSubtitle(Addon.Settings.short_description)
                    .setImageStyle(CardService.ImageStyle.SQUARE)
                    .setImageUrl(Addon.Settings.imageUrl)
                    .setImageAltText('Settings Logo'));

            // Network & Security Section (Compact Grouping)
            // Groups the API URL and Secret Key together as they are both core config items
            const configSection = CardService.newCardSection()
                .setHeader('🌐 Network & Security')
                .setCollapsible(false);

            // API Endpoint Input
            configSection.addWidget(
                CardService.newTextInput()
                    .setFieldName(Common.INPUT.TELEGRAM_BOT.BOT_API_ENDPOINT_URL)
                    .setTitle('API Endpoint URL')
                    .setValue(data[Common.INPUT.TELEGRAM_BOT.BOT_API_ENDPOINT_URL] || '')
                    .setHint('Default: https://api.telegram.org/')
                    .setMultiline(false)
            );

            cardBuilder.addSection(configSection);

            // Developer Tools Section
            // Isolated section for toggles and switches
            const devSection = CardService.newCardSection()
                .setHeader('🛠️ Developer Tools');

            // Gemini API Key Input
            devSection.addWidget(
                CardService.newTextInput()
                    .setFieldName(Common.INPUT.GEMINI.GEMINI_API_KEY)
                    .setTitle('Gemini API Key')
                    .setValue(data.gemini_api_key || '')
                    .setHint('Enter your Gemini API key')
                    .setMultiline(false)
            );

            // Gemini Model Selector
            // Add a dropdown to select the Gemini model
            const geminiModelSelector =
                CardService.newSelectionInput()
                    .setType(CardService.SelectionInputType.DROPDOWN)
                    // Enable for premium users
                    .setTitle('🤖 Gemini Model')
                    .setFieldName(Common.INPUT.GEMINI.GEMINI_MODEL);
            // Add available Gemini models as options
            const geminiModels = Common.Modules.GeminiApiClient.MODELS;
            // Loop through the models and add them as options to the selector
            for (const modelKey in geminiModels) {
                if (Object.prototype.hasOwnProperty.call(geminiModels, modelKey)) {
                    const modelName = geminiModels[modelKey];
                    geminiModelSelector.addItem(modelName, modelKey, data.gemini_model_selector === modelKey);
                }
            }
            // Add the Gemini model selector to the developer section
            devSection.addWidget(geminiModelSelector);

            // Event Log Switch
            devSection.addWidget(
                CardService.newDecoratedText()
                    .setTopLabel('Event Log')
                    .setText('Enable Event Logging')
                    .setBottomLabel('Toggle logging of events for debugging purposes.')
                    .setStartIcon(CardService.newIconImage().setMaterialIcon(
                        CardService.newMaterialIcon().setName('event_note').setFill(false)))
                    .setSwitchControl(
                        CardService.newSwitch()
                            .setFieldName(Common.INPUT.SYSTEM.ENABLE_EVENT_LOGGING)
                            .setValue('ON')
                            .setSelected(data[Common.INPUT.SYSTEM.ENABLE_EVENT_LOGGING] === 'ON')
                            .setControlType(CardService.SwitchControlType.CHECK_BOX)
                    )
            );

            // praittfy_json Switch
            devSection.addWidget(
                CardService.newDecoratedText()
                    .setTopLabel('Response Formatting')
                    .setText('Pretty Print JSON')
                    .setBottomLabel('Format API JSON responses for better readability in logs.')
                    .setStartIcon(CardService.newIconImage().setMaterialIcon(
                        CardService.newMaterialIcon().setName('format_align_left').setFill(false)))
                    .setSwitchControl(
                        CardService.newSwitch()
                            .setFieldName(Common.INPUT.SYSTEM.praittfy_json)
                            .setValue('ON')
                            .setSelected(data.praittfy_json === 'ON')
                            .setControlType(CardService.SwitchControlType.CHECK_BOX)
                    )
            );

            cardBuilder.addSection(devSection);

            // Professional Fixed Footer
            // High-contrast primary button for the "Save" action
            const fixedFooter = CardService.newFixedFooter()
                .setPrimaryButton(
                    CardService.newTextButton()
                        .setText('Save Configuration')
                        .setBackgroundColor(Addon.primaryColor())
                        //.setTextButtonStyle(CardService.TextButtonStyle.FILLED)
                        .setMaterialIcon(CardService.newMaterialIcon().setName('save'))
                        .setOnClickAction(
                            CardService.newAction()
                                .setFunctionName('Addon.Settings.Controller.SaveSettings')
                        )
                );

            cardBuilder.setFixedFooter(fixedFooter);

            return cardBuilder.build();
        }
    }
};

Addon.UserProfile = {
    id: 'UserProfilePlugin',
    name: 'User Profile',
    short_description: 'Manage your account and membership',
    description: 'The User Profile plugin allows you to manage your account information, view your membership status, and upgrade to premium features. You can easily access your profile details and make changes to your subscription directly from this card.',
    version: '2.0.0',
    imageUrl: Addon.Media.YOU_GOT_IT_IMG_URL,
    Controller: {
        PushHomeCard(e) {
            try {
                const data = Addon.getData();
                return CardService.newActionResponseBuilder()
                    .setNavigation(
                        CardService.newNavigation()
                            .pushCard(Addon.UserProfile.View.HomeCard(data))
                    ).build();
            } catch (error) {
                return this.handleOperationError(error);
            }
        },
        ActivatePremium(e) {
            try {
                // Simulate activation logic
                Common.Modules.CRM.Membership.activate(
                    Common.Modules.CRM.Membership.DEFAULT_TRIAL_DAYS,
                    Common.Modules.CRM.Membership.DEFAULT_TRIAL_BALANCE,
                    'trial');

                // Build and return the Home Card
                const data = Addon.getData();
                return CardService.newActionResponseBuilder()
                    .setNavigation(
                        CardService.newNavigation()
                            .popToRoot()
                            .updateCard(
                                Addon.Home.View.HomeCard(data))
                    ).build();
            } catch (error) {
                return this.handleOperationError(error);
            }
        },
        ConfirmRevokeLicense(e) {
            // Show confirmation card before revoking license
            const title = 'Cancel Subscription';
            const message = 'Are you sure you want to cancel your premium subscription? You will lose access to premium features.';
            const onClickFunctionName = 'Addon.UserProfile.Controller.RevokeLicense';
            const onClickParameters = e?.commonEventObject?.parameters || {};

            // Push Confirmation Card
            return Addon.ConfirmationCard.Controller.Confirm({
                commonEventObject: {
                    parameters: { title, message, onClickFunctionName, onClickParameters }
                }
            });
        },
        RevokeLicense(e) {
            try {
                // Simulate license revocation logic
                Common.Modules.CRM.Membership.revoke();

                // Build and return the Home Card
                const data = Addon.getData();
                return CardService.newActionResponseBuilder()
                    .setNavigation(
                        CardService.newNavigation()
                            .popToRoot()
                            .updateCard(
                                Addon.Home.View.HomeCard(data))
                    ).build();
            } catch (error) {
                // Return error notification
                return this.handleOperationError(error);
            }
        },
        handleOperationError(error) {
            // Show an error message to the user
            return CardService.newActionResponseBuilder()
                .setNotification(
                    CardService.newNotification()
                        .setText(
                            error.toString()))
                .build();
        }
    },
    View: {
        HomeCard: (data = {}) => {
            const cardBuilder = CardService.newCardBuilder()
                .setName(Addon.UserProfile.id + '-Home')
                .setHeader(CardService.newCardHeader()
                    .setTitle('Account Overview')
                    .setSubtitle('Manage your profile & membership')
                    .setImageStyle(CardService.ImageStyle.SQUARE)
                    .setImageUrl(Addon.Media.YOU_GOT_IT_IMG_URL)
                    .setImageAltText('User Profile Avatar'));

            // 1. Membership Status & details Section            
            cardBuilder.addSection(Addon.UserProfile.View._BuildMembershipSection(data));

            // 2. Feature Comparison Section (Professional Touch)
            const featureSection = CardService.newCardSection()
                .setHeader('🚀 Premium Features')
                .setCollapsible(true)
                .setNumUncollapsibleWidgets(1);

            const features = [
                { name: 'Unlimited Webhooks', premium: true },
                { name: 'Real-time Log Monitoring', premium: true },
                { name: 'Priority Support', premium: true },
                { name: 'Ad-free Experience', premium: true }
            ];

            features.forEach(f => {
                featureSection.addWidget(CardService.newDecoratedText()
                    .setText(f.name)
                    .setStartIcon(CardService.newIconImage().setMaterialIcon(
                        CardService.newMaterialIcon().setName('check_circle').setFill(false)))
                    .setBottomLabel(data?.[Common.INPUT.SYSTEM.MEMBERSHIP.IS_PREMIUM] ? 'Active' : 'Premium Only'));
            });

            cardBuilder.addSection(featureSection);

            return cardBuilder.build();
        },
        _BuildMembershipSection: (data = {}, membershipData = {}) => {
            const isPremium = data?.[Common.INPUT.SYSTEM.MEMBERSHIP.IS_PREMIUM] || false;

            const newSection = CardService.newCardSection()
                .setHeader('Membership & Billing');

            // Professional Membership Badge
            newSection.addWidget(CardService.newDecoratedText()
                .setTopLabel('Current Plan')
                .setText(isPremium ? '💎 PREMIUM ACCESS' : '🆓 FREE TIER')
                .setStartIcon(CardService.newIconImage().setMaterialIcon(
                    CardService.newMaterialIcon()
                        .setName(isPremium ? 'workspace_premium' : 'person')
                        .setFill(false)))
                .setBottomLabel(isPremium ? 'Your pro subscription is active.' : 'Upgrade to unlock advanced tools.')
                .setWrapText(true));

            if (isPremium) {
                // Calculate days left until expiration
                const expiresAt = membershipData?.[Common.INPUT.SYSTEM.MEMBERSHIP.EXPIRES_AT] ? new Date(membershipData[Common.INPUT.SYSTEM.MEMBERSHIP.EXPIRES_AT]) : null;
                const daysLeft = expiresAt ? Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)) : null;

                // Display days left until expiration if available
                newSection.addWidget(CardService.newDecoratedText()
                    .setTopLabel(`Membership Expiration`)
                    .setText(expiresAt ? expiresAt.toDateString() : 'N/A')
                    .setStartIcon(CardService.newIconImage().setMaterialIcon(
                        CardService.newMaterialIcon().setName('event').setFill(false)))
                    .setBottomLabel(typeof daysLeft === 'number' ? `${daysLeft} day(s) left` : '')
                    .setWrapText(true));

                // Display balance if available
                newSection.addWidget(CardService.newDecoratedText()
                    .setTopLabel('Balance')
                    .setText(`${membershipData?.[Common.INPUT.SYSTEM.MEMBERSHIP.BALANCE] || 0}`)
                    .setStartIcon(CardService.newIconImage().setMaterialIcon(
                        CardService.newMaterialIcon().setName('account_balance_wallet').setFill(false)))
                    .setWrapText(true));

                // Add a "Cancel Subscription" button for premium users
                newSection.addWidget(CardService.newTextButton()
                    .setText('Cancel Subscription')
                    .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
                    .setOnClickAction(CardService.newAction()
                        .setFunctionName('Addon.UserProfile.Controller.ConfirmRevokeLicense')));
            } else {
                newSection.addWidget(CardService.newTextButton()
                    .setText('💎 Upgrade Now')
                    .setBackgroundColor(Addon.primaryColor())
                    .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
                    .setMaterialIcon(CardService.newMaterialIcon().setName('bolt'))
                    .setOnClickAction(CardService.newAction()
                        .setFunctionName('Addon.UserProfile.Controller.ActivatePremium')));
            }

            return newSection;
        }
    }
};

Addon.ConfirmationCard = {
    id: 'ConfirmationCardPlugin',
    name: 'Confirmation Card',
    short_description: 'Standardized confirmation dialog',
    description: 'A reusable confirmation dialog plugin to standardize user confirmations across various actions within the Telegram Bot Studio environment.',
    version: '2.0.0',
    imageUrl: Addon.Media.PAY_ATTENTION_IMG_URL,
    Controller: {
        Load: (e = {}) => {
            const title = e?.commonEventObject?.parameters?.title || 'Confirm Action';
            const message = e?.commonEventObject?.parameters?.message || 'Are you sure you want to proceed?';
            const onClickFunctionName = e?.commonEventObject?.parameters?.onClickFunctionName || null;
            const onClickParameters = e?.commonEventObject?.parameters?.onClickParameters || {};

            if (!onClickFunctionName) {
                throw new Error('Missing required parameters: message, onClickFunctionName');
            }

            // Push the confirmation card
            return CardService.newActionResponseBuilder()
                .setNavigation(
                    CardService.newNavigation()
                        .pushCard(
                            Addon.ConfirmationCard.View.HomeCard({
                                title: title,
                                message: message,
                                onClickFunctionName: onClickFunctionName,
                                onClickParameters: onClickParameters
                            })
                        )
                )
                .build();
        },
        Confirm: (e) => {
            // extract parameters from event object onClickFunctionName = 'Addon['Name'].Controller['Function']', onClickParameters={}
            const onClickFunctionName = e?.commonEventObject?.parameters?.onClickFunctionName || null;
            const onClickParameters = e?.commonEventObject?.parameters?.onClickParameters || {};

            if (!onClickFunctionName) {
                throw new Error('Missing required parameters: message, onClickFunctionName');
            }

            // Resolve the function from the string name 
            // onClickFunctionName = 'Addon.Name.Controller.Function'
            const functionPathParts = onClickFunctionName.split('.');
            let actionResult = null;
            try {
                let func = Addon;
                for (let i = 1; i < functionPathParts.length; i++) {
                    func = func[functionPathParts[i]];
                }
                actionResult = func(e);
            } catch (error) {
                // Todp: 
            }

            return actionResult;
        },
        Cancel: (e) => {
            // Simply pop the card on cancel
            return CardService.newActionResponseBuilder()
                .setNavigation(CardService.newNavigation().popCard())
                .build();
        },
    },
    View: {
        HomeCard: (data = {}) => {
            // Build the Confirmation Card.
            const cardBuilder = CardService.newCardBuilder()
                .setName(Addon.ConfirmationCard.id + '-Home')
                .setHeader(CardService.newCardHeader()
                    .setTitle(data.title || 'Confirm Action')
                    .setImageStyle(CardService.ImageStyle.SQUARE)
                    .setImageUrl(Addon.ConfirmationCard.imageUrl)
                    .setImageAltText('Confirmation Image'));

            // Build the main section
            const mainSection = CardService.newCardSection()
                .addWidget(
                    CardService.newTextParagraph()
                        .setText(data.message || 'Are you sure you want to proceed?'));

            cardBuilder.addSection(mainSection);

            // Add Confirm and Cancel buttons to the footer
            cardBuilder.setFixedFooter(
                CardService.newFixedFooter()
                    .setPrimaryButton(
                        CardService.newTextButton()
                            .setText('Confirm')
                            .setOnClickAction(CardService.newAction()
                                .setFunctionName('Addon.ConfirmationCard.Controller.Confirm')
                                .setParameters({ onClickFunctionName: data.onClickFunctionName, onClickParameters: JSON.stringify(data.onClickParameters || {}) })))
                    .setSecondaryButton(
                        CardService.newTextButton()
                            .setText('Cancel')
                            .setOnClickAction(CardService.newAction()
                                .setFunctionName('Addon.ConfirmationCard.Controller.Cancel'))));

            return cardBuilder.build();
        }
    }
};

Addon.ResultWidget = {
    id: 'ResultWidget',
    name: 'Result Exporter',
    short_description: 'Export operation results to Google Sheets',
    description: 'A widget that allows users to export JSON operation results directly to a Google Sheets spreadsheet for further analysis and record-keeping.',
    version: '1.1.0',
    imageUrl: Addon.Media.YOU_GOT_IT_IMG_URL,
    Controller: {
        Load: (e) => {
            try {
                const result = e?.commonEventObject?.parameters?.result ? JSON.parse(e.commonEventObject.parameters.result) : {};
                return CardService.newActionResponseBuilder()
                    .setNavigation(
                        CardService.newNavigation()
                            .pushCard(Addon.ResultWidget.View.BuildResultCard(result))
                    ).build();
            } catch (error) {
                return CardService.newActionResponseBuilder()
                    .setNotification(
                        CardService.newNotification()
                            .setText(`❌ Error loading result card: ${error.toString()}`))
                    .build();
            }
        },
        DumpResultToSheet: (e) => {
            const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

            try {
                // extract parameters
                const a1n = e?.commonEventObject?.parameters?.a1n || 'A1';
                const sheetName = e?.commonEventObject?.parameters?.sheetName || Common.Modules.Sheet.DUMP_SHEET_NAME;
                const botName = e?.commonEventObject?.parameters?.botName || '[Unknown Bot]';
                const report = e?.commonEventObject?.parameters?.report || '{}';

                // Dump data to sheet
                Common.Modules.Sheet
                    .dumpObjectToSheet(
                        activeSpreadsheet, { name: sheetName }, botName, a1n, JSON.parse(report), false);

                // Return action response with notification
                return CardService.newActionResponseBuilder()
                    .setNotification(
                        CardService.newNotification()
                            .setText(`✅ Data dumped to sheet "${sheetName}" successfully at range "${a1n}".`))
                    .build();
            }
            catch (error) {
                return CardService.newActionResponseBuilder()
                    .setNotification(
                        CardService.newNotification()
                            .setText(`❌ Error dumping data to sheet: ${error.toString()}`))
                    .build();
            }
        },
        HighlightRange: (e) => {
            const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
            try {
                // extract parameters
                const a1n = e?.commonEventObject?.parameters?.a1n || 'A1';
                const sheetName = e?.commonEventObject?.parameters?.sheetName || activeSpreadsheet.getActiveSheet().getName();
                const sheet = activeSpreadsheet.getSheetByName(sheetName);
                const range = sheet.getRange(a1n);
                // Highlight the range with a yellow background
                const hightlightColor = '#FFFF00';
                range.setBackground(hightlightColor);

                // Return action response with notification
                return CardService.newActionResponseBuilder()
                    .setNotification(
                        CardService.newNotification()
                            .setText(`✅ Highlighted range "${a1n}" in sheet "${sheetName}".`))
                    .build();
            }
            catch (error) {
                return CardService.newActionResponseBuilder()
                    .setNotification(
                        CardService.newNotification()
                            .setText(`⚠️ Error highlighting range: ${error.toString()}`))
                    .build();
            }
        }
    },
    View: {
        HomeCard: (result = {}) => {
            const cardBuilder = CardService.newCardBuilder()
                .setName(Addon.ResultWidget.id + '-ResultCard')
                .setHeader(CardService.newCardHeader()
                    .setTitle('Operation Result')
                    .setSubtitle('View and export operation results')
                    .setImageStyle(CardService.ImageStyle.SQUARE)
                    .setImageUrl(Addon.ResultWidget.imageUrl)
                    .setImageAltText('Result Image'));

            // Add Result Summary Section
            cardBuilder.addSection(
                Addon.ResultWidget.View
                    .BuildResultSummarySection(result.range, result.report)
            );

            // Add Detailed Result Widgets
            const detailSection = CardService.newCardSection()
                .setHeader('📋 Detailed Results')
                .setCollapsible(true)
                .setNumUncollapsibleWidgets(4);

            // Iterate over each report item and add a widget
            result.report.forEach(reportItem => {
                detailSection.addWidget(
                    Addon.ResultWidget.View
                        // Add a widget for each detailed result item
                        .BuildResultWidget(reportItem)
                );
            });

            cardBuilder.addSection(detailSection);

            // Add Export Widget
            cardBuilder.addSection(
                CardService.newCardSection()
                    .addWidget(
                        Addon.ResultWidget.View
                            .BuildExportWidget(result.range.getSheet().getName(), result.range, result.report)
                    )
            );
            return cardBuilder.build();
        },
        BuildResultCard: (result = {}) => {
            return Addon.ResultWidget.View.HomeCard(result);
        },
        BuildResultSummarySection: (range, report) => {
            return CardService.newCardSection()
                .setHeader('📊 Failures Report')
                .addWidget(
                    CardService.newDecoratedText()
                        .setTopLabel('Affected Range')
                        .setText(range.getA1Notation())
                        .setStartIcon(
                            CardService.newIconImage()
                                .setMaterialIcon(
                                    CardService.newMaterialIcon()
                                        .setName('grid_on'))))
                .addWidget(
                    CardService.newDecoratedText()
                        .setTopLabel('Summary')
                        .setText(`Total: ${range.getNumRows() * range.getNumColumns()}`
                            + ` | Successes: ${report.filter(item => !item.error).length}`
                            + ` | Failures: ${report.filter(item => item.error).length}`)
                        .setWrapText(true)
                        .setStartIcon(
                            CardService.newIconImage()
                                .setMaterialIcon(
                                    CardService.newMaterialIcon()
                                        .setName('assessment'))));
        },
        BuildResultWidget: (reportItem = {}) => {
            return CardService.newDecoratedText()
                //.setTopLabel(`${reportItem.a1n}`)
                .setText(`⚠️ ${reportItem.a1n}`)
                .setWrapText(true)
                .setBottomLabel(`${reportItem.error}`)
                .setButton(
                    CardService.newTextButton()
                        .setAltText('Highlight')
                        .setMaterialIcon(
                            CardService.newMaterialIcon()
                                .setName('highlight'))
                        .setOnClickAction(
                            CardService.newAction()
                                .setFunctionName('Addon.ResultWidget.Controller.HighlightRange')
                                .setParameters({
                                    a1n: reportItem.a1n,
                                    sheetName: reportItem.sheetName || ''
                                })
                        )
                );
        },
        BuildExportWidget: (botName, a1n, result) => {
            return CardService.newDecoratedText()
                .setTopLabel('📥 Export Data')
                .setText('Export to Sheet')
                .setWrapText(true)
                .setBottomLabel(`Export the operation results to a Google Sheets spreadsheet for further analysis.`)
                .setStartIcon(
                    CardService.newIconImage()
                        .setMaterialIcon(
                            CardService.newMaterialIcon()
                                .setName('save_alt')))
                .setButton(
                    CardService.newTextButton()
                        .setText('Export')
                        .setOnClickAction(
                            CardService.newAction()
                                .setFunctionName('Addon.ResultWidget.Controller.DumpResultToSheet')
                                .setParameters({
                                    a1n: a1n,
                                    botName: botName,
                                    report: JSON.stringify(result)
                                })
                        )
                );
        }
    }
};

Addon.GenerateContent = {
    id: 'GenerateContentPlugin',
    name: 'Content Generator',
    short_description: 'Generate content using AI models',
    description: 'A plugin that allows users to generate content using AI models directly from the add-on interface. Users can input prompts and receive generated content that can be inserted into their spreadsheets.',
    version: '1.0.0',
    imageUrl: Addon.Media.YOU_GOT_IT_IMG_URL,
    Controller: {
        Load: (e) => {
            const data = e?.commonEventObject?.parameters || {};
            const isUpdate = data.update === 'true';
            const isPop = data.popCard === 'true';

            try {

                // Build and return the Home Card
                const appModelData = Addon.getData();
                appModelData.prompt_text_input = 'You are a cat. \nYour name is Neko. \nWrite a short poem about your day.';
                appModelData.gemini_model_selector = 'gemini-3-flash-preview';
                appModelData.temperature_text_input = 1;
                appModelData.topP_text_input = 0.95;
                appModelData.topK_text_input = 40;
                appModelData.responseMimeType_selector = 'text/plain';

                // Build and return the Home Card
                const card = Addon.GenerateContent.View.HomeCard(appModelData);

                let cardNavigation = null;

                if (isPop) {
                    cardNavigation = CardService.newNavigation()
                        .popCard();
                } else {
                    if (isUpdate) {
                        cardNavigation = CardService.newNavigation()
                            .updateCard(card);
                    } else {
                        cardNavigation = CardService.newNavigation()
                            .pushCard(card);
                    }
                }


                // Return action response to update card
                return CardService.newActionResponseBuilder()
                    .setNavigation(cardNavigation)
                    .build();
            }
            catch (error) {
                return CardService.newActionResponseBuilder()
                    .setNotification(
                        CardService.newNotification()
                            .setText(`❌ Error loading content generator: ${error.toString()}`))
                    .build();
            }
        },
        GenerateContent: (e) => {
            const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
            const source = 'Addon.GenerateContent';
            try {
                const prompt = e?.commonEventObject
                    ?.formInputs?.[Addon.PROPERTIES.prompt_text_input]
                    ?.stringInputs?.value[0] || 'Hello, world!';
                const geminiModel = e?.commonEventObject
                    ?.formInputs?.[Addon.PROPERTIES.gemini_model_selector]
                    ?.stringInputs?.value[0] || 'gemini-3-flash-preview';
                const temperature = parseFloat(e?.commonEventObject
                    ?.formInputs?.[Addon.PROPERTIES.temperature_text_input]
                    ?.stringInputs?.value[0] || '1');
                const topP = parseFloat(e?.commonEventObject
                    ?.formInputs?.[Addon.PROPERTIES.topP_text_input]
                    ?.stringInputs?.value[0] || '0.95');
                const topK = parseInt(e?.commonEventObject
                    ?.formInputs?.[Addon.PROPERTIES.topK_text_input]
                    ?.stringInputs?.value[0] || '40', 10);
                const responseMimeType = e?.commonEventObject?.formInputs?.[Addon.PROPERTIES.responseMimeType_selector]
                    ?.stringInputs?.value[0] || 'text/plain';
                const gemini_api_key = PropertiesService.getScriptProperties().getProperty(Addon.PROPERTIES.gemini_api_key) || '[YOUR_API_KEY]';
                const generationConfig = {
                    thinkingConfig: {
                        thinkingLevel: 'low'
                    },
                    temperature: temperature,
                    topP: topP,
                    topK: topK,
                    responseMimeType: responseMimeType
                };

                const systemInstruction = {
                    parts: [{
                        text: prompt
                    }]
                };

                const payload = {
                    generationConfig,
                    systemInstruction,
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                };
                const apiResponseContent = Common.Modules.GeminiApiClient.generateContent(gemini_api_key, geminiModel, payload);
                // Insert generated content into Terminal Sheet
                Common.Modules.Sheet.writeGeminiResponse(activeSpreadsheet, e, geminiModel, payload, apiResponseContent);

                // Return action response with notification
                return CardService.newActionResponseBuilder()
                    .setNotification(
                        CardService.newNotification()
                            .setText(`✅ Content generated and inserted into Terminal Sheet successfully.`))
                    .build();
            }
            catch (error) {
                // Common.Modules.TerminalOutput.write(activeSpreadsheet, e, 'Error', error.toString());
                return CardService.newActionResponseBuilder()
                    .setNotification(
                        CardService.newNotification()
                            .setText(`❌ Error generating content: ${error.toString()}`))
                    .build();
            }
        }
    },
    View: {
        HomeCard: (data = {}) => {
            const cardBuilder = CardService.newCardBuilder()
                .setName(Addon.GenerateContent.id + '-Home')
                .setHeader(CardService.newCardHeader()
                    .setTitle(Addon.GenerateContent.name)
                    .setSubtitle(Addon.GenerateContent.short_description)
                    .setImageStyle(CardService.ImageStyle.SQUARE)
                    .setImageUrl(Addon.GenerateContent.imageUrl)
                    .setImageAltText(Addon.GenerateContent.name + ' Logo'));

            // Add a section with a text input for the prompt and a button to generate content
            const inputSection = CardService.newCardSection()
                .setCollapsible(true)
                .setNumUncollapsibleWidgets(3);

            // Add a multiline text input for the prompt with a default value and a hint
            inputSection.addWidget(
                CardService.newTextInput()
                    //.setVisibility(hidden ? CardService.Visibility.HIDDEN : CardService.Visibility.VISIBLE)
                    .setValue(data.prompt_text_input || 'You are a cat. Your name is Neko. Write a short poem about your day.')
                    .setId(Addon.PROPERTIES.prompt_text_input)
                    .setFieldName(Addon.PROPERTIES.prompt_text_input)
                    .setTitle('📝 Your Prompt')
                    .setHint('Enter your prompt for the AI model, for example: "Write a poem about a sunset."')
                    .setMultiline(true)
            );

            // Add a dropdown to select the Gemini model
            const geminiModelSelector =
                CardService.newSelectionInput()
                    .setType(CardService.SelectionInputType.DROPDOWN)
                    // Enable for premium users
                    .setTitle('🤖 Gemini Model')
                    .setFieldName(Addon.PROPERTIES.gemini_model_selector);
            // Add available Gemini models as options
            const geminiModels = Common.Modules.GeminiAgent.MODELS;
            // Loop through the models and add them as options to the selector
            for (const modelKey in geminiModels) {
                if (geminiModels.hasOwnProperty(modelKey)) {
                    const modelName = geminiModels[modelKey];
                    geminiModelSelector.addItem(modelName, modelKey, data.gemini_model_selector === modelKey);
                }
            }

            // Add the selection input to the card section
            inputSection.addWidget(geminiModelSelector);

            // Add temperature text input (number input with step of 0.1) for content generation creativity control
            inputSection.addWidget(
                CardService.newTextInput()
                    .setValue(data.temperature_text_input || '1')
                    .setId(Addon.PROPERTIES.temperature_text_input)
                    .setFieldName(Addon.PROPERTIES.temperature_text_input)
                    .setTitle('🌡️ Temperature')
                    .setHint('Enter a value between 0 and 1. Controls the randomness of the output.')
            );

            // topP: Optional. The maximum cumulative probability of tokens to consider when sampling.
            inputSection.addWidget(
                CardService.newTextInput()
                    .setValue(data.topP_text_input || '1')
                    .setId(Addon.PROPERTIES.topP_text_input)
                    .setFieldName(Addon.PROPERTIES.topP_text_input)
                    .setTitle('🎯 Top P')
                    .setHint('Enter a top P value (e.g., 0.9). The maximum cumulative probability of tokens to consider when sampling.')
            );

            // topK: Optional. The maximum number of tokens to consider when sampling.
            inputSection.addWidget(
                CardService.newTextInput()
                    .setValue(data.topK_text_input || '40')
                    .setId(Addon.PROPERTIES.topK_text_input)
                    .setFieldName(Addon.PROPERTIES.topK_text_input)
                    .setTitle('🎯 Top K')
                    .setHint('Enter a top K value (e.g., 40). The maximum number of tokens to consider when sampling.')
            );

            // responseMimeType selector for output format control (e.g., text/plain, application/json)
            inputSection.addWidget(
                CardService.newSelectionInput()
                    .setType(CardService.SelectionInputType.DROPDOWN)
                    .setTitle('📄 Response Format')
                    .setFieldName(Addon.PROPERTIES.responseMimeType_selector)
                    .addItem('Text', 'text/plain', data.responseMimeType_selector === 'text/plain')
                    .addItem('JSON', 'application/json', data.responseMimeType_selector === 'application/json')
                    .addItem('ENUM', 'text/x.enum', data.responseMimeType_selector === 'text/x.enum')
            );

            // Add the generate button
            inputSection.addWidget(
                CardService.newTextButton()
                    .setText('Generate Content')
                    .setOnClickAction(
                        CardService.newAction()
                            .setFunctionName('Addon.GenerateContent.Controller.GenerateContent')
                            .setParameters({ update: 'true' })
                    )
            );

            cardBuilder.addSection(inputSection);
            return cardBuilder.build();
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Addon, Common
    };
};