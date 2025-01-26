// import React, { useEffect, useState } from 'react';
// import { SafeAreaView, StyleSheet } from 'react-native';
// import { HomeScreen } from './screens/HomeScreen';
// import { VideoCallScreen } from './screens/VideoCallScreen';
// import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-native-sdk';
// import { AudioCallScreen } from './screens/AudioCallScreen';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY;
// const userId = process.env.EXPO_PUBLIC_STREAM_USER_ID;
// const apiUrl = process.env.EXPO_PUBLIC_URL;

// if (!apiKey || !userId || !apiUrl) {
//   console.error('Missing required environment variables: EXPO_PUBLIC_STREAM_API_KEY, EXPO_PUBLIC_STREAM_USER_ID, or EXPO_PUBLIC_URL.');
// }

// const user = {
//   id: userId || '',
//   name: 'Nathan Doan',
//   image: 'https://robohash.org/John',
//   type: 'admin'
// };

// export default function App() {
//   const [activeScreen, setActiveScreen] = useState('home');
//   const [authToken, setAuthToken] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchToken = async () => {
//       if (!apiUrl || !userId) {
//         console.error('API URL or User ID is not defined.');
//         return;
//       }

//       try {
//         const response = await fetch(`${apiUrl}?userID=${userId}`);
//         if (!response.ok) {
//           throw new Error(`Failed to fetch token: ${response.statusText}`);
//         }
//         const data = await response.json();
//         if (!data.token) {
//           throw new Error('Token is missing in the response.');
//         }
//         setAuthToken(data.token);
//       } catch (error) {
//         console.error('Error fetching token:', error);
//       }
//     };

//     fetchToken();
//   }, []);

//   if (!authToken) {
//     return null;
//   }

//   const client = new StreamVideoClient({ apiKey, user, token: authToken });

//   const goToVideoCallScreen = () => setActiveScreen('video-call-screen');
//   const goToAudioCallScreen = () => setActiveScreen('audio-call-screen');
//   const goToHomeScreen = () => setActiveScreen('home');

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <StreamVideo client={client}>
//         <SafeAreaView style={styles.container}>
//           {activeScreen === 'video-call-screen' ? (
//             <VideoCallScreen goToHomeScreen={goToHomeScreen} callId={"default_641d6b4e-e0e2-4981-9f00-86283a6cd3bd"} />
//           ) : activeScreen === 'audio-call-screen' ? (
//             <AudioCallScreen goToHomeScreen={goToHomeScreen} callId={"default_641d6b4e-e0e2-4981-9f00-86283a6cd3e"} />
//           ) : (
//             <HomeScreen 
//               goToVideoCallScreen={goToVideoCallScreen} 
//               goToAudioCallScreen={goToAudioCallScreen} 
//             />
//           )}
//         </SafeAreaView>
//       </StreamVideo>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000', // Adding a default background color for consistency.
//   },
// });

import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { VideoCallScreen } from './screens/VideoCallScreen';
import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { AudioCallScreen } from './screens/AudioCallScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY;
const apiUrl = process.env.EXPO_PUBLIC_URL;

if (!apiKey || !apiUrl) {
  console.error('Missing required environment variables: EXPO_PUBLIC_STREAM_API_KEY or EXPO_PUBLIC_URL.');
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndToken = async () => {
      try {
        // Fetch user from Supabase
        const userResponse = await fetch(`${apiUrl}/current-user`);
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user: ${userResponse.statusText}`);
        }
        const userData = await userResponse.json();
        console.log('Fetched user:', userData);

        if (!userData.id) {
          throw new Error('User data is missing an ID.');
        }
        setUser(userData);

        // Fetch token
        const tokenResponse = await fetch(`${apiUrl}/token?userID=${userData.id}`);
        if (!tokenResponse.ok) {
          throw new Error(`Failed to fetch token: ${tokenResponse.statusText}`);
        }
        const tokenData = await tokenResponse.json();
        if (!tokenData.token) {
          throw new Error('Token is missing in the response.');
        }
        setAuthToken(tokenData.token);
      } catch (error) {
        console.error('Error fetching user or token:', error.message);
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
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!authToken || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 50 }}>
          Failed to authenticate. Please check your API or user setup.
        </Text>
      </SafeAreaView>
    );
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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
