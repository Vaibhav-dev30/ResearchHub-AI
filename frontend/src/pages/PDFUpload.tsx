import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Trash2, BrainCircuit, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api';

interface UploadedPaper {
  id: number;
  filename: string;
  title: string;
  created_at: string;
}

const PDFUpload = () => {
  const [papers, setPapers] = useState<UploadedPaper[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await api.get('/uploaded-papers');
      setPapers(res.data);
    } catch (err) {
      console.error('Failed to fetch papers', err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds 20MB limit.');
      return;
    }

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    // Simulate progress while uploading and processing (embeddings take time)
    const progressInterval = setInterval(() => {
      setUploadProgress(p => (p < 90 ? p + 5 : p));
    }, 500);

    try {
      await api.post('/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        fetchPapers();
      }, 800);
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      setError(err.response?.data?.detail || 'Failed to upload and process PDF.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/uploaded-papers/${id}`);
      fetchPapers();
    } catch (err) {
      console.error('Failed to delete paper', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BrainCircuit size={28} style={{ color: 'var(--primary-color)' }} />
          Knowledge Base (PDFs)
        </h1>
        <p style={{ color: 'var(--secondary-color)', marginTop: '0.5rem' }}>
          Upload research papers to chat with them semantically using vector embeddings.
        </p>
      </header>

      {/* Drag & Drop Zone */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--border-color)'}`,
          background: isDragging ? 'rgba(96,165,250,0.05)' : 'var(--panel-bg)',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{ width: '60%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1rem' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  style={{ height: '100%', background: 'var(--primary-color)' }}
                />
              </div>
              <p style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
                {uploadProgress < 100 ? 'Analyzing & generating embeddings...' : 'Complete!'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Upload size={48} style={{ color: 'var(--secondary-color)', margin: '0 auto 1rem', opacity: 0.7 }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Click or drag PDF to upload</h3>
              <p style={{ color: 'var(--secondary-color)', fontSize: '0.9rem' }}>
                Max 20MB. Document will be chunked and indexed automatically.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(248,113,113,0.1)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Uploaded Papers List */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        Indexed Documents
      </h2>
      
      {papers.length === 0 ? (
        <p style={{ color: 'var(--secondary-color)', textAlign: 'center', padding: '2rem', background: 'var(--panel-bg)', borderRadius: '12px' }}>
          No documents indexed yet. Upload a PDF to start chatting.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {papers.map((paper) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: 'var(--panel-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{paper.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                    Added {new Date(paper.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(paper.id)}
                className="btn btn-sm"
                style={{ background: 'transparent', color: 'var(--danger-color)' }}
                title="Delete Paper"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PDFUpload;
