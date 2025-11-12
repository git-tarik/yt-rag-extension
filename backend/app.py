import os
import re
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda, RunnableParallel, RunnablePassthrough
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
from langchain_google_genai import ChatGoogleGenerativeAI

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the extension

# --- In-memory Storage ---
rag_chain_store = {}
general_chat_chain = None

# --- Helper Functions ---
def get_video_id(url: str) -> str | None:
    if not url:
        return None
    regex = r"(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})"
    match = re.search(regex, url)
    if match:
        return match.group(1)
    return None

# ===================================================================
#  UPDATED FUNCTION (This is the fix)
# ===================================================================
def get_transcript(video_id: str, language: str = 'en') -> str | None:
    """
    Fetches and formats the transcript using the .fetch() method
    with a fallback to the default language.
    """
    try:
        # Try the specified language first
        print(f"Attempting to fetch transcript for {video_id} with language '{language}'...")
        fetched_transcript = YouTubeTranscriptApi().fetch(video_id, languages=[language])
        transcript_list = fetched_transcript.to_raw_data()
        transcript = " ".join(chunk["text"] for chunk in transcript_list)
        print("✅ Transcript fetched successfully.")
        return transcript
    except TranscriptsDisabled:
        print(f"❌ Transcripts are disabled for this video (ID: {video_id}).")
        return None
    except Exception as e:
        # If the specified language fails (e.g., 'en' not found)
        print(f"Could not retrieve transcript for language '{language}'. Error: {e}")
        print("Attempting fallback to default language...")
        try:
            # Fallback to default (often auto-generated)
            fetched_transcript_fallback = YouTubeTranscriptApi().fetch(video_id)
            transcript_list_fallback = fetched_transcript_fallback.to_raw_data()
            transcript_fallback = " ".join(chunk["text"] for chunk in transcript_list_fallback)
            print("✅ Fallback transcript fetched successfully.")
            return transcript_fallback
        except Exception as fallback_e:
            print(f"❌ Fallback to default language also failed. Error: {fallback_e}")
            return None
# ===================================================================
#  END OF UPDATED FUNCTION
# ===================================================================

def parse_auth_header(header: str):
    """Parses the custom 'Authorization' header."""
    if not header:
        return None, None
    
    try:
        # Expecting format: "Google <google_key>, OpenAI <openai_key>"
        google_part, openai_part = header.split(',')
        google_key = google_part.strip().split(' ')[1]
        openai_key = openai_part.strip().split(' ')[1]
        return google_key, openai_key
    except Exception as e:
        print(f"Error parsing auth header: {e}")
        return None, None

# --- RAG & Chat Chain Creation ---
def get_general_chat_chain(google_api_key: str):
    """Creates a simple, non-RAG chain for general conversation."""
    global general_chat_chain
    if general_chat_chain:
        return general_chat_chain

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.7,
        google_api_key=google_api_key
    )
    prompt = PromptTemplate.from_template("You are a helpful assistant. Answer the following question: {question}")
    
    general_chat_chain = prompt | llm | StrOutputParser()
    return general_chat_chain

def create_rag_chain(transcript: str, google_api_key: str, openai_api_key: str):
    """Creates a RAG chain with OpenAI embeddings + Google Gemini LLM."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_splitter.create_documents([transcript])
    
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small", 
        openai_api_key=openai_api_key
    )
    
    vector_store = FAISS.from_documents(docs, embeddings)
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 4})

    template = """
    You are a helpful assistant.
    Answer the question based ONLY on the provided transcript context.
    If the context is insufficient to answer the question, just say:
    "I don't know based on the provided transcript."

    CONTEXT:
    {context}

    QUESTION:
    {question}
    """
    prompt = PromptTemplate.from_template(template)

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
        google_api_key=google_api_key
    )

    def format_docs(retrieved_docs):
        return "\n\n".join(doc.page_content for doc in retrieved_docs)

    rag_chain = (
        RunnableParallel(
            context=retriever | RunnableLambda(format_docs),
            question=RunnablePassthrough()
        )
        | prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain

# --- API Endpoints ---
@app.route('/load_video', methods=['POST'])
def load_video():
    data = request.get_json()
    url = data.get('url')
    lang = data.get('lang', 'en')

    auth_header = request.headers.get('Authorization')
    google_key, openai_key = parse_auth_header(auth_header)

    if not all([url, google_key, openai_key]):
        return jsonify({"error": "Missing URL or API keys"}), 400

    video_id = get_video_id(url)
    if not video_id:
        return jsonify({"error": "Invalid YouTube URL"}), 400

    transcript = get_transcript(video_id, lang)
    if not transcript:
        return jsonify({"error": "Could not retrieve transcript"}), 400

    try:
        rag_chain = create_rag_chain(transcript, google_key, openai_key)
        rag_chain_store[video_id] = rag_chain
        return jsonify({"status": "loaded", "video_id": video_id}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to create RAG chain: {e}"}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    question = data.get('question')
    video_id = data.get('video_id')

    auth_header = request.headers.get('Authorization')
    google_key, openai_key = parse_auth_header(auth_header)

    if not all([question, video_id, google_key, openai_key]):
        return jsonify({"error": "Missing question, video_id, or API keys"}), 400

    rag_chain = rag_chain_store.get(video_id)
    if not rag_chain:
        return jsonify({"error": "Video not loaded. Please load the video first."}, 404)

    try:
        # First, try the RAG chain
        answer = rag_chain.invoke(question)

        # Check if the RAG chain was unable to answer
        if "i don't know based on the provided transcript" in answer.lower():
            # If so, fall back to the general chat chain
            general_chain = get_general_chat_chain(google_key)
            final_answer = general_chain.invoke({"question": question})
        else:
            final_answer = answer
            
        return jsonify({"answer": final_answer})

    except Exception as e:
        return jsonify({"error": f"Error during chat processing: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)