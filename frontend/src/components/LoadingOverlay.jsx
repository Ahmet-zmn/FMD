import { useI18n } from '../hooks/useI18n.jsx';
import './LoadingOverlay.css';

export default function LoadingOverlay() {
  const { t } = useI18n();

  return (
    <div className="loading-overlay" id="loading-overlay" role="status" aria-live="polite">
      <div className="loading-content">
        <div className="loading-spinner" />
        <p className="loading-text">{t('analyzing')}</p>
        <p className="loading-subtext">{t('analyzing_subtitle')}</p>
        <div className="loading-progress-bar" />
      </div>
    </div>
  );
}
