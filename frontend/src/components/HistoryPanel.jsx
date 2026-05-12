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
    <section className="history-section" id="history-section">
      <div className="container">
        <div className="history-header">
          <h3 className="history-title">🕒 {t('history_title')}</h3>
        </div>

        <div className="history-list">
          {history.map((item, idx) => (
            <div
              key={item.id}
              className="history-item"
              onClick={() => onSelect(item)}
              role="button"
              tabIndex={0}
              id={`history-item-${idx}`}
            >
              {item.previewUrl && (
                <img src={item.previewUrl} alt="" className="history-thumb" />
              )}
              <div className="history-info">
                <div className="history-info-name">
                  {t('history_item')} #{history.length - idx}
                  {item.filename ? ` — ${item.filename}` : ''}
                </div>
                <div className="history-info-meta">
                  <span>{formatTime(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.totalDetections || 0} {t('findings_title').toLowerCase()}</span>
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
