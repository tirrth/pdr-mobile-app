// import React,{Component} from "react";
// import {
//     View,
//     Text,
//     StyleSheet,
//     ScrollView,
// } from "react-native";

// import DropDownPicker from 'react-native-dropdown-picker';
// import Icon from 'react-native-vector-icons/Feather';

// import FormHeader from '../FormHeader';

// import { TextInput} from 'react-native-paper';

// import Ripple from 'react-native-material-ripple';
// import { connect } from 'react-redux';

// import LinearGradient from 'react-native-linear-gradient';

// export class ResetPassword extends Component {

//     constructor(props){
//         super(props);

//         this.state = {
//             formDetails:{
//                 countryCode:""
//             },
//             phoneValidateError:false,
//         }
//     }

//     componentNavigation(componentName){
//         const { navigate } = this.props.navigation;
//         navigate(componentName);
//     }

//     _handlerValidCountryCode = (countryCode) => {
//         console.log(countryCode);
//         this.setState({ formDetails:{ ...this.state.formDetails, countryCode: countryCode }});
//     }

//     _handlerValidPhone = (phone) => {
//         let reg = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

//         if ((reg.test(phone) === false && phone !== "")) {
//           this.setState({ phoneValidateError:true });
//         }
//         else{
//           this.setState({ phoneValidateError:false });
//         }
//     }

//     _onSubmit = () => {

//     }

//     render(){
//         const { navigate } = this.props.navigation;

//         return (
//             <ScrollView style={{backgroundColor: 'white'}}>
//                 <FormHeader headerTitle='Forgot Password' navigation={()=>this.componentNavigation('Home')} />

//                 <View style={styles.textinputcontainermain}>
//                     <View style={styles.row}>
//                         {/* <Picker mode="dropdown" style={styles.dropdowncity} mode='dialog'
//                           onValueChange={(countryCode) => {this._handlerValidCountryCode(countryCode)}}
//                           selectedValue={(this.state.formDetails.countryCode) || '61'}
//                         >
//                             <Picker.Item label="+61 AU" value="61" />
//                             <Picker.Item label="+90 TUR" value="90" />
//                             <Picker.Item label="+91 IN" value="91" />
//                             <Picker.Item label="+92 PAK" value="92" />
//                         </Picker> */}
//                         <DropDownPicker
//                             items={[
//                                 {label: '+61 AU', value: '61', icon: () => <Icon name="flag" size={18} color="#900" />, hidden: true},
//                                 {label: '+90 TUR', value: '+90 TUR', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+91 IN', value: '+91 IN', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+92 PAK', value: '+92 PAK', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+61 AU', value: '+61 AU', icon: () => <Icon name="flag" size={18} color="#900" />, hidden: true},
//                                 {label: '+90 TUR', value: '+90 TUR', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+91 IN', value: '91', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+92 PAK', value: '92', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+61 AU', value: '61', icon: () => <Icon name="flag" size={18} color="#900" />, hidden: true},
//                                 {label: '+90 TUR', value: '90', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+91 IN', value: '91', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+92 PAK', value: '92', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+61 AU', value: '61', icon: () => <Icon name="flag" size={18} color="#900" />, hidden: true},
//                                 {label: '+90 TUR', value: '90', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+91 IN', value: '91', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+92 PAK', value: '92', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+61 AU', value: '61', icon: () => <Icon name="flag" size={18} color="#900" />, hidden: true},
//                                 {label: '+90 TUR', value: '90', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+91 IN', value: '91', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+92 PAK', value: '92', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+61 AU', value: '61', icon: () => <Icon name="flag" size={18} color="#900" />, hidden: true},
//                                 {label: '+90 TUR', value: '90', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+91 IN', value: '91', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+92 PAK', value: '92', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+61 AU', value: '61', icon: () => <Icon name="flag" size={18} color="#900" />, hidden: true},
//                                 {label: '+90 TUR', value: '90', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+91 IN', value: '91', icon: () => <Icon name="flag" size={18} color="#900" />},
//                                 {label: '+92 PAK', value: '92', icon: () => <Icon name="flag" size={18} color="#900" />},
//                             ]}
//                             defaultValue={this.state.formDetails.countryCode || '61'}
//                             containerStyle={{height: 44, width:'35%', marginTop:5, zIndex:1000 }}
//                             style={{backgroundColor: '#ffffff', zIndex:1000}}
//                             itemStyle={{
//                                 justifyContent: 'flex-start'
//                             }}
//                             dropDownStyle={{backgroundColor: '#fafafa'}}
//                             onChangeItem={(countryCode) => {this._handlerValidCountryCode(countryCode)}}
//                         />
//                         <View style={styles.inputWrap} style={{ width: '60%'}}>
//                             {/* <TextInput dense style={{ height:40, backgroundColor:'transparent' }} autoCapitalize="none" placeholder="Mobile Number" keyboardType={'phone-pad'} /> */}
//                             <TextInput dense style={{ height:40, backgroundColor:'white' }}
//                             mode='outlined'
//                             autoCapitalize="none"
//                             label={this.state.phoneValidateError ? "Invalid Mobile*" : "Mobile Number"} placeholderTextColor={this.state.phoneValidateError && "red"}  keyboardType={'phone-pad'}
//                             onChangeText={(phone) => {this.props.changePhone(phone)}}
//                             onEndEditing={(e) => this._handlerValidPhone(e.nativeEvent.text)}
//                             onSubmitEditing={() => this._onSubmit(this.props.navigation)}
//                             error={this.state.phoneValidateError ? true : false}
//                             maxLength={10}
//                             textContentType='telephoneNumber'
//                             ref={(input) => { this.phoneTextInput = input }}
//                             />
//                         </View>
//                     </View>

//                     <View>
//                         <Ripple style={{marginTop:0, rippleContainerBorderRadius:4}} onPress={() => navigate('ResetPassword')}>
//                             <LinearGradient start={{x: 0, y: 0}} end={{x: 1.8, y: 0}} colors={['#6B23AE', '#FAD44D']} style={styles.gradient}>
//                                 <Text style={styles.text}>Next</Text>
//                             </LinearGradient>
//                         </Ripple>
//                     </View>
//                 </View>
//             </ScrollView>
//         );
//     }
// }

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#fff',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     imagelogoContainer :{
//       justifyContent: 'center',
//       alignItems: 'center',
//       height: '100%',
//       marginTop:'60%'
//     },
//     textinputcontainermain:{
//         width: '100%',
//         marginTop: '15%',
//         padding: '10%',
//       },
//     row: {
//         flex: 1,
//         flexDirection: "row",
//         justifyContent:'space-between',
//         marginTop:8,
//         marginBottom:30
//     },
//     inputWrap: {
//         flex: 1,
//         marginBottom: 10,
//         marginTop: 30,
//         paddingLeft:10,
//         paddingRight:10,
//         textAlign:"center",
//     },
//     gradient: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems:'center',
//         borderRadius: 4,
//         padding:10
//     },
//     button: {
//         width: '100%',
//         borderRadius: 50,
//         marginTop: '15%',
//     },
//     text: {
//         color: 'white',
//         fontSize: 16
//     },
// });

// const mapStateToProps = (state) => {
//     return {
//       phone:state.phone,
//     }
// };

// const mapDispatchToProps = (dispatch) => {
//     return {
//         changePhone:(phone) => {dispatch({type:'CHANGE_PHONE', payload:phone})},
//     }
// };

// export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);

import React, {Component} from 'react';
import {UNIVERSAL_ENTRY_POINT_ADDRESS, API_FORGOT_PASSWORD_KEY} from '@env';
import {View, Text, StyleSheet, ScrollView, Platform} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Feather';
import FormHeader from '../FormHeader';
import {TextInput} from 'react-native-paper';
import Ripple from 'react-native-material-ripple';
import {connect} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

export class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formDetails: {
        countryCode: '',
      },
      phoneValidateError: false,
    };
  }

  componentNavigation(componentName) {
    const {navigate} = this.props.navigation;
    navigate(componentName);
  }

  _handlerValidCountryCode = (countryCode) => {
    console.log(countryCode);
    this.setState({
      formDetails: {...this.state.formDetails, countryCode: countryCode},
    });
  };

  _handlerValidPhone = (phone) => {
    let reg = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

    if (reg.test(phone) === false && phone !== '') {
      this.setState({phoneValidateError: true});
    } else {
      this.setState({phoneValidateError: false});
    }
  };

  _onSubmit = (props) => {
    if (this.props.phone !== '') {
      axios({
        method: 'POST',
        url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_FORGOT_PASSWORD_KEY,
        data: {
          phone: this.props.phone,
        },
      })
        .then(function (response) {
          console.log(response);
          props.push('OTPVerification', {
            only_mobile_otp: true,
            phone_otp: response.data.phone_otp,
          });
        })
        .catch(function (error) {
          console.log('Assaasas', error.response.data);
          alert(error.response.data.message + '!');
        });
    } else {
      alert('Enter valid Phone NUmber!!');
    }
  };

  render() {
    return (
      <ScrollView style={{backgroundColor: 'white'}}>
        <FormHeader
          headerTitle="Forgot Password"
          navigation={() => this.componentNavigation('Home')}
        />

        <View style={styles.textinputcontainermain}>
          <View
            style={{...styles.row, ...Platform.select({ios: {zIndex: 10000}})}}>
            <DropDownPicker
              items={[
                {
                  label: '+61 AU',
                  value: '61',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                  hidden: true,
                },
                {
                  label: '+90 TUR',
                  value: '+90 TUR',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+91 IN',
                  value: '+91 IN',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+92 PAK',
                  value: '+92 PAK',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+61 AU',
                  value: '+61 AU',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                  hidden: true,
                },
                {
                  label: '+90 TUR',
                  value: '+90 TUR',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+91 IN',
                  value: '91',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+92 PAK',
                  value: '92',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+61 AU',
                  value: '61',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                  hidden: true,
                },
                {
                  label: '+90 TUR',
                  value: '90',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+91 IN',
                  value: '91',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+92 PAK',
                  value: '92',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+61 AU',
                  value: '61',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                  hidden: true,
                },
                {
                  label: '+90 TUR',
                  value: '90',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+91 IN',
                  value: '91',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+92 PAK',
                  value: '92',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+61 AU',
                  value: '61',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                  hidden: true,
                },
                {
                  label: '+90 TUR',
                  value: '90',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+91 IN',
                  value: '91',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+92 PAK',
                  value: '92',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+61 AU',
                  value: '61',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                  hidden: true,
                },
                {
                  label: '+90 TUR',
                  value: '90',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+91 IN',
                  value: '91',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+92 PAK',
                  value: '92',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+61 AU',
                  value: '61',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                  hidden: true,
                },
                {
                  label: '+90 TUR',
                  value: '90',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+91 IN',
                  value: '91',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
                {
                  label: '+92 PAK',
                  value: '92',
                  icon: () => <Icon name="flag" size={18} color="#900" />,
                },
              ]}
              dropDownMaxHeight={220}
              defaultValue={'61'}
              containerStyle={{height: 44, width: '35%', marginTop: 5}}
              style={{backgroundColor: '#ffffff'}}
              itemStyle={{
                justifyContent: 'flex-start',
              }}
              searchable={true}
              searchablePlaceholder="Search for an item"
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
                style={{height: 40, backgroundColor: 'white'}}
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
                  this.props.changePhone(phone);
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

          <View>
            <Ripple
              style={{marginTop: 0, rippleContainerBorderRadius: 4}}
              onPress={() => this._onSubmit(this.props.navigation)}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1.8, y: 0}}
                colors={['#6B23AE', '#FAD44D']}
                style={styles.gradient}>
                <Text style={styles.text}>Next</Text>
              </LinearGradient>
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
  textinputcontainermain: {
    width: '100%',
    marginTop: '15%',
    padding: '10%',
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
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    padding: 10,
  },
  button: {
    width: '100%',
    borderRadius: 50,
    marginTop: '15%',
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});

const mapStateToProps = (state) => {
  return {
    phone: state.phone,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changePhone: (phone) => {
      dispatch({type: 'CHANGE_PHONE', payload: `${phone}`});
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
