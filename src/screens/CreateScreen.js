import { useState, useRef, useContext, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Modal,
  StatusBar,
  Alert,
  Platform
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {  Send, Menu, X, Image as ImageIcon, 
  Wand2, Sparkles, Eraser, Save, Plus, PenTool, Download,
  MessageCirclePlus 
 } from "lucide-react-native"
import { AuthContext } from "../context/AuthContext"
import { useMessages } from "../context/MessageContext"
import { api } from "../utils/apiServer"
import { downloadImage } from "../utils/downloadImage"
import WritePost from "../components/WritePost"
import Microphone from "../components/Microphone"

const { width } = Dimensions.get("window")
const CreateScreen = () => {
  // 获取认证上下文
  const { getAuthHeader, isLogin } = useContext(AuthContext)
  // 获取消息上下文
  const { messages, addMessage, clearMessages } = useMessages()
  
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isImageViewVisible, setIsImageViewVisible] = useState(false)
  const [currentViewingImage, setCurrentViewingImage] = useState(null)
  const [isWritePost, setIsWritePost] = useState(false)
  const [imageMessageList, setImageMessageList] = useState([])
  const sidebarAnimation = useRef(new Animated.Value(0)).current

  const extractImageMessageList = () => {
    return new Promise((resolve) => {
      if (messages && messages.length > 0) {
        // 从聊天记录中提取所有带图片的消息
        const chatImages = messages
          .filter((msg) => msg.hasImage && msg.imageUrl)
          .map((msg, index) => ({
            id: `chat_${index + 1}`,
            url: msg.imageUrl,
            // 保存原始消息，以便后续处理
            originalMessage: msg,
          }))
        setImageMessageList(chatImages)
        resolve(chatImages)
      } else {
        resolve([])
      }
    })
  }

  const toggleSidebar = () => {
    const toValue = isSidebarOpen ? 0 : 1

    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start()

    setIsSidebarOpen(!isSidebarOpen)
  }

  const sidebarTranslateX = sidebarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.7, 0],
  })

  const sendMessage = async () => {
    if (message.trim() === "") return

    const newMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: message,
    }

    addMessage(newMessage)
    setMessage("")

    // 发送请求前，先显示AI正在生成
    const aiResponse = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      content: "我正在根据你的描述生成图片，请稍等...",
    }
    addMessage(aiResponse)

    try {
      const response = await api.ai.generateImage({
        content: message,
      })

      if (response && response.img_base64) {
        const imageUrl = `data:image/png;base64,${response.img_base64}`
        
        const imageResponse = {
          id: (Date.now() + 2).toString(),
          sender: "ai",
          content: "这是根据你的描述生成的图片，你觉得怎么样？",
          hasImage: true,
          imageUrl: imageUrl,
        }
        addMessage(imageResponse)
      } else {
        throw new Error("生成图片失败");
      }
    } catch (error) {
      console.error("图片生成失败", error)
      const errorResponse = {
        id: (Date.now() + 3).toString(),
        sender: "ai",
        content: "图片生成失败，请稍后再试。",
      }
      addMessage(errorResponse)
    }
  }

  const handleWritePost = async () => {
    // 等待图片列表更新完成
    const chatImages = await extractImageMessageList()
    
    if(chatImages && chatImages.length > 0){
      console.log("写入帖子", chatImages)
      setIsWritePost(true)
    } else {
      Alert.alert(
        "提示",
        "请先生成图片",
        [{ text: "确定", onPress: () => console.log("Alert closed") }]
      )
    }
  }

  const handleDownload = async (imageUrl) => {
    try {
      const res = await downloadImage(imageUrl);
      if (res && res.statusCode === 200) {
        Alert.alert("下载成功", "图片已保存到相册");
      } else {
        Alert.alert("下载失败", "图片下载失败");
      }
    } catch (err) {
      console.log("下载失败", err);
      Alert.alert("下载失败", "图片下载失败，请稍后重试");
    }
  }

  const addNewChat = () => {
    console.log("添加新聊天")

    clearMessages()
  }
  const toggleRecording = () => {
    setIsRecording(!isRecording)
    
    if (!isRecording) {
      // Simulate voice recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false)
        setMessage("一只在星空下奔跑的狼，背景是银河和北极光")
      }, 3000)
    }
  }
  
  const renderMessage = (item) => {
    const isAi = item.sender === "ai"

    return (
      <View>
        <View style={[styles.messageContainer, isAi ? styles.aiMessage : styles.userMessage]}>
          <Text style={styles.messageText}>{item.content}</Text>
          {item.hasImage && item.imageUrl && (
            <TouchableOpacity onPress={() => {
              setCurrentViewingImage(item.imageUrl);
              setIsImageViewVisible(true);
            }}>
              <Image source={{ uri: item.imageUrl }} style={styles.generatedImage} />
            </TouchableOpacity>
          )}
        </View>

        {item.hasImage && item.imageUrl && (
          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.imageActionButton} onPress={()=>{handleWritePost()}}>
              <PenTool size={25} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageActionButton} onPress={() => handleDownload(item.imageUrl)}>
              <Download size={25} color="#333" />
            </TouchableOpacity>
            
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>

      <WritePost  style={styles.writePost} messages={messages} imageMessageList={imageMessageList} visible={isWritePost} onClose={()=>{setIsWritePost(false)}}/>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Menu size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI绘图助手</Text>
        <View style={[{flexDirection: "row",alignItems: "center",gap:"10"}]}>
          <TouchableOpacity onPress={() => {addNewChat()}}>
            <MessageCirclePlus size={26} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity  onPress={()=>{handleWritePost()}}>
            <Save size={26} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map((msg) => (
          <View key={msg.id}>{renderMessage(msg)}</View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        {/* <TouchableOpacity style={[styles.micButton, isRecording && styles.recordingButton]} onPress={toggleRecording}>
          <Mic size={20} color={isRecording ? "#FFFFFF" : "#333"} />
        </TouchableOpacity> */}
        <Microphone  handleVoiceInput={setMessage}/>
        <TextInput
          style={styles.input}
          placeholder="输入你的创意描述..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, message.trim() !== "" && styles.activeSendButton]}
          onPress={sendMessage}
          disabled={message.trim() === ""}
        >
          <Send size={20} color={message.trim() !== "" ? "#FFFFFF" : "#8E8E93"} />
        </TouchableOpacity>
      </View>

      {/* 放大查看图片的模态框 */}
      <Modal visible={isImageViewVisible} transparent={true} animationType="fade">
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.9)" barStyle="light-content" />
        <TouchableOpacity 
          style={styles.imageViewerContainer} 
          activeOpacity={1} 
          onPress={() => {
            setIsImageViewVisible(false);
            setCurrentViewingImage(null);
          }}
        >
          <Image 
            source={{ uri: currentViewingImage }} 
            style={styles.fullScreenImage} 
            resizeMode="contain" 
          />
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              setIsImageViewVisible(false);
              setCurrentViewingImage(null);
            }}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarTranslateX }] }]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>AI工具箱</Text>
          <TouchableOpacity onPress={toggleSidebar}>
            <X size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarContent}>
          <TouchableOpacity style={styles.sidebarItem}>
            <View style={styles.sidebarIconContainer}>
              <ImageIcon size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.sidebarItemText}>AI生成图片</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <View style={[styles.sidebarIconContainer, { backgroundColor: "#4CAF50" }]}>
              <Wand2 size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.sidebarItemText}>AI框架绘图</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <View style={[styles.sidebarIconContainer, { backgroundColor: "#9C27B0" }]}>
              <Sparkles size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.sidebarItemText}>AI一键美化</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem}>
            <View style={[styles.sidebarIconContainer, { backgroundColor: "#F44336" }]}>
              <Eraser size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.sidebarItemText}>AI消除</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Overlay when sidebar is open */}
      {isSidebarOpen && <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleSidebar} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    marginRight:-20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F0F0",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  generatedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  recordingButton: {
    backgroundColor: "#FF3B30",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  activeSendButton: {
    backgroundColor: "#007AFF",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "70%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sidebarContent: {
    padding: 20,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sidebarIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  sidebarItemText: {
    fontSize: 16,
    color: "#333",
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "30%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 5,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.8,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(80, 80, 80, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 80,
    alignItems: "center",
    marginTop: 1,
    marginBottom: 15,
    gap:10,
  },
})

export default CreateScreen
