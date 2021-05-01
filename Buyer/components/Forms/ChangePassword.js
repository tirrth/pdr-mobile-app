import React, { Component } from 'react';
import { UNIVERSAL_ENTRY_POINT_ADDRESS, API_CHANGE_PASSWORD_KEY } from '@env';
import { View, StatusBar, StyleSheet, Text, Modal } from 'react-native';
import Ripple from 'react-native-material-ripple';
import LinearGradient from 'react-native-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button, IconButton } from 'react-native-paper';
import FormHeader from '../FormHeader';
import { ToastAndroid } from 'react-native';

export default class ChangePassword extends Component {

    constructor(props){
        super(props);

        this.state = {
            checkboxToggle: false,
            oldPassword: "",
            newPassword: "",
            confirmNewPassword:"",
            modalVisibility: false,

            showPassword: false,
            showConfirmPassword: false,
        }
    }

    _checkboxToggle = () => {
        this.setState({ checkboxToggle: !this.state.checkboxToggle });
    }

    _onOldPasswordChange = (old_password) => {
        this.setState({ oldPassword: old_password });
    }

    _onNewPasswordChange = (new_password) => {
        this.setState({ newPassword: new_password });
    }

    _onConfirmNewPasswordChange = (confirm_new_password) => {
        this.setState({ confirmNewPassword: confirm_new_password });
    }

    _toastMessage = (message) => {
        ToastAndroid.showWithGravityAndOffset(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
            25,
            50
        );
    }

    _onSubmit = async () => {
        const { oldPassword, newPassword, confirmNewPassword } = this.state;
        
        if(oldPassword && newPassword && confirmNewPassword){
            if(newPassword !== confirmNewPassword){
                this._toastMessage("Password not matching!!");
            }
            else{
                try{
                    const value = await AsyncStorage.getItem('token');
                    const data = {
                        current_password: this.state.oldPassword,
                        new_password: this.state.newPassword,
                        confirm_new_password: this.state.confirmNewPassword
                    }
                    const url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_CHANGE_PASSWORD_KEY;
                    await axios.post(url, data, {
                        headers: { Authorization: `Bearer ${value}` },
                    })
                    .then((response) => {
                        console.log(response);
                        // alert(response.data.message);
                        this.setState({ modalVisibility: true });
                    })
                    .catch((error) => {
                        console.log({...error});
                        alert(error.response.data.message);
                    });                   
                }
                catch(err){
                    console.log(err);
                } 
            }
        }
        else{
            this._toastMessage("Please submit all the fields properly!!");
        }
    }
    
    render() {
        const { reset } = this.props.navigation;
        return (
            <View style={{height:'100%'}}>
                <StatusBar backgroundColor="#ffffff" barStyle={'dark-content'} />
                <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor:'white'}}>
                    <FormHeader headerTitle='Change Password' />
                    <View style={{...styles.inputsGroup, paddingTop:8}}>
                        <View>
                            <View style={{...styles.textInput, marginTop:0}}>
                                <TextInput
                                    style={{backgroundColor:'white'}}
                                    mode='outlined'
                                    autoCapitalize="none"
                                    dense
                                    label="Old Password"
                                    value={this.state.oldPassword}
                                    onSubmitEditing={() => {this.textInputThree.focus()}}
                                    onChangeText={(old_password) => this._onOldPasswordChange(old_password)}
                                    />
                            </View>

                            <View style={{...styles.textInput, flexDirection:'row', justifyContent:'center'}}>
                                <TextInput
                                    mode='outlined'
                                    label={"New Password"}
                                    autoCapitalize="none"
                                    secureTextEntry={this.state.showPassword ? false : true}
                                    dense
                                    ref={(input) => this.textInputThree = input}
                                    onSubmitEditing={() => {this.textInputFour.focus()}}
                                    onChangeText={(new_password) => this._onNewPasswordChange(new_password)}
                                    style={{backgroundColor:'white', width:'100%'}}
                                    textContentType='password'
                                    />
                                <View style={{ zIndex:1000, width:40, marginLeft:-40, paddingRight:5, alignItems:'center', justifyContent:'center', marginTop:6 }}>
                                    <IconButton onPress={() => this.setState({showPassword: !this.state.showPassword})} icon={!this.state.showPassword ? 'eye' : 'eye-off'} size={18} color='#8d8d8d' />
                                </View>
                            </View>
                            <View style={{...styles.textInput, flexDirection:'row', justifyContent:'center'}}>
                                <TextInput
                                    mode='outlined'
                                    label={"Confirm New Password"}
                                    autoCapitalize="none"
                                    secureTextEntry={this.state.showConfirmPassword ? false : true}
                                    dense
                                    ref={(input) => this.textInputFour = input}
                                    onChangeText={(new_password) => this._onConfirmNewPasswordChange(new_password)}
                                    style={{backgroundColor:'white', width:'100%'}} 
                                    textContentType='password'
                                />
                                <View style={{ zIndex:1000, width:40, marginLeft:-40, paddingRight:5, alignItems:'center', justifyContent:'center', marginTop:6 }}>
                                    <IconButton onPress={() => this.setState({showConfirmPassword: !this.state.showConfirmPassword})} icon={!this.state.showConfirmPassword ? 'eye' : 'eye-off'} size={18} color='#8d8d8d' />
                                </View>
                            </View>
                            {/* <View style={{...styles.textInput, marginTop:12}}>
                                <TextInput
                                    style={{backgroundColor:'white'}}
                                    mode='outlined'
                                    label="New Password"
                                    secureTextEntry={true}
                                    autoCapitalize="none"
                                    dense
                                    onChangeText={(new_password) => this._onNewPasswordChange(new_password)}
                                    />
                            </View>
                            <View style={{...styles.textInput, marginTop:12}}>
                                <TextInput
                                    style={{backgroundColor:'white'}}
                                    mode='outlined'
                                    label="Confirm New Password"
                                    secureTextEntry={true}
                                    autoCapitalize="none"
                                    dense
                                    onChangeText={(confirm_new_password) => this._onConfirmNewPasswordChange(confirm_new_password)}
                                    />
                            </View> */}
                            <Button mode="contained" color='#6B23AE' textTransform={'uppercase'} style={{marginTop:20}} onPress={this._onSubmit}>Change Password</Button>
                        </View>
                    </View>
                </ScrollView>

                <View style={{height:this.state.modalVisibility  ? '100%' : null, width: this.state.modalVisibility ? '100%' : null, position:'absolute', top:0, left:0, backgroundColor:this.state.modalVisibility ? 'rgba(0,0,0,0.5)' : null }}>
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={this.state.modalVisibility}
                    >
                        <View style={styles.centeredView}>
                            <View>
                                <View style={styles.modalView}>
                                    <Text style={{...styles.modalText, fontWeight:'700', fontSize:20}}>Success</Text>
                                    <Text style={{...styles.modalText, color:'#8d8d8d', lineHeight:20}}>Your Password has been Changed Successfully.</Text>
                                    <View style={styles.button}>
                                        <Ripple style={{marginTop:8, rippleContainerBorderRadius:4, height:40}} onPress={() => {reset({routes: [{ name: 'HomeRoot' }]}); this.setState({ modalVisibility: false })}}>
                                            <LinearGradient start={{x: 0, y: 0}} end={{x: 1.8, y: 0}} colors={['#6B23AE', '#FAD44D']} style={styles.gradient}>
                                                <Text style={{color:'#fff'}}>Return To Home</Text>
                                            </LinearGradient>
                                        </Ripple>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    headerIcon:{
        marginLeft:12,
        marginRight:12
    },

    inputsGroup:{
        margin:10,
        padding:14,
        marginTop:55
    },
    textInput:{
        marginTop:8,
    },

    checkboxContainer: {
        flexDirection: "row",
        marginBottom: 15,
        alignItems:'center',
        paddingLeft:10,
    },


    //modalView
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
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
      modalText: {
        marginBottom: 10,
        textAlign: "center"
      },
      gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
        borderRadius: 4,
        padding:10
    },
});