import React, { Component } from 'react';
import { ActivityIndicator, View, ScrollView, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ripple from 'react-native-material-ripple';
import FormHeader from '../FormHeader';
import { UNIVERSAL_ENTRY_POINT_ADDRESS, API_SAVE_BUYER_TEMPORARY_KEY } from '@env';
import axios from 'axios';
import { connect } from 'react-redux';

class SocialSignUpAdditionalInputs extends Component {
    constructor(props){
        super(props);

        this.state = {
            phone: "",
            phoneValidateError: "",

            isSubmitLoading: false,
        }
    }

    _handlerValidPhone = (phone) => {
        var regx_number = /^[0-9]+$/;
        if(phone === ""){
          this.setState({ phoneValidateError: "Phone Required" });
        }
        else if(regx_number.test(phone) === false){
          this.setState({ phoneValidateError: "Invalid Phone" });
        }
        else{
          this.setState({ phoneValidateError: "" });
        }
    }

    _onSubmit = () => {
        if(!this.state.phoneValidateError){
            this.setState({ isSubmitLoading: true });
            this.props.changePhone(this.state.phone);
            axios({
                method: 'POST',
                url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_SAVE_BUYER_TEMPORARY_KEY,
                data: {
                  email: this.props.email,
                  phone: this.state.phone
                }
              })
              .then((response) => {
                console.log(response);
                this.setState({ phone: "", isSubmitLoading: false });
                this.props.navigation.navigate("OTPVerification", { only_mobile_otp: false, phone_otp: response.data.phone_otp, email_otp: response.data.email_otp  });
              })
              .catch((error) => {
                // handle error
                this.setState({ isSubmitLoading: false });
                console.log({...error});
                alert(error.response.data.email || error.response.data.phone);
              }); 
        }
    }

    render() {
        return (
            <ScrollView style={{backgroundColor: 'white'}}>
                <FormHeader headerTitle='Sign Up'/>

                <View style={styles.textinputcontainermain}>
                    <View style={styles.textinputphone}>
                        <TextInput 
                            dense 
                            mode='outlined'
                            label={this.state.phoneValidateError ? this.state.phoneValidateError+"*" : "Phone"}
                            style={{ backgroundColor:'white'}} 
                            autoCapitalize="none"
                            onChangeText={(phone) => this.setState({ phone: phone })}
                            onEndEditing={(e) => this._handlerValidPhone(e.nativeEvent.text)}
                            onSubmitEditing={() => this._onSubmit()}
                            autoFocus={true}
                            keyboardType='phone-pad'
                            error={this.state.phoneValidateError ? true : false}
                            textContentType='telephoneNumber'
                        />
                    </View>
                </View>

                <View style={{flexDirection:'row', justifyContent:'center', marginBottom:20}}>
                    <Ripple style={{width:'60%', rippleContainerBorderRadius:4}} onPress={() => this._onSubmit()}>
                        <LinearGradient start={{x: 0, y: 0}} end={{x: 1.8, y: 0}} colors={['#6B23AE', '#FAD44D']} style={{...styles.gradient, height:40}}>
                            {this.state.isSubmitLoading ? <ActivityIndicator size={18} color='#fff' /> : <Text style={{ fontSize: 14, color: '#fff' }}>Login</Text>}
                        </LinearGradient>
                    </Ripple>
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    textinputcontainermain:{
        width: '100%',
        marginTop: '15%',
        padding: '10%',
    },
    textinputphone:{
        width: '100%',
        marginBottom: '5%',
    },

    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
        borderRadius: 4,
        paddingHorizontal:10,
    },
})

const mapStateToProps = (state) => {
    return {
      email:state.email,
    }
  };
  
  const mapDispatchToProps = (dispatch) => {
    return {
      changePhone:(phone) => {dispatch({type:'CHANGE_PHONE', payload:phone})},
    }
  };
    
  export default connect(mapStateToProps, mapDispatchToProps)(SocialSignUpAdditionalInputs);
