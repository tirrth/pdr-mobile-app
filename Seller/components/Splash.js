import React, { Component } from 'react'
import { View, ImageBackground, Image } from  'react-native';
import { StatusBar } from 'react-native';

var splashImgBg = require('../assets/splash.png');
var logo = require('../assets/logo.png');
import { ActivityIndicator } from 'react-native';

export default class Splash extends Component {
    componentDidMount(){
        StatusBar.setHidden(true);
    }
    componentWillUnmount(){
        StatusBar.setHidden(false);
    }

    render() {
        return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <ImageBackground source={splashImgBg} style={{height:'100%', width:'100%', justifyContent:'center', alignItems:'center'}}>
                    <Image source={logo}  />
                    <ActivityIndicator size={30} color='white' style={{position:'absolute', bottom:40 }} />
                </ImageBackground>
            </View>
        )
    }
}
