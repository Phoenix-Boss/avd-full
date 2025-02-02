
import {
    StyleSheet,
    View,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  goToAudioCallScreen: () => void;
  goToVideoCallScreen: () => void;
};

export const HomeScreen = ({ goToAudioCallScreen, goToVideoCallScreen }: Props) => {

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={goToVideoCallScreen}>
            <Ionicons name="videocam" size={24} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconMargin} onPress={goToAudioCallScreen}>
            <Ionicons name="call" size={24} color="blue" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://pbs.twimg.com/profile_images/1564203599747600385/f6Lvcpcu_400x400.jpg' }} // Replace with your image URL
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Nathan Doan</Text>
        <Text style={styles.profileDetails}>You're not friends on Facebook</Text>
        <Text style={styles.profileDetails}>Lives in Katsina</Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity>
          <Ionicons name="send" size={24} color="blue" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconMargin: {
    marginLeft: 16,
  },
  profileSection: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'blue',
    marginTop: 8,
  },
  profileDetails: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 16,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 8,
  },
});
