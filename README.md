# FMD AI Diagnosis System 🐄🩺

![Status](https://img.shields.io/badge/Status-Production--Ready-success)
![AI](https://img.shields.io/badge/AI-YOLOv11--OBB-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20171884.svg)](https://doi.org/10.5281/zenodo.20171884)

A high-performance AI diagnostic platform for **Foot and Mouth Disease (FMD)** detection using advanced **Oriented Bounding Boxes (OBB)**. Supports image upload, camera capture, and **real-time video/camera stream analysis** with live alarm & cumulative statistics.

### Detection Classes
The models detect **6 classes**: `Mouth Saliva`, `Mouth Sores`, `Nail Sores`, `Head`, `Healthy Mouth`, `Healthy Nails`

---

## 🌟 Key Features

| Feature | Description |
|---|---|
| **OBB Detection** | Precise rotated bounding boxes for mouth and nail lesions |
| **Multi-Format Models** | `.pt`, `.onnx`, `.engine` (TensorRT), `OpenVINO` support |
| **Live Diagnosis** | Real-time video/camera stream analysis with FPS tracking |
| **Alarm System** | Instant visual alert when lesions are detected in live feed |
| **Cumulative Report** | Session summary with total lesion counts after analysis ends |
| **Hardware-Aware** | Auto-detects CPU/GPU, filters compatible models dynamically |
| **LAN Access** | Access the dashboard from any device on your local network |

---

## 🚀 Quick Start (Recommended)

### Prerequisites

Before starting, make sure you have:

1. **Python 3.10+** installed and added to PATH
2. **Node.js 18+** and npm installed
3. **Git** (to clone the repository)

---

### 💻 Windows Users (Fully Automated Setup - Easiest)

If you are on Windows, the system setup is **100% automated**! You do not need to run commands manually:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Ahmet-zmn/FMD.git
   cd FMD
   ```
2. **Download Model Weights** (See Step 4 below).
3. **Double-click `QuickStart.bat`** (or **`StartSystem.vbs`**).
   - *On the very first launch, the scripts will automatically check for Python, install all backend dependencies directly to your system's global Python environment, and run `npm install` for frontend packages. No manual command execution needed!*

---

### 🐧 macOS / Linux Users (Manual Step-by-Step Setup)

#### 1. Clone the Repository

```bash
git clone https://github.com/Ahmet-zmn/FMD.git
cd FMD
```

#### 2. Set Up the Backend

```bash
cd backend
pip3 install -r requirements.txt
cd ..
```

#### 3. Set Up the Frontend

```bash
cd frontend
npm install
cd ..
```

#### 4. Download Model Weights

Download the pre-trained weights from **Zenodo**:

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20171884.svg)](https://doi.org/10.5281/zenodo.20171884)

```bash
# Download all weights at once:
# Visit https://zenodo.org/records/20171884 and click "Download all"
# Or download individual files and place them in the correct directories:
```

| Format | Directory | Usage |
|---|---|---|
| `.pt` (PyTorch) | `weights/pt/` | Training, CPU & GPU inference |
| `.onnx` (ONNX) | `weights/onnx/` | Cross-platform CPU & GPU inference |
| `.engine` (TensorRT) | `weights/engine/` | Export locally: `yolo export model=weights/pt/yolo11n.pt format=engine` |
| `.openvino` (OpenVINO) | `weights/openvino/` | Export locally: `yolo export model=weights/pt/yolo11n.pt format=openvino` |

> **Note:** TensorRT (`.engine`) files are hardware-specific and must be exported on your own GPU. OpenVINO models can also be generated locally from `.pt` files.

#### 5. Start the System

You have **two options** to start on Windows:

**Option A — Silent Background Mode (Recommended for daily use):**

Double-click **`StartSystem.vbs`**. This starts both backend and frontend in hidden windows and opens the dashboard automatically. No console windows will appear. (If this is the first launch, it will run the automated setup window first).

**Option B — Debug Mode (Shows console output):**

Double-click **`QuickStart.bat`**. This opens console windows for both services so you can see logs and debug output. (If this is the first launch, it will run the automated setup first).

**On macOS / Linux:**

Start the backend in one terminal tab:
```bash
cd backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Start the frontend in another terminal tab:
```bash
cd frontend
npm run dev
```

Open `QuickStart.html` in your browser.

#### 6. Open the Dashboard

After starting, the dashboard (**`QuickStart.html`**) opens automatically. If it doesn't:

1. Open `QuickStart.html` manually from the project folder
2. Wait for the **"System Online"** badge to appear (usually 5–10 seconds)
3. Click the **dashboard link** shown on the page

> **LAN Access:** The page displays your machine's LAN IP (e.g., `https://192.168.1.115:5173`). Open this URL from any device on your network to access the dashboard remotely.

---

## 🔴 Stopping the System

Double-click **`StopSystem.bat`** to safely terminate all backend and frontend processes.

---

## 📖 How to Use

### Image Analysis (Upload or Camera)

1. On the main dashboard, click **"Upload Image"** or **"Camera Capture"**
2. Select or capture an image of the animal
3. Click **"🚀 Analyze"**
4. View the results: detected lesions, confidence scores, and expert interpretation

### Live Video / Camera Diagnosis

1. Click the **"📡 Live Diagnosis"** button on the main page
2. Choose a source:
   - **📷 Start Camera** — Uses your device's camera for real-time analysis
   - **📁 Upload Video** — Load a pre-recorded video file
3. The system processes frames in real-time and displays:
   - OBB detections drawn on the video
   - Live statistics panel (frame count, alarm status, detection counts)
   - FPS and model info
4. When the video ends (or you click **Stop**), a **Session Summary Report** appears below the video showing:
   - Total frames processed
   - Total Mouth Sores and Nail Sores detected
   - Diagnostic interpretation
5. Click **"📥 Export Results to History"** to save the report and return to the main page

### System Settings

Click **"⚙️ System Settings"** in the header to:

- **Select Device:** Switch between CPU and CUDA (GPU)
- **Select Model:** Choose from available weight files (filtered by hardware compatibility)
- **Video Metrics:** Toggle which statistics appear on the live diagnosis overlay

---

## 📂 Project Structure

```text
FMD/
├── StartSystem.vbs      # 🟢 Start (silent background mode)
├── StopSystem.bat       # 🔴 Stop all services
├── QuickStart.bat       # 🟡 Start (debug mode with consoles)
├── QuickStart.html      # 🌐 Dashboard & connectivity monitor
├── DockerStart.bat      # 🐳 Docker Compose launcher
│
├── backend/             # FastAPI Server & AI Inference
│   ├── app/
│   │   ├── main.py      # App entry point & CORS config
│   │   ├── config.py    # Settings (model path, thresholds)
│   │   ├── routers/     # API endpoints (inference, settings, health)
│   │   ├── services/    # Model loading & prediction logic
│   │   └── utils/       # OBB drawing utilities
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/            # React + Vite Application
│   ├── src/
│   │   ├── App.jsx      # Main application component
│   │   ├── components/  # UI components
│   │   │   ├── LiveDetectionPanel.jsx  # Real-time video analysis
│   │   │   ├── SettingsPanel.jsx       # System configuration
│   │   │   ├── ResultsPanel.jsx        # Image analysis results
│   │   │   └── ...
│   │   ├── api/         # Backend API client
│   │   └── hooks/       # React hooks (i18n, session history)
│   └── Dockerfile
│
├── weights/             # AI Model Files
│   ├── models.json      # Model manifest with download URLs
│   ├── pt/              # PyTorch models
│   ├── onnx/            # ONNX models
│   ├── engine/          # TensorRT engines
│   └── openvino/        # OpenVINO IR models
│
└── docker-compose.yml   # Full stack orchestration
```

---

## 🐳 Docker Deployment (Alternative)

```bash
# Option 1: Use the launcher script
# Double-click DockerStart.bat

# Option 2: Command line
docker-compose up --build
```

- **Web UI:** `http://localhost`
- **API Docs:** `http://localhost:8000/docs`

---

## ⚙️ Configuration

Environment variables can be set in a `.env` file in the project root:

| Variable | Default | Description |
|---|---|---|
| `MODEL_PATH` | `weights/onnx/yolo11n.onnx` | Path to the default model weight file |
| `DEFAULT_DEVICE` | `cpu` | Default compute device (`cpu` or `cuda:0`) |
| `CONFIDENCE_THRESHOLD` | `0.15` | Minimum confidence for detections |
| `IOU_THRESHOLD` | `0.45` | IoU threshold for NMS |
| `PORT` | `8000` | Backend API port |

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/predict` | Run inference on an uploaded image |
| `POST` | `/api/predict/stream` | Lightweight inference for video frames |
| `GET` | `/api/settings` | Get available models and devices |
| `POST` | `/api/settings` | Update model and device |
| `GET` | `/api/health` | System health check with hardware info |

Full interactive API documentation available at `http://localhost:8000/docs` when the backend is running.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Developed for Veterinary AI Research and Diagnostics.*
