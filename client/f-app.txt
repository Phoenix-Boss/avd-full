import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { VideoCallScreen } from './screens/VideoCallScreen';
import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { AudioCallScreen } from './screens/AudioCallScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY;
const userId = process.env.EXPO_PUBLIC_STREAM_USER_ID;
const apiUrl = process.env.EXPO_PUBLIC_URL;

if (!apiKey || !userId || !apiUrl) {
  console.error('Missing required environment variables: EXPO_PUBLIC_STREAM_API_KEY, EXPO_PUBLIC_STREAM_USER_ID, or EXPO_PUBLIC_URL.');
}

const user = {
  id: userId || '',
  name: 'Nathan Doan',
  image: 'https://robohash.org/John',
  type: 'admin'
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      if (!apiUrl || !userId) {
        console.error('API URL or User ID is not defined.');
        return;
      }

      try {
        const response = await fetch(`${apiUrl}?userID=${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch token: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.token) {
          throw new Error('Token is missing in the response.');
        }
        setAuthToken(data.token);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    fetchToken();
  }, []);

  if (!authToken) {
    return null;
  }

  const client = new StreamVideoClient({ apiKey, user, token: authToken });

  const goToVideoCallScreen = () => setActiveScreen('video-call-screen');
  const goToAudioCallScreen = () => setActiveScreen('audio-call-screen');
  const goToHomeScreen = () => setActiveScreen('home');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StreamVideo client={client}>
        <SafeAreaView style={styles.container}>
          {activeScreen === 'video-call-screen' ? (
            <VideoCallScreen goToHomeScreen={goToHomeScreen} callId={"default_641d6b4e-e0e2-4981-9f00-86283a6cd3bd"} />
          ) : activeScreen === 'audio-call-screen' ? (
            <AudioCallScreen goToHomeScreen={goToHomeScreen} callId={"default_641d6b4e-e0e2-4981-9f00-86283a6cd3e"} />
          ) : (
            <HomeScreen 
              goToVideoCallScreen={goToVideoCallScreen} 
              goToAudioCallScreen={goToAudioCallScreen} 
            />
          )}
        </SafeAreaView>
      </StreamVideo>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Adding a default background color for consistency.
  },
});
