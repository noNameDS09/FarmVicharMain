import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function MyForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const router = useRouter();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      age: "",
      gender: "",
      preferredLanguage: "Malayalam",
      educationLevel: "",
      farmingExperienceYears: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    console.log(data);
    await AsyncStorage.setItem("profile_info", JSON.stringify(data));
    Alert.alert("Form Submitted", "Profile information saved successfully!");
    reset();
    if (onSubmitSuccess) {
      onSubmitSuccess();
    } else {
      router.back();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Full Name */}
      <Text style={styles.label}>Full Name</Text>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      {/* Phone */}
      <Text style={styles.label}>Phone</Text>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter contact no:"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
          />
        )}
      />

      {/* Age */}
      <Text style={styles.label}>Age</Text>
      <Controller
        control={control}
        name="age"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
          />
        )}
      />

      {/* Education Level */}
      <Text style={styles.label}>Education Level</Text>
      <Controller
        control={control}
        name="educationLevel"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter education level"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      {/* Farming Experience */}
      <Text style={styles.label}>Farming Experience (Years)</Text>
      <Controller
        control={control}
        name="farmingExperienceYears"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Number of years"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
          />
        )}
      />

      {/* Gender */}
      <Text style={styles.label}>Gender</Text>
      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Gender"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Submit" onPress={handleSubmit(onSubmit)} />
      </View>

      {/* Preferred Language */}
      <Text style={styles.label}>Preferred Language</Text>
      <Controller
        control={control}
        name="preferredLanguage"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Preferred Language"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            value={value}
            onChangeText={onChange}
            secureTextEntry={true}
          />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});
