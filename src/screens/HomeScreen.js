import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native'
import React,{useState} from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react-native'

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
export default function HomeScreen() {

    const [selectedCategory, setSelectedCategory] = useState("推荐")

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={[{fontSize:20},{fontWeight:"bold"}]}>AI绘图社区</Text>
        </View>
        <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {
                CATEGORIES.map((category)=>(
                    <TouchableOpacity key={category} style={[styles.categoryItem,
                        selectedCategory === category && styles.selectedCategory
                    ]
                    } onPress={()=> setSelectedCategory(category)}>
                        <Text style={[{fontSize:15}]}>{category}</Text>
                    </TouchableOpacity>
                ))
                }
            </ScrollView>
        </View>

        <ScrollView style={styles.postsContainer}>
            {
                POSTS.map((post)=>(
                    <View style={styles.postItem} key={post.id}>
                        <Image source={{uri: post.image}} style={styles.postImage}/>
                        <Text style={styles.postDescription}>{post.description}</Text>
                        <View style={styles.postActions}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Heart size={24} color="#333" />
                                <Text style={styles.actionText}>{post.likes}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <MessageCircle size={24} color="#333" />
                                <Text style={styles.actionText}>{post.comments}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Share2 size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            }
        </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: "#FFFFFF",
    },
    header:{
        padding:15,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#fff",
        borderBottomWidth:1,
        borderBottomColor:"#f0f0f0",
    },
    categoriesContainer:{
        height: 60,
        paddingVertical: 10,
        marginHorizontal:10,
        marginVertical:10,
        flexDirection:"row",    
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    categoryItem:{
        marginRight:15,
        paddingHorizontal:15,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#f5f5f5",
        borderRadius:20,
    },
    selectedCategory:{
        backgroundColor:"#007AFF",
    },
    postsContainer:{
        flex:1,
        
    },
    postItem:{
        marginBottom:20,
        marginHorizontal:10,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        padding:10,
    },
    postImage:{
        width:"100%",
        height:"300",
        borderRadius:10,
    },
    postDescription:{
        fontSize:16,
        marginTop:10,
        color:"#333",
    },
    postActions:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        marginTop:10,
    },
    actionButton:{
        flexDirection:"row",
        gap:5,
        alignItems:"center",
    },
    actionText:{
        fontSize:16,
        color:"#333",
    }
})