import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, ActivityIndicator } from "react-native";
import { VideoCallScreen } from "./screens/VideoCallScreen";
import { AudioCallScreen } from "./screens/AudioCallScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import  ZegoExpressEngine  from "zego-express-engine-reactnative";

const ZEGOCLOUD_APP_ID = parseInt(process.env.EXPO_PUBLIC_ZEGOCLOUD_APP_ID, 10);
const ZEGOCLOUD_SERVER_SECRET = process.env.EXPO_PUBLIC_ZEGOCLOUD_SERVER_SECRET;
const API_URL = process.env.EXPO_PUBLIC_URL;

if (!ZEGOCLOUD_APP_ID || !ZEGOCLOUD_SERVER_SECRET || !API_URL) {
  console.error(
    "Missing required environment variables: EXPO_PUBLIC_ZEGOCLOUD_APP_ID, EXPO_PUBLIC_ZEGOCLOUD_SERVER_SECRET, or EXPO_PUBLIC_URL."
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState("home");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndToken = async () => {
      try {
        // Fetch user from Supabase
        const userResponse = await fetch(`${API_URL}/current-user`);
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user: ${userResponse.statusText}`);
        }
        const userData = await userResponse.json();
        console.log("Fetched user:", userData);
        if (!userData.id) {
          throw new Error("User data is missing an ID.");
        }
        setUser(userData);

        // Fetch token
        const tokenResponse = await fetch(`${API_URL}/token?userID=${userData.id}`);
        if (!tokenResponse.ok) {
          throw new Error(`Failed to fetch token: ${tokenResponse.statusText}`);
        }
        const tokenData = await tokenResponse.json();
        if (!tokenData.token) {
          throw new Error("Token is missing in the response.");
        }
        setAuthToken(tokenData.token);
      } catch (error) {
        console.error("Error fetching user or token:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndToken();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!authToken || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text
          style={{
            color: "red",
            textAlign: "center",
            marginTop: 50,
          }}
        >
          Failed to authenticate. Please check your API or user setup.
        </Text>
      </SafeAreaView>
    );
  }

  const zegoEngine = ZegoExpressEngine.create(ZEGOCLOUD_APP_ID, ZEGOCLOUD_SERVER_SECRET);

  const goToVideoCallScreen = () => setActiveScreen("video-call-screen");
  const goToAudioCallScreen = () => setActiveScreen("audio-call-screen");
  const goToHomeScreen = () => setActiveScreen("home");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {activeScreen === "video-call-screen" ? (
          <VideoCallScreen
            goToHomeScreen={goToHomeScreen}
            callId={"default_641d6b4e-e0e2-4981-9f00-86283a6cd3bd"}
            zegoEngine={zegoEngine}
            user={user}
            authToken={authToken}
          />
        ) : activeScreen === "audio-call-screen" ? (
          <AudioCallScreen
            goToHomeScreen={goToHomeScreen}
            callId={"default_641d6b4e-e0e2-4981-9f00-86283a6cd3e"}
            zegoEngine={zegoEngine}
            user={user}
            authToken={authToken}
          />
        ) : (
          <HomeScreen
            goToVideoCallScreen={goToVideoCallScreen}
            goToAudioCallScreen={goToAudioCallScreen}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});