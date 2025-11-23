import "./OrderTable.css";

function OrderTable({ orders, currentPage, totalPages, onPageChange, loading }) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="order-table-container">
      {loading && (
        <div className="table-loading">
          <div className="loading-spinner"></div>
          <span>Yükleniyor...</span>
        </div>
      )}
      <table className="order-table">
        <thead>
          <tr>
            <th>İsim Soyisim</th>
            <th>Kargo Teslim Tarihi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="2" className="no-data">
                <div className="loading-spinner"></div>
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan="2" className="no-data">
                Henüz sipariş bulunmamaktadır.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.maskedName}</td>
                <td>{order.deliveryDate}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {orders.length > 0 && (
        <div className="pagination">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Önceki
          </button>
          <span className="pagination-info">
            Sayfa {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderTable;
