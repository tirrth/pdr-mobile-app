import React,{Component} from "react";
import { UNIVERSAL_ENTRY_POINT_ADDRESS, API_REGISTER_KEY, API_LOGIN_KEY } from "@env";
import {  
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { Checkbox, IconButton, TextInput } from 'react-native-paper';
import Ripple from 'react-native-material-ripple';
import FormHeader from '../FormHeader';
import axios from 'axios';
import { connect } from 'react-redux';
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";

// import Toast from 'react-native-toast-message';

class SignUp extends Component {
    constructor(props){
      super(props);

      this.state={
        formDetails:{
          firstName:"",
          lastName:"",
          password:"",
          confirmPassword:"",
          checkbox: false,
        },
        firstNameValidError: false,
        lastNameValidError: false,
        passwordValidError: false,
        confirmPasswordValidError: false,
        isLoading: false,

        showPassword: false,
        showConfirmPassword: false,
      }
    }

    componentNavigation(componentName){
      const { navigate } = this.props.navigation;
      navigate(componentName);
    }

    _handlerValidFirstName = (first_name) => {
      let reg = /^[a-zA-Z]{0,9}$/;

      if ((reg.test(first_name) === false) && first_name !== "") {
        this.setState({ firstNameValidError:true });
      }
      else{
        this.setState({ firstNameValidError:false });
      }
    }

    _handlerValidLastName = (last_name) => {
      let reg = /^[a-zA-Z]{0,9}$/;

      if ((reg.test(last_name) === false && last_name !== "")) {
        this.setState({ lastNameValidError:true });
      }
      else{
        this.setState({ lastNameValidError:false });
      }
    }

    _handlerValidPassword = (password) => {
      let reg = /(?=.{8,})/;

      if ((reg.test(password) === false) && password !== "") {
        this.setState({ passwordValidError:true });
      }
      else{
        this.setState({ passwordValidError:false });
      }
    }

    _handlerValidConfirmPassword = (confirm_password) => {
      if (confirm_password !== this.state.formDetails.password) {
        this.setState({ confirmPasswordValidError:true });
      }
      else{
        this.setState({ confirmPasswordValidError:false });
      }
    }

    _storeData = async (response) => {
      try{
        await AsyncStorage.setItem('token', response);
        // await AsyncStorage.setItem('expireAt', response.data.expireAt);
      }
      catch(err){
        console.log(err);
      }
    }

    _useContext = () => {
      this.props.navigation.navigate("HooksForClassCompo");
    }

    _onSubmit = (props) => {
      const { formDetails } = this.state;

      if(formDetails.firstName !== "" && formDetails.lastName !== "" && formDetails.password !== "" && formDetails.password === formDetails.confirmPassword && formDetails.checkbox){
        this.setState({ isLoading: true });
        axios({
          method: 'POST',
          url: UNIVERSAL_ENTRY_POINT_ADDRESS + API_REGISTER_KEY,
          data: {
            email: props.email,
            phone: props.phone,
            password: formDetails.password,
            first_name: formDetails.firstName,
            last_name: formDetails.lastName,
            gender:1,
          }
        })
        .then(async(response) => {
          console.log("sign up res = ",response);
          await axios.post(UNIVERSAL_ENTRY_POINT_ADDRESS + API_LOGIN_KEY, 
            {
              email_or_phone: props.email,
              password: formDetails.password,
            })
            .then(res => {
              console.log("login = ",res);
              this.setState({ isLoading: false });
              this._storeData(res.data.token);
              this._useContext();
              // props.navigation.navigate("BusinessDetails");
              
            })
            .catch(err => {
              console.log({...err});
              this.setState({ isLoading: false });
              alert(err.response.data.message || 'Error!');
            });
        })
        .then(() => {
          this.setState({ formDetails: {
            ...formDetails, 
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
            checkbox: false,
          } });
        })
        .catch((error) => {
          console.log({...error});
          this.setState({ isLoading: false });
          alert(error.response.data.email || error.response.data.phone);
        });
      }
      else if(!formDetails.checkbox){
        alert("Please indicate that you accept the Terms and Conditions");
      }
      else{
        alert("Please Fill Everything up Properly!!");
      }
    }

    render(){
      const { isLoading } = this.state;
      const { navigate } = this.props.navigation;
      return (
            <ScrollView style={{backgroundColor: 'white'}} showsVerticalScrollIndicator={false}>
                {/* <Toast ref={(ref) => Toast.setRef(ref)} /> */}
                <FormHeader headerTitle='Sign Up' />

                <View style={styles.textinputcontainermain}>
                    <View style={styles.textinputemail}>
                        <TextInput
                            mode='outlined'
                            label={this.state.firstNameValidError ? "Must Be Less Than 10 Characters Long*" : "First Name"}
                            dense
                            onEndEditing={(e) => this._handlerValidFirstName(e.nativeEvent.text)}
                            onSubmitEditing={() => {this.textInputSecond.focus()}}
                            onChangeText={(text) => {this.setState({ formDetails: {...this.state.formDetails, firstName:text} })}}
                            style={{backgroundColor:'white'}}
                            autoFocus={true}
                            error={this.state.firstNameValidError ? true : false}
                            textContentType='givenName'
                            />
                    </View>
                    <View style={styles.textinputemail}>
                        <TextInput
                            mode='outlined'
                            label={this.state.lastNameValidError ? "Must Be Less Than 10 Characters Long*" : "Last Name"}
                            dense
                            onEndEditing={(e) => this._handlerValidLastName(e.nativeEvent.text)}
                            ref={(input) => this.textInputSecond = input}
                            onSubmitEditing={() => {this.textInputThree.focus()}}
                            onChangeText={(text) => {this.setState({ formDetails: {...this.state.formDetails, lastName:text} })}}
                            style={{backgroundColor:'white'}}
                            error={this.state.lastNameValidError ? true : false}
                            textContentType='familyName'
                            />
                    </View>
                    <View style={{...styles.textinputemail, flexDirection:'row', justifyContent:'center'}}>
                        <TextInput
                            mode='outlined'
                            label={this.state.passwordValidError ? "Password Must Be 8 Characters Long*" : "Enter Password"}
                            autoCapitalize="none"
                            secureTextEntry={this.state.showPassword ? false : true}
                            dense
                            onEndEditing={(e) => this._handlerValidPassword(e.nativeEvent.text)}
                            ref={(input) => this.textInputThree = input}
                            onSubmitEditing={() => {this.textInputFour.focus()}}
                            onChangeText={(text) => {this.setState({ formDetails: {...this.state.formDetails, password:text} }); console.log(text);}}
                            style={{backgroundColor:'white', width:'100%'}}
                            error={this.state.passwordValidError ? true : false}
                            textContentType='password'
                            />
                        <View style={{ zIndex:1000, width:40, marginLeft:-40, paddingRight:5, alignItems:'center', justifyContent:'center', marginTop:6 }}>
                          <IconButton onPress={() => this.setState({showPassword: !this.state.showPassword})} icon={!this.state.showPassword ? 'eye' : 'eye-off'} size={18} color='#8d8d8d' />
                        </View>
                    </View>
                    <View style={{...styles.textinputemail, flexDirection:'row', justifyContent:'center'}}>
                      <TextInput
                          mode='outlined'
                          label={this.state.confirmPasswordValidError ? "Password Not Matching*" : "Confirm Password"}
                          autoCapitalize="none"
                          secureTextEntry={this.state.showConfirmPassword ? false : true}
                          dense
                          onEndEditing={(e) => this._handlerValidConfirmPassword(e.nativeEvent.text)}
                          ref={(input) => this.textInputFour = input}
                          onChangeText={(text) => {this.setState({ formDetails: {...this.state.formDetails, confirmPassword:text} })}}
                          style={{backgroundColor:'white', width:'100%'}} 
                          error={this.state.confirmPasswordValidError ? true : false}
                          textContentType='password'
                      />
                      <View style={{ zIndex:1000, width:40, marginLeft:-40, paddingRight:5, alignItems:'center', justifyContent:'center', marginTop:6 }}>
                        <IconButton onPress={() => this.setState({showConfirmPassword: !this.state.showConfirmPassword})} icon={!this.state.showConfirmPassword ? 'eye' : 'eye-off'} size={18} color='#8d8d8d' />
                      </View>
                    </View>
                    {/* <View style={styles.textinputemail}>
                        <TextInput
                            mode='outlined'
                            label={this.state.confirmPasswordValidError ? "Password Not Matching*" : "Confirm Password"}
                            autoCapitalize="none"
                            secureTextEntry={true}
                            dense
                            onEndEditing={(e) => this._handlerValidConfirmPassword(e.nativeEvent.text)}
                            ref={(input) => this.textInputFour = input}
                            onChangeText={(text) => {this.setState({ formDetails: {...this.state.formDetails, confirmPassword:text} })}}
                            style={{backgroundColor:'white'}}
                            error={this.state.confirmPasswordValidError ? true : false}
                            textContentType='password'
                            />
                    </View> */}
                    <View style={styles.checkboxContainer}>
                        <Checkbox onPress={() => {this.setState({formDetails:{...this.state.formDetails, checkbox:!this.state.formDetails.checkbox}})}} status={this.state.formDetails.checkbox ? "checked" : "unchecked"} color='#468bf5' />
                        <Text style={styles.label}>{'Agree Terms & Condtions*'}</Text>
                    </View>
                    <View style={{flexDirection:'row', justifyContent:'center'}}>
                        <Ripple style={{width:'60%', rippleContainerBorderRadius:4}} onPress={() => this._onSubmit(this.props)}>
                          <LinearGradient start={{x: 0, y: 0}} end={{x: 1.8, y: 0}} colors={['#6B23AE', '#FAD44D']} style={{...styles.gradient, height:40}}>
                              {isLoading ? <ActivityIndicator size={18} color='#fff' /> : <Text style={{ fontSize: 14, color: '#fff' }}>Submit</Text>}
                          </LinearGradient>
                        </Ripple>
                    </View>

                    <View style={{marginTop:'10%', alignSelf:'center'}}>
                        <Text style={{ color: 'black' }}>Already have An Account? <Text style={{color: '#6B23AE', fontWeight: 'bold'}} onPress={() => { navigate("Login")}} > Sign In </Text> </Text>
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
      marginTop: '15%',
      padding: '10%',
    },
    textinputemail:{
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
    button: {
      width: '100%',
      height: 42,
      borderRadius: 4,
      borderColor:'#6B23AE',
      justifyContent:'center',
      alignItems:'center',
      borderWidth:1, 
    },
    text: {
      color: 'white',
      fontSize: 16
    },
    checkboxContainer: {
        flexDirection: "row",
        marginBottom: 15,
      },
        label: {
        margin: 8,
        marginLeft:0
    },
  });


const mapStateToProps = (state) => {
  return {
    email:state.email,
    phone:state.phone,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeEmail:(email) => {dispatch({type:'CHANGE_EMAIL', payload:email})},
    changePhone:(phone) => {dispatch({type:'CHANGE_PHONE', payload:phone})},
    // changeUserToken:(user_token) => {dispatch({type: 'CHANGE_USER_TOKEN', payload:user_token})},
  }
};
  
export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
