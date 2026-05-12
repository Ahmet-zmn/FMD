import { useState, useRef, useCallback } from 'react';
import { useI18n } from '../hooks/useI18n.jsx';
import './UploadPanel.css';

export default function UploadPanel({ onFileSelect, selectedFile, previewUrl }) {
  const { t } = useI18n();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
  const MAX_SIZE = 10 * 1024 * 1024;

  const validateFile = useCallback((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(t('error_file_type'));
      return false;
    }
    if (file.size > MAX_SIZE) {
      alert(t('error_file_size'));
      return false;
    }
    return true;
  }, [t]);

  const handleFile = useCallback((file) => {
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect, validateFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <section className="upload-section" id="upload-section">
      <div className="container">
        <h2 className="upload-section-title">📁 {t('upload_title')}</h2>
        
        <div
          className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          aria-label={t('upload_drag')}
          id="upload-dropzone"
        >
          <span className="upload-icon">📤</span>
          <p className="upload-text">{t('upload_drag')}</p>
          <p className="upload-formats">{t('upload_formats')}</p>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleInputChange}
            className="upload-input"
            id="upload-file-input"
          />
        </div>

        {selectedFile && previewUrl && (
          <div className="upload-preview" id="upload-preview">
            <div className="upload-preview-image-container">
              <img
                src={previewUrl}
                alt="Preview"
                className="upload-preview-image"
              />
            </div>
            <div className="upload-preview-info">
              <span className="upload-preview-name">
                📄 {selectedFile.name}
              </span>
              <span className="badge badge-neutral">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
