import { FontAwesome } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import '../../global.css';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "green",
            tabBarStyle: { backgroundColor: colorScheme === "dark" ? "#18181b" : "#ffffff" },
            
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome size={28} name="home" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="chatbot"
            options={{
              title: "ChatBot",
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <Entypo name="chat" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="activitylog"
            options={{
              title: "Activity Log",
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome size={28} name="user" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Dashboard",
              headerShown: false, // This should be the only definition for the dashboard tab
              tabBarIcon: ({ color }) => (
                <MaterialIcons size={28} name="dashboard" color={color} />
              ),
            }}
          />
        </Tabs>
    </>
  );
}