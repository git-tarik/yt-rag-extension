document.addEventListener('DOMContentLoaded', () => {
    const optionsForm = document.getElementById('options-form');
    const googleApiKeyInput = document.getElementById('google-api-key');
    const openaiApiKeyInput = document.getElementById('openai-api-key');
    const statusMessage = document.getElementById('status-message');

    // Load saved keys and display them in the form
    chrome.storage.sync.get(['googleApiKey', 'openaiApiKey'], (result) => {
        if (result.googleApiKey) {
            googleApiKeyInput.value = result.googleApiKey;
        }
        if (result.openaiApiKey) {
            openaiApiKeyInput.value = result.openaiApiKey;
        }
    });

    optionsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const googleApiKey = googleApiKeyInput.value.trim();
        const openaiApiKey = openaiApiKeyInput.value.trim();

        if (googleApiKey && openaiApiKey) {
            chrome.storage.sync.set({ googleApiKey, openaiApiKey }, () => {
                statusMessage.textContent = 'API keys saved successfully!';
                statusMessage.style.color = 'var(--success-color)';
                setTimeout(() => {
                    statusMessage.textContent = '';
                }, 3000);
            });
        } else {
            statusMessage.textContent = 'Please provide both API keys.';
            statusMessage.style.color = 'var(--error-color)';
        }
    });
});
