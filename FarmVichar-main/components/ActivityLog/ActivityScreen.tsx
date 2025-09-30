import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useFonts } from "expo-font";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import ActivityCard from "./ActivityCard";
import AddLogForm from "./AddLogForm";

interface Log {
  id: string;
  farmId: string;
  activityType: string;
  description: string;
  timestamp: string;
  geoLocation?: string | null;
}

interface Farm {
  id: string;  
  farmName: string;
}

const dummyFarms: Farm[] = [
  { id: 'farm1', farmName: 'My Local Farm' },
  { id: 'farm2', farmName: 'Green Valley' },
];

const dummyLogs: Log[] = [
  {
    id: 'log1',
    farmId: 'farm1',
    activityType: 'Irrigation',
    description: 'Watered the paddy fields for 1 hour.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'log2',
    farmId: 'farm1',
    activityType: 'Observation',
    description: 'Checked for pests, none found.',
    timestamp: new Date().toISOString(),
  },
];

const ACCENT_COLOR = '#10b981'; // Tailwind's emerald-500

export default function ActivityScreen() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  const fetchLogsForFarm = useCallback(async (farmId: string): Promise<Log[] | null> => {
    try {
      setLoading(true);
      const logsResponse = await fetch(
        `${process.env.EXPO_PUBLIC_DB_BACKEND}/api/farms/${farmId}/logs/`
      );
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData);
        return logsData;
      } else {
        throw new Error(`Could not fetch logs for farm: ${logsResponse.status}`);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError("Failed to fetch logs. Using dummy data.");
      setLogs(dummyLogs);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const userInfoString = await AsyncStorage.getItem("user_info");
        if (!userInfoString) throw new Error("User not logged in.");
        const userInfo = JSON.parse(userInfoString);
        setUserId(userInfo.id);

        const farmsResponse = await fetch(
          `${process.env.EXPO_PUBLIC_DB_BACKEND}/api/users/${userInfo.id}/farms/`
        );
        if (farmsResponse.ok) {
          const farmsData = await farmsResponse.json();
          setFarms(farmsData);

          if (farmsData.length > 0) {
            const firstFarmId = farmsData[0].id;
            setSelectedFarmId(firstFarmId);
            const initialLogs = await fetchLogsForFarm(firstFarmId);

            if (initialLogs && initialLogs.length > 0) {
              const mostRecentTimestamp = initialLogs[0].timestamp;
              if (mostRecentTimestamp) {
                setSelectedDate(mostRecentTimestamp.split("T")[0]);
              }
            }
          } else {
            setLogs([]);
          }
        } else {
          throw new Error(`Could not fetch farms: ${farmsResponse.status}`);
        }
      } catch (err) {
        console.warn("API Error, using fallback data:", (err as Error).message);
        setFarms(dummyFarms);
        setLogs(dummyLogs);
        setSelectedFarmId(dummyFarms[0]?.id || null);
        setError("Failed to fetch data. Displaying sample data.");
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchLogsForFarm]);

  const filteredData = useMemo(() => {
    return logs.filter((item) => {
      if (!item.timestamp) return false;
      const logDate = item.timestamp.split("T")[0];
      return logDate === selectedDate;
    });
  }, [logs, selectedDate]);

  const handleLogAdded = (newLog: Log) => {
    // 1. Close the modal
    setModalVisible(false);

    // 2. Instantly add the new log to the top of the list in the UI
    setLogs((currentLogs) => [newLog, ...currentLogs]);

    // 3. (Optional but recommended) After a short delay, re-fetch from the database
    // to ensure full consistency with the backend.
    setTimeout(() => {
      if (selectedFarmId) {
        fetchLogsForFarm(selectedFarmId);
      }
    }, 2000); // 2-second delay to give the backend time
  };

  const handleFarmChange = async (farmId: string) => {
    if (!farmId || farmId === selectedFarmId) return;
    setSelectedFarmId(farmId);
    setLoading(true);
    await fetchLogsForFarm(farmId);
    setLoading(false);
  };
  
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const calendarTheme = {
    backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
    calendarBackground: isDarkMode ? '#18181b' : '#ffffff',
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: ACCENT_COLOR,
    selectedDayTextColor: '#ffffff',
    todayTextColor: ACCENT_COLOR,
    dayTextColor: isDarkMode ? '#e4e4e7' : '#2d4150',
    textDisabledColor: isDarkMode ? '#404040' : '#d9e1e8',
    dotColor: ACCENT_COLOR,
    selectedDotColor: '#ffffff',
    arrowColor: ACCENT_COLOR,
    monthTextColor: isDarkMode ? '#fafafa' : '#2d4150',
    indicatorColor: 'blue',
    textDayFontWeight: '300',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 16,
  };

  if ((loading && !selectedFarmId) || !fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
        <Text
          style={{ fontFamily: "Montserrat_400Regular" }}
          className="mt-4 text-base text-gray-500 dark:text-gray-400"
        >
          Loading Activities...
        </Text>
      </View>
    );
  }

  if (error && !farms.length) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-gray-50 dark:bg-black">
        <Ionicons name="cloud-offline-outline" size={48} color="#9ca3af" />
        <Text
          style={{ fontFamily: "Montserrat_700Bold" }}
          className="text-lg font-bold text-center text-gray-700 dark:text-gray-300 mt-4"
        >
          Could not fetch data
        </Text>
        <Text
          style={{ fontFamily: "Montserrat_400Regular" }}
          className="text-base text-center text-gray-500 dark:text-gray-400 mt-2"
        >
          {error}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-emerald-500" edges={['top']}>
      <View className="flex-1 px-4 pt-4 bg-gray-50 dark:bg-zinc-900 rounded-t-3xl">
        <View className="bg-white dark:bg-zinc-900 rounded-3xl shadow-lg border border-gray-100 dark:border-zinc-700 p-2 mb-4">
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                disableTouchEvent: true,
              },
            }}
            key={selectedDate}
            current={selectedDate}
            theme={calendarTheme}
          />
        </View>

        {farms.length > 0 && (
          <View className="mb-4 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700">
            <Picker
              selectedValue={selectedFarmId}
              onValueChange={(itemValue) => handleFarmChange(itemValue)}
              dropdownIconColor={isDarkMode ? '#fafafa' : '#1f2937'}
              style={{ color: isDarkMode ? '#fafafa' : '#1f2937' }}
            >
              {farms.map((farm) => (
                <Picker.Item
                  key={farm.id}
                  label={farm.farmName}
                  value={farm.id}
                />
              ))}
            </Picker>
          </View>
        )}

        <View className="flex-row justify-between items-center mb-4">
          <Text
            style={{ fontFamily: "Montserrat_700Bold" }}
            className="text-xl font-bold text-gray-800 dark:text-white"
          >
            Logs for {selectedDate}
          </Text>
          <TouchableOpacity
            className="bg-emerald-500 rounded-full p-2.5 shadow-md"
            onPress={() => setModalVisible(true)}
            disabled={!selectedFarmId}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {filteredData.length > 0 ? (
            filteredData.map((item) => <ActivityCard key={item.id} {...item} />)
          ) : (
            <View className="flex-1 items-center justify-center mt-16">
              <Ionicons name="leaf-outline" size={48} color="#9ca3af" />
              <Text
                style={{ fontFamily: "Montserrat_500Medium" }}
                className="text-lg font-semibold text-gray-500 dark:text-gray-400 mt-4"
              >
                No Logs Found
              </Text>
              <Text
                style={{ fontFamily: "Montserrat_400Regular" }}
                className="text-base text-gray-400 dark:text-gray-500 mt-1"
              >
                Add a new activity for this date.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <AddLogForm
          farmId={selectedFarmId}
          selectedDate={selectedDate}
          userId={userId}
          onLogAdded={handleLogAdded}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}