import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home.jsx';
import Analysis from './pages/Analysis/Analysis.jsx';
import History from './pages/History/History.jsx';
import Settings from './pages/Settings/Settings.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1>Career Compass</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/history">History</a>
            <a href="/settings">Settings</a>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis/:id" element={<Analysis />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
