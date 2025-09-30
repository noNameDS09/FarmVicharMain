import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{ padding: 16, backgroundColor: isDark ? "black" : "#fff" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 16,
          color: isDark ? "white" : "black",
        }}
      >
        FarmVichar: AI-Powered Farming Assistant
      </Text>
      <Text
        style={{
          fontSize: 16,
          marginBottom: 12,
          color: isDark ? "white" : "black",
        }}
      >
        Executive Summary
      </Text>
      <Text
        numberOfLines={3}
        ellipsizeMode="tail"
        style={{
          fontSize: 14,
          lineHeight: 20,
          color: isDark ? "white" : "black",
        }}
      >
        Indian agriculture faces challenges like climate risks, low income,
        and limited digital support. FarmVichar aims to bridge this gap
        with a farmer-first, AI-powered assistant.
      </Text>
      <View style={{ marginTop: 8, marginLeft: 12 }}>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: isDark ? "white" : "black",
          }}
        >
          • Smart, personalized crop advisory
        </Text>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: isDark ? "white" : "black",
          }}
        >
          • Easy access to inputs & services
        </Text>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: isDark ? "white" : "black",
          }}
        >
          • Financial support & insurance
        </Text>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: isDark ? "white" : "black",
          }}
        >
          • Market linkages for fair prices
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{ marginTop: 12 }}
      >
        <Text
          style={{ color: isDark ? "#03e3fc" : "blue", fontWeight: "bold" }}
        >
          Learn more about us...
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: isDark ? "#212121" : "white" }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: isDark ? "#d1cfcf" : "black",
              }}
            >
              About Us
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? "#c2c2c2" : "black"}
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={{ flex: 1, backgroundColor: isDark ? "#212121" : "white" }}
          >
            <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 16,
                  color: isDark ? "white" : "black",
                }}
              >
                FarmVichar: AI for Farmers
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: isDark ? "#d1cfcf" : "black",
                }}
              >
                FarmVichar is a simple, voice-first assistant that helps
                Kerala farmers with crop planning, pest alerts, financial
                access, and better market prices. Our goal is to make farming
                smarter, easier, and more profitable.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
