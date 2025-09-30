import {
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Farm {
  village: string;
  taluka: string;
  district: string;
  state: 'Kerala';
  pinCode: string;
  totalFarmArea: number;
  soilType: string;
  waterSource: string;
  irrigationMethod: string;
  climateNotes: string;
  id: string;
}

interface AddFarmFormProps {
  onAddFarm: (newFarm: Farm) => void;
  onCancel: () => void;
}

const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
    />
  </View>
);

export default function AddFarmForm({ onAddFarm, onCancel }: AddFarmFormProps) {
  const [village, setVillage] = useState("");
  const [totalFarmArea, setTotalFarmArea] = useState("");
  const [soilType, setSoilType] = useState("");

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleAdd = () => {
    if (!village || !totalFarmArea || !soilType) {
      alert("Please fill all required fields.");
      return;
    }
    const newFarm: Farm = {
      id: `dummyFarm${Date.now()}`, // Simple unique ID for dummy data
      village,
      taluka: "Kuttanad", // Dummy default
      district: "Alappuzha", // Dummy default
      state: "Kerala",
      pinCode: "688501", // Dummy default
      totalFarmArea: parseFloat(totalFarmArea),
      soilType,
      waterSource: "River", // Dummy default
      irrigationMethod: "Canal", // Dummy default
      climateNotes: "Tropical monsoon climate", // Dummy default
    };
    onAddFarm(newFarm);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#F0FDF4", "#ECFDF5", "#D1FAE5"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add a New Farm</Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Enter the details of your new farm to get started.
          </Text>

          <InputField
            label="Village / Place Name"
            value={village}
            onChangeText={setVillage}
            placeholder="e.g., Kainakary"
          />
          <InputField
            label="Total Farm Area (in acres)"
            value={totalFarmArea}
            onChangeText={setTotalFarmArea}
            placeholder="e.g., 5.5"
            keyboardType="numeric"
          />
          <InputField
            label="Primary Soil Type"
            value={soilType}
            onChangeText={setSoilType}
            placeholder="e.g., Alluvial"
          />

          <Text style={styles.infoText}>
            More details can be added later from the farm's detail page.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.addButtonText}>Add Farm</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    color: "#111827",
  },
  closeButton: { padding: 5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  subtitle: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: "#4B5563",
    marginBottom: 30,
  },
  inputContainer: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Montserrat_600SemiBold",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoText: {
    textAlign: "center",
    fontFamily: "Montserrat_400Regular",
    color: "#6B7280",
    marginTop: 20,
    fontSize: 13,
  },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#D1FAE5" },
  addButton: { borderRadius: 16, overflow: "hidden" },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    marginLeft: 10,
  },
});