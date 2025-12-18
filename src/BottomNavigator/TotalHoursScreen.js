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
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

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
  const [totalDays, setTotalDays] = useState(0);
  const [time, setTime] = useState(new Date());
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);
  const [isCheckOutLoading, setIsCheckOutLoading] = useState(false);
  const [isBreakLoading, setIsBreakLoading] = useState(false);
  const [breakTimesModalVisible, setBreakTimesModalVisible] = useState(false);
  const [breakEndTimesModalVisible, setBreakEndTimesModalVisible] = useState(false);

  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    isGeofenceAlert: false,
  });
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const [showTwoMinAlert, setShowTwoMinAlert] = useState(false);
  const [alertShown, setAlertShown] = useState(false);

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

  const calculateTotalDaysExcludingSundays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let nonSundayDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      if (currentDay.getDay() !== 0) {
        nonSundayDays++;
      }
    }
    return nonSundayDays;
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

  const getBreakCountForCurrentDate = () => {
    if (!isCheckedIn && !isCheckedOut) return 0;

    const checkIn = parseTimeString(checkInTime);
    const checkOut = isCheckedOut ? parseTimeString(checkOutTime) : new Date();

    return activities.filter(activity => {
      if (activity.type !== 'Break Start') return false;
      const activityTime = parseTimeString(activity.time);
      return activityTime >= checkIn && activityTime <= checkOut;
    }).length;
  };

  const getBreakEndCountForCurrentDate = () => {
    if (!isCheckedIn && !isCheckedOut) return 0;

    const checkIn = parseTimeString(checkInTime);
    const checkOut = isCheckedOut ? parseTimeString(checkOutTime) : new Date();

    return activities.filter(activity => {
      if (activity.type !== 'Break End') return false;
      const activityTime = parseTimeString(activity.time);
      return activityTime >= checkIn && activityTime <= checkOut;
    }).length;
  };

  const getBreakStartTime = () => {
    if (!breakStart) return '--:--';
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return breakStart.toLocaleTimeString('en-US', options);
  };

  const getBreakEndTime = () => {
    if (!breakEnd) return '--:--';
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return breakEnd.toLocaleTimeString('en-US', options);
  };

  const handleDateChange = (event, selected) => {
    const currentDate = selected || selectedDate;
    setDatePickerVisible(false);
    setSelectedDate(currentDate);
    const totalNonSundayDays = calculateTotalDaysExcludingSundays(currentDate);
    setTotalDays(totalNonSundayDays);
  };

  const loadData = async () => {
    try {
      let userData = await AsyncStorage.getItem('userData');
      if (userData) userData = JSON.parse(userData);
      setStudent(userData);

      const storedImage = await AsyncStorage.getItem('profileImageUri');
      if (storedImage) setProfileImageUri(storedImage);

      const savedAttendance = await AsyncStorage.getItem('attendanceState');
      const currentDate = new Date().toDateString();

      console.log('📋 Saved Attendance:', savedAttendance);
      console.log('📅 Current Date:', currentDate);

      if (savedAttendance) {
        const state = JSON.parse(savedAttendance);
        console.log('🔄 Restoring State:', state);

        if (state.isCheckedOut) {
          console.log('🔄 Resetting state after check-out');
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
        console.log('🆕 Initializing new attendance state');
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

      const totalNonSundayDays = calculateTotalDaysExcludingSundays(new Date());
      setTotalDays(totalNonSundayDays);

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

    try {
      setIsCheckInLoading(true);

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
        showCustomAlert('error', 'Error', 'You must be within 100 meters of the office to check-in!', true);
        setIsCheckInLoading(false);
        return;
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
          };
          console.log('📤 Sending to API:', payload);
          const response = await axios.post(
            'https://geeksnode.online/api/check-in',
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
      showCustomAlert('success', 'Success', 'Checked in!');

      setAlertShown(false);
    } catch (error) {
      console.error('Check-in error:', error);
      showCustomAlert('error', 'Error', 'Location access denied or unavailable. Please enable location services.');
    } finally {
      setIsCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    const cleanText = (text) => text?.replace(/<[^>]*>/g, '').trim();

    if (!checkOutNotes && !checkOutPendingTasks && !Dependencies) {
      showCustomAlert('error', 'Error', 'Please fill out both fields.');
      return;
    }

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
          };
          console.log('📤 Sending Check-Out to API:', payload);
          const response = await axios.post(
            'https://geeksnode.online/api/check-out',
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

      showCustomAlert('success', 'Success', 'Checked out successfully!');
    } catch (error) {
      console.error('Check-out error:', error);
      showCustomAlert('success', 'Success', 'Checked out successfully!');
    } finally {
      setIsCheckOutLoading(false);
    }
  };

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
            'https://geeksnode.online/api/start-break',
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
          console.error('Start-Break API error:', err.response?.data || err.message);
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
            'https://geeksnode.online/api/end-break',
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
          console.error('End-Break API error:', err.response?.data || err.message);
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
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
    setCheckInElapsedTime(0); // Reset timer when not checked in
  }
  return () => clearInterval(timerInterval);
}, [isCheckedIn, checkInTime, isCheckedOut]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Check and request location permission on app start
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          showCustomAlert('error', 'Location Required', 'Please enable location services to use this app.');
          return; // Stop further execution if permission is not granted
        }

        // Proceed with loading other data
        await loadData();
      } catch (error) {
        console.error('Error during initial load:', error);
        showCustomAlert('error', 'Error', 'Failed to initialize app. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (checkInModalVisible) {
      const loadPendingTasks = async () => {
        try {
          const pendingTasks = await AsyncStorage.getItem('pendingTasksForTomorrow');
          if (pendingTasks) {
            const plainPendingTasks = pendingTasks.replace(/<[^>]+>/g, '').trim();
            setPaddingtask(plainPendingTasks);
          } else {
            setPaddingtask('');
          }
        } catch (error) {
          console.error('Error loading pending tasks:', error);
        }
      };
      loadPendingTasks();
    }
  }, [checkInModalVisible]);

  useEffect(() => {
    let interval;
    if (isCheckedIn && !isCheckedOut && !alertShown) {
      interval = setInterval(() => {
        const checkInDate = parseTimeString(checkInTime);
        if (checkInDate) {
          const elapsed = new Date() - checkInDate;
          if (elapsed >= 120000) { // 2 minutes
            setShowTwoMinAlert(true);
            setAlertShown(true);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, isCheckedOut, checkInTime, alertShown]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    await loadData();
    setRefreshing(false);
    setLoading(false);
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
        
          <View style={styles.profileSection}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.defaultProfile}>
                <TouchableOpacity onPress={()=> navigation.navigate("MyProfile")}>
                <Text style={styles.defaultProfileText}>
                  {student?.name
                    ? student.name
                        .split(' ')
                        .filter((part) => part)
                        .slice(0, 2)
                        .map((part) => part.charAt(0).toUpperCase())
                        .join('')
                    : 'U'}
                </Text>
                </TouchableOpacity>

              </View>
            )}
            <View>
              <Text style={styles.userName}>{student?.name || ''}</Text>
              <Text style={styles.userRole}>
                {student?.roles && student.roles.length > 0 ? student.roles[0].guard_name : ''}
              </Text>
              <Text style={styles.dateText}>{getFormattedDateTime()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.attendanceSection}>
          <Text style={styles.sectionTitle}>Today Attendance</Text>
          <View style={styles.timeCardContainer}>
            <View style={styles.timeCard}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={styles.timeCardTitle}>Check In</Text>
    {isCheckedIn && !isCheckedOut && checkInElapsedTime > 0 && (
      <Text style={[styles.timeCardTitle, { marginLeft: 10, color: '#101520ff',fontSize: 12 }]}>
       ( {formatDuration(checkInElapsedTime)} )
      </Text>
    )}
  </View>
  <Text style={styles.timeText}>{checkInTime || '--:--'}</Text>
</View>
            <View style={styles.timeCard}>
              <Text style={styles.timeCardTitle}>Check Out</Text>
              <Text style={styles.timeText}>{checkOutTime || '--:--'}</Text>
            </View>
          </View>
          <View style={styles.timeCardContainer}>
            <View style={styles.timeCard}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.timeCardTitle}>Break's Start</Text>
                <TouchableOpacity
                  onPress={() => setBreakTimesModalVisible(true)}
                  style={{
                    backgroundColor: '#E2E8F0',
                    borderRadius: 8,
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    marginLeft: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    bottom: 10,
                  }}
                >
                  <Text style={styles.breakCountText}>{getBreakCountForCurrentDate()}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.timeText}>{getBreakStartTime()}</Text>
            </View>

            <View style={styles.timeCard}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.timeCardTitle}>Break's End</Text>
                <TouchableOpacity
                  onPress={() => setBreakEndTimesModalVisible(true)}
                  style={{
                    backgroundColor: '#E2E8F0',
                    borderRadius: 8,
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    marginLeft: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    bottom: 10,
                  }}
                >
                  <Text style={styles.breakCountText}>{getBreakEndCountForCurrentDate()}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.timeText}>{getBreakEndTime()}</Text>
            </View>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={breakTimesModalVisible}
          onRequestClose={() => setBreakTimesModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row' }}>
                <FontAwesome6 name="mug-saucer" size={26} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle1}>Today's Break Start Times</Text>
              </View>
              <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.5 }} showsVerticalScrollIndicator={false}>
                {isCheckedIn || isCheckedOut ? (
                  activities
                    .filter(activity => {
                      if (activity.type !== 'Break Start') return false;
                      const activityTime = parseTimeString(activity.time);
                      const checkIn = parseTimeString(checkInTime);
                      const checkOut = isCheckedOut ? parseTimeString(checkOutTime) : new Date();
                      return activityTime >= checkIn && activityTime <= checkOut;
                    })
                    .length > 0 ? (
                    activities
                      .filter(activity => {
                        if (activity.type !== 'Break Start') return false;
                        const activityTime = parseTimeString(activity.time);
                        const checkIn = parseTimeString(checkInTime);
                        const checkOut = isCheckedOut ? parseTimeString(checkOutTime) : new Date();
                        return activityTime >= checkIn && activityTime <= checkOut;
                      })
                      .map((activity, index) => (
                        <View key={index} style={styles.breakTimeItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="clock-outline" size={20} color="#2563EB" style={{ marginRight: 8 }} />
                            <Text style={styles.breakTimeText}>
                              {index + 1}. {activity.time}
                            </Text>
                          </View>
                          {activity.reason ? (
                            <Text style={styles.breakReasonText}>Reason: {activity.reason}</Text>
                          ) : null}
                        </View>
                      ))
                  ) : (
                    <Text style={styles.noBreaksText}>No breaks started today.</Text>
                  )
                ) : (
                  <Text style={styles.noBreaksText}>No active check-in session.</Text>
                )}
              </ScrollView>
              <TouchableOpacity
                style={{
                  height: 40,
                  width: '90%',
                  backgroundColor: '#6B7280',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 5,
                  marginTop: 10,
                }}
                onPress={() => setBreakTimesModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={breakEndTimesModalVisible}
          onRequestClose={() => setBreakEndTimesModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row' }}>
                <FontAwesome6 name="mug-saucer" size={26} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle1}>Today's Break End Times</Text>
              </View>
              <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.5 }} showsVerticalScrollIndicator={false}>
                {isCheckedIn || isCheckedOut ? (
                  activities
                    .filter(activity => {
                      if (activity.type !== 'Break End') return false;
                      const activityTime = parseTimeString(activity.time);
                      const checkIn = parseTimeString(checkInTime);
                      const checkOut = isCheckedOut ? parseTimeString(checkOutTime) : new Date();
                      return activityTime >= checkIn && activityTime <= checkOut;
                    })
                    .length > 0 ? (
                    activities
                      .filter(activity => {
                        if (activity.type !== 'Break End') return false;
                        const activityTime = parseTimeString(activity.time);
                        const checkIn = parseTimeString(checkInTime);
                        const checkOut = isCheckedOut ? parseTimeString(checkOutTime) : new Date();
                        return activityTime >= checkIn && activityTime <= checkOut;
                      })
                      .map((activity, index) => (
                        <View key={index} style={styles.breakTimeItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="clock-outline" size={20} color="#2563EB" style={{ marginRight: 8 }} />
                            <Text style={styles.breakTimeText}>
                              {index + 1}. {activity.time}
                            </Text>
                          </View>
                        </View>
                      ))
                  ) : (
                    <Text style={styles.noBreaksText}>No breaks ended today.</Text>
                  )
                ) : (
                  <Text style={styles.noBreaksText}>No active check-in session.</Text>
                )}
              </ScrollView>
              <TouchableOpacity
                style={{
                  height: 40,
                  width: '90%',
                  backgroundColor: '#6B7280',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 5,
                  marginTop: 10,
                }}
                onPress={() => setBreakEndTimesModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityType}>Total Hours</Text>
            <Text style={styles.activityTime}>{calculateTotalHours()}</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityType}>Net Working Hours</Text>
            <Text style={styles.activityTime}>
              {isCheckedOut ? calculateNetWorkingHours() : '00:00:00'}
            </Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityType}>Break Time</Text>
            <Text style={styles.activityTime}>{calculateTotalBreakTime()}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
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
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={checkInModalVisible}
        onRequestClose={() => setCheckInModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 30}
            style={styles.keyboardAvoidingView}
          >
            <View style={[styles.modalContent, { maxHeight: SCREEN_HEIGHT * 0.8 }]}>
              <ScrollView
                contentContainerStyle={[styles.modalScrollContent, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>Check In</Text>
                <Text style={styles.modalHeading}>Pending Task from Yesterday?</Text>
                <TextInput
                  style={styles.textInput1}
                  multiline
                  placeholder="Enter pending tasks from yesterday..."
                  value={paddingtask}
                  onChangeText={setPaddingtask}
                />
                <Text style={styles.modalHeading}>What Tasks Will Be Performed Today?</Text>
                <TextInput
                  style={[styles.textInput1, { marginBottom: 150 }]}
                  multiline
                  placeholder="Enter today's tasks..."
                  value={checkInTasks}
                  onChangeText={setCheckInTasks}
                />
              </ScrollView>
              <View style={styles.stickyButtonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setCheckInModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCheckIn}
                  activeOpacity={0.8}
                  disabled={isCheckInLoading}
                >
                  {isCheckInLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={checkOutModalVisible}
        onRequestClose={() => setCheckOutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 30}
            style={styles.keyboardAvoidingView}
          >
            <View style={[styles.modalContent, { maxHeight: SCREEN_HEIGHT * 0.8 }]}>
              <ScrollView
                contentContainerStyle={[styles.modalScrollContent, { paddingBottom: 240 }]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>Check Out</Text>
                <View>
                  <Text style={styles.modalHeading}>Tasks Done Today</Text>
                  <TextInput
                    style={styles.textInput1}
                    multiline
                    placeholder="List tasks completed today..."
                    value={checkOutNotes}
                    onChangeText={setCheckOutNotes}
                  />
                  <Text style={styles.modalHeading}>Tasks Pending for Tomorrow</Text>
                  <TextInput
                    style={styles.textInput1}
                    multiline
                    placeholder="List tasks pending for tomorrow..."
                    value={checkOutPendingTasks}
                    onChangeText={setCheckOutPendingTasks}
                  />
                  <Text style={styles.modalHeading}>Dependencies</Text>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    placeholder="Dependencies if any"
                    value={Dependencies}
                    onChangeText={setDependencies}
                  />
                  <Text style={styles.modalHeading}>Any Blocker</Text>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    placeholder="Any blockers if any"
                    value={AnyBlocker}
                    onChangeText={setAnyBlocker}
                  />
                  <Text style={styles.modalHeading}>Issue of the Day</Text>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    placeholder="Issue of the day if any"
                    value={Issue}
                    onChangeText={setIssue}
                  />
                </View>
              </ScrollView>
              <View style={styles.stickyButtonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setCheckOutModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCheckOut}
                  disabled={isCheckOutLoading}
                >
                  {isCheckOutLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={breakModalVisible}
        onRequestClose={() => setBreakModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Break</Text>
            <Text style={styles.modalHeading}>Write Break Reason Here</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Break reason here"
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
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
            )}
            <Icon
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={showTwoMinAlert}
        onRequestClose={() => setShowTwoMinAlert(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alert</Text>
            <Text style={styles.customAlertText}>You have reached 2 minutes. Continue or Check-out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.submitButton1}
                onPress={() => {
                  setShowTwoMinAlert(false);
                }}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton1}
                onPress={() => {
                  setShowTwoMinAlert(false);
                  setCheckOutModalVisible(true);
                }}
              >
                <Text style={styles.buttonText}>Check-out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#1E40AF',
    fontWeight: '600',
    fontFamily: 'System',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  defaultProfile: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  defaultProfileText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 15,
    fontFamily: 'System',
  },
  userRole: {
    fontSize: 15,
    color: '#64748B',
    marginLeft: 15,
    fontFamily: 'System',
    marginTop: 2,
  },
  dateText: {
    fontSize: 15,
    color: '#64748B',
    marginLeft: 15,
    marginTop: 6,
    fontWeight: '500',
    fontFamily: 'System',
  },
  attendanceSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1E293B',
    fontFamily: 'System',
  },
  timeCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  timeCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'System',
  },
  breakCountText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'System',
  },
  timeText: {
    fontSize: 18,
    color: '#3B82F6',
    marginTop: 6,
    fontWeight: '600',
    fontFamily: 'System',
  },
  activitySection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'System',
  },
  activityTime: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'System',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  checkInButton: {
    backgroundColor: '#3B82F6',
  },
  checkOutButton: {
    backgroundColor: '#EF4444',
  },
  breakStartButton: {
    backgroundColor: '#F59E0B',
  },
  breakEndButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalContent: {
    width: '95%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1E293B',
    fontFamily: 'System',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalTitle1: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1E293B',
    fontFamily: 'System',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'System',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  textInput1: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    height: 100,
    marginBottom: 12,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'System',
    backgroundColor: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'System',
    backgroundColor: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  stickyButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelButton1: {
    backgroundColor: '#6B7280',
    paddingVertical: 14,
    borderRadius: 16,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton1: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 16,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  customAlertContent: {
    width: '85%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  alertIcon: {
    marginBottom: 12,
  },
  customAlertTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  customAlertText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 20,
  },
  breakTimeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  breakTimeText: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'System',
  },
  breakReasonText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'System',
  },
  noBreaksText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'System',
  },
});

export default HomeScreen;

// Home screen k baad ya wali screen priority pr ha