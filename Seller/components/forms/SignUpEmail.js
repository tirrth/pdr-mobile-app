import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView, Platform} from 'react-native';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_SAVE_BUYER_TEMPORARY_KEY,
} from '@env';
import {TextInput} from 'react-native-paper';
import Ripple from 'react-native-material-ripple';
import FormHeader from '../FormHeader';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import {connect} from 'react-redux';
import {ToastAndroid} from 'react-native';

export class SignUpEmail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formDetails: {
        countryCode: 0,
      },
      email: '',
      phone: '',
      emailValidateError: false,
      phoneValidateError: false,
    };
  }

  componentDidMount() {
    this.props.changeSocialLoginToggle(false);
  }

  _onToastMessageSent = (message) => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  _onSubmit = (navigate) => {
    if (!this.state.email) {
      this.setState({emailValidateError: true});
    }
    if (!this.state.phone) {
      this.setState({phoneValidateError: true});
    }

    if (!this.state.emailValidateError && !this.state.phoneValidateError) {
      axios({
        method: 'POST',
        url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_SAVE_BUYER_TEMPORARY_KEY,
        data: {
          email: this.state.email,
          phone: this.state.phone,
        },
      })
        .then((response) => {
          // handle success
          console.log(response);
          this.props.changeEmail(this.state.email);
          this.props.changePhone(this.state.phone);
          navigate.push('OTPVerification', {
            only_mobile_otp: false,
            email_otp: response.data.email_otp,
            phone_otp: response.data.phone_otp,
          });
        })
        .catch(function (error) {
          // handle error
          console.log(error.response.data);
          alert(error.response.data.email || error.response.data.phone);
        });
    } else {
      this._onToastMessageSent('Plase Submit the Form Properly!!');
    }
  };

  _handlerValidEmail = (email) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (reg.test(email) === false && email !== '') {
      this.setState({emailValidateError: true});
    } else {
      this.setState({emailValidateError: false});
    }
  };

  _handlerValidPhone = (phone) => {
    let reg = /^[0-9\-\+]{4,13}$/; //4-min, 13-max

    if (reg.test(phone) === false && phone !== '') {
      this.setState({phoneValidateError: true});
    } else {
      this.setState({phoneValidateError: false});
    }
  };

  _handlerValidCountryCode = (countryCode) => {
    console.log(countryCode);
    this.setState({
      formDetails: {...this.state.formDetails, countryCode: countryCode},
    });
  };

  render() {
    const {navigate} = this.props.navigation;

    return (
      <ScrollView style={{backgroundColor: 'white'}}>
        <FormHeader headerTitle="Sign Up" />

        <View style={styles.textinputcontainermain}>
          <View style={styles.textinputemail}>
            <TextInput
              dense
              mode="outlined"
              label={
                this.state.emailValidateError
                  ? 'Invalid Email*'
                  : 'Email Address'
              }
              style={{backgroundColor: 'white'}}
              autoCapitalize="none"
              onChangeText={(email) => {
                this.setState({email});
              }}
              onEndEditing={(e) => this._handlerValidEmail(e.nativeEvent.text)}
              onSubmitEditing={() => {
                this.phoneTextInput.focus();
              }}
              autoFocus={true}
              error={this.state.emailValidateError ? true : false}
              textContentType="emailAddress"
            />
          </View>
          <View
            style={{...styles.row, ...Platform.select({ios: {zIndex: 10000}})}}>
            <DropDownPicker
              items={[
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
                {label: '+61 AU', value: '61'},
              ]}
              dropDownMaxHeight={220}
              defaultValue={'61'}
              containerStyle={{height: 44, width: '35%', marginTop: 5}}
              style={{backgroundColor: '#ffffff'}}
              itemStyle={{
                justifyContent: 'flex-start',
              }}
              searchable={true}
              searchablePlaceholder="Search"
              searchablePlaceholderTextColor="gray"
              searchableError={() => <Text>Not Found</Text>}
              dropDownStyle={{backgroundColor: '#fafafa'}}
              onChangeItem={(countryCode) => {
                this._handlerValidCountryCode(countryCode);
              }}
            />
            <View style={styles.inputWrap} style={{width: '60%'}}>
              <TextInput
                dense
                style={{backgroundColor: 'white'}}
                mode="outlined"
                autoCapitalize="none"
                label={
                  this.state.phoneValidateError
                    ? 'Invalid Mobile*'
                    : 'Mobile Number'
                }
                placeholderTextColor={this.state.phoneValidateError && 'red'}
                keyboardType={'phone-pad'}
                onChangeText={(phone) => {
                  this.setState({phone});
                }}
                onEndEditing={(e) =>
                  this._handlerValidPhone(e.nativeEvent.text)
                }
                onSubmitEditing={() => this._onSubmit(this.props.navigation)}
                error={this.state.phoneValidateError ? true : false}
                maxLength={10}
                textContentType="telephoneNumber"
                ref={(input) => {
                  this.phoneTextInput = input;
                }}
              />
            </View>
          </View>

          <View style={{flexDirection: 'row'}}>
            <Ripple
              style={{width: '50%', rippleContainerBorderRadius: 4}}
              onPress={() => {
                navigate('SignUpMethods');
              }}>
              <View
                style={{
                  ...styles.button,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  backgroundColor: 'white',
                }}>
                <Text style={{color: '#6B23AE'}}>Back</Text>
              </View>
            </Ripple>
            <Ripple
              style={{width: '50%', rippleContainerBorderRadius: 4}}
              onPress={() => this._onSubmit(this.props.navigation)}>
              <View
                style={{
                  ...styles.button,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  backgroundColor: '#6B23AE',
                }}>
                <Text style={{color: 'white'}}>Next</Text>
              </View>
            </Ripple>
          </View>
        </View>
      </ScrollView>
    );
  }
}

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
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 30,
  },
  inputWrap: {
    flex: 1,
    marginBottom: 10,
    marginTop: 30,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
  },
  inputWrapEmailaddress: {
    width: '50%',
  },
  textinputcontainermain: {
    width: '100%',
    marginTop: '15%',
    padding: '10%',
  },
  textinputemail: {
    width: '100%',
    marginBottom: '5%',
  },
  textinputpassword: {
    width: '100%',
    marginBottom: '15%',
  },
  button: {
    width: '100%',
    height: 42,
    borderRadius: 4,
    borderColor: '#6B23AE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});

const mapStateToProps = (state) => {
  return {
    email: state.email,
    phone: state.phone,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeSocialLoginToggle: (toggle) => {
      dispatch({type: 'CHANGE_SOCIAL_LOGIN_TOGGLE', payload: toggle});
    },
    changeEmail: (email) => {
      dispatch({type: 'CHANGE_EMAIL', payload: email});
    },
    changePhone: (phone) => {
      dispatch({type: 'CHANGE_PHONE', payload: `${phone}`});
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUpEmail);
