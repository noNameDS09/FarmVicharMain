import ActivityScreen from "@/components/ActivityLog/ActivityScreen";
import React from "react";
import { View } from "react-native";

const activitylog = () => {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <ActivityScreen />
    </View>
  );
};

export default activitylog;
