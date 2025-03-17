chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "logJobApplication") {
        logToGoogleSheets(message.jobDetails, sendResponse);
        return true; // Keeps response open for async operations
    } else if (message.action === "getSheetUrl") {
        chrome.storage.sync.get("userSheetUrl", (data) => {
            sendResponse({ sheetUrl: data.userSheetUrl || null });
        });
        return true;
    }
});

// Function to log job application data to Google Sheets
async function logToGoogleSheets(jobDetails, sendResponse) {
    try {
        // Retrieve stored Google Sheet URL
        const data = await getStoredSheetUrl();
        if (!data.userSheetUrl) {
            console.error("❌ No Google Sheet URL found.");
            sendResponse({ success: false, error: "Google Sheet URL is missing. Set it in options." });
            return;
        }

        // Extract Google Sheet ID from URL
        const sheetId = extractSheetId(data.userSheetUrl);
        if (!sheetId) {
            console.error("❌ Invalid Google Sheet URL format.");
            sendResponse({ success: false, error: "Invalid Google Sheet URL format." });
            return;
        }

        // Get authentication token
        const token = await getGoogleAuthToken();
        if (!token) {
            sendResponse({ success: false, error: "Google authentication failed." });
            return;
        }

        // Define the range (adjust as needed)
        const range = "Sheet1!A:D"; // A:D for Application Date, Company Name, Role, Job Link
        const values = [[jobDetails.applicationDate, jobDetails.companyName, jobDetails.role, jobDetails.jobLink]];

        console.log("🔄 Sending data to Google Sheets:", values);

        // Make request to Google Sheets API
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=RAW`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ values })
            }
        );

        const jsonResponse = await response.json();
        console.log("📩 Google Sheets API Response:", jsonResponse);

        // Handle API response
        if (response.ok) {
            sendResponse({ success: true });
        } else {
            console.error("❌ Google Sheets API Error:", jsonResponse);
            sendResponse({ success: false, error: jsonResponse });
        }
    } catch (error) {
        console.error("❌ Error logging to Google Sheets:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// Retrieve stored Google Sheet URL
function getStoredSheetUrl() {
    return new Promise((resolve) => {
        chrome.storage.sync.get("userSheetUrl", (data) => resolve(data));
    });
}

// Extract Sheet ID from Google Sheets URL
function extractSheetId(sheetUrl) {
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
}

// Get OAuth Token from Chrome Identity API
function getGoogleAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                console.error("❌ OAuth Error:", chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError);
            } else {
                console.log("✅ OAuth Token:", token);
                resolve(token); // Fixed: Properly returning token
            }
        });
    });
}
