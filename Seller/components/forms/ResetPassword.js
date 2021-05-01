// import React,{Component} from "react";
// import {  
//     View,
//     Text,
//     StyleSheet,
//     ScrollView,
// } from "react-native";

// import axios from 'axios';
// import FormHeader from '../FormHeader';

// import { TextInput} from 'react-native-paper';

// import Ripple from 'react-native-material-ripple';

// class ResetPassword extends Component {

//     componentNavigation(componentName){
//         const { navigate } = this.props.navigation;
//         navigate(componentName);
//     }

//     render(){
//       const { navigate } = this.props.navigation;
      
//       return (
//         <ScrollView style={{backgroundColor: 'white'}}>

//             <FormHeader headerTitle='Reset Password' navigation={()=>this.componentNavigation('AddNewAddress')} />

//             <View style={styles.textinputcontainermain}>
//                 <View>
//                     <TextInput style={{ backgroundColor:'transparent', marginBottom:20}} autoCapitalize="none" secureTextEntry={true} label="Password"/>
//                 </View>
//                 <View>
//                     <TextInput style={{ backgroundColor:'transparent', marginBottom:30}} autoCapitalize="none" secureTextEntry={true} label="Confirm Password"/>
//                 </View>
                
//                 <View style={{flexDirection:'row'}}>
//                     <Ripple style={{width:'50%',rippleContainerBorderRadius:4}} onPress={() => navigate('ForgotPassword')}>
//                         <View style={{...styles.button, borderTopRightRadius:0, borderBottomRightRadius:0, backgroundColor:'white'}}><Text style={{color:'purple'}} 
//                         >Back</Text>
//                         </View>
//                     </Ripple>
//                     <Ripple style={{width:'50%', rippleContainerBorderRadius:4}} onPress={() => navigate('Home')}>
//                         <View style={{...styles.button, borderTopLeftRadius:0, borderBottomLeftRadius:0, backgroundColor:'purple'}}><Text style={{color:'white'}} 
//                             >Confirm</Text>
//                         </View>
//                     </Ripple>
//                 </View>
//             </View>
//         </ScrollView>
//       );
//     }
//   }


// const styles = StyleSheet.create({
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
//       width: '100%',
//       marginTop: '8%',
//       padding: '10%',
//     },
//     gradient: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems:'center',
//       borderRadius: 5
//     },
//     button: {
//         width: '100%',
//         height: 42,
//         borderRadius: 4,
//         borderColor:'purple',
//         justifyContent:'center',
//         alignItems:'center',
//         borderWidth:1, 
//       },
 
// });


// export default ResetPassword;


import React,{Component} from "react";
import {  
    View,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";
import { UNIVERSAL_ENTRY_POINT_ADDRESS, API_NEW_PASSWORD_KEY } from '@env';
import axios from 'axios';
import FormHeader from '../FormHeader';
import { IconButton, TextInput} from 'react-native-paper';
import Ripple from 'react-native-material-ripple';

class ResetPassword extends Component {

    constructor(props){
      super(props);

      this.state = {
        password:"",
        confirmPassword:"",
        passwordValidation: false,
        confirmPasswordValidation: false,

        showPassword: false,
        showConfirmPassword: false,
      }
    }

    componentNavigation(componentName){
      const { navigate } = this.props.navigation;
      navigate(componentName);
    }

    _onPasswordClick = (password) => {
      this.setState({ password: password });
    }

    _onConfirmPasswordClick = (confirm_pass) => {
      this.setState({ confirmPassword: confirm_pass });
    }

    _passwordValidation = (password) => {
      let reg = /(?=.{8,})/;

      if ((reg.test(password) === false) && password !== "") {
        this.setState({ passwordValidation:true });
      }
      else{
        this.setState({ passwordValidation:false });
      }
    }

    _confirmPasswordValidation = (confirm_password) => {
      if (confirm_password !== this.state.password) {
        this.setState({ confirmPasswordValidation:true });
      }
      else{
        this.setState({ confirmPasswordValidation:false });
      }
    }

    _onSubmit = () => {
      const { password, confirmPassword, passwordValidation, confirmPasswordValidation } = this.state;
      const { phone, phoneOTP } = this.props.route.params;
      console.log(phoneOTP);

      if(!passwordValidation && !confirmPasswordValidation){
        axios({
          method: 'POST',
          url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_NEW_PASSWORD_KEY,
          data: {
            phone: phone,
            password: password,
            confirm_password: confirmPassword,
            phone_otp: phoneOTP,
          }
        })
        .then((response) => {
          console.log(response);
          this.props.navigation.navigate("Login");
        })
        .catch((error) => {
          console.log(error);
          alert(error);
        });
      }else{
        alert("Please Fill Everything up Properly!!");
      }
    }

    render(){
      const { navigate } = this.props.navigation;
      
      return (
        <ScrollView style={{backgroundColor: 'white'}}>

            <FormHeader headerTitle='Reset Password' navigation={()=>this.componentNavigation('AddNewAddress')} />

            <View style={styles.textinputcontainermain}>
                {/* <View>
                    <TextInput 
                      dense
                      mode='outlined'
                      style={{ backgroundColor:'white', marginBottom:20}} 
                      autoCapitalize="none" 
                      secureTextEntry={true} 
                      label={this.state.passwordValidation ? "Password Must Be 8 Characters Long*" : "Password"}
                      onChangeText={(password) => this._onPasswordClick(password)} 
                      onEndEditing={(e) => this._passwordValidation(e.nativeEvent.text)}
                      error={this.state.passwordValidation ? true : false}
                    />
                </View>
                <View>
                    <TextInput 
                      dense
                      mode='outlined'
                      style={{ backgroundColor:'white', marginBottom:30}} 
                      autoCapitalize="none" 
                      secureTextEntry={true} 
                      label={ this.state.confirmPasswordValidation ? "Password Not Matching" : "Confirm Password"}
                      onChangeText={(confirm_pass) => this._onConfirmPasswordClick(confirm_pass)} 
                      onEndEditing={(e) => this._confirmPasswordValidation(e.nativeEvent.text)} 
                      error={this.state.confirmPasswordValidation ? true : false}
                      onSubmitEditing={() => this.submitBtn.focus()}
                    />
                </View> */}
                <View style={{flexDirection:'row', justifyContent:'center', marginBottom:10}}>
                    <TextInput 
                      dense
                      mode='outlined'
                      style={{ backgroundColor:'white', width:'100%'}} 
                      autoCapitalize="none" 
                      secureTextEntry={this.state.showPassword ? false : true} 
                      label={this.state.passwordValidation ? "Password Must Be 8 Characters Long*" : "Password"}
                      onChangeText={(password) => this._onPasswordClick(password)} 
                      onEndEditing={(e) => this._passwordValidation(e.nativeEvent.text)}
                      error={this.state.passwordValidation ? true : false}
                    />
                    <View style={{ zIndex:1000, width:40, marginLeft:-40, paddingRight:5, alignItems:'center', justifyContent:'center', marginTop:6 }}>
                        <IconButton onPress={() => this.setState({showPassword: !this.state.showPassword})} icon={!this.state.showPassword ? 'eye' : 'eye-off'} size={18} color='#8d8d8d' />
                    </View>
                </View>
                <View style={{flexDirection:'row', justifyContent:'center', marginBottom:20}}>
                    <TextInput 
                      dense
                      mode='outlined'
                      style={{ backgroundColor:'white', width:'100%'}} 
                      autoCapitalize="none" 
                      secureTextEntry={this.state.showConfirmPassword ? false : true} 
                      label={ this.state.confirmPasswordValidation ? "Password Not Matching" : "Confirm Password"}
                      onChangeText={(confirm_pass) => this._onConfirmPasswordClick(confirm_pass)} 
                      onEndEditing={(e) => this._confirmPasswordValidation(e.nativeEvent.text)} 
                      error={this.state.confirmPasswordValidation ? true : false}
                      onSubmitEditing={() => this.submitBtn.focus()}
                    />
                    <View style={{ zIndex:1000, width:40, marginLeft:-40, paddingRight:5, alignItems:'center', justifyContent:'center', marginTop:6 }}>
                        <IconButton onPress={() => this.setState({showConfirmPassword: !this.state.showConfirmPassword})} icon={!this.state.showConfirmPassword ? 'eye' : 'eye-off'} size={18} color='#8d8d8d' />
                    </View>
                </View>
                
                <View style={{flexDirection:'row'}}>
                    <Ripple style={{width:'50%',rippleContainerBorderRadius:4}} onPress={() => navigate('ForgotPassword')}>
                        <View style={{...styles.button, borderTopRightRadius:0, borderBottomRightRadius:0, backgroundColor:'white'}}><Text style={{color:'#6B23AE'}} 
                        >Back</Text>
                        </View>
                    </Ripple>
                    <Ripple style={{width:'50%', rippleContainerBorderRadius:4}} onPress={() => this._onSubmit()} ref={(ref) => (this.submitBtn = ref)} >
                        <View style={{...styles.button, borderTopLeftRadius:0, borderBottomLeftRadius:0, backgroundColor:'#6B23AE'}}><Text style={{color:'white'}} 
                            >Reset</Text>
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
    imagelogoContainer :{
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      marginTop:'60%'
    },
    textinputcontainermain:{
      width: '100%',
      marginTop: '8%',
      padding: '10%',
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems:'center',
      borderRadius: 5
    },
    button: {
        width: '100%',
        height: 42,
        borderRadius: 4,
        borderColor:'#6B23AE',
        justifyContent:'center',
        alignItems:'center',
        borderWidth:1, 
      },
 
});


export default ResetPassword;