import { useState } from 'react';

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
    <div>
      <div className="flex gap-2 mb-4">
        <button
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
            !pasteMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setPasteMode(false)}
        >
          📁 Upload File
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
            pasteMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setPasteMode(true)}
        >
          📝 Paste Text
        </button>
      </div>

      {!pasteMode ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label htmlFor="resume-upload" className="cursor-pointer block">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {fileName ? `Selected: ${fileName}` : 'Click to upload or drag & drop'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Supports: PDF, DOC, DOCX, TXT
            </p>
          </label>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div>
          <textarea
            className="textarea-field w-full mb-4"
            placeholder="Paste your resume text here...\n\nInclude:\n• Contact Information\n• Work Experience\n• Education\n• Skills\n• Projects"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={12}
          />
          <button
            className="btn-success w-full"
            onClick={handlePasteText}
            disabled={!pastedText.trim()}
          >
            ✅ Use This Resume
          </button>
        </div>
      )}

      {fileName && (
        <button 
          className="mt-4 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          onClick={handleClear}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}

export default UploadResume;
