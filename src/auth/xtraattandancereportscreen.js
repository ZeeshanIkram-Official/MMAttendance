import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AttendanceReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

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

      console.log('Raw API Response:', response.data);

      const apiData = response.data?.data;
      if (!apiData) {
        setError('No data found.');
      } else {
        setData(apiData);
      }
    } catch (err) {
      console.log('API Error:', err.response?.data || err.message);
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
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
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employee Info</Text>
        <Text style={styles.text}>Name: {data.user.name}</Text>
        <Text style={styles.text}>Code: {data.user.employee_code}</Text>
      </View>

      {/* Date Range */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date Range</Text>
        <Text style={styles.text}>
          {data.date_range.formatted_from} → {data.date_range.formatted_to}
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.text}>Total Days: {data.summary.total_days}</Text>
        <Text style={styles.text}>Present: {data.summary.present_days}</Text>
        <Text style={styles.text}>Absent: {data.summary.absent_days}</Text>
        <Text style={styles.text}>Leaves: {data.summary.leave_days}</Text>
        <Text style={styles.text}>Holidays: {data.summary.holidays}</Text>
      </View>

      {/* Daily Attendance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Attendance</Text>
        {data.days.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            {/* DATE */}
            <Text style={styles.dayDate}>{day.formatted_date}</Text>

            {/* STATUS ABOVE DAY */}
            <Text
              style={[
                styles.statusText,
                {
                  backgroundColor:
                    day.status_label === 'Present'
                      ? '#D1FAE5'
                      : day.status_label === 'Absent'
                      ? '#FECACA'
                      : '#E0E7FF',
                  color:
                    day.status_label === 'Present'
                      ? '#065F46'
                      : day.status_label === 'Absent'
                      ? '#991B1B'
                      : '#3730A3',
                },
              ]}
            >
              {day.status_label}
            </Text>

            {/* DAY NAME */}
            <Text style={styles.dayText}>Day: {day.day_name}</Text>

            <Text style={styles.dayText}>Working Hours: {day.working_hours}</Text>
            <Text style={styles.dayText}>Break Hours: {day.break_hours}</Text>
            <Text style={styles.dayText}>Tracking Hours: {day.tracking_hours}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#1E40AF' },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1E293B',
  },
  text: { fontSize: 15, color: '#374151', marginBottom: 3 },
  dayCard: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 10,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 5,
  },
  statusText: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    fontWeight: '700',
    marginBottom: 6,
    overflow: 'hidden',
  },
  dayText: { fontSize: 14, color: '#374151', marginBottom: 2 },
});

export default AttendanceReport;
