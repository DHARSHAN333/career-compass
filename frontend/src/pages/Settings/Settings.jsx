import { useState, useEffect } from 'react';

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
    
    // Use Tailwind's dark mode class approach
    if (appliedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">⚙️ Settings</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Customize your Career Compass experience</p>
      </div>

      {/* Save Status Toast */}
      {saveStatus && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ {saveStatus}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-300 dark:border-gray-700">
          <button
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'ai'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('ai')}
          >
            🤖 AI Configuration
          </button>
          <button
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'preferences'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            🎨 Preferences
          </button>
          <button
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'analysis'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('analysis')}
          >
            📊 Analysis
          </button>
          <button
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'data'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('data')}
          >
            💾 Data & Privacy
          </button>
          <button
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'about'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('about')}
          >
            ℹ️ About
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {/* AI Configuration Tab */}
        {activeTab === 'ai' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">🤖 AI Configuration</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure your AI model settings for personalized analysis
            </p>

            <div className="card p-6 mb-6">
              <div className="mb-6">
                <label htmlFor="apiKey" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">🔑</span>
                  OpenAI API Key
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Optional: Add your API key for enhanced AI responses. Without it, the system uses intelligent fallback responses.
                </p>
                <div className="flex gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="model" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">🧠</span>
                  AI Model
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Choose the AI model for analysis and chat responses
                </p>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="input-field"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast, Cost-effective)</option>
                  <option value="gpt-4">GPT-4 (Most Accurate)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo (Balanced)</option>
                  <option value="gpt-4o">GPT-4o (Latest)</option>
                </select>
              </div>

              <button onClick={handleSaveAI} className="btn-primary">
                💾 Save AI Settings
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Tip:</strong> The system works great without an API key using intelligent mock responses. 
              Add a key only if you need custom AI-powered analysis.
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">🎨 User Preferences</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Personalize your interface and experience
            </p>

            <div className="card p-6">
              <div className="mb-6">
                <label htmlFor="theme" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">🌓</span>
                  Theme
                </label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="input-field"
                >
                  <option value="light">☀️ Light Mode</option>
                  <option value="dark">🌙 Dark Mode</option>
                  <option value="auto">🔄 Auto (System)</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="language" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">🌍</span>
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="zh">🇨🇳 中文</option>
                </select>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <label className="block font-semibold text-gray-900 dark:text-gray-100">🔔 Notifications</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about analysis completion</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <label className="block font-semibold text-gray-900 dark:text-gray-100">💾 Auto-save History</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save analysis to browser storage</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <button onClick={handleSavePreferences} className="btn-primary">
                💾 Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Analysis Settings Tab */}
        {activeTab === 'analysis' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">📊 Analysis Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Customize how your resume analysis is performed
            </p>

            <div className="card p-6">
              <div className="mb-6">
                <label htmlFor="detailLevel" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">📝</span>
                  Detail Level
                </label>
                <select
                  id="detailLevel"
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value)}
                  className="input-field"
                >
                  <option value="quick">⚡ Quick Overview</option>
                  <option value="standard">📄 Standard Analysis</option>
                  <option value="detailed">📚 Detailed Report</option>
                  <option value="comprehensive">🔬 Comprehensive (Slow)</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="priorityFocus" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">🎯</span>
                  Priority Focus
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  What aspect should we emphasize in your analysis?
                </p>
                <select
                  id="priorityFocus"
                  value={priorityFocus}
                  onChange={(e) => setPriorityFocus(e.target.value)}
                  className="input-field"
                >
                  <option value="skills">💻 Technical Skills</option>
                  <option value="experience">👔 Experience Level</option>
                  <option value="balanced">⚖️ Balanced Approach</option>
                  <option value="keywords">🔑 Keywords Matching</option>
                </select>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <label className="block font-semibold text-gray-900 dark:text-gray-100">📖 Include Examples</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Show example improvements in recommendations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeExamples}
                      onChange={(e) => setIncludeExamples(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <button onClick={handleSaveAnalysis} className="btn-primary">
                💾 Save Analysis Settings
              </button>
            </div>
          </div>
        )}

        {/* Data & Privacy Tab */}
        {activeTab === 'data' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">💾 Data & Privacy</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage your data and privacy settings
            </p>

            {/* Storage Stats */}
            <div className="card p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">📊 Storage Statistics</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{analysisCount}</div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">Analyses Performed</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{storageUsed} KB</div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">Storage Used</div>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="card p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">🗂️ Data Management</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <button onClick={handleExportData} className="btn-secondary">
                  📥 Export Settings
                </button>
                <button onClick={handleClearHistory} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors">
                  🗑️ Clear History
                </button>
                <button onClick={handleResetSettings} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
                  🔄 Reset Settings
                </button>
              </div>
            </div>

            {/* Privacy Info */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-3">🔒 Privacy Notice</h4>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <li>• All data is stored locally in your browser</li>
                <li>• No personal information is sent to external servers</li>
                <li>• API keys (if provided) are stored securely in localStorage</li>
                <li>• Analysis data is not shared with third parties</li>
                <li>• You can delete your data anytime</li>
              </ul>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">ℹ️ About Career Compass</h2>
            
            <div className="card p-8 mb-6 text-center">
              <div className="text-6xl mb-4">🧭</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Career Compass</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Version 1.0.0</p>
              <p className="text-lg text-gray-700 dark:text-gray-300">AI-Powered Resume Analysis & Career Guidance</p>
            </div>

            <div className="card p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">✨ Features</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl">📊</span>
                  <span className="text-gray-900 dark:text-gray-100">Resume Analysis</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl">🎯</span>
                  <span className="text-gray-900 dark:text-gray-100">Gap Identification</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl">💡</span>
                  <span className="text-gray-900 dark:text-gray-100">Smart Recommendations</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl">💬</span>
                  <span className="text-gray-900 dark:text-gray-100">AI Career Chat</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl">📈</span>
                  <span className="text-gray-900 dark:text-gray-100">Match Scoring</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl">🔍</span>
                  <span className="text-gray-900 dark:text-gray-100">Skill Analysis</span>
                </div>
              </div>
            </div>

            <div className="card p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">🛠️ Technology Stack</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full font-medium">React 18</span>
                <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full font-medium">Node.js</span>
                <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full font-medium">Express</span>
                <span className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full font-medium">Python</span>
                <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full font-medium">FastAPI</span>
                <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full font-medium">MongoDB</span>
                <span className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 rounded-full font-medium">OpenAI</span>
                <span className="px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 rounded-full font-medium">Vite</span>
              </div>
            </div>

            <div className="card p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">📞 Support & Resources</h3>
              <div className="space-y-3">
                <a href="#" className="block p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-blue-600 dark:text-blue-400 font-semibold">
                  📖 Documentation
                </a>
                <a href="#" className="block p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-blue-600 dark:text-blue-400 font-semibold">
                  🐛 Report a Bug
                </a>
                <a href="#" className="block p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-blue-600 dark:text-blue-400 font-semibold">
                  💡 Request a Feature
                </a>
                <a href="#" className="block p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-blue-600 dark:text-blue-400 font-semibold">
                  ❓ FAQ
                </a>
              </div>
            </div>

            <div className="text-center text-gray-600 dark:text-gray-400">
              <p className="mb-2">Made with ❤️ for job seekers worldwide</p>
              <p className="text-sm">© 2025 Career Compass. All rights reserved.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
