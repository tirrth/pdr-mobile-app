import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  Modal,
  FlatList,
  StyleSheet,
  I18nManager,
  TextInput,
} from 'react-native';
import {Card, IconButton} from 'react-native-paper';
import Ripple from 'react-native-material-ripple';

export default class RNModalPicker extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      selectedFlag: this.props.defaultValue,
      dataSource: [],
      dataSourceKey: '',
    };
  }

  _setDefaultValue(
    defaultText,
    pickerStyle,
    textStyle,
    dropDownImageStyle,
    dropDownImage,
  ) {
    return (
      <Ripple
        rippleContainerBorderRadius={4}
        disabled={this.props.disablePicker}
        onPress={() => this.setState({modalVisible: true})}
        style={pickerStyle}>
        <Text style={textStyle}>{defaultText}</Text>
        {/* <Image
          style={dropDownImageStyle}
          resizeMode="contain"
          source={dropDownImage}
        /> */}
        <IconButton
          icon="arrow-down"
          size={14}
          style={{margin: 0, padding: 0, marginLeft: 4}}
        />
      </Ripple>
    );
  }

  _setSelectedValue(
    defaultText,
    pickerStyle,
    textStyle,
    dropDownImageStyle,
    dropDownImage,
  ) {
    return (
      <Ripple
        rippleContainerBorderRadius={4}
        disabled={this.props.disablePicker}
        onPress={() => this.setState({modalVisible: true})}
        style={pickerStyle}>
        <Text style={textStyle}>{defaultText}</Text>
        {/* <Image
          style={dropDownImageStyle}
          resizeMode="contain"
          source={dropDownImage}
        /> */}
        <IconButton
          icon="arrow-down"
          size={14}
          style={{margin: 0, padding: 0, marginLeft: 4}}
        />
      </Ripple>
    );
  }

  componentDidMount() {
    this.setState({
      dataSource: this.props.dataSource,
      dataSourceKey: this.props.dataSourceKey,
    });
  }

  _searchFilterFunction(searchText, data) {
    let newData = [];
    if (searchText) {
      newData = data.filter((item) => {
        const itemData = item[this.state.dataSourceKey].toUpperCase();
        const textData = searchText.toUpperCase();
        return itemData.includes(textData);
      });
      this.setState({
        dataSource: [...newData],
      });
    } else {
      this.setState({dataSource: this.props.dataSource});
    }
  }
  _flatListItemSeparator(itemSeparatorStyle) {
    return <View style={itemSeparatorStyle} />;
  }
  _renderItemListValues(item, index) {
    return (
      <Ripple
        style={{...styles.listRowClickTouchStyle}}
        onPress={() => this._setSelectedIndex(index, item)}>
        <View style={styles.listRowContainerStyle}>
          <Text style={this.props.pickerItemTextStyle}>
            {item[this.state.dataSourceKey]}
          </Text>
        </View>
      </Ripple>
    );
  }

  _setSelectedIndex(index, item) {
    this.props.selectedValue(index, item);

    this.setState({selectedFlag: true, modalVisible: false});
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        {this.state.selectedFlag ? (
          <View>
            {this._setSelectedValue(
              this.props.selectedLabel,
              this.props.pickerStyle,
              this.props.selectLabelTextStyle,
              this.props.dropDownImageStyle,
              this.props.dropDownImage,
            )}
          </View>
        ) : (
          <View>
            {this._setDefaultValue(
              this.props.placeHolderLabel,
              this.props.pickerStyle,
              this.props.placeHolderTextStyle,
              this.props.dropDownImageStyle,
              this.props.dropDownImage,
            )}
          </View>
        )}

        <Modal
          visible={this.state.modalVisible}
          transparent={true}
          onShow={() => this.setState({dataSource: this.props.dataSource})}
          animationType={this.props.changeAnimation}
          onRequestClose={() => this.setState({modalVisible: false})}>
          <View style={styles.container}>
            <View style={styles.listDataContainerStyle}>
              <View style={{...styles.pickerTitleContainerStyle}}>
                {this.props.showPickerTitle ? (
                  <View style={{...styles.pickerTitleTextContainerStyle}}>
                    <Text style={styles.pickerTitleTextStyle}>
                      {this.props.pickerTitle}
                    </Text>
                  </View>
                ) : null}
                <IconButton
                  icon="close"
                  color="#8d8d8d"
                  onPress={() => this.setState({modalVisible: false})}
                />
              </View>
              <View
                style={{width: '100%', height: 1, backgroundColor: '#dddddd'}}
              />
              {this.props.showSearchBar ? (
                <Card style={this.props.searchBarContainerStyle}>
                  <TextInput
                    onChangeText={(text) =>
                      this._searchFilterFunction(
                        text,
                        this.props.dummyDataSource,
                      )
                    }
                    placeholder={this.props.searchBarPlaceHolder}
                    style={styles.textInputStyle}
                    underlineColorAndroid="transparent"
                    keyboardType="default"
                    returnKeyType={'done'}
                    blurOnSubmit={true}
                  />
                </Card>
              ) : null}

              <FlatList
                style={styles.flatListStyle}
                keyExtractor={(item, index) => `${index}`}
                showsVerticalScrollIndicator={false}
                extraData={this.state}
                overScrollMode="never"
                ItemSeparatorComponent={() =>
                  this._flatListItemSeparator(this.props.itemSeparatorStyle)
                }
                keyboardShouldPersistTaps="always"
                contentContainerStyle={{paddingTop: 8, paddingBottom: 8}}
                numColumns={1}
                data={this.state.dataSource}
                renderItem={({item, index}) =>
                  this._renderItemListValues(item, index)
                }
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}
RNModalPicker.defaultProps = {
  defaultValue: false,
  showSearchBar: false,
  showPickerTitle: false,
  disablePicker: false,
  changeAnimation: 'fade',
  // dropDownImage: require("./res/ic_drop_down.png"),
  placeHolderLabel: 'Please select value from picker',
  searchBarPlaceHolder: 'Search',
  dataSourceKey: 'name',

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectLabelTextStyle: {
    color: '#000',
    textAlign: 'left',
    width: '99%',
    padding: 10,
    flexDirection: 'row',

    // Extra Added
    textTransform: 'capitalize',
  },
  searchBarContainerStyle: {
    marginTop: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center',
    height: 40,
    borderRadius: 4,
    elevation: 4,
  },
  placeHolderTextStyle: {
    color: '#D3D3D3',
    padding: 10,
    textAlign: 'left',
    width: '99%',
    flexDirection: 'row',

    // Extra Added
    textTransform: 'capitalize',
  },
  dropDownImageStyle: {
    marginLeft: 10,
    width: 10,
    height: 10,
    alignSelf: 'center',
  },
  pickerItemTextStyle: {
    color: '#000',
    marginVertical: 10,
    flex: 0.9,
    marginLeft: 20,
    marginHorizontal: 10,
    textAlign: 'left',

    // Extra Added
    textTransform: 'capitalize',
  },
  pickerStyle: {
    marginLeft: 18,
    elevation: 1,
    paddingRight: 25,
    marginRight: 10,
    marginBottom: 2,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
};
RNModalPicker.propTypes = {
  dataSourceKey: PropTypes.any,
  placeHolderLabel: PropTypes.any,
  selectedLabel: PropTypes.any,
  pickerTitle: PropTypes.any,
  dataSource: PropTypes.any,
  dummyDataSource: PropTypes.any,
  dropDownImage: PropTypes.number,
  defaultSelected: PropTypes.any,
  defaultValue: PropTypes.bool,
  showSearchBar: PropTypes.bool,
  showPickerTitle: PropTypes.bool,
  disablePicker: PropTypes.bool,
  changeAnimation: PropTypes.string,
  searchBarPlaceHolder: PropTypes.string,
  itemSeparatorStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),
  pickerItemTextStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),
  dropDownImageStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),

  selectLabelTextStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),

  searchBarContainerStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),
  placeHolderTextStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),
  textStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),
  pickerStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),
};
const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  searchBarContainerStyle: {
    marginTop: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center',
    height: 40,
    borderRadius: 10,
    elevation: 3,
  },

  flatListStyle: {
    maxHeight: '85%',
    // minHeight: "35%"
  },
  iconGPSStyle: {
    alignItems: 'center',
    alignSelf: 'center',
    height: 20,
    width: 20,
    margin: 5,
    transform: [
      {
        scaleX: I18nManager.isRTL ? -1 : 1,
      },
    ],
  },

  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  listRowContainerStyle: {
    width: '100%',
    justifyContent: 'center',
  },
  textInputStyle: {
    paddingLeft: 15,
    width: '100%',
    height: '100%',
    // marginTop: Platform.OS == "ios" ? 10 : 0,
    // marginBottom: Platforms.OS == "ios" ? 10 : 0,
    alignSelf: 'center',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  crossImageStyle: {
    width: 40,
    height: 40,
    marginTop: -4,
    marginRight: -7,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    alignSelf: 'flex-end',
  },

  listDataContainerStyle: {
    alignSelf: 'center',
    width: '90%',
    borderRadius: 10,
    maxHeight: '80%',
    backgroundColor: 'white',
  },

  listRowClickTouchStyle: {
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
  },

  pickerTitleContainerStyle: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },

  pickerTitleTextContainerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  pickerTitleTextStyle: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',

    // Extra Added
    textTransform: 'capitalize',
  },
});

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //

// import React, {PureComponent} from 'react';
// import PropTypes from 'prop-types';
// import {
//   Text,
//   View,
//   Modal,
//   FlatList,
//   StyleSheet,
//   I18nManager,
//   TextInput,
// } from 'react-native';
// import {Card, IconButton} from 'react-native-paper';
// import Ripple from 'react-native-material-ripple';

// export default class RNModalPicker extends PureComponent {
//   constructor(props) {
//     super(props);
//     this.state = {
//       modalVisible: false,
//       selectedFlag: this.props.defaultValue,
//       dataSource: [],
//     };
//   }

//   _setDefaultValue(
//     defaultText,
//     pickerStyle,
//     textStyle,
//     dropDownImageStyle,
//     dropDownImage,
//   ) {
//     return (
//       <Ripple
//         rippleContainerBorderRadius={4}
//         disabled={this.props.disablePicker}
//         onPress={() => this.setState({modalVisible: true})}
//         style={pickerStyle}>
//         <Text style={textStyle}>{defaultText}</Text>
//         {/* <Image
//           style={dropDownImageStyle}
//           resizeMode="contain"
//           source={dropDownImage}
//         /> */}
//         <IconButton
//           icon="arrow-down"
//           size={14}
//           style={{margin: 0, padding: 0, marginLeft: 4}}
//         />
//       </Ripple>
//     );
//   }

//   _setSelectedValue(
//     defaultText,
//     pickerStyle,
//     textStyle,
//     dropDownImageStyle,
//     dropDownImage,
//   ) {
//     return (
//       <Ripple
//         rippleContainerBorderRadius={4}
//         disabled={this.props.disablePicker}
//         onPress={() => this.setState({modalVisible: true})}
//         style={pickerStyle}>
//         <Text style={textStyle}>{defaultText}</Text>
//         {/* <Image
//           style={dropDownImageStyle}
//           resizeMode="contain"
//           source={dropDownImage}
//         /> */}
//         <IconButton
//           icon="arrow-down"
//           size={14}
//           style={{margin: 0, padding: 0, marginLeft: 4}}
//         />
//       </Ripple>
//     );
//   }

//   componentDidMount() {
//     this.setState({dataSource: this.props.dataSource});
//   }

//   _searchFilterFunction(searchText, data) {
//     let newData = [];
//     if (searchText) {
//       newData = data.filter(function (item) {
//         const itemData = item.name.toUpperCase();
//         const textData = searchText.toUpperCase();
//         return itemData.includes(textData);
//       });
//       this.setState({
//         dataSource: [...newData],
//       });
//     } else {
//       this.setState({dataSource: this.props.dataSource});
//     }
//   }
//   _flatListItemSeparator(itemSeparatorStyle) {
//     return <View style={itemSeparatorStyle} />;
//   }
//   _renderItemListValues(item, index) {
//     return (
//       <Ripple
//         style={{...styles.listRowClickTouchStyle}}
//         onPress={() => this._setSelectedIndex(index, item)}>
//         <View style={styles.listRowContainerStyle}>
//           <Text style={this.props.pickerItemTextStyle}>{item.name}</Text>
//         </View>
//       </Ripple>
//     );
//   }

//   _setSelectedIndex(index, item) {
//     this.props.selectedValue(index, item);

//     this.setState({selectedFlag: true, modalVisible: false});
//   }

//   render() {
//     return (
//       <View style={styles.mainContainer}>
//         {this.state.selectedFlag ? (
//           <View>
//             <View>
//               {this._setSelectedValue(
//                 this.props.selectedLabel,
//                 this.props.pickerStyle,
//                 this.props.selectLabelTextStyle,
//                 this.props.dropDownImageStyle,
//                 this.props.dropDownImage,
//               )}
//             </View>
//           </View>
//         ) : (
//           <View>
//             <View>
//               {this._setDefaultValue(
//                 this.props.placeHolderLabel,
//                 this.props.pickerStyle,
//                 this.props.placeHolderTextStyle,
//                 this.props.dropDownImageStyle,
//                 this.props.dropDownImage,
//               )}
//             </View>
//           </View>
//         )}

//         <Modal
//           visible={this.state.modalVisible}
//           transparent={true}
//           onShow={() => this.setState({dataSource: this.props.dataSource})}
//           animationType={this.props.changeAnimation}
//           onRequestClose={() => this.setState({modalVisible: false})}>
//           <View style={styles.container}>
//             <View style={styles.listDataContainerStyle}>
//               <View style={{...styles.pickerTitleContainerStyle}}>
//                 {this.props.showPickerTitle ? (
//                   <View style={{...styles.pickerTitleTextContainerStyle}}>
//                     <Text style={styles.pickerTitleTextStyle}>
//                       {this.props.pickerTitle}
//                     </Text>
//                   </View>
//                 ) : null}
//                 <IconButton
//                   icon="close"
//                   color="#8d8d8d"
//                   onPress={() => this.setState({modalVisible: false})}
//                 />
//               </View>
//               <View
//                 style={{width: '100%', height: 1, backgroundColor: '#dddddd'}}
//               />
//               {this.props.showSearchBar ? (
//                 <Card style={this.props.searchBarContainerStyle}>
//                   <TextInput
//                     onChangeText={(text) =>
//                       this._searchFilterFunction(
//                         text,
//                         this.props.dummyDataSource,
//                       )
//                     }
//                     placeholder={this.props.searchBarPlaceHolder}
//                     style={styles.textInputStyle}
//                     underlineColorAndroid="transparent"
//                     keyboardType="default"
//                     returnKeyType={'done'}
//                     blurOnSubmit={true}
//                   />
//                 </Card>
//               ) : null}

//               <FlatList
//                 style={styles.flatListStyle}
//                 keyExtractor={(item) => item.id}
//                 showsVerticalScrollIndicator={false}
//                 extraData={this.state}
//                 overScrollMode="never"
//                 ItemSeparatorComponent={() =>
//                   this._flatListItemSeparator(this.props.itemSeparatorStyle)
//                 }
//                 keyboardShouldPersistTaps="always"
//                 contentContainerStyle={{paddingTop: 8, paddingBottom: 8}}
//                 numColumns={1}
//                 data={this.state.dataSource}
//                 renderItem={({item, index}) =>
//                   this._renderItemListValues(item, index)
//                 }
//               />
//             </View>
//           </View>
//         </Modal>
//       </View>
//     );
//   }
// }
// RNModalPicker.defaultProps = {
//   defaultValue: false,
//   showSearchBar: false,
//   showPickerTitle: false,
//   disablePicker: false,
//   changeAnimation: 'fade',
//   // dropDownImage: require("./res/ic_drop_down.png"),
//   placeHolderLabel: 'Please select value from picker',
//   searchBarPlaceHolder: 'Search',

//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   selectLabelTextStyle: {
//     color: '#000',
//     textAlign: 'left',
//     width: '99%',
//     padding: 10,
//     flexDirection: 'row',
//   },
//   searchBarContainerStyle: {
//     marginTop: 10,
//     marginBottom: 10,
//     width: '90%',
//     alignSelf: 'center',
//     height: 40,
//     borderRadius: 4,
//     elevation: 4,
//   },
//   placeHolderTextStyle: {
//     color: '#D3D3D3',
//     padding: 10,
//     textAlign: 'left',
//     width: '99%',
//     flexDirection: 'row',
//   },
//   dropDownImageStyle: {
//     marginLeft: 10,
//     width: 10,
//     height: 10,
//     alignSelf: 'center',
//   },
//   pickerItemTextStyle: {
//     color: '#000',
//     marginVertical: 10,
//     flex: 0.9,
//     marginLeft: 20,
//     marginHorizontal: 10,
//     textAlign: 'left',
//   },
//   pickerStyle: {
//     marginLeft: 18,
//     elevation: 1,
//     paddingRight: 25,
//     marginRight: 10,
//     marginBottom: 2,
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 4,
//   },
// };
// RNModalPicker.propTypes = {
//   placeHolderLabel: PropTypes.any,
//   selectedLabel: PropTypes.any,
//   pickerTitle: PropTypes.any,
//   dataSource: PropTypes.any,
//   dummyDataSource: PropTypes.any,
//   dropDownImage: PropTypes.number,
//   defaultSelected: PropTypes.any,
//   defaultValue: PropTypes.bool,
//   showSearchBar: PropTypes.bool,
//   showPickerTitle: PropTypes.bool,
//   disablePicker: PropTypes.bool,
//   changeAnimation: PropTypes.string,
//   searchBarPlaceHolder: PropTypes.string,
//   itemSeparatorStyle: PropTypes.oneOfType([
//     PropTypes.number,
//     PropTypes.object,
//     PropTypes.array,
//   ]),
//   pickerItemTextStyle: PropTypes.oneOfType([
//     PropTypes.number,
//     PropTypes.object,
//     PropTypes.array,
//   ]),
//   dropDownImageStyle: PropTypes.oneOfType([
//     PropTypes.number,
//     PropTypes.object,
//     PropTypes.array,
//   ]),

//   selectLabelTextStyle: PropTypes.oneOfType([
//     PropTypes.number,
//     PropTypes.object,
//     PropTypes.array,
//   ]),

//   searchBarContainerStyle: PropTypes.oneOfType([
//     PropTypes.number,
//     PropTypes.object,
//     PropTypes.array,
//   ]),
//   placeHolderTextStyle: PropTypes.oneOfType([
//     PropTypes.number,
//     PropTypes.object,
//     PropTypes.array,
//   ]),
//   textStyle: PropTypes.oneOfType([
//     PropTypes.number,
//     PropTypes.object,
//     PropTypes.array,
//   ]),
//   pickerStyle: PropTypes.oneOfType([
//     PropTypes.number,
//     PropTypes.object,
//     PropTypes.array,
//   ]),
// };
// const styles = StyleSheet.create({
//   mainContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     alignSelf: 'center',
//   },
//   searchBarContainerStyle: {
//     marginTop: 10,
//     marginBottom: 10,
//     width: '90%',
//     alignSelf: 'center',
//     height: 40,
//     borderRadius: 10,
//     elevation: 3,
//   },

//   flatListStyle: {
//     maxHeight: '85%',
//     // minHeight: "35%"
//   },
//   iconGPSStyle: {
//     alignItems: 'center',
//     alignSelf: 'center',
//     height: 20,
//     width: 20,
//     margin: 5,
//     transform: [
//       {
//         scaleX: I18nManager.isRTL ? -1 : 1,
//       },
//     ],
//   },

//   container: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//   },
//   listRowContainerStyle: {
//     width: '100%',
//     justifyContent: 'center',
//   },
//   textInputStyle: {
//     paddingLeft: 15,
//     width: '100%',
//     height: '100%',
//     // marginTop: Platform.OS == "ios" ? 10 : 0,
//     // marginBottom: Platforms.OS == "ios" ? 10 : 0,
//     alignSelf: 'center',
//     textAlign: I18nManager.isRTL ? 'right' : 'left',
//   },
//   crossImageStyle: {
//     width: 40,
//     height: 40,
//     marginTop: -4,
//     marginRight: -7,
//     alignItems: 'flex-end',
//     justifyContent: 'flex-start',
//     alignSelf: 'flex-end',
//   },

//   listDataContainerStyle: {
//     alignSelf: 'center',
//     width: '90%',
//     borderRadius: 10,
//     maxHeight: '80%',
//     backgroundColor: 'white',
//   },

//   listRowClickTouchStyle: {
//     justifyContent: 'center',
//     flexDirection: 'row',
//     flex: 1,
//   },

//   pickerTitleContainerStyle: {
//     flexDirection: 'row',
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     alignSelf: 'flex-end',
//   },

//   pickerTitleTextContainerStyle: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '100%',
//     width: '100%',
//   },
//   pickerTitleTextStyle: {
//     fontSize: 18,
//     color: '#000',
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
// });
