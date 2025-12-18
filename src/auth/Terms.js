// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import React from 'react';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/Feather';

// const Terms = () => {
//   const navigation = useNavigation();

//   return (
//     <View style={styles.wrapper}>
//       {/* Back Button */}
//       <TouchableOpacity
//         onPress={() => navigation.goBack()}
//         style={styles.backBtn}
//       >
//         <Icon name="arrow-left" size={24} color="#0087ff" />
//       </TouchableOpacity>

//       <ScrollView contentContainerStyle={styles.container}>
//         {/* Header */}
//         <Text style={styles.headerTitle}>Terms & Conditions</Text>
//         <Text style={styles.headerText}>
//           Please read these terms of service carefully before using our app.
//         </Text>

//         {/* Card-style section */}
//         <View style={styles.card}>
//           <Text style={styles.titleText}>Conditions of Use</Text>
//           <Text style={styles.bodyText}>
//             It is a long established fact that a reader will be distracted by the readable
//             content of a page when looking at its layout. The point of using Lorem Ipsum is
//             that it has a more-or-less normal distribution of letters, as opposed to using
//             'Content here, content here', making it look like readable English. Many desktop
//             publishing packages and web page editors now use Lorem Ipsum as their default
//             model text, and a search for 'lorem ipsum' will uncover many web sites still in
//             their infancy. Various versions have evolved over the years, sometimes by
//             accident, sometimes on purpose (injected humour and the like).
//           </Text>
//         </View>

        
//       </ScrollView>
//     </View>
//   );
// };

// export default Terms;

// const styles = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     backgroundColor: '#f6f8fa', // soft background
//     paddingTop: 40,
//   },
//   backBtn: {
//     position: 'absolute',
//     top: 15,
//     left: 10,
//     zIndex: 10,
//     backgroundColor: '#fff',
//     padding: 8,
//     borderRadius: 30,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   container: {
//     flexGrow: 1,
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//   },
//   headerTitle: {
//     fontSize: 26,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 10,
//     color: '#1d74ff',
//   },
//   headerText: {
//     fontSize: 16,
//     color: '#555',
//     textAlign: 'center',
//     marginBottom: 25,
//     lineHeight: 22,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 20,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//   },
//   titleText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1d74ff',
//     marginBottom: 12,
//   },
//   bodyText: {
//     fontSize: 15,
//     color: '#333',
//     lineHeight: 22,
//   },
// });


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

const Terms = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: isDark ? '#101317' : '#fff' },
      ]}
    >
      <View style={[{ elevation: 4,marginBottom:10,height:100,alignItems:'center',justifyContent:'center' }, {
              backgroundColor: isDark ? '#202327' : '#f6f8fa',
              shadowColor: '#000',
              shadowOpacity: isDark ? 0.25 : 0.05,
              borderColor: isDark ? '#334155' : 'transparent',
              borderWidth: isDark ? 0.5 : 0,
            },]}>
            <Image source={require('../assets/mmtlogo.png')} style={{width: 250, height: 150}} />
                      </View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[
          styles.backBtn,
          {
            backgroundColor: isDark ? '#101317' : '#f6f8fa',
            shadowColor: '#000',
            shadowOpacity: isDark ? 0.3 : 0.1,
          },
        ]} activeOpacity={0.7}
      >
        <Icon
          name="arrow-left"
          size={24}
          color={isDark ? '#0a74ff' : '#0a74ff'}
        />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? '#0a74ff' : '#0a74ff' },
          ]}
        >
          Terms & Conditions
        </Text>
        <Text
          style={[
            styles.headerText,
            { color: isDark ? '#cbd5e1' : '#555' },
          ]}
        >
          Please read these terms of service carefully before using our app.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#202327' : '#f6f8fa',
              shadowColor: '#000',
              shadowOpacity: isDark ? 0.25 : 0.05,
              borderColor: isDark ? '#334155' : 'transparent',
              borderWidth: isDark ? 0.5 : 0,
            },
          ]}
        >
          <Text
            style={[
              styles.titleText,
              { color: isDark ? '#0a74ff' : '#0a74ff' },
            ]}
          >
            Conditions of Use
          </Text>
          <Text
            style={[
              styles.bodyText,
              { color: isDark ? '#f1f5f9' : '#333' },
            ]}
          >
            It is a long established fact that a reader will be distracted by the
            readable content of a page when looking at its layout. The point of
            using Lorem Ipsum is that it has a more-or-less normal distribution
            of letters, as opposed to using 'Content here, content here', making
            it look like readable English. Many desktop publishing packages and
            web page editors now use Lorem Ipsum as their default model text, and
            a search for 'lorem ipsum' will uncover many web sites still in their
            infancy. Various versions have evolved over the years, sometimes by
            accident, sometimes on purpose (injected humour and the like).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Terms;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: 15,
    left: 10,
    zIndex: 10,
    padding: 8,
    borderRadius: 30,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
