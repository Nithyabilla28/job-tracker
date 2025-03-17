document.addEventListener("DOMContentLoaded", function () {
    const sheetUrlInput = document.getElementById("googleSheetUrl");
    const saveButton = document.getElementById("saveSheetUrl");
    const statusMessage = document.getElementById("statusMessage");

    // Load saved Google Sheet URL
    chrome.storage.sync.get("userSheetUrl", (data) => {
        if (data.userSheetUrl) {
            sheetUrlInput.value = data.userSheetUrl;
        }
    });

    // Save Google Sheet URL
    saveButton.addEventListener("click", () => {
        const sheetUrl = sheetUrlInput.value.trim();
        
        if (sheetUrl.startsWith("https://docs.google.com/spreadsheets/d/")) {
            chrome.storage.sync.set({ userSheetUrl: sheetUrl }, () => {
                console.log("✅ Google Sheet URL Saved:", sheetUrl); // Added log
                statusMessage.textContent = "Google Sheet URL saved successfully!";
                statusMessage.style.color = "green";
            });
        } else {
            statusMessage.textContent = "Invalid Google Sheet URL. Please enter a valid URL.";
            statusMessage.style.color = "red";
        }
    });
});
