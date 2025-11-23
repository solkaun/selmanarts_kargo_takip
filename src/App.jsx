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
  const [showTable, setShowTable] = useState(false);

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

  if (!showTable) {
    return (
      <div className="app-container">
        <div className="welcome-message">
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
          <div className="message-content">
            <p>Sevgili Müşterilerimiz,</p>
            <p>
              Ürünlerimizin tamamı bizzat el üretimi ile hazırlanmakta ve seri
              üretim yapılmamaktadır. Bu nedenle bazı siparişlerimizin teslimat
              süreleri beklediğimizden daha uzun sürebilmektedir. Anlayışınız ve
              sabrınız için teşekkür ederiz.
            </p>
            <p>
              Siparişinizin durumunu her an kontrol edebilirsiniz:{" "}
              <a
                href="https://account.selmanarts.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://account.selmanarts.com
              </a>{" "}
              üzerinden, siparişinizi oluştururken kullandığınız e-posta ile
              giriş yaparak sipariş bilgilerinize ve tahmini teslim tarihine
              ulaşabilirsiniz.
            </p>
            <p>
              Biz kalite ve şeffaflığı her zaman önceliğimiz olarak sunuyoruz ve
              siparişlerinizin güvenle hazırlanıp teslim edildiğinden emin
              olabilirsiniz.
            </p>
          </div>
          <button className="show-table-btn" onClick={() => setShowTable(true)}>
            Teslim Tarihleri
          </button>
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
