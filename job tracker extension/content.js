// content.js (Extracts job application details from job sites)
document.addEventListener("click", (event) => {
    if (event.target.closest("button[aria-label='Apply']")) {
        const jobTitle = document.querySelector("h1")?.innerText || "";
        const company = document.querySelector("[class*='company'], [class*='employer']")?.innerText || "";
        const jobURL = window.location.href;
        const applicationDate = new Date().toISOString().split('T')[0];

        // Corrected key names to match background.js
        chrome.runtime.sendMessage({
            action: "logJobApplication",
            jobDetails: { 
                companyName: company, 
                role: jobTitle, 
                jobLink: jobURL, 
                applicationDate 
            }
        });
    }
});
