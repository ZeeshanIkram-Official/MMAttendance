// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
// import React from 'react'

// const LeaveDetail = () => {
//   return (
//     <ScrollView style={styles.container}>
//       {/* Header */}
//       <Text style={styles.header}>Leave Details</Text>

//       {/* Fields */}
//       <View style={styles.field}>
//         <Text style={styles.label}>Title</Text>
//         <Text style={styles.value}>Sick Leave</Text>
//       </View>

//       <View style={styles.field}>
//         <Text style={styles.label}>Leave Type</Text>
//         <Text style={styles.value}>Medical Leave</Text>
//       </View>

//       <View style={styles.field}>
//         <Text style={styles.label}>Date</Text>
//         <Text style={styles.value}>April 15, 2023 - April 18, 2023</Text>
//       </View>

//       <View style={styles.field}>
//         <Text style={styles.label}>Reason</Text>
//         <Text style={styles.value}>I need to take a medical leave.</Text>
//       </View>

//       <View style={styles.field}>
//         <Text style={styles.label}>Applied on</Text>
//         <Text style={styles.value}>February 20, 2023</Text>
//       </View>

//       <View style={styles.field}>
//         <Text style={styles.label}>Contact Number</Text>
//         <Text style={styles.value}>(603) 555-0123</Text>
//       </View>

//       <View style={styles.field}>
//         <Text style={styles.label}>Status</Text>
//         <Text style={styles.value}>Pending</Text>
//       </View>

//       <View style={styles.field}>
//         <Text style={styles.label}>Approved By</Text>
//         <Text style={styles.value}>Michael Mitc</Text>
//       </View>

//       {/* Buttons */}
//       <View style={styles.buttonContainer}>
//         <TouchableOpacity style={styles.rejectButton}>
//           <Text style={styles.buttonText}>Reject</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.acceptButton}>
//           <Text style={styles.buttonText}>Accept</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 20
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: '600',
//     textAlign: 'center',
//     marginBottom: 20
//   },
//   field: {
//     marginBottom: 15
//   },
//   label: {
//     fontSize: 14,
//     color: '#888'
//   },
//   value: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#000'
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 30
//   },
//   rejectButton: {
//     flex: 1,
//     backgroundColor: '#ff4d4d',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginRight: 10
//   },
//   acceptButton: {
//     flex: 1,
//     backgroundColor: '#00cc88',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginLeft: 10
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600'
//   }
// })

// export default LeaveDetail





import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';

const LeaveDetail = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#fff' },
      ]}>
      {/* Header */}
      <Text
        style={[
          styles.header,
          { color: isDark ? '#fff' : '#000' },
        ]}>
        Leave Details
      </Text>

      {/* Fields */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#888' }]}>Title</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>Sick Leave</Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#888' }]}>Leave Type</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>Medical Leave</Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#888' }]}>Date</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>
          April 15, 2023 - April 18, 2023
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#888' }]}>Reason</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>
          I need to take a medical leave.
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#888' }]}>Applied on</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>
          February 20, 2023
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#888' }]}>Contact Number</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>
          (603) 555-0123
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#888' }]}>Status</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>Pending</Text>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#888' }]}>Approved By</Text>
        <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>Michael Mitc</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.rejectButton,
            { backgroundColor: isDark ? '#ff4d4d' : '#ff4d4d' },
          ]}>
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.acceptButton,
            { backgroundColor: isDark ? '#00cc88' : '#00cc88' },
          ]}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LeaveDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  field: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  rejectButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  acceptButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
