import React, {Component} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Header} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {Appbar, Button, RadioButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_GET_SHIPPING_ADDRESS_KEY,
  API_UPDATE_SHIPPING_ADDRESS_KEY,
  API_DELETE_SHIPPING_ADDRESS_KEY,
  API_GET_BILLING_ADDRESS_KEY,
  API_UPDATE_BILLING_ADDRESS_KEY,
  API_DELETE_BILLING_ADDRESS_KEY,
} from '@env';

export default class SelectAddress extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userAddresses: [],
      isLoading: true,
      error_msg: '',
      // toBeRemovedShippingAddressUUID: "",
    };
  }

  async componentDidMount() {
    const token = await AsyncStorage.getItem('token');
    const {is_billing_address} = this.props.route?.params;
    let url = '';
    if (!is_billing_address) {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_SHIPPING_ADDRESS_KEY;
    } else {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_BILLING_ADDRESS_KEY;
    }

    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const key = !is_billing_address
          ? 'shipping_address'
          : 'billing_address';
        // console.log(response.data[key].data);
        if (response.data[key].data.length !== 0) {
          this.setState({
            userAddresses: response.data[key].data,
            isLoading: false,
          });
        } else {
          this.setState({
            error_msg: 'No Data available!',
            isLoading: false,
          });
        }
      })
      .catch((err) => {
        console.log({...err});
        this.setState({
          error_msg: err.response.data.message,
          isLoading: false,
        });
      });
  }

  _onPressRemoveAddressAlert = (address_uuid) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => this._onPressRemoveAddress(address_uuid),
        },
      ],
      {cancelable: false},
    );
  };

  _onPressRemoveAddress = async (address_uuid) => {
    // console.log("address_uuid = ", address_uuid);
    const userToken = await AsyncStorage.getItem('token');
    const {is_billing_address} = this.props.route?.params;
    let url = '';
    if (!is_billing_address) {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_DELETE_SHIPPING_ADDRESS_KEY;
    } else {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_DELETE_BILLING_ADDRESS_KEY;
    }

    axios
      .post(
        url,
        {
          uuid: address_uuid,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      )
      .then((response) => {
        // console.log(response.data.message);
        alert(response.data.message);
        const userAddressesUUID = this.state.userAddresses.map(
          (data) => data.uuid,
        );
        this.state.userAddresses.splice(
          userAddressesUUID.indexOf(address_uuid),
          1,
        );
        this.setState({
          userAddresses: this.state.userAddresses,
        });
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  _onPressEditAddress = (address_uuid) => {
    const {is_billing_address} = this.props.route?.params;
    this.props.navigation.push('EditAddress', {
      edit_address_uuid: address_uuid,
      is_billing_address: is_billing_address,
    });
  };

  _onPressChangeDefaultAddress = async (address_uuid) => {
    console.log(address_uuid);
    const indexOfAddressToBeSelected = this.state.userAddresses
      .map((data) => {
        return data.uuid;
      })
      .indexOf(address_uuid);
    const indexOfAlreadySelectedAddress = this.state.userAddresses
      .map((data) => {
        return data.is_default;
      })
      .indexOf(1);
    const addressDetails = this.state.userAddresses[indexOfAddressToBeSelected];
    console.log(addressDetails);
    const addressData = {
      uuid: address_uuid,
      address_line_one: addressDetails.address_line_one,
      street_address: addressDetails.street_address,
      locality: addressDetails.locality,
      landmark: addressDetails.landmark,
      city_id: addressDetails.city.id,
      pincode: addressDetails.pincode,
      state_id: addressDetails.state.id,
      country_id: addressDetails.country.id,
      receiver_name: addressDetails.receiver_name,
      receiver_phone: addressDetails.receiver_phone,
      is_default: 1,
    };
    const token = await AsyncStorage.getItem('token');
    const {is_billing_address} = this.props.route?.params;
    let url = '';
    if (!is_billing_address) {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_UPDATE_SHIPPING_ADDRESS_KEY;
    } else {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_UPDATE_BILLING_ADDRESS_KEY;
    }

    axios
      .post(
        url,
        {...addressData},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        // console.log(response);
        this.state.userAddresses[indexOfAlreadySelectedAddress].is_default = 0;
        this.state.userAddresses[indexOfAddressToBeSelected].is_default = 1;
        this.setState({
          userAddresses: this.state.userAddresses,
        });
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message || 'Something is wrong!!');
      });
  };

  _onPressRadioButton = (address_uuid) => {
    Alert.alert(
      'Confirmation',
      'Do you want to make this address as your default address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => this._onPressChangeDefaultAddress(address_uuid),
        },
      ],
      {cancelable: false},
    );
  };

  _renderuserAddresses = ({item}) => {
    return (
      <View style={styles.addressContainer}>
        <View style={{...styles.addressInfoSection}}>
          <View style={styles.addressInfoUsernameSection}>
            <RadioButton
              status={item.is_default ? 'checked' : 'unchecked'}
              onPress={() => {
                item.is_default ? null : this._onPressRadioButton(item.uuid);
              }}
              value={item.uuid}
              color={'purple'}
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
          <View style={styles.addressModificationBtns}>
            <Button
              mode="outlined"
              color="#454545"
              marginRight={5}
              onPress={() => {
                item.is_default
                  ? alert(
                      "Can't remove default address. Make another address as default to do the same!!",
                    )
                  : this._onPressRemoveAddressAlert(item.uuid);
              }}>
              Remove
            </Button>
            <Button
              mode="outlined"
              marginLeft={5}
              onPress={() => this._onPressEditAddress(item.uuid)}>
              Edit
            </Button>
          </View>
        </View>
        {item.is_default === 1 ? (
          <View style={styles.defaultAddressIndicator}>
            <Text style={styles.defaultAddressIndicatorText}>Default</Text>
          </View>
        ) : null}
      </View>
    );
  };

  render() {
    const {is_billing_address} = this.props.route?.params;
    const {navigate, push} = this.props.navigation;
    const {error_msg} = this.state;

    return (
      <View style={{height: '100%'}}>
        <StatusBar backgroundColor="#ffffff" barStyle={'dark-content'} />
        <Header
          placement="left"
          leftComponent={
            <Appbar.BackAction
              color="#fff"
              onPress={() => this.props.navigation.goBack()}
            />
          }
          centerComponent={{
            text: `Select ${
              !is_billing_address ? 'Shipping' : 'Billing'
            } Address`,
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
          // containerStyle={{borderBottomLeftRadius:8, borderBottomRightRadius:8}}
        />
        {!this.state.isLoading ? (
          error_msg ? (
            <>
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
                  push('AddNewAddress', {
                    redirect_to_cart: false,
                    is_billing_address: is_billing_address,
                  })
                }>
                Add {!is_billing_address ? 'Shipping' : 'Billing'} Address
              </Button>
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
                  style={{
                    textAlign: 'center',
                    fontSize: 14,
                    color: '#8d8d8d',
                    paddingHorizontal: 10,
                    textAlign: 'center',
                  }}>
                  {error_msg}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={{marginBottom: 10}}>
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
                    push('AddNewAddress', {
                      redirect_to_cart: false,
                      is_billing_address: is_billing_address,
                    })
                  }>
                  Add {!is_billing_address ? 'Shipping' : 'Billing'} Address
                </Button>
              </View>
              <FlatList
                showsVerticalScrollIndicator={false}
                data={this.state.userAddresses}
                renderItem={this._renderuserAddresses}
                keyExtractor={(item) => `${item.uuid}`}
                key={'Shipping Addresses'}
                contentContainerStyle={{paddingBottom: 60}}
              />
            </>
          )
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
            <ActivityIndicator size={25} color="purple" />
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
    marginTop: 10,
    borderWidth: 0,
    alignSelf: 'center',
  },
  text: {
    color: '#454545',
    fontSize: 15,
  },

  addressContainer: {
    elevation: 1,
    width: '95%',
    borderRadius: 6,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignSelf: 'center',
    paddingBottom: 20,
    paddingTop: 20,
  },
  addressInfoSection: {
    marginLeft: 12,
  },
  addressInfoUsernameSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInfoIndicator: {
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'purple',
    borderWidth: 1,
  },
  addressInfoInsideIndicator: {
    width: 10,
    height: 10,
    borderRadius: 10 / 2,
    backgroundColor: 'purple',
  },
  addressInfoUsername: {
    marginLeft: 6,
  },
  addressInfoAddress: {
    width: 150,
    marginLeft: 44,
    marginTop: 0,
  },
  addressInfoPhone: {
    marginLeft: 44,
    marginTop: 6,
  },

  addressModificationBtns: {
    flexDirection: 'row',
    marginLeft: 44,
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
  },
  defaultAddressIndicatorText: {
    fontSize: 12,
    color: 'purple',
    marginTop: -1.4,
  },
});
