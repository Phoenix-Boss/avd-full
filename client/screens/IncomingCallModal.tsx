import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const IncomingCallModal = ({ callId, acceptCall, rejectCall }) => (
  <View style={styles.container}>
    <Text style={styles.text}>You have an incoming call!</Text>
    <TouchableOpacity style={styles.button} onPress={() => acceptCall(callId)}>
      <Text>Accept</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={rejectCall}>
      <Text>Reject</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
});

export default IncomingCallModal;
