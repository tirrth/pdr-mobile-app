import React from 'react';
import {AuthContext} from '../App/context';
import {View, StyleSheet, Alert} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {Icon as SignOutIcon} from 'react-native-elements';
import {Icon} from 'native-base';
import AvatarImage from 'react-native-paper/lib/commonjs/components/Avatar/AvatarImage';
import Title from 'react-native-paper/lib/commonjs/components/Typography/Title';
import Caption from 'react-native-paper/lib/commonjs/components/Typography/Caption';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {UNIVERSAL_ENTRY_POINT_ADDRESS, API_GET_SELLER_INFO_KEY} from '@env';
import {LoginManager} from 'react-native-fbsdk';
import {GoogleSignin} from '@react-native-community/google-signin';
import axios from 'axios';
import {connect} from 'react-redux';

const DrawerContent = ({...props}) => {
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
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              axios
                .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_SELLER_INFO_KEY, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
                .then(async (res) => {
                  console.log(res);
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
                  // alert(err.response.data.message);
                });
              await AsyncStorage.removeItem('token');
              authUser();
            } catch (err) {
              console.log(err);
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const {state} = props;
  const {index} = state;
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <View
          style={{
            ...styles.userInfoSection,
            flexDirection: 'row',
            justifyContent: Object.keys(props.profile_info).length
              ? null
              : 'center',
            alignItems: 'center',
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
                }}>{`${props.profile_info.first_name} ${props.profile_info.last_name}`}</Title>

              <Caption style={styles.caption}>
                +61 {props.profile_info.phone}
              </Caption>
            </View>
          ) : null}
        </View>

        {/* <DrawerItemList {...props} /> */}
        <View>
          <DrawerItem
            focused={index === 0 ? true : false}
            icon={({color, size}) => (
              <Icon
                name="home"
                style={{fontSize: size - 2, color: color, marginLeft: 10}}
              />
            )}
            label="Home"
            onPress={() =>
              props.navigation.reset({routes: [{name: 'HomeRoot'}]})
            }
          />
        </View>
      </DrawerContentScrollView>

      <SafeAreaView>
        <View style={styles.bottomDrawerSection}>
          <DrawerItem
            icon={({color, size}) => (
              <SignOutIcon name="exit-to-app" color={color} size={size} />
            )}
            label="Sign Out"
            onPress={() => _signOut()}
          />
        </View>
      </SafeAreaView>
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
