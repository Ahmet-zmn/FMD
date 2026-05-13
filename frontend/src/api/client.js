/**
 * API Client — Handles communication with the FastAPI backend.
 */

const API_BASE = '/api';

/**
 * Upload an image for FMD analysis.
 * @param {File} file - The image file to analyze
 * @returns {Promise<Object>} Prediction result
 */
export async function predictImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Send a frame for real-time streaming analysis.
 * @param {Blob} blob - The video frame as a blob
 * @returns {Promise<Object>} Detection results
 */
export async function predictStream(blob) {
  const formData = new FormData();
  formData.append('file', blob, 'frame.jpg');

  const response = await fetch(`${API_BASE}/predict/stream`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Stream error');
  return response.json();
}

/**
 * Get the URL for downloading an annotated image.
 */
export function getAnnotatedImageUrl(resultId) {
  return `${API_BASE}/predict/${resultId}/image`;
}

/**
 * Get the URL for downloading a JSON report.
 */
export function getJsonReportUrl(resultId) {
  return `${API_BASE}/predict/${resultId}/report`;
}

/**
 * Get the URL for downloading a PDF report.
 */
export function getPdfReportUrl(resultId, lang = 'tr') {
  return `${API_BASE}/predict/${resultId}/report/pdf?lang=${lang}`;
}

/**
 * Check backend health status.
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error('Backend unavailable');
  return response.json();
}

/**
 * Cleanly download a file using Blob. 
 * Overrides browser default logic where it guesses the extension from URL.
 */
export async function downloadFileSecurely(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Dosya indirilirken bir hata oluştu. / Failed to download file.");
  }
}

/**
 * Get available models and devices.
 */
export async function getAvailableSettings() {
  const response = await fetch(`${API_BASE}/settings/available`);
  if (!response.ok) throw new Error('Settings unavailable');
  return response.json();
}

/**
 * Update active model and device.
 * @param {string} modelPath - Relative path to the model
 * @param {string} device - Device name (cpu, cuda, etc.)
 */
export async function updateSettings(modelPath, device) {
  const response = await fetch(`${API_BASE}/settings/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_path: modelPath, device }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  return response.json();
}
