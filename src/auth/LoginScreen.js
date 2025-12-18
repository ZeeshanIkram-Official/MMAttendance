import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'https://property.mightymediatech.com/api/loginuser',
        { email: email.trim(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('✅ API Response:', JSON.stringify(response.data, null, 2));

      const student = response.data.student || response.data.user;
      const token = response.data.token;

      if (student && token) {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(student));

        navigation.replace('DashboardScreen');
      } else {
        Alert.alert(
          'Login Failed',
          response.data.message || 'User or token not found in response'
        );
      }
    } catch (error) {
      console.log('❌ API Error:', error.message);
      if (error.response) {
        console.log(
          '❌ API Error Response:',
          JSON.stringify(error.response.data, null, 2)
        );
      }
      Alert.alert(
        'Login Error',
        error.response?.data?.message || 'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '80%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#CA6512',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
