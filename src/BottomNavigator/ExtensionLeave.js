import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Leaves = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [report, setReport] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError('No auth token found.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'https://stagging.mightymediatech.com/api/my-attendance-report',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const fetchedData = response.data.data;
      if (!fetchedData) {
        setError('No report found.');
        setLoading(false);
        return;
      }

      setReport(fetchedData);
      setData(fetchedData);
      setError('');
      setCurrentPage(1);
    } catch (err) {
      console.log('Error:', err.message);
      setError('Failed to fetch report.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendance();
  }, []);

  const openDetails = (day) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const totalPages = Math.ceil((data?.days?.length || 0) / itemsPerPage);
  const paginatedDays = data?.days?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading || refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#1d74ff" />
        <Text style={styles.loadingText}>Loading report...</Text>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1d74ff']}
            tintColor="#1d74ff"
            progressBackgroundColor={isDark ? theme.background : '#ffffff'}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >

        <View style={styles.headerRow}>
          <Text style={[styles.headerText, { color: theme.text }]}>Employee Report</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ApplyLeaveForm')}>
            <Feather name="plus-square" size={24} color="#1d74ff" />
          </TouchableOpacity>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.boxContainer}>
            <View
              style={[
                styles.box,
                {
                  backgroundColor: theme.boxBg,
                  borderColor: '#9CD48A',
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <View style={[styles.innerCorner, { borderTopColor: '#9CD48A' }]} />
              <Feather name="check-circle" size={18} color="#fff" style={styles.cornerIcon} />
              <Text style={[styles.boxTitle, { color: theme.subText, marginLeft: 20 }]}>
                Present Days
              </Text>
              <Text style={[styles.boxValue, { color: '#9CD48A' }]}>{report?.summary?.present_days ?? 0}</Text>
            </View>

            <View
              style={[
                styles.box,
                {
                  backgroundColor: theme.boxBg,
                  borderColor: '#4CC9B0',
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <View style={[styles.innerCorner, { borderTopColor: '#4CC9B0' }]} />
              <Feather name="calendar" size={18} color="#fff" style={styles.cornerIcon} />
              <Text style={[styles.boxTitle, { color: theme.subText, marginLeft: 20 }]}>Leaves</Text>
              <Text style={[styles.boxValue, { color: '#4CC9B0' }]}>{report?.summary?.leave_days ?? 0}</Text>
            </View>

            <View
              style={[
                styles.box,
                {
                  backgroundColor: theme.boxBg,
                  borderColor: '#4C9AFF',
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <View style={[styles.innerCorner, { borderTopColor: '#4C9AFF' }]} />
              <Feather name="clock" size={18} color="#fff" style={styles.cornerIcon} />
              <Text style={[styles.boxTitle, { color: theme.subText, marginLeft: 20 }]}>Holidays</Text>
              <Text style={[styles.boxValue, { color: '#4C9AFF' }]}>{report?.summary?.holidays ?? 0}</Text>
            </View>

            <View
              style={[
                styles.box,
                {
                  backgroundColor: theme.boxBg,
                  borderColor: '#F56C6C',
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <View style={[styles.innerCorner, { borderTopColor: '#F56C6C' }]} />
              <Feather name="x-circle" size={18} color="#fff" style={styles.cornerIcon} />
              <Text style={[styles.boxTitle, { color: theme.subText, marginLeft: 20 }]}>Absent Days</Text>
              <Text style={[styles.boxValue, { color: '#F56C6C' }]}>{report?.summary?.absent_days ?? 0}</Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionHeader, { color: theme.text }]}>Attendance Report</Text>
        <View style={[styles.section, { backgroundColor: theme.boxBg }]}>

          {paginatedDays?.length > 0 ? (
            paginatedDays.map((day) => (
              <TouchableOpacity
                key={day.id || day.formatted_date}
                style={[styles.dateCard, { backgroundColor: theme.background }]}
                onPress={() => openDetails(day)}
                activeOpacity={0.9}
              >
                <Text style={styles.dateText}>{day.formatted_date}</Text>

                <View
                  style={[
                    styles.statusBadge,
                    day.status_label === 'Absent' && { backgroundColor: '#FECACA', borderColor: '#FECACA' },
                    day.status_label === 'Holiday' && { backgroundColor: '#BFDBFE', borderColor: '#BFDBFE' },
                    day.status_label === 'Leave' && { backgroundColor: '#b9fcefff', borderColor: '#b9fcefff' },
                    day.status_label === 'Present' && { backgroundColor: '#b1fea4ff', borderColor: '#b1fea4ff' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      day.status_label === 'Absent' && { color: '#7F1D1D' },
                      day.status_label === 'Holiday' && { color: '#1D4ED8' },
                      day.status_label === 'Leave' && { color: '#4CC9B0' },
                      day.status_label === 'Present' && { color: '#166534' },
                    ]}
                  >
                    {day.status_label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No attendance records available.</Text>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={currentPage === 1}
              onPress={prevPage}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                marginHorizontal: 3,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: currentPage === 1 ? "#E5E7EB" : "#E5E7EB",
              }}
            >
              <Feather name="chevron-left" size={18} color="#1d74ff" />
            </TouchableOpacity>

            {Array.from({ length: totalPages }, (_, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                key={index + 1}
                onPress={() => setCurrentPage(index + 1)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  marginHorizontal: 3,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: currentPage === index + 1 ? "#1d74ff" : "#E5E7EB",
                  borderRadius: currentPage === index + 1 ? 10 : 20,
                }}
              >
                <Text
                  style={{
                    color: currentPage === index + 1 ? "#fff" : "#000",
                    fontWeight: "600",
                  }}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={currentPage === totalPages}
              onPress={nextPage}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                marginHorizontal: 3,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: currentPage === totalPages ? "#E5E7EB" : "#E5E7EB",
              }}
            >
              <Feather name="chevron-right" size={18} color="#1d74ff" />

            </TouchableOpacity>
          </View>


        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attendance Details</Text>
            </View>

            {selectedDay && (
              <View style={styles.modalContent}>
                <View style={styles.modalRow}>
                  <Feather name="calendar" size={18} color="#4F46E5" style={{ marginRight: 10 }} />
                  <Text style={styles.modalItem}>Date: {selectedDay.formatted_date}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Feather name="info" size={18} color="#F59E0B" style={{ marginRight: 10 }} />
                  <Text style={styles.modalItem}>Status: {selectedDay.status_label}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Feather name="calendar" size={18} color="#6366F1" style={{ marginRight: 10 }} />
                  <Text style={styles.modalItem}>Day: {selectedDay.day_name}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Feather name="clock" size={18} color="#10B981" style={{ marginRight: 10 }} />
                  <Text style={styles.modalItem}>Working Hours: {selectedDay.working_hours}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Feather name="coffee" size={18} color="#FBBF24" style={{ marginRight: 10 }} />
                  <Text style={styles.modalItem}>Break Hours: {selectedDay.break_hours}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Feather name="map-pin" size={18} color="#EF4444" style={{ marginRight: 10 }} />
                  <Text style={styles.modalItem}>Tracking Hours: {selectedDay.tracking_hours}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { height: 100, alignItems: 'center', justifyContent: 'center', elevation: 4, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerText: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  boxContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  box: { width: '48%', borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 12, elevation: 2, overflow: 'hidden' },
  innerCorner: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderTopWidth: 55, borderRightWidth: 55, borderTopColor: '#4C9AFF', borderRightColor: 'transparent', borderTopLeftRadius: 6 },
  cornerIcon: { position: 'absolute', top: 10, left: 10, zIndex: 2 },
  boxTitle: { fontSize: 14, textAlign: 'center' },
  boxValue: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 18, color: '#1d74ff' },
  errorText: { color: '#DC2626', fontSize: 16, textAlign: 'center', marginTop: 20 },
  sectionHeader: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginVertical: 20 },
  section: { marginHorizontal: 15, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 10, elevation: 2 },
  dateCard: { marginVertical: 6, padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  dateText: { fontSize: 16, fontWeight: '600', color: '#1d74ff' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  statusBadgeText: { fontSize: 14, fontWeight: '600' },
  noDataText: { textAlign: 'center', fontSize: 16, color: '#6B7280', padding: 10 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalBox: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 15, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  modalHeader: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 10, marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  modalContent: { marginBottom: 15 },
  modalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  modalItem: { fontSize: 16, color: '#374151' },
  closeBtn: { marginTop: 10, backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 12, alignItems: 'center', elevation: 5 },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default Leaves;