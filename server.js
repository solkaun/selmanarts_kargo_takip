import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// CORS ayarları - sadece frontend'den gelen isteklere izin ver
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Utility functions
function maskBillingName(billingName) {
  if (!billingName) return "İsimsiz Müşteri";

  const parts = billingName.trim().split(/\s+/);
  if (parts.length === 0) return "İsimsiz Müşteri";

  // İlk kelime tam görünecek, ilk harfi büyük
  const firstName =
    parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();

  // İlk boşluktan sonraki her kelime için: ilk harf (büyük) + "*" (kelimenin geri kalan uzunluğu kadar)
  const maskedParts = parts.slice(1).map((word) => {
    if (word.length === 0) return "";
    const firstChar = word.charAt(0).toUpperCase();
    return firstChar + "*".repeat(Math.max(0, word.length - 1));
  });

  return [firstName, ...maskedParts].join(" ").trim();
}

function calculateDeliveryDate(orderIndex, totalOrders) {
  // Aralık 2025 başlangıcı: 31 Aralık 2025
  const startDate = new Date("2025-12-31");

  // Ocak 2026 sonu: 31 Ocak 2026
  const endDate = new Date("2026-01-31");

  // Toplam gün sayısı
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  // Order'ın sırasına göre gün hesapla (eşit dağılım)
  const dayOffset = Math.floor((orderIndex / totalOrders) * totalDays);

  const deliveryDate = new Date(startDate);
  deliveryDate.setDate(deliveryDate.getDate() + dayOffset);

  // Tarihi formatla: DD.MM.YYYY
  const day = String(deliveryDate.getDate()).padStart(2, "0");
  const month = String(deliveryDate.getMonth() + 1).padStart(2, "0");
  const year = deliveryDate.getFullYear();

  return `${day}.${month}.${year}`;
}

// CSV satırını parse et (tırnak içindeki virgülleri dikkate alarak)
function parseCSVLine(line) {
  const values = [];
  let currentValue = "";
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim()); // Son değer

  return values;
}

// CSV dosyasını parse et
function parseCSV(csvContent) {
  const lines = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  if (lines.length < 2) return [];

  // Header satırını parse et
  const headers = parseCSVLine(lines[0]);

  // Y kolonu = 25. kolon = index 24 (0-based)
  const yColumnIndex = 24;

  // Diğer kolonların index'lerini bul
  const fulfillmentStatusIndex = headers.indexOf("Fulfillment Status");
  const createdAtIndex = headers.indexOf("Created at");
  const nameIndex = headers.indexOf("Name"); // Order numarası için

  const orders = [];
  const seenOrders = new Set(); // Aynı order'ı birden fazla kez eklememek için

  // Her satırı parse et (1. satırdan sonra, yani header'dan sonra)
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    // Fulfillment Status "unfulfilled" olanları filtrele
    const fulfillmentStatus = values[fulfillmentStatusIndex]?.trim();
    if (fulfillmentStatus !== "unfulfilled") continue;

    // 2025 yılı kontrolü
    const createdAt = values[createdAtIndex]?.trim();
    if (createdAt && !createdAt.startsWith("2025-")) continue;

    // Y kolonundan Billing Name'i al (1. satırdan sonraki tüm satırlardan)
    const billingName = values[yColumnIndex]?.trim();
    if (!billingName) continue;

    // Aynı order'ı birden fazla kez eklememek için (lineitem'ler için aynı order birden fazla satırda olabilir)
    const orderName = values[nameIndex]?.trim() || "";
    if (orderName && seenOrders.has(orderName)) continue;
    if (orderName) seenOrders.add(orderName);

    orders.push({
      billingName,
      createdAt: createdAt || "",
    });
  }

  return orders;
}

// Orders endpoint
app.get("/api/orders", async (req, res) => {
  // Pagination parametreleri
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    // CSV dosyasını oku
    const csvPath = join(__dirname, "orders_export.csv");
    const csvContent = readFileSync(csvPath, "utf-8");

    // CSV'yi parse et
    const orders = parseCSV(csvContent);

    // Order'ları oluşturulma tarihine göre sırala (en eski en önce)
    const sortedOrders = orders.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const totalOrders = sortedOrders.length;
    const totalPages = Math.ceil(totalOrders / limit);

    // Pagination: sadece ilgili sayfadaki order'ları al
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

    // Her order için işleme yap: maskeleme ve delivery date hesaplama
    const processedOrders = paginatedOrders.map((order, index) => {
      const maskedName = maskBillingName(order.billingName);

      // Global order index'i hesapla (pagination için)
      const globalIndex = startIndex + index;
      const deliveryDate = calculateDeliveryDate(globalIndex, totalOrders);

      return {
        id: `order-${globalIndex}`,
        maskedName: maskedName,
        deliveryDate: deliveryDate,
      };
    });

    res.json({
      data: processedOrders,
      pagination: {
        page,
        limit,
        totalPages,
        totalOrders,
      },
    });
  } catch (error) {
    console.error("CSV Parse Error:", error);
    res.status(500).json({
      error: error.message || "Siparişler yüklenirken bir hata oluştu",
    });
  }
});

// Production'da static dosyaları serve et
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "dist")));

  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
