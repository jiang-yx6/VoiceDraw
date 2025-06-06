import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator,Button } from 'react-native'
import React,{useState, useEffect} from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react-native'
import { api } from '../utils/apiServer'
import { address } from '../utils/config'
import PostModal from '../components/Home/PostModal'
const CATEGORIES = ["推荐", "风景", "人物", "动物", "建筑", "抽象", "科幻", "动漫", "艺术"]

export default function HomeScreen() {

    const [selectedCategory, setSelectedCategory] = useState("推荐")
    const [posts, setPosts] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const [isVisitPost, setIsVisitPost] = useState(false)
    const [postId, setPostId] = useState(null)

    useEffect(() => {
        getPosts()
    }, [])

    const getPosts = async () => {
        try {
            const res = await api.community.getPosts()
            console.log(res)
            setPosts(res)
        } catch (error) {
            console.error("Failed to fetch posts:", error)
        } finally {
            setIsLoading(false)
        }
    }
    const handleViewPost = (id) => {
        console.log(`查看帖子${id}`)
        setPostId(id)
        setIsVisitPost(true)
    }


    if(isLoading){
        return (
            <View style={styles.containerLoading}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{marginTop:10}}>加载中...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[{fontSize:20},{fontWeight:"bold"}]}>AI绘图社区</Text>
            </View>
            <PostModal  isVisitPost={isVisitPost} setIsVisitPost={setIsVisitPost} post={posts?.find(post=>post.post_id === postId)}/>
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
                {   posts && 
                    posts.map((post)=>(post.images.length > 0 && 
                        <TouchableOpacity style={styles.postItem} key={post.post_id} onPress={()=>handleViewPost(post.post_id)}>
                            <Image source={{uri: address + post.images?.[0]?.['image']}} style={styles.postImage}/>
                            <Text style={styles.postTitle}>{post.title}</Text>
                            <Text style={styles.postDescription}>{post.description.slice(0,10)}...</Text>
                            <View style={styles.postActions}>
                                <TouchableOpacity style={styles.actionButton}>
                                {post?.is_liked ? <Heart size={24} fill="#FF0000" color="#FF0000"/> : <Heart size={24} color={"#333"} />}   
                                    <Text style={styles.actionText}>{post.like_count}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton}>
                                    <MessageCircle size={24} color="#333" />
                                    <Text style={styles.actionText}>{post.comment_count}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Share2 size={24} color="#333" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
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
    containerLoading:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
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
    postTitle:{
        fontSize:20,
        fontWeight:"bold",
        marginTop:10,
        color:"#333",
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