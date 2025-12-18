import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './HomeScreen';
import Leaves from './Leaves';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#0573bb',
        tabBarInactiveTintColor: '#fff',
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          let IconComponent;

          if (route.name === 'Home') {
            iconName = 'home';
            IconComponent = Entypo;
          } else if (route.name === 'Leaves') {
            iconName = 'calendar';
            IconComponent = Entypo;
          } else if (route.name === 'ProfileScreen') {
            iconName = 'person';
            IconComponent = MaterialIcons;
          }

          if (focused) {
            return (
              <View style={styles.activeIconContainer}>
                <IconComponent name={iconName} size={28} color="#0a74ff" />
              </View>
            );
          } else {
            return <IconComponent name={iconName} size={28} color="#fff" />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Leaves" component={Leaves} />
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0a74ff',
    height: 55,            
    elevation: 5,
    borderTopWidth: 0,
    overflow: 'visible',   
  },
  activeIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 50,
    height: 50,           
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,     
    borderWidth: 4,       
    borderColor: '#0a74ff'
  },
});


export default BottomNavigator;
