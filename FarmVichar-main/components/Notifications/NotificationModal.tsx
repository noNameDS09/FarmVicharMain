import { AlertType } from "@/types/types";
import { Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotificationDetailModal } from "./NotificationDetailModal";

type AlertWithIndex = AlertType & { index: number };

// Utility function to get relative time string
const getRelativeTime = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return diffDays + " day" + (diffDays > 1 ? "s" : "") + " ago";
  if (diffHours > 0) return diffHours + " hour" + (diffHours > 1 ? "s" : "") + " ago";
  if (diffMinutes > 0) return diffMinutes + " minute" + (diffMinutes > 1 ? "s" : "") + " ago";
  return "Just now";
};

// Map alertType to icon component and icon name
const iconMap: Record<string, { iconLib: any; iconName: string }> = {
  weather: { iconLib: Ionicons, iconName: "cloud-outline" },
  scheme: { iconLib: MaterialCommunityIcons, iconName: "gift" },
  pest: { iconLib: MaterialCommunityIcons, iconName: "bug-outline" },
  market: { iconLib: MaterialCommunityIcons, iconName: "cash-register" },
  irrigation: { iconLib: MaterialCommunityIcons, iconName: "water" },
  calendar: { iconLib: FontAwesome5, iconName: "calendar-alt" },
  sales: { iconLib: MaterialCommunityIcons, iconName: "cash-register" },
  recommendations: { iconLib: MaterialCommunityIcons, iconName: "gift" },
  users: { iconLib: FontAwesome5, iconName: "user" },
  monitoring: { iconLib: Entypo, iconName: "signal" },
  alerts: { iconLib: Ionicons, iconName: "alert-circle-outline" },
};

export const NotificationModal = ({
  visible,
  onClose,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertWithIndex | null>(null);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const userId = process.env.EXPO_PUBLIC_USER_ID;
        const response = await fetch(`${process.env.EXPO_PUBLIC_DB_BACKEND}/api/users/${userId}/alerts/`);
        const data = await response.json();
        setAlerts(data);
      } catch (error) {
        console.log("Failed to fetch notifications:", error);
      }
    };
    getNotifications();
  }, []);

  const handleAlertPress = (alert: AlertType, index: number) => {
    setAlerts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, status: "read" } : a))
    );
    setSelectedAlert({ ...alert, index, status: "read" });
  };

  const closeDetail = () => {
    setSelectedAlert(null);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className={"flex-1 " + (isDark ? "bg-black" : "bg-white")}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-300">
          <Text
            className={"text-lg font-bold " + (isDark ? "text-white" : "text-black")}
          >
            Notifications
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons
              name="close"
              size={24}
              color={isDark ? "#c2c2c2" : "black"}
            />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView className="flex-1 px-4 py-2">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert, index) => {
              const alertTypeLower = alert.alertType.toLowerCase();
              const iconInfo = iconMap[alertTypeLower] || { iconLib: Ionicons, iconName: "notifications-outline" };
              const IconComponent = iconInfo.iconLib;
              const iconName = iconInfo.iconName;
              const isRead = alert.status === "read";

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAlertPress(alert, index)}
                  className={"flex-row items-start py-3 border-b " + (isDark ? "border-neutral-700" : "border-gray-200")}
                >
                  {/* Icon */}
                  <View className="w-8 mr-3 mt-1">
                    <IconComponent
                      name={iconName}
                      size={24}
                      color={isDark ? "#c2c2c2" : "#6b7280"}
                    />
                  </View>

                  {/* Text Content */}
                  <View className="flex-1">
                    <Text        
                      className={"text-xs font-semibold uppercase mb-0.5 " + (isDark ? "text-gray-400" : "text-gray-500")}
                    >
                      {alert.alertType}
                    </Text>
                    <Text
                      numberOfLines={2}
                      className={"text-sm mb-0.5 " + (isDark ? "text-gray-200" : "text-gray-800")}
                    >
                      {alert.message}
                    </Text>
                    <Text
                      className={"text-xs " + (isDark ? "text-gray-400" : "text-gray-500")}
                    >
                      {getRelativeTime(alert.dueDate ?? undefined)}
                    </Text>
                  </View>

                  {/* Orange dot for unread */}
                  {!isRead && (
                    <View className="w-3 h-3 bg-orange-500 rounded-full mt-3 ml-3" />
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="flex-1 justify-center items-center mt-20">
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={isDark ? "gray" : "black"}
              />
              <Text
                className={"mt-2 text-sm " + (isDark ? "text-gray-400" : "text-gray-600")}
              >
                No new notifications
              </Text>
            </View>
          )}
        </ScrollView>

        <NotificationDetailModal
          visible={!!selectedAlert}
          onClose={closeDetail}
          isDark={isDark}
          alert={selectedAlert}
        />
      </SafeAreaView>
    </Modal>
  );
};
