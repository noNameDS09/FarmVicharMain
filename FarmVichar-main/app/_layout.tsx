import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import "../global.css";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = async () => {
    try {
      const userInfo = await AsyncStorage.getItem("user_info");
      setIsLoggedIn(!!userInfo);
    } catch (err) {
      console.error("Error checking login:", err);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // if (isLoading) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: "center",
  //         alignItems: "center",
  //         backgroundColor: isDark ? "black" : "white",
  //       }}
  //     >
  //       <ActivityIndicator size="large" color={isDark ? "#c2c2c2" : "#212121"} />
  //       <Text style={{ marginTop: 10, color: isDark ? "white" : "black" }}>
  //         Loading...
  //       </Text>
  //     </View>
  //   );
  // }

  // if (!isLoggedIn) {
  //   return (
  //     <LoginForm
  //       onLoginSuccess={checkLoginStatus}
  //       onSwitchToRegister={() => {
  //         // if you later add RegisterForm, handle switch here
  //       }}
  //     />
  //   );
  // }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
