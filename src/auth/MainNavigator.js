import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from './SplashScreen'
import Login from './Login'
import ForgetPasswordScreen from './ForgetPasswordScreen'
import OtpScreen from './OtpScreen'
import ResetPasswordScreen from './ResetPasswordScreen'
import BottomNavigator from '../BottomNavigator/BottomNavigator'
import IntroScreen from './IntroScreen'
import ApplyLeaveForm from './ApplyLeaveForm'
import LeaveDone from './LeaveDone'
import Terms from './Terms'
import PrivacyPolicy from './PrivacyPolicy'
import EditProfileScreen from './EditProfileScreen'
import LeaveDetail from '../BottomNavigator/LeaveDetail';
import MyProfile from './MyProfile'
import Homekireport from './Homekiroport';
import attendencereport from './attendencereport';

const Stack = createNativeStackNavigator();
function MainNavigator() {
return (
<NavigationContainer>
<Stack.Navigator screenOptions={{ headerShown: false }}>

<Stack.Screen name='SplashScreen' component={SplashScreen} />
<Stack.Screen name='IntroScreen' component={IntroScreen} />
<Stack.Screen name='Login' component={Login} />
<Stack.Screen name='ForgetPasswordScreen' component={ForgetPasswordScreen} />
<Stack.Screen name='OtpScreen' component={OtpScreen} />
<Stack.Screen name='ResetPasswordScreen' component={ResetPasswordScreen} />
<Stack.Screen name='HomeScreen' component={BottomNavigator} />
<Stack.Screen name='ApplyLeaveForm' component={ApplyLeaveForm} />
<Stack.Screen name='LeaveDone' component={LeaveDone} />
<Stack.Screen name='Terms' component={Terms} />
<Stack.Screen name='PrivacyPolicy' component={PrivacyPolicy} />
<Stack.Screen name='EditProfileScreen' component={EditProfileScreen} />
<Stack.Screen name='LeaveDetail' component={LeaveDetail} />
<Stack.Screen name='MyProfile' component={MyProfile} />
<Stack.Screen name='Homekiroport' component={Homekireport} />
<Stack.Screen name='attendencereport' component={attendencereport} />

</Stack.Navigator>
</NavigationContainer>
);
}
export default MainNavigator;