import React, {Component} from 'react';
import {View, StyleSheet, Image, ActivityIndicator, Text} from 'react-native';
import {Header, Icon} from 'react-native-elements';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Button, IconButton, TextInput} from 'react-native-paper';
import {UNIVERSAL_ENTRY_POINT_ADDRESS, API_FETCH_USER_DETAILS} from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BackHandler} from 'react-native';

const HeaderComponent = (props) => {
  return (
    <Header
      placement="left"
      leftComponent={
        <IconButton icon="menu" color="#fff" onPress={props.onPress} />
      }
      centerComponent={{
        text: 'Profile',
        style: {
          color: '#fff',
          textTransform: 'capitalize',
          fontSize: 16,
          letterSpacing: 0.8,
          marginLeft: -10,
        },
      }}
      ViewComponent={LinearGradient}
      linearGradientProps={{
        colors: ['#6B23AE', '#FAD44D'],
        start: {x: 0, y: 0},
        end: {x: 1.8, y: 0},
      }}
      // containerStyle={{borderBottomLeftRadius:8, borderBottomRightRadius:8}}
    />
  );
};

export default class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userDetails: [],
      isLoading: true,
      errorMessage: '',
    };
  }

  backAction = () => {
    this.props.navigation.reset({routes: [{name: 'HomeRoot'}]});
    return true;
  };

  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.backAction);
    });

    this.props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    });

    // console.log(this.props.navigation.navigate(''));
    const token = await AsyncStorage.getItem('token');
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_FETCH_USER_DETAILS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res);
        this.setState({userDetails: res.data, isLoading: false});
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.message);
        this.setState({
          errorMessage: err.response.data.message,
          isLoading: false,
        });
      });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  render() {
    const {navigate, push} = this.props.navigation;
    const {userDetails} = this.state;

    return (
      <View style={{height: '100%'}}>
        <HeaderComponent onPress={() => this.props.navigation.openDrawer()} />
        {!this.state.isLoading ? (
          this.state.errorMessage ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
              <Text style={{color: '#8d8d8d', padding: 10, fontSize: 14}}>
                {this.state.errorMessage}
              </Text>
            </View>
          ) : (
            <ScrollView>
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{resizeMode: 'cover'}}
                  source={require('../assets/profile_pic.png')}
                />
              </View>
              <View style={{paddingHorizontal: 18, marginTop: 8}}>
                <View>
                  <View style={styles.textInput}>
                    <TextInput
                      disabled
                      dense
                      value={userDetails.first_name}
                      mode="outlined"
                      // label={this.state.emailValidateError ? "Invalid Email*" : "Email Address"}
                      autoCapitalize="none"
                      label={'First Name'}
                      // onChangeText={(email) => {this.props.changeEmail(email)}}
                      // onEndEditing={(e) => this._handlerValidEmail(e.nativeEvent.text)}
                      // onSubmitEditing={() => {this.phoneTextInput.focus()}}
                      // error={this.state.emailValidateError ? true : false}
                      textContentType="givenName"
                    />
                  </View>
                  <View style={styles.textInput}>
                    <TextInput
                      disabled
                      dense
                      value={userDetails.last_name}
                      mode="outlined"
                      // label={this.state.emailValidateError ? "Invalid Email*" : "Email Address"}
                      autoCapitalize="none"
                      label={'Last Name'}
                      // onChangeText={(email) => {this.props.changeEmail(email)}}
                      // onEndEditing={(e) => this._handlerValidEmail(e.nativeEvent.text)}
                      // onSubmitEditing={() => {this.phoneTextInput.focus()}}
                      // error={this.state.emailValidateError ? true : false}
                      textContentType="familyName"
                    />
                  </View>
                  <View style={styles.textInput}>
                    <TextInput
                      disabled
                      dense
                      value={`${userDetails.phone}`}
                      mode="outlined"
                      // label={this.state.emailValidateError ? "Invalid Email*" : "Email Address"}
                      autoCapitalize="none"
                      label={'Mobile Number'}
                      // onChangeText={(email) => {this.props.changeEmail(email)}}
                      // onEndEditing={(e) => this._handlerValidEmail(e.nativeEvent.text)}
                      // onSubmitEditing={() => {this.phoneTextInput.focus()}}
                      // error={this.state.emailValidateError ? true : false}
                      textContentType="telephoneNumber"
                    />
                  </View>
                  <View style={styles.textInput}>
                    <TextInput
                      disabled
                      dense
                      value={userDetails.email}
                      mode="outlined"
                      // label={this.state.emailValidateError ? "Invalid Email*" : "Email Address"}
                      autoCapitalize="none"
                      label={'Email Address'}
                      // onChangeText={(email) => {this.props.changeEmail(email)}}
                      // onEndEditing={(e) => this._handlerValidEmail(e.nativeEvent.text)}
                      // onSubmitEditing={() => {this.phoneTextInput.focus()}}
                      // error={this.state.emailValidateError ? true : false}
                      textContentType="emailAddress"
                    />
                  </View>
                  {/* <View  style={styles.textInput}>
                                <TextInput 
                                    disabled
                                    dense 
                                    value={'Ahmedabad, Gujarat - India'}
                                    mode='outlined'
                                    // label={this.state.emailValidateError ? "Invalid Email*" : "Email Address"}
                                    autoCapitalize="none"
                                    label={'Street Address'}
                                    // onChangeText={(email) => {this.props.changeEmail(email)}}
                                    // onEndEditing={(e) => this._handlerValidEmail(e.nativeEvent.text)}
                                    // onSubmitEditing={() => {this.phoneTextInput.focus()}}
                                    // error={this.state.emailValidateError ? true : false}
                                    textContentType='fullStreetAddress'
                                    />
                            </View>
                            <View  style={styles.textInput}>
                                <TextInput 
                                    disabled
                                    dense 
                                    mode='outlined'
                                    // label={this.state.emailValidateError ? "Invalid Email*" : "Email Address"}
                                    autoCapitalize="none"
                                    label={'City, State & Country'}
                                    // onChangeText={(email) => {this.props.changeEmail(email)}}
                                    // onEndEditing={(e) => this._handlerValidEmail(e.nativeEvent.text)}
                                    // onSubmitEditing={() => {this.phoneTextInput.focus()}}
                                    // error={this.state.emailValidateError ? true : false}
                                    value={'Ahmedabad, Gujarat - India'}
                                    />
                            </View> */}
                </View>
                <View style={{marginTop: 18, marginBottom: 50}}>
                  <Button
                    style={{marginBottom: 10}}
                    mode="contained"
                    onPress={() =>
                      navigate('AddressModificationRoot', {
                        screen: 'SelectAddress',
                        params: {is_billing_address: false},
                      })
                    }>
                    Add/Edit Shipping Address
                  </Button>

                  {userDetails.social_login === 0 ? (
                    <Button
                      mode="outlined"
                      onPress={() =>
                        navigate('ProfileRoot', {screen: 'ChangePassword'})
                      }>
                      Change Password
                    </Button>
                  ) : null}

                  <Button
                    style={{marginTop: 10}}
                    mode="contained"
                    onPress={() =>
                      navigate('AddressModificationRoot', {
                        screen: 'SelectAddress',
                        params: {is_billing_address: true},
                      })
                    }>
                    Add/Edit Billing Address
                  </Button>
                </View>
              </View>
            </ScrollView>
          )
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
            }}>
            <ActivityIndicator size={25} color="purple" />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerIcon: {
    marginLeft: 12,
    marginRight: 12,
  },

  textInput: {
    marginTop: 14,
  },
});
