import { NotificationModal } from "@/components/Notifications/NotificationModal";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_700Bold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  DrawerLayout,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileDrawer from "../../components/Profile/ProfileDrawer";

const palette = {
  nearBlack: "#1C1E1C", // A slightly softer black
  lightSand: "#F0EFEA", // A calmer, more neutral sand color
  emrald: "#10B981", // A muted, sage-like green
  offWhite: "#F9F9F7", // A clean off-white
  mediumGreen: "#576643", // A deep, earthy green
  lightMoss: "#CAD2C5", // A soft, gentle green-gray
  yellowGold: "#fff", // A more muted, antique gold
  alertRed: "#C94C4C", // A less saturated, calmer red
  white: "#e8e8e8",
};

const weatherImages = {
  Sunny: {
    uri: "https://images.unsplash.com/vector-1753854003835-75dcb12b7776?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  Cloudy: {
    uri: "https://plus.unsplash.com/premium_vector-1721648394990-79ed1f436ef7?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  Rainy: {
    uri: "https://plus.unsplash.com/premium_vector-1723043561549-2b8cc0b6af91?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  Default: {
    uri: "https://plus.unsplash.com/premium_vector-1723043561549-2b8cc0b6af91?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
};

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const drawerRef = useRef<DrawerLayout>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  const [pestRiskEnabled, setPestRiskEnabled] = useState(false);
  const [weather, setWeather] = useState({
    location: "Chennai",
    temp: "25°",
    condition: "Sunny", // Can be 'Sunny', 'Cloudy', 'Rainy'
  });

  const renderDrawer = () => (
    <ProfileDrawer
      onClose={closeDrawer}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    />
  );

  const checkLoginStatus = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("access_token");
    const userName = await AsyncStorage.getItem("user_name");
    if (token) {
      setIsLoggedIn(true);
      console.log("✅ Logged in as:", userName);
    } else {
      setIsLoggedIn(false);
      console.log("🔒 Not logged in");
    }
    setLoading(false);
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("user_name");
    setIsLoggedIn(false);
    setIsLoggingOut(false);
    console.log("🔒 Logged out");
  };

  const openDrawer = useCallback(() => {
    drawerRef.current?.openDrawer();
  }, []);

  const closeDrawer = useCallback(() => {
    drawerRef.current?.closeDrawer();
  }, []);

  const keralaSchemes = [
    {
      name: "Subsidy for Organic Paddy Farming",
      icon: "leaf" as keyof typeof MaterialCommunityIcons.glyphMap,
    },
    {
      name: "Kerala Water Management Initiative",
      icon: "water-pump" as keyof typeof MaterialCommunityIcons.glyphMap,
    },
    {
      name: "Machinery Support for Coconut Farmers",
      icon: "tractor-variant" as keyof typeof MaterialCommunityIcons.glyphMap,
    },
    {
      name: "Integrated Pest Management Program",
      icon: "shield-bug" as keyof typeof MaterialCommunityIcons.glyphMap,
    },
    {
      name: "Krishi Loan Support Scheme",
      icon: "cash-multiple" as keyof typeof MaterialCommunityIcons.glyphMap,
    },
  ];

  const farmingBlogs = [
    {
      title: "Organic Fertilizers: Benefits & Application",
      thumbnail:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Water-saving Irrigation Techniques",
      thumbnail:
        "https://plus.unsplash.com/premium_photo-1661845609789-635c5e35c4ba?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aXJyaWdhdGlvbnxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      title: "Crop Rotation Practices to Boost Yield",
      thumbnail:
        "https://www.lingayasvidyapeeth.edu.in/sanmax/wp-content/uploads/2024/02/Crop-Rotation-Strategies-for-Soil-Health.png",
    },
    {
      title: "Natural Pest Control Methods",
      thumbnail:
        "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=1296&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  // useEffect(() => {
  //   const getdata = async () => {
  //     const userId = process.env.EXPO_PUBLIC_USER_ID;
  //     const response = await fetch(
  //       `${process.env.EXPO_PUBLIC_DB_BACKEND}/api/users/${userId}/profile/deep`,
  //     );
  //     console.log(response);
  //     const data = await response.json();
  //     console.log(data)

  //   }
  //   getdata()
  // })
  if (loading || !fontsLoaded) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark ? palette.nearBlack : palette.offWhite,
        }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? palette.yellowGold : palette.nearBlack}
        />
        <Text
          style={{
            color: isDark ? palette.lightSand : palette.nearBlack,
            marginTop: 10,
          }}
        >
          Fetching Your Details...
        </Text>
      </SafeAreaView>
    );
  }

  // Using a dynamic style object for better readability
  const styles = getStyles(isDark);

  const weatherImage = useMemo(() => {
    const condition = weather.condition as keyof typeof weatherImages;
    return weatherImages[condition] || weatherImages.Default;
  }, [weather.condition]);

  // if (!isLoggedIn) return <MyForm onLoginSuccess={checkLoginStatus} />;

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <DrawerLayout
        ref={drawerRef}
        drawerWidth={250}
        drawerPosition="right"
        renderNavigationView={renderDrawer}
        onDrawerOpen={() => setDrawerOpen(true)}
        onDrawerClose={() => setDrawerOpen(false)}
        drawerType="front"
        drawerBackgroundColor={isDark ? palette.nearBlack : palette.offWhite}
      >
        <SafeAreaView className="flex-1 bg-emerald-500">
          <StatusBar style={isDark ? "light" : "dark"} />
          <ScrollView
            style={[
              styles.flexOne,
              {
                backgroundColor: isDark ? palette.nearBlack : palette.offWhite,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerWelcome}>Welcome Back,</Text>
                  <Text style={styles.headerTitle}>FarmVichar</Text>
                </View>
                <View style={styles.headerIcons}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="notifications-outline"
                      size={24}
                      color={isDark ? palette.lightMoss : palette.mediumGreen}
                    />
                    <View style={styles.notificationBadge} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={openDrawer}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="person-circle-outline"
                      size={32}
                      color={isDark ? palette.lightMoss : palette.mediumGreen}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={22}
                  color={isDark ? palette.lightMoss : palette.mediumGreen}
                />
                <TextInput
                  placeholder="Search for crops, schemes..."
                  placeholderTextColor={
                    isDark ? palette.lightMoss : palette.mediumGreen
                  }
                  style={styles.searchInput}
                />
              </View>

              {/* Weather Info Section */}
              <ImageBackground
                source={weatherImage}
                style={styles.weatherCard}
                imageStyle={styles.weatherCardImage}
              >
                <View style={styles.weatherOverlay}>
                  <View style={styles.weatherHeader}>
                    <Ionicons
                      name="location-sharp"
                      size={20}
                      color={palette.offWhite}
                    />
                    <Text style={styles.weatherLocation}>
                      {weather.location}
                    </Text>
                  </View>
                  <View style={styles.weatherBody}>
                    <Ionicons
                      name={
                        weather.condition === "Sunny"
                          ? "sunny"
                          : weather.condition === "Cloudy"
                          ? "cloudy"
                          : "rainy"
                      }
                      size={64}
                      color={palette.yellowGold}
                    />
                    <View style={styles.weatherTempContainer}>
                      <Text style={styles.weatherTemp}>{weather.temp}</Text>
                      <Text style={styles.weatherCondition}>
                        Mostly {weather.condition}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.weatherAdvice}>
                    "Keep your paddy well-watered on sunny days to protect the
                    crop."
                  </Text>
                </View>
              </ImageBackground>

              {/* Pest Risks Section */}
              <View style={styles.pestCard}>
                <View style={styles.pestTextContainer}>
                  <Text style={styles.pestTitle}>Pest Risk Alert</Text>
                  <Text style={styles.pestDescription}>
                    Moderate risk of pest outbreak in your area.
                  </Text>
                </View>
                <View style={styles.pestRiskCircle}>
                  <Text style={styles.pestRiskPercent}>75%</Text>
                </View>
              </View>

              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="book-open-page-variant-outline"
                  size={24}
                  color={isDark ? palette.lightMoss : palette.mediumGreen}
                />
                <Text style={styles.sectionTitle}>
                  News & Kerala Farm Schemes
                </Text>
              </View>

              {/* News Tab Section */}
              {keralaSchemes.map((scheme) => (
                <TouchableOpacity key={scheme.name} style={styles.schemeCard}>
                  <View style={styles.schemeIcon}>
                    <MaterialCommunityIcons
                      name={scheme.icon}
                      size={24}
                      color={palette.yellowGold}
                    />
                  </View>
                  <Text style={styles.schemeText}>{scheme.name}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isDark ? palette.lightMoss : palette.mediumGreen}
                  />
                </TouchableOpacity>
              ))}

              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={24}
                  color={isDark ? palette.lightMoss : palette.mediumGreen}
                />
                <Text style={styles.sectionTitle}>
                  Tutorials & Video Guides
                </Text>
              </View>

              {/* Farming Blogs Cards */}
              <FlatList
                horizontal
                data={farmingBlogs}
                keyExtractor={(item, index) => `${item.title}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.blogCard}>
                    <ImageBackground
                      source={{ uri: item.thumbnail }}
                      style={styles.blogThumbnail}
                      imageStyle={styles.blogThumbnailImage}
                    >
                      <View style={styles.blogThumbnailOverlay} />
                      <MaterialCommunityIcons
                        name="play-circle-outline"
                        size={48}
                        color="rgba(255, 255, 255, 0.8)"
                      />
                    </ImageBackground>
                    <Text style={styles.blogTitle}>{item.title}</Text>
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.blogListContainer}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </DrawerLayout>
      <NotificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        isDark={isDark}
      />
    </GestureHandlerRootView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    flexOne: { flex: 1 },
    scrollContent: { paddingBottom: 0, paddingTop: 0 },
    container: { paddingHorizontal: 16, flex: 1 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      marginBottom: 20,
    },
    headerWelcome: {
      fontSize: 16,
      fontFamily: "Montserrat_400Regular",
      color: isDark ? palette.lightMoss : palette.mediumGreen,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      fontFamily: "Montserrat_700Bold",
      color: isDark ? palette.yellowGold : palette.nearBlack,
    },
    headerIcons: { flexDirection: "row", alignItems: "center" },
    iconButton: { marginLeft: 16, position: "relative" },
    notificationBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: palette.alertRed,
      borderWidth: 1,
      borderColor: isDark ? palette.nearBlack : palette.offWhite,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#1c1c1e" : palette.lightSand,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginBottom: 18,
    },
    searchInput: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      fontFamily: "Montserrat_400Regular",
      color: isDark ? palette.offWhite : palette.nearBlack,
    },

    weatherCard: {
      borderRadius: 20,
      marginBottom: 18,
      overflow: "hidden", // Important for borderRadius to work with ImageBackground
      height: 320, // Adjusted height for a more compact look
      justifyContent: "center", // Aligns content to the bottom
    },
    weatherCardImage: {
      resizeMode: "cover",
      height: "100%", // Ensure image covers the full height
    },
    weatherOverlay: {
      backgroundColor: "rgba(0, 0, 0, 0.4)", // Slightly darker overlay for better contrast
      padding: 20,
      paddingTop: 40, // Add more space at the top for a gradient effect
      position: "absolute", // Overlay on top of the image
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "flex-end", // Align text to the bottom of the card
    },
    weatherHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    weatherLocation: {
      marginLeft: 8,
      fontSize: 18,
      fontWeight: "500",
      fontFamily: "Montserrat_500Medium",
      color: palette.offWhite,
      textShadowColor: "rgba(0, 0, 0, 0.75)",
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10,
    },
    weatherBody: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 8,
    },
    weatherTempContainer: {
      alignItems: "flex-end",
    },
    weatherTemp: {
      fontSize: 48,
      fontWeight: "bold",
      fontFamily: "Montserrat_700Bold",
      color: palette.offWhite,
    },
    weatherCondition: {
      fontSize: 18,
      fontFamily: "Montserrat_400Regular",
      color: palette.lightMoss,
    },
    weatherAdvice: {
      fontSize: 14,
      fontStyle: "italic",
      color: palette.offWhite,
      fontFamily: "Montserrat_400Regular",
      marginTop: 12,
    },

    pestCard: {
      backgroundColor: palette.alertRed,
      borderRadius: 20,
      padding: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    pestTextContainer: { flex: 1, paddingRight: 10 },
    pestTitle: {
      fontSize: 18,
      fontWeight: "bold",
      fontFamily: "Montserrat_700Bold",
      color: palette.offWhite,
      marginBottom: 4,
    },
    pestDescription: {
      color: palette.offWhite,
      fontSize: 14,
      fontFamily: "Montserrat_400Regular",
    },
    pestRiskCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    pestRiskPercent: {
      fontSize: 24,
      fontWeight: "bold",
      fontFamily: "Montserrat_700Bold",
      color: palette.offWhite,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      fontFamily: "Montserrat_700Bold",
      marginLeft: 10,
      color: isDark ? palette.lightMoss : palette.mediumGreen,
    },
    schemeCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#1c1c1e" : "#e8ffe8",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.4 : 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    schemeIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: palette.emrald,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    schemeText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "500",
      fontFamily: "Montserrat_500Medium",
      color: isDark ? palette.lightSand : palette.mediumGreen,
    },
    blogListContainer: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    blogCard: {
      backgroundColor: isDark ? "#1c1c1e" : palette.offWhite,
      borderRadius: 16,
      width: 200,
      marginRight: 16,
      overflow: "hidden",
      elevation: 5,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.6 : 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    blogThumbnail: {
      height: 100,
      justifyContent: "center",
      alignItems: "center",
    },
    blogThumbnailImage: {
      resizeMode: "cover",
    },
    blogThumbnailOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    blogTitle: {
      padding: 12,
      fontSize: 14,
      minHeight: 60,
      fontWeight: "500",
      fontFamily: "Montserrat_500Medium",
      color: isDark ? palette.lightSand : palette.mediumGreen,
    },
  });
