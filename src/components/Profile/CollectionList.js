"use client"

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react-native"
import { api } from "../../utils/apiServer"
import { address } from "../../utils/config"
import PostModal from "../Home/PostModal"
const { width } = Dimensions.get("window")
const ITEM_WIDTH = (width - 36) / 2 // 减去padding和间距

export default function CollectionList() {
  const [likedPosts, setLikedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [leftColumnData, setLeftColumnData] = useState([])
  const [rightColumnData, setRightColumnData] = useState([])
  const [isPostModalVisible, setIsPostModalVisible] = useState(false)
  const [detailPost, setDetailPost] = useState(null)
  useEffect(() => {
    getLikedPosts()
  }, [])

  useEffect(() => {
    if (likedPosts.length > 0) {
      distributePostsToColumns()
    }
  }, [likedPosts])

  const getLikedPosts = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      const res = await api.community.getLikedPosts()
      console.log("获取收藏列表", res)

      // 模拟数据
      const mockData = [
        {
          id: 1,
          title: "美丽的日落风景",
          image: "https://picsum.photos/300/400?random=1",
          author: "摄影师小王",
          like_count: 128,
        },
      ]

      setLikedPosts(res)
    } catch (error) {
      console.error("Failed to fetch liked posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const distributePostsToColumns = () => {
    const leftColumn = []
    const rightColumn = []

    likedPosts.forEach((post, index) => {
      if (index % 2 === 0) {
        leftColumn.push(post)
      } else {
        rightColumn.push(post)
      }
    })

    setLeftColumnData(leftColumn)
    setRightColumnData(rightColumn)
  }

  const handlePostPress = (post) => {
    // 这里触发Modal显示具体内容
    console.log("Open post detail:", post.post_id)
    setDetailPost(post)
    setIsPostModalVisible(true)
    // 假设已经有Modal组件处理
    // openPostModal(post)
  }

  const renderPostItem = (post) => (
    <TouchableOpacity key={post.post_id} style={styles.postItem} onPress={() => handlePostPress(post)} activeOpacity={0.9}>
      <Image source={{ uri: address + post.images?.[0]?.image }} style={styles.postImage} resizeMode="cover" />
      <View style={styles.postOverlay}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {post.title}
        </Text>
        <View style={styles.postMeta}>
          <Heart size={12} color="#ffffff" fill="#ffffff" />
          <Text style={styles.likeCount}>{post.like_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4757" />
        <Text style={styles.loadingText}>加载收藏中...</Text>
      </View>
    )
  }

  if (likedPosts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Heart size={48} color="#ddd" />
        <Text style={styles.emptyTitle}>还没有收藏</Text>
        <Text style={styles.emptyDescription}>去发现更多精彩内容吧</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的收藏</Text>
        <Text style={styles.headerSubtitle}>{likedPosts.length} 个收藏</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.masonry}>
          <View style={styles.column}>{leftColumnData.map(renderPostItem)}</View>
          <View style={styles.column}>{rightColumnData.map(renderPostItem)}</View>
        </View>
      </ScrollView>
      <PostModal isVisitPost={isPostModalVisible} setIsVisitPost={setIsPostModalVisible} post={detailPost} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#999999",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  masonry: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: ITEM_WIDTH,
  },
  postItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postImage: {
    width: "100%",
    height: 200, // 基础高度，实际会根据图片比例调整
    backgroundColor: "#f5f5f5",
  },
  postOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 12,
  },
  postTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    marginBottom: 6,
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeCount: {
    color: "#ffffff",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
  },
})
