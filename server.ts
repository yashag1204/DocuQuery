import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set. AI features will not work.");
  }

  app.use(express.json({ limit: '50mb' }));

  // Multer for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/process-document", upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let text = "";
      if (req.file.mimetype === 'application/pdf') {
        const pdfImport: any = await import('pdf-parse');
        const PDFParse = pdfImport.PDFParse;
        
        if (typeof PDFParse !== 'function') {
          console.error("pdf-parse PDFParse class not found:", pdfImport);
          throw new Error("PDF parser initialization failed");
        }

        const parser = new PDFParse({ data: req.file.buffer });
        const data = await parser.getText();
        text = data.text;
      } else {
        text = req.file.buffer.toString('utf-8');
      }

      // Simple chunking logic: split by double newlines or large blocks
      const chunks = text.split(/\n\s*\n/).filter(c => c.trim().length > 20);
      
      res.json({ 
        filename: req.file.originalname,
        chunks: chunks.slice(0, 50) // Limit for demo stability
      });
    } catch (error) {
      console.error("Error processing document:", error);
      res.status(500).json({ error: "Failed to process document" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: process.cwd(),
    });
    app.use(vite.middlewares);
    console.log("Vite middleware ready.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
