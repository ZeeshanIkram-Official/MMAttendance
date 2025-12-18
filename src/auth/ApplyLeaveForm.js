// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Modal,
//   Alert,
//   useColorScheme,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Feather';
// import DateTimePicker from '@react-native-community/datetimepicker';

// const ApplyLeaveForm = ({ navigation }) => {
//   const scheme = useColorScheme();
//   const isDark = scheme === 'dark';

//   const [Title, setTitle] = useState('');
//   const [Type, setType] = useState('');
//   const [Contact, setContact] = useState('');
//   const [StartDate, setStartDate] = useState('');
//   const [EndDate, setEndDate] = useState('');
//   const [Reason, setReason] = useState('');

//   const [showStart, setShowStart] = useState(false);
//   const [showEnd, setShowEnd] = useState(false);
//   const [showTypeModal, setShowTypeModal] = useState(false);

//   const leaveTypes = ['Medical Leave', 'Planned Leave', 'Holiday'];

//   const onChangeStart = (event, selectedDate) => {
//     setShowStart(false);
//     if (selectedDate) setStartDate(selectedDate.toDateString());
//   };

//   const onChangeEnd = (event, selectedDate) => {
//     setShowEnd(false);
//     if (selectedDate) setEndDate(selectedDate.toDateString());
//   };

//   const handleSubmit = () => {
//     if (!Title || !Type || !Contact || !StartDate || !EndDate || !Reason) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }
//     navigation.navigate('LeaveDone');
//   };

//   return (
//     <View
//       style={[
//         styles.container,
//         { backgroundColor: isDark ? '#121212' : '#fff' },
//       ]}>
//       {/* Back Button */}
//       <TouchableOpacity
//         onPress={() => navigation.goBack()}
//         style={[
//           styles.backBtn,
//           { backgroundColor: isDark ? '#181b1f' : '#fff' },
//         ]}>
//         <Icon name="arrow-left" size={24} color={isDark ? '#fff' : '#000'} />
//       </TouchableOpacity>

//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}>
//         <Text
//           style={[
//             styles.title,
//             { color: isDark ? '#fff' : '#222' },
//           ]}>
//           Apply Leave
//         </Text>

//         {/* Title */}
//         <View
//           style={[
//             styles.inputWrapper,
//             { borderColor: isDark ? '#1d74ff' : '#0087ff' },
//           ]}>
//           <Text
//             style={[
//               styles.label,
//               { color: isDark ? '#1d74ff' : '#0087ff' },
//             ]}>
//             Title
//           </Text>
//           <TextInput
//             value={Title}
//             onChangeText={setTitle}
//             style={[
//               styles.input,
//               { color: isDark ? '#fff' : '#333' },
//             ]}
//             placeholder="Enter Title"
//             placeholderTextColor={isDark ? '#aaa' : '#999'}
//           />
//         </View>

//         {/* Leave Type */}
//         <TouchableOpacity
//           style={[
//             styles.inputWrapper,
//             { borderColor: isDark ? '#1d74ff' : '#0087ff' },
//           ]}
//           onPress={() => setShowTypeModal(true)}>
//           <Text
//             style={[
//               styles.label,
//               { color: isDark ? '#1d74ff' : '#0087ff' },
//             ]}>
//             Leave Type
//           </Text>
//           <View style={styles.dateRow}>
//             <Text
//               style={[
//                 styles.dateText,
//                 { color: isDark ? '#fff' : '#333' },
//               ]}>
//               {Type || 'Select Leave Type'}
//             </Text>
//             <Icon name="chevron-down" size={20} color={isDark ? '#fff' : '#0087ff'} />
//           </View>
//         </TouchableOpacity>

//         {/* Contact */}
//         <View
//           style={[
//             styles.inputWrapper,
//             { borderColor: isDark ? '#1d74ff' : '#0087ff' },
//           ]}>
//           <Text
//             style={[
//               styles.label,
//               { color: isDark ? '#1d74ff' : '#0087ff' },
//             ]}>
//             Contact Number
//           </Text>
//           <TextInput
//             value={Contact}
//             onChangeText={setContact}
//             style={[
//               styles.input,
//               { color: isDark ? '#fff' : '#333' },
//             ]}
//             placeholder="Enter Contact Number"
//             placeholderTextColor={isDark ? '#aaa' : '#999'}
//             keyboardType="phone-pad"
//           />
//         </View>

//         {/* Start Date */}
//         <TouchableOpacity
//           style={[
//             styles.inputWrapper,
//             { borderColor: isDark ? '#1d74ff' : '#0087ff' },
//           ]}
//           onPress={() => setShowStart(true)}>
//           <Text
//             style={[
//               styles.label,
//               { color: isDark ? '#1d74ff' : '#0087ff' },
//             ]}>
//             Start Date
//           </Text>
//           <View style={styles.dateRow}>
//             <Text
//               style={[
//                 styles.dateText,
//                 { color: isDark ? '#fff' : '#333' },
//               ]}>
//               {StartDate || 'Select Start Date'}
//             </Text>
//             <Icon name="calendar" size={20} color={isDark ? '#fff' : '#0087ff'} />
//           </View>
//         </TouchableOpacity>

//         {/* End Date */}
//         <TouchableOpacity
//           style={[
//             styles.inputWrapper,
//             { borderColor: isDark ? '#1d74ff' : '#0087ff' },
//           ]}
//           onPress={() => setShowEnd(true)}>
//           <Text
//             style={[
//               styles.label,
//               { color: isDark ? '#1d74ff' : '#0087ff' },
//             ]}>
//             End Date
//           </Text>
//           <View style={styles.dateRow}>
//             <Text
//               style={[
//                 styles.dateText,
//                 { color: isDark ? '#fff' : '#333' },
//               ]}>
//               {EndDate || 'Select End Date'}
//             </Text>
//             <Icon name="calendar" size={20} color={isDark ? '#ff' : '#0087ff'} />
//           </View>
//         </TouchableOpacity>

//         {/* Reason */}
//         <View
//           style={[
//             styles.inputWrapper,
//             { height: 100, borderColor: isDark ? '#1d74ff' : '#0087ff' },
//           ]}>
//           <Text
//             style={[
//               styles.label,
//               { color: isDark ? '#1d74ff' : '#0087ff' },
//             ]}>
//             Reason for Leave
//           </Text>
//           <TextInput
//             value={Reason}
//             onChangeText={setReason}
//             style={[
//               styles.input,
//               { height: 80, color: isDark ? '#fff' : '#333' },
//             ]}
//             placeholder="Enter Reason"
//             placeholderTextColor={isDark ? '#aaa' : '#999'}
//             multiline
//           />
//         </View>

//         {/* Submit */}
//         <TouchableOpacity
//           style={[
//             styles.submitBtn,
//             { backgroundColor: isDark ? '#1d74ff' : '#0087ff' },
//           ]}
//           onPress={handleSubmit}>
//           <Text style={styles.submitText}>Apply Leave</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Start Date Picker */}
//       {showStart && (
//         <DateTimePicker
//           value={new Date()}
//           mode="date"
//           display="default"
//           onChange={onChangeStart}
//         />
//       )}

//       {/* End Date Picker */}
//       {showEnd && (
//         <DateTimePicker
//           value={new Date()}
//           mode="date"
//           display="default"
//           onChange={onChangeEnd}
//         />
//       )}

//       {/* Leave Type Modal */}
//       <Modal
//         visible={showTypeModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowTypeModal(false)}>
//         <View style={styles.modalOverlay}>
//           <View
//             style={[
//               styles.modalBox,
//               { backgroundColor: isDark ? '#1e1e1e' : '#fff' },
//             ]}>
//             {leaveTypes.map((item, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={styles.option}
//                 onPress={() => {
//                   setType(item);
//                   setShowTypeModal(false);
//                 }}>
//                 <Text
//                   style={[
//                     styles.optionText,
//                     { color: isDark ? '#fff' : '#333' },
//                   ]}>
//                   {item}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//             <TouchableOpacity
//               style={styles.cancelBtn}
//               onPress={() => setShowTypeModal(false)}>
//               <Text
//                 style={[
//                   styles.cancelText,
//                   { color: isDark ? '#1d74ff' : '#0087ff' },
//                 ]}>
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default ApplyLeaveForm;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   backBtn: {
//     position: 'absolute',
//     top: 15,
//     left: 5,
//     zIndex: 10,
//     padding: 8,
//     borderRadius: 30,
//     elevation: 4,
//   },
//   scrollContainer: { flexGrow: 1, paddingBottom: 30, paddingTop: 70 },
//   title: { textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
//   inputWrapper: {
//     width: '85%',
//     borderWidth: 1,
//     alignSelf: 'center',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     marginTop: 15,
//   },
//   label: { fontSize: 12, marginBottom: 3 },
//   input: { fontSize: 14 },
//   dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   dateText: { fontSize: 14 },
//   submitBtn: {
//     width: '85%',
//     alignSelf: 'center',
//     paddingVertical: 15,
//     borderRadius: 8,
//     marginTop: 30,
//   },
//   submitText: { textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: 'bold' },
//   modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
//   modalBox: { width: '80%', borderRadius: 10, padding: 20 },
//   option: { paddingVertical: 12 },
//   optionText: { fontSize: 16 },
//   cancelBtn: { marginTop: 15, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#444' },
//   cancelText: { fontSize: 16, fontWeight: 'bold' },
// });





import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  useColorScheme,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';

const ApplyLeaveForm = ({ navigation }) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [Title, setTitle] = useState('');
  const [Type, setType] = useState('');
  const [Contact, setContact] = useState('');
  const [StartDate, setStartDate] = useState('');
  const [EndDate, setEndDate] = useState('');
  const [Reason, setReason] = useState('');

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const leaveTypes = ['Medical Leave', 'Planned Leave', 'Holiday'];

  const onChangeStart = (event, selectedDate) => {
    setShowStart(false);
    if (selectedDate) setStartDate(selectedDate.toDateString());
  };

  const onChangeEnd = (event, selectedDate) => {
    setShowEnd(false);
    if (selectedDate) setEndDate(selectedDate.toDateString());
  };

  const handleSubmit = () => {
    if (!Title || !Type || !Contact || !StartDate || !EndDate || !Reason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    navigation.navigate('LeaveDone');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#fff' },
      ]}>
      <View style={[{ elevation: 4, marginBottom: 10, height: 100, alignItems: 'center', justifyContent: 'center' }, {
        backgroundColor: isDark ? '#202327' : '#f8fafc',
        shadowColor: '#000',
        shadowOpacity: isDark ? 0.25 : 0.05,
        borderColor: isDark ? '#334155' : 'transparent',
        borderWidth: isDark ? 0.5 : 0,
      },]}>
        <Image source={require('../assets/mmtlogo.png')} style={{ width: 250, height: 150 }} />
      </View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[
          styles.backBtn,
          { backgroundColor: isDark ? '#181b1f' : '#f8fafc' },
        ]}>
        <Icon name="arrow-left" size={24} color={isDark ? '#0a74ff' : '#0a74ff'} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text
          style={[
            styles.title,
            { color: isDark ? '#fff' : '#222' },
          ]}>
          Apply Leave
        </Text>

        <View
          style={[
            styles.inputWrapper,
            { borderColor: isDark ? '#1d74ff' : '#0087ff' },
          ]}>
          <Text
            style={[
              styles.label,
              { color: isDark ? '#1d74ff' : '#0087ff' },
            ]}>
            Title
          </Text>
          <TextInput
            value={Title}
            onChangeText={setTitle}
            style={[
              styles.input,
              { color: isDark ? '#fff' : '#333' },
            ]}
            placeholder="Enter Title"
            placeholderTextColor={isDark ? '#aaa' : '#999'}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.inputWrapper,
            { borderColor: isDark ? '#1d74ff' : '#0087ff' },
          ]}
          onPress={() => setShowTypeModal(true)}>
          <Text
            style={[
              styles.label,
              { color: isDark ? '#1d74ff' : '#0087ff' },
            ]}>
            Leave Type
          </Text>
          <View style={styles.dateRow}>
            <Text
              style={[
                styles.dateText,
                { color: isDark ? '#fff' : '#333' },
              ]}>
              {Type || 'Select Leave Type'}
            </Text>
            <Icon name="chevron-down" size={20} color={isDark ? '#fff' : '#0087ff'} />
          </View>
        </TouchableOpacity>

        <View
          style={[
            styles.inputWrapper,
            { borderColor: isDark ? '#1d74ff' : '#0087ff' },
          ]}>
          <Text
            style={[
              styles.label,
              { color: isDark ? '#1d74ff' : '#0087ff' },
            ]}>
            Contact Number
          </Text>
          <TextInput
            value={Contact}
            onChangeText={setContact}
            style={[
              styles.input,
              { color: isDark ? '#fff' : '#333' },
            ]}
            placeholder="Enter Contact Number"
            placeholderTextColor={isDark ? '#aaa' : '#999'}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.inputWrapper,
            { borderColor: isDark ? '#1d74ff' : '#0087ff' },
          ]}
          onPress={() => setShowStart(true)}>
          <Text
            style={[
              styles.label,
              { color: isDark ? '#1d74ff' : '#0087ff' },
            ]}>
            Start Date
          </Text>
          <View style={styles.dateRow}>
            <Text
              style={[
                styles.dateText,
                { color: isDark ? '#fff' : '#333' },
              ]}>
              {StartDate || 'Select Start Date'}
            </Text>
            <Icon name="calendar" size={20} color={isDark ? '#fff' : '#0087ff'} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.inputWrapper,
            { borderColor: isDark ? '#1d74ff' : '#0087ff' },
          ]}
          onPress={() => setShowEnd(true)}>
          <Text
            style={[
              styles.label,
              { color: isDark ? '#1d74ff' : '#0087ff' },
            ]}>
            End Date
          </Text>
          <View style={styles.dateRow}>
            <Text
              style={[
                styles.dateText,
                { color: isDark ? '#fff' : '#333' },
              ]}>
              {EndDate || 'Select End Date'}
            </Text>
            <Icon name="calendar" size={20} color={isDark ? '#fff' : '#0087ff'} />
          </View>
        </TouchableOpacity>

        <View
          style={[
            styles.inputWrapper,
            { height: 100, borderColor: isDark ? '#1d74ff' : '#0087ff' },
          ]}>
          <Text
            style={[
              styles.label,
              { color: isDark ? '#1d74ff' : '#0087ff' },
            ]}>
            Reason for Leave
          </Text>
          <TextInput
            value={Reason}
            onChangeText={setReason}
            style={[
              styles.input,
              { height: 80, color: isDark ? '#fff' : '#333' },
            ]}
            placeholder="Enter Reason"
            placeholderTextColor={isDark ? '#aaa' : '#999'}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: isDark ? '#1d74ff' : '#0087ff' },
          ]}
          onPress={handleSubmit}>
          <Text style={styles.submitText}>Apply Leave</Text>
        </TouchableOpacity>
      </ScrollView>

      {showStart && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onChangeStart}
        />
      )}

      {showEnd && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onChangeEnd}
        />
      )}

      <Modal
        visible={showTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              { backgroundColor: isDark ? '#1e1e1e' : '#fff' },
            ]}>
            {leaveTypes.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => {
                  setType(item);
                  setShowTypeModal(false);
                }}>
                <Text
                  style={[
                    styles.optionText,
                    { color: isDark ? '#fff' : '#333' },
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowTypeModal(false)}>
              <Text
                style={[
                  styles.cancelText,
                  { color: isDark ? '#1d74ff' : '#0087ff' },
                ]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ApplyLeaveForm;

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
    padding: 8,
    borderRadius: 30,
    elevation: 4,
  },
  scrollContainer: { flexGrow: 1, paddingBottom: 30, paddingTop: 70 },
  title: { textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  inputWrapper: {
    width: '85%',
    borderWidth: 1,
    alignSelf: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 15,
  },
  label: { fontSize: 12, marginBottom: 3 },
  input: { fontSize: 14 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 14 },
  submitBtn: {
    width: '85%',
    alignSelf: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  submitText: { textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { width: '80%', borderRadius: 10, padding: 20 },
  option: { paddingVertical: 12 },
  optionText: { fontSize: 16 },
  cancelBtn: { marginTop: 15, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#444' },
  cancelText: { fontSize: 16, fontWeight: 'bold' },
});
