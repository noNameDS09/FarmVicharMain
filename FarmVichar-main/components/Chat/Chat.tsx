import { message } from "@/data/data";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_700Bold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { MarkdownView } from "react-native-markdown-view";
type Message = {
  id: string;
  text?: string;
  imageUri?: string;
  audioUri?: string;
  createdAt: Date;
  userId: number;
  language?: string;
};

const Chat = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("ml");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Initial welcome message from bot
    const welcomeMessage: Message = {
      id: "bot-1",
      text: "Hello! I'm your farming assistant. How can I help you today?",
      createdAt: new Date(),
      userId: 2,
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    return () => {
      if (playingSound) {
        playingSound.unloadAsync();
      }
    };
  }, [playingSound]);

  const pickImage = async () => {
    Alert.alert(
      "Select Image",
      "Choose an option to add an image.",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const { status } =
              await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert(
                "Permission required",
                "Permission to access camera is required!"
              );
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              quality: 1,
            });
            if (!result.canceled && result.assets.length > 0) {
              setPendingImage(result.assets[0].uri);
            }
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert(
                "Permission required",
                "Permission to access media library is required!"
              );
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 1,
            });
            if (!result.canceled && result.assets.length > 0) {
              setPendingImage(result.assets[0].uri);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Permission to access microphone is required!"
        );
        return;
      }
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);
    } catch (error) {
      Alert.alert("Error", "Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) {
        Alert.alert(
          "Confirm Send",
          "Do you want to send this voice message?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Voice message cancelled."),
              style: "cancel",
            },
            {
              text: "Send",
              onPress: () =>
                sendMessage({ audioUri: uri, language: selectedLanguage }),
            },
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to stop recording.");
    }
  };

  const sendMessage = async (messageData: Partial<Message> = {}) => {
    if (isSending) return;
    if (!inputText.trim() && !pendingImage && !messageData.audioUri) {
      Alert.alert(
        "Empty message",
        "Please enter a message or select media to send."
      );
      return;
    }

    setShowSuggestions(false);
    setIsSending(true);

    const newMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText.trim() || undefined,
      imageUri: pendingImage || undefined,
      audioUri: messageData.audioUri,
      createdAt: new Date(),
      userId: 1,
      language: messageData.language || selectedLanguage,
    };

    setMessages((prev) => [newMessage, ...prev]);
    setInputText("");
    setPendingImage(null);

    // Bypass API for voice and provide a fake response
    if (newMessage.audioUri) {
      const fakeBotResponse = message;

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: fakeBotResponse,
        createdAt: new Date(),
        userId: 2,
      };

      // Simulate bot "thinking"
      setIsSending(true);

      setTimeout(() => {
        setMessages((prev) => [botMessage, ...prev]);
        setIsSending(false);
      }, 3500); // Simulate a 3.5-second network delay
      return;
    }
    const formData = new FormData();
    formData.append("text_query", newMessage.text || "Audio message or Image");
    formData.append("language_code", newMessage.language || "ml");

    if (newMessage.imageUri) {
      const uriParts = newMessage.imageUri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("image_file", {
        uri: newMessage.imageUri,
        name: `image_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    if (newMessage.audioUri) {
      const uriParts = newMessage.audioUri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const mimeType = `audio/${fileType}`;

      // Append audio file as binary
      formData.append("audio_file", {
        uri: newMessage.audioUri,
        name: `audio_${Date.now()}.${fileType}`,
        type: mimeType,
      } as any);
    }

    try {
      const userId = process.env.EXPO_PUBLIC_USER_ID;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_ML_BACKEND}/chat/${userId}`,
        {
          method: "POST",
          body: formData,
          headers: {
            // 'Content-Type': 'multipart/form-data', // Let fetch handle this automatically
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      // console.log(data);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: data.response_text,
        createdAt: new Date(),
        userId: 2,
      };
      setMessages((prev) => [botMessage, ...prev]);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.log("Failed to send message:", error);
      Alert.alert(
        "Error",
        `Failed to send message: ${(error as Error).message}`
      );
    } finally {
      setIsSending(false);
    }
  };

  const onPlayPauseAudio = async (message: Message) => {
    if (playingMessageId === message.id) {
      const status = await playingSound?.getStatusAsync();
      if (
        status &&
        "isLoaded" in status &&
        status.isLoaded &&
        status.isPlaying
      ) {
        await playingSound?.pauseAsync();
      } else {
        await playingSound?.playAsync();
      }
      return;
    }

    if (playingSound) {
      await playingSound.stopAsync();
      await playingSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: message.audioUri! },
      { shouldPlay: true }
    );
    setPlayingSound(sound);
    setPlayingMessageId(message.id);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
        setPlayingSound(null);
        setPlayingMessageId(null);
        sound.unloadAsync();
      }
    });
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.userId === 1;
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        {item.text ? (
          isUser ? (
            <Text style={[styles.messageText, styles.textRight]}>
              {item.text}
            </Text>
          ) : (
            <View style={{ paddingHorizontal: 8 }}>
              <MarkdownView
                styles={{
                  body: {
                    color: isDark ? "#f4f4f5" : "#000",
                    fontSize: 16,
                    lineHeight: 22,
                    fontFamily: "Montserrat_400Regular",
                  },
                  strong: { fontFamily: "Montserrat_700Bold" },
                  em: { fontStyle: "italic" },
                  list_item: {
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginBottom: 6,
                  },
                  bullet_list: { marginLeft: 10 },
                  paragraph: { marginBottom: 10 },
                }}
              >
                {item.text}
              </MarkdownView>
            </View>
          )
        ) : null}
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
        ) : null}
        {item.audioUri ? (
          <TouchableOpacity
            style={[
              styles.audioButton,
              isUser ? styles.audioButtonRight : styles.audioButtonLeft,
            ]}
            onPress={() => onPlayPauseAudio(item)}
          >
            <Ionicons
              name={playingMessageId === item.id ? "pause" : "play"}
              size={24}
              color={isUser ? "#fff" : "#000"}
            />
            <Text
              style={[
                styles.audioText,
                isUser ? styles.textRight : styles.textLeft,
              ]}
            >
              Voice Message
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const styles = getStyles(isDark);

  const quickReplies = [
    "Weather forecast",
    "Latest crop prices",
    "Identify this pest",
  ];

  const onQuickReply = (reply: string) => {
    setInputText(reply);
    sendMessage({ text: reply });
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Ionicons name="leaf" size={24} color="#10B981" />
          </View>
          <View>
            <Text style={styles.headerTitle}>FarmVichar Assistant</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
      </View>

      <LinearGradient
        colors={["#e0e0e0", "#fff"]} // Replace with your desired gradient colors
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          inverted
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingVertical: 10, flexGrow: 1 }}
          style={{ flex: 1, backgroundColor: "transparent" }} // important: let gradient show through
        />
      </LinearGradient>
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {quickReplies.map((reply, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => onQuickReply(reply)}
            >
              <Text style={styles.suggestionText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {pendingImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: pendingImage }} style={styles.previewImage} />
          <TouchableOpacity
            onPress={() => setPendingImage(null)}
            style={styles.removeImageButton}
          >
            <Ionicons name="close-circle" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={styles.iconButton}
        >
          <Ionicons
            name={recording ? "stop-circle" : "mic"}
            size={28}
            color={recording ? "red" : "#555"}
          />
        </TouchableOpacity>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={
              selectedLanguage === "ml"
                ? "സന്ദേശം ടൈപ്പ് ചെയ്യൂ..."
                : "Type a message..."
            }
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedLanguage(selectedLanguage === "ml" ? "en" : "ml");
          }}
          style={styles.languageButton}
        >
          <Text style={styles.languageText}>
            {selectedLanguage.toUpperCase()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => sendMessage({ language: selectedLanguage })}
          style={styles.sendButton}
        >
          {isSending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <Ionicons name="image" size={28} color="#555" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? "#18181b" : "#F9F9F7", // offWhite
      flex: 1,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: "hidden", // This is key to ensure children conform to the radius
    },
    header: {
      backgroundColor: isDark ? "#27272a" : "#6EE7B7",
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#3f3f46" : "#e5e7eb",
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "#064e3b" : "#E0F2F1",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: "Montserrat_700Bold",
      color: isDark ? "#fafafa" : "#111827",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#10B981",
      marginRight: 6,
    },
    statusText: {
      fontSize: 12,
      color: isDark ? "#a1a1aa" : "#6B7280",
      fontFamily: "Montserrat_400Regular",
    },
    messageContainer: {
      marginVertical: 6,
      marginHorizontal: 12,
      maxWidth: "75%",
      borderRadius: 18,
      padding: 10,
    },
    messageLeft: {
      backgroundColor: isDark ? "#3f3f46" : "#FFFFFF",
      alignSelf: "flex-start",
      borderWidth: isDark ? 0 : 1,
      borderColor: "#E5E7EB",
    },
    messageText: {
      fontSize: 16,
      marginBottom: 6,
      fontFamily: "Montserrat_400Regular",
    },
    textLeft: {
      color: isDark ? "#f4f4f5" : "#000",
    },
    textRight: {
      color: "#fff",
    },
    messageRight: {
      backgroundColor: "#10B981",
      alignSelf: "flex-end",
    },
    messageImage: {
      width: 150,
      height: 150,
      borderRadius: 12,
      marginTop: 4,
    },
    audioButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 4,
      paddingVertical: 8,
      borderRadius: 20,
    },
    audioButtonLeft: {
      backgroundColor: isDark ? "#52525b" : "#F3F4F6",
    },
    audioButtonRight: {
      backgroundColor: "#059669",
    },
    audioText: {
      fontSize: 16,
      marginLeft: 8,
      fontFamily: "Montserrat_400Regular",
    },
    inputContainer: {
      flexDirection: "row",
      paddingHorizontal: 8,
      paddingVertical: 8,
      alignItems: "center",
      backgroundColor: isDark ? "#27272a" : "#fff",
      borderTopWidth: 1,
      borderColor: isDark ? "#3f3f46" : "#e5e7eb",
    },
    textInputContainer: {
      flex: 1,
      backgroundColor: isDark ? "#3f3f46" : "#f3f4f6",
      borderRadius: 24,
      marginHorizontal: 8,
    },
    textInput: {
      fontSize: 16,
      maxHeight: 100,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === "ios" ? 14 : 10,
      fontFamily: "Montserrat_400Regular",
      color: isDark ? "#f4f4f5" : "#111827",
    },
    sendButton: {
      backgroundColor: "#10B981",
      borderRadius: 22,
      padding: 8,
      marginLeft: 0,
    },
    iconButton: {
      padding: 6,
    },
    previewContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: isDark ? "#27272a" : "#fff",
      borderTopWidth: 1,
      borderColor: isDark ? "#3f3f46" : "#ddd",
    },
    previewImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
    },
    removeImageButton: {
      marginLeft: 12,
    },
    languageButton: {
      backgroundColor: "#10B981",
      borderRadius: 22,
      padding: 10,
      marginRight: 4,
    },
    languageText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
      fontFamily: "Montserrat_700Bold",
    },
    suggestionsContainer: {
      flexDirection: "row",
      backgroundColor: "#fff",
      flexWrap: "wrap",
      paddingHorizontal: 12,
      paddingBottom: 8,
      justifyContent: "flex-start",
    },
    suggestionChip: {
      backgroundColor: isDark ? "#27272a" : "#fff",
      borderColor: isDark ? "#059669" : "#D1FAE5",
      borderWidth: 1,
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 12,
      margin: 4,
    },
    suggestionText: {
      color: isDark ? "#6ee7b7" : "#065F46",
      fontSize: 14,
      fontFamily: "Montserrat_500Medium",
    },
  });

export default Chat;
