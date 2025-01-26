import React, {useEffect} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
    Call, 
    StreamCall,
    useStreamVideoClient,
    CallingState,
    CallContent,
} from '@stream-io/video-react-native-sdk';

type Props = { goToHomeScreen: () => void; callId: string; };

export const VideoCallScreen = ({ goToHomeScreen, callId }: Props) => {
    const [call, setCall] = React.useState<Call | null>(null);
    const client = useStreamVideoClient();

  useEffect(() => {
    const _call = client?.call('default', callId);
    _call?.join({ 
        create: true})
      .then(() => setCall(_call));
  }, [client, callId]);

  useEffect(() => {
    return () => {
      if (call?.state.callingState !== CallingState.LEFT) {
        call?.leave();
      }
    };
  }, [call]);


    if (!call) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Joining call...</Text>
        </View>
      );
    }
  return (
    <StreamCall call={call}>
      <View style={styles.container}>
        <CallContent onHangupCallHandler={goToHomeScreen}/>
      </View>
    </StreamCall>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  text: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});