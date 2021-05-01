import React, {useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {ListItem, Text, Icon} from 'react-native-elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import {LocalizationContext} from '../components/Translations';
import locales from '../locales';

export const ChangeLanguage = () => {
  const insets = useSafeAreaInsets();
  const [currentLang, changeCurrentLang] = React.useState(
    locales.getLanguage(),
  );
  //   const {
  //     translations,
  //     appLanguage,
  //     setAppLanguage,
  //     initializeAppLanguage,
  //   } = useContext(LocalizationContext);
  //   initializeAppLanguage();
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Text h4 h4Style={styles.language}>
        {locales.settings.change_language}
      </Text>
      {locales.getAvailableLanguages().map((lang, i) => (
        <ListItem
          key={i}
          bottomDivider
          onPress={() => {
            locales.setLanguage(lang);
            changeCurrentLang(locales.getLanguage());
          }}>
          <ListItem.Content>
            <ListItem.Title>{lang}</ListItem.Title>
          </ListItem.Content>
          {lang == currentLang ? (
            <Icon size={20} name={'check'} color="#4285F4" />
          ) : null}
        </ListItem>
      ))}
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
