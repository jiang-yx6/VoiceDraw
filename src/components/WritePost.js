"use client"

import { StyleSheet, Image, Text, View, Modal, TextInput, TouchableOpacity, FlatList, Alert } from "react-native"
import { useState, useRef, useEffect } from "react"
import { X, Send, Plus } from "lucide-react-native"
import { api } from "../utils/apiServer"

export default function WritePost({ visible, onClose, onPostSuccess, imageMessageList }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedImages, setSelectedImages] = useState([])
  const [isPublishing, setIsPublishing] = useState(false)
  const contentInputRef = useRef(null)

  // 示例图片列表，你可以替换为实际的图片数据
  const [availableImages, setAvailableImages] = useState([])
  
  useEffect(() => {
    console.log("imageMessageList", imageMessageList)
    setAvailableImages(imageMessageList)
  }, [imageMessageList])

  // 重置表单
  const resetForm = () => {
    setTitle("")
    setContent("")
    setSelectedImages([])
    setIsPublishing(false)
    // 重置可用图片列表
    setAvailableImages(imageMessageList)
  }

  // 验证表单
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("提示", "请输入标题")
      return false
    }
    if (!content.trim()) {
      Alert.alert("提示", "请输入正文内容")
      return false
    }

    return true
  }

  // 将图片URL转换为File对象（用于FormData）
  const urlToFile = async (url, filename) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new File([blob], filename, { type: blob.type })
    } catch (error) {
      console.error("转换图片失败:", error)
      return null
    }
  }

  const onPublish = async () => {
    // 验证表单
    if (!validateForm()) {
      return
    }

    setIsPublishing(true)

    try {
      console.log("发布帖子")
      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("description", content.trim())

      // 添加图片数据到FormData
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          const imageItem = selectedImages[i]
          try {
            // 如果是网络图片，需要先下载转换
            if (imageItem.url.startsWith("http")) {
              console.log("处理网络图片", imageItem.url)
              const imageFile = await urlToFile(imageItem.url, `image_${i}.jpg`)
              if (imageFile) {
                formData.append("images", imageFile)
              }
            } else {
              // 如果是本地图片，直接添加
              formData.append("images", {
                uri: imageItem.url,
                type: "image/jpeg",
                name: `image_${i}.jpg`,
              })
            }
          } catch (error) {
            console.error(`处理图片 ${i} 失败:`, error)
          }
        }
      }

      console.log("发送的数据formData", formData)

      const res = await api.community.createPost(formData)
      console.log("发布结果:", res)

      if (res && res.success) {
        // 发布成功
        Alert.alert("成功", "帖子发布成功！", [
          {
            text: "确定",
            onPress: () => {
              resetForm()
              onClose()
              // 通知父组件发布成功
              onPostSuccess && onPostSuccess(res.data)
            },
          },
        ])
      } else {
        // 发布失败
        Alert.alert("失败", res.message || "发布失败，请重试")
      }
    } catch (error) {
      console.error("发布帖子失败:", error)
      Alert.alert("错误", "网络错误，请检查网络连接后重试")
    } finally {
      setIsPublishing(false)
    }
  }

  const insertImageToContent = (imageItem) => {
    // 将图片添加到已选择的图片列表
    setSelectedImages((prev) => {
      const newSelected = [...prev, imageItem]
      console.log("插入后的已选择的图片列表", newSelected)
      return newSelected
    })

    // 从可选择列表中移除该图片
    setAvailableImages((prev) => prev.filter((img) => img.id !== imageItem.id))
  }

  const removeImageFromContent = (imageItem) => {
    // 从已选择列表中移除
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageItem.id))

    // 重新添加到可选择列表中
    setAvailableImages((prev) =>
      [...prev, imageItem].sort((a, b) => {
        // 处理字符串ID的排序
        if (typeof a.id === "string" && typeof b.id === "string") {
          return a.id.localeCompare(b.id)
        }
        return a.id - b.id
      }),
    )
  }

  const handleClose = () => {
    if (title.trim() || content.trim() || selectedImages.length > 0) {
      Alert.alert("提示", "确定要退出吗？未保存的内容将丢失。", [
        { text: "取消", style: "cancel" },
        {
          text: "确定",
          onPress: () => {
            resetForm()
            onClose()
          },
        },
      ])
    } else {
      onClose()
    }
  }

  const renderImageItem = ({ item }) => (
    <TouchableOpacity style={styles.imageItem} onPress={() => insertImageToContent(item)}>
      <Image source={{ uri: item.url }} style={styles.thumbnailImage} />
      <View style={styles.imageOverlay}>
        <Plus size={20} color="white" />
      </View>
    </TouchableOpacity>
  )

  const renderSelectedImage = ({ item }) => (
    <View style={styles.selectedImageItem}>
      <Image source={{ uri: item.url }} style={styles.selectedThumbnail} />
      <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImageFromContent(item)}>
        <X size={16} color="white" />
      </TouchableOpacity>
    </View>
  )

  return (
    <Modal visible={visible} onRequestClose={handleClose} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={20} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>写帖子</Text>
            <TouchableOpacity
              style={[
                styles.publishButton,
                (isPublishing || !title.trim() || !content.trim()) && styles.publishButtonDisabled,
              ]}
              onPress={onPublish}
              disabled={isPublishing || !title.trim() || !content.trim()}
            >
              <Send size={20} color={isPublishing || !title.trim() || !content.trim() ? "#999" : "white"} />
            </TouchableOpacity>
          </View>

          <FlatList
            ListHeaderComponent={
              <>
                <View style={styles.contentContainer}>
                  <TextInput
                    style={styles.titleInput}
                    placeholder="请输入标题..."
                    placeholderTextColor="#999"
                    value={title}
                    onChangeText={setTitle}
                    editable={!isPublishing}
                  />
                  <TextInput
                    ref={contentInputRef}
                    style={styles.contentInput}
                    placeholder="请输入正文内容..."
                    placeholderTextColor="#999"
                    multiline={true}
                    textAlignVertical="top"
                    value={content}
                    onChangeText={setContent}
                    editable={!isPublishing}
                  />
                </View>
                {/* 已选择图片 */}
                {selectedImages.length > 0 && (
                  <View style={styles.selectedImagesContainer}>
                    <Text style={styles.sectionTitle}>已插入的图片:</Text>
                    <FlatList
                      data={selectedImages}
                      renderItem={renderSelectedImage}
                      keyExtractor={(item) => item.id.toString()}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.selectedImagesList}
                    />
                  </View>
                )}
                {availableImages.length > 0 && (
                  <View style={styles.imageSelectionContainer}>
                    <Text style={styles.sectionTitle}>可选择的图片:</Text>
                  </View>
                )}
              </>
            }
            data={availableImages}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{ marginBottom: 12 }}
            ListEmptyComponent={
              <View style={styles.noImagesContainer}>
                <Text style={styles.noImagesText}>所有图片都已插入</Text>
              </View>
            }
          />

          {isPublishing && (
            <View style={styles.publishingOverlay}>
              <View style={styles.publishingContainer}>
                <Text style={styles.publishingText}>正在发布...</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  closeButton: {
    backgroundColor: "#ddd",
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  publishButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  publishButtonDisabled: {
    backgroundColor: "#ccc",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  contentInput: {
    fontSize: 14,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 15,
    minHeight: 200,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedImagesContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  selectedImagesList: {
    marginBottom: 10,
  },
  selectedImageItem: {
    position: "relative",
    marginRight: 10,
  },
  selectedThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  imageSelectionContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  imageGrid: {
    marginTop: 10,
  },
  imageGridContainer: {
    paddingBottom: 10,
  },
  imageRow: {
    justifyContent: "flex-start",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  imageItem: {
    position: "relative",
    width: "30%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: "1.5%",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  noImagesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    alignItems: "center",
  },
  noImagesText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  publishingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  publishingContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  publishingText: {
    fontSize: 16,
    color: "#333",
  },
})
