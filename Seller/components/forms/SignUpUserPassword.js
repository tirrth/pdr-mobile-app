import React, {Component} from 'react';

import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_REGISTER_KEY,
  API_LOGIN_KEY,
} from '@env';
import {Checkbox, IconButton, TextInput} from 'react-native-paper';
import Ripple from 'react-native-material-ripple';
import FormHeader from '../FormHeader';
import axios from 'axios';
import {connect} from 'react-redux';

// import Toast from 'react-native-toast-message';

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formDetails: {
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        checkbox: false,
      },
      showPassword: false,
      confirmShowPassword: false,
      firstNameValidError: false,
      lastNameValidError: false,
      passwordValidError: false,
      confirmPasswordValidError: false,
    };
  }

  componentNavigation(componentName) {
    const {navigate} = this.props.navigation;
    navigate(componentName);
  }

  _handlerValidFirstName = (first_name) => {
    let reg = /^[a-zA-Z]{0,30}$/;

    if (reg.test(first_name) === false && first_name !== '') {
      this.setState({firstNameValidError: true});
    } else {
      this.setState({firstNameValidError: false});
    }
  };

  _handlerValidLastName = (last_name) => {
    let reg = /^[a-zA-Z]{0,30}$/;

    if (reg.test(last_name) === false && last_name !== '') {
      this.setState({lastNameValidError: true});
    } else {
      this.setState({lastNameValidError: false});
    }
  };

  _handlerValidPassword = (password) => {
    let reg = /(?=.{8,})/;

    if (reg.test(password) === false && password !== '') {
      this.setState({passwordValidError: true});
    } else {
      this.setState({passwordValidError: false});
    }
  };

  _handlerValidConfirmPassword = (confirm_password) => {
    if (confirm_password !== this.state.formDetails.password) {
      this.setState({confirmPasswordValidError: true});
    } else {
      this.setState({confirmPasswordValidError: false});
    }
  };

  _onSubmit = (props) => {
    const {formDetails} = this.state;
    console.log(
      props.email,
      'email = ',
      props.phone,
      'phone = ',
      formDetails,
      'formDetails = ',
      props.account_type,
    );
    if (
      formDetails.firstName !== '' &&
      formDetails.lastName !== '' &&
      formDetails.password !== '' &&
      formDetails.password === formDetails.confirmPassword &&
      formDetails.checkbox
    ) {
      axios({
        method: 'POST',
        url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_REGISTER_KEY,
        data: {
          account_type: props.account_type,
          email: props.email,
          phone: props.phone,
          first_name: formDetails.firstName,
          last_name: formDetails.lastName,
          password: formDetails.password,
          gender: 1,
        },
      })
        .then(async (res) => {
          console.log('sign up res = ', res);
          await axios
            .post(UNIVERSAL_ENTRY_POINT_ADDRESS + API_LOGIN_KEY, {
              email_or_phone: props.email,
              password: formDetails.password,
            })
            .then((response) => {
              console.log('login = ', response);
              props.changeEmail(response.data.email);
              props.changePhone(`${response.data.phone}`);
              props.changeUserToken(response.data.token);
              props.navigation.navigate('BusinessDetails');
              // if(response.data.is_business_detail_filled_up === 0){
              //   props.changeEmail(response.data.email);
              //   props.changePhone(`${response.data.phone}`);
              //   props.changeUserToken(response.data.token);
              //   props.navigation.navigate("BusinessDetails");
              // }
              // else if(response.data.is_approved === 0){
              //   alert("Admin hasn't approved your application yet!!");
              // }
              // else{
              //   props.changeEmail(response.data.email);
              //   props.changePhone(`${response.data.phone}`);
              //   props.changeUserToken(response.data.token);
              //   props.navigation.navigate("BusinessDetails");
              // }

              // props.changeUserToken(res.data.token);
              // props.navigation.navigate("BusinessDetails");
            })
            .catch((error) => {
              console.log({...error});
              alert(error);
            });
        })
        .then(() => {
          this.setState({
            formDetails: {
              ...formDetails,
              firstName: '',
              lastName: '',
              password: '',
              confirmPassword: '',
              checkbox: false,
            },
          });
        })
        .catch((error) => {
          console.log({...error});
          alert(error.response.data.message);
        });
    } else {
      alert('Please Fill Everything up Properly!!');
    }
  };

  render() {
    const {push} = this.props.navigation;
    return (
      <ScrollView
        style={{backgroundColor: 'white'}}
        showsVerticalScrollIndicator={false}>
        <FormHeader headerTitle="Sign Up" />
        <View style={styles.textinputcontainermain}>
          <View style={styles.textinputemail}>
            <TextInput
              mode="outlined"
              label={
                this.state.firstNameValidError
                  ? 'Must Be Less Than 10 Characters Long*'
                  : 'First Name'
              }
              dense
              onEndEditing={(e) =>
                this._handlerValidFirstName(e.nativeEvent.text)
              }
              onSubmitEditing={() => {
                this.textInputSecond.focus();
              }}
              onChangeText={(text) => {
                this.setState({
                  formDetails: {...this.state.formDetails, firstName: text},
                });
              }}
              style={{backgroundColor: 'white'}}
              autoFocus={true}
              error={this.state.firstNameValidError ? true : false}
              textContentType="givenName"
            />
          </View>
          <View style={styles.textinputemail}>
            <TextInput
              mode="outlined"
              label={
                this.state.lastNameValidError
                  ? 'Must Be Less Than 10 Characters Long*'
                  : 'Last Name'
              }
              dense
              onEndEditing={(e) =>
                this._handlerValidLastName(e.nativeEvent.text)
              }
              ref={(input) => (this.textInputSecond = input)}
              onSubmitEditing={() => {
                this.textInputThree.focus();
              }}
              onChangeText={(text) => {
                this.setState({
                  formDetails: {...this.state.formDetails, lastName: text},
                });
              }}
              style={{backgroundColor: 'white'}}
              error={this.state.lastNameValidError ? true : false}
              textContentType="familyName"
            />
          </View>
          <View
            style={{
              ...styles.textinputemail,
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            <TextInput
              mode="outlined"
              label={
                this.state.passwordValidError
                  ? 'Password Must Be 8 Characters Long*'
                  : 'Enter Password'
              }
              autoCapitalize="none"
              secureTextEntry={!this.state.showPassword ? true : false}
              dense
              onEndEditing={(e) =>
                this._handlerValidPassword(e.nativeEvent.text)
              }
              ref={(input) => (this.textInputThree = input)}
              onSubmitEditing={() => {
                this.textInputFour.focus();
              }}
              onChangeText={(text) => {
                this.setState({
                  formDetails: {...this.state.formDetails, password: text},
                });
              }}
              style={{backgroundColor: 'white', width: '100%'}}
              error={this.state.passwordValidError ? true : false}
              textContentType="password"
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
                onPress={() =>
                  this.setState({showPassword: !this.state.showPassword})
                }
                icon={!this.state.showPassword ? 'eye' : 'eye-off'}
                size={18}
                color="#8d8d8d"
              />
            </View>
          </View>
          <View
            style={{
              ...styles.textinputemail,
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            <TextInput
              mode="outlined"
              label={
                this.state.confirmPasswordValidError
                  ? 'Password Not Matching*'
                  : 'Confirm Password'
              }
              autoCapitalize="none"
              secureTextEntry={!this.state.confirmShowPassword ? true : false}
              dense
              onEndEditing={(e) =>
                this._handlerValidConfirmPassword(e.nativeEvent.text)
              }
              ref={(input) => (this.textInputFour = input)}
              onChangeText={(text) => {
                this.setState({
                  formDetails: {
                    ...this.state.formDetails,
                    confirmPassword: text,
                  },
                });
              }}
              style={{backgroundColor: 'white', width: '100%'}}
              error={this.state.confirmPasswordValidError ? true : false}
              textContentType="password"
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
                onPress={() =>
                  this.setState({
                    confirmShowPassword: !this.state.confirmShowPassword,
                  })
                }
                icon={!this.state.confirmShowPassword ? 'eye' : 'eye-off'}
                size={18}
                color="#8d8d8d"
              />
            </View>
          </View>
          <View style={styles.checkboxContainer}>
            <Checkbox
              onPress={() => {
                this.setState({
                  formDetails: {
                    ...this.state.formDetails,
                    checkbox: !this.state.formDetails.checkbox,
                  },
                });
              }}
              status={this.state.formDetails.checkbox ? 'checked' : 'unchecked'}
              color="#468bf5"
            />
            <Text style={styles.label}>{'Agree Terms & Condtions*'}</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Ripple style={{width: '50%', rippleContainerBorderRadius: 4}}>
              <View
                style={{
                  ...styles.button,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  backgroundColor: 'white',
                }}>
                <Text style={{color: '#6B23AE'}}>Cancel</Text>
              </View>
            </Ripple>
            <Ripple
              style={{width: '50%', rippleContainerBorderRadius: 4}}
              onPress={() => this._onSubmit(this.props)}>
              <View
                style={{
                  ...styles.button,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  backgroundColor: '#6B23AE',
                }}>
                <Text style={{color: 'white'}}>Submit</Text>
              </View>
            </Ripple>
          </View>

          <View style={{marginTop: '10%', alignSelf: 'center'}}>
            <Text style={{color: 'black'}}>
              Already have An Account?{' '}
              <Text
                style={{color: '#6B23AE', fontWeight: 'bold'}}
                onPress={() => {
                  push('Login');
                }}>
                {' '}
                Sign In{' '}
              </Text>{' '}
            </Text>
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
  textinputcontainermain: {
    width: '100%',
    marginTop: '15%',
    padding: '10%',
  },
  textinputemail: {
    width: '100%',
    marginBottom: '5%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
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
  text: {
    color: 'white',
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  label: {
    margin: 8,
    marginLeft: 0,
  },
});

const mapStateToProps = (state) => {
  return {
    email: state.email,
    phone: state.phone,
    account_type: state.account_type,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeEmail: (email) => {
      dispatch({type: 'CHANGE_EMAIL', payload: email});
    },
    changePhone: (phone) => {
      dispatch({type: 'CHANGE_PHONE', payload: `${phone}`});
    },
    changeUserToken: (token) => {
      dispatch({type: 'CHANGE_USER_TOKEN', payload: token});
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
