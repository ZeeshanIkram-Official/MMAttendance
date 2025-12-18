import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Platform,
  Dimensions,
  Animated,
  PermissionsAndroid,
  useColorScheme,
  LayoutAnimation
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import NetInfo from '@react-native-community/netinfo';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const targetLat = 28.41482550165086;
const targetLng = 70.305432536986;
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to verify check-in.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  } else {
    try {
      const position = await getCurrentLocation();
      return !!position;
    } catch (error) {
      console.warn('Location services error:', error);
      return false;
    }
  }
};
const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to capture check-in photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Camera permission request error:', err);
      return false;
    }
  }
  return true;
};
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};
const HomeScreen = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(true)
  const [student, setStudent] = useState(null);
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkInElapsedTime, setCheckInElapsedTime] = useState(0);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState('');
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState(null);
  const [breakEnd, setBreakEnd] = useState(null);
  const [breakDuration, setBreakDuration] = useState('00:00:00');
  const [totalBreakDuration, setTotalBreakDuration] = useState(0);
  const [activities, setActivities] = useState([]);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [checkOutModalVisible, setCheckOutModalVisible] = useState(false);
  const [checkInTasks, setCheckInTasks] = useState('');
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [paddingtask, setPaddingtask] = useState('');
  const [checkOutPendingTasks, setCheckOutPendingTasks] = useState('');
  const [Dependencies, setDependencies] = useState('');
  const [AnyBlocker, setAnyBlocker] = useState('');
  const [Issue, setIssue] = useState('');
  const [breakModalVisible, setBreakModalVisible] = useState(false);
  const [breakReason, setBreakReason] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);
  const [isCheckOutLoading, setIsCheckOutLoading] = useState(false);
  const [isBreakLoading, setIsBreakLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [checkOutCapturedImage, setCheckOutCapturedImage] = useState(null);
  const richTextPending = useRef();
  const richTextToday = useRef();
  const richTextCheckOutNotes = useRef();
  const richTextPendingTasks = useRef();
  const richTextActions = [
    'bold',
    'italic',
    'underline',
    'unorderedList',
    'orderedList',
  ];
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    isGeofenceAlert: false,
  });
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef(null);
  const device = useCameraDevice('front');
  const [showTwoMinAlert, setShowTwoMinAlert] = useState(false);
  const [alertShown, setAlertShown] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = {
    background: isDark ? '#101317' : '#FFF',
    card: isDark ? '#202327' : '#FFFFFF',
    text: isDark ? '#f5f5f5' : '#1E293B',
    subText: isDark ? '#fff' : '#64748B',
    border: isDark ? '#333' : '#E5E7EB',
    inputBg: isDark ? '#2d2d2d' : '#FFFFFF',
    inputBorder: isDark ? '#444' : '#D1D5DB',
    modalBg: isDark ? '#1e1e1e' : '#FFFFFF',
    buttonText: '#FFFFFF',
    primary: '#0a74ff',
    danger: '#EF4444',
    breakStart: '#6c757d',
    breakEnd: '#138496',
  };
  const showCustomAlert = (type, title, message, isGeofenceAlert = false) => {
    setCustomAlert({ visible: true, type, title, message, isGeofenceAlert });
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    if (!isGeofenceAlert) {
      setTimeout(() => {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() =>
          setCustomAlert({ visible: false, type: 'success', title: '', message: '', isGeofenceAlert: false })
        );
      }, 1500);
    }
  };
  const calculateTotalHours = () => {
    if (!isCheckedOut || !checkInTime || !checkOutTime || checkInTime === '--:--' || checkOutTime === '--:--') {
      return '00:00:00';
    }
    const checkIn = parseTimeString(checkInTime);
    const checkOut = parseTimeString(checkOutTime);
    if (!checkIn || !checkOut) return '--:--:--';
    let diff = checkOut - checkIn;
    if (diff < 0) {
      checkOut.setDate(checkOut.getDate() + 1);
      diff = checkOut - checkIn;
    }
    return formatDuration(diff);
  };
  const calculateNetWorkingHours = () => {
    const totalWorkingMs = (() => {
      const checkIn = parseTimeString(checkInTime);
      const checkOut = parseTimeString(checkOutTime);
      if (!isCheckedOut || !checkIn || !checkOut) return 0;
      let diff = checkOut - checkIn;
      if (diff < 0) {
        checkOut.setDate(checkOut.getDate() + 1);
        diff = checkOut - checkIn;
      }
      return diff;
    })();
    const netMs = totalWorkingMs - totalBreakDuration;
    return formatDuration(netMs);
  };
  const calculateTotalBreakTime = () => {
    return formatDuration(totalBreakDuration);
  };
  const parseTimeString = (timeStr) => {
    if (!timeStr || timeStr === '--:--') return null;
    const [time, period] = timeStr.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    let adjustedHours = hours;
    if (period === 'PM' && hours !== 12) adjustedHours += 12;
    if (period === 'AM' && hours === 12) adjustedHours = 0;
    const date = new Date();
    date.setHours(adjustedHours, minutes, seconds || 0, 0);
    return date;
  };
  const formatDuration = (milliseconds) => {
    if (milliseconds < 0) return '--:--:--';
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0'),
    ].join(':');
  };
  const getFormattedDateTime = () => {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
    const formattedDate = now.toLocaleDateString('en-GB', dateOptions).replace(', ', ' ');
    return `${formattedTime}, ${formattedDate}`;
  };

  const getBreakStartTime = () => {
    if (!breakStart) return '--:--';
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    return breakStart.toLocaleTimeString('en-US', options);
  };
  const getBreakEndTime = () => {
    if (!breakEnd) return '--:--';
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    return breakEnd.toLocaleTimeString('en-US', options);
  };
  const fetchAttendance = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        showCustomAlert('error', 'Error', 'No auth token found.');
        return;
      }
      const response = await axios.get('https://stagging.mightymediatech.com/api/today-summary', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const records = response.data.data || [];
      if (!Array.isArray(records) || records.length === 0) return;
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = records.find((record) => record.date?.includes(today)) || records[0];
      const checkIn = todayRecord.check_in_time || todayRecord.check_in || '--:--';
      const checkOut = todayRecord.check_out_time || todayRecord.check_out || '--:--';
      let breakStartStr = '--:--';
      let breakEndStr = '--:--';
      if (Array.isArray(todayRecord.breaks) && todayRecord.breaks.length > 0) {
        const latestBreak = todayRecord.breaks[todayRecord.breaks.length - 1];
        breakStartStr = latestBreak.break_in_time || latestBreak.break_start || '--:--';
        breakEndStr = latestBreak.break_out_time || latestBreak.break_end || '--:--';
      }
      const yesterdayPendingTask = todayRecord.task_from_yesterday || todayRecord.pending_tasks || '';
      const parseTimeToDate = (timeStr) => {
        if (!timeStr || timeStr === '--:--') return null;
        let date = new Date();
        let hours = 0, minutes = 0, seconds = 0;
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
          const [time, period] = timeStr.split(' ');
          const [h, m, s] = time.split(':').map(Number);
          hours = h % 12 + (period.toLowerCase() === 'pm' ? 12 : 0);
          minutes = m;
          seconds = s || 0;
        } else {
          const [h, m, s] = timeStr.split(':').map(Number);
          hours = h;
          minutes = m;
          seconds = s || 0;
        }
        date.setHours(hours, minutes, seconds, 0);
        return date;
      };
      const parsedBreakStart = parseTimeToDate(breakStartStr);
      const parsedBreakEnd = parseTimeToDate(breakEndStr);
      setCheckInTime(checkIn);
      setCheckOutTime(checkOut);
      setBreakStart(parsedBreakStart);
      setBreakEnd(parsedBreakEnd);
      setIsCheckedIn(checkIn !== '--:--' && checkOut === '--:--');
      setIsCheckedOut(checkOut !== '--:--');
      setIsOnBreak(!!parsedBreakStart && !parsedBreakEnd);
      if (yesterdayPendingTask) {
        setPaddingtask(yesterdayPendingTask);
        await AsyncStorage.setItem('pendingTasksForTomorrow', yesterdayPendingTask);
      }
    } catch (error) {
      console.error('fetchAttendance error:', error);
      showCustomAlert('error', 'Error', 'Failed to fetch attendance.');
    }
  };
  const loadData = async () => {
    try {
      let userData = await AsyncStorage.getItem('userData');
      if (userData) userData = JSON.parse(userData);
      setStudent(userData);
      let fetchedImageUrl = null;
      if (userData?.id) {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          try {
            const response = await fetch(`https://stagging.mightymediatech.com/api/user/${userData.id}/image`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const json = await response.json();
            if (json.status && json.image_url) {
              const cleanUrl = json.image_url.replace('profiles/profiles/', 'profiles/');
              fetchedImageUrl = cleanUrl;
              await AsyncStorage.setItem('profileImageUri', cleanUrl);
            }
          } catch (err) {
            console.warn('Failed to fetch profile image from API:', err);
          }
        }
      }
      const storedImage = await AsyncStorage.getItem('profileImageUri');
      setProfileImageUri(fetchedImageUrl || storedImage);
      const savedAttendance = await AsyncStorage.getItem('attendanceState');
      const currentDate = new Date().toDateString();
      if (savedAttendance) {
        const state = JSON.parse(savedAttendance);
        if (state.isCheckedOut) {
          // Reset state after checkout
          const initialState = {
            isCheckedIn: false,
            checkInTime: '',
            isCheckedOut: false,
            checkOutTime: '',
            isOnBreak: false,
            breakStart: null,
            breakEnd: null,
            totalBreakDuration: 0,
            breakDuration: '00:00:00',
          };
          await AsyncStorage.setItem('attendanceState', JSON.stringify(initialState));
          await AsyncStorage.setItem('activities', JSON.stringify([]));
          await AsyncStorage.removeItem('lastCheckInDate');
          setIsCheckedIn(false);
          setCheckInTime('');
          setIsCheckedOut(false);
          setCheckOutTime('');
          setIsOnBreak(false);
          setBreakStart(null);
          setBreakEnd(null);
          setTotalBreakDuration(0);
          setBreakDuration('00:00:00');
          setActivities([]);
        } else {
          setIsCheckedIn(state.isCheckedIn || false);
          setCheckInTime(state.checkInTime || '');
          setIsCheckedOut(state.isCheckedOut || false);
          setCheckOutTime(state.checkOutTime || '');
          setIsOnBreak(state.isOnBreak || false);
          setBreakStart(state.breakStart ? new Date(state.breakStart) : null);
          setBreakEnd(state.breakEnd ? new Date(state.breakEnd) : null);
          setTotalBreakDuration(state.totalBreakDuration || 0);
          setBreakDuration(state.breakDuration || '00:00:00');
        }
      } else {
        const initialState = {
          isCheckedIn: false,
          checkInTime: '',
          isCheckedOut: false,
          checkOutTime: '',
          isOnBreak: false,
          breakStart: null,
          breakEnd: null,
          totalBreakDuration: 0,
          breakDuration: '00:00:00',
        };
        await AsyncStorage.setItem('attendanceState', JSON.stringify(initialState));
        await AsyncStorage.setItem('activities', JSON.stringify([]));
      }
      const savedActivities = await AsyncStorage.getItem('activities');
      if (savedActivities) setActivities(JSON.parse(savedActivities));
      if (savedAttendance && JSON.parse(savedAttendance).isCheckedIn) {
        await AsyncStorage.setItem('lastCheckInDate', currentDate);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  const handleCheckIn = async () => {
    if (!checkInTasks || checkInTasks.trim() === '' || checkInTasks.replace(/<[^>]*>/g, '').trim() === '') {
      showCustomAlert('error', 'Error', 'Please enter today\'s tasks!');
      return;
    }
    if (!cameraPermission) {
      showCustomAlert('error', 'Error', 'Camera permission is required to capture a photo.');
      return;
    }
    try {
      setIsCheckInLoading(true);
      const hasLocationPermission = await requestLocationPermission();
      if (!hasLocationPermission) {
        showCustomAlert('error', 'Error', 'Location permission denied. Please enable location services.');
        setIsCheckInLoading(false);
        return;
      }
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      const distance = haversineDistance(latitude, longitude, targetLat, targetLng);
      if (distance > 100) {
        showCustomAlert('error', 'Error', 'You must be within 100 meters of the office to check-in!', true);
        setIsCheckInLoading(false);
        return;
      }
      let photoUri = null;
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePhoto({
          quality: 0.5,
          flash: 'off',
        });
        photoUri = `file://${photo.path}`;
        setCapturedImage(photoUri);
        await AsyncStorage.setItem('checkInPhoto', photoUri);
      }
      const now = new Date();
      const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
      const formattedTime = now.toLocaleTimeString('en-US', options);
      const date = now.toISOString().split('T')[0];
      let user = await AsyncStorage.getItem('userData');
      user = user ? JSON.parse(user) : null;
      if (!user) {
        user = { id: 1, name: '', course_id: '', profile_picture: null };
        await AsyncStorage.setItem('userData', JSON.stringify(user));
      }
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const payload = {
            user_id: user.id,
            today_task: checkInTasks || '',
            check_in_time: formattedTime,
            date,
            latitude,
            longitude,
            check_in_photo: photoUri || '',
          };
          console.log('📤 Sending to API:', payload);
          const response = await axios.post(
            'https://stagging.mightymediatech.com/api/check-in',
            payload,
            {
              headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            }
          );
          console.log('✅ Check-in API Response:', response.data);
        } catch (err) {
          // console.error('Check-in API Error:', err.response?.data || err.message);
        }
      }
      setCheckInTime(formattedTime);
      setIsCheckedIn(true);
      setIsCheckedOut(false);
      setTotalBreakDuration(0);
      setBreakDuration('00:00:00');
      setIsOnBreak(false);
      setBreakStart(null);
      setBreakEnd(null);
      await AsyncStorage.setItem(
        'attendanceState',
        JSON.stringify({
          isCheckedIn: true,
          checkInTime: formattedTime,
          isCheckedOut: false,
          checkOutTime: '',
          isOnBreak: false,
          breakStart: null,
          breakEnd: null,
          totalBreakDuration: 0,
          breakDuration: '00:00:00',
        })
      );
      await AsyncStorage.setItem('lastCheckInDate', new Date().toDateString());
      logActivity('Check In', formattedTime);
      setCheckInModalVisible(false);
      setCheckInTasks('');
      setPaddingtask('');
      setCapturedImage(null);
      showCustomAlert('success', 'Success', 'Checked in successfully with photo!');
      setAlertShown(false);
    } catch (error) {
      console.error('Check-in error:', error);
      showCustomAlert('error', 'Error', 'Failed to check in. Please try again.');
    } finally {
      setIsCheckInLoading(false);
    }
  };
  //<---------------------------------Check In------------------------------->
  const handleCheckOut = async () => {
    const cleanText = (text) => text?.replace(/<[^>]*>/g, '').trim();
    // if (!checkOutNotes || !checkOutPendingTasks || !Dependencies) {
    //   showCustomAlert('error', 'Error', 'Please fill out all required fields.');
    //   return;
    // }
    if (!cleanText(checkOutNotes)) {
      showCustomAlert('error', 'Error', 'Please enter today’s tasks.');
      return;
    }
    if (!cleanText(checkOutPendingTasks)) {
      showCustomAlert('error', 'Error', 'Please enter pending tasks for tomorrow.');
      return;
    }
    if (!cleanText(Dependencies)) {
      showCustomAlert('error', 'Error', 'Please enter Dependencies.');
      return;
    }
    if (!AnyBlocker) {
      showCustomAlert('error', 'Error', 'Please enter Any Blocker.');
      return;
    }
    if (!Issue) {
      showCustomAlert('error', 'Error', 'Please enter Any Issue.');
      return;
    }
    if (!cameraPermission) {
      showCustomAlert('error', 'Error', 'Camera permission is required to capture a photo.');
      return;
    }
    try {
      setIsCheckOutLoading(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        showCustomAlert('error', 'Error', 'Location permission denied. Please enable location services.');
        setIsCheckOutLoading(false);
        return;
      }
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      const distance = haversineDistance(latitude, longitude, targetLat, targetLng);
      if (distance > 100) {
        showCustomAlert('error', 'Error', 'You must be within 100 meters of the office to check-out!', true);
        setIsCheckOutLoading(false);
        return;
      }
      let photoUri = null;
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePhoto({
          quality: 0.5,
          flash: 'off',
        });
        photoUri = `file://${photo.path}`;
        setCheckOutCapturedImage(photoUri);
        await AsyncStorage.setItem('checkOutPhoto', photoUri);
      }
      const now = new Date();
      const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
      const formattedTime = now.toLocaleTimeString('en-US', options);
      const date = now.toISOString().split('T')[0];
      const user = JSON.parse(await AsyncStorage.getItem('userData'));
      const token = await AsyncStorage.getItem('authToken');
      await AsyncStorage.setItem('pendingTasksForTomorrow', checkOutPendingTasks || '');
      if (token) {
        try {
          const payload = {
            user_id: user.id,
            check_out_time: formattedTime,
            date,
            check_out_notes: checkOutNotes || '',
            pending_tasks: checkOutPendingTasks || '',
            dependencies: Dependencies || '',
            any_blocker: AnyBlocker || '',
            issue: Issue || '',
            check_out_photo: photoUri || '',
          };
          console.log('📤 Sending Check-Out to API:', payload);
          const response = await axios.post(
            'https://stagging.mightymediatech.com/api/check-out',
            payload,
            { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
          );
          console.log('✅ Check-Out API Response:', response.data);
        } catch (error) {
          // console.error('Check-out API error:', error.response?.data || error.message);
        }
      }
      setCheckOutTime(formattedTime);
      setIsCheckedIn(false);
      setIsCheckedOut(true);
      setIsOnBreak(false);
      await AsyncStorage.setItem(
        'attendanceState',
        JSON.stringify({
          isCheckedIn: false,
          checkInTime,
          isCheckedOut: true,
          checkOutTime: formattedTime,
          isOnBreak: false,
          breakStart: breakStart ? breakStart.toISOString() : null,
          breakEnd: breakEnd ? breakEnd.toISOString() : null,
          totalBreakDuration,
          breakDuration,
        })
      );
      logActivity('Check Out', formattedTime, checkOutNotes || 'No notes provided');
      setCheckOutModalVisible(false);
      setCheckOutNotes('');
      setCheckOutPendingTasks('');
      setDependencies('');
      setAnyBlocker('');
      setIssue('');
      setCheckOutCapturedImage(null);
      showCustomAlert('success', 'Success', 'Checked out successfully with photo!');
    } catch (error) {
      console.error('Check-out error:', error);
      showCustomAlert('error', 'Error', 'Failed to check out. Please try again.');
    } finally {
      setIsCheckOutLoading(false);
    }
  };
  //<---------------------------------Check Out------------------------------->
  const handleBreakStart = async () => {
    if (!breakReason) {
      showCustomAlert('error', 'Error', 'Please enter break reason.');
      return;
    }
    try {
      setIsBreakLoading(true);
      const now = new Date();
      const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
      const formattedTime = now.toLocaleTimeString('en-US', options);
      const date = now.toISOString().split('T')[0];
      const userStr = await AsyncStorage.getItem('userData');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const response = await axios.post(
            'https://stagging.mightymediatech.com/api/start-break',
            {
              user_id: user.id,
              break_start_time: formattedTime,
              break_start_notes: breakReason || '',
              date,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            }
          );
          console.log('✅ Start-Break API Response:', response.data);
        } catch (err) {
          // console.error('Start-Break API error:', err.response?.data || err.message);
        }
      }
      setBreakStart(now);
      setIsOnBreak(true);
      setBreakDuration(formatDuration(totalBreakDuration));
      await AsyncStorage.setItem(
        'attendanceState',
        JSON.stringify({
          isCheckedIn,
          checkInTime,
          isCheckedOut,
          checkOutTime,
          isOnBreak: true,
          breakStart: now.toISOString(),
          breakEnd: null,
          totalBreakDuration,
          breakDuration: formatDuration(totalBreakDuration),
        })
      );
      logActivity('Break Start', formattedTime, breakReason || '');
      setBreakModalVisible(false);
      setBreakReason('');
      showCustomAlert('success', 'Success', 'Break started!');
    } catch (error) {
      console.error('Break start error:', error);
      showCustomAlert('error', 'Error', 'Failed to start break.');
    } finally {
      setIsBreakLoading(false);
    }
  };
  //<---------------------------------Break Start------------------------------->
  const handleBreakEnd = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      showCustomAlert('error', 'Error', 'Location permission denied. Please enable location services.');
      setIsCheckInLoading(false);
      return;
    }
    const position = await getCurrentLocation();
    const { latitude, longitude } = position.coords;
    const distance = haversineDistance(latitude, longitude, targetLat, targetLng);
    if (distance > 100) {
      showCustomAlert('error', 'Error', 'You must be within 100 meters of the office to end break!', true);
      setIsCheckInLoading(false);
      return;
    }
    try {
      setIsBreakLoading(true);
      const now = new Date();
      const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
      const formattedTime = now.toLocaleTimeString('en-US', options);
      const date = now.toISOString().split('T')[0];
      const userStr = await AsyncStorage.getItem('userData');
      const user = userStr ? JSON.parse(userStr) : null;
      if (breakStart) {
        const breakTime = now - breakStart;
        setTotalBreakDuration((prev) => prev + breakTime);
        setBreakDuration(formatDuration(totalBreakDuration + breakTime));
      }
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const response = await axios.post(
            'https://stagging.mightymediatech.com/api/end-break',
            {
              user_id: user.id,
              break_end_time: formattedTime,
              date,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            }
          );
          console.log('✅ End-Break API Response:', response.data);
        } catch (err) {
          // console.error('End-Break API error:', err.response?.data || err.message);
        }
      }
      setIsOnBreak(false);
      setBreakEnd(now);
      await AsyncStorage.setItem(
        'attendanceState',
        JSON.stringify({
          isCheckedIn,
          checkInTime,
          isCheckedOut,
          checkOutTime,
          isOnBreak: false,
          breakStart: breakStart?.toISOString(),
          breakEnd: now.toISOString(),
          totalBreakDuration: totalBreakDuration + (breakStart ? now - breakStart : 0),
          breakDuration: formatDuration(totalBreakDuration + (breakStart ? now - breakStart : 0)),
        })
      );
      logActivity('Break End', formattedTime);
      showCustomAlert('success', 'Success', 'Break ended!');
    } catch (error) {
      console.error('Break end error:', error);
      showCustomAlert('error', 'Error', 'Failed to end break.');
    } finally {
      setIsBreakLoading(false);
    }
  };
  //<---------------------------------Break End------------------------------->
  const logActivity = async (type, time, reason = '') => {
    const date = new Date().toLocaleDateString();
    const newActivity = { type, time, date, reason };
    const updatedActivities = [newActivity, ...activities];
    setActivities(updatedActivities);
    await AsyncStorage.setItem('activities', JSON.stringify(updatedActivities));
  };
  useEffect(() => {
    let interval;
    if (isOnBreak && breakStart) {
      interval = setInterval(() => {
        const currentBreakTime = new Date() - breakStart;
        const total = totalBreakDuration + currentBreakTime;
        const formatted = formatDuration(total);
        setBreakDuration(formatted);
        AsyncStorage.setItem(
          'attendanceState',
          JSON.stringify({
            isCheckedIn,
            checkInTime,
            isCheckedOut,
            checkOutTime,
            isOnBreak,
            breakStart: breakStart?.toISOString(),
            breakEnd: breakEnd ? breakEnd.toISOString() : null,
            totalBreakDuration,
            breakDuration: formatted,
          })
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnBreak, breakStart, isCheckedIn, checkInTime, isCheckedOut, checkOutTime, totalBreakDuration, breakEnd]);
  useEffect(() => {
    if (checkInModalVisible) {
      const loadPendingTasks = async () => {
        try {
          if (paddingtask) {
            setTimeout(() => {
              richTextPending.current?.setContentHTML(paddingtask);
            }, 100);
          } else {
            const stored = await AsyncStorage.getItem('pendingTasksForTomorrow');
            if (stored) {
              setPaddingtask(stored);
              setTimeout(() => {
                richTextPending.current?.setContentHTML(stored);
              }, 100);
            }
          }
        } catch (error) {
          console.error('Error loading pending tasks:', error);
        }
      };
      loadPendingTasks();
    }
  }, [checkInModalVisible, paddingtask]);
  //<---------------------------------checkInModalVisible------------------------------->
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  //<---------------------------------Date------------------------------->
  useEffect(() => {
    let timerInterval;
    if (isCheckedIn && checkInTime && !isCheckedOut) {
      timerInterval = setInterval(() => {
        const checkInDate = parseTimeString(checkInTime);
        if (checkInDate) {
          const elapsed = new Date() - checkInDate;
          setCheckInElapsedTime(elapsed);
        }
      }, 1000);
    } else {
      setCheckInElapsedTime(0);
    }
    return () => clearInterval(timerInterval);
  }, [isCheckedIn, checkInTime, isCheckedOut]);
  //<---------------------------------Location------------------------------->
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const cameraPerm = await requestCameraPermission();
      setCameraPermission(cameraPerm);
      const hasLocationPermission = await requestLocationPermission();
      if (!hasLocationPermission) {
        showCustomAlert('error', 'Location Required', 'Please enable location services to use this app.');
      }
      await loadData();
      await fetchAttendance();
      setLoading(false);
    };
    loadInitialData();
    // auto refresh every 20 seconds
  const interval = setInterval(() => {
    fetchAttendance();
  }, 1000);

  return () => clearInterval(interval);
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await fetchAttendance();
    setRefreshing(false);
  };
  //<---------------------------------Location Permission------------------------------->
  useEffect(() => {
    let interval;
    if (isCheckedIn && !isCheckedOut && !alertShown) {
      interval = setInterval(() => {
        const checkInDate = parseTimeString(checkInTime);
        if (checkInDate) {
          const elapsed = new Date() - checkInDate;
          if (elapsed >= 120000) {// 2 minutes
            setShowTwoMinAlert(true);
            setAlertShown(true);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, isCheckedOut, checkInTime, alertShown]);
  //<---------------------------------Shift Alert------------------------------->
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
  //<---------------------------------connection Alert------------------------------->
  if (loading || refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading Attendance...</Text>
      </View>
    );
  }
  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>

      <View style={[styles.logoContainer
        ,
      {
        backgroundColor: isDark ? '#202327' : '#f8fafc',
        shadowColor: '#000',
        shadowOpacity: isDark ? 0.25 : 0.05,
        borderColor: isDark ? '#334155' : 'transparent',
        borderWidth: isDark ? 0.5 : 0,
      },
      ]}>
        <Image source={require('../assets/mmtlogo.png')} style={styles.logoImage} />
      </View>
      <ScrollView refreshControl={<RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={['#1d74ff']}
        tintColor="#1d74ff"
        progressBackgroundColor={isDark ? theme.background : '#ffffff'}
      />}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}
              activeOpacity={0.7}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
              ) : (
                <Image source={require('../assets/avatar.png')} style={styles.profileImage} />
              )}
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{student?.status || 'Active'}</Text>
              </View>
            </TouchableOpacity>
            <View>
              <Text style={[styles.userName, { color: theme.subText }]}>{student?.name || ''}</Text>
              <Text style={[styles.userRole, { color: theme.subText }]}>
                {student?.roles && student.roles.length > 0 ? student.roles[0].name : ''}
              </Text>
              <Text style={[styles.dateText, { color: theme.subText }]}>{getFormattedDateTime()}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.attendanceSection, { backgroundColor: theme.card }]}>
          <TouchableOpacity onPress={() => navigation.navigate('Homekiroport')}>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: theme.subText }]}>Today Attendance</Text>

          <View style={styles.timeCardContainer}>
            <View style={[styles.timeCard, { backgroundColor: theme.background }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.timeCardTitle, { color: theme.subText }]}>Check In</Text>
                {isCheckedIn && !isCheckedOut && checkInElapsedTime > 0 && (
                  <Text style={[styles.timeCardTitle, { color: '#101520ff', fontSize: 10, marginLeft: 10 }, { color: theme.subText }]}>
                    ( {formatDuration(checkInElapsedTime)} )
                  </Text>
                )}
              </View>
              <Text style={styles.timeText}>{checkInTime || '--:--'}</Text>
            </View>
            <View style={[styles.timeCard, { backgroundColor: theme.background }]}>
              <Text style={[styles.timeCardTitle, { color: theme.subText }]}>Check Out</Text>
              <Text style={styles.timeText}>{checkOutTime || '--:--'}</Text>
            </View>
          </View>
          <View style={styles.timeCardContainer}>
            <View style={[styles.timeCard, { backgroundColor: theme.background }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.timeCardTitle, { color: theme.subText }]}>Break's Start</Text>

              </View>
              <Text style={styles.timeText}>{getBreakStartTime()}</Text>
            </View>
            <View style={[styles.timeCard, { backgroundColor: theme.background }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.timeCardTitle, { color: theme.subText }]}>Break's End</Text>

              </View>
              <Text style={styles.timeText}>{getBreakEndTime()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
              activeOpacity={0.7}
            style={[
              styles.actionButton,
              isCheckedIn ? styles.checkOutButton : styles.checkInButton,
              { opacity: isOnBreak ? 0.5 : 1 },
            ]}
            onPress={isCheckedIn ? () => setCheckOutModalVisible(true) : () => setCheckInModalVisible(true)}
            disabled={isOnBreak}
          >
            <Text style={styles.actionButtonText}>{isCheckedIn ? 'Check Out' : 'Check In'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
          activeOpacity={0.7}
            style={[
              styles.actionButton,
              isOnBreak ? styles.breakEndButton : styles.breakStartButton,
              { opacity: !isCheckedIn ? 0.5 : 1 },
            ]}
            onPress={isOnBreak ? handleBreakEnd : () => setBreakModalVisible(true)}
            disabled={!isCheckedIn}
          >
            {isBreakLoading && !isOnBreak ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.actionButtonText}>
                {isOnBreak ? 'End Break' : 'Start Break'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.activitySection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.subText }]}>Recent Activity</Text>
          <View style={[styles.activityItem, { backgroundColor: theme.background }]}>
            <Text style={[styles.activityType, { color: theme.subText }]}>Shift Hours</Text>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.activityTime, { color: theme.subText }]}>
                {calculateTotalHours()}
              </Text>
              <Text style={{ fontSize: 10, color: theme.subText }}>HH:MM:SS</Text>
            </View>
          </View>
          <View style={[styles.activityItem, { backgroundColor: theme.background }]}>
            <Text style={[styles.activityType, { color: theme.subText }]}>Total Break Time</Text>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.activityTime, { color: theme.subText }]}>
                {calculateTotalBreakTime()}
              </Text>
              <Text style={{ fontSize: 10, color: theme.subText }}>HH:MM:SS</Text>
            </View>
          </View>
          <View style={[styles.activityItem, { backgroundColor: theme.background }]}>
            <Text style={[styles.activityType, { color: theme.subText }]}>Working Hours</Text>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.activityTime, { color: theme.subText }]}>
                {isCheckedOut ? calculateNetWorkingHours() : '00:00:00'}
              </Text>
              <Text style={{ fontSize: 10, color: theme.subText }}>HH:MM:SS</Text>
            </View>
          </View>
        </View>

      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={checkInModalVisible}
        onRequestClose={() => {
          setCheckInModalVisible(false);
          setCapturedImage(null);
        }}>
        <View style={[[styles.modalContent, { maxHeight: SCREEN_HEIGHT * 0.9 }, { backgroundColor: theme.card }]]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Check In</Text>
          <Text style={[styles.modalHeading, { color: theme.text }]}>Camera Preview</Text>
          {cameraPermission && device ? (
            <View style={styles.cameraContainer}>
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={checkInModalVisible}
                photo={true}
              />
            </View>
          ) : (
            <Text style={styles.noCameraText}>
              {cameraPermission === false
                ? 'Camera permission denied. Please enable it in settings.'
                : 'No camera device available.'}
            </Text>
          )}
          <ScrollView
            contentContainerStyle={[styles.modalScrollContent, { paddingBottom: 70 }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.modalHeading, { color: theme.text }]}>Pending Task from Yesterday?
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <RichToolbar
              editor={richTextPending}
              selectedIconTint={theme.primary}
              iconTint={isDark ? '#f5f5f5' : '#16181b'}
              style={{
                backgroundColor: isDark ? theme.background : '#F3F4F6',
                borderRadius: 8,
                marginBottom: 12,
                justifyContent: 'space-around',
              }}
              actions={richTextActions}
              iconMap={{
                bold: ({ tintColor }) => (
                  <Text style={{ color: tintColor, fontSize: 18, fontWeight: 'bold' }}>B</Text>
                ),
                italic: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-italic" size={20} color={tintColor} />
                ),
                underline: ({ tintColor }) => (
                  <Text style={{ color: tintColor, fontSize: 18, textDecorationLine: 'underline' }}>U</Text>
                ),
                unorderedList: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-list-bulleted" size={20} color={tintColor} />
                ),
                orderedList: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-list-numbered" size={20} color={tintColor} />
                ),
              }}
            />
            <View
              style={{
                borderWidth: 1,
                borderColor: isDark ? theme.inputBorder : '#D1D5DB',
                borderRadius: 12,
                marginBottom: 12,
                overflow: 'hidden',
              }}
            >
              <RichEditor
                ref={richTextPending}
                initialContentHTML={paddingtask}
                placeholder="Enter pending tasks from yesterday..."
                onChange={(text) => setPaddingtask(text)}
                editorStyle={{
                  backgroundColor: theme.card,
                  color: theme.text,
                  placeholderColor: isDark ? '#aaa' : '#9CA3AF',
                  contentCSSText: 'font-size: 16px; padding: 12px; min-height: 100px;',
                }}
              />
              {/* <RichEditor
  ref={richTextPending}
  initialContentHTML={paddingtask}
  placeholder="Enter pending tasks from yesterday..."
  onBlur={(text) => setPaddingtask(text)}
  editorStyle={{
    backgroundColor: theme.card,
    color: theme.text,
    placeholderColor: isDark ? '#aaa' : '#9CA3AF',
    contentCSSText: 'font-size: 16px; padding: 12px; min-height: 100px;',
  }}
/> */}

            </View>
            <Text style={[styles.modalHeading, { color: theme.text }]}>What Tasks Will Be Performe Today?<Text style={styles.requiredAsterisk}> *</Text></Text>
            <RichToolbar
              editor={richTextToday}
              selectedIconTint={theme.primary}
              iconTint={isDark ? '#f5f5f5' : '#16181b'}
              style={{
                backgroundColor: isDark ? theme.background : '#F3F4F6',
                borderRadius: 8,
                marginBottom: 12,
                justifyContent: 'space-around',
              }}
              actions={richTextActions}
              iconMap={{
                bold: ({ tintColor }) => (
                  <Text style={{ color: tintColor, fontSize: 18, fontWeight: 'bold' }}>B</Text>
                ),
                italic: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-italic" size={20} color={tintColor} />
                ),
                underline: ({ tintColor }) => (
                  <Text style={{ color: tintColor, fontSize: 18, textDecorationLine: 'underline' }}>U</Text>
                ),
                unorderedList: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-list-bulleted" size={20} color={tintColor} />
                ),
                orderedList: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-list-numbered" size={20} color={tintColor} />
                ),
              }}
            />
            <View
              style={{
                borderWidth: 1, borderRadius: 12, marginBottom: 12, overflow: 'hidden',
                borderColor: isDark ? theme.inputBorder : '#D1D5DB',
              }}>
              <RichEditor
                ref={richTextToday}
                initialContentHTML={checkInTasks}
                placeholder="Enter today's tasks..."
                onChange={(text) => setCheckInTasks(text)}
                editorStyle={{
                  backgroundColor: theme.card,
                  color: theme.text,
                  placeholderColor: isDark ? '#aaa' : '#9CA3AF',
                  contentCSSText: 'font-size: 16px; padding: 12px; min-height: 150px;',
                  marginBottom: 100,
                }}
              />
            </View>
          </ScrollView>
          <View style={[styles.stickyButtonContainer, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setCheckInModalVisible(false);
                setCapturedImage(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCheckIn}
              activeOpacity={0.8}
              disabled={isCheckInLoading || !cameraPermission}
            >
              {isCheckInLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={checkOutModalVisible}
        onRequestClose={() => {
          setCheckOutModalVisible(false);
          setCheckOutCapturedImage(null);
        }}>
        <View style={[[styles.modalContent, { maxHeight: SCREEN_HEIGHT * 0.95 }, { backgroundColor: theme.card }]]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Check Out</Text>
          <Text style={[styles.modalHeading, { color: theme.text }]}>Camera Preview</Text>
          {cameraPermission && device ? (
            <View style={styles.cameraContainer}>
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={checkOutModalVisible}
                photo={true}
              />
            </View>
          ) : (
            <Text style={styles.noCameraText}>
              {cameraPermission === false
                ? 'Camera permission denied. Please enable it in settings.'
                : 'No camera device available.'}
            </Text>
          )}
          {/* Comment out this line to prevent displaying the captured image */}
          {/* {checkOutCapturedImage && <Image source={{ uri: checkOutCapturedImage }} style={styles.capturedImage} />} */}
          <ScrollView
            contentContainerStyle={[styles.modalScrollContent, { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false} >
            <Text style={[styles.modalHeading, { color: theme.text }]}>Tasks Done Today<Text style={styles.requiredAsterisk}> *</Text></Text>
            <RichToolbar
              editor={richTextCheckOutNotes}
              selectedIconTint={theme.primary}
              iconTint={isDark ? '#f5f5f5' : '#16181b'}
              style={{
                backgroundColor: isDark ? theme.background : '#F3F4F6',
                borderRadius: 8,
                marginBottom: 12,
                justifyContent: 'space-around',
              }}
              actions={richTextActions}
              iconMap={{
                bold: ({ tintColor }) => (
                  <Text style={{ color: tintColor, fontSize: 18, fontWeight: 'bold' }}>B</Text>
                ),
                italic: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-italic" size={20} color={tintColor} />
                ),
                underline: ({ tintColor }) => (
                  <Text style={{ color: tintColor, fontSize: 18, textDecorationLine: 'underline' }}>U</Text>
                ),
                unorderedList: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-list-bulleted" size={20} color={tintColor} />
                ),
                orderedList: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-list-numbered" size={20} color={tintColor} />
                ),
              }}
            />
            <View
              style={{
                borderWidth: 1,
                borderColor: isDark ? theme.inputBorder : '#D1D5DB',
                borderRadius: 12,
                marginBottom: 20,
                overflow: 'hidden',
              }}
            >
              <RichEditor
                ref={richTextCheckOutNotes}
                initialContentHTML={checkOutNotes}
                placeholder="List tasks completed today..."
                onChange={(text) => setCheckOutNotes(text)}
                editorStyle={{
                  backgroundColor: theme.card,
                  color: theme.text,
                  placeholderColor: isDark ? '#aaa' : '#9CA3AF',
                  contentCSSText: 'font-size: 16px; padding: 12px; min-height: 120px;',
                }}
              />
            </View>
            <Text style={[styles.modalHeading, { color: theme.text }]}>Tasks Pending for Tomorrow<Text style={styles.requiredAsterisk}> *</Text></Text>
            <RichToolbar
              editor={richTextPendingTasks}
              selectedIconTint={theme.primary}
              iconTint={isDark ? '#f5f5f5' : '#16181b'}
              style={{
                backgroundColor: isDark ? theme.background : '#F3F4F6',
                borderRadius: 8,
                marginBottom: 12,
                justifyContent: 'space-around',
              }}
              actions={richTextActions}
              iconMap={{
                bold: ({ tintColor }) => (
                  <Text style={{ color: tintColor, fontSize: 18, fontWeight: 'bold' }}>B</Text>
                ),
                italic: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-italic" size={20} color={tintColor} />
                ),
                underline: ({ tintColor }) => (
                  <Text style={{ color: tintColor, fontSize: 18, textDecorationLine: 'underline' }}>U</Text>
                ),
                unorderedList: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-list-bulleted" size={20} color={tintColor} />
                ),
                orderedList: ({ tintColor }) => (
                  <MaterialCommunityIcons name="format-list-numbered" size={20} color={tintColor} />
                ),
              }}
            />
            <View
              style={{
                borderWidth: 1,
                borderColor: isDark ? theme.inputBorder : '#D1D5DB',
                borderRadius: 12,
                marginBottom: 20,
                overflow: 'hidden',
              }}
            >
              <RichEditor
                ref={richTextPendingTasks}
                initialContentHTML={checkOutPendingTasks}
                placeholder="List tasks pending for tomorrow..."
                onChange={(text) => setCheckOutPendingTasks(text)}
                editorStyle={{
                  backgroundColor: theme.card,
                  color: theme.text,
                  placeholderColor: isDark ? '#aaa' : '#9CA3AF',
                  contentCSSText: 'font-size: 16px; padding: 12px; min-height: 120px;',
                }}
              />
            </View>
            <Text style={[styles.modalHeading, { color: theme.text }]}>Dependencies<Text style={styles.requiredAsterisk}> *</Text></Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                },
              ]}
              multiline
              placeholder="Dependencies if any"
              placeholderTextColor={isDark ? '#aaa' : '#64748B'}
              value={Dependencies}
              onChangeText={setDependencies}
            />
            <Text style={[styles.modalHeading, { color: theme.text }]}>Any Blocker<Text style={styles.requiredAsterisk}> *</Text></Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                },
              ]}
              multiline
              placeholder="Any blockers if any"
              placeholderTextColor={isDark ? '#aaa' : '#64748B'}
              value={AnyBlocker}
              onChangeText={setAnyBlocker}
            />
            <Text style={[styles.modalHeading, { color: theme.text }]}>Issue of the Day<Text style={styles.requiredAsterisk}> *</Text></Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                },
              ]}
              multiline
              placeholder="Any blockers if any"
              placeholderTextColor={isDark ? '#aaa' : '#64748B'}
              value={Issue}
              onChangeText={setIssue}
            />
          </ScrollView>
          <View style={[styles.stickyButtonContainer, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setCheckOutModalVisible(false);
                setCheckOutCapturedImage(null);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCheckOut}
              disabled={isCheckOutLoading || !cameraPermission}
            >
              {isCheckOutLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={breakModalVisible}
        onRequestClose={() => setBreakModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Start Break</Text>
            <Text style={[styles.modalHeading, { color: theme.text }]}>Write Break Reason Here</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.card, color: theme.text },]}
              multiline
              placeholder="Break reason here"
              placeholderTextColor={isDark ? '#aaa' : '#64748B'}
              value={breakReason}
              onChangeText={setBreakReason}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setBreakModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleBreakStart}
                disabled={isBreakLoading}
              >
                {isBreakLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Start</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="none"
        transparent={true}
        visible={customAlert.visible}
        onRequestClose={() =>
          setCustomAlert({ visible: false, type: 'success', title: '', message: '', isGeofenceAlert: false })
        }
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.customAlertContent,
              {
                backgroundColor: customAlert.type === 'success' ? '#F0FDF4' : '#FFF1F2',
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {customAlert.isGeofenceAlert && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setCustomAlert({ visible: false, type: 'success', title: '', message: '', isGeofenceAlert: false })
                }
              >
                <MaterialCommunityIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            )}
            <MaterialCommunityIcons
              name={customAlert.type === 'success' ? 'check-circle' : 'alert-circle'}
              size={32}
              color={customAlert.type === 'success' ? '#16A34A' : '#DC2626'}
              style={styles.alertIcon}
            />
            <Text
              style={[
                styles.customAlertTitle,
                { color: customAlert.type === 'success' ? '#16A34A' : '#DC2626' },
              ]}
            >
              {customAlert.title}
            </Text>
            <Text style={styles.customAlertText}>{customAlert.message}</Text>
          </Animated.View>
        </View>
      </Modal>
      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={showTwoMinAlert}
        onRequestClose={() => setShowTwoMinAlert(false)} >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Alert</Text>
            <Text style={[styles.customAlertText, { color: theme.text }]}>You have reached 2 minutes. Continue or Check-out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.submitButton1}
                onPress={() => {
                  setShowTwoMinAlert(false);
                }}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton1}
                onPress={() => {
                  setShowTwoMinAlert(false);
                  setCheckOutModalVisible(true);
                }}>
                <Text style={styles.buttonText}>Check-out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}
      {datePickerVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1, backgroundColor: '#F9FAFB',
  },
  logoContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    // elevation: 4,
    marginBottom: 10,
  },
  logoImage: {
    width: 250,
    height: 150,
  },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 10, fontSize: 18, color: '#0a74ff', fontWeight: '600', fontFamily: 'System',
  },
  header: {
    padding: 20, backgroundColor: '#FFFFFF', elevation: 4,
  },
  profileSection: {
    flexDirection: 'row', alignItems: 'center',
  },
  profileImage: {
    width: 90, height: 90, borderRadius: 100, borderWidth: 2, borderColor: '#f8fafc', borderWidth: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  defaultProfile: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#0a74ff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5,
  },
  defaultProfileText: {
    color: '#FFFFFF', fontSize: 22, fontWeight: '700', textTransform: 'uppercase',
  },
  activeBadge: {
    position: 'absolute', bottom: 2, alignSelf: 'center', backgroundColor: '#22c55e', paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 20, borderColor: '#fff', borderWidth: 2
  },
  activeBadgeText: { color: '#fff', fontSize: 7, fontWeight: '600' },
  userName: {
    fontSize: 20, fontWeight: '700', color: '#1E293B', marginLeft: 15, fontFamily: 'System',
  },
  userRole: {
    fontSize: 15, color: '#1E293B', fontWeight: '700', marginLeft: 15, fontFamily: 'System', marginTop: 2,
  },
  dateText: {
    fontSize: 15, color: '#64748B', marginLeft: 15, marginTop: 6, fontWeight: '500', fontFamily: 'System',
  },
  attendanceSection: {
    width: '95%', alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#FFFFFF',
    marginTop: 10, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#1E293B', fontFamily: 'System',
  },
  timeCardContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10,
  },
  timeCard: {
    flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 15, marginHorizontal: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  timeCardTitle: {
    fontSize: 14, fontWeight: '600', color: '#374151', fontFamily: 'System',
  },
  breakCountText: {
    fontSize: 14, color: '#64748B', fontWeight: '500', fontFamily: 'System',
  },
  timeText: {
    fontSize: 18, color: '#0a74ff', marginTop: 6, fontWeight: '600', fontFamily: 'System',
  },
  activitySection: {
    width: '95%', alignSelf: 'center', padding: 20, backgroundColor: '#FFFFFF', marginTop: 10,
    borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
    elevation: 3, marginBottom: 30,
  },
  activityItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10,
    padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  activityType: {
    fontSize: 14, fontWeight: '600', color: '#374151', fontFamily: 'System',
  },
  activityTime: {
    fontSize: 14, color: '#64748B', fontFamily: 'System',
  },
  buttonContainer: {
    flexDirection: 'row', padding: 20, paddingBottom: 20,
  },
  actionButton: {
    flex: 1, paddingVertical: 12, borderRadius: 10, marginHorizontal: 5, alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
  },
  checkInButton: {
    backgroundColor: '#0a74ff',
  },
  checkOutButton: {
    backgroundColor: '#EF4444',
  },
  breakStartButton: {
    backgroundColor: '#6c757d',
  },
  breakEndButton: {
    backgroundColor: '#138496',
  },
  actionButtonText: {
    color: '#FFFFFF', fontSize: 16, fontWeight: '600', fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalContent: {
    marginTop: '5%', width: '90%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    shadowColor: 'rgba(0, 0, 0, 0.5)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 10, alignSelf: 'center'
  },
  modalTitle: {
    fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#1E293B', fontFamily: 'System', textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  modalTitle1: {
    fontSize: 20, fontWeight: '700', marginBottom: 20, color: '#1E293B', fontFamily: 'System', textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  modalHeading: {
    fontSize: 16, fontWeight: '600', color: '#1E293B', fontFamily: 'System', marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.05)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1,
  },
  requiredAsterisk: {
    color: 'red', fontWeight: 'bold', fontSize: 14, marginLeft: 2,
  },
  cameraContainer: {
    width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#D1D5DB',
  },
  capturedImage: {
    width: '100%', height: 200, borderRadius: 12, marginBottom: 12,
  },
  noCameraText: {
    fontSize: 16, color: '#DC2626', textAlign: 'center', marginBottom: 12, fontFamily: 'System',
  },
  textInput: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 16,
    color: '#1E293B', fontFamily: 'System', backgroundColor: 'white',
  },
  modalButtons: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 20,
  },
  stickyButtonContainer: {
    flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: 20, left: 24,
    right: 24, backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#6B7280', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, flex: 1, marginRight: 10,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  cancelButton1: {
    backgroundColor: '#6B7280', paddingVertical: 14, borderRadius: 16, flex: 1, marginRight: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  submitButton: {
    backgroundColor: '#0a74ff', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, flex: 1, marginLeft: 10,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  submitButton1: {
    backgroundColor: '#0a74ff', paddingVertical: 14, borderRadius: 16, flex: 1, marginRight: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF', fontWeight: '700', fontSize: 18, fontFamily: 'System', textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1,
  },
  customAlertContent: {
    width: '85%', maxWidth: 320, borderRadius: 16, padding: 20, alignItems: 'center', backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8, borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeButton: {
    position: 'absolute', top: 10, right: 10, padding: 5,
  },
  alertIcon: {
    marginBottom: 12,
  },
  customAlertTitle: {
    fontSize: 20, fontWeight: '700', fontFamily: 'System', marginBottom: 8, textAlign: 'center', textTransform: 'capitalize',
  },
  customAlertText: {
    fontSize: 14, color: '#374151', fontFamily: 'System', textAlign: 'center', lineHeight: 20,
  },
  breakTimeItem: {
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  breakTimeText: {
    fontSize: 16, color: '#1E293B', fontFamily: 'System',
  },
  breakReasonText: {
    fontSize: 14, color: '#64748B', marginTop: 4, fontFamily: 'System',
  },
  noBreaksText: {
    fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 20, fontFamily: 'System',
  },
});
export default HomeScreen;