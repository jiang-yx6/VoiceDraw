import { StyleSheet, Image,Text, View,Modal,TextInput,TouchableOpacity } from 'react-native'
import React from 'react'
import { X,Send } from "lucide-react-native"
export default function WritePost({visible,onClose,ImageUrl}) {

    const onPublish = () => {
        console.log("发布帖子")
    }
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <X size={20} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.publishButton} onPress={onPublish}>
                        <Send size={20} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    <TextInput style={styles.titleInput} 
                    placeholder="请输入标题..." 
                    placeholderTextColor="#999"
                    />
                    <TextInput style={styles.contentInput} 
                    placeholder="请输入正文内容..." 
                    placeholderTextColor="#999"
                    multiline={true}
                    textAlignVertical="top"
                    />
                </View>

                <View style={styles.imageContainer}>
                    <TouchableOpacity style={styles.imageButton}>
                        <Image source={{uri: ImageUrl ? ImageUrl : "https://www.baidu.com/img/flexible/logo/pc/result.png"}} style={styles.image} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
    modalOverlay:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"rgba(0,0,0,0.5)"
    },
    header:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems: "center",
    },
    container:{
        width:"80%",
        height:"80%",
        borderRadius:10,
        backgroundColor:"white"
    },
    closeButton:{
        backgroundColor:"#ddd",
        width:40,
        height:40,
        borderRadius:10,
        alignItems:"center",
        justifyContent:"center",
        marginTop:10,
        marginLeft:15
    },
    publishButton:{
        backgroundColor:"#ddd",
        width:40,
        height:40,
        borderRadius:10,
        alignItems:"center",
        justifyContent:"center",
        marginTop:10,
        marginRight:15
    },
    contentContainer:{
        flex:1,
        padding:10,
        marginHorizontal: 5,
        marginVertical:10,
        borderRadius:10
    },      
    titleInput:{
        fontSize:16,
        fontWeight:"bold",
        color:"#222",
        marginBottom:10,
        backgroundColor:"#eee",
        borderRadius:10,
        padding:10
    },
    contentInput:{
        flex:1,
        fontSize:14,
        backgroundColor:"#eee",
        borderRadius:10,
        padding:10,
        height:200
    },
    imageContainer:{
        width:"100%",
        height:200,
        alignItems:"center",
        justifyContent:"center"
    },
    
})