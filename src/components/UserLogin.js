import { StyleSheet, Text, View, Modal, TextInput, TouchableOpacity, Alert} from 'react-native'
import React, { useState, useContext } from 'react'
import { User, Lock, X } from "lucide-react-native"
import { AuthContext } from "../context/AuthContext"
import { api } from "../utils/apiServer"

export default function UserLogin({ visible, onClose }) {
  const { login } = useContext(AuthContext)
  const [isRegister, setIsRegister] = useState(false)
  const [username, setusername] = useState("")
  const [password, setPassword] = useState("")
  
  const handleSubmit = async () => {
    try {
      if (isRegister) {
        if (username && password) {
          const response = await api.auth.register({
            username,
            password
          });
          
          if (response) {
            console.log("注册成功");
            setIsRegister(false);
            setusername("");
            setPassword("");
          }
        }
      } else {
        if (username && password) {
          const response = await api.auth.login({
            username,
            password
          });
          
          if (response) {
            const token = response.token || response.access_token || response.accessToken;
            console.log("登录成功，获取到的token:", token);
            
            // 通过上下文处理登录
            await login({ username }, token);
            onClose();
          }
        }
      }
    } catch (error) {
      console.log("登录/注册错误:", error);
      Alert.alert(isRegister ? "注册失败" : "登录失败", error.message || "请稍后重试");
    }
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#888" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{isRegister ? "注册" : "登录"}</Text>
          <View style={styles.modalInputContainer}>
            <User size={20} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.modalInput}
              placeholder="请输入账号"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setusername}
              keyboardType="username-pad"
            />
          </View>
          <View style={styles.modalInputContainer}>
            <Lock size={20} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.modalInput}
              placeholder="请输入密码"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity style={styles.modalButton} onPress={handleSubmit}>
            <Text style={styles.modalButtonText}>{isRegister ? "注册" : "登录"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
            <Text style={styles.switchText}>
              {isRegister ? "已有账号？去登录" : "没有账号？去注册"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
    modalContainer:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"rgba(0,0,0,0.5)",
    },  
    modalContent:{
        width:"85%",
        backgroundColor:"white",
        padding:28,
        borderRadius:16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        padding: 4,
    },
    modalTitle:{
        fontSize:22,
        fontWeight:"bold",
        marginBottom:24,
        color: '#222',
        alignSelf: 'center',
    },
    modalInputContainer:{
        flexDirection:"row",
        alignItems:"center",
        backgroundColor: "#F5F6FA",
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    modalInput:{
        flex: 1,
        height: 44,
        fontSize: 16,
        color: '#333',
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    modalButton:{
        backgroundColor:"#007AFF",
        paddingVertical:14,
        borderRadius:8,
        alignItems:"center",
        marginTop: 8,
        marginBottom: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    modalButtonText:{
        color:"white",  
        fontSize:18,
        fontWeight:"bold",
        letterSpacing: 1,
    },  
    switchText: {
        color: "#007AFF",
        marginTop: 8,
        fontSize: 15,
        alignSelf: 'center',
    },
})