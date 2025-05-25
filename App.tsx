import { useState } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { Home, User, Plus } from "lucide-react-native"
import { AuthProvider } from "./src/context/AuthContext"

import HomeScreen from "./src/screens/HomeScreen"
import CreateScreen from "./src/screens/CreateScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import updateConfig from './update.json'
import { UpdateProvider, Pushy } from "react-native-update";

const {appKey} = updateConfig.android

const pushyClient = new Pushy({
  appKey,
});
export default function App() {
  const [activeTab, setActiveTab] = useState("Home")

  const renderScreen = () => {
    switch (activeTab) {
      case "Home":
        return <HomeScreen />
      case "Create":
        return <CreateScreen />
      case "Profile":
        return <ProfileScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <UpdateProvider client={pushyClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
            <View style={styles.content}>{renderScreen()}</View>

          <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("Home")}>
              <Home color={activeTab === "Home" ? "#007AFF" : "#8E8E93"} size={24} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.createButton} onPress={() => setActiveTab("Create")}>
              <Plus color="#FFFFFF" size={24} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("Profile")}>
              <User color={activeTab === "Profile" ? "#007AFF" : "#8E8E93"} size={24} />
            </TouchableOpacity>
          </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </AuthProvider>
    </UpdateProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
})
