/**
 * Custom Hook: useFetch - Để fetch data từ API
 * 
 * Sử dụng:
 * const { data, loading, error } = useFetch('/endpoint');
 * 
 * const { data, loading, error, refetch } = useFetch(() => 
 *   apiGet('/items?page=1')
 * );
 */

import { useState, useEffect } from 'react';
import { getErrorMessage } from '../utils/helpers';

/**
 * Hook: useFetch - Quản lý fetching data
 * @param {string|function} endpoint - URL hoặc hàm API
 * @param {object} options - Cấu hình (dependencies, ...)
 * @returns {object} - { data, loading, error, refetch }
 */
export const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Hàm fetch data
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Nếu endpoint là function, gọi function
      const apiCall = typeof endpoint === 'function' 
        ? endpoint() 
        : fetch(endpoint).then(res => res.json());

      const response = await apiCall;
      setData(response?.data || response);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect: Fetch data khi mount hoặc khi dependencies thay đổi
   */
  useEffect(() => {
    if (!endpoint) return;

    fetchData();
  }, [endpoint, options.dependencies]);

  /**
   * Hàm refetch - Để lấy lại data
   */
  const refetch = async () => {
    await fetchData();
  };

  return { data, loading, error, refetch };
};

export default useFetch;
