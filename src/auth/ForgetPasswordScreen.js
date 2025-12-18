import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const ForgetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const handlePasswordReset = () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email address');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigation.replace('OtpScreen', { email });
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.container,
        { backgroundColor: isDark ? '#101317' : '#fff' },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            { backgroundColor: isDark ? '#202327' : '#fff' },
          ]}>
          <Icon name="arrow-left" size={24} color={isDark ? '#0a74ff' : '#0a74ff'} />
        </TouchableOpacity>

        <Text
          style={[
            styles.title,
            { color: isDark ? '#fff' : '#222' },
          ]}>
          Forgot Password 🤔
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDark ? '#ccc' : '#666' },
          ]}>
          Please enter your email to reset the password
        </Text>

        <Image source={require('../assets/1.png')} style={styles.img} />

        <Text
          style={[
            styles.label,
            { color: isDark ? '#ddd' : '#000' },
          ]}>
          Your Email
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#202327' : '#fff',
              borderColor: isDark ? '#202327' : '#ddd',
              color: isDark ? '#fff' : '#333',
            },
          ]}
          placeholder="Enter your email"
          placeholderTextColor={isDark ? '#777' : '#999'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isDark ? '#3399ff' : '#0087ff',
              opacity: !email.includes('gmail.com') ? 0.6 : 1,
            },
          ]}
          onPress={handlePasswordReset}
          activeOpacity={0.8}
          disabled={!email.includes('gmail.com')}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 100,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 30,
    lineHeight: 22,
  },
  img: {
    marginTop: 10,
    height: 300,
    width: 270,
    alignSelf: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 20,
    marginTop: 5,
  },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  backBtn: {
    position: 'absolute',
    top: 15,
    left: 5,
    zIndex: 10,
    padding: 8,
    borderRadius: 30,
    elevation: 4,
  },
});
