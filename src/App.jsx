import { useState, useEffect } from "react";
import { fetchOrders } from "./services/shopifyApi";
import OrderTable from "./components/OrderTable";
import "./App.css";

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    loadOrders(currentPage);
  }, [currentPage]);

  const loadOrders = async (page) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchOrders(page, 10);
      setOrders(result.data || []);
      setPagination(result.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Siparişler yüklenirken bir hata oluştu");
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => loadOrders(currentPage)}>Tekrar Dene</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <img
        src="/logo.webp"
        alt="Selmanarts Logo"
        style={{
          width: "150px",
          height: "auto",
          objectFit: "contain",
          margin: "0 auto",
          display: "block",
          marginBottom: "20px",
        }}
      />
      <OrderTable
        orders={orders}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
      <p
        className="footer-text"
        style={{ fontSize: "10px", marginTop: "20px", textAlign: "center" }}
      >
        Bu web sitesinde sunulan ticari ve analitik veriler, Shopify altyapısı
        aracılığıyla sağlanan kayıtlar temel alınarak hazırlanmıştır.
      </p>
      <div
        id="copyright"
        align="center"
        style={{ fontSize: "0.75rem", marginTop: "10px" }}
      >
        &copy; 2025 - selmanarts.com - All Rights Reserved.
      </div>
    </div>
  );
}

export default App;
