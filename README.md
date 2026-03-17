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

### **Frontend**
- ⚛️ **React 19** - UI Component Architecture
- 🎨 **Tailwind CSS 4** - Utility-First Styling
- ✨ **Framer Motion** - Fluid Animations
- 🧩 **Lucide Icons** - Crisp SVG Iconography

### **Backend**
- 🟢 **Node.js / Express** - Server-Side Runtime
- 📂 **Multer** - File Upload Handling
- 📄 **PDF-Parse** - Document Extraction

### **AI & Vector Engine**
- 💎 **Google Gemini** - Embeddings & Synthesis
- ⚡ **Endee Vector DB** - High-Performance Retrieval

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

---

## 🏁 Getting Started

### **1. Prerequisites**
- Node.js (v18+)
- A Google Gemini API Key

### **2. Installation**
```bash
# Clone the repository
git clone https://github.com/yashag1204/DocuQuery.git

# Navigate to the project directory
cd DocuQuery

# Install dependencies
npm install
```

### **3. Configuration**
Create a `.env` file in the root directory and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

### **4. Run the Application**
```bash
# Start the development server
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🚀 Deployment to Netlify

DocuQuery is optimized for Netlify deployment. Since all document processing (including PDF parsing) now happens on the **client side**, the app is a pure Single Page Application (SPA).

### **1. Manual Deployment**
1. Run `npm run build`.
2. Drag and drop the `dist` folder into the Netlify dashboard.

### **2. Automated Deployment (GitHub)**
1. Push your code to GitHub.
2. Connect your repository to Netlify.
3. Use the following build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add your **Environment Variables** in the Netlify UI:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.

### **3. SPA Routing**
I have included a `netlify.toml` file in the repository. This ensures that Netlify handles React Router paths correctly by redirecting all requests to `index.html`.

---

## 🚀 Deployment to GitHub Pages

If you are seeing a **blank white screen** after deploying to GitHub Pages, follow these steps:

### **1. Fix the Base Path**
In `vite.config.ts`, ensure the `base` property is set to `'./'`. This ensures that assets are loaded correctly regardless of the subpath.
*(I have already updated this for you in the codebase)*.

### **2. Handle the Backend Limitation**
**Important**: GitHub Pages is a **static hosting service**. It does not support Node.js/Express backends. 
- The current app uses an Express server to parse PDFs. 
- On GitHub Pages, the "Upload" feature will fail because the `/api/process-document` endpoint won't exist.

**Solutions**:
1. **Use Vercel or Netlify**: These platforms support serverless functions and are better suited for full-stack apps.
2. **Client-Side Parsing**: (Recommended for GitHub Pages) Move the PDF parsing logic to the browser using a library like `pdfjs-dist`.

### **3. Deployment Steps**
1. Run `npm run build`.
2. Push the contents of the `dist` folder to your `gh-pages` branch.
3. In your GitHub Repository settings, set the source to the `gh-pages` branch.

---

## 🔗 Project Links

- **🌐 Live Demo**: [DocuQuery App](https://ais-pre-s3wpduxrw4wlpndyycwuln-587604723575.asia-east1.run.app)
- **💻 Repository**: [https://github.com/yashag1204/DocuQuery](https://github.com/yashag1204/DocuQuery)
- **📦 Endee Official**: [https://github.com/endee-io/endee](https://github.com/endee-io/endee)
- **🏢 Company**: [Startologic](https://www.startologic.com/)

> **Note on Live Demo**: If the link doesn't show the app, ensure you have clicked the **"Share"** button in AI Studio to publish your build.

---

<div align="center">
  <p>Built with ❤️ for high-performance semantic search.</p>
  <p>© 2026 DocuQuery Intelligence</p>
</div>
