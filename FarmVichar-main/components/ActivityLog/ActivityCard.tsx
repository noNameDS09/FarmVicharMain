import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

// These are the props being passed from ActivityScreen:
// { activityType, description, timestamp, id, ... }
interface ActivityCardProps {
  activityType: string;
  description: string;
  timestamp: string;
}

// A helper function to choose an icon based on the activity type
const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  if (!type) return "document-text-outline";
  const lowerType = type.toLowerCase();

  if (lowerType.includes("observation")) return "eye-outline";
  if (lowerType.includes("weeding")) return "leaf-outline";
  if (lowerType.includes("irrigation")) return "water-outline";
  if (lowerType.includes("fertilizer")) return "flask-outline";
  if (lowerType.includes("pesticide")) return "bug-outline";
  if (lowerType.includes("planting")) return "trending-up-outline";
  if (lowerType.includes("maintenance")) return "build-outline";
  if (lowerType.includes("pest")) return "alert-circle-outline";

  return "document-text-outline"; // Default icon for other types
};

const ActivityCard: React.FC<ActivityCardProps> = ({
  activityType,
  description,
  timestamp,
}) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <View className="flex-row items-center bg-white dark:bg-zinc-800 rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-zinc-700">
      <View className="bg-emerald-50 dark:bg-emerald-900/30 rounded-full w-12 h-12 justify-center items-center mr-4">
        <Ionicons
          name={getActivityIcon(activityType)}
          size={24}
          color="#10B981"
        />
      </View>
      <View className="flex-1 mr-2">
        <Text
          style={{ fontFamily: "Montserrat_500Medium" }}
          className="text-base text-gray-800 dark:text-white capitalize"
        >
          {activityType}
        </Text>
        <Text
          style={{ fontFamily: "Montserrat_400Regular" }}
          className="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
          numberOfLines={1}
        >
          {description}
        </Text>
      </View>
      <Text
        style={{ fontFamily: "Montserrat_500Medium" }}
        className="text-xs text-gray-400 dark:text-gray-500 self-start mt-1"
      >
        {formattedTime}
      </Text>
    </View>
  );
};

export default ActivityCard;