import { useState, useRef, useEffect, useCallback } from 'react';
import { predictStream } from '../api/client';
import { useI18n } from '../hooks/useI18n';
import './LiveDetectionPanel.css';

export default function LiveDetectionPanel({ isOpen, onClose, displaySettings, onFinish }) {
  const { t } = useI18n();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeSource, setActiveSource] = useState(null); // 'camera' | 'file'
  const [fps, setFps] = useState(0);
  const [modelName, setModelName] = useState('');
  const [showReport, setShowReport] = useState(false);
  
  // Python betigindeki istatistik yapisi
  const [frameId, setFrameId] = useState(0);
  const [alarmOn, setAlarmOn] = useState(false);
  const [frameCounts, setFrameCounts] = useState({ 'Mouth Sores': 0, 'Nail Sores': 0 });
  const [cumulativeCounts, setCumulativeCounts] = useState({ 'Mouth Sores': 0, 'Nail Sores': 0 });

  const requestRef = useRef();
  const lastTimeRef = useRef();
  const frameCountRef = useRef(0);
  const isAnalyzingRef = useRef(false);

  // Initialize camera
  const startCamera = async () => {
    // Reset counters
    setFrameId(0);
    setCumulativeCounts({ 'Mouth Sores': 0, 'Nail Sores': 0 });
    setAlarmOn(false);
    setShowReport(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setActiveSource('camera');
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Kamera erişimi reddedildi.');
    }
  };

  // Handle video file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        setFrameId(0);
        setCumulativeCounts({ 'Mouth Sores': 0, 'Nail Sores': 0 });
        setShowReport(false);
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        setActiveSource('file');
        setIsStreaming(true);
      }
    }
  };

  const stopStream = () => {
    setIsStreaming(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    
    // Analiz yapildiysa raporu goster
    if (frameId > 0) {
      setShowReport(true);
    }
    setActiveSource(null);
  };

  const processFrame = useCallback(async (time) => {
    if (!isStreaming || !videoRef.current || !canvasRef.current) return;

    // Calculate FPS
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      if (deltaTime >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }
    } else {
      lastTimeRef.current = time;
    }
    frameCountRef.current++;
    setFrameId(prev => prev + 1);

    // Only analyze if not already busy to maintain UI responsiveness
    if (!isAnalyzingRef.current) {
      isAnalyzingRef.current = true;
      
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        try {
          const result = await predictStream(blob);
          
          // Istatistikleri guncelle
          const mouthCount = result.detections.filter(d => d.class_name.includes('Mouth')).length;
          const nailCount = result.detections.filter(d => d.class_name.includes('Nail')).length;
          
          setFrameCounts({ 'Mouth Sores': mouthCount, 'Nail Sores': nailCount });
          setAlarmOn(mouthCount + nailCount > 0);
          
          setCumulativeCounts(prev => ({
            'Mouth Sores': prev['Mouth Sores'] + mouthCount,
            'Nail Sores': prev['Nail Sores'] + nailCount
          }));

          drawDetections(result.detections);
          setModelName(result.model_name);
        } catch (err) {
          console.error('Stream inference failed:', err);
        } finally {
          isAnalyzingRef.current = false;
        }
      }, 'image/jpeg', 0.7);
    }

    requestRef.current = requestAnimationFrame(processFrame);
  }, [isStreaming]);

  const drawDetections = (detections) => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;
    
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    // Set canvas size to match video display size
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    detections.forEach(det => {
      const { polygon, class_name, confidence } = det;
      
      if (!polygon || polygon.length < 4) return;

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = class_name.includes('Mouth') ? '#ffeb3b' : '#f44336';
      
      // Draw OBB (polygon olarak geliyor)
      const points = polygon.map(p => ({ x: p[0] * scaleX, y: p[1] * scaleY }));
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Label
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = 'bold 12px sans-serif';
      const label = `${class_name.replace('Sores', '')} ${(confidence * 100).toFixed(0)}%`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(points[0].x, points[0].y - 18, textWidth + 10, 18);
      ctx.fillStyle = 'black';
      ctx.fillText(label, points[0].x + 5, points[0].y - 5);
    });
  };

  useEffect(() => {
    if (isStreaming) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isStreaming, processFrame]);

  if (!isOpen) return null;

  return (
    <div className={`live-overlay ${alarmOn ? 'alarm-active' : ''}`}>
      <div className="live-content">
        <div className="live-header">
          <div className="live-title">
            <h2>📡 Canlı Teşhis / Live Diagnosis</h2>
            {alarmOn && <span className="alarm-text">⚠️ YARA TESPİT EDİLDİ / LESION DETECTED</span>}
          </div>
          <button className="live-close" onClick={() => { stopStream(); onClose(); }}>×</button>
        </div>

        <div className="live-body">
          <div className="live-viewport">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="live-video"
              onEnded={stopStream}
            />
            <canvas ref={canvasRef} className="live-canvas" />
            
            {!activeSource && !showReport && (
              <div className="live-placeholder">
                <p>Başlatmak için bir kaynak seçin</p>
                <div className="live-actions">
                  <button className="btn btn-primary" onClick={startCamera}>📷 Kamerayı Başlat</button>
                  <label className="btn btn-secondary">
                    📁 Video Yükle
                    <input type="file" accept="video/*" hidden onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            )}

            {isStreaming && (
              <>
                {/* Dinamik Istatistik Paneli */}
                {(displaySettings.showFrameId || displaySettings.showAlarm || displaySettings.showFrameCounts || displaySettings.showCumulative) && (
                  <div className="live-status-panel glass">
                    {displaySettings.showFrameId && <div className="stat-line">Kare / Frame: <span>{frameId}</span></div>}
                    {displaySettings.showAlarm && <div className="stat-line">Alarm: <span className={alarmOn ? 'color-danger' : 'color-success'}>{alarmOn ? 'AÇIK (ON)' : 'KAPALI (OFF)'}</span></div>}
                    
                    {(displaySettings.showFrameId || displaySettings.showAlarm) && displaySettings.showFrameCounts && <hr />}
                    
                    {displaySettings.showFrameCounts && (
                      <>
                        <div className="stat-line">Ağız / Mouth: <span>{frameCounts['Mouth Sores']}</span></div>
                        <div className="stat-line">Tırnak / Nail: <span>{frameCounts['Nail Sores']}</span></div>
                      </>
                    )}
                    
                    {displaySettings.showFrameCounts && displaySettings.showCumulative && <hr />}
                    
                    {displaySettings.showCumulative && (
                      <>
                        <div className="stat-line">Toplam Ağız: <span>{cumulativeCounts['Mouth Sores']}</span></div>
                        <div className="stat-line">Toplam Tırnak: <span>{cumulativeCounts['Nail Sores']}</span></div>
                      </>
                    )}
                  </div>
                )}
                
                {displaySettings.showFPS && (
                  <div className="live-stats">
                    <span>FPS: {fps}</span>
                    <span>Model: {modelName}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Rapor Artık Videonun Altında */}
          {showReport && (
            <div className="live-report-block animate-fade-in">
              <div className="report-card-wide">
                <div className="report-header-row">
                  <h3>📊 Analiz Özeti / Session Summary</h3>
                  <div className="report-time">{new Date().toLocaleTimeString()}</div>
                </div>
                
                <div className="report-grid">
                  <div className="report-item">
                    <label>İşlenen Kare</label>
                    <span className="value">{frameId}</span>
                  </div>
                  <div className="report-item">
                    <label>Ağız Yarası (Toplam)</label>
                    <span className={`value ${cumulativeCounts['Mouth Sores'] > 0 ? 'danger' : ''}`}>
                      {cumulativeCounts['Mouth Sores']}
                    </span>
                  </div>
                  <div className="report-item">
                    <label>Tırnak Yarası (Toplam)</label>
                    <span className={`value ${cumulativeCounts['Nail Sores'] > 0 ? 'danger' : ''}`}>
                      {cumulativeCounts['Nail Sores']}
                    </span>
                  </div>
                </div>

                <div className="report-interpretation">
                  {cumulativeCounts['Mouth Sores'] + cumulativeCounts['Nail Sores'] > 0 ? (
                    <div className="alert-warning">
                      ⚠️ <b>Kritik Belirtiler Saptandı:</b> Analiz süresince şap hastalığı bulguları ile uyumlu tespitler yapılmıştır. Uzman incelemesi önerilir.
                    </div>
                  ) : (
                    <div className="alert-success">
                      ✅ <b>Hastalık Bulgusu Yok:</b> Analiz edilen karelerde herhangi bir lezyon veya şüpheli duruma rastlanmamıştır.
                    </div>
                  )}
                </div>

                <div className="report-actions">
                  <button className="btn btn-primary" onClick={() => { 
                    if (onFinish) {
                      onFinish({
                        type: 'live',
                        frameId,
                        mouthSores: cumulativeCounts['Mouth Sores'],
                        nailSores: cumulativeCounts['Nail Sores'],
                        timestamp: new Date().toLocaleTimeString()
                      });
                    }
                    setShowReport(false);
                  }}>
                    📥 Sonuçları Analiz Geçmişine Aktar ve Paneli Kapat
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setShowReport(false); setFrameId(0); }}>
                    🔄 Raporu Kapat ve Yeni Analiz Başlat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="live-footer">
          <button className="btn btn-secondary" onClick={() => { stopStream(); onClose(); }}>Kapat</button>
          {activeSource && (
             <button className="btn btn-danger" onClick={stopStream}>Durdur</button>
          )}
        </div>
      </div>
    </div>
  );
}
