const API_BASE_URL = "http://localhost:3001";

export async function fetchOrders(page = 1, limit = 10) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/orders?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `API hatası: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
