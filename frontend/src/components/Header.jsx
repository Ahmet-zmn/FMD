import { useI18n } from '../hooks/useI18n.jsx';
import './Header.css';

export default function Header({ onSettingsClick }) {
  const { t, locale, setLocale, supportedLocales } = useI18n();

  return (
    <header className="header" id="app-header">
      <div className="container header-inner">
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">🐄</div>
          <div>
            <h1 className="header-title">
              {t('app_title')}
              <span className="header-title-sub">{t('app_subtitle')}</span>
            </h1>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="btn-settings" 
            onClick={onSettingsClick} 
            aria-label="Ayarlar"
            title="Ayarlar / Settings"
          >
            ⚙️
          </button>
          
          <div className="lang-switcher" role="radiogroup" aria-label={t('lang_label')}>
            {supportedLocales.map(({ code, label }) => (
              <button
                key={code}
                className={`lang-btn ${locale === code ? 'active' : ''}`}
                onClick={() => setLocale(code)}
                role="radio"
                aria-checked={locale === code}
                id={`lang-btn-${code}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
