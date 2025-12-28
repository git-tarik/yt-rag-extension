# YouTube RAG-Bot Extension

<div align="center">

A powerful Chrome extension that lets you chat with YouTube videos using AI-powered Retrieval-Augmented Generation (RAG). Extract transcripts from YouTube videos and ask intelligent questions about their content using Google Generative AI and LangChain.

### 🛠️ Tech Stack

![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.0+-green?style=for-the-badge&logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript&logoColor=black)
![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue?style=for-the-badge&logo=googlechrome&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-AI%20Orchestration-orange?style=for-the-badge)
![Google AI](https://img.shields.io/badge/Google%20Gemini-AI%20Model-blue?style=for-the-badge&logo=google&logoColor=white)
![FAISS](https://img.shields.io/badge/FAISS-Vector%20Search-red?style=for-the-badge)

</div>

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Usage](#usage)

---

## 🎯 Project Overview

**YouTube RAG-Bot** is a browser extension that bridges the gap between YouTube content consumption and AI-powered interaction. Instead of watching long videos, you can now:

- Extract transcripts from any YouTube video
- Ask questions about the video content
- Get intelligent answers based on the actual video transcript
- Interact in multiple languages (English, Hindi, Spanish, French, German, Japanese)

The project consists of two main components:
- **Backend**: A Flask REST API that handles transcript extraction, embedding, and RAG chain processing
- **Frontend**: A Chrome extension UI for user interaction with settings management

---

## ✨ Features

| Icon | Feature | Description |
|------|---------|-------------|
| 🎬 | **YouTube Transcript Extraction** | Automatically fetches transcripts from YouTube videos using youtube-transcript-api |
| 🤖 | **AI-Powered Q&A** | Uses Google Generative AI (Gemini) for intelligent responses |
| 📚 | **RAG Pipeline** | Implements Retrieval-Augmented Generation using LangChain and FAISS vector search |
| 🌍 | **Multi-language Support** | Supports 6 different languages for transcripts (EN, HI, ES, FR, DE, JA) |
| 💾 | **In-memory Caching** | Efficiently caches embeddings and chains for improved performance |
| 🔐 | **Secure API Keys** | Stores Google and OpenAI API keys locally in the extension storage |
| 🎨 | **Clean UI** | Intuitive chat interface with language selector and message history |
| ⚡ | **CORS Support** | Cross-origin requests enabled for seamless extension-backend communication |

---

## 📁 Project Structure

```
YT-RAG-EXTENSION/
│
├── backend/                          # Flask REST API Server
│   ├── app.py                        # Main Flask application with RAG pipeline
│   ├── requirements.txt              # Python dependencies
│   └── __pycache__/                  # Python cache (auto-generated)
│
├── frontend/                         # Chrome Extension Files
│   ├── manifest.json                 # Extension configuration and permissions
│   ├── popup.html                    # Main chat interface UI
│   ├── popup.js                      # Popup interaction logic
│   ├── options.html                  # API key settings page
│   ├── options.js                    # Settings management
│   └── style.css                     # Styling for UI
│
└── README.md                         # This file

```

### 🔙 Backend (`backend/`)

| File | Purpose | Tech Stack |
|------|---------|-----------|
| `app.py` | Core Flask application implementing RAG pipeline, video transcript fetching, and API endpoints | ![Python](https://img.shields.io/badge/Python-3.9+-blue?style=flat-square) ![Flask](https://img.shields.io/badge/Flask-green?style=flat-square) |
| `requirements.txt` | Python package dependencies | ![Pip](https://img.shields.io/badge/Pip-Packages-blue?style=flat-square) |

**🔌 Key Endpoints:**
- `POST /load_video`: Accepts YouTube URL, extracts transcript, creates embeddings
- `POST /chat`: Processes user questions against the video transcript using RAG

### 🎨 Frontend (`frontend/`)

| File | Purpose | Tech Stack |
|------|---------|-----------|
| `manifest.json` | Chrome extension manifest with permissions and entry points | ![JSON](https://img.shields.io/badge/Manifest%20V3-blue?style=flat-square) |
| `popup.html` | Chat interface with language selector and message history | ![HTML](https://img.shields.io/badge/HTML5-orange?style=flat-square&logo=html5) |
| `popup.js` | Handles extension popup interactions and API communication | ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript) |
| `options.html` | Settings page for storing API keys | ![HTML](https://img.shields.io/badge/HTML5-orange?style=flat-square&logo=html5) |
| `options.js` | Manages API key storage and retrieval | ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript) |
| `style.css` | Styling for popup and options pages | ![CSS](https://img.shields.io/badge/CSS3-blue?style=flat-square&logo=css3) |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Download |
|-------------|---------|----------|
| 🐍 **Python** | 3.9+ | [Download](https://www.python.org/downloads/) |
| 📦 **pip** | Latest | Comes with Python |
| 🌐 **Google Chrome** | Latest | [Download](https://www.google.com/chrome/) |
| 🔧 **Git** | Latest | [Download](https://git-scm.com/) (Optional) |

### Required API Keys

| API | Purpose | Get Key |
|-----|---------|---------|
| 🔑 **Google API Key** | Google Generative AI (Gemini) | [Get Key](https://makersuite.google.com/app/apikey) |
| 🔓 **OpenAI API Key** | Embeddings & LLM operations | [Get Key](https://platform.openai.com/api-keys) |

---

## 🚀 Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/git-tarik/YT-RAG-EXTENSION.git
cd YT-RAG-EXTENSION
```

Or download the ZIP file and extract it.

### Step 2: Set Up the Backend

#### 2.1 Navigate to backend directory
```bash
cd backend
```

#### 2.2 Create a virtual environment (recommended)

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2.3 Install Python dependencies
```bash
pip install -r requirements.txt
```

**🔧 Dependencies:**

| Package | Purpose | Badge |
|---------|---------|-------|
| **Flask** | Web framework for REST API | ![Flask](https://img.shields.io/badge/Flask-2.0+-green?style=flat-square&logo=flask) |
| **Flask-Cors** | Cross-origin resource sharing | ![CORS](https://img.shields.io/badge/CORS-Enabled-blue?style=flat-square) |
| **python-dotenv** | Environment variable management | ![Env](https://img.shields.io/badge/.env-Config-blue?style=flat-square) |
| **langchain** | LLM orchestration framework | ![LangChain](https://img.shields.io/badge/LangChain-AI%20Framework-orange?style=flat-square) |
| **langchain-community** | Community integrations for LangChain | ![Community](https://img.shields.io/badge/Community-Integrations-orange?style=flat-square) |
| **langchain-openai** | OpenAI integration | ![OpenAI](https://img.shields.io/badge/OpenAI-LLM-red?style=flat-square) |
| **langchain-google-genai** | Google Generative AI integration | ![Google](https://img.shields.io/badge/Google%20Gemini-AI-blue?style=flat-square&logo=google) |
| **faiss-cpu** | Vector similarity search | ![FAISS](https://img.shields.io/badge/FAISS-Vector%20DB-red?style=flat-square) |
| **youtube-transcript-api** | YouTube transcript extraction | ![YouTube](https://img.shields.io/badge/YouTube-Transcripts-red?style=flat-square&logo=youtube) |

#### 2.4 Run the Flask server

```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

✅ **Backend is ready!** Keep this terminal open.

### Step 3: Load the Extension in Chrome and Configure API Keys

#### 3.1 Open Chrome Extensions Page
1. Open Google Chrome
2. Go to: `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)

#### 3.2 Load the Extension
1. Click **"Load unpacked"**
2. Navigate to your project folder: `YT-RAG-EXTENSION/frontend/`
3. Click **"Select Folder"**

✅ **Extension is loaded!** You should see "YT-CHAT-AI" in your extensions.

#### 3.3 Configure API Keys in the Extension

1. Click the **YT-CHAT-AI** extension icon in Chrome toolbar
2. Click the **options** or **settings** button to open the options page
3. Enter your API keys:
   - **Google API Key** - Required for Google Generative AI (Gemini)
   - **OpenAI API Key** - Required for embeddings
4. Click **"Save Keys"**
5. Keys are stored locally in the extension's storage

✅ **You're ready to use the extension!**

---

## ⚙️ Configuration

### API Keys in Extension

The extension stores API keys in Chrome's local storage. Keys are saved in the options page and retrieved automatically when needed.

### Backend Configuration

The backend reads environment variables from a `.env` file. Create one in the `backend/` directory:

```env
GOOGLE_API_KEY=sk-xxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxx
```

### Supported Languages for Transcripts

The extension supports transcripts in:
- English
- Hindi
- Spanish
- French
- German
- Japanese

---

## 🐛 Troubleshooting

### Error: OpenMP Runtime Initialization Error

**Error Message:**
```
OMP: Error #15: Initializing libomp140.x86_64.dll, but found libiomp5md.dll already initialized.
OMP: Hint This means that multiple copies of the OpenMP runtime have been linked into the program...
```

**Solution:**

This error occurs when multiple OpenMP libraries are loaded simultaneously. Set the environment variable to bypass the check:

**On Windows (PowerShell):**
```powershell
$env:KMP_DUPLICATE_LIB_OK='TRUE'
python app.py
```

**On Windows (Command Prompt):**
```cmd
set KMP_DUPLICATE_LIB_OK=TRUE
python app.py
```

**On macOS/Linux:**
```bash
export KMP_DUPLICATE_LIB_OK=TRUE
python app.py
```

**Permanent Solution (Add to .env):**

Add to your `backend/.env` file:
```env
KMP_DUPLICATE_LIB_OK=TRUE
```

Then modify your startup script to load this automatically.

### Issue: "Cannot GET /load_video"

**Solution:** 
- Ensure Flask server is running (`python app.py`)
- Check that the extension is connecting to `http://127.0.0.1:5000`
- Verify CORS is enabled (it should be by default)

### Issue: Extension Cannot Find Backend

**Solution:**
- Ensure backend Flask server is running
- Check browser console for errors (Right-click → Inspect → Console)
- Verify the backend URL in extension matches your Flask server URL

### Issue: API Key Not Working

**Solution:**
- Verify your API keys are valid
- Check API key quotas in Google Cloud Console and OpenAI Dashboard
- Ensure the API keys are properly saved in extension options

### Issue: Transcript Not Found

**Solution:**
- Ensure the YouTube video has captions available
- Check if the video is available in your region
- Try with a different language selection

---

## 💡 Usage

### Basic Workflow

1. **Visit a YouTube video** in Chrome
2. **Click the YT-CHAT-AI extension icon**
3. **Select desired language** for transcript extraction
4. **Click "Start Chat"**
5. **Ask questions** about the video content
6. **Get AI-powered answers** based on the transcript

### Example Questions

- "What is the main topic of this video?"
- "Summarize the key points"
- "What techniques were discussed?"
- "Who are the speakers mentioned?"

---

## 📝 Notes

- The extension requires an active backend server to function
- Transcripts are processed only when "Start Chat" is clicked
- All API requests are routed through the backend for security
- The RAG chain caches embeddings for performance optimization

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 📧 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Happy chatting with your YouTube videos! 🚀**
