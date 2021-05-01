import React, {Component} from 'react';
import {View, StyleSheet, BackHandler} from 'react-native';
import {Text, ListItem} from 'react-native-elements';
import locales, {currency_strings} from '../locales';
import {Header} from 'react-native-elements';
import {IconButton} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

const HeaderComponent = (props) => {
  return (
    <Header
      placement="left"
      leftComponent={
        <IconButton icon="menu" color="#fff" onPress={props.onPress} />
      }
      centerComponent={{
        text: locales.settings.header_title,
        style: {
          color: '#fff',
          textTransform: 'capitalize',
          fontSize: 16,
          letterSpacing: 0.8,
          marginLeft: -10,
        },
      }}
      ViewComponent={LinearGradient}
      linearGradientProps={{
        colors: ['#6B23AE', '#FAD44D'],
        start: {x: 0, y: 0},
        end: {x: 1.8, y: 0},
      }}
    />
  );
};
export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      current_lang: locales.getLanguage(),
      current_currency: currency_strings.currency_code,
    };
  }
  componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      this.setState({
        current_lang: locales.getLanguage(),
        current_currency: currency_strings.currency_code,
      });
      BackHandler.addEventListener('hardwareBackPress', this.backAction);
    });

    this.props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    });
  }

  backAction = () => {
    this.props.navigation.reset({routes: [{name: 'HomeRoot'}]});
    return true;
  };

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  render() {
    const {push} = this.props.navigation;
    const {current_lang, current_currency} = this.state;
    return (
      // <View style={{flex: 1}}>
      //   <View
      //     style={{
      //       height: '100%',
      //       width: '100%',
      //       position: 'absolute',
      //       top: 0,
      //       left: 0,
      //       justifyContent: 'center',
      //       alignItems: 'center',
      //     }}>
      //     <Text
      //       style={{
      //         textAlign: 'center',
      //         padding: 10,
      //         fontSize: 14,
      //         color: '#8d8d8d',
      //       }}>
      //       <Text style={{color: '#4285F4'}}>Settings Fragment </Text>is in
      //       Progress!!
      //     </Text>
      //   </View>
      // </View>

      <View style={{flex: 1}}>
        <HeaderComponent onPress={() => this.props.navigation.openDrawer()} />
        {/* <Text h4 h4Style={styles.language}>
          {locales.settings.header_title}
        </Text> */}
        {/* <Text onPress={() => push('ChangeLanguage')}>Change Language</Text> */}

        <View>
          <View>
            <ListItem
              containerStyle={{justifyContent: 'space-between'}}
              bottomDivider
              onPress={() => push('ChangeLanguage')}>
              <ListItem.Title>
                {locales.settings.change_language}
              </ListItem.Title>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <ListItem.Subtitle>{`${current_lang}`}</ListItem.Subtitle>
                <ListItem.Chevron style={{marginTop: 3, marginLeft: 4}} />
              </View>
            </ListItem>
          </View>
          <View>
            <ListItem
              containerStyle={{justifyContent: 'space-between'}}
              bottomDivider
              onPress={() => push('ChangeCurrency')}>
              <ListItem.Title>
                {locales.settings.change_currency}
              </ListItem.Title>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <ListItem.Subtitle>{`${current_currency}`}</ListItem.Subtitle>
                <ListItem.Chevron style={{marginTop: 3, marginLeft: 4}} />
              </View>
            </ListItem>
          </View>
        </View>
      </View>
    );
  }
}

// import React, {useContext} from 'react';
// import {StyleSheet, View} from 'react-native';
// import {ListItem, Text} from 'react-native-elements';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';
// // import {LocalizationContext} from '../components/Translations';
// import locales from '../locales';

// export const ChangeLanguage = () => {
//   const insets = useSafeAreaInsets();
//   //   const {
//   //     translations,
//   //     appLanguage,
//   //     setAppLanguage,
//   //     initializeAppLanguage,
//   //   } = useContext(LocalizationContext);
//   //   initializeAppLanguage();
//   return (
//     <View style={[styles.container, {paddingTop: insets.top}]}>
//       <Text h4 h4Style={styles.language}>
//         {locales.settings.change_language}
//       </Text>
//       {locales.getAvailableLanguages().map((currentLang, i) => (
//         <ListItem
//           key={i}
//           title={currentLang}
//           bottomDivider
//           checkmark={i == 0}
//           //   onPress={() => {
//           //     setAppLanguage(currentLang);
//           //   }}
//         />
//       ))}
//     </View>
//   );
// };

const styles = StyleSheet.create({
  language: {
    paddingTop: 10,
    textAlign: 'center',
  },
});
