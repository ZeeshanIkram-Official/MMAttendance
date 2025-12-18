import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import LottieView from 'lottie-react-native';

const LeaveDone = ({ navigation }) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? '#121212' : '#fff' },
        ]}>
        <LottieView
          source={require('../jsons/ok.json')}
          autoPlay
          style={styles.lottie}
        />

        <Text
          style={[
            styles.title,
            { color: isDark ? '#fff' : '#222' },
          ]}>
          Leave Applied {'\n'} Successfully
        </Text>

        <Text
          style={[
            styles.message,
            { color: isDark ? '#ccc' : '#333' },
          ]}>
          Your Leave has been{'\n'} applied successfully
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isDark ? '#1d74ff' : '#0087ff' },
          ]}
          onPress={() => navigation.replace('HomeScreen')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LeaveDone;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    height: 50,
    width: '60%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
});
