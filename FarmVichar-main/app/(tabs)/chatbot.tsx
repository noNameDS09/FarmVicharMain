import Chat from "@/components/Chat/Chat";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const chatbot = () => {
  return (
    <SafeAreaView className="flex-1 dark:bg-zinc-900" style={{ backgroundColor: '#10B981' }} >
      <Chat />
    </SafeAreaView>
  );
};

export default chatbot;