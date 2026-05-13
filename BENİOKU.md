# FMD Yapay Zeka Teşhis Sistemi 🐄🩺

![Durum](https://img.shields.io/badge/Durum-Üretime_Hazır-success)
![YZ](https://img.shields.io/badge/YZ-YOLOv11--OBB-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)
![Docker](https://img.shields.io/badge/Docker-Destekleniyor-blue)

**Şap Hastalığı (FMD)** tespiti için geliştirilmiş yüksek performanslı yapay zeka teşhis platformu. Gelişmiş **Eğik Sınırlayıcı Kutular (OBB)** kullanarak ağız ve tırnak lezyonlarını hassas bir şekilde tespit eder. Görüntü yükleme, kamera çekimi ve **gerçek zamanlı video/kamera akışı analizi** destekler.

---

## 🌟 Temel Özellikler

| Özellik | Açıklama |
|---|---|
| **OBB Tespiti** | Ağız ve tırnak lezyonları için hassas döndürülmüş sınırlayıcı kutular |
| **Çoklu Model Desteği** | `.pt`, `.onnx`, `.engine` (TensorRT), `OpenVINO` formatları |
| **Canlı Teşhis** | Gerçek zamanlı video/kamera akışı analizi ve FPS takibi |
| **Alarm Sistemi** | Canlı akışta lezyon tespit edildiğinde anında görsel uyarı |
| **Birikimli Rapor** | Analiz sonunda toplam lezyon sayılarıyla oturum özeti |
| **Donanım Uyumlu** | CPU/GPU otomatik algılama, uyumlu modelleri dinamik filtreleme |
| **LAN Erişimi** | Yerel ağdaki herhangi bir cihazdan panoya erişim |

---

## 🚀 Hızlı Başlangıç (Önerilen)

### Ön Gereksinimler

Başlamadan önce aşağıdakilerin kurulu olduğundan emin olun:

1. **Python 3.10+** — PATH'e eklenmiş olmalı
2. **Node.js 18+** ve npm
3. **Git** (depoyu klonlamak için)

### Adım Adım Kurulum

#### 1. Depoyu Klonlayın

```bash
git clone https://github.com/Ahmet-zmn/FMD.git
cd FMD
```

#### 2. Backend Kurulumu

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate        # Windows
pip install -r requirements.txt
cd ..
```

#### 3. Frontend Kurulumu

```bash
cd frontend
npm install
cd ..
```

#### 4. Model Ağırlıklarını Ekleyin

Eğitilmiş ağırlık dosyalarınızı `weights/` altındaki ilgili klasörlere yerleştirin:

```
weights/
├── pt/          # PyTorch ağırlıkları (.pt)
├── onnx/        # ONNX ağırlıkları (.onnx)
├── engine/      # TensorRT motorları (.engine)
└── openvino/    # OpenVINO IR modelleri (_openvino_model/)
```

> **Not:** En az bir ağırlık dosyası gereklidir. Sistem varsayılan olarak `weights/onnx/yolo11n.onnx` dosyasını kullanır.

#### 5. Sistemi Başlatın

Başlatmak için **iki seçenek** vardır:

**Seçenek A — Sessiz Arka Plan Modu (Günlük kullanım için önerilir):**

**`StartSystem.vbs`** dosyasına çift tıklayın. Backend ve frontend gizli pencerelerde başlatılır ve kontrol paneli otomatik olarak açılır. Hiçbir konsol penceresi görünmez.

**Seçenek B — Hata Ayıklama Modu (Konsol çıktısını gösterir):**

**`QuickStart.bat`** dosyasına çift tıklayın. Her iki servis için de konsol penceresi açılır, böylece logları ve hata çıktılarını görebilirsiniz.

#### 6. Kontrol Panelini Açın

Başlatma sonrası kontrol paneli (**`QuickStart.html`**) otomatik olarak açılır. Açılmazsa:

1. Proje klasöründen `QuickStart.html` dosyasını manuel olarak açın
2. **"System Online"** rozetinin görünmesini bekleyin (genellikle 5–10 saniye)
3. Sayfadaki **kontrol paneli bağlantısına** tıklayın

> **LAN Erişimi:** Sayfa makinenizin yerel ağ IP adresini gösterir (örn. `https://192.168.1.115:5173`). Bu URL'yi ağınızdaki herhangi bir cihazdan açarak panoya uzaktan erişebilirsiniz.

---

## 🔴 Sistemi Durdurma

Tüm backend ve frontend süreçlerini güvenle sonlandırmak için **`StopSystem.bat`** dosyasına çift tıklayın.

---

## 📖 Kullanım Kılavuzu

### Görüntü Analizi (Yükleme veya Kamera)

1. Ana panoda **"Görüntü Yükle"** veya **"Kamera Çekimi"** butonuna tıklayın
2. Hayvanın görüntüsünü seçin veya çekin
3. **"🚀 Analiz Et"** butonuna tıklayın
4. Sonuçları görüntüleyin: tespit edilen lezyonlar, güven skorları ve uzman yorumu

### Canlı Video / Kamera Teşhisi

1. Ana sayfadaki **"📡 Canlı Teşhis"** butonuna tıklayın
2. Bir kaynak seçin:
   - **📷 Kamerayı Başlat** — Cihazınızın kamerasını gerçek zamanlı analiz için kullanır
   - **📁 Video Yükle** — Önceden kaydedilmiş bir video dosyası yükler
3. Sistem kareleri gerçek zamanlı olarak işler ve şunları gösterir:
   - Video üzerinde çizilmiş OBB tespitleri
   - Canlı istatistik paneli (kare sayısı, alarm durumu, tespit sayıları)
   - FPS ve model bilgisi
4. Video bittiğinde (veya **Durdur**'a tıkladığınızda), videonun altında bir **Oturum Özet Raporu** belirir:
   - İşlenen toplam kare sayısı
   - Toplam Ağız Yarası ve Tırnak Yarası tespit sayıları
   - Teşhis yorumu
5. **"📥 Sonuçları Geçmişe Aktar"** butonuna tıklayarak raporu kaydedin ve ana sayfaya dönün

### Sistem Ayarları

Üst menüdeki **"⚙️ Sistem Ayarları"** butonuna tıklayarak:

- **Cihaz Seçimi:** CPU ve CUDA (GPU) arasında geçiş yapın
- **Model Seçimi:** Mevcut ağırlık dosyaları arasından seçim yapın (donanım uyumuna göre filtrelenir)
- **Video Metrikleri:** Canlı teşhis ekranında hangi istatistiklerin görüneceğini açıp kapatın

---

## 📂 Proje Yapısı

```text
FMD/
├── StartSystem.vbs      # 🟢 Başlat (sessiz arka plan modu)
├── StopSystem.bat       # 🔴 Tüm servisleri durdur
├── QuickStart.bat       # 🟡 Başlat (konsollu hata ayıklama modu)
├── QuickStart.html      # 🌐 Kontrol paneli ve bağlantı izleyici
├── DockerStart.bat      # 🐳 Docker Compose başlatıcı
│
├── backend/             # FastAPI Sunucusu ve YZ Çıkarımı
│   ├── app/
│   │   ├── main.py      # Uygulama giriş noktası ve CORS ayarları
│   │   ├── config.py    # Ayarlar (model yolu, eşik değerleri)
│   │   ├── routers/     # API uç noktaları (çıkarım, ayarlar, sağlık)
│   │   ├── services/    # Model yükleme ve tahmin mantığı
│   │   └── utils/       # OBB çizim araçları
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/            # React + Vite Uygulaması
│   ├── src/
│   │   ├── App.jsx      # Ana uygulama bileşeni
│   │   ├── components/  # Arayüz bileşenleri
│   │   │   ├── LiveDetectionPanel.jsx  # Gerçek zamanlı video analizi
│   │   │   ├── SettingsPanel.jsx       # Sistem yapılandırması
│   │   │   ├── ResultsPanel.jsx        # Görüntü analiz sonuçları
│   │   │   └── ...
│   │   ├── api/         # Backend API istemcisi
│   │   └── hooks/       # React hook'ları (i18n, oturum geçmişi)
│   └── Dockerfile
│
├── weights/             # YZ Model Dosyaları
│   ├── models.json      # Model bildirim dosyası ve indirme bağlantıları
│   ├── pt/              # PyTorch modelleri
│   ├── onnx/            # ONNX modelleri
│   ├── engine/          # TensorRT motorları
│   └── openvino/        # OpenVINO IR modelleri
│
└── docker-compose.yml   # Tam yığın düzenlemesi
```

---

## 🐳 Docker ile Kurulum (Alternatif)

```bash
# Seçenek 1: Başlatıcı betiği kullanın
# DockerStart.bat dosyasına çift tıklayın

# Seçenek 2: Komut satırı
docker-compose up --build
```

- **Web Arayüzü:** `http://localhost`
- **API Dökümantasyonu:** `http://localhost:8000/docs`

---

## ⚙️ Yapılandırma

Ortam değişkenleri proje kök dizinindeki `.env` dosyasında ayarlanabilir:

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `MODEL_PATH` | `weights/onnx/yolo11n.onnx` | Varsayılan model ağırlık dosyasının yolu |
| `DEFAULT_DEVICE` | `cpu` | Varsayılan hesaplama cihazı (`cpu` veya `cuda:0`) |
| `CONFIDENCE_THRESHOLD` | `0.15` | Tespitler için minimum güven eşiği |
| `IOU_THRESHOLD` | `0.45` | NMS için IoU eşiği |
| `PORT` | `8000` | Backend API portu |

---

## 📝 API Uç Noktaları

| Metot | Uç Nokta | Açıklama |
|---|---|---|
| `POST` | `/api/predict` | Yüklenen görüntü üzerinde çıkarım yap |
| `POST` | `/api/predict/stream` | Video kareleri için hafif çıkarım |
| `GET` | `/api/settings` | Mevcut modelleri ve cihazları getir |
| `POST` | `/api/settings` | Model ve cihazı güncelle |
| `GET` | `/api/health` | Donanım bilgisiyle sistem sağlık kontrolü |

Backend çalışırken tam etkileşimli API dökümantasyonuna `http://localhost:8000/docs` adresinden erişilebilir.

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen Pull Request göndermekten çekinmeyin.

## 📄 Lisans

MIT Lisansı altında dağıtılmaktadır. Daha fazla bilgi için `LICENSE` dosyasına bakınız.

---

*Veteriner Yapay Zeka Araştırma ve Teşhis için geliştirilmiştir.*
