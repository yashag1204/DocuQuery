import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  FileText, 
  Database, 
  Brain, 
  Loader2, 
  ChevronRight,
  Shield,
  Zap,
  Cpu,
  Menu,
  X,
  History,
  Settings,
  Info,
  ArrowRight,
  Sparkles,
  Layers,
  FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateEmbedding, searchChunks, generateAnswer, type DocumentChunk } from './services/ai';

import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for pdfjs-dist using unpkg (more reliable for latest versions)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [documents, setDocuments] = useState<DocumentChunk[]>([]);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<DocumentChunk[]>([]);
  const [status, setStatus] = useState<string>('System Ready');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + "\n\n";
    }
    
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check for duplicates
    if (documents.some(doc => doc.metadata.source === file.name)) {
      setStatus(`"${file.name}" is already indexed.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setStatus(`Extracting text from ${file.name}...`);
    
    try {
      let text = "";
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        text = await file.text();
      }

      // Simple chunking logic: split by double newlines or large blocks
      const chunks = text.split(/\n\s*\n/).filter(c => c.trim().length > 20).slice(0, 50);
      
      setStatus(`Indexing ${chunks.length} segments...`);
      
      const processedChunks: DocumentChunk[] = [];
      const batchSize = 5; // Process in small batches to avoid lag and rate limits
      
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (chunkText, indexWithinBatch) => {
            const globalIndex = i + indexWithinBatch;
            const embedding = await generateEmbedding(chunkText);
            return {
              text: chunkText,
              embedding,
              metadata: { 
                source: file.name, 
                index: globalIndex,
                id: `${file.name}-${globalIndex}-${Date.now()}`
              }
            };
          })
        );
        processedChunks.push(...batchResults);
        const progress = Math.round(((i + batch.length) / chunks.length) * 100);
        setUploadProgress(progress);
        setStatus(`Indexing ${file.name}: ${progress}% complete`);
      }

      setDocuments(prev => [...prev, ...processedChunks]);
      setStatus(`Indexed ${file.name} successfully.`);
    } catch (error) {
      console.error(error);
      setStatus('Error processing document.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || documents.length === 0) return;

    setIsSearching(true);
    setAnswer(null);
    setStatus('Searching vector space...');

    try {
      const results = await searchChunks(query, documents);
      setSources(results);
      
      setStatus('Synthesizing answer...');
      const context = results.map(r => r.text).join('\n\n');
      const aiAnswer = await generateAnswer(query, context);
      setAnswer(aiAnswer || 'No answer generated.');
      setStatus('Search complete.');
    } catch (error) {
      console.error(error);
      setStatus('Search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const uniqueDocs = Array.from(new Set(documents.map(d => d.metadata.source)));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 flex overflow-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-800/20 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar - Desktop */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="hidden lg:flex flex-col border-r border-white/5 bg-slate-900/50 backdrop-blur-2xl relative z-20 overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Docu<span className="text-indigo-400">Query</span></span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3 px-2">
              <h2 className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.2em]">Knowledge Base</h2>
              <span className="text-[10px] font-mono text-slate-500">{uniqueDocs.length} Docs</span>
            </div>
            
            <div className="space-y-1">
              {uniqueDocs.length > 0 ? (
                uniqueDocs.map((doc, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default"
                  >
                    <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-sm text-slate-300 truncate">{doc}</span>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl">
                  <p className="text-xs text-slate-500">No documents indexed yet.</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold">Pro Tip</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload multiple PDFs to build a comprehensive knowledge graph for cross-document analysis.
            </p>
          </section>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="space-y-3">
            {isUploading && (
              <div className="px-1">
                <div className="flex justify-between text-[10px] font-mono text-indigo-400 mb-1">
                  <span>INDEXING PROGRESS</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              </div>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/10 relative overflow-hidden"
            >
              {isUploading && (
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: `${uploadProgress - 100}%` }}
                  className="absolute inset-0 bg-indigo-400/20 pointer-events-none"
                />
              )}
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span className="relative z-10">{isUploading ? `Indexing... ${uploadProgress}%` : 'Upload Document'}</span>
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept=".pdf,.txt"
          />
        </div>
      </motion.aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-[80%] h-full bg-slate-900 p-6 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <FileSearch className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-display font-bold text-lg">DocuQuery</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6">
                <section>
                  <h2 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-4">Documents</h2>
                  <div className="space-y-2">
                    {uniqueDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300 truncate">{doc}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-indigo-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload New
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg"
            >
              <Menu className="w-6 h-6 text-slate-400" />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500">
              <Layers className="w-3 h-3" />
              <span>V2.4.5-STABLE</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider">{status}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Hero Section */}
            {!answer && !isSearching && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 py-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  AI-Powered Semantic Intelligence
                </div>
                <h1 className="text-4xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1]">
                  Query your documents with <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Precision Intelligence.</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Upload your PDFs and ask complex questions. Our vector-engine retrieves the exact context to provide accurate, synthesized answers.
                </p>
              </motion.div>
            )}

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-indigo-800 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-focus-within:opacity-50" />
              <div className="relative flex items-center bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="pl-6">
                  <Search className="w-6 h-6 text-slate-500" />
                </div>
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about your documents..."
                  className="w-full bg-transparent py-6 px-4 text-lg lg:text-xl focus:outline-none placeholder:text-slate-600"
                />
                <div className="pr-4">
                  <button 
                    type="submit"
                    disabled={isSearching || documents.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <span>Search</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Results Area */}
            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 flex flex-col items-center gap-6"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <Brain className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-slate-300">Analyzing Knowledge Base</p>
                    <p className="text-sm text-slate-500 mt-1">Retrieving semantic vectors and synthesizing response...</p>
                  </div>
                </motion.div>
              ) : answer ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12 pb-20"
                >
                  {/* AI Answer Card */}
                  <div className="glass rounded-[2rem] p-8 lg:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                        <Brain className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold">Synthesized Analysis</h2>
                        <p className="text-xs font-mono text-slate-500">GENERATED BY DOCUQUERY AI</p>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg font-light">
                      {answer.split('\n').map((para, i) => (
                        <p key={i} className="mb-4 last:mb-0">{para}</p>
                      ))}
                    </div>
                  </div>

                  {/* Sources Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-[0.2em]">Source Evidence</h3>
                      <span className="text-xs text-slate-500">{sources.length} Contextual Chunks</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sources.map((source, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="glass glass-hover rounded-2xl p-6"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-white/5 rounded-md flex items-center justify-center">
                              <FileText className="w-3 h-3 text-slate-400" />
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 truncate">{source.metadata.source}</span>
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed italic">
                            "{source.text}"
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
                  {[
                    { icon: Shield, title: "Secure Indexing", desc: "Your documents are processed locally and never stored on external servers." },
                    { icon: Zap, title: "Sub-second Search", desc: "High-performance vector retrieval powered by Endee Search kernels." },
                    { icon: Brain, title: "Neural Synthesis", desc: "Advanced LLM integration for human-like reasoning over your data." }
                  ].map((feature, i) => (
                    <div key={i} className="glass rounded-2xl p-6 space-y-4">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                        <feature.icon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h3 className="font-bold">{feature.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status Footer */}
        <footer className="h-12 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-indigo-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Vector Store: Active</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Cpu className="w-3 h-3 text-indigo-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Engine: Endee v1.3</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            © 2026 DOCUQUERY INTELLIGENCE
          </div>
        </footer>
      </main>
    </div>
  );
}
