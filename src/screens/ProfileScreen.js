import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView , Modal, TextInput} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Settings, Grid, Bookmark } from "lucide-react-native"
import { useState, useContext } from "react"
import UserLogin from "../components/UserLogin"
import { AuthContext } from "../context/AuthContext"

const ProfileScreen = () => {
    const { isLogin, logout } = useContext(AuthContext)
    const [showLogin, setShowLogin] = useState(false)

    const handleLogin = () => setShowLogin(true)
    const handleLogout = () => logout()

    const editProfile = () => {
        console.log("编辑资料")
        setShowLogin(false)
    }

   return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: isLogin ? "https://picsum.photos/id/64/200/200" : null}} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{ isLogin ? "创意设计师" : "未登录"}</Text>
              <Text style={styles.bio}>{ isLogin ? "热爱AI绘画，分享创意灵感" : "请先登录"}</Text>
              
              <TouchableOpacity style={styles.editProfileButton} onPress={isLogin ? handleLogout : handleLogin}>
                <Text style={styles.editProfileText}>{isLogin ? "编辑资料" : "登录/注册"}</Text>
              </TouchableOpacity>
              
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{ isLogin ? 42 : 0}</Text>
              <Text style={styles.statLabel}>作品</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{ isLogin ? "1.2k" : 0}</Text>
              <Text style={styles.statLabel}>关注者</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{ isLogin ? 386 : 0}</Text>
              <Text style={styles.statLabel}>关注中</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Grid size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Bookmark size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {isLogin ? (
        <View style={styles.galleryContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <Image
              key={item}
              source={{ uri: `https://picsum.photos/id/${item + 50}/200/200` }}
              style={styles.galleryImage}
            />
          ))}
        </View>
        ) : (
            <View style={styles.loginContainer}>
                <Text style={styles.loginText}>请先登录</Text>
            </View>
        )}
      </ScrollView>

      <UserLogin visible={showLogin} onClose={() => setShowLogin(false)} />

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
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    position: "relative",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  settingsButton: {
    position: "absolute",
    right: 15,
  },
  profileSection: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  editProfileButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  editProfileText: {
    fontSize: 12,
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#F0F0F0",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  galleryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  galleryImage: {
    width: "33.33%",
    height: 120,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
})

export default ProfileScreen
