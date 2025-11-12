document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const closeBtn = document.getElementById('close-btn');

    let googleApiKey = '';
    let openaiApiKey = '';
    let currentVideoId = '';
    const BACKEND_URL = 'http://127.0.0.1:5000';

    // --- Helper Functions ---
    function addMessage(text, sender, type = 'normal') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}`);
        if (type === 'status') {
            messageElement.classList.add('status');
        }
        messageElement.textContent = text;
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function disableInput(disabled) {
        chatInput.disabled = disabled;
        sendBtn.disabled = disabled;
    }

    function getYouTubeVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // --- Main Logic ---
    function initialize() {
        disableInput(true);
        addMessage('Initializing...', 'bot', 'status');

        chrome.storage.sync.get(['googleApiKey', 'openaiApiKey'], (result) => {
            if (result.googleApiKey && result.openaiApiKey) {
                googleApiKey = result.googleApiKey;
                openaiApiKey = result.openaiApiKey;
                loadVideo();
            } else {
                addMessage('API keys not set. Please go to the options page to set them.', 'bot', 'status');
            }
        });
    }

    function loadVideo() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab || !tab.url) {
                addMessage('Could not get current tab information.', 'bot', 'status');
                return;
            }

            const videoId = getYouTubeVideoId(tab.url);
            if (videoId) {
                currentVideoId = videoId;
                addMessage('Loading video transcript...', 'bot', 'status');
                
                fetch(`${BACKEND_URL}/load_video`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Google ${googleApiKey}, OpenAI ${openaiApiKey}`
                    },
                    body: JSON.stringify({ url: tab.url, lang: 'en' })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'loaded' && data.video_id === currentVideoId) {
                        addMessage('Ready to chat about this video!', 'bot', 'status');
                        disableInput(false);
                        chatInput.focus();
                    } else {
                        throw new Error(data.error || 'Failed to load video.');
                    }
                })
                .catch(error => {
                    addMessage(`Error: ${error.message}`, 'bot', 'status');
                });

            } else {
                addMessage('Not a YouTube video page.', 'bot', 'status');
            }
        });
    }

    function handleSend() {
        const question = chatInput.value.trim();
        if (!question || !currentVideoId) return;

        addMessage(question, 'user');
        chatInput.value = '';
        disableInput(true);
        addMessage('Thinking...', 'bot', 'status'); // Temporary "thinking" message

        fetch(`${BACKEND_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Google ${googleApiKey}, OpenAI ${openaiApiKey}`
            },
            body: JSON.stringify({ question, video_id: currentVideoId })
        })
        .then(response => response.json())
        .then(data => {
            // Remove the "Thinking..." message
            const thinkingMessage = chatHistory.querySelector('.message.status');
            if (thinkingMessage) thinkingMessage.remove();

            if (data.answer) {
                addMessage(data.answer, 'bot');
            } else {
                throw new Error(data.error || 'Did not receive an answer.');
            }
        })
        .catch(error => {
            const thinkingMessage = chatHistory.querySelector('.message.status');
            if (thinkingMessage) thinkingMessage.remove();
            addMessage(`Error: ${error.message}`, 'bot', 'status');
        })
        .finally(() => {
            disableInput(false);
            chatInput.focus();
        });
    }

    // --- Event Listeners ---
    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
    closeBtn.addEventListener('click', () => window.close());

    // --- Start ---
    initialize();
});
