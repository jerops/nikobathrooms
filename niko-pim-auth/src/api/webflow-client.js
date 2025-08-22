const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';
const WEBFLOW_TOKEN = '2ed581dc918442a26a18ecdb00ec916412c89d71d3fdf386f41ee8459ae2b1db'; // We'll configure this properly
const SITE_ID = '67378d122c9df01858dd36f6';

class WebflowClient {
  constructor() {
    this.baseURL = WEBFLOW_API_BASE;
    this.token = WEBFLOW_TOKEN;
    this.siteId = SITE_ID;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`Webflow API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createCustomer(userData) {
    const endpoint = `/collections/68a6dc21ddfb81569ba773a4/items`;
    
    const customerData = {
      fieldData: {
        name: userData.name,
        email: userData.email,
        'firebase-uid': userData.supabaseId,
        'user-type': 'Customer',
        'is-active': true,
        'registration-date': new Date().toISOString()
      }
    };

    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  async createRetailer(userData) {
    const endpoint = `/collections/6738c46e5f48be10cf90c694/items`;
    
    const retailerData = {
      fieldData: {
        name: userData.name,
        email: userData.email,
        'firebase-uid': userData.supabaseId,
        'user-type': 'Retailer',
        'is-active': true,
        'last-login': new Date().toISOString()
      }
    };

    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(retailerData)
    });
  }

  async validateRetailerEmail(email) {
    const endpoint = `/collections/6738c46e5f48be10cf90c694/items`;
    
    try {
      const response = await this.request(`${endpoint}?email=${encodeURIComponent(email)}`);
      return response.items && response.items.length > 0;
    } catch (error) {
      console.error('Error validating retailer:', error);
      return false;
    }
  }
}

export const webflowClient = new WebflowClient();