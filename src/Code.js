// Google Apps Script code for Google Workspace Add-ons
/**
 * @see https://developers.google.com/apps-script/guides/triggers#oninstalle
 **/
function onInstall(e) {
    onOpen(e);
}

/** 
 * @see https://developers.google.com/apps-script/guides/triggers
 * @see https://docs.google.com/document/d/1v1wmNKzckcgCwe46gIytjaMdR04HaLLIwsj0idDNF-M/edit?tab=t.0
 */
function onOpen(e) {
    SpreadsheetApp
        .getUi()
        .createAddonMenu()
        .addItem('Format', 'onMenuFormatRange')
        .addItem('Minify', 'onMenuMinifyRange')
        .addToUi();
}

/**
 * @see https://developers.google.com/apps-script/guides/web
 */
function doGet(e) {
    // Handle GET request parameters
    const params = e.parameter;

    let htmlContent = '<h1>AI Studio</h1>';
    htmlContent += '<p>Welcome to AI Studio for Google Sheets!</p>';
    htmlContent += '<p>Use the sidebar to access various plugins and features to enhance your AI capabilities within Google Sheets.</p>';

    // Return HTML output
    return HtmlService
        .createHtmlOutput(htmlContent)
        .setTitle('AI Studio');

    // Or return JSON
    // return ContentService
    //   .createTextOutput(JSON.stringify({ status: 'success' }))
    //   .setMimeType(ContentService.MimeType.JSON);
}

// Export the functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        onInstall,
        onOpen,
        doGet
    };
}