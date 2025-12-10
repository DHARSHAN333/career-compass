function PasteJD({ value, onChange }) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="relative">
      <textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here...\n\nInclude:\n• Job Title\n• Required Skills\n• Experience Level\n• Responsibilities\n• Qualifications\n• Preferred Skills"
        rows={15}
        className="textarea-field w-full"
      />
      {value && (
        <button 
          className="absolute top-3 right-3 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors"
          onClick={handleClear}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}

export default PasteJD;
