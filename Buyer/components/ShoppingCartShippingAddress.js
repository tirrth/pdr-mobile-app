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
  API_GET_SHIPPING_ADDRESS_KEY,
  API_SHIPPING_CHARGE_KEY,
  API_UPDATE_SHIPPING_ADDRESS_KEY,
} from '@env';
const deviceId = getDeviceId();

class ShoppingCartShippingAddress extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isiPhone12: false,
      userShippingAddresses: [],
      totalCartAmount: 0.0,
      shippingCharge: 0.0,
      priceAfterShipping: 0.0,
      isLoading: true,
    };
  }

  async componentDidMount() {
    // const {total_amount_from_cart} = this.props.route.params;
    // console.log(this.props.total_cart_amount);
    this.setState({totalCartAmount: this.props.total_cart_amount || 0.0});

    if (deviceId === 'iPhone13,4') {
      {
        this.setState({isiPhone12: true});
      }
    }
    const token = await AsyncStorage.getItem('token');
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_SHIPPING_ADDRESS_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.shipping_address.data.length) {
          const userShippingAddresses = response.data.shipping_address.data;

          const indexOfAlreadyDefaultAddress = userShippingAddresses
            .map((data) => {
              return data.is_default;
            })
            .indexOf(1);

          this.props.changeShippingAddressUUID(
            userShippingAddresses[indexOfAlreadyDefaultAddress].uuid,
          );
          userShippingAddresses[indexOfAlreadyDefaultAddress].is_selected = 1;
          console.log(
            'userShippingAddressesuserShippingAddresses',
            userShippingAddresses,
          );
          this.setState({
            userShippingAddresses: userShippingAddresses,
          });

          this._onCountShippingCart(
            userShippingAddresses[indexOfAlreadyDefaultAddress].uuid,
          );
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  }

  _searchBarToggle = () => {
    const {navigate} = this.props.navigation;
    navigate('Home');
  };

  _onSelectDefaultAddress = async (
    indexOfAddressToBeSelected,
    address_uuid,
  ) => {
    // console.log(address_uuid);
    // console.log(this.state.userShippingAddresses[indexOfAddressToBeSelected]);
    const shippingAddressDetails = this.state.userShippingAddresses[
      indexOfAddressToBeSelected
    ];
    const addressData = {
      uuid: address_uuid,
      address_line_one: shippingAddressDetails.address_line_one,
      street_address: shippingAddressDetails.street_address,
      locality: shippingAddressDetails.locality,
      landmark: shippingAddressDetails.landmark,
      city_id: shippingAddressDetails.city.id,
      pincode: shippingAddressDetails.pincode,
      state_id: shippingAddressDetails.state.id,
      country_id: shippingAddressDetails.country.id,
      receiver_name: shippingAddressDetails.receiver_name,
      receiver_phone: shippingAddressDetails.receiver_phone,
      is_default: 1,
    };
    const token = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_UPDATE_SHIPPING_ADDRESS_KEY,
        {...addressData},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        // console.log(response);
        const {userShippingAddresses} = this.state;
        userShippingAddresses.map((address, index) => {
          if (index == indexOfAddressToBeSelected) {
            address.is_default = 1;
            return;
          }
          address.is_default = 0;
        });
        this.setState({userShippingAddresses: userShippingAddresses});
      })
      .catch((err) => {
        console.log({...err});
      });
  };

  _onCountShippingCart = async (address_uuid) => {
    const indexOfAddressToBeSelected = this.state.userShippingAddresses
      .map((data) => {
        return data.uuid;
      })
      .indexOf(address_uuid);
    const indexOfAlreadySelectedAddress = this.state.userShippingAddresses
      .map((data) => {
        return data.is_selected;
      })
      .indexOf(1);
    if (
      this.state.userShippingAddresses[indexOfAddressToBeSelected]
        .is_default === 0
    ) {
      Alert.alert(
        'Confirmation',
        'Do you want to make this address as your default Address?',
        [
          {text: 'NO', style: 'cancel'},
          {
            text: 'YES',
            onPress: () => {
              this._onSelectDefaultAddress(
                indexOfAddressToBeSelected,
                address_uuid,
              );
            },
          },
        ],
      );
    }

    const userToken = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_SHIPPING_CHARGE_KEY,
        {
          shipping_address_id: address_uuid,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      )
      .then((response) => {
        console.log('API_SHIPPING_CHARGE_KEY', response);
        this.setState({
          shippingCharge: parseFloat(response.data.shipping_charges).toFixed(2),
          priceAfterShipping: parseFloat(
            this.state.totalCartAmount + response.data.shipping_charges,
          ).toFixed(2),
        });
        // console.log(response);
        this.props.changeShippingAddressUUID(address_uuid);
        this.state.userShippingAddresses[
          indexOfAlreadySelectedAddress
        ].is_selected = 0;
        this.state.userShippingAddresses[
          indexOfAddressToBeSelected
        ].is_selected = 1;
        this.setState({
          userShippingAddresses: this.state.userShippingAddresses,
        });

        this.setState({isLoading: false});
      })
      .catch((err) => {
        console.log(err);
      });
  };

  _renderUserShippingAddresses = ({item}) => {
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
              // animation={'bounceIn'}
              isSelected={item.is_selected === 1 ? true : false}
              onPress={() => this._onCountShippingCart(item.uuid)}
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

  render() {
    const {navigate} = this.props.navigation;

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
                text: 'Select Shipping Address',
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
              // containerStyle={{borderBottomLeftRadius:8, borderBottomRightRadius:8, }}
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
                text: 'Select Shipping Address',
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
                {this.state.userShippingAddresses.map((item, index) => {
                  return (
                    <View key={index}>
                      {this._renderUserShippingAddresses({item, index})}
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
                        is_billing_address: false,
                      },
                    })
                  }>
                  Change or Add New Address
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
                  <Text>${this.state.totalCartAmount}</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{color: '#8d8d8d'}}>Shipping Charge</Text>
                  <Text>${this.state.shippingCharge}</Text>
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
                  <Text>${this.state.priceAfterShipping}</Text>
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
                    ${this.state.priceAfterShipping || 0}
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
                  onPress={() => console.log('Pressed')}
                  style={{marginRight: 5}}
                  onPress={() => {
                    // this.props.navigation.push('ShoppingCartPayment', {
                    //   total_amount_from_cart: this.state.totalCartAmount,
                    //   price_after_shipping: this.state.priceAfterShipping,
                    // })
                    const {shippingCharge, priceAfterShipping} = this.state;
                    this.props.changeTotalShippingCharge(shippingCharge);
                    this.props.changeOrderTotalAmount(priceAfterShipping);
                    this.props.navigation.push('ShoppingCartBillingAddress', {
                      total_amount_from_cart: this.state.totalCartAmount,
                      price_after_shipping: this.state.priceAfterShipping,
                    });
                  }}>
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeShippingAddressUUID: (selectedShippingAddressUUID) => {
      dispatch({
        type: 'CHANGE_SELECTED_SHIPPING_ADDRESS_UUID',
        payload: selectedShippingAddressUUID,
      });
    },
    changeTotalShippingCharge: (total_shipping_charge) => {
      dispatch({
        type: 'CHANGE_TOTAL_SHIPPING_CHARGE',
        payload: total_shipping_charge,
      });
    },
    changeOrderTotalAmount: (order_total_amount) => {
      dispatch({
        type: 'CHANGE_ORDER_TOTAL_AMOUNT',
        payload: order_total_amount,
      });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ShoppingCartShippingAddress);
