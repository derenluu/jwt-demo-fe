/* eslint-disable no-trailing-spaces */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable space-before-blocks */
/* eslint-disable quotes */
/* eslint-disable semi */

import axios from 'axios';
import { toast } from 'react-toastify';
import { handleLogoutAPI, refreshTokenAPI } from '~/apis';

//todo: Create object Axios Instance for custom
let AxiosInstance = axios.create();

//todo: Configure timeout of a request
AxiosInstance.defaults.timeout = 1000 * 60 * 5; //? 5min

//todo: Allows Axios to automatically attach and send Cookies in each request to the server
//todo: Serves us to use JWT Tokens (accessToken and refreshToken) according to the httpOnly Cookie mechanism
AxiosInstance.defaults.withCredentials = true;

//? Config Interceptors
//todo: Add request interceptor
AxiosInstance.interceptors.request.use(
  (config) => {
    //todo: Get accessToken from LocalStorage and pin to headers
    // const accessToken = localStorage.getItem('accessToken');
    // if (accessToken) {
    //   //? Need to add Bearer: because the standard should comply with OAuth 2.0 in determining the type of token being used
    //   //? Bearer: defines the type of token for authentication and authorization, refer to token types such as: Basic Token, Digest Token, OAuth Token, ...
    //   config.headers.Authorization = `Bearer ${accessToken}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//todo: Tạo refreshTokenPromise cho việc gọi API refresh_token
//? Mục đính tạo Promise để khi nhận yêu cầu refreshToken đầu tiên thì hold việc gọi API refresh_token
//? Cho tới khi xong thì mới retry lại những API lỗi trước đó thay vì cứ gọi lại refreshToken liên tục mỗi lần request bị lỗi
let refreshTokenPromise = null;

//todo: Add response interceptor
AxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    //todo: Xử lý refreshToken tự động
    if (error.response?.status === 401) {
      handleLogoutAPI().then(() => {
        //todo: Điều hướng về trang /login
        location.href = '/login';
      });
    }

    //? Nếu nhận mã 410 từ BE -> gọi API refreshToken để làm mới lại accessToken
    const originalRequest = error.config;
    if (error.response?.status === 410 && originalRequest) {
      if (!refreshTokenPromise) {
        //? Lấy refreshToken ở trường hợp localStorage
        const refreshToken = localStorage.getItem('refreshToken');

        refreshTokenPromise = refreshTokenAPI(refreshToken)
          .then((res) => {
            //todo: gắn lại accessToken vào localStorage
            // const { accessToken } = res.data;
            // localStorage.setItem('accessToken', accessToken);
            // AxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
          })
          .catch((_err) => {
            //? Nếu nhận bất cứ lỗi gì thì logout ra luôn
            handleLogoutAPI().then(() => {
              //todo: Điều hướng về trang /login
              location.href = '/login';
            });
            return Promise.reject(error);
          })
          .finally(() => {
            //? Dù API refresh_token chạy thành công hay lỗi thì vẫn phải gán về null để chạy đúng 1 lần
            refreshTokenPromise = null;
          });
      }

      //? Cuối cùng mới return refreshTokenPromise trong trường hợp thành công ở đây
      return refreshTokenPromise.then(() => {
        //todo: Quan trọng: return lại AxiosInstance kết hợp với originalRequest để gọi lại những API ban đầu bị lỗi
        return AxiosInstance(originalRequest);
      });
    }

    //todo: Xử lý tập trung tại 1 chỗ thay vì chỗ nào dùng Axios cũng try-catch
    if (error.response?.status !== 410) {
      //? Ngoại trừ status code 401 (GONE) phục vụ tự động refresh token
      toast.error(error?.response?.data?.message || error?.message);
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
