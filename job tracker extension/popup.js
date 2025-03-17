document.addEventListener("DOMContentLoaded", () => {
    const addJobButton = document.getElementById("addJob");
    const trackButton = document.getElementById("track");

    addJobButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent form submission reload

        // Get input values
        const companyName = document.getElementById("companyName").value.trim();
        const role = document.getElementById("role").value.trim();
        const jobLink = document.getElementById("jobLink").value.trim();
        const applicationDate = new Date().toISOString().split("T")[0]; // Today's date

        // Validate inputs
        if (!companyName || !role || !jobLink) {
            alert("❌ Please fill all fields before adding.");
            return;
        }

        const jobDetails = { companyName, role, jobLink, applicationDate };

        // Send job details to background.js
        chrome.runtime.sendMessage({ action: "logJobApplication", jobDetails }, (response) => {
            if (response && response.success) {
                alert("✅ Job saved successfully!");
            } else {
                alert("❌ Failed to save job. Check console logs.");
                console.error("Error saving job:", response?.error);
            }
        });

        // Clear input fields after submission
        document.getElementById("jobForm").reset();
    });

    // Open Google Sheet when clicking "Track"
    trackButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "getSheetUrl" }, (response) => {
            if (response && response.sheetUrl) {
                chrome.tabs.create({ url: response.sheetUrl });
            } else {
                alert("❌ Please set up your Google Sheet URL in the extension settings.");
                chrome.runtime.openOptionsPage();
            }
        });
    });
});
