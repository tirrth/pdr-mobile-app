import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ListItem, Text, Icon} from 'react-native-elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import locales, {currency_strings} from '../locales';

export const ChangeCurrency = () => {
  const insets = useSafeAreaInsets();
  const [currentCurrencyCode, changeCurrentCurrencyCode] = React.useState(
    currency_strings.currency_code,
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Text h4 h4Style={styles.language}>
        {locales.settings.change_currency}
      </Text>
      {currency_strings.getAllCurrencies().map((currency_code, i) => {
        return (
          <ListItem
            key={i}
            bottomDivider
            onPress={() => {
              currency_strings.setCurrency(currency_code);
              changeCurrentCurrencyCode(currency_strings.currency_code);
            }}>
            <ListItem.Content>
              <ListItem.Title>{currency_code}</ListItem.Title>
            </ListItem.Content>
            {currency_code == currentCurrencyCode ? (
              <Icon size={20} name={'check'} color="#4285F4" />
            ) : null}
          </ListItem>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: '#fff', flex: 1},
  language: {
    paddingTop: 16,
    paddingBottom: 12,
    textAlign: 'center',
  },
});
