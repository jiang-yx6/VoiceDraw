import React, { createContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [userToken, setUserToken] = useState(null)

  useEffect(() => {
    // 启动时读取登录状态
    loadStoredAuthData()
  }, [])

  const loadStoredAuthData = async () => {
    try {
      const storedUserInfo = await AsyncStorage.getItem("userInfo")
      const storedToken = await AsyncStorage.getItem("token")
      
      console.log("加载存储的认证数据:", { storedUserInfo, storedToken });
      
      if (storedUserInfo && storedToken) {
        setUserInfo(JSON.parse(storedUserInfo))
        setUserToken(storedToken)
        setIsLogin(true)
      }
    } catch (error) {
      console.log("读取存储的认证数据失败", error)
    }
  }

  const login = async (user, token) => {
    try {
      console.log("正在登录，用户信息:", user, "token:", token);
      
      if (!user || !token) {
        throw new Error("用户信息或token不能为空");
      }

      // 先存储数据
      await AsyncStorage.setItem("userInfo", JSON.stringify(user))
      await AsyncStorage.setItem("token", token)
      
      // 再更新状态
      setUserInfo(user)
      setUserToken(token)
      setIsLogin(true)
      
      console.log("登录成功，认证数据已存储");
    } catch (error) {
      console.log("保存认证数据失败", error)
      throw error; // 向上传递错误，让调用者处理
    }
  }

  const logout = async () => {
    try {
      // 先清除存储
      await AsyncStorage.removeItem("userInfo")
      await AsyncStorage.removeItem("token")
      
      // 再清除状态
      setUserInfo(null)
      setUserToken(null)
      setIsLogin(false)
      
      console.log("已清除所有认证数据");
    } catch (error) {
      console.log("清除认证数据失败", error)
      throw error;
    }
  }

  // 获取带有token的请求头
  const getAuthHeader = () => {
    return userToken ? { Authorization: `Bearer ${userToken}` } : {}
  }

  return (
    <AuthContext.Provider value={{ 
      isLogin, 
      userInfo, 
      userToken, 
      login, 
      logout, 
      getAuthHeader 
    }}>
      {children}
    </AuthContext.Provider>
  )
}
