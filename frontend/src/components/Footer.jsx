import { useI18n } from '../hooks/useI18n.jsx';
import './Footer.css';

export default function Footer({ systemInfo }) {
  const { t } = useI18n();

  return (
    <footer className="footer" id="app-footer">
      <div className="container">
        <div className="footer-top">
          <p className="footer-text">🐄 {t('footer_text')}</p>
          {systemInfo && (
            <div className="system-badges">
              <span className="system-badge" title="CPU">💻 {systemInfo.cpu}</span>
              <span className={`system-badge ${systemInfo.cuda_available ? 'gpu-active' : ''}`} title="GPU">
                🚀 {systemInfo.gpu !== 'None' ? systemInfo.gpu : 'CPU Mode'}
              </span>
              <span className="system-badge" title="RAM">💾 {systemInfo.ram}</span>
            </div>
          )}
        </div>
        <p className="footer-disclaimer">{t('footer_disclaimer')}</p>
        <p className="footer-version">{t('footer_version')} 1.0.0 — © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
