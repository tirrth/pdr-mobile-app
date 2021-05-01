import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  SafeAreaView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {Header} from 'react-native-elements';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Button, Appbar} from 'react-native-paper';
import RadioButton from 'react-native-radio-button';
import {getDeviceId} from 'react-native-device-info';
import {connect} from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_GET_BILLING_ADDRESS_KEY,
  API_UPDATE_BILLING_ADDRESS_KEY,
  API_FETCH_SINGLE_SHIPPING_ADDRESS,
  API_SAVE_BILLING_ADDRESS_KEY,
} from '@env';
const deviceId = getDeviceId();

class ShoppingCartBillingAddress extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isiPhone12: false,
      userBillingAddresses: [],
      // totalAmountFromCart: 0,
      // shippingCharge: 0,
      // priceAfterShipping: 0,
      isLoading: true,

      selectedShippingAddressData: {},
      is_same_as_shipping_address: false,
    };
  }

  async componentDidMount() {
    // const {total_amount_from_cart} = this.props.route.params;
    // this.setState({totalAmountFromCart: total_amount_from_cart});
    this._getSelectedShippingAddress();

    if (deviceId === 'iPhone13,4') {
      {
        this.setState({isiPhone12: true});
      }
    }
    const token = await AsyncStorage.getItem('token');
    // console.log(token);
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_BILLING_ADDRESS_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('ressssssss=====', response);
        if (response.data.billing_address.data.length) {
          const userBillingAddresses = response.data.billing_address.data;

          const indexOfAlreadyDefaultAddress = userBillingAddresses
            .map((data) => {
              return data.is_default;
            })
            .indexOf(1);

          this.props.changeBillingAddressUUID(
            userBillingAddresses[indexOfAlreadyDefaultAddress].uuid,
          );
          userBillingAddresses[indexOfAlreadyDefaultAddress].is_selected = 1;
          this.setState({
            userBillingAddresses: userBillingAddresses,
            isLoading: false,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  }

  _getSelectedShippingAddress = async () => {
    const {selectedShippingAddressUUID} = this.props;
    const token = await AsyncStorage.getItem('token');
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_FETCH_SINGLE_SHIPPING_ADDRESS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          uuid: selectedShippingAddressUUID,
        },
      })
      .then((res) => {
        console.log(res);
        this.setState({
          selectedShippingAddressData: res.data.shipping_address[0],
        });
      })
      .catch((err) => console.log({...err}));
  };

  _searchBarToggle = () => {
    const {navigate} = this.props.navigation;
    navigate('Home');
  };

  _onSelectDefaultBillingAddress = async (
    indexOfAddressToBeSelected,
    address_uuid,
  ) => {
    // console.log(address_uuid);
    // console.log(this.state.userBillingAddresses[indexOfAddressToBeSelected]);
    const {userBillingAddresses} = this.state;
    const billingAddressDetails =
      userBillingAddresses[indexOfAddressToBeSelected];
    const addressData = {
      uuid: address_uuid,
      address_line_one: billingAddressDetails.address_line_one,
      street_address: billingAddressDetails.street_address,
      locality: billingAddressDetails.locality,
      landmark: billingAddressDetails.landmark,
      city_id: billingAddressDetails.city.id,
      pincode: billingAddressDetails.pincode,
      state_id: billingAddressDetails.state.id,
      country_id: billingAddressDetails.country.id,
      receiver_name: billingAddressDetails.receiver_name,
      receiver_phone: billingAddressDetails.receiver_phone,
      is_default: 1,
    };
    const token = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_UPDATE_BILLING_ADDRESS_KEY,
        {...addressData},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        console.log(response);
        userBillingAddresses.map((address, index) => {
          if (index == indexOfAddressToBeSelected) {
            address.is_default = 1;
            return;
          }
          address.is_default = 0;
        });
        this.setState({userBillingAddresses: userBillingAddresses});
      })
      .catch((err) => {
        console.log({...err});
      });
  };

  _onSelectBillingAddress = async (
    address_uuid,
    indexOfAddressToBeSelected,
  ) => {
    const {userBillingAddresses, is_same_as_shipping_address} = this.state;

    if (userBillingAddresses[indexOfAddressToBeSelected].is_default === 0) {
      Alert.alert(
        'Confirmation',
        'Do you want to make this address as your default Address?',
        [
          {text: 'NO', style: 'cancel'},
          {
            text: 'YES',
            onPress: () => {
              this._onSelectDefaultBillingAddress(
                indexOfAddressToBeSelected,
                address_uuid,
              );
            },
          },
        ],
      );
    }

    this.props.changeBillingAddressUUID(address_uuid);
    userBillingAddresses.map((address) => (address.is_selected = 0));
    userBillingAddresses[indexOfAddressToBeSelected].is_selected = 1;
    if (is_same_as_shipping_address) {
      this.setState({is_same_as_shipping_address: false});
    }
    this.setState({userBillingAddresses: userBillingAddresses});
  };

  _renderBillingAddresses = ({item, index}) => {
    return (
      <View style={styles.addressContainer}>
        <StatusBar
          barStyle={
            Platform.OS === 'android' ? 'dark-content' : 'light-content'
          }
          backgroundColor="white"
        />
        <View style={{...styles.addressInfoSection}}>
          <View style={styles.addressInfoUsernameSection}>
            <RadioButton
              isSelected={item.is_selected === 1 ? true : false}
              onPress={() => this._onSelectBillingAddress(item.uuid, index)}
              size={10}
              innerColor={'purple'}
              outerColor={'purple'}
            />
            <Text style={styles.addressInfoUsername}>{item.receiver_name}</Text>
          </View>
          <View style={styles.addressInfoAddress}>
            <Text style={{color: '#8d8d8d'}}>
              {item.address_line_one} {item.street_address} {item.landmark},{' '}
              {item.locality}, {item.city.name}, {item.state.name},{' '}
              {item.country.name} - {item.pincode}
            </Text>
          </View>
          <View style={styles.addressInfoPhone}>
            <Text style={{color: '#8d8d8d'}}>
              Mobile: {item.receiver_phone}
            </Text>
          </View>
        </View>
        {item.is_default === 1 && (
          <View style={styles.defaultAddressIndicator}>
            <Text style={styles.defaultAddressIndicatorText}>Default</Text>
          </View>
        )}
      </View>
    );
  };

  _onSelectBillingAddressSameAsShippingAddressPress = async () => {
    const {userBillingAddresses} = this.state;
    userBillingAddresses.map((address) => {
      address.is_selected = 0;
    });
    this.setState({
      userBillingAddresses,
      is_same_as_shipping_address: true,
    });
  };

  _onPressContinue = () => {
    const {is_same_as_shipping_address} = this.state;
    if (is_same_as_shipping_address) {
      this.props.changeIsBillingAddressAsShippingAddress(true);
      this.props.changeBillingAddressUUID('');
    }
    this.props.navigation.push('ShoppingCartPayment');
  };

  render() {
    const {navigate} = this.props.navigation;
    const {
      selectedShippingAddressData,
      is_same_as_shipping_address,
    } = this.state;
    return (
      <View style={{height: '100%'}}>
        {this.state.isiPhone12 && <SafeAreaView />}
        <View style={{backgroundColor: 'white'}}>
          {!this.state.isiPhone12 && (
            <Header
              placement="left"
              leftComponent={
                <Appbar.BackAction
                  color="#fff"
                  onPress={() => this.props.navigation.goBack()}
                />
              }
              centerComponent={{
                text: 'Select Billing Address',
                style: {
                  color: '#fff',
                  textTransform: 'capitalize',
                  letterSpacing: 0.8,
                  fontSize: 16,
                  marginLeft: -10,
                },
              }}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: ['#6B23AE', '#FAD44D'],
                start: {x: 0, y: 0},
                end: {x: 1.8, y: 0},
              }}
              // statusBarProps={{barStyle: 'light-content'}}
            />
          )}
          {this.state.isiPhone12 && (
            <Header
              placement="center"
              leftComponent={
                <Appbar.BackAction
                  color="#fff"
                  onPress={() => this.props.navigation.goBack()}
                />
              }
              centerComponent={{
                text: 'Select Billing Address',
                style: {
                  color: '#fff',
                  textTransform: 'capitalize',
                  letterSpacing: 0.8,
                  fontSize: 16,
                },
              }}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: ['#6B23AE', '#FAD44D'],
                start: {x: 0, y: 0},
                end: {x: 1.8, y: 0},
              }}
              containerStyle={{paddingTop: -10}}
              statusBarProps={{barStyle: 'dark-content'}}
            />
          )}
        </View>

        {!this.state.isLoading ? (
          <>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{...styles.addressessContainer, paddingTop: 10}}>
                {Object.keys(selectedShippingAddressData).length ? (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginHorizontal: 20,
                      }}>
                      <RadioButton
                        isSelected={is_same_as_shipping_address ? true : false}
                        onPress={() =>
                          this._onSelectBillingAddressSameAsShippingAddressPress()
                        }
                        size={10}
                        innerColor={'purple'}
                        outerColor={'purple'}
                      />
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          marginHorizontal: 11,
                        }}>
                        Same as Shipping Address
                      </Text>
                    </View>
                    <View style={styles.addressContainer}>
                      <StatusBar
                        barStyle={
                          Platform.OS === 'android'
                            ? 'dark-content'
                            : 'light-content'
                        }
                        backgroundColor="white"
                      />
                      <View style={{...styles.addressInfoSection}}>
                        <View
                          style={{
                            ...styles.addressInfoUsernameSection,
                            marginLeft: 18,
                          }}>
                          <Text style={styles.addressInfoUsername}>
                            {selectedShippingAddressData.receiver_name}
                          </Text>
                        </View>
                        <View style={styles.addressInfoAddress}>
                          <Text style={{color: '#8d8d8d'}}>
                            {selectedShippingAddressData.address_line_one}{' '}
                            {selectedShippingAddressData.street_address}{' '}
                            {selectedShippingAddressData.landmark},{' '}
                            {selectedShippingAddressData.locality},{' '}
                            {selectedShippingAddressData.city},{' '}
                            {selectedShippingAddressData.state},{' '}
                            {selectedShippingAddressData.country} -{' '}
                            {selectedShippingAddressData.pincode}
                          </Text>
                        </View>
                        <View style={styles.addressInfoPhone}>
                          <Text style={{color: '#8d8d8d'}}>
                            Mobile: {selectedShippingAddressData.receiver_phone}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{...styles.horizontalSeparator, marginTop: 0}}
                    />
                  </>
                ) : null}

                {this.state.userBillingAddresses.map((item, index) => {
                  return (
                    <View key={index}>
                      {this._renderBillingAddresses({item, index})}
                    </View>
                  );
                })}
                <View
                  style={{
                    ...styles.horizontalSeparator,
                    backgroundColor: '#dddddd',
                    marginBottom: 10,
                  }}
                />

                <Button
                  style={styles.addAddressButton}
                  contentStyle={{
                    width: '100%',
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  mode="contained"
                  onPress={() =>
                    navigate('AddressModificationRoot', {
                      screen: 'SelectAddress',
                      params: {
                        is_billing_address: true,
                      },
                    })
                  }>
                  Add/Edit Billing Address
                </Button>
              </View>

              <View style={{...styles.shoppingCartTotalCountFooter}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{textTransform: 'uppercase'}}>
                    Price Details
                  </Text>
                  <Text style={{marginLeft: 4}}>
                    ({this.props.cartTotal.length} Items)
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{color: '#8d8d8d'}}>Cart Total</Text>
                  <Text>${this.props.total_cart_amount}</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{color: '#8d8d8d'}}>Shipping Charge</Text>
                  <Text>${this.props.total_shipping_charge}</Text>
                </View>
                <View style={styles.horizontalSeparator} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{textTransform: 'uppercase', fontWeight: '700'}}>
                    Total
                  </Text>
                  <Text>${this.props.order_total_amount}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={{...styles.ShoppingCartShippingAddressFooter}}>
              <SafeAreaView
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    marginLeft: 5,
                  }}>
                  <Text
                    style={{color: '#000000', fontWeight: '700', fontSize: 16}}>
                    ${this.props.order_total_amount}
                  </Text>
                  <Text
                    style={{
                      color: '#8d8d8d',
                      textTransform: 'uppercase',
                      color: 'purple',
                      fontSize: 10,
                    }}>
                    Total Amount
                  </Text>
                </View>
                <Button
                  mode="contained"
                  style={{marginRight: 5}}
                  onPress={this._onPressContinue}>
                  Continue
                </Button>
              </SafeAreaView>
            </View>
          </>
        ) : (
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
            <ActivityIndicator size={25} color={'#6B23AE'} />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerIcon: {
    marginLeft: 12,
    marginRight: 12,
  },

  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    padding: 10,
  },
  addAddressButton: {
    elevation: 1,
    width: '95%',
    height: 40,
    borderRadius: 5,
    borderWidth: 0,
    alignSelf: 'center',
  },
  text: {
    color: '#454545',
    fontSize: 15,
  },

  addressessContainer: {
    elevation: 1,
    width: '100%',
    backgroundColor: 'white',
    paddingBottom: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  addressContainer: {
    width: '95%',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingBottom: 10,
    paddingTop: 10,
  },
  addressInfoSection: {
    marginLeft: 10,
  },
  addressInfoUsernameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop:10
  },
  addressInfoUsername: {
    marginLeft: 12,
  },
  addressInfoAddress: {
    width: 150,
    marginLeft: 30,
    marginTop: 6,
  },
  addressInfoPhone: {
    marginLeft: 30,
    marginTop: 6,
  },

  addressModificationBtns: {
    flexDirection: 'row',
    marginTop: 20,
  },

  defaultAddressIndicator: {
    width: 66,
    height: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    // marginTop:10
  },
  defaultAddressIndicatorText: {
    fontSize: 12,
    color: 'purple',
    ...Platform.select({
      ios: {
        marginTop: 0,
      },
      android: {
        marginTop: -1.4,
      },
    }),
  },

  deliveryEstimatesCard: {
    width: '100%',
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 10,
  },
  deliveryEstimatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  deliveryEstimatesImageContainer: {
    width: 80,
    height: 100,
    borderWidth: 1,
    borderColor: '#dddddd',
    backgroundColor: 'red',
  },
  deliveryEstimatesImage: {
    width: '100%',
    height: '100%',
  },

  shoppingCartTotalCountFooter: {
    // position:'absolute',
    width: '95%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    elevation: 1,
    marginTop: 10,
    // bottom:0,
    // left:0,
    padding: 14,
    marginBottom: 80,
  },
  horizontalSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#eeeeee',
    marginTop: 10,
  },

  ShoppingCartShippingAddressFooter: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    backgroundColor: 'white',
    ...Platform.select({
      android: {
        elevation: 10,
      },
    }),
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    cartTotal: state.cartTotal,
    total_cart_amount: state.total_cart_amount,
    total_shipping_charge: state.total_shipping_charge,
    order_total_amount: state.order_total_amount,

    selectedShippingAddressUUID: state.selectedShippingAddressUUID,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeBillingAddressUUID: (selectedBillingAddressUUID) => {
      dispatch({
        type: 'CHANGE_SELECTED_BILLING_ADDRESS_UUID',
        payload: selectedBillingAddressUUID,
      });
    },
    changeIsBillingAddressAsShippingAddress: (
      is_billing_address_as_shipping_address,
    ) => {
      dispatch({
        type: 'CHANGE_IS_BILLING_ADDRESS_AS_SHIPPING_ADDRESS',
        payload: is_billing_address_as_shipping_address,
      });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ShoppingCartBillingAddress);
