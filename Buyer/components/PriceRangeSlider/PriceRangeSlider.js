import React, {useCallback, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import RangeSlider from './rn-range-slider';
import Label from './Label';
import Notch from './Notch';
import Rail from './Rail';
import RailSelected from './RailSelected';
import Thumb from './Thumb';

const PriceRangeSlider = (props) => {
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback((value) => <Label text={value} />, []);
  const renderNotch = useCallback(() => <Notch />, []);
  const handleValueChange = useCallback((low, high) => {
    props.setLow(low);
    props.setHigh(high);
  }, []);

  return (
    <View style={{width: '84%', alignSelf: 'center'}}>
      <View style={styles.horizontalContainer}>
        <Text style={styles.valueText}>{props.low}$</Text>
        <Text style={styles.valueText}>{'  -  '}</Text>
        <Text style={styles.valueText}>{props.high}$</Text>
      </View>
      <RangeSlider
        style={{marginTop: 12}}
        min={props.min}
        max={props.max}
        step={50}
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        renderLabel={renderLabel}
        renderNotch={renderNotch}
        onValueChanged={handleValueChange}
        low={props.low}
        high={props.high}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginTop: 6,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PriceRangeSlider;
