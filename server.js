import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "https://kargo.selmanarts.com",
    credentials: true,
  })
);

app.use(express.json());

function maskBillingName(billingName) {
  if (!billingName) return "İsimsiz Müşteri";

  const parts = billingName.trim().split(/\s+/);
  if (parts.length === 0) return "İsimsiz Müşteri";

  const firstName =
    parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();

  const maskedParts = parts.slice(1).map((word) => {
    if (word.length === 0) return "";
    const firstChar = word.charAt(0).toUpperCase();
    return firstChar + "*".repeat(Math.max(0, word.length - 1));
  });

  return [firstName, ...maskedParts].join(" ").trim();
}

function calculateDeliveryDate(orderIndex, totalOrders) {
  const startDate = new Date("2025-12-31");
  const endDate = new Date("2026-01-31");
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  const dayOffset = Math.floor((orderIndex / totalOrders) * totalDays);
  const deliveryDate = new Date(startDate);
  deliveryDate.setDate(deliveryDate.getDate() + dayOffset);

  const day = String(deliveryDate.getDate()).padStart(2, "0");
  const month = String(deliveryDate.getMonth() + 1).padStart(2, "0");
  const year = deliveryDate.getFullYear();

  return `${day}.${month}.${year}`;
}

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
  values.push(currentValue.trim());

  return values;
}

function parseCSV(csvContent) {
  const lines = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const yColumnIndex = 24;
  const fulfillmentStatusIndex = headers.indexOf("Fulfillment Status");
  const createdAtIndex = headers.indexOf("Created at");
  const nameIndex = headers.indexOf("Name");

  const orders = [];
  const seenOrders = new Set();

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const fulfillmentStatus = values[fulfillmentStatusIndex]?.trim();
    if (fulfillmentStatus !== "unfulfilled") continue;

    const createdAt = values[createdAtIndex]?.trim();
    if (createdAt && !createdAt.startsWith("2025-")) continue;

    const billingName = values[yColumnIndex]?.trim();
    if (!billingName) continue;

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

app.get("/api/orders", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const csvPath = join(__dirname, "orders_export.csv");
    const csvContent = readFileSync(csvPath, "utf-8");
    const orders = parseCSV(csvContent);

    const sortedOrders = orders.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const totalOrders = sortedOrders.length;
    const totalPages = Math.ceil(totalOrders / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

    const processedOrders = paginatedOrders.map((order, index) => {
      const maskedName = maskBillingName(order.billingName);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
