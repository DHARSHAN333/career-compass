import { useState, useEffect } from 'react';
import styles from './Settings.module.css';

function Settings() {
  // State for AI Configuration
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [showApiKey, setShowApiKey] = useState(false);
  
  // State for User Preferences
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState('en');
  
  // State for Analysis Settings
  const [detailLevel, setDetailLevel] = useState('detailed');
  const [includeExamples, setIncludeExamples] = useState(true);
  const [priorityFocus, setPriorityFocus] = useState('balanced');
  
  // State for Data Management
  const [storageUsed, setStorageUsed] = useState(0);
  const [analysisCount, setAnalysisCount] = useState(0);
  
  // State for UI feedback
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('ai');

  // Apply theme function - defined before use
  const applyTheme = (selectedTheme) => {
    let appliedTheme = selectedTheme;
    
    if (selectedTheme === 'auto') {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      appliedTheme = prefersDark ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', appliedTheme);
    document.body.className = appliedTheme === 'dark' ? 'dark-mode' : 'light-mode';
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    calculateStorageUsed();
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Apply saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
  }, []);

  const loadSettings = () => {
    // AI Settings
    setApiKey(localStorage.getItem('openai_api_key') || '');
    setModel(localStorage.getItem('llm_model') || 'gpt-3.5-turbo');
    
    // User Preferences
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
    
    setNotifications(localStorage.getItem('notifications') !== 'false');
    setAutoSave(localStorage.getItem('autoSave') !== 'false');
    setLanguage(localStorage.getItem('language') || 'en');
    
    // Analysis Settings
    setDetailLevel(localStorage.getItem('detailLevel') || 'detailed');
    setIncludeExamples(localStorage.getItem('includeExamples') !== 'false');
    setPriorityFocus(localStorage.getItem('priorityFocus') || 'balanced');
    
    // Count analyses
    const count = parseInt(localStorage.getItem('analysisCount') || '0');
    setAnalysisCount(count);
  };

  const calculateStorageUsed = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    setStorageUsed((total / 1024).toFixed(2)); // Convert to KB
  };

  const handleSaveAI = () => {
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('llm_model', model);
    showSaveSuccess('AI settings saved!');
  };

  const handleSavePreferences = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('notifications', notifications.toString());
    localStorage.setItem('autoSave', autoSave.toString());
    localStorage.setItem('language', language);
    
    // Apply theme immediately
    applyTheme(theme);
    
    showSaveSuccess('Preferences saved!');
  };

  const handleSaveAnalysis = () => {
    localStorage.setItem('detailLevel', detailLevel);
    localStorage.setItem('includeExamples', includeExamples.toString());
    localStorage.setItem('priorityFocus', priorityFocus);
    showSaveSuccess('Analysis settings saved!');
  };

  const showSaveSuccess = (message) => {
    setSaveStatus(message);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
      sessionStorage.clear();
      localStorage.removeItem('analysisCount');
      setAnalysisCount(0);
      calculateStorageUsed();
      showSaveSuccess('History cleared!');
    }
  };

  const handleExportData = () => {
    const data = {
      settings: {
        ai: { model },
        preferences: { theme, notifications, autoSave, language },
        analysis: { detailLevel, includeExamples, priorityFocus }
      },
      stats: { analysisCount, storageUsed },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-compass-settings-${Date.now()}.json`;
    a.click();
    showSaveSuccess('Settings exported!');
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      // Clear only settings, not API keys or analysis data
      localStorage.removeItem('theme');
      localStorage.removeItem('notifications');
      localStorage.removeItem('autoSave');
      localStorage.removeItem('language');
      localStorage.removeItem('detailLevel');
      localStorage.removeItem('includeExamples');
      localStorage.removeItem('priorityFocus');
      loadSettings();
      showSaveSuccess('Settings reset to defaults!');
    }
  };

  return (
    <div className={styles.settings}>
      {/* Header */}
      <div className={styles.header}>
        <h1>⚙️ Settings</h1>
        <p className={styles.subtitle}>Customize your Career Compass experience</p>
      </div>

      {/* Save Status Toast */}
      {saveStatus && (
        <div className={styles.toast}>
          ✅ {saveStatus}
        </div>
      )}

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tab} ${activeTab === 'ai' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          🤖 AI Configuration
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'preferences' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          🎨 Preferences
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'analysis' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          📊 Analysis
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'data' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('data')}
        >
          💾 Data & Privacy
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'about' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('about')}
        >
          ℹ️ About
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* AI Configuration Tab */}
        {activeTab === 'ai' && (
          <div className={styles.section}>
            <h2>🤖 AI Configuration</h2>
            <p className={styles.sectionDesc}>
              Configure your AI model settings for personalized analysis
            </p>

            <div className={styles.card}>
              <div className={styles.formGroup}>
                <label htmlFor="apiKey">
                  <span className={styles.labelIcon}>🔑</span>
                  OpenAI API Key
                </label>
                <p className={styles.helpText}>
                  Optional: Add your API key for enhanced AI responses. Without it, the system uses intelligent fallback responses.
                </p>
                <div className={styles.inputWrapper}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className={styles.toggleBtn}
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="model">
                  <span className={styles.labelIcon}>🧠</span>
                  AI Model
                </label>
                <p className={styles.helpText}>
                  Choose the AI model for analysis and chat responses
                </p>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={styles.select}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast, Cost-effective)</option>
                  <option value="gpt-4">GPT-4 (Most Accurate)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo (Balanced)</option>
                  <option value="gpt-4o">GPT-4o (Latest)</option>
                </select>
              </div>

              <button onClick={handleSaveAI} className={styles.primaryBtn}>
                💾 Save AI Settings
              </button>
            </div>

            <div className={styles.infoBox}>
              <strong>💡 Tip:</strong> The system works great without an API key using intelligent mock responses. 
              Add a key only if you need custom AI-powered analysis.
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className={styles.section}>
            <h2>🎨 User Preferences</h2>
            <p className={styles.sectionDesc}>
              Personalize your interface and experience
            </p>

            <div className={styles.card}>
              <div className={styles.formGroup}>
                <label htmlFor="theme">
                  <span className={styles.labelIcon}>🌓</span>
                  Theme
                </label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className={styles.select}
                >
                  <option value="light">☀️ Light Mode</option>
                  <option value="dark">🌙 Dark Mode</option>
                  <option value="auto">🔄 Auto (System)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="language">
                  <span className={styles.labelIcon}>🌍</span>
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={styles.select}
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="zh">🇨🇳 中文</option>
                </select>
              </div>

              <div className={styles.toggleGroup}>
                <div className={styles.toggleItem}>
                  <div>
                    <label>🔔 Notifications</label>
                    <p className={styles.toggleDesc}>Receive updates about analysis completion</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <label>💾 Auto-save History</label>
                    <p className={styles.toggleDesc}>Automatically save analysis to browser storage</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <button onClick={handleSavePreferences} className={styles.primaryBtn}>
                💾 Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Analysis Settings Tab */}
        {activeTab === 'analysis' && (
          <div className={styles.section}>
            <h2>📊 Analysis Settings</h2>
            <p className={styles.sectionDesc}>
              Customize how your resume analysis is performed
            </p>

            <div className={styles.card}>
              <div className={styles.formGroup}>
                <label htmlFor="detailLevel">
                  <span className={styles.labelIcon}>📝</span>
                  Detail Level
                </label>
                <select
                  id="detailLevel"
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value)}
                  className={styles.select}
                >
                  <option value="quick">⚡ Quick Overview</option>
                  <option value="standard">📄 Standard Analysis</option>
                  <option value="detailed">📚 Detailed Report</option>
                  <option value="comprehensive">🔬 Comprehensive (Slow)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="priorityFocus">
                  <span className={styles.labelIcon}>🎯</span>
                  Priority Focus
                </label>
                <p className={styles.helpText}>
                  What aspect should we emphasize in your analysis?
                </p>
                <select
                  id="priorityFocus"
                  value={priorityFocus}
                  onChange={(e) => setPriorityFocus(e.target.value)}
                  className={styles.select}
                >
                  <option value="skills">💻 Technical Skills</option>
                  <option value="experience">👔 Experience Level</option>
                  <option value="balanced">⚖️ Balanced Approach</option>
                  <option value="keywords">🔑 Keywords Matching</option>
                </select>
              </div>

              <div className={styles.toggleGroup}>
                <div className={styles.toggleItem}>
                  <div>
                    <label>📖 Include Examples</label>
                    <p className={styles.toggleDesc}>Show example improvements in recommendations</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={includeExamples}
                      onChange={(e) => setIncludeExamples(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <button onClick={handleSaveAnalysis} className={styles.primaryBtn}>
                💾 Save Analysis Settings
              </button>
            </div>
          </div>
        )}

        {/* Data & Privacy Tab */}
        {activeTab === 'data' && (
          <div className={styles.section}>
            <h2>💾 Data & Privacy</h2>
            <p className={styles.sectionDesc}>
              Manage your data and privacy settings
            </p>

            {/* Storage Stats */}
            <div className={styles.card}>
              <h3>📊 Storage Statistics</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{analysisCount}</div>
                  <div className={styles.statLabel}>Analyses Performed</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{storageUsed} KB</div>
                  <div className={styles.statLabel}>Storage Used</div>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className={styles.card}>
              <h3>🗂️ Data Management</h3>
              <div className={styles.actionGrid}>
                <button onClick={handleExportData} className={styles.secondaryBtn}>
                  📥 Export Settings
                </button>
                <button onClick={handleClearHistory} className={styles.warningBtn}>
                  🗑️ Clear History
                </button>
                <button onClick={handleResetSettings} className={styles.dangerBtn}>
                  🔄 Reset Settings
                </button>
              </div>
            </div>

            {/* Privacy Info */}
            <div className={styles.infoBox}>
              <h4>🔒 Privacy Notice</h4>
              <ul>
                <li>All data is stored locally in your browser</li>
                <li>No personal information is sent to external servers</li>
                <li>API keys (if provided) are stored securely in localStorage</li>
                <li>Analysis data is not shared with third parties</li>
                <li>You can delete your data anytime</li>
              </ul>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className={styles.section}>
            <h2>ℹ️ About Career Compass</h2>
            
            <div className={styles.aboutCard}>
              <div className={styles.appIcon}>🧭</div>
              <h3>Career Compass</h3>
              <p className={styles.version}>Version 1.0.0</p>
              <p className={styles.tagline}>AI-Powered Resume Analysis & Career Guidance</p>
            </div>

            <div className={styles.card}>
              <h3>✨ Features</h3>
              <div className={styles.featureGrid}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>📊</span>
                  <span>Resume Analysis</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🎯</span>
                  <span>Gap Identification</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>💡</span>
                  <span>Smart Recommendations</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>💬</span>
                  <span>AI Career Chat</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>📈</span>
                  <span>Match Scoring</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🔍</span>
                  <span>Skill Analysis</span>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h3>🛠️ Technology Stack</h3>
              <div className={styles.techGrid}>
                <span className={styles.techBadge}>React 18</span>
                <span className={styles.techBadge}>Node.js</span>
                <span className={styles.techBadge}>Express</span>
                <span className={styles.techBadge}>Python</span>
                <span className={styles.techBadge}>FastAPI</span>
                <span className={styles.techBadge}>MongoDB</span>
                <span className={styles.techBadge}>OpenAI</span>
                <span className={styles.techBadge}>Vite</span>
              </div>
            </div>

            <div className={styles.card}>
              <h3>📞 Support & Resources</h3>
              <div className={styles.linkList}>
                <a href="#" className={styles.link}>📖 Documentation</a>
                <a href="#" className={styles.link}>🐛 Report a Bug</a>
                <a href="#" className={styles.link}>💡 Request a Feature</a>
                <a href="#" className={styles.link}>❓ FAQ</a>
              </div>
            </div>

            <div className={styles.footer}>
              <p>Made with ❤️ for job seekers worldwide</p>
              <p className={styles.copyright}>© 2025 Career Compass. All rights reserved.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
