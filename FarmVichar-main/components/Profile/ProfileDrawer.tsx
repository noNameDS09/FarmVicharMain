import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyProfile } from "../../data/data";
import { useTheme } from "../../hooks/useTheme";

interface DrawerItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}

const DrawerItem: React.FC<DrawerItemProps> = ({
  icon,
  label,
  onPress,
  isDestructive = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center p-3 rounded-xl mb-2 active:bg-gray-200 dark:active:bg-zinc-700"
  >
    <Ionicons
      name={icon}
      size={22}
      color={isDestructive ? "#ef4444" : "#6b7280"}
      style={{ marginRight: 16 }}
    />
    <Text
      className={`text-base font-medium ${
        isDestructive
          ? "text-red-500"
          : "text-gray-800 dark:text-gray-200"
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default function ProfileDrawer({
  onClose,
  onLogout,
  isLoggingOut,
}: {
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  const { colorScheme, toggleTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; phone: string } | null>(
    null
  );

  useEffect(() => {
    const fetchUser = async () => {
      const userInfoString = await AsyncStorage.getItem("user_info");
      if (userInfoString) {
        const userData = JSON.parse(userInfoString);
        setUser(userData);
      }
      setUser(dummyProfile); // Fallback to dummy data if not found
    };
    fetchUser();
  }, []);

  const Logout = async () => {
    await onLogout();
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-zinc-900"
      edges={["top", "bottom"]}
    >
      <View className="flex-1 p-4">
        {/* Profile Header */}
        <View className="flex-row items-center p-4 mb-6">
          <View className="w-16 h-16 rounded-full bg-emerald-500 justify-center items-center mr-4">
            <Text className="text-white text-2xl font-bold">
              {user ? getInitials(user.fullName) : ""}
            </Text>
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {user?.fullName ?? "Loading..."}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {user?.phone ?? ""}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="flex-1">
          <DrawerItem
            icon="person-outline"
            label="Profile"
            onPress={() => {
              onClose();
              router.push("/profile");
            }}
          />
          <DrawerItem
            icon="create-outline"
            label="Edit Profile"
            onPress={() => alert("Edit Profile pressed")}
          />
          <DrawerItem
            icon="settings-outline"
            label="Settings"
            onPress={() => alert("Settings pressed")}
          />
        </View>

        {/* Footer */}
        <View className="border-t border-gray-200 dark:border-zinc-700 pt-4">
          <DrawerItem
            icon={colorScheme === "dark" ? "sunny-outline" : "moon-outline"}
            label={`Switch to ${colorScheme === "dark" ? "Light" : "Dark"} Mode`}
            onPress={toggleTheme}
          />
          <DrawerItem
            icon="log-out-outline"
            label={isLoggingOut ? "Logging out..." : "Logout"}
            onPress={Logout}
            isDestructive
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
