import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// const { width, height } = Dimensions.get('window');

import AddFarmForm from "@/components/Profile/AddFarmForm";
import { dummyFarms, dummyProfile } from "@/data/data";
interface UserProfile {
  fullName: string;
  phone: string;
  age: number;
  gender: string;
  educationLevel: string;
  farmingExperienceYears: number;
  id: string;
}

interface Farm {
  village: string;
  taluka: string;
  district: string;
  state: string;
  pinCode: string;
  totalFarmArea: number;
  soilType: string;
  waterSource: string;
  irrigationMethod: string;
  climateNotes: string;
  id: string;
}

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddFarmModalVisible, setAddFarmModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userInfoString = await AsyncStorage.getItem("user_info");
      if (!userInfoString) {
        throw new Error("User not logged in.");
      }
      const userInfo = JSON.parse(userInfoString);
      const userId = userInfo.id;

      const [profileResponse, farmsResponse] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_DB_BACKEND}/api/users/${userId}`),
        fetch(
          `${process.env.EXPO_PUBLIC_DB_BACKEND}/api/users/${userId}/farms/`
        ),
      ]);

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch profile data.");
      }
      const profileData: UserProfile = await profileResponse.json();
      setProfile(profileData);

      if (farmsResponse.ok) {
        const farmsData: Farm[] = await farmsResponse.json();
        setFarms(farmsData);
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.warn("API Error, using fallback data:", errorMessage);
      // setError("Using sample data - connection issues");
      setProfile(dummyProfile);
      setFarms(dummyFarms);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddFarm = (newFarm: Farm) => {
    setFarms((prevFarms) => [newFarm, ...prevFarms]);
    setAddFarmModalVisible(false);
    ToastAndroid.show(`${newFarm.village} added successfully!`, ToastAndroid.SHORT);
  };

  // Enhanced Loading Component
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <LinearGradient
        colors={["#F0FDF4", "#ECFDF5", "#D1FAE5"]}
        style={styles.loadingCard}
      >
        <View style={styles.loadingContent}>
          <Animated.View
            style={[
              styles.loadingSpinner,
              {
                transform: [
                  {
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={["#10B981", "#34D399", "#6EE7B7"]}
              style={styles.spinnerGradient}
            >
              <MaterialCommunityIcons name="leaf" size={32} color="white" />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.loadingTitle}>Loading Your Profile</Text>
          <Text style={styles.loadingSubtitle}>
            Fetching your farming data...
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  // Enhanced Error Component
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <LinearGradient
        colors={["#FEF2F2", "#FEE2E2", "#FECACA"]}
        style={styles.errorCard}
      >
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="cloud-offline" size={48} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Connection Issue</Text>
          <Text style={styles.errorDescription}>
            {error ||
              "Unable to connect to the server. Please check your internet connection."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <LinearGradient
              colors={["#EF4444", "#DC2626"]}
              style={styles.retryGradient}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.retryText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  // Enhanced Detail Row Component
  const renderDetailRow = (
    iconName: keyof typeof Ionicons.glyphMap,
    iconColor: string,
    bgColor: string,
    label: string,
    value: string | number,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.detailRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <LinearGradient
        colors={[bgColor + "20", bgColor + "10"]}
        style={styles.detailIconContainer}
      >
        <Ionicons name={iconName} size={20} color={iconColor} />
      </LinearGradient>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  // Enhanced Stats Component
  const renderAdvancedStats = () => {
    const totalArea = farms.reduce(
      (total, farm) => total + farm.totalFarmArea,
      0
    );
    const avgFarmSize = farms.length > 0 ? totalArea / farms.length : 0;

    return (
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={["#FFFFFF", "#F8FAFC"]}
          style={styles.statsCard}
        >
          <Text style={styles.statsTitle}>Farm Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <LinearGradient
                colors={["#10B981", "#34D399"]}
                style={styles.statIconBg}
              >
                <MaterialCommunityIcons
                  name="tractor"
                  size={24}
                  color="white"
                />
              </LinearGradient>
              <Text style={styles.statNumber}>{farms.length}</Text>
              <Text style={styles.statLabel}>Active Farms</Text>
            </View>

            <View style={styles.statBox}>
              <LinearGradient
                colors={["#3B82F6", "#60A5FA"]}
                style={styles.statIconBg}
              >
                <MaterialCommunityIcons
                  name="map-marker-radius"
                  size={24}
                  color="white"
                />
              </LinearGradient>
              <Text style={styles.statNumber}>{totalArea.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total Acres</Text>
            </View>

            <View style={styles.statBox}>
              <LinearGradient
                colors={["#F59E0B", "#FBBF24"]}
                style={styles.statIconBg}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={24}
                  color="white"
                />
              </LinearGradient>
              <Text style={styles.statNumber}>
                {profile?.farmingExperienceYears || 0}
              </Text>
              <Text style={styles.statLabel}>Years Exp.</Text>
            </View>

            <View style={styles.statBox}>
              <LinearGradient
                colors={["#8B5CF6", "#A78BFA"]}
                style={styles.statIconBg}
              >
                <MaterialCommunityIcons
                  name="chart-line"
                  size={24}
                  color="white"
                />
              </LinearGradient>
              <Text style={styles.statNumber}>{avgFarmSize.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg. Size</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // Enhanced Profile Header
  const renderProfileHeader = () => (
    <Animated.View
      style={[
        styles.profileContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={["#FFFFFF", "#F9FAFB"]}
        style={styles.profileCard}
      >
        <View style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["lightgreen", "green"]}
              style={styles.avatarGradient}
            >
              <Ionicons name="person" size={40} color="white" />
            </LinearGradient>
            <View style={styles.onlineIndicator} />
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{profile?.fullName}</Text>
            </View>
            <Text style={styles.userRole}>Agricultural Professional</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="#6B7280" />
              <Text style={styles.locationText}>
                {farms.length > 0 ? `${farms[0].state}, India` : "India"}
              </Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" className="mb-0" />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => ToastAndroid.show('Edit profile coming soon!', ToastAndroid.SHORT)}>
            <Ionicons name="pencil" size={18} color="#10B981" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  // Enhanced Farm Card
  const renderFarmCard = (farm: Farm, index: number) => (
    <Animated.View
      key={farm.id}
      style={[
        styles.farmCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30 + index * 10],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={["#FFFFFF", "#FAFAFA"]}
        style={styles.farmCardGradient}
      >
        <View style={styles.farmHeader}>
          <View style={styles.farmTitleContainer}>
            <View style={styles.farmIconContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#10B981"
              />
            </View>
            <View>
              <Text style={styles.farmName}>{farm.village}</Text>
              <Text style={styles.farmLocation}>
                {farm.district}, {farm.state}
              </Text>
            </View>
          </View>

          <View style={styles.farmAreaBadge}>
            <LinearGradient
              colors={["#10B981", "#34D399"]}
              style={styles.areaBadgeGradient}
            >
              <Text style={styles.farmAreaNumber}>{farm.totalFarmArea}</Text>
              <Text style={styles.farmAreaUnit}>acres</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.farmDetailsGrid}>
          <View style={styles.farmDetailItem}>
            <MaterialCommunityIcons name="layers" size={16} color="#8B5CF6" />
            <Text style={styles.farmDetailLabel}>Soil</Text>
            <Text style={styles.farmDetailValue}>{farm.soilType}</Text>
          </View>

          <View style={styles.farmDetailItem}>
            <MaterialCommunityIcons name="water" size={16} color="#06B6D4" />
            <Text style={styles.farmDetailLabel}>Water</Text>
            <Text style={styles.farmDetailValue}>{farm.waterSource}</Text>
          </View>

          <View style={styles.farmDetailItem}>
            <MaterialCommunityIcons
              name="sprinkler"
              size={16}
              color="#F59E0B"
            />
            <Text style={styles.farmDetailLabel}>Irrigation</Text>
            <Text style={styles.farmDetailValue}>{farm.irrigationMethod}</Text>
          </View>
        </View>

        {/* <Link href={`/(tabs)/farm/${farm.id}`} asChild> */}
          <TouchableOpacity style={styles.farmActionButton}>
            <LinearGradient
              colors={["#F0FDF4", "#ECFDF5"]}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>View Farm Details</Text>
              <Ionicons name="arrow-forward" size={18} color="#10B981" />
            </LinearGradient>
          </TouchableOpacity>
        {/* </Link> */}
      </LinearGradient>
    </Animated.View>
  );

  // Enhanced Empty State
  const renderEmptyFarmsState = () => (
    <Animated.View
      style={[
        styles.emptyStateContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={["#F0FDF4", "#ECFDF5", "#D1FAE5"]}
        style={styles.emptyStateCard}
      >
        <View style={styles.emptyStateContent}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={["#10B981", "#34D399"]}
              style={styles.emptyIconGradient}
            >
              <MaterialCommunityIcons name="leaf" size={48} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Start Your Farming Journey</Text>
          <Text style={styles.emptyDescription}>
            Add your first farm to begin tracking crops, monitoring soil health,
            and accessing personalized farming insights.
          </Text>

          <Link href="#" asChild>
            <TouchableOpacity style={styles.addFarmCTA}>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.ctaGradient}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.ctaText}>Add Your First Farm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.learnMoreButton}>
            <Text style={styles.learnMoreText}>
              Learn about farm management
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (loading || !fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  if (error && !profile) {
    return (
      <SafeAreaView style={styles.container}>{renderErrorState()}</SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
            progressBackgroundColor="#F0FDF4"
          />
        }
      >
        <View style={styles.contentContainer}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="information-circle" size={16} color="#F59E0B" />
              <Text style={styles.errorBannerText}>
                Using sample data - connection issues
              </Text>
            </View>
          )}

          {/* <View className="">
            <Text className="text-center flex-1 w-screen text-2xl">
              Profile
            </Text>
          </View> */}

          {profile && (
            <>
              {renderProfileHeader()}
              {renderAdvancedStats()}

              {/* Personal Information Card */}
              <Animated.View
                style={[
                  styles.infoCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F9FAFB"]}
                  style={styles.infoCardGradient}
                >
                  <View style={styles.infoHeader}>
                    <Text style={styles.sectionTitle}>
                      Personal Information
                    </Text>
                    <TouchableOpacity style={styles.editIconButton} onPress={() => ToastAndroid.show('Edit profile coming soon!', ToastAndroid.SHORT)}>
                      <Ionicons
                        name="pencil"
                        size={18}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.infoContent}>
                    {renderDetailRow(
                      "call",
                      "#059669",
                      "#10B981",
                      "Phone Number",
                      profile.phone,
                      () => {}
                    )}
                    {renderDetailRow(
                      "person",
                      "#3B82F6",
                      "#3B82F6",
                      "Age & Gender",
                      `${profile.age} years • ${profile.gender}`
                    )}
                    {renderDetailRow(
                      "school",
                      "#8B5CF6",
                      "#8B5CF6",
                      "Education",
                      profile.educationLevel || "Not specified"
                    )}
                    {renderDetailRow(
                      "time",
                      "#F59E0B",
                      "#F59E0B",
                      "Experience",
                      `${profile.farmingExperienceYears} years in farming`
                    )}
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Farms Section */}
              <View style={styles.farmsSection}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>My Farms</Text>
                    <Text style={styles.sectionSubtitle}>
                      {farms.length} {farms.length === 1 ? "farm" : "farms"}{" "}
                      registered
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.addButton} onPress={() => setAddFarmModalVisible(true)}>
                    <LinearGradient
                      colors={["#00bf00", "green"]}
                      style={styles.addButtonGradient}
                    >
                      <Ionicons name="add" size={20} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {farms.length > 0
                  ? farms.map((farm, index) => renderFarmCard(farm, index))
                  : renderEmptyFarmsState()}
              </View>
            </>
          )}
        </View>
      </Animated.ScrollView>

      <Modal
        visible={isAddFarmModalVisible}
        animationType="slide"
        onRequestClose={() => setAddFarmModalVisible(false)}
      >
        <AddFarmForm onAddFarm={handleAddFarm} onCancel={() => setAddFarmModalVisible(false)} />
      </Modal>

    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingSpinner: {
    marginBottom: 24,
  },
  spinnerGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: "#111827",
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontFamily: "Montserrat_400Regular",
    color: "#6B7280",
    textAlign: "center",
  },

  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  errorContent: {
    alignItems: "center",
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: "#111827",
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  retryGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
    marginLeft: 8,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  contentContainer: {
    paddingHorizontal: 12,
  },

  // Error Banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorBannerText: {
    color: "#92400E",
    fontSize: 14,
    fontFamily: "Montserrat_500Medium",
    marginLeft: 8,
  },

  // Profile Header
  profileContainer: {
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 18,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#22C55E",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontFamily: "Montserrat_800ExtraBold",
    color: "#111827",
    marginRight: 8,
  },
  verifiedBadge: {
    padding: 2,
  },
  userRole: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Montserrat_500Medium",
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  editButton: {
    position: "absolute",
    top: 24,
    right: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
  },

  // Stats
  statsContainer: {
    marginBottom: 24,
  },
  statsCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap", // allow multiple lines
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingTop: 0,
  },
  statBox: {
    width: "47%", // two per row with some gap
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#fff", // optional for contrast
    borderRadius: 12, // optional for rounded corners
    paddingVertical: 8,
    elevation: 2, // optional for shadow on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: "Montserrat_800ExtraBold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
  },

  // Info Card
  infoCard: {
    marginBottom: 24,
  },
  infoCardGradient: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#111827",
  },
  editIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  infoContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // Detail Row
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#FAFAFA",
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Montserrat_500Medium",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: "#111827",
    fontFamily: "Montserrat_600SemiBold",
  },

  // Farms Section
  farmsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 18,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Montserrat_400Regular",
    marginTop: 4,
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // Farm Cards
  farmCard: {
    marginBottom: 16,
  },
  farmCardGradient: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  farmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 16,
  },
  farmTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  farmIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  farmName: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#111827",
    marginBottom: 4,
  },
  farmLocation: {
    fontSize: 13,
    fontFamily: "Montserrat_500Medium",
    color: "#6B7280",
  },
  farmAreaBadge: {
    borderRadius: 12,
    overflow: "hidden",
  },
  areaBadgeGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  farmAreaNumber: {
    fontSize: 18,
    fontFamily: "Montserrat_800ExtraBold",
    color: "white",
  },
  farmAreaUnit: {
    fontSize: 11,
    fontFamily: "Montserrat_600SemiBold",
    color: "white",
    opacity: 0.9,
  },
  farmDetailsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  farmDetailItem: {
    alignItems: "center",
    flex: 1,
  },
  farmDetailLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "Montserrat_500Medium",
    marginTop: 6,
    marginBottom: 2,
  },
  farmDetailValue: {
    fontSize: 12,
    color: "#111827",
    fontFamily: "Montserrat_600SemiBold",
  },
  farmActionButton: {
    padding: 20,
    paddingTop: 16,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 15,
    color: "#059669",
    fontFamily: "Montserrat_600SemiBold",
    marginRight: 8,
  },

  // Empty State
  emptyStateContainer: {
    marginTop: 20,
  },
  emptyStateCard: {
    borderRadius: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyStateContent: {
    alignItems: "center",
    padding: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 15,
    fontFamily: "Montserrat_400Regular",
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  addFarmCTA: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  ctaText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    marginLeft: 8,
  },
  learnMoreButton: {
    padding: 8,
  },
  learnMoreText: {
    fontSize: 14,
    color: "#059669",
    fontFamily: "Montserrat_500Medium",
    textDecorationLine: "underline",
  },
});
