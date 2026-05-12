import { useI18n } from '../hooks/useI18n.jsx';
import './CautionBanner.css';

export default function CautionBanner() {
  const { t } = useI18n();

  return (
    <div className="caution-banner" role="alert" id="caution-banner">
      {t('caution_text')}
    </div>
  );
}
