document.addEventListener('DOMContentLoaded', function() {
  const chatWindow = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');
  const apiKeyForm = document.getElementById('api-key-form');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveApiKeyButton = document.getElementById('save-api-key');

  // Open chat window
  chatWindow.classList.add('open');

  // Check if API key is set
  chrome.storage.sync.get(['xaiApiKey'], (result) => {
    if (!result.xaiApiKey) {
      // Show API key form if not set
      apiKeyForm.style.display = 'block';
      chatInput.disabled = true;
      sendButton.disabled = true;
    } else {
      apiKeyForm.style.display = 'none';
      chatInput.disabled = false;
      sendButton.disabled = false;
    }
  });

  // Save API key
  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ xaiApiKey: apiKey }, () => {
        apiKeyForm.style.display = 'none';
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatMessages.innerHTML += `<p>API key saved successfully.</p>`;
      });
    } else {
      alert('Please enter a valid API key.');
    }
  });

  sendButton.addEventListener('click', () => {
    const message = chatInput.value;
    if (message) {
      chatMessages.innerHTML += `<p>You: ${message}</p>`;
      chatInput.value = '';

      // Send message to background script for processing
      chrome.runtime.sendMessage({action: 'summarize', userMessage: message}, (response) => {
        if (response) {
          if (response.error) {
            chatMessages.innerHTML += `<p>Error: ${response.error}</p>`;
            if (response.error.includes('API key')) {
              apiKeyForm.style.display = 'block';
              chatInput.disabled = true;
              sendButton.disabled = true;
            }
          } else if (response.summary) {
            chatMessages.innerHTML += `<p>AI: ${response.summary}</p>`;
          }
        }
      });
    }
  });

  // Add a button or quick action for summarizing the page
  const summarizePageButton = document.createElement('button');
  summarizePageButton.textContent = 'Summarize Page';
  summarizePageButton.style.margin = '0 10px 10px 10px';
  summarizePageButton.style.padding = '8px 16px';
  summarizePageButton.style.backgroundColor = '#28a745';
  summarizePageButton.style.color = 'white';
  summarizePageButton.style.border = 'none';
  summarizePageButton.style.borderRadius = '4px';
  summarizePageButton.style.cursor = 'pointer';
  summarizePageButton.addEventListener('click', () => {
    chatMessages.innerHTML += `<p>You: Summarize this page</p>`;
    chrome.runtime.sendMessage({action: 'summarize', userMessage: 'Summarize this page'}, (response) => {
      if (response) {
        if (response.error) {
          chatMessages.innerHTML += `<p>Error: ${response.error}</p>`;
          if (response.error.includes('API key')) {
            apiKeyForm.style.display = 'block';
            chatInput.disabled = true;
            sendButton.disabled = true;
          }
        } else if (response.summary) {
          chatMessages.innerHTML += `<p>AI: ${response.summary}</p>`;
        }
      }
    });
  });
  document.getElementById('chat-input-area').appendChild(summarizePageButton);

  // Allow sending message with Enter key
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendButton.click();
    }
  });
});
