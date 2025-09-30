import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyForm = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    setError('');
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    if (mountedRef.current) setLoading(true);
    if (mountedRef.current) setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

      // Mock successful login (replace with actual API call)
      const mockResponse = {
        success: true,
        token: 'mock_access_token_12345',
        user: { name: email.split('@')[0] } // Use email prefix as name
      };

      if (mockResponse.success) {
        await AsyncStorage.setItem('access_token', mockResponse.token);
        await AsyncStorage.setItem('user_name', mockResponse.user.name);
        console.log('✅ Token and user name stored in AsyncStorage');
        onLoginSuccess();
      } else {
        if (mountedRef.current) setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      if (mountedRef.current) setError('An error occurred during login. Please try again.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900 px-6">
      <View className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Login to KrishiVichar
        </Text>

        {error ? (
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        ) : null}

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </Text>
          <TextInput
            className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </Text>
          <TextInput
            className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          className={`w-full h-12 rounded-lg justify-center items-center ${
            loading ? 'bg-gray-400' : 'bg-green-600'
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

        <TouchableOpacity className="mt-4">
          <Text className="text-center text-sm text-blue-600 dark:text-blue-400">
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MyForm;
