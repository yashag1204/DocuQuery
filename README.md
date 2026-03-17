# DocuQuery 🧠📄

<div align="center">
  <img src="https://img.shields.io/badge/DocuQuery-v2.4.5--stable-indigo?style=for-the-badge&logo=ai" alt="Version" />
  <img src="https://img.shields.io/badge/Powered%20By-Endee%20Vector%20DB-emerald?style=for-the-badge&logo=database" alt="Powered By" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-blue?style=for-the-badge&logo=google-gemini" alt="AI" />
</div>

<br />

**DocuQuery** is an advanced, AI-powered document intelligence platform. It transforms static documents into interactive knowledge bases using **Retrieval-Augmented Generation (RAG)** and high-performance semantic vector search.

---

## 🚀 Core Capabilities

- **🧠 Neural Synthesis**: Advanced LLM integration that reasons over your data to provide human-like answers.
- **⚡ Sub-millisecond Retrieval**: Powered by the **Endee Search Engine** for lightning-fast similarity matching.
- **🛡️ Privacy-First Indexing**: Documents are processed with secure local indexing logic.
- **📱 Fluid Responsiveness**: A sleek, glassmorphism-inspired interface optimized for mobile, tablet, and desktop.
- **📁 Multi-Format Ingestion**: Seamlessly process and index PDF and TXT files.

---

## 🛠️ The Intelligence Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS 4, Framer Motion |
| **Backend** | Express.js, Multer |
| **Vector Engine** | Endee Vector Database |
| **AI Models** | Google Gemini (Embeddings & Synthesis) |

---

## 🧩 How It Works

```mermaid
graph LR
    A[Upload Doc] --> B[Text Extraction]
    B --> C[Semantic Chunking]
    C --> D[Vector Embedding]
    D --> E[(Endee Vector Store)]
    F[User Query] --> G[Vector Search]
    E --> G
    G --> H[Context Retrieval]
    H --> I[AI Synthesis]
    I --> J[Precise Answer]
```

1. **Ingestion**: Documents are parsed and split into semantic segments.
2. **Embedding**: Each segment is converted into a 768-dimensional vector.
3. **Retrieval**: When you ask a question, we find the most relevant segments in real-time.
4. **Synthesis**: The AI uses the retrieved context to generate a factual, grounded response.

---

## 🔗 Project Links

- **🌐 Live Demo**: [DocuQuery App](https://ais-pre-s3wpduxrw4wlpndyycwuln-587604723575.asia-east1.run.app)
- **💻 Repository**: [https://github.com/yashag1204/DocuQuery](https://github.com/yashag1204/DocuQuery)
- **📦 Endee Official**: [https://github.com/endee-io/endee](https://github.com/endee-io/endee)
- **🏢 Company**: [Startologic](https://www.startologic.com/)

---

<div align="center">
  <p>Built with ❤️ for high-performance semantic search.</p>
  <p>© 2026 DocuQuery Intelligence</p>
</div>
