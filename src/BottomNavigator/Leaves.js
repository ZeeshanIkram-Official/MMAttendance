// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   useColorScheme,
//   ActivityIndicator,
//   RefreshControl,
//   Modal,
// } from 'react-native';
// import Feather from 'react-native-vector-icons/Feather';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const Leaves = ({ navigation }) => {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';

//   const [report, setReport] = useState(null);
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');
//   const [selectedDay, setSelectedDay] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const theme = {
//     boxBg: isDark ? '#1E1E1E' : '#F3F4F6',
//     text: isDark ? '#fff' : '#1F2937',
//     subText: isDark ? '#aaa' : '#6B7280',
//     background: isDark ? '#000' : '#fff',
//     border: isDark ? '#333' : '#EAEAEA',
//     shadow: isDark ? '#000' : '#ccc',
//   };

//   const fetchAttendance = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem('authToken');
//       if (!token) {
//         setError('No auth token found.');
//         setLoading(false);
//         return;
//       }

//       const response = await axios.get(
//         'https://stagging.mightymediatech.com/api/my-attendance-report',
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             Accept: 'application/json',
//           },
//         }
//       );

//       const fetchedData = response.data.data;
//       if (!fetchedData) {
//         setError('No report found.');
//         setLoading(false);
//         return;
//       }

//       setReport(fetchedData);
//       setData(fetchedData);
//       setError('');
//       setCurrentPage(1);
//     } catch (err) {
//       console.log('Error:', err.message);
//       setError('Failed to fetch report.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, []);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchAttendance();
//   }, []);

//   const openDetails = (day) => {
//     setSelectedDay(day);
//     setModalVisible(true);
//   };

//   const totalPages = Math.ceil((data?.days?.length || 0) / itemsPerPage);
//   const paginatedDays = data?.days?.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const nextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const prevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   if (loading || refreshing) {
//     return (
//       <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
//         <ActivityIndicator size="large" color="#1d74ff" />
//         <Text style={styles.loadingText}>Loading report...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       <View
//         style={[
//           styles.headerContainer,
//           { backgroundColor: theme.boxBg, shadowColor: theme.shadow },
//         ]}
//       >
//         <Image source={require('../assets/mmtlogo.png')} style={{ width: 250, height: 150 }} />
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#1d74ff']}
//             tintColor="#1d74ff"
//             progressBackgroundColor={isDark ? theme.background : '#ffffff'}
//           />
//         }
//         contentContainerStyle={{ paddingBottom: 20 }}
//       >

//         <View style={styles.headerRow}>
//           <Text style={[styles.headerText, { color: theme.text }]}>Employee Report</Text>
//           <TouchableOpacity onPress={() => navigation.navigate('ApplyLeaveForm')}>
//             <Feather name="plus-square" size={24} color="#1d74ff" />
//           </TouchableOpacity>
//         </View>

//         {error ? (
//           <Text style={styles.errorText}>{error}</Text>
//         ) : (
//           <View style={styles.boxContainer}>
//             <View
//               style={[
//                 styles.box,
//                 {
//                   backgroundColor: theme.boxBg,
//                   borderColor: '#9CD48A',
//                   shadowColor: theme.shadow,
//                 },
//               ]}
//             >
//               <View style={[styles.innerCorner, { borderTopColor: '#9CD48A' }]} />
//               <Feather name="check-circle" size={18} color="#fff" style={styles.cornerIcon} />
//               <Text style={[styles.boxTitle, { color: theme.subText, marginLeft: 20 }]}>
//                 Present Days
//               </Text>
//               <Text style={[styles.boxValue, { color: '#9CD48A' }]}>{report?.summary?.present_days ?? 0}</Text>
//             </View>

//             <View
//               style={[
//                 styles.box,
//                 {
//                   backgroundColor: theme.boxBg,
//                   borderColor: '#4CC9B0',
//                   shadowColor: theme.shadow,
//                 },
//               ]}
//             >
//               <View style={[styles.innerCorner, { borderTopColor: '#4CC9B0' }]} />
//               <Feather name="calendar" size={18} color="#fff" style={styles.cornerIcon} />
//               <Text style={[styles.boxTitle, { color: theme.subText, marginLeft: 20 }]}>Leaves</Text>
//               <Text style={[styles.boxValue, { color: '#4CC9B0' }]}>{report?.summary?.leave_days ?? 0}</Text>
//             </View>

//             <View
//               style={[
//                 styles.box,
//                 {
//                   backgroundColor: theme.boxBg,
//                   borderColor: '#4C9AFF',
//                   shadowColor: theme.shadow,
//                 },
//               ]}
//             >
//               <View style={[styles.innerCorner, { borderTopColor: '#4C9AFF' }]} />
//               <Feather name="clock" size={18} color="#fff" style={styles.cornerIcon} />
//               <Text style={[styles.boxTitle, { color: theme.subText, marginLeft: 20 }]}>Holidays</Text>
//               <Text style={[styles.boxValue, { color: '#4C9AFF' }]}>{report?.summary?.holidays ?? 0}</Text>
//             </View>

//             <View
//               style={[
//                 styles.box,
//                 {
//                   backgroundColor: theme.boxBg,
//                   borderColor: '#F56C6C',
//                   shadowColor: theme.shadow,
//                 },
//               ]}
//             >
//               <View style={[styles.innerCorner, { borderTopColor: '#F56C6C' }]} />
//               <Feather name="x-circle" size={18} color="#fff" style={styles.cornerIcon} />
//               <Text style={[styles.boxTitle, { color: theme.subText, marginLeft: 20 }]}>Absent Days</Text>
//               <Text style={[styles.boxValue, { color: '#F56C6C' }]}>{report?.summary?.absent_days ?? 0}</Text>
//             </View>
//           </View>
//         )}

//         <Text style={[styles.sectionHeader, { color: theme.text }]}>Attendance Report</Text>
//         <View style={[styles.section, { backgroundColor: theme.boxBg }]}>

//           {paginatedDays?.length > 0 ? (
//             paginatedDays.map((day) => (
//               <TouchableOpacity
//                 key={day.id || day.formatted_date}
//                 style={[styles.dateCard, { backgroundColor: theme.background }]}
//                 onPress={() => openDetails(day)}
//                 activeOpacity={0.9}
//               >
//                 <Text style={styles.dateText}>{day.formatted_date}</Text>

//                 <View
//                   style={[
//                     styles.statusBadge,
//                     day.status_label === 'Absent' && { backgroundColor: '#FECACA', borderColor: '#FECACA' },
//                     day.status_label === 'Holiday' && { backgroundColor: '#BFDBFE', borderColor: '#BFDBFE' },
//                     day.status_label === 'Leave' && { backgroundColor: '#b9fcefff', borderColor: '#b9fcefff' },
//                     day.status_label === 'Present' && { backgroundColor: '#b1fea4ff', borderColor: '#b1fea4ff' },
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.statusBadgeText,
//                       day.status_label === 'Absent' && { color: '#7F1D1D' },
//                       day.status_label === 'Holiday' && { color: '#1D4ED8' },
//                       day.status_label === 'Leave' && { color: '#4CC9B0' },
//                       day.status_label === 'Present' && { color: '#166534' },
//                     ]}
//                   >
//                     {day.status_label}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             ))
//           ) : (
//             <Text style={styles.noDataText}>No attendance records available.</Text>
//           )}

//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "center",
//               alignItems: "center",
//               marginTop: 20,
//             }}
//           >
//             <TouchableOpacity
//               activeOpacity={0.7}
//               disabled={currentPage === 1}
//               onPress={prevPage}
//               style={{
//                 width: 30,
//                 height: 30,
//                 borderRadius: 10,
//                 marginHorizontal: 3,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 backgroundColor: currentPage === 1 ? "#E5E7EB" : "#E5E7EB",
//               }}
//             >
//               <Feather name="chevron-left" size={18} color="#1d74ff" />
//             </TouchableOpacity>

//             {Array.from({ length: totalPages }, (_, index) => (
//               <TouchableOpacity
//                 activeOpacity={0.7}
//                 key={index + 1}
//                 onPress={() => setCurrentPage(index + 1)}
//                 style={{
//                   width: 30,
//                   height: 30,
//                   borderRadius: 10,
//                   marginHorizontal: 3,
//                   justifyContent: "center",
//                   alignItems: "center",
//                   backgroundColor: currentPage === index + 1 ? "#1d74ff" : "#E5E7EB",
//                   borderRadius: currentPage === index + 1 ? 10 : 20,
//                 }}
//               >
//                 <Text
//                   style={{
//                     color: currentPage === index + 1 ? "#fff" : "#000",
//                     fontWeight: "600",
//                   }}
//                 >
//                   {index + 1}
//                 </Text>
//               </TouchableOpacity>
//             ))}

//             <TouchableOpacity
//               activeOpacity={0.7}
//               disabled={currentPage === totalPages}
//               onPress={nextPage}
//               style={{
//                 width: 30,
//                 height: 30,
//                 borderRadius: 10,
//                 marginHorizontal: 3,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 backgroundColor: currentPage === totalPages ? "#E5E7EB" : "#E5E7EB",
//               }}
//             >
//               <Feather name="chevron-right" size={18} color="#1d74ff" />

//             </TouchableOpacity>
//           </View>


//         </View>
//       </ScrollView>

//       <Modal visible={modalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Attendance Details</Text>
//             </View>

//             {selectedDay && (
//               <View style={styles.modalContent}>
//                 <View style={styles.modalRow}>
//                   <Feather name="calendar" size={18} color="#4F46E5" style={{ marginRight: 10 }} />
//                   <Text style={styles.modalItem}>Date: {selectedDay.formatted_date}</Text>
//                 </View>

//                 <View style={styles.modalRow}>
//                   <Feather name="info" size={18} color="#F59E0B" style={{ marginRight: 10 }} />
//                   <Text style={styles.modalItem}>Status: {selectedDay.status_label}</Text>
//                 </View>

//                 <View style={styles.modalRow}>
//                   <Feather name="calendar" size={18} color="#6366F1" style={{ marginRight: 10 }} />
//                   <Text style={styles.modalItem}>Day: {selectedDay.day_name}</Text>
//                 </View>

//                 <View style={styles.modalRow}>
//                   <Feather name="clock" size={18} color="#10B981" style={{ marginRight: 10 }} />
//                   <Text style={styles.modalItem}>Working Hours: {selectedDay.working_hours}</Text>
//                 </View>

//                 <View style={styles.modalRow}>
//                   <Feather name="coffee" size={18} color="#FBBF24" style={{ marginRight: 10 }} />
//                   <Text style={styles.modalItem}>Break Hours: {selectedDay.break_hours}</Text>
//                 </View>

//                 <View style={styles.modalRow}>
//                   <Feather name="map-pin" size={18} color="#EF4444" style={{ marginRight: 10 }} />
//                   <Text style={styles.modalItem}>Tracking Hours: {selectedDay.tracking_hours}</Text>
//                 </View>
//               </View>
//             )}

//             <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
//               <Text style={styles.closeBtnText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   headerContainer: { height: 100, alignItems: 'center', justifyContent: 'center', elevation: 4, marginBottom: 10 },
//   headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
//   headerText: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
//   boxContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
//   box: { width: '48%', borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 12, elevation: 2, overflow: 'hidden' },
//   innerCorner: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderTopWidth: 55, borderRightWidth: 55, borderTopColor: '#4C9AFF', borderRightColor: 'transparent', borderTopLeftRadius: 6 },
//   cornerIcon: { position: 'absolute', top: 10, left: 10, zIndex: 2 },
//   boxTitle: { fontSize: 14, textAlign: 'center' },
//   boxValue: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   loadingText: { marginTop: 10, fontSize: 18, color: '#1d74ff' },
//   errorText: { color: '#DC2626', fontSize: 16, textAlign: 'center', marginTop: 20 },
//   sectionHeader: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginVertical: 20 },
//   section: { marginHorizontal: 15, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 10, elevation: 2 },
//   dateCard: { marginVertical: 6, padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
//   dateText: { fontSize: 16, fontWeight: '600', color: '#1d74ff' },
//   statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
//   statusBadgeText: { fontSize: 14, fontWeight: '600' },
//   noDataText: { textAlign: 'center', fontSize: 16, color: '#6B7280', padding: 10 },
//   modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
//   modalBox: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 15, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
//   modalHeader: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 10, marginBottom: 15 },
//   modalTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
//   modalContent: { marginBottom: 15 },
//   modalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   modalItem: { fontSize: 16, color: '#374151' },
//   closeBtn: { marginTop: 10, backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 12, alignItems: 'center', elevation: 5 },
//   closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
// });

// export default Leaves;







import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Modal,
  Pressable,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import LottieView from 'lottie-react-native';

const Leaves = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isConnected, setIsConnected] = useState(true)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const theme = {
    boxBg: isDark ? '#1E1E1E' : '#F3F4F6',
    text: isDark ? '#fff' : '#1F2937',
    subText: isDark ? '#aaa' : '#6B7280',
    background: isDark ? '#000' : '#fff',
    border: isDark ? '#333' : '#EAEAEA',
    shadow: isDark ? '#000' : '#ccc',
  };

  const minDate = user?.joining_date ? new Date(user.joining_date) : new Date(2021, 0, 1);

  const onSelectFrom = (event, selectedDate) => {
    setShowFromPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateFrom(selectedDate.toISOString().split('T')[0]);
      setCurrentPage(1);
    }
  };

  const onSelectTo = (event, selectedDate) => {
    setShowToPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateTo(selectedDate.toISOString().split('T')[0]);
      setCurrentPage(1);
    }
  };

  const fetchAttendance = async () => {
    if (!dateFrom || !dateTo) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setCurrentPage(1);
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.get(
        `https://stagging.mightymediatech.com/api/my-attendance-report?date_from=${dateFrom}&date_to=${dateTo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      setReport(response.data.data);
    } catch (err) {
      setError('Failed to load attendance report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (day) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDay(null);
  };

  const totalPages = Math.ceil((report?.days?.length || 0) / itemsPerPage);
  const paginatedDays = report?.days?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Failed to load user', err);
      }
    };
    loadUser();
  }, []);

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: theme.boxBg, shadowColor: theme.shadow },
        ]}
      >
        <Image source={require('../assets/mmtlogo.png')} style={{ width: 250, height: 150 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>

        {/* {user && (
          <Text style={[styles.userName, { color: theme.text }]}>
            {user.joining_date || 'Employee'}
          </Text>
        )} */}
        <Text style={[styles.title, { color: theme.text }]}>Employee Report</Text>



        <View style={styles.summaryRow}>
          <View style={[styles.box, { backgroundColor: theme.boxBg, borderColor: '#9CD48A' }]}>
            <View style={[styles.innerCorner, { borderTopColor: '#9CD48A' }]} />
            <Feather name="check-circle" size={18} color="#fff" style={styles.cornerIcon} />
            <Text style={[styles.boxTitle, { color: theme.subText }]}>Present Days</Text>
            <Text style={[styles.boxValue, { color: '#9CD48A' }]}>{report?.summary?.present_days || 0}</Text>
          </View>

          <View style={[styles.box, { backgroundColor: theme.boxBg, borderColor: '#4CC9B0' }]}>
            <View style={[styles.innerCorner, { borderTopColor: '#4CC9B0' }]} />
            <Feather name="calendar" size={18} color="#fff" style={styles.cornerIcon} />
            <Text style={[styles.boxTitle, { color: theme.subText }]}>Leaves</Text>
            <Text style={[styles.boxValue, { color: '#4CC9B0' }]}>{report?.summary?.leave_days || 0}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.box, { backgroundColor: theme.boxBg, borderColor: '#4C9AFF' }]}>
            <View style={[styles.innerCorner, { borderTopColor: '#4C9AFF' }]} />
            <Feather name="sun" size={18} color="#fff" style={styles.cornerIcon} />
            <Text style={[styles.boxTitle, { color: theme.subText }]}>Holidays</Text>
            <Text style={[styles.boxValue, { color: '#4C9AFF' }]}>{report?.summary?.holidays || 0}</Text>
          </View>

          <View style={[styles.box, { backgroundColor: theme.boxBg, borderColor: '#F56C6C' }]}>
            <View style={[styles.innerCorner, { borderTopColor: '#F56C6C' }]} />
            <Feather name="x-circle" size={18} color="#fff" style={styles.cornerIcon} />
            <Text style={[styles.boxTitle, { color: theme.subText }]}>Absent Days</Text>
            <Text style={[styles.boxValue, { color: '#F56C6C' }]}>{report?.summary?.absent_days || 0}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Date Range</Text>

        <TouchableOpacity style={styles.dateInput} activeOpacity={0.7} onPress={() => setShowFromPicker(true)}>
          <Text style={styles.dateText}>{dateFrom || 'Select Start Date'}</Text>
          <Feather name="calendar" size={20} color="#666" />
        </TouchableOpacity>
        {showFromPicker && (
          <DateTimePicker
            value={dateFrom ? new Date(dateFrom) : minDate}
            mode="date"
            display="default"
            onChange={onSelectFrom}
            minimumDate={minDate}
          />
        )}

        <TouchableOpacity style={styles.dateInput} activeOpacity={0.7} onPress={() => setShowToPicker(true)}>
          <Text style={styles.dateText}>{dateTo || 'Select End Date'}</Text>
          <Feather name="calendar" size={20} color="#666" />
        </TouchableOpacity>
        {showToPicker && (
          <DateTimePicker
            value={dateTo ? new Date(dateTo) : new Date()}
            mode="date"
            display="default"
            onChange={onSelectTo}
            minimumDate={new Date(2021, 0, 1)}
          />
        )}

        <TouchableOpacity style={styles.fetchButton} activeOpacity={0.7} onPress={fetchAttendance} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.fetchButtonText}>Get Report</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Attendance Report</Text>

        <View style={[styles.listContainer, { backgroundColor: theme.boxBg }]}>
          {paginatedDays?.length > 0 ? (
            paginatedDays.map((day, index) => (
              <TouchableOpacity key={index} onPress={() => openModal(day)} activeOpacity={0.9}>
                <View style={[styles.attendanceRow, { backgroundColor: theme.background }]}>
                  <Text style={[styles.attendanceDate, { color: '#1d74ff' }]}>{day.formatted_date}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      day.status_label === 'Present' && { backgroundColor: '#b1fea4ff' },
                      day.status_label === 'Leave' && { backgroundColor: '#b9fcefff' },
                      day.status_label === 'Holiday' && { backgroundColor: '#BFDBFE' },
                      day.status_label === 'Absent' && { backgroundColor: '#FECACA' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        day.status_label === 'Present' && { color: '#166534' },
                        day.status_label === 'Leave' && { color: '#0D9488' },
                        day.status_label === 'Holiday' && { color: '#1D4ED8' },
                        day.status_label === 'Absent' && { color: '#7F1D1D' },
                      ]}
                    >
                      {day.status_label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noData, { color: theme.subText }]}>
              {report ? 'No records found for selected dates.' : 'Please select date range and fetch report.'}
            </Text>
          )}

          {totalPages > 1 && (
            <View style={styles.paginationWrapper}>
              <TouchableOpacity
                onPress={prevPage}
                disabled={currentPage === 1}
                style={styles.pageBtn}
              >
                <Feather name="chevron-left" size={20} color={currentPage === 1 ? "#999" : "#1d74ff"} />
              </TouchableOpacity>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.paginationContainer}
              >


                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <TouchableOpacity
                    key={page}
                    onPress={() => setCurrentPage(page)}
                    style={[
                      styles.pageNumber,
                      currentPage === page && styles.activePage,
                      { borderRadius: currentPage === page ? 10 : 20 },
                    ]}
                  >
                    <Text style={[styles.pageText, currentPage === page && styles.activePageText]}>
                      {page}
                    </Text>
                  </TouchableOpacity>
                ))}


              </ScrollView>
              <TouchableOpacity
                onPress={nextPage}
                disabled={currentPage === totalPages}
                style={styles.pageBtn}
              >
                <Feather name="chevron-right" size={20} color={currentPage === totalPages ? "#999" : "#1d74ff"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Attendance Details</Text>

            {selectedDay && (
              <>
                <View style={styles.detailRow}>
                  <Feather name="calendar" size={22} color="#6B7280" />
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{selectedDay.formatted_date}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="info" size={22} color="#F59E0B" />
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, {
                    fontWeight: 'bold', color:
                      selectedDay.status_label === 'Present' ? '#166534' :
                        selectedDay.status_label === 'Leave' ? '#0D9488' :
                          selectedDay.status_label === 'Holiday' ? '#1D4ED8' : '#7F1D1D'
                  }]}>
                    {selectedDay.status_label}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="clock" size={22} color="#10B981" />
                  <Text style={styles.detailLabel}>Day:</Text>
                  <Text style={styles.detailValue}>{selectedDay.day_name || 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="briefcase" size={22} color="#6366F1" />
                  <Text style={styles.detailLabel}>Working Hours:</Text>
                  <Text style={styles.detailValue}>{selectedDay.working_hours || '0h 0min'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="coffee" size={22} color="#F59E0B" />
                  <Text style={styles.detailLabel}>Break Hours:</Text>
                  <Text style={styles.detailValue}>{selectedDay.break_hours || '0h 0min'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="map-pin" size={22} color="#EF4444" />
                  <Text style={styles.detailLabel}>Tracking Hours:</Text>
                  <Text style={styles.detailValue}>{selectedDay.tracking_hours || '0h 0min'}</Text>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};




const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { height: 100, alignItems: 'center', justifyContent: 'center', elevation: 4, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 16, marginTop: 16, marginBottom: 10, },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 },
  box: { width: '48%', borderWidth: 1, borderRadius: 10, padding: 16, elevation: 3, overflow: 'hidden' },
  innerCorner: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderTopWidth: 55, borderRightWidth: 55, borderTopColor: '#4C9AFF', borderRightColor: 'transparent' },
  cornerIcon: { position: 'absolute', top: 10, left: 10, zIndex: 2 },
  boxTitle: { fontSize: 14, textAlign: 'center', marginTop: 10 },
  boxValue: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, alignSelf: 'center' },
  dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 16, marginHorizontal: 16, borderRadius: 10, marginBottom: 12 },
  dateText: { fontSize: 16, color: '#374151' },
  fetchButton: { backgroundColor: '#4F46E5', padding: 16, marginHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  fetchButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  errorText: { color: '#DC2626', textAlign: 'center', marginTop: 10, paddingHorizontal: 16 },
  listContainer: { marginHorizontal: 15, marginTop: 10, paddingVertical: 10, elevation: 2, paddingHorizontal: 10, borderRadius: 12 },
  attendanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2 },
  attendanceDate: { fontSize: 16, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusBadgeText: { fontWeight: 'bold', fontSize: 14 },
  noData: { textAlign: 'center', fontSize: 16, marginTop: 20, fontStyle: 'italic' },
  paginationWrapper: { marginTop: 20, marginHorizontal: 6, flexDirection: 'row' },
  paginationContainer: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center',  // paddingVertical: 10,
  },
  pageBtn: {
    width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5E7EB',
    marginHorizontal: 6,
  },
  disabledBtn: {
    backgroundColor: '#F3F4F6',
  },
  pageNumber: {
    width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#E5E7EB', marginHorizontal: 6,
  },
  activePage: {
    backgroundColor: '#1d74ff',
  },
  pageText: {
    color: '#000', fontWeight: '600', fontSize: 15,
  },
  activePageText: {
    color: '#fff',
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '88%', backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#111827' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  detailLabel: { fontSize: 16, color: '#4B5563', marginLeft: 14, flex: 1 },
  detailValue: { fontSize: 16, color: '#111827', fontWeight: '600' },
  closeModalButton: { marginTop: 24, backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  closeModalButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default Leaves;