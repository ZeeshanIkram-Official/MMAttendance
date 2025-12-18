import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  useColorScheme,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

const OtpScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};
  const inputs = useRef([]);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text, index) => {
    if (text.length > 1) text = text.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text !== '' && index < 3) inputs.current[index + 1].focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter all 4 digits of the OTP.');
      return;
    }
    navigation.replace('ResetPasswordScreen');
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#101317' : '#fff' },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            { backgroundColor: isDark ? '#202327' : '#fff' },
          ]}
        >
          <Icon name="arrow-left" size={24} color="#0a74ff" />
        </TouchableOpacity>

        <Text style={[styles.title, { color: isDark ? '#fff' : '#222' }]}>
          Enter Verification Code
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#aaa' : '#666' }]}>
          We sent a reset link to {email || 'your email'}. Enter the 4 digit
          code mentioned in the email.
        </Text>

        <Image source={require('../assets/2.png')} style={styles.img} />

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={[
                styles.otpInput,
                {
                  borderColor: digit
                    ? '#0087ff'
                    : isDark
                    ? '#333'
                    : '#ccc',
                  backgroundColor: digit
                    ? isDark
                      ? '#1e1e1e'
                      : '#fff'
                    : isDark
                    ? '#202327'
                    : '#f2f2f2',
                  color: isDark ? '#fff' : '#333',
                },
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        <View style={styles.timerRow}>
          {timer > 0 ? (
            <Text style={[styles.timerNumber, { color: isDark ? '#fff' : '#000' }]}>
              00:{timer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(59)}>
              <Text style={styles.resendText}>Resend it</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyBtn,
            { backgroundColor: isDark ? '#0087ff' : '#0087ff' },
            !isOtpComplete && styles.verifyBtnDisabled,
          ]}
          onPress={handleVerify}
          disabled={!isOtpComplete}
        >
          <Text style={styles.verifyText}>Verify Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OtpScreen;

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 80,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 30,
  },
  otpInput: {
    width: 55,
    height: 55,
    borderWidth: 1.5,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
  },
  img: {
    height: 300,
    width: 270,
    alignSelf: 'center',
    marginBottom: 10,
  },
  timerRow: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  timerNumber: {
    fontWeight: '600',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0087ff',
  },
  verifyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 12,
    marginBottom: 20,
  },
  verifyBtnDisabled: {
    opacity: 0.6,
  },
  verifyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
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
