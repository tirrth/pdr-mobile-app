/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React from 'react';
import {AuthContext} from './context';
// import SplashScreen from '../components/Splash';
import OnboardingScreen from '../components/OnboardingScreen';
import SplashScreen from 'react-native-splash-screen';
import Home from '../components/Home';
// import Search from '../components/SearchComponent';
import Login from '../components/forms/Login';
import SignUpUserPassword from '../components/forms/SignUpUserPassword';
import ForgotPassword from '../components/forms/ForgotPassword';
import ResetPassword from '../components/forms/ResetPassword';
import OTPVerification from '../components/forms/OTPVerification';
import SignUpMethods from '../components/forms/SignUpMethods';
import SignUpEmail from '../components/forms/SignUpEmail';
// import {Icon} from 'native-base';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_REFRESH_TOKEN_KEY,
  API_GET_SELLER_INFO_KEY,
} from '@env';
import axios from 'axios';
import {
  _getTotalNotificationsCount,
  _onNotificationPress,
} from '../components/Notifications';
import SocialSignUpAdditionalInputs from '../components/forms/SocialSignUpAdditionalInputs';
// import CategoryList from '../components/CategoryList';
// import SelectAddress from '../components/SelectAddress';
// import AddNewAddress from '../components/AddNewAddress';
// import ChangePassword from '../components/forms/ChangePassword';
// import Coupons from '../components/Coupons';
// import Notifications from '../components/Notifications';
// import ShoppingCartProducts from '../components/ShoppingCartProducts';
// import ShoppingCartAddress from '../components/ShoppingCartAddress';
// import ShoppingCartPayment from '../components/ShoppingCartPayment';
// import Orders from '../components/Orders';
// import Product from '../components/Product';
// import { Icon } from 'native-base';
import OrderDetails from '../components/OrderDetails';
import {Platform, StatusBar} from 'react-native';

import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';

import DrawerContent from '../components/DrawerContent';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import Reducer from '../components/reducer/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BusinessDetails from '../components/forms/BusinessDetails';
import HooksForClassComp from '../components/forms/HooksForClassComp';
import AddNewProduct from '../components/AddNewProduct';
import ProductList from '../components/ProductList';
import Orders from '../components/Orders';
import linking from './Linking';
import {ActivityIndicator} from 'react-native';
import {View} from 'react-native';
import {Linking} from 'react-native';
import ReportManagement from '../components/ReportManagement';

import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import Notifications from '../components/Notifications';

const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const Drawer = createDrawerNavigator();

const store = createStore(
  Reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

let removeOnMessageNotifyEventListener = () => null;
function notificationListeners(on_notification_press_callback) {
  console.log(
    '%c listening to notification events....',
    'color: #0F9D58; font-size: x-large; font-weight: bold; text-transform: capitalize',
  );
  // ---------------------------------------- FIREBASE NOTIFICATION CODE -------------------------------------
  messaging()
    .hasPermission()
    .then(enabled => {
      if (!enabled) {
        requestUserPermission();
      }

      messaging()
        .getToken()
        .then(token => {
          console.log('device-token', token);
          saveTokenToDatabase(token);
        });

      removeOnMessageNotifyEventListener = messaging().onMessage(
        remoteMessage => {
          console.log('Message handled in the FOREGROUND!', remoteMessage);
          const {redirect_to, notification_uuid} = remoteMessage.data;
          PushNotification.localNotification({
            smallIcon: remoteMessage.notification?.android?.smallIcon,
            userInfo: {redirect_to, notification_uuid},
            bigPictureUrl: remoteMessage.notification?.android?.imageUrl,
            priority: 'max',
            visibility: 'public',
            ignoreInForeground: false,
            playSound: true,
            title: remoteMessage.notification?.body,
            message: remoteMessage.notification?.title,
          });

          const _increaseNotifyCount = async () => {
            await store.dispatch({
              type: 'CHANGE_TOTAL_NOTIFICATIONS_COUNT',
              payload: (store.getState().total_notifications_count || 0) + 1,
            });
            console.log(
              'store.getState().total_notifications_count',
              store.getState().total_notifications_count,
            );
          };
          _increaseNotifyCount();
        },
      );

      // Register background handler
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
      });

      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage,
        );
        // Linking.canOpenURL(remoteMessage.data.redirect_to).then(
        //   async (can_open_url) => {
        //     if (can_open_url) {
        //       await Linking.openURL(remoteMessage.data.redirect_to);
        //     }
        //   },
        // );

        on_notification_press_callback(remoteMessage);
      });

      // Check whether an initial notification is available
      messaging()
        .getInitialNotification()
        .then(async remoteMessage => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state:',
              remoteMessage,
            );
            // Linking.canOpenURL(remoteMessage.data.redirect_to).then(
            //   async (can_open_url) => {
            //     if (can_open_url) {
            //       await Linking.openURL(remoteMessage.data.redirect_to);
            //     }
            //   },
            // );

            on_notification_press_callback(remoteMessage);
          }
        });

      return messaging().onTokenRefresh(token => {
        console.log('refreshed device token!!');
        saveTokenToDatabase(token);
      });
    });
  // ---------------------------------------- FIREBASE NOTIFICATION CODE (EXIT) -------------------------------------

  // -------------------------------- REACT NATIVE PUSH NOTIFICATION LISTENERS --------------------------------- //
  PushNotification.configure({
    // Must be outside of any component LifeCycle (such as `componentDidMount`).
    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: async function (notification) {
      console.log('NOTIFICATION:', notification);
      // process the notification
      if (notification.foreground) {
        on_notification_press_callback(notification);
      }

      // (required) Called when a remote is received or opened, or local notification is opened
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
  });
  // -------------------------------- REACT NATIVE PUSH NOTIFICATION LISTENERS (EXIT) --------------------------------- //
}

const AuthStackScreens = () => {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);
  let routeName = '';

  React.useEffect(() => {
    // AsyncStorage.removeItem('token');
    AsyncStorage.getItem('alreadyLaunched')
      .then(value => {
        if (value == null) {
          AsyncStorage.setItem('alreadyLaunched', 'true'); // No need to wait for `setItem` to finish, although you might want to handle errors
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      })
      .catch(err => {
        console.log(err);
        setIsFirstLaunch(null);
      });
  }, []);

  if (isFirstLaunch === null) {
    return null; // This is the 'tricky' part: The query to AsyncStorage is not finished, but we have to present something to the user. Null will just render nothing, so you can also put a placeholder of some sort, but effectively the interval between the first mount and AsyncStorage retrieving your data won't be noticeable to the user. But if you want to display anything then you can use a LOADER here
  } else if (isFirstLaunch == true) {
    routeName = 'Onboarding';
  } else {
    routeName = 'Login';
  }

  return (
    <AuthStack.Navigator initialRouteName={routeName}>
      <AuthStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="SignUpMethods"
        component={SignUpMethods}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="SignUpEmail"
        component={SignUpEmail}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="OTPVerification"
        component={OTPVerification}
        options={{headerShown: false}}
        initialParams={{only_mobile_otp: false}}
      />
      <AuthStack.Screen
        name="SignUpUserPassword"
        component={SignUpUserPassword}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="HooksForClassCompo"
        component={HooksForClassComp}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="SocialSignUpAdditionalInputs"
        component={SocialSignUpAdditionalInputs}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="BusinessDetails"
        component={BusinessDetails}
        options={{headerShown: false}}
      />
    </AuthStack.Navigator>
  );
};

// const HomeStackScreen = () => {
//   return (
//     <HomeStack.Navigator>
//         <HomeStack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
//         <HomeStack.Screen name="Search" component={Search} options={{ headerShown: false }}/>
//         <HomeStack.Screen name="CategoryList" component={CategoryList} options={{ headerShown: false }}/>
//         <HomeStack.Screen name="Product" component={Product} options={{ headerShown: false }}/>
//         <HomeStack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }}/>
//     </HomeStack.Navigator>
//   );
// }

// const AppDrawerScreen = () => {
//   return (
//     <Drawer.Navigator
//       initialRouteName="Home"
//       drawerContent={(props) => <DrawerContent {...props} />}>
//         <Drawer.Screen name="Home" component={HomeStackScreen} options={{ headerShown: false, drawerIcon: ({ focused, color, size}) => (<Icon name="home" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/>
//         <Drawer.Screen name="Orders" component={Orders} options={{ headerShown: false, drawerIcon: ({ focused, color, size}) => (<Icon name="cart" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/>
//         <Drawer.Screen name="Profile" component={Orders} options={{ headerShown: false, drawerIcon: ({ focused, color, size}) => (<Icon name="person" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/>
//         <Drawer.Screen name="Settings" component={Orders} options={{ headerShown: false, drawerIcon: ({ focused, color, size}) => (<Icon name="settings" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/>
//         <Drawer.Screen name="About Us" component={Orders} options={{ headerShown: false, drawerIcon: ({ focused, color, size}) => (<Icon name="color-filter" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/>
//         <Drawer.Screen name="Feedback" component={Orders} options={{ headerShown: false, drawerIcon: ({ focused, color, size}) => (<Icon name="paper-plane" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/>
//     </Drawer.Navigator>
//   );
// }

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ProductList"
        component={ProductList}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ReportManagement"
        component={ReportManagement}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="AddNewProduct"
        component={AddNewProduct}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="Orders"
        component={Orders}
        options={{headerShown: false}}
        initialParams={{highlighted_order_no: null}}
      />
      <HomeStack.Screen
        name="OrderDetails"
        component={OrderDetails}
        options={{headerShown: false}}
        initialParams={{highlighted_order_item_uuid: null, order_id: null}}
      />
      <HomeStack.Screen
        name="Notifications"
        component={Notifications}
        options={{headerShown: false}}
      />
    </HomeStack.Navigator>
  );
};

async function saveTokenToDatabase(device_token) {
  const documentId = store.getState().profile_info?.uuid;
  console.log('documentId = ', documentId);

  if (documentId) {
    // Add the token to the sellers datastore
    const collection_name = 'sellers';
    const documentRef = firestore().collection(collection_name).doc(documentId);

    documentRef
      .get()
      .then(async doc => {
        const async_device_token = await AsyncStorage.getItem('device_token');
        if (doc.exists) {
          if (async_device_token) {
            documentRef
              .update({
                device_tokens: firestore.FieldValue.arrayRemove(
                  async_device_token,
                ),
              })
              .then(res => null)
              .catch(err => null);
          }

          documentRef
            .update({
              device_tokens: firestore.FieldValue.arrayUnion(device_token),
            })
            .then(async res => {
              // console.log(res);
              await AsyncStorage.setItem('device_token', device_token);
            })
            .catch(err => console.log(err));
        } else {
          documentRef
            .set({
              device_tokens: firestore.FieldValue.arrayUnion(device_token),
            })
            .then(async res => {
              // console.log(res);
              await AsyncStorage.setItem('device_token', device_token);
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => {
        console.log({...err});
      });
  }
}

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

const AppDrawerScreens = ({token}) => {
  const _getUserDetails = async () => {
    return axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_SELLER_INFO_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async res => {
        console.log(res);
        await store.dispatch({
          type: 'CHANGE_PROFILE_INFO',
          payload: res.data,
        });
        return res;
      })
      .catch(err => {
        throw err;
      });
  };

  React.useEffect(() => {
    _getUserDetails()
      .then(async res => {
        _getTotalNotificationsCount(store.getState().profile_info)
          .then(async total_notifications_count => {
            await store.dispatch({
              type: 'CHANGE_TOTAL_NOTIFICATIONS_COUNT',
              payload: total_notifications_count,
            });

            notificationListeners(notification_data => {
              _onNotificationClicked(notification_data);
            });
          })
          .catch(err => console.log(err))
          .finally(() => SplashScreen.hide());
      })
      .catch(err => {
        throw err;
      });

    return () => {
      console.log(
        '%cRemoving on message Notification event listener....',
        'color: #DB4437; font-size: x-large; font-weight: bold; text-transform: capitalize',
      );
      removeOnMessageNotifyEventListener();
    };
  }, []);

  const _onNotificationClicked = notification_data => {
    _onNotificationPress(notification_data, store.getState().profile_info)
      .then(async () => {
        if (store.getState().total_notifications_count > 0) {
          await store.dispatch({
            type: 'CHANGE_TOTAL_NOTIFICATIONS_COUNT',
            payload: store.getState().total_notifications_count - 1,
          });
        }
      })
      .catch(err => console.log(null));
  };

  // React.useEffect(() => {
  //   notificationListeners((notification_data) => {
  //     _onNotificationClicked(notification_data);
  //   });

  //   return () => {
  //     removeOnMessageNotifyEventListener();
  //   };
  // }, []);

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <DrawerContent {...props} />}>
      <Drawer.Screen name="HomeRoot" component={HomeStackScreen} />
      {/* <Drawer.Screen name="Orders" component={OrderStackScreens} options={{ headerShown: false, drawerIcon: ({ color, size}) => (<Icon name="cart" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/>
        <Drawer.Screen name="Profile" component={ProfileDrawerScreens} options={{ headerShown: false, drawerIcon: ({ color, size}) => (<Icon name="person" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/>
        <Drawer.Screen name="Settings" component={SelectAddressDrawerScreens} options={{ headerShown: false, drawerIcon: ({ color, size}) => (<Icon name="settings" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/>
        <Drawer.Screen name="About Us" component={Orders} options={{ headerShown: false, drawerIcon: ({ color, size}) => (<Icon name="color-filter" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/>
        <Drawer.Screen name="Feedback" component={AddNewAddress} options={{ headerShown: false, drawerIcon: ({ color, size}) => (<Icon name="paper-plane" style={{fontSize:size-2, color:color, marginLeft:10}} />) }}/> */}
    </Drawer.Navigator>
  );
};

const App = props => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);

  const authContext = React.useMemo(() => {
    return {
      authUser: () => {
        async function _getData() {
          try {
            const value = await AsyncStorage.getItem('token');
            setIsLoading(false);
            setUserToken(value);
            // SplashScreen.hide();
          } catch (err) {
            console.log(err);
          }
        }
        _getData();
      },
    };
  });

  React.useEffect(() => {
    //You can't use async in useEffect --> Like this(useEffect(async () => {...};)), so had to make an another function for it!!
    async function _removeStoredToken() {
      await AsyncStorage.removeItem('token');
    }

    async function _getRefreshToken() {
      const token = await AsyncStorage.getItem('token');
      console.log('previous token --> ', token);

      if (token !== null) {
        return await axios({
          method: 'POST',
          url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_REFRESH_TOKEN_KEY,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(async function (response) {
            return response.data.token;
          })
          .catch(function (error) {
            throw error;
          });
      } else {
        throw new Error('Please login.');
      }
    }

    const _reloadAppComponent = () => {
      setIsLoading(true);
      setUserToken(null);
    };

    _reloadAppComponent();
    _getRefreshToken()
      .then(async refresh_token => {
        console.log('refresh token --> ', refresh_token);
        await AsyncStorage.setItem('token', refresh_token);
        setUserToken(refresh_token);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        _removeStoredToken();
        setIsLoading(false);
        SplashScreen.hide();
      });
  }, []);

  return (
    <AuthContext.Provider value={authContext}>
      <Provider store={store}>
        <StatusBar
          barStyle={
            Platform.OS === 'android' ? 'dark-content' : 'light-content'
          }
          backgroundColor="#ffffff"
        />
        <NavigationContainer
          linking={linking}
          fallback={
            <View
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator color="blue" size={25} />
            </View>
          }>
          {isLoading ? (
            <View
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator color="blue" size={25} />
            </View>
          ) : userToken ? (
            <AppDrawerScreens token={userToken} />
          ) : (
            <AuthStackScreens />
          )}
        </NavigationContainer>
      </Provider>
    </AuthContext.Provider>
  );
};

export default App;
