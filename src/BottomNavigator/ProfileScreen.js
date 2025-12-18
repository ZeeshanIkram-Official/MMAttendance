import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import ImageViewing from 'react-native-image-view';
import NetInfo from '@react-native-community/netinfo';
import LottieView from 'lottie-react-native';

const AppIcon = ({ type = 'Ionicons', name, size = 20, color = '#2563eb' }) => {
  const icons = { Ionicons, FontAwesome, MaterialIcons };
  const IconSet = icons[type] || Ionicons;
  return <IconSet name={name} size={size} color={color} />;
};

const ProfileScreen = () => {
  const [IsConnected, setIsConnected] = useState(true);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [visible, setIsVisible] = useState(false);
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const theme = {
    background: isDark ? '#101317' : '#fff',
    card: isDark ? '#202327' : '#f8fafc',
    text: isDark ? '#f5f5f5' : '#111827',
    subText: isDark ? '#bbb' : '#6b7280',
    border: isDark ? '#333' : '#e5e7eb',
    iconBg: isDark ? '#2d2d2d' : '#eff6ff',
    iconBorder: isDark ? '#3b3b3b' : '#bfdbfe',
  };

  const loadStudentData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (!data) return;

      const parsed = JSON.parse(data);
      setStudent(parsed);

      const token = await AsyncStorage.getItem('authToken');
      const url = `https://stagging.mightymediatech.com/api/user/${parsed.id}/image`;

      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await response.json();

      if (json.status && json.image_url) {
        const cleanUrl = json.image_url.replace('profiles/profiles/', 'profiles/');
        setImageUrl(cleanUrl);
      }
    } catch (error) {
      console.error('❌ Error loading student data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('authToken');
    try {
      await fetch('https://geeksnode.online/api/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      await AsyncStorage.multiRemove([
        'authToken',
        'userData',
        'userEmail',
        'userPassword',
        'profileImageUri',
      ]);
      navigation.replace('Login');
    } catch {
      Alert.alert('Error', 'Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStudentData();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    })

    return () => unsubscribe();
  }, []);

  if (!IsConnected) {
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
    )
  }

  if (loading || refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: '#b91c1c' }]}>No user data found.</Text>
        <TouchableOpacity onPress={loadStudentData} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const Role = () => {
    return student?.roles && Array.isArray(student.roles) && student.roles.length > 0
      ? student.roles[0].name || 'employee'
      : '';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <ImageViewing
        images={[{ uri: imageUrl ? imageUrl : '' }]}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />

      <View
        style={[
          {
            elevation: 3,
            marginBottom: 5,
            height: 100,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.card,
            shadowColor: isDark ? '#000' : '#ccc',
            shadowOpacity: 0.25,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 2 },
            borderRadius: 12,
          },
        ]}
      >
        <Image source={require('../assets/mmtlogo.png')} style={{ width: 250, height: 150 }} />
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']}
            progressBackgroundColor={isDark ? theme.background : '#ffffff'} />
        }
      >
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.imageContainer}>

            <TouchableOpacity onPress={() => imageUrl && setIsVisible(true)} activeOpacity={0.9}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.profileImage} resizeMode="cover" />
              ) : (
                <Image source={require('../assets/avata.png')} style={styles.profileImage} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.editIconContainer, { backgroundColor: theme.iconBg, borderColor: theme.iconBorder }]}
              onPress={() => navigation.navigate('EditProfileScreen')}
            >
              <AppIcon type="FontAwesome" name="pencil-square-o" size={18} color="#2563eb" />
            </TouchableOpacity>

            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{student?.status || 'Active'}</Text>
            </View>
          </View>

          <Text style={[styles.userName, { color: theme.text }]}>{student?.name}</Text>
          <Text style={[styles.userRole, { color: theme.subText }]}>{Role()}</Text>
          <Text style={[styles.code, { color: theme.subText }]}>{student?.employee_code}</Text>
        </View>

        <View style={[styles.menuSection, { backgroundColor: theme.card }]}>
          <MenuItem iconType="FontAwesome" icon="user" title="My Profile" target="MyProfile" theme={theme} />
          <MenuItem iconType="MaterialIcons" icon="description" title="Terms & Conditions" target="Terms" theme={theme} />
          <MenuItem iconType="Ionicons" icon="shield-checkmark" title="Privacy Policy" target="PrivacyPolicy" theme={theme} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <AppIcon type="MaterialIcons" name="logout" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const MenuItem = ({ iconType, icon, title, target, theme }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate(target)} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconWrap, { backgroundColor: theme.iconBg }]}>
          <AppIcon type={iconType} name={icon} color="#2563eb" size={20} />
        </View>
        <Text style={[styles.menuText, { color: theme.text }]}>{title}</Text>
      </View>
      <AppIcon type="Ionicons" name="chevron-forward-outline" color={theme.subText} size={20} />
    </TouchableOpacity>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 18, color: '#1d74ff' },
  errorText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  refreshButton: { backgroundColor: '#0a74ff', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 8 },
  refreshButtonText: { color: '#fff', fontWeight: '600' },
  profileCard: { margin: 16, borderRadius: 16, paddingVertical: 30, alignItems: 'center', elevation: 3 },
  imageContainer: { position: 'relative' },
  profileImage: {width: 150, height: 150, borderRadius: 75, borderWidth: 5, borderColor: '#f8fafc',
   shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 12,},
  activeBadge: {position: 'absolute', bottom: 4, alignSelf: 'center', backgroundColor: '#22c55e',
   paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, borderColor: '#fff', borderWidth: 2,},
  activeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  editIconContainer: { position: 'absolute', top: 0, right: 0, borderRadius: 20, padding: 5, borderWidth: 1, elevation: 2 },
  userName: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  userRole: { fontSize: 14, marginVertical: 10 },
  code: { fontSize: 15, marginBottom: 12 },
  menuSection: { marginHorizontal: 16, borderRadius: 14, marginTop: 10, overflow: 'hidden', elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16,
    paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIconWrap: { padding: 6, borderRadius: 8 },
  menuText: { fontSize: 16, marginLeft: 14, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25, marginBottom: 40 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
