import './Loader.css';

function Loader({ size = 'medium', text = 'Loading...' }) {
  return (
    <div className={`loader loader-${size}`}>
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
      <p className="loader-text">{text}</p>
    </div>
  );
}

export default Loader;
