import { useState, useCallback, useRef, useEffect } from 'react';
import { useI18n } from './hooks/useI18n.jsx';
import { useSessionHistory } from './hooks/useSessionHistory.js';
import { predictImage } from './api/client.js';

import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import UploadPanel from './components/UploadPanel.jsx';
import CameraCapture from './components/CameraCapture.jsx';
import LoadingOverlay from './components/LoadingOverlay.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import CautionBanner from './components/CautionBanner.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Footer from './components/Footer.jsx';
import './App.css';

/**
 * Main Application Component
 * 
 * State machine:
 *   idle → uploading → analyzing → results
 *   At any point: ← new analysis → idle
 */
export default function App() {
  const { t } = useI18n();
  const { history, addToHistory } = useSessionHistory();

  // App state
  const [view, setView] = useState('idle');           // idle | upload | camera | analyzing | results
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);

  const errorTimeout = useRef(null);

  // Fetch system info on mount
  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setSystemInfo(data.system_info);
        }
      } catch (err) {
        console.error('Failed to fetch system info:', err);
      }
    };
    fetchSystemInfo();
  }, []);

  // Show timed error toast
  const showError = useCallback((msg) => {
    setError(msg);
    if (errorTimeout.current) clearTimeout(errorTimeout.current);
    errorTimeout.current = setTimeout(() => setError(null), 6000);
  }, []);

  // Handle file selection (from upload or camera)
  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setView('upload');
    setResult(null);
  }, []);

  // Handle camera capture
  const handleCameraCapture = useCallback((file) => {
    handleFileSelect(file);
  }, [handleFileSelect]);

  // Run inference
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setView('analyzing');
    setError(null);

    try {
      const res = await predictImage(selectedFile);
      setResult(res);
      setView('results');

      // Add to session history
      addToHistory({
        filename: selectedFile.name,
        previewUrl,
        totalDetections: res.total_detections,
        level: res.interpretation?.level,
        resultId: res.result_id,
      });
    } catch (err) {
      console.error('Inference error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        showError(t('error_network'));
      } else {
        showError(err.message || t('error_inference'));
      }
      setView('upload');
    }
  }, [selectedFile, previewUrl, addToHistory, showError, t]);

  // Reset to initial state
  const handleNewAnalysis = useCallback(() => {
    setView('idle');
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [previewUrl]);

  // Navigate to upload
  const handleUploadClick = useCallback(() => {
    setView('upload');
    setResult(null);
  }, []);

  // Navigate to camera
  const handleCameraClick = useCallback(() => {
    setView('camera');
    setResult(null);
  }, []);

  // Load from history
  const handleHistorySelect = useCallback((item) => {
    // History items store the result ID — we re-display a summary
    // In a full implementation, this would reload from cache
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="app">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />

      <main className="app-main">
        {/* Loading Overlay */}
        {view === 'analyzing' && <LoadingOverlay />}

        {/* Hero — shown when idle */}
        {view === 'idle' && (
          <>
            <HeroSection
              onUploadClick={handleUploadClick}
              onCameraClick={handleCameraClick}
            />
            <div className="container">
              <CautionBanner />
            </div>
          </>
        )}

        {/* Upload Panel */}
        {(view === 'upload' || (view === 'analyzing' && selectedFile)) && view !== 'results' && (
          <>
            <UploadPanel
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
            />

            {selectedFile && view === 'upload' && (
              <div className="analyze-area">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAnalyze}
                  id="analyze-btn"
                >
                  🚀 {t('analyze_button')}
                </button>
                <div style={{ marginTop: 'var(--space-md)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCameraClick}
                    id="switch-to-camera-btn"
                  >
                    📷 {t('camera_title')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Camera */}
        {view === 'camera' && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setView('idle')}
          />
        )}

        {/* Results */}
        {view === 'results' && result && (
          <ResultsPanel
            result={result}
            previewUrl={previewUrl}
            onNewAnalysis={handleNewAnalysis}
          />
        )}

        {/* History */}
        <HistoryPanel
          history={history}
          onSelect={handleHistorySelect}
        />
      </main>

      <Footer systemInfo={systemInfo} />

      {/* Error Toast */}
      {error && (
        <div className="error-toast" role="alert" id="error-toast">
          <span>❌ {error}</span>
          <button className="error-toast-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
