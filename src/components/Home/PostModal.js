"use client"

import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Share
} from "react-native"
import { useState, useEffect } from "react"
import { address } from "../../utils/config"
import { Heart, MessageCircle, Share2, User, Send, ArrowLeft, ArrowRight } from "lucide-react-native"
import {api} from "../../utils/apiServer"
const { width, height } = Dimensions.get("window")

export default function PostModal({ isVisitPost, setIsVisitPost, post }) {
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState([])
  const [showImageIndex, setShowImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  // 获取帖子详情
  useEffect(() => {
    const fetchPost = async () => {
      if (post && post.post_id) {
        try {
          const res = await api.community.getPostDetail(post.post_id)
          console.log("获取帖子详情",res)
          setComments(res.comments || [])
        } catch (error) {
          console.error('获取帖子详情失败:', error)
          setComments([])
        }
      }
    }
    fetchPost()

  }, [post])

  // 发送评论
  const handleSendComment = async () => {
    if (commentText.trim()) {
      try {
        const res = await api.community.createComment(post.post_id, {
          content: commentText,
        })
        console.log("提交评论响应：", res)
        
        if (res) {
          const newComment = {
            author: res.author || 0,
            comment_id: res.comment_id || Date.now(),
            content: res.content || commentText,
            created_at: res.created_at || new Date().toISOString(),
            like_count: res.like_count || 0,
          }
          setComments(prevComments => [newComment, ...prevComments])
          console.log("提交评论成功",newComment)
        }
        setCommentText("")
      } catch (error) {
        console.error('提交评论失败:', error)
      }
    }
  }
  
  const handlePostLike = async() =>{
    try{
      const res = await api.community.likePost(post.post_id,{
        like_type: isLiked ? "unlike" : "like"
      })
      console.log("点赞帖子",res)
      setIsLiked(!isLiked)
      post.like_count = isLiked ? post.like_count - 1 : post.like_count + 1
    }catch(error){
      console.error("点赞帖子失败",error)
    }
  }
  
  const handleShare = async () => {
    try {
      // 构建分享内容
      const shareContent = {
        title: post?.title || "分享内容",
        message: `${post?.title || ""}\n${post?.description || ""}\n\n查看更多精彩内容：${address}/post/${post?.post_id}`,
      }
      
      // 如果有图片，添加第一张图片的URL
      if (post?.images?.[0]?.image) {
        shareContent.url = address + post.images[0].image
      }
      
      const result = await Share.share(shareContent)
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // 分享成功，带有特定的活动类型
          console.log("分享成功，活动类型:", result.activityType)
        } else {
          // 分享成功
          console.log("分享成功")
        }
      } else if (result.action === Share.dismissedAction) {
        // 分享被取消
        console.log("分享被取消")
      }
    } catch (error) {
      console.error("分享失败:", error)
    }
  }

  if (!post) return null

  return (
    <Modal visible={isVisitPost} transparent={true} animationType="slide">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setIsVisitPost(false)}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>帖子详情</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <User size={24} color="#666" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.username}>用户名</Text>
              <Text style={styles.postTime}>2小时前</Text>
            </View>
          </View>
          {/* 帖子图片 */}
          <View style={styles.postImageContainer}>
            <Image source={{ uri: address + post?.images?.[showImageIndex]?.["image"] }} style={styles.postImage} resizeMode="cover" />
            <TouchableOpacity style={styles.imageButtonLeft} onPress={() => setShowImageIndex((showImageIndex + post.images.length - 1 ) % post.images.length)}> 
                <ArrowLeft size={40} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButtonRight} onPress={() => setShowImageIndex((showImageIndex + post.images.length + 1 ) % post.images.length)}>
                <ArrowRight size={40} color="#222" />
            </TouchableOpacity>
          </View>
          
          {/* 帖子内容 */}
          <View style={styles.contentContainer}>
            <Text style={styles.postTitle}>{post?.title}</Text>
            <Text style={styles.postDescription}>{post?.description}</Text>

            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionButton}>
                
                <Heart size={22} color={isLiked ? "red" : "#666"} fill={isLiked ? "red" : "none"} onPress={() => {handlePostLike()}} />
                <Text style={styles.actionText}>{post?.like_count || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={22} color="#666" />
                <Text style={styles.actionText}>{post?.comment_count || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share2 size={22} color="#666" />
                <Text style={styles.actionText}>分享</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 评论区域 */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>评论 {comments.length}</Text>

            {comments.map((comment) => (
              <View key={comment.comment_id} style={styles.commentItem}>
                <View style={styles.commentUserAvatar}>
                  <User size={18} color="#666" />
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUsername}>{comment.author}</Text>
                    <Text style={styles.commentTime}>{comment.created_at.slice(0,10)}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <TouchableOpacity style={styles.commentLike}>
                    <Heart size={14} color="#999" />
                    <Text style={styles.commentLikeText}>{comment.like_count}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 评论输入框 */}
        <View style={styles.commentInputContainer}>
          <View style={styles.inputUserAvatar}>
            <User size={18} color="#666" />
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="添加评论..."
            placeholderTextColor="#999"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, commentText.trim() ? styles.sendButtonActive : null]}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
          >
            <Send size={18} color={commentText.trim() ? "#007AFF" : "#999"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  shareButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  postTime: {
    color: "#999",
    fontSize: 14,
  },
  postImage: {
    width: width,
    height: width * 0.75,
    backgroundColor: "#f8f8f8",
  },
  imageButtonLeft:{
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    left: 10,
  },
  imageButtonRight:{
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    right: 10,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 28,
  },
  postDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: "row",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    color: "#666",
    fontSize: 15,
  },
  // 评论区域样式
  commentsSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 8,
    borderTopColor: "#f8f8f8",
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  commentUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  commentUsername: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginRight: 12,
  },
  commentTime: {
    fontSize: 13,
    color: "#999",
  },
  commentText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 8,
  },
  commentLike: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentLikeText: {
    fontSize: 13,
    color: "#999",
  },
  // 评论输入框样式
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingBottom: Platform.OS === "ios" ? 34 : 12,
  },
  inputUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#333",
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  sendButtonActive: {
    backgroundColor: "#e3f2fd",
  },
})
