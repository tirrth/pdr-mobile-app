import React,{Component} from "react";
import { UNIVERSAL_ENTRY_POINT_ADDRESS, API_RESEND_OTP_KEY, API_SOCIAL_LOGIN_KEY, API_FORGOT_PASSWORD_KEY, API_PHONE_EMAIL_OTP_VERIFICATION_KEY, API_PHONE_OTP_VERIFICATION_KEY } from '@env';
import {  
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Modal,
    ActivityIndicator,
    Pressable
} from "react-native";
import { connect } from 'react-redux';
import Ripple from 'react-native-material-ripple';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import FormHeader from '../FormHeader';
import { ToastAndroid } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

class ResetPasswordOTP extends Component {
    otpEmailTextInput = [];
    otpPhoneTextInput = [];

    constructor(props){
        super(props);
        this.state={
            modalVisibility:false,
            modalLoader:false,

            otp_email: [],
            otp_phone: [],

            minuteCounter: 1,
            secondCounter: 0,
            isCounterActive: true,
            
            temp_phone_otp: "",
            temp_email_otp: "",
        }
    }

    componentDidMount(){
      const { only_mobile_otp } = this.props.route.params;
      if(only_mobile_otp){
        const { phone_otp } = this.props.route.params;
        this.otpPhoneTextInput[0].focus();
        this.setState({ temp_phone_otp: phone_otp });
      }
      else{
        const { email_otp, phone_otp } = this.props.route.params;
        this.otpEmailTextInput[0].focus();
        this.setState({ temp_email_otp: email_otp, temp_phone_otp: phone_otp });
      } 
      this._otpCounter();
    }

    _otpCounter = () => {
      const { secondCounter, minuteCounter } = this.state;

      if(secondCounter === 0 && minuteCounter === 0){
        this.setState({ isCounterActive: false, minuteCounter: 3, secondCounter: 0 });
      }
      else{
        setTimeout(async() => {
          if(secondCounter === 0){
            this.setState({ minuteCounter: this.state.minuteCounter - 1 });
            this.setState({ secondCounter: 59 });
            this._otpCounter();
          }
          else{
            this.setState({ secondCounter: this.state.secondCounter - 1 });
            this._otpCounter();
          }
        }, 1000);
      }
    }

    componentNavigation(componentName){
        const { navigate } = this.props.navigation;
        navigate(componentName);
    }

    // _useContext = () => {
    //   this.props.navigation.navigate("HooksForClassCompo");
    // }

    _storeData = async (response) => {
      try{
        await AsyncStorage.setItem('token', response);
        // await AsyncStorage.setItem('expireAt', response.data.expireAt);
      }
      catch(err){
        console.log(err);
      }
    }

    _socialLoginSignUp = () => {
      axios.post(UNIVERSAL_ENTRY_POINT_ADDRESS + API_SOCIAL_LOGIN_KEY, {
        account_type: this.props.account_type,
        email: this.props.email,
        phone: this.props.phone,
        first_name: `${this.props.socialLoginProfileName}`.split(" ")[0],
        last_name: `${this.props.socialLoginProfileName}`.split(" ")[1],
        gender: 1,
        provider: this.props.socialLoginProvider
      })
      .then((res) => {
        this.setState({ modalLoader:false });
        console.log(res);
        this.props.changeUserToken(res.data.token);
        this.props.navigation.navigate("BusinessDetails");
      })
      .catch(err => {
        this.setState({ modalLoader:false });
        console.log({...err});
        alert(err.response.data.email || err.response.data.phone);
      })
    }

    verificationProcess = () => {
      let otp_email = "";
      let otp_phone = "";
      this.state.otp_email.map(item => otp_email = otp_email + item);
      this.state.otp_phone.map(item => otp_phone = otp_phone + item);
      // console.log(this.props.email, this.props.phone, otp_email, otp_phone);
      if(otp_email.length === 4 && otp_phone.length === 4){
        this.setState({ modalLoader:true });
        axios({
          method: 'POST',
          url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_PHONE_EMAIL_OTP_VERIFICATION_KEY,
          data: {
            email: this.props.email,
            phone: this.props.phone,
            email_otp: otp_email,
            phone_otp: otp_phone,
          }
        })
        .then(response => { 
          console.log(response);
          if(this.props.isSocialLogin){
            this._socialLoginSignUp();
          }
          else{
            this.setState({ modalLoader:false, modalVisibility:true });
          }
          this.setState({ otp_email:[], otp_phone:[] });
        })
        .catch(error => {
          console.log(error.response.data);
          this.setState({ modalLoader:false });
          alert(error.response.data.message);
        });
      }
      else{
        alert("OTP is not valid.");
      }
    }

    _phoneOtpVerificationProcess = () => {
      this.setState({ modalLoader: true });
      let otp_phone = "";
      this.state.otp_phone.map(item => otp_phone = otp_phone + item);

      axios({
        method: 'POST',
        url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_PHONE_OTP_VERIFICATION_KEY,
        data: {
          phone: this.props.phone,
          phone_otp: otp_phone,
        }
      })
      .then(response => { 
        console.log(response);
        this.setState({ modalLoader:false, modalVisibility:true });
      })
      .catch(error => {
        console.log(error.response.data);
        this.setState({ modalLoader:false });
        alert(error.response.data.message);
      });
    }

    _onToastMessageSent = () => {
      ToastAndroid.showWithGravityAndOffset(
        "OTP sent successfully!!",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    }

    successfulVerificationProcess = () => {
        const { navigate } = this.props.navigation;
        const { only_mobile_otp } = this.props.route.params;

        if(!this.props.isSocialLogin){
          if(only_mobile_otp){
            let otp_phone = "";
            this.state.otp_phone.map(item => otp_phone = otp_phone + item);
            navigate('ResetPassword', { phone: this.props.phone, phoneOTP: otp_phone });
          }
          else{
            navigate('SignUpUserPassword');
          }
        }
        this.setState({ modalLoader: false, modalVisibility:false })
    }

    _onResendOTPPress = () => {
      const { only_mobile_otp } = this.props.route.params;
      if(only_mobile_otp){
        axios({
          method: 'POST',
          url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_FORGOT_PASSWORD_KEY,
          data: {
            phone: this.props.phone
          }
        })
        .then(async (response) => {
          console.log(response);
          this._onToastMessageSent();
          await this.setState({ isCounterActive: true, minuteCounter: 3, secondCounter: 0 });
        })
        .catch((error) => {
          console.log(error.response.data);
          alert(error.response.data.message);
        }); 
      }
      else{
        axios({
          method: 'POST',
          url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_RESEND_OTP_KEY,
          data: {
            email: this.props.email,
            phone: this.props.phone
          }
        })
        .then(async (response) => {
          // handle success
          console.log(response);
          this._onToastMessageSent();
          await this.setState({ isCounterActive: true, minuteCounter: 3, secondCounter: 0 });
        })
        .catch((error) => {
          // handle error
          console.log({...error});
          alert(error.response.data.message);
        }); 
      }
    }

    //for email otp
    focusEmailPrevious(key, index) {
      if (key === 'Backspace' && index !== 0)
          this.otpEmailTextInput[index - 1].focus();
    }

    focusEmailNext(index, value) {
        if (index < this.otpEmailTextInput.length - 1 && value) {
            this.otpEmailTextInput[index + 1].focus()
        }
        if (index === this.otpEmailTextInput.length - 1) {
            this.otpEmailTextInput[index].blur();
        }
        const otp_email = this.state.otp_email;
        otp_email[index] = value;
        this.setState({ otp_email });
    }

    //for phone otp
    focusPhonePrevious(key, index) {
      if (key === 'Backspace' && index !== 0)
          this.otpPhoneTextInput[index - 1].focus();
    }

    focusPhoneNext(index, value) {
      const { only_mobile_otp } = this.props.route.params;
      if (index < this.otpPhoneTextInput.length - 1 && value) {
          this.otpPhoneTextInput[index + 1].focus()
      }
      if (index === this.otpPhoneTextInput.length - 1) {
          this.otpPhoneTextInput[index].blur();
      }
      const otp_phone = this.state.otp_phone;
      otp_phone[index] = value;
      this.setState({ otp_phone });
      if(index === (this.otpPhoneTextInput.length - 1)){
        if(only_mobile_otp){
          this._phoneOtpVerificationProcess();
        }
        else{
          this.verificationProcess();
        }
      }
    }
  
    render(){
      const otp_inputs = Array(4).fill(0);
      const { only_mobile_otp } = this.props.route.params;

      return (
        <View style={{height:'100%'}}>
          <ScrollView style={{backgroundColor:'white'}}>
            
            <FormHeader headerTitle='OTP Verification' />

            {this.state.temp_email_otp || this.state.temp_phone_otp ?
            <View style={{alignSelf:'center', marginTop:60}}>
              {this.state.temp_email_otp ? <Text style={{color:'#6B23AE', fontWeight:'bold'}}>Temporary Email OTP: <Text style={{color:'black'}}>{this.state.temp_email_otp}</Text></Text> : null}
              {this.state.temp_phone_otp ? <Text style={{color:'#6B23AE', fontWeight:'bold'}}>Temporary Phone OTP: <Text style={{color:'black'}}>{this.state.temp_phone_otp}</Text></Text> : null}
            </View> : null}

            {!only_mobile_otp &&
            <View>
                <View style={{...styles.textinputcontainermain, marginTop:'18%', paddingLeft:24, paddingRight:24, justifyContent:'center', alignItems:'center'}}>
                    <Text style={{fontSize:14, textAlign:'center', color:'#8d8d8d', lineHeight:19}}>An OTP has been sent to {this.props.email} Please enter the OTP in the field below to verify your Email.</Text>
                </View>
                <View style={styles.otpBoxesContainer}>
                  {otp_inputs.map((i, j) => {
                    return(
                      <View key={j} style={styles.otpinputWrap}>
                          <TextInput 
                            style={{ ...styles.textInputOTP }}
                            keyboardType="numeric"
                            onChangeText={v => this.focusEmailNext(j, v)}
                            onKeyPress={e => this.focusEmailPrevious(e.nativeEvent.key, j)}
                            ref={ref => { this.otpEmailTextInput[j] = ref }}
                          />
                      </View>
                    );
                  })}
                </View>
            </View>}

            <View style={{ marginTop: only_mobile_otp ? 10 : 0 }}>
                <View style={{...styles.textinputcontainermain, paddingLeft:24, paddingRight:24, justifyContent:'center', alignItems:'center',marginTop:'10%'}}>
                    <Text style={{fontSize:14, textAlign:'center', color:'#8d8d8d', lineHeight:19}}>An OTP has been sent to +{this.props.phone}. Please enter the OTP in the field below to verify your Phone.</Text>
                </View>
                <View style={styles.otpBoxesContainer}>
                  {otp_inputs.map((i, j) => {
                    return(
                      <View key={j} style={styles.otpinputWrap}>
                          <TextInput 
                            style={{ ...styles.textInputOTP }}
                            keyboardType="numeric"
                            onChangeText={v => this.focusPhoneNext(j, v)}
                            onKeyPress={e => this.focusPhonePrevious(e.nativeEvent.key, j)}
                            ref={ref => { this.otpPhoneTextInput[j] = ref }}
                          />
                      </View>);
                    })}
                </View>
                <View style={{...styles.textinputcontainermainSecond, flexDirection:'row', alignItems:'center'}}>
                  <Text style={{color:'#8d8d8d'}}>Didn't get any Code? </Text>
                  <Pressable onPress={() => !this.state.isCounterActive ? null : this._onResendOTPPress()}>
                    <Text style={{color: '#6B23AE', fontWeight: 'bold'}}>Try Again</Text>
                  </Pressable>
                  {this.state.isCounterActive ? <Text style={{color: '#6B23AE', fontWeight: 'bold'}}>{` in ${this.state.minuteCounter < 10 ? '0' + this.state.minuteCounter : this.state.minuteCounter}:${this.state.secondCounter < 10 ? '0' + this.state.secondCounter : this.state.secondCounter}`}</Text> : null}
                </View>
            </View>
            <View>
                <View style={styles.submitbtn}>
                  <Ripple style={{marginTop:30, rippleContainerBorderRadius:4}} onPress={() => {only_mobile_otp ? this._phoneOtpVerificationProcess() : this.verificationProcess()}}>
                    <LinearGradient start={{x: 0, y: 0}} end={{x: 1.8, y: 0}} colors={['#6B23AE', '#FAD44D']} style={styles.gradient}>
                        {!this.state.modalLoader ? <Text style={styles.text}>Verify</Text> : <ActivityIndicator size={24} color="#fff" />}
                    </LinearGradient>
                  </Ripple>
                </View>
            </View>
          </ScrollView>
          <View style={{height:this.state.modalVisibility && !this.state.modalLoader  ? '100%' : null, width: this.state.modalVisibility && !this.state.modalLoader ? '100%' : null, position:'absolute', top:0, left:0, backgroundColor:this.state.modalVisibility && !this.state.modalLoader ? 'rgba(0,0,0,0.8)' : null, zIndex:this.state.modalVisibility && !this.state.modalLoader ? 1000 : null }}>
              <Modal
                  style={{}}
                  animationType="fade"
                  transparent={true}
                  visible={this.state.modalVisibility && !this.state.modalLoader}
              >
                  <View style={styles.centeredView}>
                      <View>
                          <View style={styles.modalView}>
                              <Text style={{...styles.modalText, fontWeight:'700', fontSize:20}}>Success</Text>
                              <Text style={{...styles.modalText, color:'#8d8d8d', lineHeight:20}}>Your OTP has been Verified Successfully.</Text>
                              <View style={styles.button} >
                                <Ripple style={{marginTop:8, rippleContainerBorderRadius:4, height:40}} onPress={() => this.successfulVerificationProcess()}>
                                  <LinearGradient start={{x: 0, y: 0}} end={{x: 1.8, y: 0}} colors={['#6B23AE', '#FAD44D']} style={styles.gradient}>
                                      <Text style={styles.text}>Next</Text>
                                  </LinearGradient>
                                </Ripple>
                              </View>
                          </View>
                      </View>
                  </View>
              </Modal>
            </View>
        </View>
      );
    }
  }


  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22
    },
    modalViewYellowOffset:{
      backgroundColor:'yellow',
      margin: 20,
      borderRadius: 14,
      paddingBottom:10,
      shadowOffset: {
          width: 0,
          height: 2
        },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,

    },
    modalView: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 35,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    openButton: {
      backgroundColor: "#F194FF",
      borderRadius: 20,
      padding: 10,
      elevation: 2
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      marginBottom: 10,
      textAlign: "center"
    },

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
      marginTop: '20%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textinputcontainermainSecond:{
        width: '100%',
        marginTop: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpBoxesContainer:{
        flex: 1,
        flexDirection: "row",
        padding: '10%',
        paddingBottom: 0,
        paddingTop:0,
        marginTop:20
    },
    otpinputWrap:{
      flex: 1,
      paddingLeft:10,
      paddingRight:10,
      textAlign:"center",
    },
    textInputOTP:{
        height: 55, 
        fontSize: 20,  
        width: 55, 
        borderWidth: 1, 
        borderRadius: 5, 
        textAlign: 'center',
        borderColor:'#dddddd'
    },
    textinputcontainermainMobile:{
      width: '100%',
      marginTop: '15%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitbtn:{
      width: '100%',
      padding: '10%',
      paddingTop:0,
},
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
        borderRadius: 4,
        padding:10
    },
    button: {
      width: '100%',
      height: 45,
    },
    text: {
      color: 'white',
      fontSize: 16
    },
  });
  
  
const mapStateToProps = (state) => {
  return {
    email:state.email,
    phone:state.phone,
    account_type: state.account_type,

    isSocialLogin: state.isSocialLogin,
    socialLoginProfileName: state.socialLoginProfileName,
    socialLoginProvider: state.socialLoginProvider
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeEmail:(email) => {dispatch({type:'CHANGE_EMAIL', payload:email})},
    changePhone:(phone) => {dispatch({type:'CHANGE_PHONE', payload:`${phone}`})},
    changeUserToken:(token) => {dispatch({type: 'CHANGE_USER_TOKEN', payload: token})},
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPasswordOTP);