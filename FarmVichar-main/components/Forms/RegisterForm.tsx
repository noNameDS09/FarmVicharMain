import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

const RegisterForm = ({
  onRegisterSuccess,
  onSwitchToLogin,
}: {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}) => {
  const [fullName, setFullName] = useState("");
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
    if (!fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    setError("");
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    if (mountedRef.current) setLoading(true);
    if (mountedRef.current) setError("");

    try {
      const response = await fetch("https://farmvichardatabase.onrender.com/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, phone, password }),
      });

      const data = await response.json();

      if (response.status === 201 && data.id) {
        Alert.alert("Success", "Registration successful! Please log in.", [
          { text: "OK", onPress: onRegisterSuccess },
        ]);
      } else {
        if (mountedRef.current) {
          setError(data.detail || "Registration failed. Please try again.");
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError("An error occurred during registration. Please try again.");
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
                Create Account
              </Text>

              {error ? (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
              ) : null}

              <View className="mb-4">
                <TextInput
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View className="mb-4">
                <TextInput
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
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
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              </View>

              <TouchableOpacity
                className={`w-full h-12 rounded-lg justify-center items-center ${
                  loading ? "bg-gray-400" : "bg-green-600"
                }`}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold text-lg">Register</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity className="mt-2" onPress={onSwitchToLogin}>
                <Text className="text-center text-sm text-blue-600 dark:text-blue-400">
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterForm;