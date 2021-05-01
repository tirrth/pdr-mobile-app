import React from 'react';
import {View, StyleSheet, ImageBackground, Pressable} from 'react-native';
import { IconButton } from 'react-native-paper';

export default (({
  item,
  style,
  onPress,
  index,
  imageKey,
  local,
  height
}) => {
  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress(index)}>
      <ImageBackground
        style={[styles.image, style, {height: height} ]}
        imageStyle={{resizeMode:'contain'}}
        source={local ? item[imageKey] : {uri: item[imageKey]}}
      >
        <View style={{backgroundColor:'rgba(0,0,0,0.4)', height:'100%', width:'100%', position:'absolute', top:0, left:0}}></View>
      </ImageBackground>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {},
  image: {
    height: 230,
    resizeMode: 'contain',
  },
});