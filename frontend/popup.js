document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const closeBtn = document.getElementById('close-btn');
    const langSelect = document.getElementById('language-select');
    const startChatBtn = document.getElementById('start-chat-btn');
    const langSelectorContainer = document.getElementById('lang-selector-container');

    let googleApiKey = '';
    let openaiApiKey = '';
    let currentVideoId = '';
    const BACKEND_URL = 'http://127.0.0.1:5000';

    // --- Helper Functions ---
    function addMessage(text, sender, type = 'normal') {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container', sender);

        const avatar = document.createElement('div');
        avatar.classList.add('avatar', sender);
        avatar.textContent = sender === 'bot' ? '✨' : '👤';

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        if (type === 'status') {
            messageElement.classList.add('status');
            messageElement.textContent = text;
            messageContainer.appendChild(messageElement); // No avatar for status
        } else if (type === 'thinking') {
            messageElement.classList.add('thinking-indicator');
            messageElement.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
            messageContainer.appendChild(avatar);
            messageContainer.appendChild(messageElement);
        } else {
            messageElement.textContent = text;
            messageContainer.appendChild(avatar);
            messageContainer.appendChild(messageElement);
        }
        
        chatHistory.appendChild(messageContainer);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return messageContainer;
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
        addMessage('Select the transcript language and click "Start Chat".', 'bot', 'status');

        chrome.storage.sync.get(['googleApiKey', 'openaiApiKey'], (result) => {
            if (result.googleApiKey && result.openaiApiKey) {
                googleApiKey = result.googleApiKey;
                openaiApiKey = result.openaiApiKey;
            } else {
                addMessage('API keys not set. Please go to the options page.', 'bot', 'status');
                startChatBtn.disabled = true;
            }
        });
    }

    function handleStartChat() {
        const selectedLang = langSelect.value;
        langSelectorContainer.style.display = 'none'; // Hide selector
        loadVideo(selectedLang);
    }

    function loadVideo(language) {
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
                    body: JSON.stringify({ url: tab.url, lang: language })
                })
                .then(response => response.json())
                .then(data => {
                    // Remove the "Loading..." message
                    const statusMessage = chatHistory.querySelector('.message.status');
                    if (statusMessage) statusMessage.parentElement.remove();

                    if (data.status === 'loaded' && data.video_id === currentVideoId) {
                        addMessage("I'm ready! Ask me anything about the video.", 'bot');
                        disableInput(false);
                        chatInput.focus();
                    } else {
                        throw new Error(data.error || 'Failed to load video.');
                    }
                })
                .catch(error => {
                    const statusMessage = chatHistory.querySelector('.message.status');
                    if (statusMessage) statusMessage.parentElement.remove();
                    addMessage(`Error: ${error.message}`, 'bot', 'status');
                    langSelectorContainer.style.display = 'flex'; // Show selector again on error
                });

            } else {
                addMessage('Not a YouTube video page.', 'bot', 'status');
                langSelectorContainer.style.display = 'flex';
            }
        });
    }

    function handleSend() {
        const question = chatInput.value.trim();
        if (!question || !currentVideoId) return;

        addMessage(question, 'user');
        chatInput.value = '';
        disableInput(true);
        const thinkingMessage = addMessage('', 'bot', 'thinking');

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
            thinkingMessage.remove();
            if (data.answer) {
                addMessage(data.answer, 'bot');
            } else {
                throw new Error(data.error || 'Did not receive an answer.');
            }
        })
        .catch(error => {
            thinkingMessage.remove();
            addMessage(`Error: ${error.message}`, 'bot', 'status');
        })
        .finally(() => {
            disableInput(false);
            chatInput.focus();
        });
    }

    // --- Event Listeners ---
    startChatBtn.addEventListener('click', handleStartChat);
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
