import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://letsgo-backend-one.vercel.app';

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('driver_token');
  } catch (e) {
    return null;
  }
};

const setToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('driver_token', token);
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('driver_token');
  } catch (e) {
    console.error('Failed to clear token', e);
  }
};

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const driverApi = {
  login: async (phone: string, password: string) => {
    const data = await apiRequest('/api/auth/driver/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
    if (data.token) {
      await setToken(data.token);
    }
    return data;
  },

  logout: async () => {
    await clearToken();
  },

  getOffers: async () => {
    return apiRequest('/api/driver/offers');
  },

  acceptRide: async (rideId: number) => {
    return apiRequest('/api/driver/ride/accept', {
      method: 'POST',
      body: JSON.stringify({ ride_id: rideId }),
    });
  },

  declineRide: async (rideId: number) => {
    return apiRequest('/api/driver/ride/decline', {
      method: 'POST',
      body: JSON.stringify({ ride_id: rideId }),
    });
  },

  pickupRide: async (rideId: number) => {
    return apiRequest('/api/driver/ride/pickup', {
      method: 'POST',
      body: JSON.stringify({ ride_id: rideId }),
    });
  },

  completeRide: async (rideId: number) => {
    return apiRequest('/api/driver/ride/complete', {
      method: 'POST',
      body: JSON.stringify({ ride_id: rideId }),
    });
  },

  getWallet: async () => {
    return apiRequest('/api/driver/wallet');
  },
};

export { setToken, clearToken, getToken };
