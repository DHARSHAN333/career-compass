import { useState, useEffect } from 'react';
import { getHistory } from '../../services/api';

function Settings() {
  // State for AI Configuration
  const [aiProvider, setAiProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [showApiKey, setShowApiKey] = useState(false);
  const [useCustomAI, setUseCustomAI] = useState(false);
  
  // State for User Preferences
  const [theme, setTheme] = useState('light');
  const [autoSave, setAutoSave] = useState(true);
  
  // State for Analysis Settings
  const [detailLevel, setDetailLevel] = useState('detailed');
  const [includeExamples, setIncludeExamples] = useState(true);
  const [priorityFocus, setPriorityFocus] = useState('balanced');
  
  // State for Data Management
  const [storageUsed, setStorageUsed] = useState(0);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  
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

  const loadSettings = async () => {
    // AI Settings
    setUseCustomAI(localStorage.getItem('useCustomAI') === 'true');
    setAiProvider(localStorage.getItem('aiProvider') || 'gemini');
    setApiKey(localStorage.getItem('userApiKey') || '');
    setModel(localStorage.getItem('userModel') || 'gemini-2.0-flash');
    
    // User Preferences
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
    
    setAutoSave(localStorage.getItem('autoSave') !== 'false');
    
    // Analysis Settings
    setDetailLevel(localStorage.getItem('detailLevel') || 'detailed');
    setIncludeExamples(localStorage.getItem('includeExamples') !== 'false');
    setPriorityFocus(localStorage.getItem('priorityFocus') || 'balanced');
    
    // Fetch dynamic analysis count from backend
    await fetchAnalysisStats();
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

  const fetchAnalysisStats = async () => {
    try {
      setLoadingStats(true);
      const response = await getHistory();
      
      // Count user's analyses from backend
      const count = response.analyses ? response.analyses.length : 0;
      setAnalysisCount(count);
      
      // Calculate storage including backend data
      calculateStorageUsed();
    } catch (error) {
      console.error('Error fetching analysis stats:', error);
      // Fallback to 0 if error (e.g., not logged in)
      setAnalysisCount(0);
      calculateStorageUsed();
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSaveAI = () => {
    localStorage.setItem('useCustomAI', useCustomAI.toString());
    localStorage.setItem('aiProvider', aiProvider);
    localStorage.setItem('userApiKey', apiKey);
    localStorage.setItem('userModel', model);
    showSaveSuccess('AI settings saved! Changes will apply to your next analysis.');
  };

  const handleSavePreferences = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('autoSave', autoSave.toString());
    
    // Apply theme immediately
    applyTheme(theme);
    
    showSaveSuccess('Preferences saved! Auto-save will apply to your next analysis.');
  };

  const handleSaveAnalysis = () => {
    localStorage.setItem('detailLevel', detailLevel);
    localStorage.setItem('includeExamples', includeExamples.toString());
    localStorage.setItem('priorityFocus', priorityFocus);
    
    // Show detailed feedback
    const settingsSummary = `Analysis settings saved! Detail: ${detailLevel}, Examples: ${includeExamples ? 'ON' : 'OFF'}, Focus: ${priorityFocus}`;
    showSaveSuccess(settingsSummary);
  };

  const showSaveSuccess = (message) => {
    setSaveStatus(message);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
      try {
        // Note: This clears local storage only. 
        // Backend analyses are preserved unless you add a delete endpoint
        sessionStorage.clear();
        localStorage.removeItem('analysisCount');
        
        // Refresh stats from backend
        await fetchAnalysisStats();
        showSaveSuccess('Local history cleared! Database analyses are preserved.');
      } catch (error) {
        console.error('Error clearing history:', error);
        setAnalysisCount(0);
        calculateStorageUsed();
        showSaveSuccess('History cleared!');
      }
    }
  };

  const handleExportData = () => {
    const data = {
      settings: {
        preferences: { theme, autoSave },
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
      localStorage.removeItem('autoSave');
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
              Choose between default AI or configure your own API key
            </p>

            {/* Default AI Info */}
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  <span className="mr-2">🌟</span>
                  Default AI (Free)
                </h3>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  !useCustomAI 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {!useCustomAI ? '✓ Active' : 'Inactive'}
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">✨</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Google Gemini AI</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Powered by Gemini 2.0 Flash</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">✅ Features:</span> Resume analysis, contextual chat, skill extraction, gap analysis
                  </p>
                </div>
              </div>
            </div>

            {/* Custom AI Configuration */}
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  <span className="mr-2">🔧</span>
                  Use Your Own AI
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomAI}
                    onChange={(e) => setUseCustomAI(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {useCustomAI && (
                <div className="space-y-4 animate-fade-in">
                  {/* AI Provider Selection */}
                  <div>
                    <label htmlFor="aiProvider" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="mr-2">🏢</span>
                      AI Provider
                    </label>
                    <select
                      id="aiProvider"
                      value={aiProvider}
                      onChange={(e) => {
                        setAiProvider(e.target.value);
                        // Auto-set default model for provider
                        if (e.target.value === 'gemini') setModel('gemini-2.0-flash');
                        else if (e.target.value === 'openai') setModel('gpt-3.5-turbo');
                      }}
                      className="input-field"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI</option>
                    </select>
                  </div>

                  {/* API Key Input */}
                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="mr-2">🔑</span>
                      API Key
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {aiProvider === 'gemini' 
                        ? 'Get your key from: https://ai.google.dev'
                        : 'Get your key from: https://platform.openai.com/api-keys'}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        id="apiKey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={aiProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
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

                  {/* Model Selection */}
                  <div>
                    <label htmlFor="model" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="mr-2">🧠</span>
                      AI Model
                    </label>
                    <select
                      id="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="input-field"
                    >
                      {aiProvider === 'gemini' ? (
                        <>
                          <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast & Free)</option>
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash (Advanced)</option>
                          <option value="gemini-2.5-pro">Gemini 2.5 Pro (Most Capable)</option>
                          <option value="gemini-exp-1206">Gemini Experimental</option>
                        </>
                      ) : (
                        <>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast, Cost-effective)</option>
                          <option value="gpt-4">GPT-4 (Most Accurate)</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo (Balanced)</option>
                          <option value="gpt-4o">GPT-4o (Latest)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Warning Box */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>⚠️ Important:</strong> Your API key is stored locally in your browser and sent with each request. 
                    Never share your API key with others. Monitor your usage to avoid unexpected charges.
                  </div>
                </div>
              )}

              <button onClick={handleSaveAI} className="btn-primary mt-4">
                💾 Save AI Settings
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>💡 Tip:</strong> The default AI works great for most users. Add your own API key if you:
              </p>
              <ul className="mt-2 ml-4 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Need higher rate limits or priority access</li>
                <li>• Want to use a specific model (GPT-4, Gemini Pro, etc.)</li>
                <li>• Have enterprise API access with special features</li>
              </ul>
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
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <label className="block font-semibold text-gray-900 dark:text-gray-100">💾 Auto-save History</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save analysis results to your account</p>
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

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 About Auto-save:</strong> When enabled, your resume analysis results will be automatically saved to the database.
                  You can access your history anytime from the History page. When disabled, analyses are temporary and will be lost after closing the page.
                </p>
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
              
              {/* Current Settings Display */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <span className="mr-2">✅</span>
                  Current Active Settings
                </h4>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white dark:bg-gray-800 rounded p-3">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">Detail Level</div>
                    <div className="font-bold text-blue-600 dark:text-blue-400 capitalize">
                      {detailLevel === 'quick' && '⚡ Quick'}
                      {detailLevel === 'standard' && '📄 Standard'}
                      {detailLevel === 'detailed' && '📚 Detailed'}
                      {detailLevel === 'comprehensive' && '🔬 Comprehensive'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-3">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">Priority Focus</div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                      {priorityFocus === 'skills' && '💻 Skills'}
                      {priorityFocus === 'experience' && '👔 Experience'}
                      {priorityFocus === 'balanced' && '⚖️ Balanced'}
                      {priorityFocus === 'keywords' && '🔑 Keywords'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-3">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">Include Examples</div>
                    <div className={`font-bold ${includeExamples ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {includeExamples ? '✅ Enabled' : '❌ Disabled'}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 italic">
                  💡 These settings will be applied to your next resume analysis
                </p>
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">📊 Storage Statistics</h3>
                <button 
                  onClick={fetchAnalysisStats}
                  disabled={loadingStats}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {loadingStats ? (
                    <>
                      <span className="animate-spin">🔄</span>
                      Loading...
                    </>
                  ) : (
                    <>
                      🔄 Refresh
                    </>
                  )}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {loadingStats ? '...' : analysisCount}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">Analyses Performed</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">From your account</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{storageUsed} KB</div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">Storage Used</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Browser localStorage</div>
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">ℹ️ About Career Compass</h2>
            
            {/* Hero Section */}
            <div className="card p-8 mb-6 text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
              <div className="text-7xl mb-4 animate-pulse">🧭</div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-3">Career Compass</h3>
              <div className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-3">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Version 1.0.0 • Released 2025</p>
              </div>
              <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">AI-Powered Resume Analysis & Career Guidance Platform</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Helping job seekers optimize their resumes and match with their dream careers using advanced artificial intelligence</p>
            </div>

            {/* Core Features */}
            <div className="card p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <span className="text-3xl">✨</span>
                Core Features & Capabilities
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Everything you need for resume optimization and career guidance</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="group hover:scale-105 transition-transform p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <span className="text-3xl mb-2 block">📊</span>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Resume Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deep AI-powered analysis of your resume content</p>
                </div>
                <div className="group hover:scale-105 transition-transform p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                  <span className="text-3xl mb-2 block">🎯</span>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Gap Identification</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Identify missing skills and experience gaps</p>
                </div>
                <div className="group hover:scale-105 transition-transform p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <span className="text-3xl mb-2 block">💡</span>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Smart Recommendations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actionable suggestions to improve your resume</p>
                </div>
                <div className="group hover:scale-105 transition-transform p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl border border-pink-200 dark:border-pink-800">
                  <span className="text-3xl mb-2 block">💬</span>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">AI Career Chat</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Interactive chat for career guidance</p>
                </div>
                <div className="group hover:scale-105 transition-transform p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <span className="text-3xl mb-2 block">📈</span>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Match Scoring</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Percentage match with job descriptions</p>
                </div>
                <div className="group hover:scale-105 transition-transform p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <span className="text-3xl mb-2 block">🔍</span>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Skill Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Detailed breakdown of your skill set</p>
                </div>
              </div>
            </div>

            {/* Technology Stack - Detailed */}
            <div className="card p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <span className="text-3xl">🛠️</span>
                Technology Stack & Architecture
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Built with modern, industry-standard technologies</p>
              
              {/* Frontend */}
              <div className="mb-6">
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <span className="text-xl">💻</span>
                  Frontend Technologies
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="font-bold text-blue-800 dark:text-blue-200">React 18</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">UI Framework</div>
                  </div>
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="font-bold text-purple-800 dark:text-purple-200">Vite</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Build Tool</div>
                  </div>
                  <div className="px-4 py-3 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <div className="font-bold text-cyan-800 dark:text-cyan-200">Tailwind CSS</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Styling</div>
                  </div>
                  <div className="px-4 py-3 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="font-bold text-orange-800 dark:text-orange-200">Axios</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">HTTP Client</div>
                  </div>
                </div>
              </div>

              {/* Backend */}
              <div className="mb-6">
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <span className="text-xl">⚙️</span>
                  Backend Technologies
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
                  <div className="px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="font-bold text-green-800 dark:text-green-200">Node.js</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Runtime</div>
                  </div>
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                    <div className="font-bold text-gray-800 dark:text-gray-200">Express.js</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Web Framework</div>
                  </div>
                  <div className="px-4 py-3 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="font-bold text-green-800 dark:text-green-200">MongoDB</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Database</div>
                  </div>
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="font-bold text-blue-800 dark:text-blue-200">JWT</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Authentication</div>
                  </div>
                </div>
              </div>

              {/* AI & ML */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  AI & Machine Learning
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="px-4 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="font-bold text-yellow-800 dark:text-yellow-200">Python</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">AI Language</div>
                  </div>
                  <div className="px-4 py-3 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="font-bold text-red-800 dark:text-red-200">FastAPI</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">AI Service</div>
                  </div>
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="font-bold text-purple-800 dark:text-purple-200">Google Gemini</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">AI Model</div>
                  </div>
                  <div className="px-4 py-3 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg border border-teal-200 dark:border-teal-800">
                    <div className="font-bold text-teal-800 dark:text-teal-200">OpenAI API</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Alternative AI</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features Implemented */}
            <div className="card p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="text-3xl">🎯</span>
                Key Implementation Features
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-bold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <span>🔐</span> Secure Authentication
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• JWT token-based authentication</li>
                    <li>• Bcrypt password hashing</li>
                    <li>• Protected routes & middleware</li>
                    <li>• Session persistence</li>
                  </ul>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <span>👤</span> User Management
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• User registration & validation</li>
                    <li>• Profile management</li>
                    <li>• Personal analysis history</li>
                    <li>• Customizable preferences</li>
                  </ul>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                    <span>🎛️</span> Configurable Analysis
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Multiple detail levels</li>
                    <li>• Priority focus options</li>
                    <li>• Custom AI model selection</li>
                    <li>• Personal API key support</li>
                  </ul>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                    <span>💾</span> Data Management
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Auto-save history toggle</li>
                    <li>• Export settings & data</li>
                    <li>• Clear history option</li>
                    <li>• Privacy-focused storage</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Made with ❤️ for job seekers worldwide</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 Career Compass. All rights reserved.</p>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>🌍 Global</span>
                <span>•</span>
                <span>🔒 Secure</span>
                <span>•</span>
                <span>⚡ Fast</span>
                <span>•</span>
                <span>🎯 Accurate</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
