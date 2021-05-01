import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import FormHeader from '../FormHeader';
import Ripple from 'react-native-material-ripple';

class SignUpMethods extends Component {
  render() {
    const {navigate} = this.props.navigation;

    return (
      <ScrollView
        style={{backgroundColor: 'white'}}
        showsVerticalScrollIndicator={false}>
        <FormHeader headerTitle="Sign Up" />

        <View style={styles.textInputContainerMain}>
          <View>
            <Ripple
              rippleContainerBorderRadius={50}
              style={{...styles.button}}
              onPress={() => {
                this.props.navigation.navigate('SignUpEmail');
              }}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1.8, y: 0}}
                colors={['#6B23AE', '#FAD44D']}
                style={styles.gradient}>
                <Text style={styles.text}>
                  <Icon name="envelope" color="white" style={{fontSize: 18}} />{' '}
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
              onPress={() => {
                navigate('Home');
              }}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1.8, y: 0}}
                colors={['#3b5998', '#3b5998']}
                style={styles.gradient}>
                <Text style={styles.text}>
                  <Icon name="facebook" color="white" style={{fontSize: 18}} />{' '}
                  Sign up with Email{' '}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{marginTop: '5%'}}>
            <TouchableOpacity
              style={styles.button}
              disabled
              onPress={() => {
                navigate('Home');
              }}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1.8, y: 0}}
                colors={['#EB4132', '#EB4132']}
                style={styles.gradient}>
                <Text style={styles.text}>
                  <Icon name="envelope" color="white" style={{fontSize: 18}} />{' '}
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
                onPress={() => {
                  navigate('Login');
                }}>
                {' '}
                Sign in{' '}
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
    backgroundColor: 'white',
  },
  imagelogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    marginTop: '60%',
  },
  textInputContainerMain: {
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
  inputdate: {
    fontSize: 14,
    marginBottom: -12,
    color: '#6a4595',
  },
  inputcvv: {
    fontSize: 14,
    marginBottom: -12,
    color: '#6a4595',
  },
});

export default SignUpMethods;
