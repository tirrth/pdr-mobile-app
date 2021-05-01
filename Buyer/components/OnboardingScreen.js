import React from 'react';
// import {ImageBackground} from 'react-native';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';

import Onboarding from 'react-native-onboarding-swiper';
import {IconButton} from 'react-native-paper';

const Dots = ({selected}) => {
  let backgroundColor;

  //   backgroundColor = selected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)';
  backgroundColor = selected ? '#6B23AE' : '#FAD44D';

  return (
    <View
      style={{
        width: 8,
        height: 8,
        marginHorizontal: 5,
        borderRadius: 8 / 2,
        backgroundColor,
      }}
    />
  );
};

const Skip = ({...props}) => (
  <TouchableOpacity style={{marginHorizontal: 20}} {...props}>
    <Text style={{fontSize: 16, color: '#6B23AE', fontWeight: '700'}}>
      Skip
    </Text>
  </TouchableOpacity>
);

const Next = ({...props}) => (
  <TouchableOpacity style={{marginHorizontal: 20}} {...props}>
    <Text style={{fontSize: 16, color: '#6B23AE', fontWeight: '700'}}>
      Next
    </Text>
  </TouchableOpacity>
);

const Done = ({...props}) => (
  <TouchableOpacity {...props}>
    <IconButton color="#6B23AE" size={26} icon={'arrow-right'} />
  </TouchableOpacity>
);

const OnboardingScreen = ({navigation}) => {
  return (
    <Onboarding
      bottomBarColor={'#fff'}
      SkipButtonComponent={Skip}
      NextButtonComponent={Next}
      DoneButtonComponent={Done}
      DotComponent={Dots}
      onSkip={() => navigation.reset({routes: [{name: 'App'}]})}
      onDone={() => navigation.reset({routes: [{name: 'App'}]})}
      pages={[
        {
          backgroundColor: '#ffffff',
          image: (
            <Image
              style={{
                marginTop: -120,
                width: '100%',
                resizeMode: 'contain',
              }}
              source={require('../assets/3/Artboard_1.png')}
            />
          ),
          title: (
            <Text
              style={{
                marginTop: -40,
                fontSize: 26,
                color: '#6B23AE',
                letterSpacing: 1.2,
              }}>
              Shop Online
            </Text>
          ),
          subtitle: (
            <Text style={{marginTop: 10, fontSize: 16, letterSpacing: 0.4}}>
              A New Way To Connect With The World
            </Text>
          ),
        },
        {
          backgroundColor: '#ffffff',
          image: (
            <Image
              style={{
                marginTop: -120,
                width: '100%',
                resizeMode: 'contain',
              }}
              source={require('../assets/3/Artboard_2.png')}
            />
          ),
          title: (
            <Text
              style={{
                marginTop: -40,
                fontSize: 26,
                color: '#6B23AE',
                letterSpacing: 1.2,
              }}>
              Save or Order
            </Text>
          ),
          subtitle: (
            <Text style={{marginTop: 10, fontSize: 16, letterSpacing: 0.4}}>
              A New Way To Connect With The World
            </Text>
          ),
        },
        {
          backgroundColor: '#ffffff',
          image: (
            <Image
              style={{
                marginTop: -120,
                width: '100%',
                resizeMode: 'contain',
              }}
              source={require('../assets/3/Artboard_3.png')}
            />
          ),
          title: (
            <Text
              style={{
                marginTop: -40,
                fontSize: 26,
                color: '#6B23AE',
                letterSpacing: 1.2,
              }}>
              Get your Order
            </Text>
          ),
          subtitle: (
            <Text style={{marginTop: 10, fontSize: 16, letterSpacing: 0.4}}>
              A New Way To Connect With The World
            </Text>
          ),
        },
      ]}
    />
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
