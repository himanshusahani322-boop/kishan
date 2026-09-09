const API_BASE = '/api';

function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const effectiveToken = token || localStorage.getItem('ks_auth_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }
  return headers;
}

export const marketplaceService = {
  // Crops & Mandi Benchmarks
  async getCrops() {
    const res = await fetch(`${API_BASE}/crops`);
    if (!res.ok) throw new Error('Failed to load crops');
    return res.json();
  },

  async getMandiPrices() {
    const res = await fetch(`${API_BASE}/mandi-prices`);
    if (!res.ok) throw new Error('Failed to load mandi prices');
    return res.json();
  },

  // Products
  async getProducts(params?: Record<string, any>) {
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
  },

  async getProductById(id: string) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(data: { product: any; inventory: any; imageUrls?: string[] }, token?: string) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create product listing');
    return result;
  },

  async updateProduct(id: string, updates: any, token?: string) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update product');
    return result;
  },

  async deleteProduct(id: string, token?: string) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
    return res.json();
  },

  // Cart & Wishlist
  async getCart(token?: string) {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to fetch cart');
    return res.json();
  },

  async addToCart(productId: string, quantityQuintals: number, token?: string) {
    const res = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ productId, quantityQuintals })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to add item to cart');
    return result;
  },

  async getWishlist(token?: string) {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return res.json();
  },

  async toggleWishlist(productId: string, token?: string) {
    const res = await fetch(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ productId })
    });
    return res.json();
  },

  // Orders
  async getOrders(token?: string) {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async getOrderById(id: string, token?: string) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async createOrder(orderPayload: any, token?: string) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(orderPayload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to place order');
    return result;
  },

  // Bulk Requirements (RFQ)
  async getBulkRequirements() {
    const res = await fetch(`${API_BASE}/bulk-requirements`);
    if (!res.ok) throw new Error('Failed to load bulk requirements');
    return res.json();
  },

  async postBulkRequirement(payload: any, token?: string) {
    const res = await fetch(`${API_BASE}/bulk-requirements`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to post bulk requirement');
    return result;
  },

  async submitRFQOffer(requirementId: string, offerPayload: any, token?: string) {
    const res = await fetch(`${API_BASE}/bulk-requirements/${requirementId}/offers`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(offerPayload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit RFQ offer');
    return result;
  },

  // Weather, Cold Storage, Articles
  async getWeather(district: string, state?: string) {
    const res = await fetch(`${API_BASE}/weather?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state || 'Madhya Pradesh')}`);
    return res.json();
  },

  async getColdStorages(params?: Record<string, any>) {
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/cold-storage${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getArticles(category?: string) {
    const res = await fetch(`${API_BASE}/articles${category ? `?category=${encodeURIComponent(category)}` : ''}`);
    return res.json();
  },

  // ─── Farmer / Seller APIs ────────────────────────────────────────────────────
  async getFarmerDashboard() {
    const res = await fetch(`${API_BASE}/farmer/dashboard`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load farmer dashboard');
    return res.json();
  },

  async getFarmerListings(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`${API_BASE}/farmer/listings${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load listings');
    return res.json();
  },

  async getFarmerListing(id: string) {
    const res = await fetch(`${API_BASE}/farmer/listings/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Listing not found');
    return res.json();
  },

  async createFarmerListing(payload: Record<string, any>) {
    const res = await fetch(`${API_BASE}/farmer/listings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create listing');
    return result;
  },

  async updateFarmerListing(id: string, payload: Record<string, any>) {
    const res = await fetch(`${API_BASE}/farmer/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update listing');
    return result;
  },

  async updateFarmerListingStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/farmer/listings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update listing status');
    return result;
  },

  async deleteFarmerListing(id: string) {
    const res = await fetch(`${API_BASE}/farmer/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete listing');
    return result;
  },

  async getFarmerOrders(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`${API_BASE}/farmer/orders${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async getFarmerOrder(id: string) {
    const res = await fetch(`${API_BASE}/farmer/orders/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async updateFarmerOrderStatus(id: string, status: string, checkpoint?: string, reason?: string) {
    const res = await fetch(`${API_BASE}/farmer/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, checkpoint, reason })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update order status');
    return result;
  },

  async submitWeighment(orderId: string, payload: { grossWeightKg: number; tareWeightKg: number; weighbridgeSlipRef?: string; unit?: string }) {
    const res = await fetch(`${API_BASE}/farmer/orders/${orderId}/weighment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit weighment');
    return result;
  },

  async submitDispatch(orderId: string, payload: { vehicleNumber: string; driverContactNumber: string; driverName?: string; estimatedDeliveryDate?: string }) {
    const res = await fetch(`${API_BASE}/farmer/orders/${orderId}/dispatch`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit dispatch');
    return result;
  },

  async getFarmerEarnings() {
    const res = await fetch(`${API_BASE}/farmer/earnings`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load earnings');
    return res.json();
  },

  async getFarmerProfile() {
    const res = await fetch(`${API_BASE}/farmer/profile`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load farmer profile');
    return res.json();
  },

  async updateFarmerProfile(payload: Record<string, any>) {
    const res = await fetch(`${API_BASE}/farmer/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update profile');
    return result;
  }
};
