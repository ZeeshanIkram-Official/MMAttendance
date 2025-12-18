import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import NetInfo from '@react-native-community/netinfo';
import LottieView from 'lottie-react-native';

const MyProfile = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [isConnected, setisConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Personal');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('YOUR_API_ENDPOINT/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
        } else {
          const localData = await AsyncStorage.getItem('userData');
          if (localData) setUser(JSON.parse(localData));
        }
      } catch (error) {
        const localData = await AsyncStorage.getItem('userData');
        if (localData) setUser(JSON.parse(localData));
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setisConnected(state.isConnected);
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
        <LottieView
        source={require('../jsons/internet.json')}
        autoPlay
        style={{ width: 200, height: 200 }}
        />

        <Text style={{ fontSize: 20, fontWeight: '600', color: '#000' }}>
          No Internet Connection
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? '#121212' : '#f8fafc' },
        ]}
      >
        <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#2563eb'} />
        <Text
          style={[
            styles.loadingText,
            { color: isDark ? '#60a5fa' : '#0a74ff' },
          ]}
        >
          Loading your profile...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? '#121212' : '#f8fafc' },
        ]}
      >
        <Text
          style={[
            styles.noDataText,
            { color: isDark ? '#cbd5e1' : '#6b7280' },
          ]}
        >
          No user data found. Please login again.
        </Text>
        <TouchableOpacity
          style={[
            styles.loginBtn,
            { backgroundColor: isDark ? '#1d4ed8' : '#0a74ff' },
          ]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const personalFields = [
    { library: 'FontAwesome', icon: 'user', label: 'DESIGNATION', value: user?.roles?.[0]?.name || 'N/A' },
    { library: 'FontAwesome5', icon: 'user-check', label: 'ASSIGNED TO', value: user?.assigned_to || 'N/A' },
    { library: 'FontAwesome', icon: 'birthday-cake', label: 'DATE OF BIRTH', value: user?.date_of_birth || 'N/A' },
    { library: 'MaterialIcons', icon: 'email', label: 'EMAIL', value: user?.email || 'N/A' },
    { library: 'MaterialIcons', icon: 'email', label: 'PRIVATE EMAIL', value: user?.private_email || 'N/A' },
    { library: 'FontAwesome', icon: 'phone', label: 'CONTACT', value: user?.contact || 'N/A' },
    { library: 'MaterialIcons', icon: 'wifi-calling-3', label: 'EMERGENCY CONTACT', value: user?.emergency_contact || 'N/A' },
    { library: 'FontAwesome5', icon: 'money-bill-wave', label: 'SALARY', value: user?.salary ?? '0.00' },
    { library: 'FontAwesome6', icon: 'calendar-check', label: 'JOINING DATE', value: user?.joining_date || 'N/A' },
    { library: 'FontAwesome5', icon: 'door-open', label: 'JOB ENDING DATE', value: user?.job_ending_date ? user?.job_ending_date : 'Continue' },
    { library: 'FontAwesome6', icon: 'location-dot', label: 'ADDRESS', value: user?.address || 'N/A' },
  ];

  const BankDetailsFields = [
    { library: 'FontAwesome', icon: 'bank', label: 'Bank Name', value: user?.bank_name || 'N/A' },
    { library: 'FontAwesome6', icon: 'id-badge', label: 'Account Title', value: user?.account_title || 'N/A' },
    { library: 'FontAwesome', icon: 'credit-card-alt', label: 'Account Number', value: user?.account_number || 'N/A' },
    { library: 'FontAwesome6', icon: 'barcode', label: 'IBAN Number', value: user?.iban_number || 'N/A' },
    { library: 'FontAwesome6', icon: 'code-branch', label: 'BRANCH CODE', value: user?.branch_code || 'N/A' },
    { library: 'FontAwesome6', icon: 'barcode', label: 'SWIFT CODE', value: user?.swift_code || 'N/A' },
  ];

  const renderIcon = (library, icon, size = 20, color = isDark ? '#0a74ff' : '#0a74ff') => {
    switch (library) {
      case 'MaterialIcons':
        return <MaterialIcons name={icon} size={size} color={color} />;
      case 'FontAwesome':
        return <FontAwesome name={icon} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={icon} size={size} color={color} />;
      case 'FontAwesome6':
        return <FontAwesome6 name={icon} size={size} color={color} />;
      default:
        return <Feather name={icon} size={size} color={color} />;
    }
  };

  const renderColumn = (fields) => (
    <View style={styles.column}>
      {fields.map((item, index) => (
        <View
          key={index}
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#202327' : '#fff',
              shadowColor: '#000',
              shadowOpacity: isDark ? 0.6 : 0.1,
              shadowOffset: { width: 0, height: isDark ? 4 : 2 },
              shadowRadius: isDark ? 6 : 3,
              elevation: isDark ? 8 : 2,
              borderColor: isDark ? '#202327' : '#e5e7eb',
              borderWidth: isDark ? 0.5 : 0,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isDark ? '#101317' : '#eff6ff' },
            ]}
          >
            {renderIcon(item.library, item.icon)}
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.cardLabel,
                { color: isDark ? '#94a3b8' : '#64748b' },
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.cardValue,
                { color: isDark ? '#f1f5f9' : '#1e293b' },
              ]}
              numberOfLines={3}
            >
              {item.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#101317' : '#fff' },
    ]}>
      <View style={[{ elevation: 4, marginBottom: 10, height: 100, alignItems: 'center', justifyContent: 'center' },
      { backgroundColor: isDark ? '#202327' : '#f8fafc' }]}>
        <Image source={require('../assets/mmtlogo.png')} style={{ width: 250, height: 150 }} />
      </View>
      <TouchableOpacity onPress={() => navigation.goBack()} style={[
        styles.backBtn,
        { backgroundColor: isDark ? '#101317' : '#f8fafc' },
      ]} activeOpacity={0.7}>
        <Feather name="arrow-left" size={24} color={isDark ? '#0a74ff' : '#0a74ff'} />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={[
          styles.container1,
          { backgroundColor: isDark ? '#101317' : '#fff' },
        ]}
        showsVerticalScrollIndicator={false}
      >


        <Text
          style={[
            styles.header,
            { color: isDark ? '#f1f5f9' : '#1e293b' },
          ]}
        >
          Personal Information
        </Text>

        <View
          style={[
            styles.tabContainer,
            { backgroundColor: isDark ? '#202327' : '#e2e8f0' },
          ]}
        >
          {['Personal', 'Bank Details'].map((tab) => (
            <TouchableOpacity
              key={tab} activeOpacity={0.7}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && {
                  backgroundColor: isDark ? '#2563eb' : '#0a74ff',
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isDark ? '#cbd5e1' : '#475569' },
                  activeTab === tab && { color: '#fff' },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Personal' && renderColumn(personalFields)}
        {activeTab === 'Bank Details' && renderColumn(BankDetailsFields)}
      </ScrollView>
    </View>
  );
};

export default MyProfile;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  container1: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  noDataText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    marginTop: 30,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  column: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
});