
# Medi Milo – AI Clinical Decision-Support Assistant

> AI-powered Retrieval-Augmented Generation (RAG) application designed to help qualified healthcare professionals rapidly retrieve and understand clinical guidance during patient consultations.

🌐 **Live Application:** https://www.medimilo.com

---

## Overview

Medi Milo is an AI-powered clinical decision-support application built using **Next.js**, **TypeScript**, **OpenAI**, **Firebase**, and a **Retrieval-Augmented Generation (RAG)** architecture.

Rather than relying solely on a language model, Medi Milo retrieves relevant information from a curated medical knowledge base before generating a response. This approach helps ground responses in trusted clinical guidance and reduces the likelihood of hallucinated or unsupported answers.

The application is designed to support clinicians by making relevant guidance easier to access during consultations. It is **not** intended to replace professional judgement or serve as an autonomous diagnostic system.

---

# Key Features

- 🤖 AI-powered clinical decision-support assistant
- 📚 Retrieval-Augmented Generation (RAG)
- 🔍 Semantic search across embedded PDF knowledge base
- 📄 Automatic document categorisation for Derbyshire guidance
- 🇬🇧 Derbyshire and National guidance modes
- 💬 Conversational chat interface with context awareness
- 📝 Markdown rendering (tables, lists, links, formatting)
- 🖼️ Clinical image upload and AI-assisted image analysis
- 🔒 Password-protected application
- 🛡️ Middleware-protected API routes
- 🌙 Light & Dark mode
- 📱 Responsive interface
- ⚡ Next.js App Router architecture
- ☁️ Server-side OpenAI integration

---

# Architecture

Medi Milo uses a Retrieval-Augmented Generation workflow.

```text
User Question
      │
      ▼
Guidance Selection
(Derbyshire / National)
      │
      ▼
Semantic Search
      │
      ▼
Relevant Document Chunks
      │
      ▼
OpenAI GPT Model
      │
      ▼
Grounded Clinical Response
```

By retrieving relevant source material before calling the language model, responses remain grounded in trusted documentation rather than relying solely on model knowledge.

---

# Application Workflow

## Derbyshire Mode

1. User submits a question.
2. The question is categorised.
3. Relevant Derbyshire guidance is retrieved.
4. Retrieved context is supplied to OpenAI.
5. The grounded response is returned to the user.

## National Mode

Questions are sent through a separate national guidance workflow, allowing the application to distinguish between local and national clinical guidance.

## Image Analysis

Users can upload PNG or JPEG images (maximum 8 MB).

Images are sent securely to the backend where they are analysed before the generated response is returned to the conversation.

---

# Technology Stack

## Frontend

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide React

## Backend

- Next.js Route Handlers
- OpenAI API
- Firebase

## AI

- OpenAI GPT models
- Retrieval-Augmented Generation (RAG)
- Document embeddings
- Semantic search
- PDF knowledge base

---

# Security

The application uses server-side authentication.

Authentication is implemented using:

- shared application password
- HttpOnly authentication cookies
- signed session tokens
- Next.js middleware
- protected API routes

Unauthenticated users cannot access:

- the main chat interface
- `/api/pdf-chat`
- `/api/pdf-category`
- `/api/chat-national`
- `/api/image-diagnose`

Protected API requests return:

```http
401 Unauthorized
```

This prevents bypassing the UI and directly calling the backend endpoints.

---

# Clinical Safety

Medi Milo is intended for **qualified healthcare professionals**.

The application includes a mandatory clinical acknowledgement requiring users to confirm that:

- they are a qualified healthcare professional;
- they will not enter patient identifiable information;
- they understand the application provides decision support only.

The application supports clinical reasoning but does **not** replace:

- clinical assessment
- professional judgement
- source guidance
- prescribing checks
- referral criteria
- safeguarding procedures

Responsibility for patient care always remains with the treating clinician.

---

# Repository Structure

```text
app/
├── api/
├── login/
├── page.tsx

components/
lib/
public/
middleware.ts
README.md
```

---

# Environment Variables

```env
OPENAI_API_KEY=your-openai-key

APP_PASSWORD=your-password
AUTH_SECRET=your-long-random-secret

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Generate a secure authentication secret with:

```bash
openssl rand -hex 32
```

Do **not** expose authentication secrets using the `NEXT_PUBLIC_` prefix.

---

# Local Development

```bash
git clone https://github.com/aoun-rizvi/chatbot-web-pdf.git
cd chatbot-web-pdf

npm install
```

Create `.env.local` with the required environment variables.

Start the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

Unauthenticated users are redirected to:

```
/login
```

---

# Production Deployment

The application is designed for deployment on Vercel.

Production deployments should configure:

- OPENAI_API_KEY
- APP_PASSWORD
- AUTH_SECRET
- Firebase configuration

through the hosting provider's environment-variable management system rather than committing secrets to the repository.

---

# Example Questions

- When should eczema be referred to secondary care?
- How should chronic diarrhoea be investigated?
- What is the management of subclinical hypothyroidism in heart failure?
- Differential diagnosis for chest pain.
- Recommended treatment for bacterial pneumonia.

---

# Current Capabilities

- AI clinical assistant
- RAG-powered document retrieval
- Semantic search
- Derbyshire and National guidance
- Context-aware conversations
- Image analysis
- Password-protected access
- Protected backend APIs
- Markdown responses
- Clinical safety acknowledgement
- Responsive UI
- Light and dark themes

---

# Disclaimer

Medi Milo is a clinical decision-support tool.

Although responses are grounded in trusted medical guidance wherever possible, no guarantee is made regarding completeness, accuracy or currency.

The application must not be used as the sole basis for diagnosis, prescribing or patient management decisions.

Users remain responsible for ensuring that clinical decisions are appropriate for the individual patient and aligned with current national guidance, local policies and professional standards.
