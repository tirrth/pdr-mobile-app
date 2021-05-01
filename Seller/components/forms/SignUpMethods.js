import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import FormHeader from '../FormHeader';
import Ripple from 'react-native-material-ripple';
import {Button, RadioButton} from 'react-native-paper';
import {connect} from 'react-redux';

class SignUpMethods extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSellerType: false,
      checked: 1,
    };
  }

  _onSignUpEmailPress = () => {
    // this.props.navigation.navigate("SignUpEmail");
    this.setState({isSellerType: true});
  };

  render() {
    const {navigate, reset} = this.props.navigation;
    return (
      <ScrollView
        style={{backgroundColor: 'white'}}
        showsVerticalScrollIndicator={false}>
        <FormHeader headerTitle="Sign Up" />
        {!this.state.isSellerType && (
          <View style={styles.textinputcontainermain}>
            <View>
              <Ripple
                rippleContainerBorderRadius={50}
                style={{...styles.button}}
                onPress={() => {
                  this._onSignUpEmailPress();
                }}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1.8, y: 0}}
                  colors={['#6B23AE', '#FAD44D']}
                  style={styles.gradient}>
                  <Text style={styles.text}>
                    <Icon
                      name="envelope"
                      color="white"
                      style={{fontSize: 18}}
                    />{' '}
                    Sign up with Email{' '}
                  </Text>
                </LinearGradient>
              </Ripple>
            </View>

            <View
              style={{
                alignSelf: 'center',
                marginTop: 20,
                height: 26,
                width: 26,
                borderRadius: 26 / 2,
                borderColor: '#8d8d8d',
                borderWidth: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#8d8d8d',
                  fontSize: 9,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  marginTop: -0.6,
                  marginRight: 0.6,
                }}>
                or
              </Text>
            </View>

            <View style={{marginTop: 20}}>
              <TouchableOpacity
                style={styles.button}
                disabled
                onPress={() => console.log('ASsasa')}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1.8, y: 0}}
                  colors={['#3b5998', '#3b5998']}
                  style={styles.gradient}>
                  <Text style={styles.text}>
                    <Icon
                      name="facebook"
                      color="white"
                      style={{fontSize: 18}}
                    />{' '}
                    Sign up with Email{' '}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={{marginTop: '5%'}}>
              <TouchableOpacity
                style={styles.button}
                disabled
                onPress={() => console.log('ASsasa')}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1.8, y: 0}}
                  colors={['#EB4132', '#EB4132']}
                  style={styles.gradient}>
                  <Text style={styles.text}>
                    <Icon
                      name="envelope"
                      color="white"
                      style={{fontSize: 18}}
                    />{' '}
                    Sign up with Google{' '}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={{marginTop: '10%', alignSelf: 'center'}}>
              <Text style={{color: 'black'}}>
                Already a member?
                <Text
                  style={{color: '#6B23AE', fontWeight: 'bold'}}
                  onPress={() => reset({routes: [{name: 'Login'}]})}>
                  {' '}
                  Sign in{' '}
                </Text>{' '}
              </Text>
            </View>
          </View>
        )}

        {this.state.isSellerType && (
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
              <View style={{marginTop: 20}}>
                <Button
                  mode="contained"
                  onPress={() => {
                    navigate('SignUpEmail');
                    this.props.changeAccountType(this.state.checked);
                  }}>
                  Next
                </Button>
                <View
                  style={{
                    marginTop: 25,
                    flexDirection: 'row',
                    alignSelf: 'center',
                  }}>
                  <Text>Need An Account?</Text>
                  <Pressable style={{marginLeft: 4}}>
                    <Text style={{color: '#6B23AE', fontWeight: 'bold'}}>
                      Sign Up
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
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
    backgroundColor: 'white',
  },
  imagelogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    marginTop: '60%',
  },
  textinputcontainermain: {
    width: '100%',
    marginTop: '34%',
    paddingTop: 0,
    padding: '10%',
    backgroundColor: 'white',
  },
  textinputpassword: {
    width: '100%',
    marginBottom: '15%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  button: {
    width: '100%',
    height: 45,
    borderRadius: 50,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
  sociallogin: {
    textAlign: 'center',
    backgroundColor: '#3b5998',
    width: '80%',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  inputWrap: {
    flex: 1,
    marginBottom: 10,
    marginTop: 30,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
  },
});

const mapDispatchToProps = (dispatch) => {
  return {
    changeAccountType: (account_type) => {
      dispatch({type: 'CHANGE_ACCOUNT_TYPE', payload: account_type});
    },
  };
};

export default connect(null, mapDispatchToProps)(SignUpMethods);
