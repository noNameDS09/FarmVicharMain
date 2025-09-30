import React, { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserResponse = {
  fullName: string;
  phone: string;
  age: number;
  gender: string;
  preferredLanguage: string;
  educationLevel: string;
  farmingExperienceYears: number;
  id: string;
  createdAt: string;
  lastLogin: string;
};

const LoginForm = ({
  onLoginSuccess,
  onSwitchToRegister,
}: {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const validateForm = () => {
    if (!phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    if (mountedRef.current) setLoading(true);
    if (mountedRef.current) setError("");

    try {
      const response = await fetch("https://farmvichardatabase.onrender.com/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const data: UserResponse | { message?: string } = await response.json();

      if ("id" in data && data.fullName) {
        await AsyncStorage.setItem("user_info", JSON.stringify(data));
        onLoginSuccess();
      } else {
        if (mountedRef.current) {
          setError((data as any).message || "Login failed. Please check credentials.");
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                Login to FarmVichar
              </Text>

              {error ? (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
              ) : null}

              <View className="mb-4">
                <TextInput
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View className="mb-6">
                <TextInput
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>

              <TouchableOpacity
                className={`w-full h-12 rounded-lg justify-center items-center ${
                  loading ? "bg-gray-400" : "bg-green-600"
                }`}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold text-lg">Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity className="mt-2" onPress={onSwitchToRegister}>
                <Text className="text-center text-sm text-blue-600 dark:text-blue-400">
                  Don't have an account? Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginForm;
