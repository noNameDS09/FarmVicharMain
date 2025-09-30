import { AlertType } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

type AlertWithIndex = AlertType & { index: number };

type NotificationDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  alert: AlertWithIndex | null;
};

export const NotificationDetailModal = ({
  visible,
  onClose,
  isDark,
  alert,
}: NotificationDetailModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View
          className={`w-full rounded-2xl p-6 ${
            isDark ? "bg-neutral-900" : "bg-white"
          }`}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {alert?.alertType}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? "#c2c2c2" : "black"}
              />
            </TouchableOpacity>
          </View>

          <Text
            className={`text-base mb-4 ${
              isDark ? "text-gray-200" : "text-gray-800"
            }`}
          >
            {alert?.message}
          </Text>

          <Text
            className={`text-sm mb-2 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Status: {alert?.status}
          </Text>
          <Text
            className={`text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Due: {alert?.dueDate ? new Date(alert.dueDate).toLocaleString() : 'N/A'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
