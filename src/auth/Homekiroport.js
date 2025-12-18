import React, { useEffect, useState, useCallback, } from 'react';
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

const Homekiroport = () => {
  const [fullResponse, setFullResponse] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError('No token found. Login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'https://geeksnode.online/api/today-summary',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      // Poora response store karo
      setFullResponse(response.data);
    } catch (err) {
      setError('Failed to load data: ' + (err.message || ''));
      console.error(err);
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
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!fullResponse) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No data received from server.</Text>
      </View>
    );
  }

  const { date, total_checkins, data } = fullResponse;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Today Summary - Raw API Data</Text>
      </View>

      {/* Top Level Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{date}</Text>

        <Text style={styles.label}>Total Check-ins:</Text>
        <Text style={styles.value}>{total_checkins}</Text>
      </View>

      {/* Data Array */}
      {Array.isArray(data) && data.length > 0 ? (
        data.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.sectionTitle}>Record #{index + 1}</Text>

            {/* Check In / Out */}
            <Text style={styles.label}>Check In Time:</Text>
            <Text style={styles.value}>
              {item.check_in_time || item.check_in || '--:--'}
            </Text>

            <Text style={styles.label}>Check Out Time:</Text>
            <Text style={styles.value}>
              {item.check_out_time || item.check_out || '--:--'}
            </Text>

            {/* Day Start Report */}
            {item.day_start_report && (
              <>
                <Text style={styles.subTitle}>Day Start Report:</Text>
                <Text style={styles.reportText}>
                  Task from yesterday: {item.day_start_report.task_from_yesterday}
                </Text>
                <Text style={styles.reportText}>
                  Today's task: {item.day_start_report.today_task}
                </Text>
              </>
            )}

            {/* Breaks */}
            {Array.isArray(item.breaks) && item.breaks.length > 0 ? (
              <>
                <Text style={styles.subTitle}>Breaks ({item.breaks.length}):</Text>
                {item.breaks.map((b, i) => (
                  <View key={i} style={styles.breakItem}>
                    <Text style={styles.breakText}>
                      Break {i + 1}: {b.break_in_time || '--'} →{' '}
                      {b.break_out_time || '--'}
                    </Text>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.noData}>No breaks recorded</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.noData}>No records in data array</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#1E40AF' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: { color: '#EF4444', fontSize: 16, textAlign: 'center' },
  header: {
    padding: 20,
    backgroundColor: '#3B82F6',
  },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  card: {
    backgroundColor: '#FFF',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  label: { fontSize: 15, fontWeight: '600', color: '#444' },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  reportText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    marginBottom: 4,
  },
  breakItem: {
    marginLeft: 10,
    marginBottom: 4,
  },
  breakText: {
    fontSize: 14,
    color: '#2563EB',
  },
  noData: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Homekiroport;

