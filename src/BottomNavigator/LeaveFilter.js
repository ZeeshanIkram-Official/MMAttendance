import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useState } from 'react';

const LeaveFilter = () => {
  const [statusFilters, setStatusFilters] = useState({
    approved: true,
    unapproved: false,
    pending: false
  });
  
  const [leaveTypeFilters, setLeaveTypeFilters] = useState({
    sickLeave: true,
    plannedLeave: false,
    holiday: false
  });
  
  const [selectedTeamMember, setSelectedTeamMember] = useState('Alexa Williams');

  // Only one status can be selected
  const toggleStatusFilter = (key) => {
    setStatusFilters({
      approved: key === 'approved',
      unapproved: key === 'unapproved',
      pending: key === 'pending',
    });
  };

  // Only one leave type can be selected
  const toggleLeaveTypeFilter = (key) => {
    setLeaveTypeFilters({
      sickLeave: key === 'sickLeave',
      plannedLeave: key === 'plannedLeave',
      holiday: key === 'holiday',
    });
  };

  const resetFilters = () => {
    setStatusFilters({
      approved: false,
      unapproved: false,
      pending: false
    });
    setLeaveTypeFilters({
      sickLeave: false,
      plannedLeave: false,
      holiday: false
    });
    setSelectedTeamMember('Select Team Member');
  };

  const applyFilters = () => {
    // Apply filter logic here
    console.log('Filters Applied:', {
      status: statusFilters,
      leaveType: leaveTypeFilters,
      teamMember: selectedTeamMember
    });
  };

  const CheckBox = ({ checked, onPress, label }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filter</Text>
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <CheckBox
            checked={statusFilters.approved}
            onPress={() => toggleStatusFilter('approved')}
            label="Approved"
          />
          <CheckBox
            checked={statusFilters.unapproved}
            onPress={() => toggleStatusFilter('unapproved')}
            label="Unapproved"
          />
          <CheckBox
            checked={statusFilters.pending}
            onPress={() => toggleStatusFilter('pending')}
            label="Pending"
          />
        </View>

        {/* Leave Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Type</Text>
          <CheckBox
            checked={leaveTypeFilters.sickLeave}
            onPress={() => toggleLeaveTypeFilter('sickLeave')}
            label="Sick Leave"
          />
          <CheckBox
            checked={leaveTypeFilters.plannedLeave}
            onPress={() => toggleLeaveTypeFilter('plannedLeave')}
            label="Planned Leave"
          />
          <CheckBox
            checked={leaveTypeFilters.holiday}
            onPress={() => toggleLeaveTypeFilter('holiday')}
            label="Holiday"
          />
        </View>

        {/* Team Member Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Member</Text>
          <TouchableOpacity style={styles.pickerContainer}>
            <Text style={styles.pickerText}>{selectedTeamMember}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  pickerText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#007AFF',
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 15,
  },
  resetButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default LeaveFilter;
