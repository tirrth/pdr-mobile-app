import React, {Component} from 'react';
import {View, Text} from 'react-native';

export default class NoAuthAccess extends Component {
  render() {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{color: '#8d8d8d', fontSize: 15, marginTop: 30}}
          onPress={this.props.navigation ? this.props.navigation : () => null}>
          Please{' '}
          <Text style={{color: '#4285F4', fontWeight: 'bold'}}>Sign In</Text> to
          access {this.props.page_name || 'this page'}
        </Text>
      </View>
    );
  }
}
