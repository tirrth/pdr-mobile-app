import React, {Component} from 'react';
import {ActivityIndicator, View, ScrollView, Text} from 'react-native';
import {TextInput, RadioButton} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ripple from 'react-native-material-ripple';
import FormHeader from '../FormHeader';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_SAVE_BUYER_TEMPORARY_KEY,
} from '@env';
import axios from 'axios';
import {connect} from 'react-redux';
import {Pressable} from 'react-native';

class SocialSignUpAdditionalInputs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      phone: '',
      phoneValidateError: '',
      checked: 1,

      isSubmitLoading: false,
    };
  }

  _handlerValidPhone = (phone) => {
    var regx_number = /^[0-9]+$/;
    if (phone === '') {
      this.setState({phoneValidateError: 'Phone Required'});
    } else if (regx_number.test(phone) === false) {
      this.setState({phoneValidateError: 'Invalid Phone'});
    } else {
      this.setState({phoneValidateError: ''});
    }
  };

  _onSubmit = () => {
    if (!this.state.phoneValidateError) {
      this.setState({isSubmitLoading: true});
      this.props.changePhone(this.state.phone);
      this.props.changeAccountType(this.state.checked);
      axios({
        method: 'POST',
        url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_SAVE_BUYER_TEMPORARY_KEY,
        data: {
          email: this.props.email,
          phone: this.state.phone,
        },
      })
        .then((response) => {
          this.setState({isSubmitLoading: false});
          console.log(response);
          this.props.navigation.navigate('OTPVerification', {
            only_mobile_otp: false,
            email_otp: response.data.email_otp,
            phone_otp: response.data.phone_otp,
          });
        })
        .catch((error) => {
          // handle error
          this.setState({isSubmitLoading: false});
          console.log({...error});
          alert(error.response.data.email || error.response.data.phone);
        });
    }
  };

  render() {
    return (
      <ScrollView
        style={{backgroundColor: 'white'}}
        showsVerticalScrollIndicator={false}>
        <FormHeader headerTitle="Sign Up" />

        <View style={{...styles.textinputcontainermain, marginTop: '20%'}}>
          <View>
            <Text style={{fontWeight: 'bold'}}>Account Type</Text>
            <View style={{flexDirection: 'row', marginTop: 10}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 10,
                }}>
                <RadioButton
                  color="#6B23AE"
                  value={this.state.checked}
                  status={this.state.checked === 1 ? 'checked' : 'unchecked'}
                  onPress={() => this.setState({checked: 1})}
                />
                <Pressable
                  onPress={() => this.setState({checked: 1})}
                  style={{marginLeft: 2}}>
                  <Text>Seller</Text>
                </Pressable>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 20,
                }}>
                <RadioButton
                  color="#6B23AE"
                  value={this.state.checked}
                  status={this.state.checked === 2 ? 'checked' : 'unchecked'}
                  onPress={() => this.setState({checked: 2})}
                  children={() => <Text>Hello</Text>}
                />
                <Pressable
                  onPress={() => this.setState({checked: 2})}
                  style={{marginLeft: 2}}>
                  <Text>Manufacturer</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.textinputcontainermain}>
          <View style={styles.textinputphone}>
            <TextInput
              dense
              mode="outlined"
              label={
                this.state.phoneValidateError
                  ? this.state.phoneValidateError + '*'
                  : 'Phone'
              }
              style={{backgroundColor: 'white'}}
              autoCapitalize="none"
              onChangeText={(phone) => this.setState({phone: phone})}
              onEndEditing={(e) => this._handlerValidPhone(e.nativeEvent.text)}
              onSubmitEditing={() => this._onSubmit()}
              autoFocus={true}
              keyboardType="phone-pad"
              error={this.state.phoneValidateError ? true : false}
              textContentType="telephoneNumber"
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
          <Ripple
            style={{width: '60%', rippleContainerBorderRadius: 4}}
            onPress={() => this._onSubmit()}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1.8, y: 0}}
              colors={['#6B23AE', '#FAD44D']}
              style={{...styles.gradient, height: 40}}>
              {this.state.isSubmitLoading ? (
                <ActivityIndicator size={18} color="#fff" />
              ) : (
                <Text style={{fontSize: 14, color: '#fff'}}>Next</Text>
              )}
            </LinearGradient>
          </Ripple>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  textinputcontainermain: {
    width: '100%',
    padding: '10%',
    paddingBottom: 0,
  },
  textinputphone: {
    width: '100%',
    marginBottom: '15%',
  },

  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    email: state.email,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changePhone: (phone) => {
      dispatch({type: 'CHANGE_PHONE', payload: `${phone}`});
    },
    changeAccountType: (account_type) => {
      dispatch({type: 'CHANGE_ACCOUNT_TYPE', payload: account_type});
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SocialSignUpAdditionalInputs);
