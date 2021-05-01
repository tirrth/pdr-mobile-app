/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
// import * as admin from 'firebase-admin';
import React from 'react';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_REFRESH_TOKEN_KEY,
  API_FETCH_USER_DETAILS,
} from '@env';
import {AuthContext} from './context';
import Bugsnag from '@bugsnag/react-native';
import SplashScreen from 'react-native-splash-screen';
import Home from '../components/Home';
import linking from './Linking';
import Search from '../components/SearchComponent';
import Login from '../components/forms/Login';
import SignUpUserPassword from '../components/forms/SignUpUserPassword';
import ForgotPassword from '../components/forms/ForgotPassword';
import ResetPassword from '../components/forms/ResetPassword';
import ChangePassword from '../components/forms/ChangePassword';
import SocialSignUpAdditionalInputs from '../components/forms/SocialSignUpAdditionalInputs';
import OTPVerification from '../components/forms/OTPVerification';
import SignUpMethods from '../components/forms/SignUpMethods';
import SignUpEmail from '../components/forms/SignUpEmail';
import CategoryAndBrandProductList from '../components/CategoryAndBrandProductList';
import PaypalPaymentGateway from '../components/payments/PaypalPaymentGateway';
import axios from 'axios';
import SelectAddress from '../components/SelectAddress';
import AddNewAddress from '../components/AddNewAddress';
import Coupons from '../components/Coupons';
import Notifications, {
  _getTotalNotificationsCount,
} from '../components/Notifications';
import ShoppingCartProducts from '../components/ShoppingCartProducts';
import ShoppingCartShippingAddress from '../components/ShoppingCartShippingAddress';
import ShoppingCartBillingAddress from '../components/ShoppingCartBillingAddress';
import ShoppingCartPayment from '../components/ShoppingCartPayment';
import Orders from '../components/Orders';
import Product from '../components/Product';
import {Icon} from 'native-base';
import {_onNotificationPress} from '../components/Notifications';
import {Platform, StatusBar} from 'react-native';
import OnboardingScreen from '../components/OnboardingScreen';

import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';

import DrawerContent from '../components/DrawerContent';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import Reducer from '../components/reducer/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WishList from '../components/WishList';
import AddToCart from '../components/ShoppingCartProducts';
import OrderProducts from '../components/OrdersProducts';
import Profile from '../components/Profile';
import CategoryExpandedList from '../components/CategoryExpandedList';
import BrandExpandedList from '../components/BrandExpandedList';
import RecentlyAddedExpandedList from '../components/RecentlyAddedExpandedList';
import EditAddress from '../components/EditAddress';
import HooksForClassComp from '../components/forms/HooksForClassComp';
import Settings from '../components/Settings';
import About from '../components/About';
import Feedback from '../components/Feedback';
import BannerProducts from '../components/BannerProducts';

import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import {Linking} from 'react-native';
import {View} from 'react-native';
import {ActivityIndicator} from 'react-native';
import ExploreAllCategories from '../components/ExploreAllCategories';
import {ChangeLanguage} from '../components/ChangeLanguage';
import {ChangeCurrency} from '../components/ChangeCurrency';
import {StyleSheet} from 'react-native';

//for bugsnag to start
Bugsnag.start();

// const GOOGLE_APPLICATION_CREDENTIALS=require("../android/app/pushnotification-6b99c-firebase-adminsdk-2u55a-895973c3e0.json")

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const AddToCartStack = createStackNavigator();
const SearchStack = createStackNavigator();
const PaymentStack = createStackNavigator();
const OrderStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const SettingsStack = createStackNavigator();
const AddressStack = createStackNavigator();
const ExploreCategoriesStack = createStackNavigator();

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
    .then((enabled) => {
      if (!enabled) {
        requestUserPermission();
      }

      messaging()
        .getToken()
        .then((token) => {
          console.log('device-token', token);
          saveTokenToDatabase(token);
        });

      removeOnMessageNotifyEventListener = messaging().onMessage(
        (remoteMessage) => {
          console.log('Message handled in the FOREGROUND!', remoteMessage);
          const {redirect_to, notification_uuid} = remoteMessage.data;
          PushNotification.localNotification({
            smallIcon: remoteMessage.notification.android.smallIcon,
            userInfo: {redirect_to, notification_uuid},
            bigPictureUrl: remoteMessage.notification.android.imageUrl,
            priority: 'max',
            visibility: 'public',
            ignoreInForeground: false,
            playSound: true,
            title: remoteMessage.notification.body,
            message: remoteMessage.notification.title,
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
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Message handled in the background!', remoteMessage);
      });

      messaging().onNotificationOpenedApp((remoteMessage) => {
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
        .then(async (remoteMessage) => {
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

      return messaging().onTokenRefresh((token) => {
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

const AddToCartStackScreen = () => {
  return (
    <AddToCartStack.Navigator initialRouteName={'AddToCart'}>
      <AddToCartStack.Screen
        name="AddToCart"
        component={AddToCart}
        options={{headerShown: false}}
      />
      <AddToCartStack.Screen
        name="ShoppingCartShippingAddress"
        component={ShoppingCartShippingAddress}
        options={{headerShown: false}}
        // initialParams={{total_amount_from_cart: 0}}
      />
      <AddToCartStack.Screen
        name="ShoppingCartBillingAddress"
        component={ShoppingCartBillingAddress}
        options={{headerShown: false}}
        // initialParams={{total_amount_from_cart: 0, price_after_shipping: 0}}
      />
      <AddToCartStack.Screen
        name="AddNewAddress"
        component={AddNewAddress}
        options={{headerShown: false}}
        initialParams={{redirect_to_cart: false, is_billing_address: false}}
      />
      <AddToCartStack.Screen
        name="Coupons"
        component={Coupons}
        options={{headerShown: false}}
      />
      <AddToCartStack.Screen
        name="ShoppingCartPayment"
        component={ShoppingCartPayment}
        options={{headerShown: false}}
        // initialParams={{total_amount_from_cart: 0, price_after_shipping: 0}}
      />
      <AddToCartStack.Screen
        name="PaypalPaymentGateway"
        component={PaypalPaymentGateway}
        options={{headerShown: false}}
        // initialParams={{grand_total: 0}}
      />
      <AddToCartStack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
    </AddToCartStack.Navigator>
  );
};

const DefaultHomeStackScreens = [
  {name: 'Home', component: Home},
  {name: 'Search', component: Search},
  {name: 'Product', component: Product},
  {name: 'CategoryAndBrandProductList', component: CategoryAndBrandProductList},
  {name: 'CategoryExpandedList', component: CategoryExpandedList},
  {name: 'BrandExpandedList', component: BrandExpandedList},
  {name: 'RecentlyAddedExpandedList', component: RecentlyAddedExpandedList},
  {name: 'BannerProducts', component: BannerProducts},
  {name: 'WishList', component: WishList},
  {name: 'AddToCartRoot', component: AddToCartStackScreen},
];

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
      {DefaultHomeStackScreens.map((screen, index) => (
        <HomeStack.Screen
          key={index}
          name={`${screen.name}`}
          component={screen.component}
        />
      ))}
      <HomeStack.Screen name="Notifications" component={Notifications} />
      <HomeStack.Screen
        name="AddressModificationRoot"
        component={AddressStackScreens}
      />
    </HomeStack.Navigator>
  );
};

const ExploreCategoriesStackScreen = () => {
  return (
    <ExploreCategoriesStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={'ExploreAllCategories'}>
      <ExploreCategoriesStack.Screen
        name="ExploreAllCategories"
        component={ExploreAllCategories}
      />
      <ExploreCategoriesStack.Screen name="Search" component={Search} />
      <ExploreCategoriesStack.Screen name="WishList" component={WishList} />
    </ExploreCategoriesStack.Navigator>
  );
};

const OrderStackScreens = () => {
  return (
    <OrderStack.Navigator initialRouteName="Orders">
      <OrderStack.Screen
        name="Orders"
        component={Orders}
        options={{headerShown: false}}
        initialParams={{highlighted_order_no: null}}
      />
      <OrderStack.Screen
        name="OrderProducts"
        component={OrderProducts}
        options={{headerShown: false}}
        initialParams={{order_id: null, highlighted_order_item_uuid: null}}
      />
      <OrderStack.Screen
        name="Product"
        component={Product}
        options={{headerShown: false}}
      />
    </OrderStack.Navigator>
  );
};

const ProfileStackScreens = () => {
  return (
    <ProfileStack.Navigator
      initialRouteName="Profile"
      screenOptions={{header: () => null}}>
      <ProfileStack.Screen name="Profile" component={Profile} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePassword} />
      <ProfileStack.Screen
        name="AddressModificationRoot"
        component={AddressStackScreens}
      />
    </ProfileStack.Navigator>
  );
};

const SettingsStackScreens = () => {
  return (
    <SettingsStack.Navigator
      initialRouteName="Settings"
      screenOptions={{header: () => null}}>
      <SettingsStack.Screen name="Settings" component={Settings} />
      <SettingsStack.Screen name="ChangeLanguage" component={ChangeLanguage} />
      <SettingsStack.Screen name="ChangeCurrency" component={ChangeCurrency} />
    </SettingsStack.Navigator>
  );
};

const AddressStackScreens = () => {
  return (
    <AddressStack.Navigator initialRouteName="SelectAddress">
      <AddressStack.Screen
        name="SelectAddress"
        component={SelectAddress}
        options={{headerShown: false}}
        initialParams={{is_billing_address: false}}
      />
      <AddressStack.Screen
        name="AddNewAddress"
        component={AddNewAddress}
        options={{headerShown: false}}
        initialParams={{redirect_to_cart: false, is_billing_address: false}}
      />
      <AddressStack.Screen
        name="EditAddress"
        component={EditAddress}
        options={{headerShown: false}}
        initialParams={{edit_address_uuid: '', is_billing_address: false}}
      />
      <AddressStack.Screen
        name="AddToCartRoot"
        component={AddToCartStackScreen}
      />
    </AddressStack.Navigator>
  );
};

async function saveTokenToDatabase(device_token) {
  const documentId = store.getState().profile_info?.uuid;
  console.log('documentId = ', documentId);

  if (documentId) {
    // Add the token to the buyers datastore
    const collection_name = 'buyers';
    const documentRef = firestore().collection(collection_name).doc(documentId);

    documentRef
      .get()
      .then(async (doc) => {
        const async_device_token = await AsyncStorage.getItem('device_token');
        if (doc.exists) {
          if (async_device_token) {
            documentRef
              .update({
                device_tokens: firestore.FieldValue.arrayRemove(
                  async_device_token,
                ),
              })
              .then((res) => null)
              .catch((err) => null);
          }

          documentRef
            .update({
              device_tokens: firestore.FieldValue.arrayUnion(device_token),
            })
            .then(async (res) => {
              await AsyncStorage.setItem('device_token', device_token);
            })
            .catch((err) => console.log(err));
        } else {
          documentRef
            .set({
              device_tokens: firestore.FieldValue.arrayUnion(device_token),
            })
            .then(async (res) => {
              await AsyncStorage.setItem('device_token', device_token);
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => {
        console.log(err);
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

const RootStackScreen = ({userToken}) => {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);
  let routeName = '';

  React.useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched')
      .then((value) => {
        if (value == null) {
          AsyncStorage.setItem('alreadyLaunched', 'true'); // No need to wait for `setItem` to finish, although you might want to handle errors
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setIsFirstLaunch(null);
      });
  }, []);

  if (isFirstLaunch === null) {
    return null; // This is the 'tricky' part: The query to AsyncStorage is not finished, but we have to present something to the user. Null will just render nothing, so you can also put a placeholder of some sort, but effectively the interval between the first mount and AsyncStorage retrieving your data won't be noticeable to the user. But if you want to display anything then you can use a LOADER here
  } else if (isFirstLaunch == true) {
    routeName = 'Onboarding';
  } else {
    routeName = 'App';
  }

  return (
    <RootStack.Navigator headerMode="none" initialRouteName={routeName}>
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      {!userToken && (
        <RootStack.Screen name="Auth" component={AuthStackScreens} />
      )}
      <RootStack.Screen name="App" component={AppDrawerScreens} />
    </RootStack.Navigator>
  );
};

const AuthStackScreens = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="SignUpMethods" component={SignUpMethods} />
      <AuthStack.Screen name="SignUpEmail" component={SignUpEmail} />
      <AuthStack.Screen
        name="OTPVerification"
        component={OTPVerification}
        initialParams={{only_mobile_otp: false}}
      />
      <AuthStack.Screen
        name="SignUpUserPassword"
        component={SignUpUserPassword}
      />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
      <AuthStack.Screen name="ResetPassword" component={ResetPassword} />
      <AuthStack.Screen
        name="SocialSignUpAdditionalInputs"
        component={SocialSignUpAdditionalInputs}
      />
      <AuthStack.Screen
        name="HooksForClassCompo"
        component={HooksForClassComp}
      />
    </AuthStack.Navigator>
  );
};

const AppDrawerScreens = () => {
  const [userToken, setUserToken] = React.useState(null);
  const [isLoading, setLoading] = React.useState(true);

  const _getUserDetails = async () => {
    const userToken = await AsyncStorage.getItem('token');
    setUserToken(userToken);
    if (!userToken) {
      throw new Error('User Unauthenticated.');
    }
    return axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_FETCH_USER_DETAILS, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })
      .then(async (res) => {
        await store.dispatch({
          type: 'CHANGE_PROFILE_INFO',
          payload: res.data,
        });
        return res;
      })
      .catch((err) => {
        throw err;
      });
  };

  React.useEffect(() => {
    _getUserDetails()
      .then((res) => {
        console.log('user details = ', res);
        _getTotalNotificationsCount(store.getState()?.profile_info)
          .then(async (total_notifications_count) => {
            await store.dispatch({
              type: 'CHANGE_TOTAL_NOTIFICATIONS_COUNT',
              payload: total_notifications_count,
            });

            notificationListeners((notification_data) => {
              _onNotificationClicked(notification_data);
            });
          })
          .catch((err) => console.log(err))
          .finally(() => {
            setLoading(false);
            SplashScreen.hide();
          });
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        SplashScreen.hide();
      });

    return () => {
      console.log(
        '%c removing on message Notification event listener....',
        'color: #DB4437; font-size: x-large; font-weight: bold; text-transform: capitalize',
      );
      removeOnMessageNotifyEventListener();
    };
  }, []);

  const _onNotificationClicked = (notification_data) => {
    _onNotificationPress(notification_data, store.getState().profile_info)
      .then(async () => {
        if (store.getState().total_notifications_count > 0) {
          await store.dispatch({
            type: 'CHANGE_TOTAL_NOTIFICATIONS_COUNT',
            payload: store.getState().total_notifications_count - 1,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  return isLoading ? (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
      }}>
      <ActivityIndicator color="blue" size={25} />
    </View>
  ) : (
    <Drawer.Navigator
      openByDefault={false}
      drawerType="slide"
      initialRouteName="HomeRoot"
      drawerContent={(props) => <DrawerContent {...props} token={userToken} />}>
      <Drawer.Screen name="HomeRoot" component={HomeStackScreen} />
      {userToken && (
        <Drawer.Screen name="OrdersRoot" component={OrderStackScreens} />
      )}
      <Drawer.Screen
        name="ExploreCategoriesRoot"
        component={ExploreCategoriesStackScreen}
      />
      {userToken && (
        <Drawer.Screen name="ProfileRoot" component={ProfileStackScreens} />
      )}
      <Drawer.Screen name="SettingsRoot" component={SettingsStackScreens} />
      <Drawer.Screen name="About" component={About} />
      <Drawer.Screen name="Feedback" component={Feedback} />
    </Drawer.Navigator>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);

  const authUser = async (show_splashscreen = true) => {
    try {
      if (show_splashscreen) {
        SplashScreen.hide(); // Hides the Splashscreen, if it is showing already
        SplashScreen.show();
      }
      setIsLoading(true);
      const value = await AsyncStorage.getItem('token');
      setUserToken(value);
      setIsLoading(false);
    } catch (err) {
      console.log('authUser | Error: ', err.response.data.message);
    }
  };

  const authContext = React.useMemo(() => {
    return {authUser: authUser};
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

    _getRefreshToken()
      .then(async (refresh_token) => {
        console.log('refresh token --> ', refresh_token);
        await AsyncStorage.setItem('token', refresh_token);
        setUserToken(refresh_token);
        setIsLoading(false);
      })
      .catch((err) => {
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
          backgroundColor="white"
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
          ) : (
            <RootStackScreen userToken={userToken} />
          )}
        </NavigationContainer>
      </Provider>
    </AuthContext.Provider>
  );
};

export default App;
