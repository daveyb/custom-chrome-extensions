document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
      const pageContent = document.body.innerText.substring(0, 1000);  // Get first 1000 characters for summary
      sendResponse({ content: pageContent });
    }
  });
});  // Added closing parenthesis here
