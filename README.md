# FMD AI Diagnosis System: Professional OBB-based Pathology Detection 🐄🩺

![Status](https://img.shields.io/badge/Status-Production--Ready-success)
![AI](https://img.shields.io/badge/AI-YOLOv11--OBB-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)

A high-performance, expert-grade AI diagnostic platform for **Foot and Mouth Disease (FMD)** detection. This system utilizes advanced **Oriented Bounding Boxes (OBB)** to identify symptoms with high precision, providing real-time diagnostic reports and hardware performance metrics.

---

## 🌟 Key Features

### 🧠 Advanced AI Core
- **OBB Detection:** Precise diagonal alignment for mouth and nail lesions, superior to standard bounding boxes.
- **Multi-Format Support:** Seamlessly run `.pt`, `.onnx`, `.engine` (TensorRT), and `OpenVINO` models.
- **Dynamic Inference Latency:** Literature-standard performance reporting in milliseconds (ms) for every analysis.

### 💻 Smart Hardware Management
- **Automatic Hardware Discovery:** Real-time detection of CPU, GPU (NVIDIA CUDA), RAM, and OS details.
- **Smart Filtering:** The UI dynamically filters compatible models based on your selected hardware (e.g., hiding TensorRT models when in CPU mode).
- **GPU Acceleration:** Fully optimized for NVIDIA CUDA cores using ONNX Runtime and PyTorch.

### 📊 Professional UI/UX
- **Interactive Dashboard:** Premium dark/light modes with glassmorphism aesthetics.
- **Hardware Badges:** Instant visual feedback of the current compute environment in the footer.
- **Detailed Findings:** Class-based summary and expert-level interpretation for each scan.

---

## 🚀 Quick Start (Docker - Recommended)

Deploy the entire stack in seconds using Docker Compose:

1. **Clone & Prepare:**
   ```bash
   git clone https://github.com/yourusername/fmd-diagnosis.git
   cd fmd-diagnosis
   ```

2. **Add Weights:** Place your weight files into the `/weights` directory.

3. **Launch:**
   ```bash
   docker-compose up --build
   ```
   - **Web UI:** `http://localhost`
   - **API Docs:** `http://localhost:8000/docs`

---

## 🛠 Manual Installation

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Activate venv and install
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
├── backend/            # FastAPI Server & AI Logic
│   ├── app/            # Application Core
│   ├── Dockerfile      # Backend Container Config
│   └── requirements.txt# Python Dependencies
├── frontend/           # React Application
│   ├── src/            # UI Components & Hooks
│   └── Dockerfile      # Frontend Container Config
├── weights/            # AI Model Files (Local Volume)
└── docker-compose.yml  # Full Stack Orchestration
```

---

## 📝 Performance Metrics in Literature
This project adheres to scientific standards by reporting:
- **Pre-processing Time:** Image resizing and normalization.
- **Inference Latency (ms):** Pure model forward pass time.
- **Post-processing:** OBB decoding and NMS.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed for Veterinary AI Research and Diagnostics.*
