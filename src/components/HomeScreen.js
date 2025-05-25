"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Heart, MessageCircle, Share2 } from "lucide-react-native"

const CATEGORIES = ["推荐", "风景", "人物", "动物", "建筑", "抽象", "科幻", "动漫", "艺术"]

const POSTS = [
  {
    id: "1",
    image: "https://picsum.photos/id/1/400/400",
    description: "日落时分的海滩风景，金色的阳光洒在沙滩上",
    likes: 256,
    comments: 42,
  },
  {
    id: "2",
    image: "https://picsum.photos/id/20/400/400",
    description: "未来城市的天际线，霓虹灯闪烁，飞行器穿梭",
    likes: 189,
    comments: 23,
  },
  {
    id: "3",
    image: "https://picsum.photos/id/28/400/400",
    description: "梦幻森林中的精灵，周围环绕着发光的蝴蝶",
    likes: 324,
    comments: 56,
  },
  {
    id: "4",
    image: "https://picsum.photos/id/42/400/400",
    description: "宇宙深处的星云，五彩斑斓的星云气体",
    likes: 412,
    comments: 78,
  },
]

const { width } = Dimensions.get("window")

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("推荐")

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text style={styles.postDescription}>{item.description}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Heart size={20} color="#333" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={20} color="#333" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI绘图社区</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryItem, selectedCategory === category && styles.selectedCategory]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={POSTS}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsList}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  categoriesContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  selectedCategory: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
  },
  postsList: {
    padding: 10,
  },
  postContainer: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    padding: 10,
  },
  postImage: {
    width: "100%",
    height: width - 40,
    borderRadius: 10,
    marginBottom: 10,
  },
  postDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#333",
  },
})

export default HomeScreen
