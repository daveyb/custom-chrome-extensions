chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getPageContent'}, (response) => {
        if (response && response.content) {
          chrome.storage.sync.get(['xaiApiKey'], (result) => {
            const apiKey = result.xaiApiKey;
            if (!apiKey) {
              sendResponse({error: 'No API key set. Please set your xAI API key in the extension popup.'});
              return;
            }
            // Prepare prompt based on user message
            const userMessage = request.userMessage || 'Summarize this content';
            const prompt = userMessage.toLowerCase().includes('summarize') 
              ? `Summarize the following content: ${response.content}`
              : `${userMessage}: ${response.content}`;
              
            // Call xAI API with the tailored prompt
            fetch('https://api.x.ai/v1/chat', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ prompt: prompt })
            })
            .then(apiResponse => apiResponse.json())
            .then(data => {
              if (data.response) {
                sendResponse({summary: data.response});
              } else {
                sendResponse({error: 'Failed to get response from xAI API.'});
              }
            })
            .catch(err => {
              sendResponse({error: 'Error calling xAI API: ' + err.message});
            });
          });
        }
      });
    });
    return true;  // Indicates that the response is asynchronous
  }
});
