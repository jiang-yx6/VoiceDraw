import { StyleSheet,Image, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { api } from '../../utils/apiServer'
import { Edit3, Eye, Calendar, Heart, Clock, MoreVertical, Plus } from 'lucide-react-native'
import { address } from '../../utils/config'
export default function PostList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    getPosts()
  }, [])

  const getPosts = async () => {
    setLoading(true)
    try {
      const res = await api.community.getPostsByUser()
      setPosts(res)
      console.log(res)
      for (let i = 0; i < res.length; i++) {
        res[i].images?.[0]?.['image'] ? console.log(address + res[i].images?.[0]?.['image']) : console.log("没有图片")
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    getPosts()
  }

  const handleEditPost = (postId) => {
    // 导航到编辑页面
    console.log("Edit post:", postId)
  }

  const handleViewPost = (postId) => {
    // 导航到文章详情页
    console.log("View post:", postId)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#10b981'
      case 'draft': return '#f59e0b'
      case 'private': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return '已发布'
      case 'draft': return '草稿'
      case 'private': return '私密'
      default: return '未知'
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>加载文章中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>我的文章</Text>
          <Text style={styles.headerSubtitle}>共 {posts.length} 篇文章</Text>
        </View>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6366f1"]} />
        }
      >
        {posts.map((post, index) => (
          <TouchableOpacity 
            key={post.id || index} 
            style={styles.articleCard}
            onPress={() => handleViewPost(post.id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(post.status || 'published') }]} />
                <Text style={[styles.statusText, { color: getStatusColor(post.status || 'published') }]}>
                  {getStatusText(post.status || 'published')}
                </Text>
              </View>
              <TouchableOpacity style={styles.moreButton} activeOpacity={0.6}>
                <MoreVertical size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.articleContent}>
              <View style={styles.articleTextContainer}>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {post.title}
                </Text>
              
                <Text style={styles.articleDescription} numberOfLines={3}>
                  {post.description.substring(0, 20)}
                </Text>

                {/* 文章元数据 */}
                <View style={styles.articleMeta}> 
                  <View style={styles.metaItem}>
                    <Calendar size={14} color="#9ca3af" />
                    <Text style={styles.metaText}>
                      {post.created_at.substring(0, 10) || '2024-01-15'}
                    </Text>
                  </View>
                
                  
                  <View style={styles.metaItem}>
                    <Eye size={14} color="#9ca3af" />
                    <Text style={styles.metaText}>
                      {post.view_count || 0} 次浏览
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Heart size={14} color="#9ca3af" />
                    <Text style={styles.metaText}>
                      {post.like_count || 0} 次点赞
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.articleImageContainer}>
                <Image source={{ uri: post['images'].length ? address + post['images'][0]['image'] : "/media/images/image_1_8QtmbHx.jpg"}} style={styles.image} />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.categoryContainer}>
                {post.category && (
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{post.category}</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => handleEditPost(post.id)}
                activeOpacity={0.7}
              >
                <Edit3 size={16} color="#6366f1" />
                <Text style={styles.editButtonText}>编辑</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {posts.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Edit3 size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>还没有文章</Text>
            <Text style={styles.emptyDescription}>开始写作，分享你的想法和经验</Text>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
              <Text style={styles.createButtonText}>创建第一篇文章</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#6366f1",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  articleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  moreButton: {
    padding: 4,
  },
  articleContent:{
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  articleTextContainer:{
    flex: 1,
  },
  articleImageContainer:{
    flex: 1,
  },
  image:{
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 24,
  },
  articleDescription: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 16,
  },
  articleMeta: {
    flexDirection: "column",
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  categoryContainer: {
    flex: 1,
  },
  categoryTag: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 11,
    color: "#7c3aed",
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f0f9ff",

  },
  editButtonText: {
    fontSize: 13,
    color: "#6366f1",
    fontWeight: "600",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
})
