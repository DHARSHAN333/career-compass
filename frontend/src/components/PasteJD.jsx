import './PasteJD.css';

function PasteJD({ value, onChange }) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="paste-jd">
      <textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here...\n\nInclude:\n• Job Title\n• Required Skills\n• Experience Level\n• Responsibilities\n• Qualifications\n• Preferred Skills"
        rows={15}
        className="jd-textarea"
      />
      {value && (
        <button className="clear-jd-btn" onClick={handleClear}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}

export default PasteJD;
