import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getDailyReport = (date) => {
    return api.get(`${API_ENDPOINTS.REPORTS.DAILY}?date=${date}`);
};

export const getTopItems = (date) => {
    return api.get(`${API_ENDPOINTS.REPORTS.TOP_ITEMS}?date=${date}`);
};