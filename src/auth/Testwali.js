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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Testwali = ({ navigation }) => {
  const [student, setStudent] = useState(null);
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
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
  const [breakModalVisible, setBreakModalVisible] = useState(false);

  const [checkInTasks, setCheckInTasks] = useState('');
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [checkOutPendingTasks, setCheckOutPendingTasks] = useState('');
  const [Dependencies, setDependencies] = useState('');
  const [AnyBlocker, setAnyBlocker] = useState('');
  const [Issue, setIssue] = useState('');
  const [breakReason, setBreakReason] = useState('');

  const [paddingtask, setPaddingtask] = useState('');

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [isCheckInLoading, setIsCheckInLoading] = useState(false);
  const [isCheckOutLoading, setIsCheckOutLoading] = useState(false);
  const [isBreakLoading, setIsBreakLoading] = useState(false);

  const richTextPending = useRef();
  const richTextToday = useRef();
  const richTextCheckOutNotes = useRef();
  const richTextPendingTasks = useRef();
  const richTextActions = ['bold', 'italic', 'underline', 'unorderedList', 'orderedList'];

  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const showCustomAlert = (type, title, message) => {
    setCustomAlert({ visible: true, type, title, message });
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start(() =>
        setCustomAlert({ visible: false, type: 'success', title: '', message: '' })
      );
    }, 1000);
  };

  const formatDuration = (milliseconds) => {
    if (milliseconds < 0) return '--:--:--';
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return [String(hours).padStart(2, '0'), String(minutes).padStart(2, '0'), String(seconds).padStart(2, '0')].join(':');
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

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
// </-------------- IGNORE -------------->

  const handleCheckOut = async () => {
    const cleanText = (text) => text?.replace(/<[^>]*>/g, '').trim();

    if (!checkOutNotes && !checkOutPendingTasks) {
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
    try {
      setIsCheckOutLoading(true);
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
          checkInTime: checkInTime,
          isCheckedOut: true,
          checkOutTime: formattedTime,
          isOnBreak: false,
          breakStart: breakStart ? breakStart.toISOString() : null,
          breakEnd: breakEnd ? breakEnd.toISOString() : null,
          totalBreakDuration,
          breakDuration,
        })
      );

      await AsyncStorage.setItem('lastCheckInDate', '');

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
      setCheckOutModalVisible(false);
      setCheckOutNotes('');
      setCheckOutPendingTasks('');
      setDependencies('');
      setAnyBlocker('');
      setIssue('');
      showCustomAlert('success', 'Success', 'Checked out successfully!');
    } finally {
      setIsCheckOutLoading(false);
    }
  };

  // </-------------- IGNORE -------------->

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
          // Error handling remains empty as in your original code
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
      console.error('Break start error (outer):', error);
      showCustomAlert('error', 'Error', 'Failed to start break.');
    } finally {
      setIsBreakLoading(false);
    }
  };

  // </-------------- IGNORE -------------->
  const handleBreakEnd = async () => {
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
          // Error handling remains empty as in your original code
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
      console.error('Break end error (outer):', error);
      showCustomAlert('error', 'Error', 'Failed to end break.');
    } finally {
      setIsBreakLoading(false);
    }
  };

  // </-------------- IGNORE -------------->

   const logActivity = async (type, time, reason = '') => {
    const date = new Date().toLocaleDateString();
    const newActivity = { type, time, date, reason };
    const updatedActivities = [newActivity, ...activities];
    setActivities(updatedActivities);
    await AsyncStorage.setItem('activities', JSON.stringify(updatedActivities));
  };

 const fetchAttendance = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      showCustomAlert('error', 'Error', 'No auth token found.');
      return;
    }
    const response = await axios.get('https://geeksnode.online/api/today-summary', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const records = response.data.data || [];
    if (!Array.isArray(records) || records.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records.find((record) => record.date?.includes(today)) || records[0];

    // Existing fields
    const checkIn = todayRecord.check_in_time || todayRecord.check_in || '--:--';
    const checkOut = todayRecord.check_out_time || todayRecord.check_out || '--:--';
    let breakStartStr = '--:--';
    let breakEndStr = '--:--';

    if (Array.isArray(todayRecord.breaks) && todayRecord.breaks.length > 0) {
      const latestBreak = todayRecord.breaks[todayRecord.breaks.length - 1];
      breakStartStr = latestBreak.break_in_time || latestBreak.break_start || '--:--';
      breakEndStr = latestBreak.break_out_time || latestBreak.break_end || '--:--';
    }

    // NEW: Extract task_from_yesterday
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

    // Set states
    setCheckInTime(checkIn);
    setCheckOutTime(checkOut);
    setBreakStart(parsedBreakStart);
    setBreakEnd(parsedBreakEnd);
    setIsCheckedIn(checkIn !== '--:--' && checkOut === '--:--');
    setIsCheckedOut(checkOut !== '--:--');
    setIsOnBreak(!!parsedBreakStart && !parsedBreakEnd);

    // NEW: Set yesterday's pending task
    if (yesterdayPendingTask) {
      setPaddingtask(yesterdayPendingTask);
      // Also save to AsyncStorage for persistence
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

      const storedImage = await AsyncStorage.getItem('profileImageUri');
      if (storedImage) setProfileImageUri(storedImage);

      const savedAttendance = await AsyncStorage.getItem('attendanceState');
      const currentDate = new Date().toDateString();
      const savedDate = await AsyncStorage.getItem('lastCheckInDate');


      if (savedDate !== currentDate) {
      await resetAttendanceState();
      return;
    }
      if (savedAttendance) {
      const state = JSON.parse(savedAttendance);
      setIsCheckedIn(state.isCheckedIn || false);
      setCheckInTime(state.checkInTime || '--:--');
      setIsCheckedOut(state.isCheckedOut || false);
      setCheckOutTime(state.checkOutTime || '--:--');
      setIsOnBreak(state.isOnBreak || false);
      setBreakStart(state.breakStart ? new Date(state.breakStart) : null);
      setBreakEnd(state.breakEnd ? new Date(state.breakEnd) : null);
      setTotalBreakDuration(state.totalBreakDuration || 0);
      setBreakDuration(state.breakDuration || '00:00:00');
    }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
const resetAttendanceState = async () => {
  setIsCheckedIn(false);
  setCheckInTime('--:--');
  setIsCheckedOut(false);
  setCheckOutTime('--:--');
  setIsOnBreak(false);
  setBreakStart(null);
  setBreakEnd(null);
  setTotalBreakDuration(0);
  setBreakDuration('00:00:00');

  await AsyncStorage.removeItem('attendanceState');
  await AsyncStorage.removeItem('lastCheckInDate');
};
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await resetAttendanceState();
      await loadData();
      await fetchAttendance();
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const onRefresh = async () => {
  setRefreshing(true);
  await resetAttendanceState();
  await loadData();
  await fetchAttendance();
  setRefreshing(false);
};

  if (loading || refreshing) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}


  return (
    <View style={styles.mainContainer}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.defaultProfile}>
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
              </View>
            )}
            <View>
              <Text style={styles.userName}>{student?.name || ''}</Text>
              <Text style={styles.userName}>
                {student?.roles && student.roles.length > 0 ? student.roles[0].name : ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.attendanceSection}>
          <Text style={styles.sectionTitle}>Today Attendance</Text>
          <View style={styles.timeCardContainer}>
            <View style={styles.timeCard}>
              <Text style={styles.timeCardTitle}>Check In</Text>
              <Text style={styles.timeText}>
  {checkInTime && checkInTime !== '--:--' ? checkInTime : '--:--'}
</Text>
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.timeCardTitle}>Check Out</Text>
              <Text style={styles.timeText}>{checkOutTime || '--:--'}</Text>
            </View>
          </View>
          <View style={styles.timeCardContainer}>
            <View style={styles.timeCard}>
              <Text style={styles.timeCardTitle}>Break's Start</Text>
              <Text style={styles.timeText}>{getBreakStartTime()}</Text>
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.timeCardTitle}>Break's End</Text>
              <Text style={styles.timeText}>{getBreakEndTime()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
{/* Check In / Check Out Button */}
<TouchableOpacity
  style={[
    styles.actionButton,
    isCheckedIn ? styles.checkOutButton : styles.checkInButton,
    // Make button dull if user is currently on break
    isOnBreak && { opacity: 0.5 },
  ]}
  onPress={() => {
    if (isCheckedIn) setCheckOutModalVisible(true);
    else setCheckInModalVisible(true);
  }}
  disabled={isOnBreak} // prevent checkout while on break
>
  <Text style={styles.actionButtonText}>
    {isCheckedIn ? 'Check Out' : 'Check In'}
  </Text>
</TouchableOpacity>

{/* Start / End Break Button */}
<TouchableOpacity
  style={[
    styles.actionButton,
    isOnBreak ? styles.breakEndButton : styles.breakStartButton,
    // Make button dull if not checked in or already checked out
    (!isCheckedIn || isCheckedOut) && { opacity: 0.5 },
  ]}
  onPress={isOnBreak ? handleBreakEnd : () => setBreakModalVisible(true)}
  disabled={!isCheckedIn || isCheckedOut} // disable if not checked in or already checked out
>
  <Text style={styles.actionButtonText}>
    {isOnBreak ? 'End Break' : 'Start Break'}
  </Text>
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
                <RichToolbar
                  editor={richTextPending}
                  selectedIconTint="#3B82F6"
                  iconTint="#16181bff"
                  style={{ backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 12 }}
                  actions={richTextActions}
                  iconMap={{
                    bold: ({ tintColor }) => <Text style={[{ color: tintColor, fontSize: 18, fontWeight: 'bold' }]}>B</Text>,
                    italic: ({ tintColor }) => <Text><MaterialCommunityIcons
                      name="format-italic"
                      size={20}
                      color={tintColor}
                    /></Text>,
                    underline: ({ tintColor }) => <Text style={[{ color: tintColor, fontSize: 18, textDecorationLine: 'underline' }]}>U</Text>,
                    unorderedList: ({ tintColor }) => <Text><MaterialCommunityIcons
                      name="format-list-bulleted"
                      size={20}
                      color={tintColor}
                    /></Text>,
                    orderedList: ({ tintColor }) => <Text><MaterialCommunityIcons
                      name="format-list-numbered"
                      size={20}
                      color={tintColor}
                    /></Text>,
                  }}
                />

                <View style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                  <RichEditor
                    ref={richTextPending}
                    initialContentHTML={paddingtask}
                    placeholder="Enter pending tasks from yesterday..."
                    onChange={(text) => setPaddingtask(text)}
                    editorStyle={{
                      backgroundColor: 'white',
                      color: '#1E293B',
                      placeholderColor: '#9CA3AF',
                      contentCSSText: 'font-size: 16px; padding: 12px; min-height: 100px;',
                    }}
                  />
                </View>
                <Text style={styles.modalHeading}>What Tasks Will Be Performed Today?</Text>
                <RichToolbar
                  editor={richTextToday}
                  selectedIconTint="#3B82F6"
                  iconTint="#16181bff"
                  style={{ backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 12 }}
                  actions={richTextActions}
                  iconMap={{
                    bold: ({ tintColor }) => <Text style={[{ color: tintColor, fontSize: 18, fontWeight: 'bold' }]}>B</Text>,
                    italic: ({ tintColor }) => <Text><MaterialCommunityIcons
                      name="format-italic"
                      size={20}
                      color={tintColor}
                    /></Text>,
                    underline: ({ tintColor }) => <Text style={[{ color: tintColor, fontSize: 18, textDecorationLine: 'underline' }]}>U</Text>,
                    unorderedList: ({ tintColor }) => <Text><MaterialCommunityIcons
                      name="format-list-bulleted"
                      size={20}
                      color={tintColor}
                    /></Text>,
                    orderedList: ({ tintColor }) => <Text><MaterialCommunityIcons
                      name="format-list-numbered"
                      size={20}
                      color={tintColor}
                    /></Text>,
                  }}
                />
                <View style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                  <RichEditor
                    ref={richTextToday}
                    initialContentHTML={checkInTasks}
                    placeholder="Enter today's tasks..."
                    onChange={(text) => setCheckInTasks(text)}
                    editorStyle={{
                      backgroundColor: 'white',
                      color: '#1E293B',
                      placeholderColor: '#9CA3AF',
                      contentCSSText: 'font-size: 16px; padding: 12px; min-height: 150px;',
                      marginBottom: 100
                    }}
                  />
                </View>
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
                contentContainerStyle={[styles.modalScrollContent, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>Check Out</Text>
                <View>
                  <Text style={styles.modalHeading}>Tasks Done Today</Text>
                  <RichToolbar
                    editor={richTextCheckOutNotes}
                    selectedIconTint="#3B82F6"
                    iconTint="#16181bff"
                    style={{ backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 12, justifyContent: 'space-around', }}
                    actions={richTextActions}
                    iconMap={{
                      bold: ({ tintColor }) => <Text style={[{ color: tintColor, fontSize: 18, fontWeight: 'bold' }]}>B</Text>,
                      italic: ({ tintColor }) => <Text><MaterialCommunityIcons
                        name="format-italic"
                        size={20}
                        color={tintColor}
                      /></Text>,
                      underline: ({ tintColor }) => <Text style={[{ color: tintColor, fontSize: 18, textDecorationLine: 'underline' }]}>U</Text>,
                      unorderedList: ({ tintColor }) => <Text><MaterialCommunityIcons
                        name="format-list-bulleted"
                        size={20}
                        color={tintColor}
                      /></Text>,

                      orderedList: ({ tintColor }) => <Text><MaterialCommunityIcons
                        name="format-list-numbered"
                        size={20}
                        color={tintColor}
                      /></Text>,
                    }}
                  />
                  <View style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, marginBottom: 20, overflow: 'hidden' }}>
                    <RichEditor
                      ref={richTextCheckOutNotes}
                      initialContentHTML={checkOutNotes}
                      placeholder="List tasks completed today..."
                      onChange={(text) => setCheckOutNotes(text)}
                      editorStyle={{
                        backgroundColor: 'white',
                        color: '#1E293B',
                        placeholderColor: '#9CA3AF',
                        contentCSSText: 'font-size: 16px; padding: 12px; min-height: 120px;',
                      }}
                    />
                  </View>
                  <Text style={styles.modalHeading}>Tasks Pending for Tomorrow</Text>
                  <RichToolbar
                    editor={richTextPendingTasks}
                    selectedIconTint="#3B82F6"
                    iconTint="#16181bff"
                    style={{ backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 12 }}
                    actions={richTextActions}
                    iconMap={{
                      bold: ({ tintColor }) => <Text style={[{ color: tintColor, fontSize: 18, fontWeight: 'bold' }]}>B</Text>,
                      italic: ({ tintColor }) => <Text><MaterialCommunityIcons
                        name="format-italic"
                        size={20}
                        color={tintColor}
                      /></Text>,
                      underline: ({ tintColor }) => <Text style={[{ color: tintColor, fontSize: 18, textDecorationLine: 'underline' }]}>U</Text>,
                      unorderedList: ({ tintColor }) => <Text><MaterialCommunityIcons
                        name="format-list-bulleted"
                        size={20}
                        color={tintColor}
                      /></Text>,
                      orderedList: ({ tintColor }) => <Text><MaterialCommunityIcons
                        name="format-list-numbered"
                        size={20}
                        color={tintColor}
                      /></Text>,
                    }}
                  />

                  <View style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, marginBottom: 20, overflow: 'hidden' }}>
                    <RichEditor
                      ref={richTextPendingTasks}
                      initialContentHTML={checkOutPendingTasks}
                      placeholder="List tasks pending for tomorrow..."
                      onChange={(text) => setCheckOutPendingTasks(text)}
                      editorStyle={{
                        backgroundColor: 'white',
                        color: '#1E293B',
                        placeholderColor: '#9CA3AF',
                        contentCSSText: 'font-size: 16px; padding: 12px; min-height: 120px;',
                      }}
                    />
                  </View>
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
          setCustomAlert({ visible: false, type: 'success', title: '', message: '' })
        }
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.customAlertContent,
              {
                backgroundColor: customAlert.type === 'success' ? '#E6FFFA' : '#FFEBEB',
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <MaterialCommunityIcons
              name={customAlert.type === 'success' ? 'check-circle' : 'alert-circle'}
              size={40}
              color={customAlert.type === 'success' ? '#10B981' : '#EF4444'}
              style={styles.customAlertIcon}
            />
            <Text
              style={[
                styles.customAlertTitle,
                { color: customAlert.type === 'success' ? '#10B981' : '#EF4444' },
              ]}
            >
              {customAlert.title}
            </Text>
            <Text style={styles.customAlertText}>{customAlert.message}</Text>
          </Animated.View>
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
    flex: 1, backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 10, fontSize: 18, color: '#1E40AF', fontWeight: '600', fontFamily: 'System',
  },
  header: {
    padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', elevation: 4,
  },
  profileSection: {
    flexDirection: 'row', alignItems: 'center',
  },
  profileImage: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#3B82F6', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5,
  },
  defaultProfile: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5,
  },
  defaultProfileText: {
    color: '#FFFFFF', fontSize: 22, fontWeight: '700', textTransform: 'uppercase',
  },
  userName: {
    fontSize: 20, fontWeight: '700', color: '#1E293B', marginLeft: 15, fontFamily: 'System',
  },
  attendanceSection: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#FFFFFF', marginTop: 10,
    borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#1E293B', fontFamily: 'System',
  },
  timeCardContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10,
  },
  timeCard: {
    flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 15, marginHorizontal: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  timeCardTitle: {
    fontSize: 14, fontWeight: '600', color: '#374151', fontFamily: 'System',
  },
  timeText: {
    fontSize: 18, color: '#3B82F6', marginTop: 6, fontWeight: '600', fontFamily: 'System',
  },
  buttonContainer: {
    flexDirection: 'row', padding: 20, paddingBottom: 30,
  },
  actionButton: {
    flex: 1, paddingVertical: 12, borderRadius: 10, marginHorizontal: 5, alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
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
    color: '#FFFFFF', fontSize: 16, fontWeight: '600', fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalContent: {
    width: '95%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 10,
  },
  modalTitle: {
    fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#1E293B', fontFamily: 'System', textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  modalHeading: {
    fontSize: 16, fontWeight: '600', color: '#1E293B', fontFamily: 'System', marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.05)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1,
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
  submitButton: {
    backgroundColor: '#3B82F6', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, flex: 1, marginLeft: 10,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF', fontWeight: '700', fontSize: 18, fontFamily: 'System', textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1,
  },
  customAlertContent: {
    width: '80%', maxWidth: 300, borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10,
  },
  customAlertIcon: {
    marginBottom: 15,
  },
  customAlertTitle: {
    fontSize: 22, fontWeight: '700', fontFamily: 'System', marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  customAlertText: {
    fontSize: 16, color: '#374151', fontFamily: 'System', textAlign: 'center',
  },
});
export default Testwali;
