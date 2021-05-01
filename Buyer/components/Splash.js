import React, { Component } from 'react'
import { View, ImageBackground, Image } from  'react-native';
import { ActivityIndicator } from 'react-native';

var splashImgBg = require('../assets/splash.png');
var logo = require('../assets/logo.png');

export default class Splash extends Component {
    render() {
        return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <ImageBackground source={splashImgBg} style={{height:'100%', width:'100%', justifyContent:'center', alignItems:'center' }}>
                    <Image source={logo} />
                    <ActivityIndicator size={30} color='white' style={{position:'absolute', bottom:40 }} />
                </ImageBackground>
            </View>
        )
    }
}
