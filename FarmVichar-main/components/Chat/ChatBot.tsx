import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  useColorScheme,
  Alert,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import {
  GiftedChat,
  IMessage,
  InputToolbar,
  Composer,
  Send,
  Bubble,
} from "react-native-gifted-chat";
import { MarkdownView } from "react-native-markdown-view";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

const ChatbotScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [activeSound, setActiveSound] = useState<Audio.Sound | null>(null);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const getStyles = (isDark: boolean) =>
    StyleSheet.create({
      container: { flex: 1 },
      inputContainer: {
        backgroundColor: isDark ? "#333" : "transparent",
        borderTopWidth: 1,
        borderTopColor: isDark ? "#555" : "lightgreen",
        paddingVertical: 6,
        paddingHorizontal: 4,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
      },
      textInput: {
        flex: 1,
        backgroundColor: isDark ? "#555" : "#fff",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        lineHeight: 20,
        color: isDark ? "#fff" : "#000",
        marginRight: 10,
        textAlignVertical: "center",
      },
      sendIcon: { marginRight: 5 },
      actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
      },
      iconButton: { padding: 6 },
      audioBubble: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        maxWidth: "80%",
      },
      audioBubbleRight: {
        backgroundColor: isDark ? "#1e40af" : "#0078fe",
        alignSelf: "flex-end",
      },
      audioBubbleLeft: {
        backgroundColor: isDark ? "#374151" : "#e0e0e0",
        alignSelf: "flex-start",
      },
      audioButton: { marginRight: 10 },
      audioText: { fontSize: 16 },
      previewBox: {
        flexDirection: "row",
        alignItems: "center",
        padding: 6,
        backgroundColor: isDark ? "#333" : "#fff",
        borderTopWidth: 1,
        borderColor: isDark ? "#555" : "#ddd",
      },
      previewImage: { width: 50, height: 50, borderRadius: 6 },
      removeImage: { marginLeft: 10 },
    });

  const styles = getStyles(isDark);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello, how can I help you today?",
        createdAt: new Date(),
        user: { _id: 2, name: "Chatbot" },
      },
    ]);
    return () => {
      if (activeSound) {
        activeSound.unloadAsync();
      }
    };
  }, [activeSound]);

  const handleSend = async (newMessages: IMessage[] = []) => {
    setIsBotTyping(true);

    const message = newMessages[0];
    let userMessage: IMessage = {
      ...message,
      createdAt: new Date(),
      user: { _id: 1 },
      _id: Math.random().toString(),
    };

    const formData = new FormData();
    formData.append("text_query", message.text || "This is the audio for query");

    if (pendingImage) {
      userMessage = { ...userMessage, image: pendingImage };
      const imageUriParts = pendingImage.split(".");
      const fileType = imageUriParts[imageUriParts.length - 1];
      const fileName = `image_${Date.now()}.${fileType}`;
      formData.append("image_file", {
        uri: pendingImage,
        name: fileName,
        type: `image/${fileType}`,
      } as any);
    }

    if (message.audio) {
      const audioUriParts = message.audio.split(".");
      const audioFileType = audioUriParts[audioUriParts.length - 1];
      const audioFileName = `audio_${Date.now()}.${audioFileType}`;
      formData.append("audio_file", {
        uri: message.audio,
        name: audioFileName,
        type: `audio/${audioFileType}`,
      } as any);
    }

    setMessages((previous) => GiftedChat.append(previous, [userMessage]));
    setPendingImage(null);

    try {
      const response = await fetch(
        "https://farmvichar-ml.onrender.com/chat/h8BfY08KoqFKxNOoQc9o",
        {
          method: "POST",
          headers: {},
          body: formData,
        }
      );

      const data = await response.json();
      const { response_text, transcribed_text } = data;

      if (transcribed_text) {
        // ✅ keep audio field intact instead of deleting it
        const updatedUserMessage = {
          ...userMessage,
          text: transcribed_text,
          audio: userMessage.audio,
        };
        setMessages((previous) =>
          previous.map((msg) =>
            msg._id === userMessage._id ? updatedUserMessage : msg
          )
        );
      }

      const botMessage: IMessage = {
        _id: Math.random().toString(),
        text: response_text,
        createdAt: new Date(),
        user: { _id: 2, name: "Chatbot" },
      };
      setMessages((previous) => GiftedChat.append(previous, [botMessage]));
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Sorry, there was an error processing your message.");
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setPendingImage(result.assets[0].uri);
    }
  };

  const handleVoiceInput = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        if (uri) {
          const newUri =
            FileSystem.documentDirectory + `audio_${Date.now()}.m4a`;
          await FileSystem.moveAsync({ from: uri, to: newUri });
          const audioMessage: IMessage = {
            _id: Math.random().toString(),
            text: "",
            createdAt: new Date(),
            user: { _id: 1 },
            audio: newUri,
          };
          handleSend([audioMessage]);
        }
      } catch (error) {
        console.error("Failed to stop recording or move file", error);
        Alert.alert("Error", "Failed to process audio recording.");
      }
    } else {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access microphone is required!");
        return;
      }
      try {
        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        await newRecording.startAsync();
        setRecording(newRecording);
      } catch (err) {
        console.error("Failed to start recording", err);
      }
    }
  };

  const onPlayPauseAudio = async (audioUri: string, messageId: string) => {
    if (activeSoundId === messageId) {
      const status = await activeSound?.getStatusAsync();
      if (status && "isPlaying" in status && status.isPlaying) {
        await activeSound?.pauseAsync();
      } else {
        await activeSound?.playAsync();
      }
      return;
    }

    if (activeSound) {
      await activeSound.stopAsync();
      await activeSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true }
    );
    setActiveSound(sound);
    setActiveSoundId(messageId);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
        setActiveSound(null);
        setActiveSoundId(null);
        sound.unloadAsync();
      }
    });
  };

  const renderMessageText = (props: any) => {
    const { currentMessage } = props;
    if (currentMessage.user._id === 2 && currentMessage.text) {
      return (
        <View style={{ paddingHorizontal: 8 }}>
          <MarkdownView
            style={{
              body: { color: isDark ? "#000" : "#000", fontSize: 10, lineHeight: 10 },
              strong: { fontWeight: "bold" },
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
            {currentMessage.text}
          </MarkdownView>
        </View>
      );
    }
    return (
      <Text
        style={{
          color:
            props.currentMessage.user._id === 1
              ? "#fff"
              : isDark
              ? "#000"
              : "#000",
          fontSize: 16,
          padding: 10,
          lineHeight: 18,
        }}
      >
        {currentMessage.text}
      </Text>
    );
  };

  const renderBubble = (props: any) => {
    const { currentMessage } = props;
    const isPlaying = activeSoundId === currentMessage._id;

    if (currentMessage.audio) {
      return (
        <View
          style={[
            styles.audioBubble,
            currentMessage.user._id === 1
              ? styles.audioBubbleRight
              : styles.audioBubbleLeft,
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              onPlayPauseAudio(currentMessage.audio, currentMessage._id)
            }
            style={styles.audioButton}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color={
                currentMessage.user._id === 1
                  ? "#fff"
                  : isDark
                  ? "#fff"
                  : "#000"
              }
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.audioText,
              currentMessage.user._id === 1
                ? { color: "#fff" }
                : { color: isDark ? "#fff" : "#000" },
            ]}
          >
            Voice Message
          </Text>
        </View>
      );
    }
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: { backgroundColor: isDark ? "#374151" : "#e0e0e0" },
          right: { backgroundColor: isDark ? "#1e40af" : "#0da60d" },
        }}
        textStyle={{
          left: { color: isDark ? "#fff" : "#000" },
          right: { color: "#fff" },
        }}
        renderMessageText={renderMessageText}
      />
    );
  };

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity onPress={handleVoiceInput} style={styles.iconButton}>
        <Ionicons
          name={recording ? "stop-circle" : "mic"}
          size={26}
          color={recording ? "red" : isDark ? "#ccc" : "#808080"}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleImagePicker} style={styles.iconButton}>
        <Ionicons name="image" size={24} color={isDark ? "#ccc" : "#808080"} />
      </TouchableOpacity>
    </View>
  );

  const renderInputToolbar = (props: any) => (
    <View>
      {pendingImage && (
        <View style={styles.previewBox}>
          <Image
            source={{ uri: pendingImage }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeImage}
            onPress={() => setPendingImage(null)}
          >
            <Ionicons name="close-circle" size={22} color="red" />
          </TouchableOpacity>
        </View>
      )}
      <InputToolbar
        {...props}
        containerStyle={styles.inputContainer}
        renderActions={renderActions}
        renderComposer={(composerProps) => (
          <Composer
            {...composerProps}
            placeholder="Type a message..."
            textInputStyle={styles.textInput}
          />
        )}
      />
    </View>
  );

  const renderSend = (props: any) => (
    <Send
      {...props}
      containerStyle={{ justifyContent: "center", alignItems: "center" }}
    >
      <Ionicons
        name="send"
        size={24}
        color={"#67c767"}
        style={styles.sendIcon}
      />
    </Send>
  );

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{ _id: 1 }}
        bottomOffset={-45}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderAvatar={() => null}
        renderBubble={renderBubble}
        isTyping={isBotTyping}
        renderMessageText={renderMessageText}
      />
    </View>
  );
};

export default ChatbotScreen;