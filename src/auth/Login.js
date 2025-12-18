import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  Animated,
  useColorScheme,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

const Login = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const emailLabelAnim = useRef(new Animated.Value(email ? 1 : 0)).current;
  const passwordLabelAnim = useRef(new Animated.Value(password ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(emailLabelAnim, {
      toValue: emailFocused || email ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [emailFocused, email]);

  useEffect(() => {
    Animated.timing(passwordLabelAnim, {
      toValue: passwordFocused || password ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [passwordFocused, password]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'https://stagging.mightymediatech.com/api/login',
        { email: email.trim(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const student = response.data.student || response.data.user;
      const token = response.data.token;

      if (student && token) {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(student));
        navigation.replace('HomeScreen');
      } else {
        Alert.alert('Login Failed', response.data.message || 'User or token not found');
      }
    } catch (error) {
      Alert.alert('Login Error', error.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsConnected(state.isConnected);
  });

  return () => unsubscribe();
}, []);


  if (!isConnected) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#000' }}>
          No Internet Connection
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#101317' : '#fff' },
      ]}
    >
      <Image source={require('../assets/mmtlogo.png')} style={styles.logo} />

      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
        Welcome Back 👋
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? '#fff' : '#000' }]}>
        to <Text style={styles.attendee}>HR Attendee</Text>
      </Text>
      <Text style={[styles.helper, { color: isDark ? '#bbb' : '#888' }]}>
        Hello there, login to continue
      </Text>

      <View
        style={[
          styles.input,
          {
            borderColor: isDark ? '#60a5fa' : '#0087ff',
            backgroundColor: isDark ? '#101317' : '#fff',
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            {
              transform: [
                {
                  translateY: emailLabelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, -10],
                  }),
                },
                {
                  scale: emailLabelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.8],
                  }),
                },
              ],
              color: emailFocused || email ? '#0087ff' : isDark ? '#aaa' : '#888',
              backgroundColor: isDark ? '#101317' : '#fff',
              paddingHorizontal: 2,
            },
          ]}
        >
          Email Address
        </Animated.Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder=""
          placeholderTextColor={isDark ? '#777' : '#aaa'}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.textField, { color: isDark ? '#fff' : '#000' }]}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
      </View>

      <View
        style={[
          styles.input,
          {
            borderColor: isDark ? '#60a5fa' : '#0087ff',
            backgroundColor: isDark ? '#101317' : '#fff',
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            {
              transform: [
                {
                  translateY: passwordLabelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, -10],
                  }),
                },
                {
                  scale: passwordLabelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.8],
                  }),
                },
              ],
              color: passwordFocused || password ? '#0087ff' : isDark ? '#aaa' : '#888',
              backgroundColor: isDark ? '#101317' : '#fff',
              paddingHorizontal: 2,
            },
          ]}
        >
          Password
        </Animated.Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.passwordInput, { color: isDark ? '#fff' : '#000' }]}
            placeholder=""
            placeholderTextColor={isDark ? '#777' : '#aaa'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            // maxLength={8}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            style={styles.eyeIcon}
          >
            <Icon
              name={secureText ? 'eye-off' : 'eye'}
              size={22}
              color={isDark ? '#aaa' : '#999'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.forgetContainer}
        onPress={() => navigation.navigate('ForgetPasswordScreen')}
      >
        <Text style={[styles.forgetText, { color: '#0087ff' }]}>Forgot Password ?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.loginButton,
          { backgroundColor: isDark ? '#1e90ff' : '#0087ff' },
        ]}
        onPress={handleLogin}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.separatorContainer}>
        <View
          style={[
            styles.line,
            { backgroundColor: isDark ? '#333' : '#E1E1E1' },
          ]}
        />
        <Text style={[styles.orText, { color: isDark ? '#aaa' : '#888' }]}>
          Or continue with social account
        </Text>
        <View
          style={[
            styles.line,
            { backgroundColor: isDark ? '#333' : '#E1E1E1' },
          ]}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.socialButton,
          {
            backgroundColor: isDark ? '#202327' : '#fff',
            borderColor: isDark ? '#202327' : '#E1E1E1',
          },
        ]}
      >
        <Image
          source={require('../assets/google.png')}
          style={styles.socialIcon}
        />
        <Text
          style={[styles.socialText, { color: isDark ? '#ddd' : '#333' }]}
        >
          Google
        </Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={[styles.noAccount, { color: isDark ? '#aaa' : '#888' }]}>
          Didn’t have an account?
        </Text>
        <TouchableOpacity>
          <Text style={styles.registerLink}> Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logo: {
    height: 130,
    width: 250,
    right: 30,
  },
  title: {
    fontSize: 31,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  subtitle: {
    fontSize: 31,
    fontWeight: '600',
    marginBottom: 5,
    marginLeft: 20,
  },
  attendee: {
    color: '#0087ff',
    fontWeight: 'bold',
  },
  helper: {
    marginBottom: 30,
    marginLeft: 20,
  },
  input: {
    width: '95%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    alignSelf: 'center',
    paddingVertical: 10,
    minHeight: 50,
  },
  label: {
    fontSize: 14,
    position: 'absolute',
    left: 12,
  },
  textField: {
    fontSize: 15,
    height: 40,
    paddingTop: 10,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    height: 40,
    paddingTop: 10,
  },
  eyeIcon: {
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  forgetContainer: {
    width: '90%',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgetText: {
    fontWeight: '500',
  },
  loginButton: {
    height: 50,
    width: '90%',
    borderRadius: 8,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '90%',
    alignSelf: 'center',
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 13,
  },
  socialButton: {
    height: 50,
    width: '90%',
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  socialIcon: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    marginRight: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignSelf: 'center',
  },
  noAccount: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0087ff',
  },
});

export default Login;

