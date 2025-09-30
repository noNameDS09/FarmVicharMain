import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddFarmFormProps {
  onFarmAdded: () => void;
}

const AddFarmForm: React.FC<AddFarmFormProps> = ({ onFarmAdded }) => {
  const [farmData, setFarmData] = useState({
    farmName: "",
    totalFarmArea: "",
    soilType: "",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getUserId = async () => {
      const userInfoString = await AsyncStorage.getItem("user_info");
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        setUserId(userInfo.id);
      }
    };
    getUserId();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFarmData({ ...farmData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    for (const key in farmData) {
      if ((farmData as any)[key].trim() === "") {
        Alert.alert("Validation Error", `Please fill in the ${key} field.`);
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://farmvichardatabase.onrender.com/api/users/${userId}/farms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...farmData,
            userId: userId,
            totalFarmArea: parseFloat(farmData.totalFarmArea),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add farm.");
      }

      Alert.alert("Success", "Farm added successfully!");
      onFarmAdded();
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    key: keyof typeof farmData,
    keyboardType: "default" | "numeric" = "default"
  ) => (
    <View style={styles.inputContainer} key={key}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={farmData[key]}
        onChangeText={(text) => handleInputChange(key, text)}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add New Farm</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {renderInput("Farm Name", "farmName")}
        {renderInput("Total Farm Area (in acres)", "totalFarmArea", "numeric")}
        {renderInput("Soil Type", "soilType")}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Farm</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#111827",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#374151",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#A1A1AA",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default AddFarmForm;