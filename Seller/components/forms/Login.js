import React, {useEffect} from 'react';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_LOGIN_KEY,
  API_CHECK_EMAIL_KEY,
} from '@env';
import {AuthContext} from '../../App/context';
import {View, Text, StyleSheet, ScrollView, BackHandler} from 'react-native';
import Ripple from 'react-native-material-ripple';
import {
  ActivityIndicator,
  Button,
  IconButton,
  TextInput,
} from 'react-native-paper';
import axios from 'axios';
import FormHeader from '../FormHeader';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {Platform} from 'react-native';
import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';
import {
  LoginManager,
  AccessToken,
  GraphRequestManager,
  GraphRequest,
} from 'react-native-fbsdk';

const Login = (props) => {
  let passField;
  const [emailOrPhone, setemailOrPhone] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [emailPhoneValidateError, setemailPhoneValidateError] = React.useState(
    '',
  );
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordValidateError, setPasswordValidateError] = React.useState('');
  const {authUser} = React.useContext(AuthContext);
  const {navigate, push} = props.navigation;

  const _handlerValidEmailOrPhone = (email_or_phone) => {
    var regx_number = /^[0-9]+$/;
    const is_number = regx_number.test(email_or_phone);
    let reg;

    if (is_number) {
      //phone validation
      reg = /^[0-9]+$/;
    } else {
      //email validation
      reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    }

    if (email_or_phone === '') {
      setemailPhoneValidateError('Email / Phone is required');
    } else if (reg.test(email_or_phone) === false) {
      setemailPhoneValidateError('Invalid Email / Phone');
    } else {
      setemailPhoneValidateError('');
    }
  };

  const _handlerValidPassword = (password) => {
    if (password !== '') {
      setPasswordValidateError('');
    } else {
      setPasswordValidateError("Password can't be empty");
    }
  };

  const _authUser = async (response) => {
    try {
      await AsyncStorage.setItem('token', response);
      authUser();
      // await AsyncStorage.setItem('expireAt', response.data.expireAt);
    } catch (err) {
      console.log(err);
    }
  };

  const _onSubmit = async () => {
    _handlerValidEmailOrPhone(emailOrPhone);
    _handlerValidPassword(password);
    if (
      emailOrPhone &&
      password &&
      !emailPhoneValidateError &&
      !passwordValidateError
    ) {
      setIsLoading(true);
      axios
        .post(UNIVERSAL_ENTRY_POINT_ADDRESS + API_LOGIN_KEY, {
          email_or_phone: emailOrPhone,
          password: password,
        })
        .then((response) => {
          console.log('response==', response);
          if (response.data.is_business_detail_filled_up === 0) {
            props.changeEmail(response.data.email);
            props.changePhone(response.data.phone);
            props.changeUserToken(response.data.token);
            props.navigation.navigate('BusinessDetails');
          } else if (
            response.data.is_approved == 0 ||
            !response.data.is_approved
          ) {
            alert("Admin hasn't approved your application yet!!");
          } else {
            _authUser(response.data.token);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          setPassword('');
          console.log({...error});
          alert(error.response.data.message);
          setIsLoading(false);
        });
    }
  };

  const _onFacebookLogin = () => {
    props.changeSocialLoginToggle(true);
    props.changeSocialLoginProvider('facebook');

    LoginManager.logInWithPermissions(['public_profile', 'email'])
      .then((result) => {
        if (result.isCancelled) {
          console.log('login cancelled');
        } else {
          AccessToken.getCurrentAccessToken().then((data) => {
            let accessToken = data.accessToken;

            const responseInfoCallback = (error, result) => {
              if (error) {
                alert('Error fetching data: ' + error.toString());
              } else {
                let user = {
                  token: accessToken.toString(),
                  name: result.name,
                  email: result.email,
                  providerId: result.id,
                };
                console.log('Facebook userInfo = ', user);
                // _authUser(user.token);

                axios
                  .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_CHECK_EMAIL_KEY, {
                    params: {
                      email: user.email,
                    },
                  })
                  .then((res) => {
                    console.log(res);

                    if (res.data.is_active == 1) {
                      if (res.data.user_exists == 1) {
                        if (res.data.bussiness_information == 1) {
                          // bussiness_information is spelled wrong from the backend
                          if (
                            res.data.is_approved == 0 ||
                            !res.data.is_approved
                          ) {
                            alert(
                              "Admin hasn't approved your application yet!!",
                            );
                          } else {
                            // if there is a user exist with this email in database
                            _authUser(res.data.token);
                          }
                        } else {
                          props.changeEmail(user.email);
                          props.changePhone(res.data.phone);
                          props.changeUserToken(res.data.token);
                          props.navigation.navigate('BusinessDetails');
                        }
                      } else {
                        // if there is no user exist with this email in database
                        props.changeSocialLoginProfileName(user.name);
                        props.changeEmail(user.email);
                        push('SocialSignUpAdditionalInputs');
                      }
                    } else {
                      alert(res.data.message);
                    }

                    // // if there is a user exist with this email in database
                    // if(res.data.bussiness_information === 0){
                    //   props.changeEmail(user.email);
                    //   props.changePhone(res.data.phone);
                    //   props.navigation.navigate("BusinessDetails");
                    // }
                    // else{
                    //   _authUser(res.data.token);
                    // }
                  })
                  .catch((err) => {
                    console.log({...err});
                    // alert(err.response.data.message);
                    // // if there is no user exist with this email in database
                    // props.changeSocialLoginProfileName(user.name);
                    // props.changeEmail(user.email);
                    // props.navigation.push("SocialSignUpAdditionalInputs");
                  });
              }
            };

            const infoRequest = new GraphRequest(
              '/me',
              {
                accessToken: accessToken,
                parameters: {
                  fields: {string: 'name, email'},
                },
              },
              responseInfoCallback,
            );

            new GraphRequestManager().addRequest(infoRequest).start();
          });
        }
      })
      .catch((error) => {
        console.log('An error occured: ' + error);
      });
  };

  const _onGoogleLogin = async () => {
    props.changeSocialLoginToggle(true);
    props.changeSocialLoginProvider('google');

    //SHA1 --> 83:F1:6E:07:B6:FE:9D:5D:80:C8:7C:AF:28:0A:32:78:36:4D:EE:EB
    GoogleSignin.configure({
      webClientId:
        '861976775185-8oggkotkkrus7gfapvtn02i3rg8576q8.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
    });
    const isSignedIn = await GoogleSignin.isSignedIn();
    console.log('isSignedIn = ', isSignedIn);
    if (isSignedIn) {
      try {
        // const userInfo = await GoogleSignin.signInSilently();
        await GoogleSignin.signOut();
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        console.log('Google userInfo = ', userInfo);

        axios
          .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_CHECK_EMAIL_KEY, {
            params: {
              email: userInfo.user.email,
            },
          })
          .then(async (res) => {
            console.log('res = ', res);
            // // if there is a user exist with this email in database
            // if(res.data.bussiness_information === 0){
            //   props.changeEmail(userInfo.user.email);
            //   props.changePhone(`${res.data.phone}`);
            //   props.navigation.navigate("BusinessDetails");
            // }
            // else{
            //   _authUser(res.data.token);
            // }

            if (res.data.is_active == 1) {
              if (res.data.user_exists == 1) {
                if (res.data.bussiness_information == 1) {
                  if (res.data.is_approved == 0 || !res.data.is_approved) {
                    alert("Admin hasn't approved your application yet!!");
                  } else {
                    // if there is a user exist with this email in database
                    _authUser(res.data.token);
                  }
                } else {
                  // await AsyncStorage.setItem('token', res.data.token);
                  props.changeEmail(userInfo.user.email);
                  props.changePhone(res.data.phone);
                  props.changeUserToken(res.data.token);
                  props.navigation.navigate('BusinessDetails');
                }
              } else {
                // if there is no user exist with this email in database
                props.changeSocialLoginProfileName(userInfo.user.name);
                props.changeEmail(userInfo.user.email);
                push('SocialSignUpAdditionalInputs');
              }
            } else {
              alert(res.data.message);
            }
          })
          .catch((err) => {
            console.log({...err});
            // // if there is no user exist with this email in database
            // props.changeSocialLoginProfileName(userInfo.user.name);
            // props.changeEmail(userInfo.user.email);
            // props.navigation.push("SocialSignUpAdditionalInputs")
          });
      } catch (error) {
        if (error.code === statusCodes.SIGN_IN_REQUIRED) {
          alert('User has not signed in yet');
          console.log('User has not signed in yet');
        } else {
          alert("Something went wrong. Unable to get user's info");
          console.log("Something went wrong. Unable to get user's info");
        }
      }
    } else {
      try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        console.log('userInfo = ', userInfo);

        axios
          .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_CHECK_EMAIL_KEY, {
            params: {
              email: userInfo.user.email,
            },
          })
          .then((res) => {
            console.log(res);
            // // if there is a user exist with this email in database
            // if(res.data.bussiness_information === 0){
            //   props.changeEmail(userInfo.user.email);
            //   props.changePhone(res.data.phone);
            //   props.navigation.navigate("BusinessDetails");
            // }
            // else{
            //   _authUser(res.data.token);
            // }

            if (res.data.is_active === 1) {
              if (res.data.user_exists === 1) {
                if (res.data.bussiness_information === 1) {
                  if (res.data.is_approved == 0 || !res.data.is_approved) {
                    alert("Admin hasn't approved your application yet!!");
                  } else {
                    // if there is a user exist with this email in database
                    _authUser(res.data.token);
                  }
                } else {
                  props.changeEmail(userInfo.user.email);
                  props.changePhone(res.data.phone);
                  props.changeUserToken(res.data.token);
                  props.navigation.navigate('BusinessDetails');
                }
              } else {
                // if there is no user exist with this email in database
                props.changeSocialLoginProfileName(userInfo.user.name);
                props.changeEmail(userInfo.user.email);
                push('SocialSignUpAdditionalInputs');
              }
            } else {
              alert(res.data.message);
            }
          })
          .catch((err) => {
            console.log({...err});
            // // if there is no user exist with this email in database
            // props.changeSocialLoginProfileName(userInfo.user.name);
            // props.changeEmail(userInfo.user.email);
            // props.navigation.navigate("SocialSignUpAdditionalInputs")
          });
      } catch (error) {
        console.log('Message = ', {...error});
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log('User Cancelled the Login Flow');
        } else if (error.code === statusCodes.IN_PROGRESS) {
          console.log('Signing In');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log('Play Services Not Available or Outdated');
        }
      }
    }
  };

  return (
    <View style={{height: '100%', backgroundColor: 'white'}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FormHeader headerTitle="Sign In" />
        <View style={styles.textinputcontainermain}>
          <View style={styles.textinputemail}>
            <TextInput
              mode="outlined"
              label={
                emailPhoneValidateError
                  ? emailPhoneValidateError + '*'
                  : 'Email or Phone'
              }
              autoCapitalize="none"
              dense
              value={emailOrPhone}
              style={{backgroundColor: 'white'}}
              onSubmitEditing={() => passField.focus()}
              onEndEditing={(e) =>
                _handlerValidEmailOrPhone(e.nativeEvent.text)
              }
              onChangeText={(email_or_phone) => {
                setemailOrPhone(email_or_phone);
              }}
              // autoFocus={true}
              keyboardType="email-address"
              error={emailPhoneValidateError ? true : false}
            />
          </View>

          <View
            style={{
              ...styles.textinputpassword,
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            <TextInput
              label={
                passwordValidateError ? passwordValidateError + '*' : 'Password'
              }
              onEndEditing={(e) => _handlerValidPassword(e.nativeEvent.text)}
              ref={(input) => {
                passField = input;
              }}
              mode="outlined"
              value={password}
              secureTextEntry={showPassword ? false : true}
              autoCapitalize="none"
              dense
              style={{backgroundColor: 'white', width: '100%'}}
              onSubmitEditing={() => _onSubmit()}
              onChangeText={(password) => setPassword(password)}
              error={passwordValidateError ? true : false}
            />
            <View
              style={{
                zIndex: 1000,
                width: 40,
                marginLeft: -40,
                paddingRight: 5,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 6,
              }}>
              <IconButton
                onPress={() => setShowPassword(!showPassword)}
                icon={!showPassword ? 'eye' : 'eye-off'}
                size={18}
                color="#8d8d8d"
              />
            </View>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Ripple
              style={{width: '60%', rippleContainerBorderRadius: 4}}
              onPress={() => _onSubmit()}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1.8, y: 0}}
                colors={['#6B23AE', '#FAD44D']}
                style={{...styles.gradient, height: 40}}>
                {isLoading ? (
                  <ActivityIndicator size={18} color="#fff" />
                ) : (
                  <Text style={{fontSize: 14, color: '#fff'}}>Login</Text>
                )}
              </LinearGradient>
            </Ripple>
          </View>

          <View
            style={{
              alignSelf: 'center',
              marginTop: '8%',
              marginBottom: '8%',
              height: 26,
              width: 26,
              borderRadius: 26 / 2,
              borderColor: '#8d8d8d',
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: '#8d8d8d',
                fontSize: 9,
                fontWeight: '700',
                textTransform: 'uppercase',
                marginTop: -0.6,
                marginRight: 0.6,
              }}>
              or
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.inputWrap}>
              <Button
                icon="facebook"
                mode="contained"
                style={{backgroundColor: '#3b5998'}}
                onPress={_onFacebookLogin}>
                Sign In
              </Button>
            </View>
            {Platform.OS === 'android' ? (
              <View style={styles.inputWrap}>
                <Button
                  icon="email"
                  mode="contained"
                  style={{backgroundColor: '#EB4132'}}
                  onPress={_onGoogleLogin}>
                  Sign In
                </Button>
              </View>
            ) : null}
          </View>

          <View style={{marginTop: '8%', alignSelf: 'center'}}>
            <Text style={{color: 'black'}}>
              Need An Account?{' '}
              <Text
                style={{color: '#6B23AE', fontWeight: 'bold'}}
                onPress={() => {
                  navigate('SignUpMethods');
                }}>
                {' '}
                Sign up{' '}
              </Text>{' '}
            </Text>
          </View>

          <View style={{marginTop: '4%', alignSelf: 'center'}}>
            <Text style={{color: 'black'}}>
              Forgot Your Password?{' '}
              <Text
                style={{color: '#6B23AE', fontWeight: 'bold'}}
                onPress={() => {
                  navigate('ForgotPassword');
                }}>
                {' '}
                Reset{' '}
              </Text>{' '}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagelogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    marginTop: '60%',
  },
  textinputcontainermain: {
    width: '100%',
    marginTop: '15%',
    padding: '10%',
  },
  textinputemail: {
    width: '100%',
    marginBottom: '3%',
  },
  textinputpassword: {
    width: '100%',
    marginBottom: '6%',
  },
  button: {
    width: '100%',
    height: 42,
    borderRadius: 4,
    borderColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  text: {
    color: 'white',
    fontSize: 14,
    letterSpacing: 1.4,
    margin: 0,
    padding: 0,
    textTransform: 'uppercase',
  },
  sociallogin: {
    textAlign: 'center',
    backgroundColor: '#3b5998',
    width: '80%',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  inputWrap: {
    flex: 1,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
  },
  inputdate: {
    fontSize: 14,
    marginBottom: -12,
    color: '#6a4595',
  },
  inputcvv: {
    fontSize: 14,
    marginBottom: -12,
    color: '#6a4595',
  },
  button1: {
    padding: 20,
    borderWidth: 2,
  },

  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 10,
  },
});

const mapDispatchToProps = (dispatch) => {
  return {
    changeEmail: (email) => {
      dispatch({type: 'CHANGE_EMAIL', payload: `${email}`});
    },
    changePhone: (phone) => {
      dispatch({type: 'CHANGE_PHONE', payload: `${phone}`});
    },
    changeSocialLoginToggle: (is_social_login) => {
      dispatch({type: 'CHANGE_SOCIAL_LOGIN_TOGGLE', payload: is_social_login});
    },
    changeSocialLoginProvider: (social_login_provider) => {
      dispatch({
        type: 'CHANGE_SOCIAL_LOGIN_PROVIDER',
        payload: social_login_provider,
      });
    },
    changeSocialLoginProfileName: (social_login_profile_name) => {
      dispatch({
        type: 'CHANGE_SOCIAL_LOGIN_PROFILE_NAME',
        payload: social_login_profile_name,
      });
    },
    changeUserToken: (token) => {
      dispatch({type: 'CHANGE_USER_TOKEN', payload: `${token}`});
    },
  };
};

export default connect(null, mapDispatchToProps)(Login);
