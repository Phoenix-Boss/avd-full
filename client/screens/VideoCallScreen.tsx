import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import  ZegoExpressEngine  from "zego-express-engine-reactnative";

type Props = { goToHomeScreen: () => void; callId: string };

export const VideoCallScreen = ({ goToHomeScreen, callId }: Props) => {
  const [engine, setEngine] = useState<any | null>(null);
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    const initializeZegoCloud = async () => {
      try {
        // Initialize ZegoCloud engine
        const zegoEngine = ZegoExpressEngine.create(
          parseInt(process.env.EXPO_PUBLIC_ZEGOCLOUD_APP_ID, 10),
          process.env.EXPO_PUBLIC_ZEGOCLOUD_SERVER_SECRET
        );
        setEngine(zegoEngine);

        // Login to the room
        await zegoEngine.loginRoom("default_room", callId, "");
        setIsInCall(true);

        // Start video/audio publishing
        zegoEngine.startPublishingStream();
      } catch (error) {
        console.error("Error initializing ZegoCloud:", error);
      }
    };

    initializeZegoCloud();

    return () => {
      if (engine && isInCall) {
        // Leave the room when the component unmounts
        engine.logoutRoom("default_room");
      }
    };
  }, [callId]);

  useEffect(() => {
    if (engine) {
      // Configure microphone and camera settings
      engine.muteMicrophone(false); // Enable microphone by default
      engine.openCamera(true); // Enable camera by default
    }
  }, [engine]);

  if (!engine || !isInCall) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Joining call...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Video Call in Progress</Text>
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.hangupButton}
          onPress={() => {
            if (engine) {
              engine.stopPublishingStream();
              engine.logoutRoom("default_room");
              setIsInCall(false);
              goToHomeScreen();
            }
          }}
        >
          <Text style={styles.buttonText}>Hang Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  text: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  hangupButton: {
    backgroundColor: "#FF0000",
    padding: 15,
    borderRadius: 50,
    width: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});