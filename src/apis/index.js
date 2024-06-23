/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */

import AxiosInstance from '~/utils/axiosInstance';
import { API_ROOT } from '~/utils/constants';

export const handleLogoutAPI = async () => {
  //? case 1: Dùng localStorage -> xóa thông tin user trong localStorege
  // localStorage.removeItem('accessToken');
  // localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');

  //? case 2: Dùng httpOnly Cookies -> gọi API để remove Cookies
  return await AxiosInstance.delete(`${API_ROOT}/v1/users/logout`);
};

export const refreshTokenAPI = async (refreshToken) => {
  return await AxiosInstance.put(`${API_ROOT}/v1/users/refresh_token`, { refreshToken });
};
