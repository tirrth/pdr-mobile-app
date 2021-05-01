import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { BackHandler } from 'react-native';

export default class AboutUs extends Component {
    componentDidMount(){
        this.props.navigation.addListener('focus', () => {
            BackHandler.addEventListener('hardwareBackPress', this.backAction);
        });

        this.props.navigation.addListener('blur', () => {
            BackHandler.removeEventListener('hardwareBackPress', this.backAction);
        });
    }

    backAction = () => {
        this.props.navigation.reset({routes: [{ name: 'HomeRoot' }]});
        return true;
    };

    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    render() {
        return (
            <View style={{flex:1}}>
                <View style={{height:'100%', width:'100%', position:'absolute', top:0, left:0, justifyContent:'center', alignItems:'center'}}>
                    <Text style={{textAlign:'center', padding:10, fontSize:14, color:'#8d8d8d'}}><Text style={{color:'#4285F4'}}>About Fragment </Text>is in Progress!!</Text>
                </View>
            </View>
        )
    }
}
