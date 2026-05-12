import { useI18n } from '../hooks/useI18n.jsx';
import { getAnnotatedImageUrl, getJsonReportUrl, getPdfReportUrl, downloadFileSecurely } from '../api/client.js';
import CautionBanner from './CautionBanner.jsx';
import './ResultsPanel.css';

export default function ResultsPanel({ result, previewUrl, onNewAnalysis }) {
  const { t, locale } = useI18n();

  if (!result) return null;

  const {
    result_id,
    detections = [],
    class_counts = {},
    interpretation = {},
    total_detections = 0,
  } = result;

  // Determine interpretation display
  const interpLevel = interpretation.level || 'inconclusive';
  const interpMessage = locale === 'tr'
    ? interpretation.message_tr
    : interpretation.message_en;
  const interpTitle = interpLevel === 'warning'
    ? t('interpretation_warning')
    : interpLevel === 'healthy'
    ? t('interpretation_healthy')
    : t('interpretation_inconclusive');
  const interpIcon = interpLevel === 'warning' ? '🔴' : interpLevel === 'healthy' ? '🟢' : '⚪';

  // Translate class name
  const getClassName = (name) => {
    const translated = t(`class_names.${name}`);
    return translated !== `class_names.${name}` ? translated : name;
  };

  // Confidence color
  const getConfColor = (conf) => {
    if (conf >= 0.8) return 'var(--color-success)';
    if (conf >= 0.5) return 'var(--color-accent)';
    return 'var(--color-danger)';
  };

  return (
    <section className="results-section" id="results-section">
      <div className="container">
        <div className="results-header">
          <h2 className="results-title">📊 {t('results_title')}</h2>
        </div>

        {/* Interpretation Card */}
        <div className={`interpretation-card level-${interpLevel}`} id="interpretation-card">
          <span className="interpretation-icon">{interpIcon}</span>
          <div className="interpretation-content">
            <h3>{interpTitle}</h3>
            <p>{interpMessage}</p>
          </div>
        </div>

        <CautionBanner />

        {/* Image Comparison */}
        <div className="results-images" id="results-images">
          <div className="results-image-card">
            <div className="results-image-label">{t('original_image')}</div>
            <div className="results-image-wrapper">
              {previewUrl && <img src={previewUrl} alt="Original" />}
            </div>
          </div>
          <div className="results-image-card">
            <div className="results-image-label">{t('annotated_image')}</div>
            <div className="results-image-wrapper">
              <img src={getAnnotatedImageUrl(result_id)} alt="Annotated" />
            </div>
          </div>
        </div>

        {/* Summary Counts */}
        {Object.keys(class_counts).length > 0 && (
          <>
            <h3 className="detections-title">{t('summary_title')}</h3>
            
            {result.model_name && (
              <div className="active-model-summary">
                <span>🤖 {t('active_model')}: <strong>{result.model_name}</strong></span>
                {result.inference_time_ms && (
                  <span className="inference-metric">⚡ {t('inference_time')}: <strong>{result.inference_time_ms} ms</strong></span>
                )}
              </div>
            )}

            <div className="summary-grid" id="summary-grid">
              {Object.entries(class_counts).map(([cls, count]) => (
                <div key={cls} className="summary-item">
                  <div className="summary-item-count">{count}</div>
                  <div className="summary-item-label">{getClassName(cls)}</div>
                </div>
              ))}
              <div className="summary-item">
                <div className="summary-item-count" style={{ color: 'var(--color-primary-dark)' }}>
                  {total_detections}
                </div>
                <div className="summary-item-label" style={{ fontWeight: 700 }}>
                  {t('total_label')}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Detection List */}
        <h3 className="detections-title">🔍 {t('findings_title')}</h3>
        {detections.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-xl)' }}>
            {t('no_findings')}
          </p>
        ) : (
          <div className="detections-list" id="detections-list">
            {detections.map((det, idx) => (
              <div
                key={det.id}
                className="detection-item"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="detection-index">{idx + 1}</div>
                <div className="detection-info">
                  <div className="detection-class">{getClassName(det.class_name)}</div>
                  <div className="detection-position">
                    {t('position_label')}: ({Math.round(det.xywhr[0])}, {Math.round(det.xywhr[1])})
                  </div>
                </div>
                <div className="detection-confidence">
                  <div className="detection-conf-value" style={{ color: getConfColor(det.confidence) }}>
                    {(det.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="detection-conf-bar">
                    <div
                      className="detection-conf-bar-fill"
                      style={{ width: `${det.confidence * 100}%`, background: getConfColor(det.confidence) }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Downloads */}
        <div className="results-downloads" id="results-downloads">
          <button
            onClick={() => downloadFileSecurely(getAnnotatedImageUrl(result_id), `sap-analiz-${result_id}.png`)}
            className="btn btn-primary"
            id="download-image-btn"
          >
            🖼️ {t('download_image')}
          </button>
          <button
            onClick={() => downloadFileSecurely(getJsonReportUrl(result_id), `sap-analiz-raporu-${result_id}.json`)}
            className="btn btn-secondary"
            id="download-json-btn"
          >
            📄 {t('download_json')}
          </button>
          <button
            onClick={() => downloadFileSecurely(getPdfReportUrl(result_id, locale), `sap-analiz-raporu-${result_id}.pdf`)}
            className="btn btn-secondary"
            id="download-pdf-btn"
          >
            📑 {t('download_pdf')}
          </button>
        </div>

        {/* New Analysis */}
        <div className="results-new-analysis">
          <button className="btn btn-primary btn-lg" onClick={onNewAnalysis} id="new-analysis-btn">
            🔄 {t('new_analysis')}
          </button>
        </div>
      </div>
    </section>
  );
}
