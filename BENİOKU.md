# FMD Yapay Zeka Teşhis Sistemi 🐄🩺

![Durum](https://img.shields.io/badge/Durum-Üretime_Hazır-success)
![YZ](https://img.shields.io/badge/YZ-YOLOv11--OBB-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)
![Docker](https://img.shields.io/badge/Docker-Destekleniyor-blue)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20171884.svg)](https://doi.org/10.5281/zenodo.20171884)

**Şap Hastalığı (FMD)** tespiti için geliştirilmiş yüksek performanslı yapay zeka teşhis platformu. Gelişmiş **Eğik Sınırlayıcı Kutular (OBB)** kullanarak ağız ve tırnak lezyonlarını hassas bir şekilde tespit eder. Görüntü yükleme, kamera çekimi ve **gerçek zamanlı video/kamera akışı analizi** destekler.

### Tespit Sınıfları
Modeller **6 sınıfı** tespit eder: `Mouth Saliva`, `Mouth Sores`, `Nail Sores`, `Head`, `Healthy Mouth`, `Healthy Nails`

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

---

### 💻 Windows Kullanıcıları (Tam Otomatik Kurulum - En Kolay Yol)

Eğer Windows işletim sistemi kullanıyorsanız, sistem kurulumu **%100 otomatiktir**! Manuel olarak hiçbir komut satırı çalıştırmanıza gerek yoktur:

1. **Depoyu Klonlayın:**
   ```bash
   git clone https://github.com/Ahmet-zmn/FMD.git
   cd FMD
   ```
2. **Model Ağırlıklarını İndirin** (Aşağıdaki 4. Adıma bakın).
3. **`QuickStart.bat`** (veya **`StartSystem.vbs`**) dosyasına çift tıklayın.
   - *İlk çalıştırmada, sistem otomatik olarak bilgisayarda Python kurulu olup olmadığını kontrol edecek, gerekli tüm backend kütüphanelerini doğrudan sisteminizin genel Python ortamına kuracak ve frontend paketleri için `npm install` komutunu çalıştıracaktır. Sizin hiçbir şey yapmanıza gerek kalmaz!*

---

### 🐧 macOS / Linux Kullanıcıları (Manuel Adım Adım Kurulum)

#### 1. Depoyu Klonlayın

```bash
git clone https://github.com/Ahmet-zmn/FMD.git
cd FMD
```

#### 2. Backend Kurulumu

```bash
cd backend
pip3 install -r requirements.txt
cd ..
```

#### 3. Frontend Kurulumu

```bash
cd frontend
npm install
cd ..
```

#### 4. Model Ağırlıklarını İndirin

Eğitilmiş ağırlıkları **Zenodo**'dan indirin:

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20171884.svg)](https://doi.org/10.5281/zenodo.20171884)

```bash
# Tüm ağırlıkları tek seferde indirmek için:
# https://zenodo.org/records/20171884 adresine gidin ve "Download all" tıklayın
# Veya dosyaları tek tek indirip doğru klasörlere yerleştirin:
```

| Format | Klasör | Kullanım |
|---|---|---|
| `.pt` (PyTorch) | `weights/pt/` | Eğitim, CPU & GPU çıkarım |
| `.onnx` (ONNX) | `weights/onnx/` | Platformdan bağımsız CPU & GPU çıkarım |
| `.engine` (TensorRT) | `weights/engine/` | Yerel dışa aktarım: `yolo export model=weights/pt/yolo11n.pt format=engine` |
| `.openvino` (OpenVINO) | `weights/openvino/` | Yerel dışa aktarım: `yolo export model=weights/pt/yolo11n.pt format=openvino` |

> **Not:** TensorRT (`.engine`) dosyaları donanıma özeldir ve kendi GPU'nuzda dışa aktarılmalıdır. OpenVINO modelleri de `.pt` dosyalarından yerel olarak üretilebilir.

#### 5. Sistemi Başlatın

Windows üzerinde başlatmak için **iki seçenek** vardır:

**Seçenek A — Sessiz Arka Plan Modu (Günlük kullanım için önerilir):**

**`StartSystem.vbs`** dosyasına çift tıklayın. Backend ve frontend gizli pencerelerde başlatılır ve kontrol paneli otomatik olarak açılır. Hiçbir konsol penceresi görünmez. (Eğer ilk çalıştırma ise, önce otomatik kurulum penceresi açılacaktır).

**Seçenek B — Hata Ayıklama Modu (Konsol çıktısını gösterir):**

**`QuickStart.bat`** dosyasına çift tıklayın. Her iki servis için de konsol penceresi açılır, böylece logları ve hata çıktılarını görebilirsiniz. (Eğer ilk çalıştırma ise, önce otomatik kurulum penceresi açılacaktır).

**macOS / Linux Üzerinde:**

Backend'i başlatmak için bir terminal sekmesi açın:
```bash
cd backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Frontend'i başlatmak için başka bir terminal sekmesi açın:
```bash
cd frontend
npm run dev
```

Tarayıcınızdan `QuickStart.html` dosyasını açın.

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
