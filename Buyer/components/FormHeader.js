import React, { Component } from 'react';
import {  
    View,
    Text,
    ImageBackground,
    Image,
    StyleSheet,
    Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default class FormHeader extends Component {
    render() {
        return (
            <View style={styles.container}>
                <ImageBackground style={{width:"100%", height:300, position:'relative' }} resizeMode='stretch'  source={require('../assets/background.png')}>
                    <SafeAreaView style={{ alignSelf:'center', ...Platform.select({ android:{ marginTop:14 }, }) }}>
                        <Text style={{ color:'#fff', fontSize:18, fontWeight:'700', letterSpacing:1,  }}>{this.props.headerTitle}</Text>
                    </SafeAreaView>
                    <Image style={{ alignSelf: "center", height: 120, width:120, position:'absolute', bottom:-40  }} source={require('../assets/logo.png')}/>
                </ImageBackground>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
});

