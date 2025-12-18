import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon1 from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-crop-picker';

const EditProfileScreen = ({ navigation }) => {
  const [student, setStudent] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const theme = {
    background: isDark ? '#121212' : '#fff',
    text: isDark ? '#f5f5f5' : '#222',
    inputBg: isDark ? '#1e1e1e' : '#f9f9f9',
    inputBorder: isDark ? '#333' : '#ddd',
    label: isDark ? '#90caf9' : '#3B82F6',
    primary: '#3B82F6',
    buttonText: '#fff',
    discardBg: isDark ? '#444' : '#ccc',
    discardText: isDark ? '#eee' : '#333',
    card: isDark ? '#1c1c1c' : '#f0f0f0',
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (!data) return;

        

        const parsed = JSON.parse(data);
        const token = await AsyncStorage.getItem('authToken');

        const url = `https://stagging.mightymediatech.com/api/user/${parsed.id}/image`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await response.json();
        console.log('🧾 Image API Response:', json);

        if (json.status && json.image_url) {
          const cleanUrl = json.image_url.replace('profiles/profiles/', 'profiles/');
          parsed.profileImage = cleanUrl;
        }

        setStudent(parsed);
        setOriginalData(parsed);
      } catch (error) {
        console.error('❌ Error loading student data or image:', error);
      }
    };

    loadUser();
  }, []);

  const handleImagePick = () => {
    Alert.alert('Select Image', 'Choose image from:', [
      {
        text: 'Camera',
        onPress: () => {
          ImagePicker.openCamera({
            width: 300,
            height: 300,
            cropping: true,
          })
            .then((image) => {
              setStudent({ ...student, profileImage: image.path });
              uploadStudentImage(image.path);
            })
            .catch((err) => console.log('⚠ Camera error:', err));
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: true,
          })
            .then((image) => {
              setStudent({ ...student, profileImage: image.path });
              uploadStudentImage(image.path);
            })
            .catch((err) => console.log('⚠ Picker error:', err));
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };


  const uploadStudentImage = async (imageUri) => {
    try {
      setUploading(true);

      const data = await AsyncStorage.getItem('userData');
      if (!data) {
        console.warn('⚠ User data not found');
        return;
      }

      const parsed = JSON.parse(data);
      const token = await AsyncStorage.getItem('authToken');
      const url = `https://stagging.mightymediatech.com/api/user/${parsed.id}/update-image`;

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });

      console.log('📤 Uploading image to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const json = await response.json();
      console.log('🧾 Upload Response:', json);

      if (json.status && json.image_url) {
        const cleanUrl = json.image_url.replace('profiles/profiles/', 'profiles/');
        setStudent((prev) => ({ ...prev, profileImage: cleanUrl }));
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify({ ...parsed, profileImage: cleanUrl })
        );
        Alert.alert('✅ Success', 'Profile image updated successfully!');
      } else {
        console.warn('⚠ Failed to update image:', json.message || 'Unknown error');
        Alert.alert('Error', 'Image upload failed!');
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      Alert.alert('Error', 'Something went wrong while uploading image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(student));
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  if (!student) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 10, color: theme.primary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()} activeOpacity={0.7}
          style={[styles.backButton, { backgroundColor: theme.background }]}
        >
          <Icon1 name="arrow-left" size={22} color={theme.primary} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Image source={require('../assets/mmtlogo.png')} style={styles.logo} />
          <Text style={[styles.header, { color: theme.text }]}>Edit Profile</Text>
          <View style={[styles.lineview, { backgroundColor: '#CA6512' }]} />

          <TouchableOpacity
            onPress={handleImagePick}
            style={[styles.avatarWrapper, { backgroundColor: theme.card }]}
            disabled={uploading}
            activeOpacity={0.7}
          >
            {uploading ? (
              <ActivityIndicator color={theme.primary} />
            ) : student.profileImage ? (
              <Image source={{ uri: student.profileImage }} style={styles.image} />
            ) : (
              <Image source={require('../assets/avatar.png')} style={styles.image} />
            )}
          </TouchableOpacity>

          <Text style={[styles.nameText, { color: theme.primary }]}>{student.name}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSave} activeOpacity={0.9}
            >
              <Text style={[styles.saveText, { color: theme.buttonText }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  logo: { width: 280, height: 230, alignSelf: 'center', bottom: 30 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', bottom: 80 },
  lineview: { height: 2, width: 180, alignSelf: 'center', bottom: 80 },
  scrollContent: { padding: 20, paddingBottom: 50 },
  avatarWrapper: { width: 150, height: 150, borderRadius: 100, alignSelf: 'center', justifyContent: 'center',
    alignItems: 'center', marginBottom: 15, overflow: 'hidden', bottom: 50 },
  image: { width: 150, height: 150, borderRadius: 100 },
  nameText: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20, bottom: 50 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  saveButton: { padding: 15, borderRadius: 10, flex: 1, marginLeft: 10 },
  saveText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: 15, left: 15, zIndex: 10, padding: 8, borderRadius: 30, elevation: 3 },
});