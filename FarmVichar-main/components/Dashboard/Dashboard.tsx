import { palette } from "@/data/color";
import { DashboardData } from "@/types/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Circle,
  Defs,
  Stop,
  Svg,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

interface DashboardProps {
  data: DashboardData;
  refreshing: boolean;
  onRefresh: () => void;
}

const { width: screenWidth } = Dimensions.get("window");
const cardMargin = 8;
const containerPadding = 12;
const cardWidth = (screenWidth - containerPadding * 2 - cardMargin * 2) / 2;

const StatCard = ({
  icon,
  label,
  value,
  unit,
  trend,
  trendValue,
  backgroundColor = "bg-white dark:bg-zinc-800",
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  backgroundColor?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    className={`${backgroundColor} rounded-3xl p-5 shadow-lg border border-gray-100 dark:border-zinc-700`}
    style={{ width: cardWidth, marginHorizontal: cardMargin / 2 }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {/* Header with Icon and Trend */}
    <View className="flex-row items-center justify-between mb-3">
      <View className="bg-gray-50 dark:bg-zinc-700 rounded-2xl p-2.5">
        {icon}
      </View>
      {trend && trendValue && (
        <View
          className={`flex-row items-center px-2.5 py-1 rounded-full ${
            trend === "up"
              ? "bg-emerald-50 dark:bg-emerald-900/30"
              : trend === "down"
                ? "bg-red-50 dark:bg-red-900/30"
                : "bg-gray-50 dark:bg-zinc-700"
          }`}
        >
          <Ionicons
            name={
              trend === "up"
                ? "trending-up"
                : trend === "down"
                  ? "trending-down"
                  : "remove"
            }
            size={12}
            color={
              trend === "up"
                ? "#10B981"
                : trend === "down"
                  ? "#EF4444"
                  : "#6B7280"
            }
          />
          <Text
            style={{ fontFamily: "Montserrat_500Medium" }}
            className={`text-xs ml-1 ${
              trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : trend === "down"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {trendValue}
          </Text>
        </View>
      )}
    </View>

    {/* Label */}
    <Text
      style={{ fontFamily: "Montserrat_500Medium" }}
      className="text-sm text-gray-600 dark:text-gray-400 mb-1"
    >
      {label}
    </Text>

    {/* Value */}
    <View className="flex-row items-baseline">
      <Text
        style={{ fontFamily: "Montserrat_700Bold" }}
        className="text-2xl text-gray-900 dark:text-white"
      >
        {value}
      </Text>
      {unit && (
        <Text style={{ fontFamily: "Montserrat_400Regular" }} className="text-sm text-gray-500 dark:text-gray-400 ml-1">
          {unit}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

const ProgressRing = ({
  percentage,
  label,
  color,
  size = 80,
  strokeWidth = 8,
  showBackground = true,
  subtitle,
}: {
  percentage: number;
  label: string;
  color: string;
  size?: number;
  strokeWidth?: number;
  showBackground?: boolean;
  subtitle?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View className="items-center justify-center p-5 bg-white dark:bg-zinc-800 rounded-3xl shadow-lg border border-gray-100 dark:border-zinc-700 flex-1 mx-1">
      <View
        className="relative items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <SvgLinearGradient
              id={`gradient-${label.replace(/\s+/g, "")}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={color} stopOpacity="1" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </SvgLinearGradient>
          </Defs>
          {showBackground && (
            <Circle
              stroke="#F3F4F6"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
          )}
          <Circle
            stroke={`url(#gradient-${label.replace(/\s+/g, "")})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        <View className="absolute inset-0 items-center justify-center">
          <Text
            style={{ fontFamily: "Montserrat_700Bold" }}
            className="text-xl text-gray-900 dark:text-white"
          >
            {percentage}%
          </Text>
        </View>
      </View>

      <View className="items-center mt-3">
        <Text
          style={{ fontFamily: "Montserrat_500Medium" }}
          className="text-sm text-gray-900 dark:text-white text-center"
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            style={{ fontFamily: "Montserrat_400Regular" }}
            className="text-xs text-gray-500 dark:text-gray-400 text-center mt-0.5"
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const SectionHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}) => (
  <View className="flex-row items-center justify-between mb-4">
    <View className="flex-1">
      <Text
        style={{ fontFamily: "Montserrat_700Bold" }}
        className="text-xl text-gray-900 dark:text-white"
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{ fontFamily: "Montserrat_400Regular" }}
          className="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
        >
          {subtitle}
        </Text>
      )}
    </View>
    {action && (
      <TouchableOpacity
        onPress={action.onPress}
        className="bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl"
      >
        <Text
          style={{ fontFamily: "Montserrat_500Medium" }}
          className="text-sm text-emerald-600 dark:text-emerald-400"
        >
          {action.label}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

const SchemeCard = ({
  scheme,
  isApplied = false,
}: {
  scheme: string;
  isApplied?: boolean;
}) => (
  <View
    className={`flex-row items-center p-3 rounded-2xl mb-2 ${
      isApplied
        ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700"
        : "bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600"
    }`}
  >
    <View
      className={`w-2 h-2 rounded-full mr-3 ${
        isApplied ? "bg-emerald-500" : "bg-gray-400"
      }`}
    />
    <Text
      style={{ fontFamily: "Montserrat_400Medium" }}
      className={`flex-1 text-sm ${
        isApplied
          ? "text-emerald-700 dark:text-emerald-300"
          : "text-gray-700 dark:text-gray-300"
      }`}
    >
      {scheme}
    </Text>
    {isApplied && (
      <View className="bg-emerald-500 rounded-full p-1">
        <Ionicons name="checkmark" size={12} color="white" />
      </View>
    )}
  </View>
);

const Dashboard: React.FC<DashboardProps> = ({
  data,
  refreshing,
  onRefresh,
}) => {
  const insets = useSafeAreaInsets();
  const { predictions, user_profile } = data;
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  // Safely access nested properties with optional chaining and provide fallbacks
  const minPrice = predictions?.price_range_per_quintal?.min_price ?? 0;
  const maxPrice = predictions?.price_range_per_quintal?.max_price ?? 0;
  const avgPrice = (minPrice + maxPrice) / 2;

  const priceData = [
    {
      value: minPrice,
      label: "Min",
      topLabelComponent: () => (
        <Text
          style={{ fontFamily: "Montserrat_500Medium" }}
          className="text-xs text-gray-600 dark:text-gray-400"
        >
          ₹{minPrice.toLocaleString()}
        </Text>
      ),
    },
    {
      value: avgPrice,
      label: "Avg",
      topLabelComponent: () => (
        <Text
          style={{ fontFamily: "Montserrat_500Medium" }}
          className="text-xs text-gray-600 dark:text-gray-400 "
        >
          ₹{avgPrice.toLocaleString()}
        </Text>
      ),
    },
    {
      value: maxPrice,
      label: "Max",
      topLabelComponent: () => (
        <Text
          style={{ fontFamily: "Montserrat_500Medium" }}
          className="text-xs text-gray-600 dark:text-gray-400"
        >
          ₹{maxPrice.toLocaleString()}
        </Text>
      ),
    },
  ];

  const firstName = user_profile?.fullName?.split(" ")[0] ?? "Farmer";
  const currentTime = new Date().getHours();
  const greeting =
    currentTime < 12
      ? "Good Morning"
      : currentTime < 18
        ? "Good Afternoon"
        : "Good Evening";

  return (
    <SafeAreaView
      className="flex-1 bg-emerald-500 dark:bg-black"
      style={{ paddingTop: 0 }}
    >
      <ScrollView
      style={[
              // styles.flexOne,
              {
                backgroundColor: isDark ? palette.nearBlack : palette.offWhite,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                flex: 1
              },
              
            ]}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 10,
          paddingHorizontal: containerPadding,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981"]}
          />
        }
      >
        {/* Header Section */}
        <View className="mb-8">
          <Text
            style={{ fontFamily: "Montserrat_400Regular" }}
            className="text-2xl text-gray-900 dark:text-white mt-4 font-bold"
          >
            {greeting}, {firstName}! 👋
          </Text>
          <Text
            style={{ fontFamily: "Montserrat_400Regular" }}
            className="text-base text-gray-600 dark:text-gray-400 mt-1"
          >
            Here's what's happening with your farm today
          </Text>
        </View>

        {/* Key Metrics Cards */}
        <View className="flex-row justify-between mb-6">
          <StatCard
            icon={<Ionicons name="leaf-outline" size={24} color="#10B981" />}
            label="Recommended Crop"
            value={predictions?.recommended_crop ?? "N/A"}
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            icon={
              <MaterialCommunityIcons
                name="weight-kilogram"
                size={24}
                color="#3B82F6"
              />
            }
            label="Yield Prediction"
            value={predictions?.yield_prediction_kg_acre ?? 0}
            unit="kg/acre"
            trend="up"
            trendValue="+8%"
          />
        </View>

        {/* Risk & Quality Indicators */}
        <SectionHeader
          title="Farm Health Indicators"
          subtitle="Real-time monitoring of your farm's condition"
        />
        <View className="flex-row justify-between mb-6">
          <ProgressRing
            percentage={predictions?.pest_risk_percent ?? 0}
            label="Pest Risk"
            subtitle="Low risk detected"
            color="#F97316"
            size={90}
          />
          <ProgressRing
            percentage={predictions?.quality_grading_score ?? 0}
            label="Quality Score"
            subtitle="Excellent grade"
            color="#8B5CF6"
            size={90}
          />
        </View>

        {/* Enhanced Price Prediction Chart */}
        <View className="bg-white dark:bg-zinc-800 rounded-3xl p-6 mb-6 shadow-lg border border-gray-100 dark:border-zinc-700">
          <SectionHeader
            title="Price Forecast"
            subtitle={`${predictions?.price_range_per_quintal?.crop_name ?? "N/A"} - Current Market Trends`}
            action={{ label: "View Details", onPress: () => {} }}
          />

          <View className="bg-gray-50 dark:bg-zinc-700 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text
                  style={{ fontFamily: "Montserrat_500Medium" }}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  Expected Range
                </Text>
                <Text
                  style={{ fontFamily: "Montserrat_700Bold" }}
                  className="text-2xl text-gray-900 dark:text-white"
                >
                  ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
                </Text>
                <Text
                  style={{ fontFamily: "Montserrat_500Medium" }}
                  className="text-sm text-emerald-600 dark:text-emerald-400"
                >
                  per quintal
                </Text>
              </View>
              <View className="bg-white dark:bg-zinc-600 rounded-2xl p-3">
                <Ionicons name="trending-up" size={24} color="#10B981" />
              </View>
            </View>
          </View>

          <BarChart
            color={"#3B82F6"}
            data={priceData}
            barWidth={50}
            initialSpacing={10}
            spacing={15}
            barBorderRadius={5}
            yAxisTextStyle={{
              fontFamily: "Montserrat_500Medium",
              color: "#6B7280",
              fontSize: 12,
            }}
            xAxisLabelTextStyle={{
              fontFamily: "Montserrat_500Medium",
              color: "#6B7280",
              marginTop: 0,
            }}
            yAxisThickness={1}
            xAxisThickness={1}
            noOfSections={4}
            maxValue={Math.ceil((maxPrice || 1000) / 1000) * 1000}
            isAnimated
            animationDuration={1200}
            frontColor={"#3B82F6"}
            backgroundColor={"#fff"}
            
          
          />
        </View>

        {/* Enhanced Government Schemes */}
        <View className="bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-zinc-700">
          <SectionHeader
            title="Government Schemes"
            subtitle="Available opportunities for your farm"
            action={{ label: "Explore More", onPress: () => {} }}
          />

          {/* Applied Schemes */}
          {(predictions?.applied_schemes?.length ?? 0) > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <View className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-1.5 mr-2">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
                <Text
                  style={{ fontFamily: "Montserrat_500Medium" }}
                  className="text-base text-gray-900 dark:text-white "
                >
                  Active Schemes
                </Text>
                <View className="bg-emerald-500 rounded-full px-2 py-0.5 ml-2">
                  <Text
                    style={{ fontFamily: "Montserrat_500Medium" }}
                    className="text-xs text-white"
                  >
                    {predictions?.applied_schemes?.length}
                  </Text>
                </View>
              </View>
              {predictions?.applied_schemes?.map((scheme, index) => (
                <SchemeCard
                  key={`applied-${index}`}
                  scheme={scheme}
                  isApplied={true}
                />
              ))}
            </View>
          )}

          {/* Available Schemes */}
          <View>
            <View className="flex-row items-center mb-3">
              <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-1.5 mr-2">
                <Ionicons name="information-circle" size={16} color="#3B82F6" />
              </View>
              <Text
                style={{ fontFamily: "Montserrat_500Medium" }}
                className="text-base text-gray-900 dark:text-white"
              >
                Available for You
              </Text>
              <View className="bg-blue-500 rounded-full px-2 py-0.5 ml-2">
                <Text
                  style={{ fontFamily: "Montserrat_500Medium" }}
                  className="text-xs text-white"
                >
                  {predictions?.applicable_schemes?.length ?? 0}
                </Text>
              </View>
            </View>
            {(predictions?.applicable_schemes?.length ?? 0) > 0 ? (
              predictions?.applicable_schemes?.map((scheme, index) => (
                <SchemeCard key={`available-${index}`} scheme={scheme} />
              ))
            ) : (
              <View className="bg-gray-50 dark:bg-zinc-700 rounded-2xl p-4 items-center">
                <Ionicons name="document-outline" size={32} color="#9CA3AF" />
                <Text
                  style={{ fontFamily: "Montserrat_400Regular" }}
                  className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center"
                >
                  No schemes available at the moment
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
