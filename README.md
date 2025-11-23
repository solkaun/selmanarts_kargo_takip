# Kargo Takip - Selman Arts

CSV dosyasından unfulfilled order'ları okuyup, müşteri bilgilerini maskeleyerek ve tahmini teslim tarihlerini göstererek listeleyen React uygulaması.

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `orders_export.csv` dosyasını proje root dizinine yerleştirin.

## Çalıştırma

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

Production modunda server port 3001'de çalışır ve frontend static dosyalarını serve eder.

## Özellikler

- ✅ CSV dosyasından order verilerini okuma
- ✅ İsim maskeleme (ilk kelime tam, sonraki kelimeler sadece ilk harf görünür)
- ✅ Pagination desteği
- ✅ Tahmini kargo teslim tarihi hesaplama (Aralık 2025 - Ocak 2026)
- ✅ Responsive tablo tasarımı

