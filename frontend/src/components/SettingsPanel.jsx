import { useState, useEffect } from 'react';
import { getAvailableSettings, updateSettings } from '../api/client';
import { useI18n } from '../hooks/useI18n';
import './SettingsPanel.css';

export default function SettingsPanel({ isOpen, onClose, displaySettings, setDisplaySettings }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState({ models: [], devices: [], current: null });
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getAvailableSettings();
      setAvailable(data);
      setSelectedModel(data.current?.model_path || '');
      setSelectedDevice(data.current?.device || 'cpu');
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setMessage({ type: 'error', text: 'Ayarlar yüklenemedi. / Failed to load settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updateSettings(selectedModel, selectedDevice);
      setMessage({ type: 'success', text: 'Ayarlar başarıyla güncellendi. / Settings updated successfully.' });
      setTimeout(() => {
        onClose();
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setMessage({ type: 'error', text: err.message || 'Hata oluştu. / Error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay animate-fade-in" onClick={onClose}>
      <div className="settings-content animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ {t('settings_title') || 'Sistem Ayarları'}</h2>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-body">
          {loading && !available.models.length ? (
            <div className="settings-loading">Yükleniyor...</div>
          ) : (
            <>
              <div className="settings-group">
                <label htmlFor="device-select">Çalışma Birimi (Device)</label>
                <select 
                  id="device-select" 
                  value={selectedDevice} 
                  onChange={(e) => {
                    const newDevice = e.target.value;
                    setSelectedDevice(newDevice);
                    
                    // Filter models for the new device
                    const baseDevice = newDevice.startsWith('cuda') ? 'cuda' : 'cpu';
                    const compatibleModels = (available.models || []).filter(m => 
                      (m.supported_devices || []).includes(baseDevice)
                    );
                    
                    // If current model is not compatible, select the first compatible one
                    if (compatibleModels.length > 0) {
                      const currentIsCompatible = compatibleModels.some(m => m.path === selectedModel);
                      if (!currentIsCompatible) {
                        setSelectedModel(compatibleModels[0].path);
                      }
                    }
                  }}
                  disabled={loading}
                >
                  {available.devices.map((device) => (
                    <option key={device} value={device}>
                      {device.toUpperCase()}
                    </option>
                  ))}
                </select>
                <p className="settings-hint">Eğer GPU'nuz varsa 'CUDA' seçeneği daha yüksek performans sağlar.</p>
              </div>

              <div className="settings-group">
                <label>Video Metrikleri (Canlı Teşhis)</label>
                <div className="metrics-selector">
                  <label className="metric-option">
                    <input type="checkbox" checked={displaySettings.showFrameId} onChange={() => setDisplaySettings(s => ({...s, showFrameId: !s.showFrameId}))} />
                    <span>Kare Sayısı (Frame ID)</span>
                  </label>
                  <label className="metric-option">
                    <input type="checkbox" checked={displaySettings.showAlarm} onChange={() => setDisplaySettings(s => ({...s, showAlarm: !s.showAlarm}))} />
                    <span>Alarm Durumu (On/Off)</span>
                  </label>
                  <label className="metric-option">
                    <input type="checkbox" checked={displaySettings.showFrameCounts} onChange={() => setDisplaySettings(s => ({...s, showFrameCounts: !s.showFrameCounts}))} />
                    <span>Anlık Tespit Sayıları</span>
                  </label>
                  <label className="metric-option">
                    <input type="checkbox" checked={displaySettings.showCumulative} onChange={() => setDisplaySettings(s => ({...s, showCumulative: !s.showCumulative}))} />
                    <span>Toplam (Birikimli) Sayılar</span>
                  </label>
                  <label className="metric-option">
                    <input type="checkbox" checked={displaySettings.showFPS} onChange={() => setDisplaySettings(s => ({...s, showFPS: !s.showFPS}))} />
                    <span>FPS ve Model Bilgisi</span>
                  </label>
                </div>
                <p className="settings-hint">Canlı izleme ekranında hangi bilgilerin görüneceğini buradan seçebilirsiniz.</p>
              </div>

              <div className="settings-group">
                <label>Model Ağırlıkları (Weights)</label>
                <div className="model-list">
                  {available.models && available.models
                    .filter(model => {
                      if (!model.supported_devices) return true;
                      const baseDevice = (selectedDevice || '').startsWith('cuda') ? 'cuda' : 'cpu';
                      return model.supported_devices.includes(baseDevice);
                    })
                    .map((model) => (
                      <div 
                        key={model.path} 
                        className={`model-item ${model.exists ? 'exists' : 'missing'} ${selectedModel === model.path ? 'selected' : ''}`}
                        onClick={() => {
                          if (model.exists) {
                            setSelectedModel(model.path);
                          } else {
                            window.open(model.download_url, '_blank');
                          }
                        }}
                      >
                        <div className="model-info">
                          <span className="model-type">[{model.type?.toUpperCase() || 'MOD'}]</span>
                          <span className="model-name">{model.name}</span>
                        </div>
                        {!model.exists && (
                          <div className="model-install-badge">
                            Kur
                          </div>
                        )}
                        {model.exists && selectedModel === model.path && (
                          <span className="model-active-icon">✓</span>
                        )}
                      </div>
                    ))
                  }
                </div>
                <p className="settings-hint">
                  <b>Kalın</b> yazılan modeller yüklüdür. Soluk olanları yanındaki 'Kur' butonu ile indirebilirsiniz.
                </p>
                <p className="settings-hint">Seçilen donanıma ( {selectedDevice.toUpperCase()} ) uygun modeller listelenmektedir.</p>
              </div>

              {message.text && (
                <div className={`settings-message ${message.type}`}>
                  {message.text}
                </div>
              )}
            </>
          )}
        </div>

        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            {t('cancel') || 'İptal'}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Yükleniyor...' : (t('save') || 'Kaydet')}
          </button>
        </div>
      </div>
    </div>
  );
}
