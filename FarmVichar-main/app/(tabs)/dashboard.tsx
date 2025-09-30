import Dashboard from "@/components/Dashboard/Dashboard";
import { DashboardData } from "@/types/types";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_700Bold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy data to be used as a fallback
const dummyData: DashboardData = {
  user_profile: {
    id: "dummyUser123",
    fullName: "Local Farmer",
    phone: "0000000000",
  },
  weather: {
    temperature: 28,
    condition: "Partly Cloudy",
    humidity: 75,
    wind_speed: 10,
  },
  predictions: {
    recommended_crop: "Paddy",
    yield_prediction_kg_acre: 1800,
    pest_risk_percent: 45,
    quality_grading_score: 88,
    price_range_per_quintal: {
      crop_name: "Paddy",
      min_price: 2100,
      max_price: 2450,
    },
    applicable_schemes: ["PM-KISAN", "Crop Insurance Scheme"],
    applied_schemes: ["PM-KISAN"],
  },
};

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  const getFarmerDetails = async () => {
    try {
      const userInfoString = await AsyncStorage.getItem("user_info");
      if (!userInfoString) {
        throw new Error("User not logged in.");
      }
      const userInfo = JSON.parse(userInfoString);
      const userId = userInfo.id;

      // Using the ML endpoint as it provides the prediction data
      const response = await fetch(`${process.env.EXPO_PUBLIC_ML_BACKEND}/dashboard/${userId}`);
      
      if (response.ok) {
        const fetchedData: DashboardData = await response.json();
        setData(fetchedData);
        setError(null);
      } else {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.warn("API Error, using fallback data:", errorMessage);
      setError(errorMessage);
      setData(dummyData); // Use dummy data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getFarmerDetails();
  }, []);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getFarmerDetails();
  }, []);

  if (loading || !fontsLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <StatusBar style={isDark ? "light" : "dark"} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text
            style={{ fontFamily: "Montserrat_400Regular" }}
            className="mt-4 text-base text-gray-500 dark:text-gray-400"
          >
            Loading Dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: "Montserrat_400Regular" }}>
          Error loading data. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-emerald-500 -mt-10">
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="flex-1 bg-gray-50 dark:bg-zinc-900 rounded-t-3xl">
        <Dashboard data={data} onRefresh={onRefresh} refreshing={refreshing} />
      </View>
    </SafeAreaView>
  );
}
