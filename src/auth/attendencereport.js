import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AttendanceReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        setError('No auth token found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'https://geeksnode.online/api/my-attendance-report',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const apiData = response.data?.data;
      if (!apiData) {
        setError('No data found.');
      } else {
        setData(apiData);
      }
    } catch (err) {
      setError('Failed to fetch attendance data.');
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading attendance...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.errorText}>{error}</Text>
      </ScrollView>
    );
  }

  if (!data) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={styles.header}>Attendance Report</Text>

        <View style={styles.section}>
          {data.days.length > 0 ? (
            data.days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dateCard}
                onPress={() => openDetails(day)}
              >
                {/* Date */}
                <Text style={styles.dateText}>{day.formatted_date}</Text>

                {/* STATUS BADGE */}
                <View
  style={[
    styles.statusBadge,
    day.status_label === "Absent" && {
      backgroundColor: "#FECACA", // light red
      borderColor: "#DC2626",
    },
    day.status_label === "Holiday" && {
      backgroundColor: "#BFDBFE", // light blue
      borderColor: "#3B82F6",   // darker blue border
    },
  ]}
>
  <Text
    style={[
      styles.statusBadgeText,
      day.status_label === "Absent" && { color: "#7F1D1D" },
      day.status_label === "Holiday" && { color: "#1D4ED8" }, // dark blue text
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
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Attendance Details</Text>
            {selectedDay && (
              <>
                <Text style={styles.modalItem}>📅 Date: {selectedDay.formatted_date}</Text>
                <Text style={styles.modalItem}>📌 Status: {selectedDay.status_label}</Text>
                <Text style={styles.modalItem}>📆 Day: {selectedDay.day_name}</Text>
                <Text style={styles.modalItem}>⏱ Working Hours: {selectedDay.working_hours}</Text>
                <Text style={styles.modalItem}>🍽 Break Hours: {selectedDay.break_hours}</Text>
                <Text style={styles.modalItem}>📍 Tracking Hours: {selectedDay.tracking_hours}</Text>
              </>
            )}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginVertical: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },

  loadingText: { marginTop: 10, fontSize: 16, color: '#4F46E5' },

  errorText: { color: '#DC2626', fontSize: 16, textAlign: 'center', marginTop: 20 },

  section: {
    marginHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 2,
  },

  dateCard: {
    backgroundColor: '#EEF2FF',
    marginVertical: 6,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateText: { fontSize: 16, fontWeight: '600', color: '#4F46E5' },

  /* NEW BADGE STYLE */
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#D1FAE5", // default green badge
    borderWidth: 1,
    borderColor: "#10B981",
  },

  statusBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46", // dark green text
  },

  noDataText: { textAlign: 'center', fontSize: 16, color: '#6B7280', padding: 10 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
  },

  modalBox: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    elevation: 10,
  },

  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15, textAlign: 'center', color: '#1F2937' },
  modalItem: { fontSize: 16, color: '#374151', marginBottom: 8 },

  closeBtn: {
    marginTop: 20,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 12,
  },
  closeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});

export default AttendanceReport;
