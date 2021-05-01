import React from 'react';
import {AuthContext} from '../App/context';
import locales from '../locales';
import {View, StyleSheet, Alert} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {Icon as RNElementsIcon} from 'react-native-elements';
import {Icon} from 'native-base';
import AvatarImage from 'react-native-paper/lib/commonjs/components/Avatar/AvatarImage';
import Title from 'react-native-paper/lib/commonjs/components/Typography/Title';
import Caption from 'react-native-paper/lib/commonjs/components/Typography/Caption';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {UNIVERSAL_ENTRY_POINT_ADDRESS, API_FETCH_USER_DETAILS} from '@env';
import {LoginManager} from 'react-native-fbsdk';
import {GoogleSignin} from '@react-native-community/google-signin';
import axios from 'axios';
import {connect} from 'react-redux';
import {Image} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import {Text} from 'react-native';

const DrawerContent = ({token, ...props}) => {
  const {authUser} = React.useContext(AuthContext);

  const _signOut = async () => {
    props.navigation.closeDrawer();
    Alert.alert(
      'Confirmation',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            try {
              SplashScreen.show();
              axios
                .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_FETCH_USER_DETAILS, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
                .then(async (res) => {
                  console.log('response (Drawer Content - Logout) = ', res);
                  if (
                    res.data.social_login === 1 &&
                    res.data.provider === 'google'
                  ) {
                    const isSignedIn = await GoogleSignin.isSignedIn();
                    if (isSignedIn) {
                      await GoogleSignin.signOut();
                    }
                  } else if (
                    res.data.social_login === 1 &&
                    res.data.provider === 'facebook'
                  ) {
                    LoginManager.logOut();
                  }
                })
                .catch((err) => {
                  console.log(err);
                  alert(err.response.data.message);
                })
                .finally(async () => {
                  await AsyncStorage.removeItem('token');
                  authUser(false);
                });
            } catch (err) {
              console.log(err);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const {state} = props;
  const {index, routeNames} = state;
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        {token ? (
          <View
            style={{
              ...styles.userInfoSection,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: Object.keys(props.profile_info).length
                ? null
                : 'center',
              marginTop: 50,
              marginBottom: 20,
            }}>
            <AvatarImage
              source={require('../assets/default_profile.png')}
              size={70}
              style={{backgroundColor: 'transparent'}}
            />
            {Object.keys(props.profile_info).length ? (
              <View style={{alignSelf: 'center', marginLeft: 20}}>
                <Title
                  style={{
                    ...styles.title,
                  }}>
                  {props.profile_info.first_name} {props.profile_info.last_name}
                </Title>

                <Caption style={styles.caption}>
                  +61 {props.profile_info.phone}
                </Caption>
              </View>
            ) : null}
          </View>
        ) : (
          <SafeAreaView>
            <View
              style={{alignSelf: 'center', marginBottom: 14, marginTop: 10}}>
              <Image
                source={require('../assets/logo.png')}
                style={{height: 120, width: 120}}
              />
            </View>
          </SafeAreaView>
        )}

        <View>
          <DrawerItem
            focused={routeNames[index] == 'HomeRoot'}
            icon={({color, size}) => (
              <Icon
                name="home"
                style={{fontSize: size - 2, color: color, marginLeft: 10}}
              />
            )}
            label={locales.drawer_labels.home}
            onPress={() =>
              props.navigation.reset({routes: [{name: 'HomeRoot'}]})
            }
          />

          {token && (
            <DrawerItem
              focused={routeNames[index] == 'OrdersRoot'}
              icon={({color, size}) => (
                <Icon
                  name="cart"
                  style={{fontSize: size - 2, color: color, marginLeft: 10}}
                />
              )}
              label={locales.drawer_labels.orders}
              onPress={() =>
                props.navigation.reset({routes: [{name: 'OrdersRoot'}]})
              }
            />
          )}

          <DrawerItem
            focused={routeNames[index] == 'ExploreCategoriesRoot'}
            icon={({color, size}) => (
              <RNElementsIcon
                type="font-awesome-5"
                name="list-alt"
                color={color}
                size={size - 4}
                style={{marginLeft: 12}}
              />
            )}
            label={locales.drawer_labels.shop_by_category}
            onPress={() =>
              props.navigation.reset({
                routes: [{name: 'ExploreCategoriesRoot'}],
              })
            }
          />

          {token && (
            <DrawerItem
              focused={routeNames[index] == 'ProfileRoot'}
              icon={({color, size}) => (
                <Icon
                  name="person"
                  style={{fontSize: size - 2, color: color, marginLeft: 10}}
                />
              )}
              label={locales.drawer_labels.profile}
              onPress={() =>
                props.navigation.reset({routes: [{name: 'ProfileRoot'}]})
              }
            />
          )}

          <DrawerItem
            focused={routeNames[index] == 'SettingsRoot'}
            icon={({color, size}) => (
              <Icon
                name="settings"
                style={{fontSize: size - 2, color: color, marginLeft: 10}}
              />
            )}
            label={locales.drawer_labels.settings}
            onPress={() =>
              props.navigation.reset({routes: [{name: 'SettingsRoot'}]})
            }
          />

          <DrawerItem
            focused={routeNames[index] == 'About'}
            icon={({color, size}) => (
              <RNElementsIcon
                type="font-awesome-5"
                name="voicemail"
                color={color}
                size={size - 4}
                style={{marginLeft: 9}}
              />
            )}
            label={locales.drawer_labels.about_us}
            onPress={() => props.navigation.reset({routes: [{name: 'About'}]})}
          />

          <DrawerItem
            focused={routeNames[index] == 'Feedback'}
            icon={({color, size}) => (
              <RNElementsIcon
                type="font-awesome-5"
                name="comments"
                color={color}
                size={size - 3}
                style={{marginLeft: 10}}
              />
            )}
            label={locales.drawer_labels.feedback}
            onPress={() =>
              props.navigation.reset({routes: [{name: 'Feedback'}]})
            }
          />
        </View>
      </DrawerContentScrollView>

      {token ? (
        <SafeAreaView>
          <View style={styles.bottomDrawerSection}>
            <DrawerItem
              icon={({color, size}) => (
                <RNElementsIcon
                  name="logout"
                  color={color}
                  size={size}
                  style={{marginLeft: 10}}
                />
              )}
              label={({color, size}) => (
                <Text style={{color: color, fontSize: size, marginLeft: 1}}>
                  {locales.drawer_labels.sign_out}
                </Text>
              )}
              onPress={() => _signOut()}
            />
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView>
          <View style={styles.bottomDrawerSection}>
            <DrawerItem
              icon={({color, size}) => (
                <RNElementsIcon
                  name="login"
                  color={color}
                  size={size}
                  style={{marginLeft: 10}}
                />
              )}
              label={({color, size}) => (
                <Text style={{color: color, fontSize: size, marginLeft: 1}}>
                  {locales.drawer_labels.sign_in}
                </Text>
              )}
              onPress={() =>
                props.navigation.navigate('Auth', {screen: 'Login'})
              }
            />
          </View>
          <View style={styles.bottomDrawerSection}>
            <DrawerItem
              icon={({color, size}) => (
                <RNElementsIcon
                  type="font-awesome-5"
                  name="user-plus"
                  color={color}
                  size={size - 6}
                  style={{marginLeft: 17}}
                />
              )}
              label={({color, size}) => (
                <Text style={{color: color, fontSize: size, marginLeft: -4}}>
                  {locales.drawer_labels.create_account}
                </Text>
              )}
              onPress={() =>
                props.navigation.navigate('Auth', {
                  screen: 'SignUpMethods',
                })
              }
            />
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#e9e9e9',
    borderRadius: 4,
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 13,
    lineHeight: 14,
    marginTop: -3,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 20,
  },
  bottomDrawerSection: {
    marginBottom: 10,
    borderColor: '#f1f1f1',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingTop: 2,
    paddingBottom: 2,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

const mapStateToProps = (state) => {
  return {
    profile_info: state.profile_info,
  };
};

export default connect(mapStateToProps)(DrawerContent);
