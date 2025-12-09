import { useState } from 'react';
import './UploadResume.css';

function UploadResume({ onTextExtracted }) {
  const [fileName, setFileName] = useState('');
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    // For demo: simple text extraction
    // In production, this would call a backend API for PDF parsing
    const reader = new FileReader();
    reader.onload = (event) => {
      onTextExtracted(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        onTextExtracted(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handlePasteText = () => {
    if (pastedText.trim()) {
      onTextExtracted(pastedText);
      setFileName('Pasted Resume');
    }
  };

  const handleClear = () => {
    setFileName('');
    setPastedText('');
    onTextExtracted('');
  };

  return (
    <div className="upload-resume">
      <div className="toggle-buttons">
        <button
          className={!pasteMode ? 'toggle-btn active' : 'toggle-btn'}
          onClick={() => setPasteMode(false)}
        >
          📁 Upload File
        </button>
        <button
          className={pasteMode ? 'toggle-btn active' : 'toggle-btn'}
          onClick={() => setPasteMode(true)}
        >
          📝 Paste Text
        </button>
      </div>

      {!pasteMode ? (
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label htmlFor="resume-upload" className="upload-label">
            <div className="upload-icon">📄</div>
            <p className="upload-text">
              {fileName ? `Selected: ${fileName}` : 'Click to upload or drag & drop'}
            </p>
            <p className="upload-hint">
              Supports: PDF, DOC, DOCX, TXT
            </p>
          </label>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="paste-area">
          <textarea
            className="paste-textarea"
            placeholder="Paste your resume text here...\n\nInclude:\n• Contact Information\n• Work Experience\n• Education\n• Skills\n• Projects"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={12}
          />
          <button
            className="paste-submit-btn"
            onClick={handlePasteText}
            disabled={!pastedText.trim()}
          >
            ✅ Use This Resume
          </button>
        </div>
      )}

      {fileName && (
        <button className="clear-btn" onClick={handleClear}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}

export default UploadResume;
