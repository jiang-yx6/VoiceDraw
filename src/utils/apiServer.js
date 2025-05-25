import axios from 'axios';
import { address } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 端点配置
const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login/',
        REGISTER: '/auth/register/',
        LOGOUT: '/auth/logout/',
    },
    USER: {
        PROFILE: '/user/profile/',
        UPDATE: '/user/update/',
    },
    AI: {
        GENERATE_IMAGE: '/getai/',
    },
};

// 不需要token的白名单路径
const NO_AUTH_PATHS = [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.REGISTER,
];

// 创建 axios 实例
const apiServer = axios.create({
    baseURL: address,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 获取认证头
const getAuthHeader = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        if(token){
            return { Authorization: `Bearer ${token}` };
        }
        return {};
    } catch (error) {
        console.error('获取token失败:', error);
        return {};
    }
};

// 检查是否需要认证
const needAuth = (url) => {
    return !NO_AUTH_PATHS.some(path => url.includes(path));
};

// 请求拦截器
apiServer.interceptors.request.use(
    async (config) => {
        // 检查是否需要添加认证头
        if (needAuth(config.url)) {
            const authHeader = await getAuthHeader();
            console.log("authHeader: ",authHeader);
            config.headers = { ...config.headers, ...authHeader };
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
apiServer.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        if (error.response) {
            // 处理不同的错误状态码
            switch (error.response.status) {
                case 401:
                    // 只有在需要认证的请求中才处理401错误
                    if (needAuth(error.config.url)) {
                        try {
                            await AsyncStorage.removeItem('token');
                            // 在React Native中，我们需要使用导航来跳转
                            // 这里需要根据您的导航设置来处理
                            // 例如：navigation.navigate('Login');
                        } catch (e) {
                            console.error('清除token失败:', e);
                        }
                    }
                    break;
                case 403:
                    console.error('没有权限访问该资源');
                    break;
                case 404:
                    console.error('请求的资源不存在');
                    break;
                case 500:
                    console.error('服务器错误');
                    break;
                default:
                    console.error('发生错误:', error.response.data);
            }
        } else if (error.request) {
            console.error('网络错误，请检查您的网络连接');
        } else {
            console.error('请求配置错误:', error.message);
        }
        return Promise.reject(error);
    }
);

// API 方法
const api = {
    // 认证相关
    auth: {
        login: (credentials) => apiServer.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
        register: (userData) => apiServer.post(API_ENDPOINTS.AUTH.REGISTER, userData),
        logout: () => apiServer.post(API_ENDPOINTS.AUTH.LOGOUT),
    },
    // 用户相关
    user: {
        getProfile: () => apiServer.get(API_ENDPOINTS.USER.PROFILE),
        updateProfile: (data) => apiServer.put(API_ENDPOINTS.USER.UPDATE, data),
    },
    // AI相关
    ai: {
        generateImage: (data) => apiServer.post(API_ENDPOINTS.AI.GENERATE_IMAGE, data),
    },
};

export { API_ENDPOINTS, api };
export default apiServer;
