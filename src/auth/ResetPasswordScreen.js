// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   SafeAreaView
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Feather';
// import { useNavigation } from '@react-navigation/native';

// const { width } = Dimensions.get('window');

// const ResetPasswordScreen = () => {
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');

//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [isButtonDisabled, setIsButtonDisabled] = useState(true);

//   const navigation = useNavigation();

//   useEffect(() => {
//     if (
//       newPassword.trim() &&
//       confirmNewPassword.trim() &&
//       newPassword === confirmNewPassword
//     ) {
//       setIsButtonDisabled(false);
//     } else {
//       setIsButtonDisabled(true);
//     }
//   }, [newPassword, confirmNewPassword]);

//   const handleUpdatePassword = () => {
//     if (!newPassword || !confirmNewPassword) {
//       alert('Please fill all fields');
//       return;
//     }
//     if (newPassword !== confirmNewPassword) {
//       alert('New password and confirm password do not match');
//       return;
//     }
//     navigation.replace('Done');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Icon name="arrow-left" size={20} color="#0087ff" />
//         </TouchableOpacity>

//         <Text style={styles.title}>Enter New Password</Text>
//         <Text style={styles.subtitle}>
//           Please enter your new password
//         </Text>

//         <Image source={require('../assets/3.png')} style={styles.img} />

//         {/* New Password */}
//         <Text style={styles.label}>New Password</Text>
//         <View style={styles.inputWrapper}>
//           <TextInput
//             key={showNewPassword ? 'text' : 'password'}
//             style={styles.input}
//             placeholder="Enter new password"
//             placeholderTextColor="#999"
//             // secureTextEntry={!showNewPassword}
//             keyboardType='default'
//             value={newPassword}
//             onChangeText={setNewPassword}
//             maxLength={8} // allow longer passwords
//           />
//           <TouchableOpacity
//             onPress={() => setShowNewPassword(!showNewPassword)}
//             style={styles.eyeIcon}
//           >
//             <Icon
//               name={showNewPassword ? 'eye' : 'eye-off'}
//               size={20}
//               color="#666"
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Confirm Password */}
//         <Text style={styles.label}>Confirm New Password</Text>
//         <View style={styles.inputWrapper}>
//           <TextInput
//             key={showConfirmPassword ? 'text' : 'password'}
//             style={styles.input}
//             placeholder="Re-enter new password"
//             placeholderTextColor="#999"
//           // secureTextEntry={!showNewPassword}
//             keyboardType='default'
//             value={confirmNewPassword}
//             onChangeText={setConfirmNewPassword}
//             maxLength={8}
//           />
//           <TouchableOpacity
//             onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//             style={styles.eyeIcon}
//           >
//             <Icon
//               name={showConfirmPassword ? 'eye' : 'eye-off'}
//               size={20}
//               color="#666"
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Button */}
//         <TouchableOpacity
//           style={[
//             styles.button,
//             isButtonDisabled && styles.buttonDisabled,
//           ]}
//           onPress={handleUpdatePassword}
//           activeOpacity={0.8}
//           disabled={isButtonDisabled}
//         >
//           <Text style={styles.buttonText}>Update Password</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default ResetPasswordScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9F9F9',
//     paddingHorizontal: 20,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     paddingBottom: 40,
//   },
//   backBtn: {
//     position: 'absolute',
//     top: 15,
//     left: 5,
//     zIndex: 10,
//     backgroundColor: '#fff',
//     padding: 8,
//     borderRadius: 30,
//     elevation: 4,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#222',
//     marginBottom: 10,
//     marginTop: 80,
//   },
//   subtitle: {
//     fontSize: 15,
//     color: '#666',
//     marginBottom: 30,
//   },
//   img: {
//     height: 300,
//     width: 270,
//     alignSelf: 'center',
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 5,
//     color: "#0087ff",
//   },
//   inputWrapper: {
//     position: 'relative',
//     marginBottom: 20,
//   },
//   input: {
//     padding: 14,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     fontSize: 16,
//     color: '#333',
//     paddingRight: 40,
//   },
//   eyeIcon: {
//     position: 'absolute',
//     right: 12,
//     top: '50%',
//     transform: [{ translateY: -10 }],
//   },
//   button: {
//     backgroundColor: '#0087ff',
//     paddingVertical: 15,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//     shadowColor: '#CA6512',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.6,
//     shadowRadius: 5,
//     elevation: 6,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 17,
//     fontWeight: '600',
//   },
// });


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ResetPasswordScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    if (
      newPassword.trim() &&
      confirmNewPassword.trim() &&
      newPassword === confirmNewPassword
    ) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [newPassword, confirmNewPassword]);

  const handleUpdatePassword = () => {
    if (!newPassword || !confirmNewPassword) {
      alert('Please fill all fields');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    navigation.replace('Done');
  };

  const colors = {
    background: isDark ? '#101317' : '#F9F9F9',
    text: isDark ? '#fff' : '#222',
    subtitle: isDark ? '#bbb' : '#666',
    inputBg: isDark ? '#202327' : '#fff',
    inputBorder: isDark ? '#202327' : '#ddd',
    buttonBg: '#0a74ff',
    label: '#0a74ff',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={20} color={colors.buttonBg} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Enter New Password</Text>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>
          Please enter your new password
        </Text>

        <Image source={require('../assets/3.png')} style={styles.img} />

        <Text style={[styles.label, { color: colors.label }]}>New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
            placeholder="Enter new password"
            placeholderTextColor={isDark ? '#888' : '#999'}
            keyboardType="default"
            value={newPassword}
            onChangeText={setNewPassword}
            maxLength={8}
            secureTextEntry={!showNewPassword} 
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}
          >
            <Icon
              name={showNewPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.label }]}>Confirm New Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
            ]}
            placeholder="Re-enter new password"
            placeholderTextColor={isDark ? '#888' : '#999'}
            keyboardType="default"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            maxLength={8}
            secureTextEntry={!showConfirmPassword} 
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Icon
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.buttonBg },
            isButtonDisabled && styles.buttonDisabled,
          ]}
          onPress={handleUpdatePassword}
          activeOpacity={0.8}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backBtn: {
    position: 'absolute',
    top: 15,
    left: 5,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 80,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 30,
  },
  img: {
    height: 300,
    width: 270,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowColor: '#CA6512',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
