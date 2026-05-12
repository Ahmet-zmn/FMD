import { useI18n } from '../hooks/useI18n.jsx';
import './HeroSection.css';

export default function HeroSection({ onUploadClick, onCameraClick }) {
  const { t } = useI18n();

  return (
    <section className="hero" id="hero-section">
      <div className="container hero-content">
        <div className="hero-icon">🔬</div>
        <h2 className="hero-heading">{t('app_title')}</h2>
        <p className="hero-description">{t('hero_description')}</p>
        <p className="hero-target">{t('hero_target')}</p>
        <div className="hero-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={onUploadClick}
            id="hero-upload-btn"
          >
            📁 {t('upload_title')}
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={onCameraClick}
            id="hero-camera-btn"
          >
            📷 {t('camera_title')}
          </button>
        </div>
      </div>
    </section>
  );
}
