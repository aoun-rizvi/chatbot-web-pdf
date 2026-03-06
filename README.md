# Medi Milo – AI Medical Assistant (RAG Application)

Medi Milo is an **AI-powered medical assistant** designed to help doctors quickly retrieve and understand medical information when diagnosing patients.

The application uses a **Retrieval-Augmented Generation (RAG)** architecture that combines a curated knowledge base with **OpenAI language models** to generate accurate, contextual responses to medical questions.

Users can ask questions related to patient symptoms, medical conditions, or treatments, and the system retrieves relevant information from trusted sources before generating structured answers.

🌐 **Live Application:**  
https://www.medimilo.com

---

# Overview

Healthcare professionals often need quick access to medical knowledge while treating patients. Searching through large documentation or medical PDFs can be time-consuming.

Medi Milo solves this by combining:

- Document retrieval
- Semantic search
- Large language models

The system retrieves the most relevant medical information and uses an LLM to generate a **clear, contextual response grounded in trusted medical sources**.

---

# Architecture

This project uses a **Retrieval-Augmented Generation (RAG)** architecture.

High-level workflow:

1. User submits a question
2. The system retrieves relevant content from the knowledge base
3. Relevant document chunks are sent to the LLM as context
4. OpenAI generates a response grounded in the retrieved data
5. The response is returned to the user

User Question
↓
Semantic Search / Retrieval
↓
Relevant Document Chunks
↓
OpenAI LLM
↓
Contextual Response

This approach reduces hallucinations and improves the reliability of answers.

---

# Tech Stack

## Frontend
- Next.js
- TypeScript
- TailwindCSS

## Backend
- Next.js API Routes

## AI
- OpenAI API (GPT models)

## Database
- Firebase

## Retrieval
- Document embeddings
- Semantic search over PDF knowledge base

---

# Features

- AI medical assistant for clinical questions
- Retrieval-Augmented Generation (RAG)
- PDF knowledge base ingestion
- Semantic search over medical documents
- Context-aware AI responses
- Clean chat interface
- Server-side API integration with OpenAI
- Secure environment variable configuration

---

# Example Use Cases

Doctors can ask questions such as:

- What are possible causes of chronic cough?
- How is type 2 diabetes diagnosed?
- Recommended treatment for bacterial pneumonia?
- Differential diagnosis for chest pain?

The assistant retrieves relevant knowledge and generates contextual answers.

---

# Repository Structure
chatbot-web-pdf/
│
├── app/ # Next.js app directory
├── components/ # UI components
├── lib/ # Utility and helper functions
├── pages/api/ # API endpoints
├── public/ # Static assets
├── scripts/ # Data ingestion / document processing
├── styles/ # Styling
└── README.md

---

# Local Development

## 1. Clone the repository

```bash
git clone https://github.com/Web-Knitters/chatbot-web-pdf.git
cd chatbot-web-pdf
```

## 2. Install dependencies

```npm install```

## 3. Create environment variables

```
OPENAI_API_KEY=your_openai_key
FIREBASE_API_KEY=your_key
FIREBASE_PROJECT_ID=your_project_id
```

## 4. Run the development server

```npm run dev```

## 5. Open application

```http://localhost:3000```
