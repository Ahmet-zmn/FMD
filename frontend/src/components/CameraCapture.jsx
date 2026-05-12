import { useState, useRef, useCallback } from 'react';
import { useI18n } from '../hooks/useI18n.jsx';
import './CameraCapture.css';

export default function CameraCapture({ onCapture, onClose }) {
  const { t } = useI18n();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Kamera erişimi sağlanamadı. / Camera access denied.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCapturedImage(null);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
  }, []);

  const retake = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const usePhoto = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  }, [capturedImage, onCapture, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  return (
    <section className="camera-section" id="camera-section">
      <div className="container">
        <h2 className="camera-section-title">📷 {t('camera_title')}</h2>

        <div className="camera-container">
          {error && <div className="camera-error">{error}</div>}

          {!cameraActive && !capturedImage && (
            <div className="camera-actions">
              <button className="btn btn-primary btn-lg" onClick={startCamera} id="camera-start-btn">
                📷 {t('camera_start')}
              </button>
              <button className="btn btn-secondary" onClick={handleClose} id="camera-close-btn">
                {t('camera_stop')}
              </button>
            </div>
          )}

          {cameraActive && !capturedImage && (
            <>
              <div className="camera-video-wrapper">
                <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
              </div>
              <div className="camera-actions">
                <button className="btn btn-primary btn-lg" onClick={capturePhoto} id="camera-capture-btn">
                  📸 {t('camera_capture')}
                </button>
                <button className="btn btn-secondary" onClick={handleClose}>
                  {t('camera_stop')}
                </button>
              </div>
            </>
          )}

          {capturedImage && (
            <>
              <img src={capturedImage} alt="Captured" className="camera-preview" />
              <div className="camera-actions">
                <button className="btn btn-primary btn-lg" onClick={usePhoto} id="camera-use-btn">
                  ✅ {t('camera_use')}
                </button>
                <button className="btn btn-secondary" onClick={retake}>
                  🔄 {t('camera_retake')}
                </button>
                <button className="btn btn-secondary" onClick={handleClose}>
                  {t('camera_stop')}
                </button>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="camera-canvas" />
        </div>
      </div>
    </section>
  );
}
