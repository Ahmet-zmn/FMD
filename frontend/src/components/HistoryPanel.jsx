import { useI18n } from '../hooks/useI18n.jsx';
import './HistoryPanel.css';

export default function HistoryPanel({ history, onSelect }) {
  const { t } = useI18n();

  if (!history || history.length === 0) return null;

  const formatTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <section className="history-section" id="session-history">
      <div className="container">
        <div className="history-header">
          <h3 className="history-title">🕒 {t('history_title')}</h3>
        </div>

        <div className="history-list">
          {history.map((item, idx) => (
            <div
              key={item.id}
              className={`history-item ${item.isLive ? 'live-session' : ''}`}
              onClick={() => onSelect(item)}
              role="button"
              tabIndex={0}
              id={`history-item-${idx}`}
            >
              {item.isLive ? (
                <div className="history-thumb live-thumb">📡</div>
              ) : item.previewUrl && (
                <img src={item.previewUrl} alt="" className="history-thumb" />
              )}
              
              <div className="history-info">
                <div className="history-info-name">
                  {item.isLive ? 'Canlı Teşhis Analizi' : `${t('history_item')} #${history.length - idx}`}
                  {item.filename ? ` — ${item.filename}` : ''}
                </div>
                <div className="history-info-meta">
                  <span>{item.isLive ? item.stats.timestamp : formatTime(item.timestamp)}</span>
                  <span>•</span>
                  {item.isLive ? (
                    <span className="live-details">
                      Ağız: <b>{item.stats.mouthSores}</b> | Tırnak: <b>{item.stats.nailSores}</b>
                    </span>
                  ) : (
                    <span>{item.totalDetections || 0} {t('findings_title').toLowerCase()}</span>
                  )}
                </div>
              </div>
              <div
                className={`history-status-dot ${item.level || 'inconclusive'}`}
                title={item.level}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
