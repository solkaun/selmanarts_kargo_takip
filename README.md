# Kargo Takip - Selman Arts

Shopify store'unuzdan unfulfilled order'ları çekip, müşteri bilgilerini maskeleyerek ve tahmini teslim tarihlerini göstererek listeleyen React uygulaması.

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyası oluşturun ve Shopify bilgilerinizi ekleyin:
```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-access-token-here
```

**ÖNEMLİ GÜVENLİK NOTU:** 
- Access token artık backend'de saklanıyor (server.js)
- `.env` dosyasındaki token'lar client-side'a expose edilmez
- Token sadece backend'de kullanılır, frontend asla göremez

## Shopify API Token Alma

1. Shopify Admin paneline giriş yapın
2. Settings > Apps and sales channels > Develop apps
3. "Create an app" butonuna tıklayın
4. App adı verin ve oluşturun
5. "Configure Admin API scopes" bölümünden `read_orders` yetkisini verin
6. "Install app" butonuna tıklayın
7. "API credentials" sekmesinden "Admin API access token" değerini kopyalayın

## Çalıştırma

```bash
npm run dev
```

Bu komut hem backend server'ı (port 3001) hem de frontend dev server'ı (port 5173) başlatır.

## Özellikler

- ✅ Shopify Admin API ile unfulfilled order'ları çekme
- ✅ Soyisim maskeleme (sadece ilk karakter görünür)
- ✅ Pagination desteği
- ✅ Tahmini kargo teslim tarihi hesaplama (Aralık 2025 - Ocak 2026)
- ✅ Responsive tablo tasarımı

