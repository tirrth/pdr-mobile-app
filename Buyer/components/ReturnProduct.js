import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {View, Modal, Text} from 'react-native';
import {IconButton} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_GET_RETURN_PRODUCT_ORDER_REASONS_KEY,
  API_SEND_RETURN_REQUEST_KEY,
} from '@env';
import {ActivityIndicator} from 'react-native';
import axios from 'axios';
import Ripple from 'react-native-material-ripple';
import {Button} from 'react-native-paper';
import {Pressable} from 'react-native';
import {Image} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  isLoading: true,

  return_reasons: [],
  return_shipment_methods: [],
  selected_return_shipment_method_id: null,
  selected_return_reason_id: null,
};

export default class ReturnProduct extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...initialState,
    };
  }

  componentDidMount() {
    console.log(this.props.product_details);
    this._getAllReasons();
    this._getAllReturnShipmentMethods();
  }

  _reloadComponent = () => {
    this._setToInitialState();
    this._getAllReasons();
    this._getAllReturnShipmentMethods();
  };

  _setToInitialState = () => {
    this.setState(initialState);
  };

  _getAllReturnShipmentMethods = () => {
    this.setState({
      return_shipment_methods: [
        {id: 0, method: 'Customer will bear the return shipping cost.'},
        {id: 1, method: 'Merchant will bear the return shipping cost.'},
      ],
    });
  };

  _getAllReasons = () => {
    axios
      .get(
        UNIVERSAL_ENTRY_POINT_ADDRESS +
          API_GET_RETURN_PRODUCT_ORDER_REASONS_KEY,
      )
      .then((res) => {
        console.log(res);
        this.setState({return_reasons: res.data.reason, isLoading: false});
      })
      .catch((err) => {
        console.log({...err});
        this.setState({isLoading: false});
      });
  };

  _onModalClose = () => {
    this._setToInitialState();
    this.props.toggleReturnProductModalVisibility();
  };

  _onReasonSelectionPress = (index) => {
    const {return_reasons} = this.state;
    return_reasons.map((reason) => (reason.is_selected = false));
    return_reasons[index].is_selected = true;
    this.setState({
      return_reasons: return_reasons,
      selected_return_reason_id: return_reasons[index].id,
    });
  };

  _onReturnShipmentMethodSelectionPress = (index) => {
    const {return_shipment_methods} = this.state;
    return_shipment_methods.map((reason) => (reason.is_selected = false));
    return_shipment_methods[index].is_selected = true;
    this.setState({
      return_shipment_methods: return_shipment_methods,
      selected_return_shipment_method_id: return_shipment_methods[index].id,
    });
  };

  _onSubmitReturnRequest = (product_order_id) => {
    const request_return_product = async () => {
      const token = await AsyncStorage.getItem('token');
      axios
        .post(
          UNIVERSAL_ENTRY_POINT_ADDRESS +
            API_SEND_RETURN_REQUEST_KEY +
            '/' +
            product_order_id,
          {
            reason: this.state.selected_return_reason_id,
            shipping_charges_borne_by: this.state
              .selected_return_shipment_method_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((res) => {
          console.log(res);
          this.props.on_success({
            res: res.data?.message,
          });
          this._onModalClose();
        })
        .catch((err) => {
          console.log({...err});
          this.props.on_error({
            err: err.response?.data?.message,
          });
          this._onModalClose();
        });
    };

    Alert.alert(
      'Hold on!',
      'Are you sure you want to send request to return this product?',
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress: () => request_return_product(),
        },
      ],
    );
  };

  render() {
    const {product_details: item} = this.props;
    const {
      isLoading,
      return_reasons,
      return_shipment_methods,
      selected_return_reason_id,
      selected_return_shipment_method_id,
    } = this.state;
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
        }}>
        <Modal animationType="slide" transparent={true} visible={true}>
          <SafeAreaView
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              height: '92%',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: 14,
              }}>
              <IconButton
                icon="arrow-down"
                onPress={() => this._onModalClose()}
              />
              <Text
                style={{
                  textTransform: 'capitalize',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                {item.product_name_when_order_placed}
              </Text>
              <IconButton
                icon="refresh"
                onPress={() => this._reloadComponent()}
              />
            </View>
            <View style={{...styles.horizontalSeparator}} />

            {!isLoading ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{marginVertical: 20}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      height: 130,
                      width: '90%',
                      alignSelf: 'center',
                    }}>
                    <View
                      style={{
                        width: '30%',
                        borderWidth: 1,
                        borderColor: '#dddddd',
                        height: '100%',
                        backgroundColor:
                          item.product.images.length === 0 ? '#eeeeee' : null,
                      }}>
                      {item.product.images.length !== 0 ? (
                        <Image
                          source={{uri: item.product.images[0].image}}
                          style={{
                            width: '100%',
                            height: '100%',
                            resizeMode: 'cover',
                          }}
                        />
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
                          <Text
                            style={{
                              fontSize: 12,
                              color: 'red',
                              textAlign: 'center',
                              paddingHorizontal: 10,
                              textDecorationLine: 'line-through',
                            }}>
                            No Image Available
                          </Text>
                        </View>
                      )}
                    </View>
                    <View
                      style={{
                        width: '70%',
                        height: '100%',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingLeft: 8,
                      }}>
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              textTransform: 'capitalize',
                              fontWeight: 'bold',
                              flexShrink: 1,
                            }}>
                            {item.product.product_name}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 4,
                          }}>
                          <Text style={{fontSize: 13}}>
                            $
                            {
                              item.product_price_after_discount_when_order_placed
                            }
                          </Text>
                          <Text
                            style={{
                              color: '#8d8d8d',
                              fontSize: 13,
                              textDecorationLine: 'line-through',
                              marginLeft: 6,
                            }}>
                            ${item.product_actual_price_when_order_placed}
                          </Text>
                        </View>
                        <Text style={{marginTop: 4, fontSize: 13}}>
                          Quantity: {item.quantity}
                        </Text>
                      </View>

                      {item.product_shipping_charge_domestic_when_order_placed &&
                      item.product_shipping_charge_international_when_order_placed ? (
                        <>
                          <View
                            style={{
                              ...styles.horizontalSeparator,
                              marginTop: 0,
                            }}
                          />

                          <View>
                            {item.product_shipping_charge_domestic_when_order_placed ? (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <Text>Domestic Charge:</Text>
                                <Text style={{color: '#8d8d8d', fontSize: 13}}>
                                  $
                                  {
                                    item.product_shipping_charge_domestic_when_order_placed
                                  }
                                </Text>
                              </View>
                            ) : null}
                            {item.product_shipping_charge_international_when_order_placed ? (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <Text>International Charge:</Text>
                                <Text style={{color: '#8d8d8d', fontSize: 13}}>
                                  $
                                  {
                                    item.product_shipping_charge_international_when_order_placed
                                  }
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </>
                      ) : null}
                    </View>
                  </View>
                  <View
                    style={{
                      ...styles.horizontalSeparator,
                      marginTop: 20,
                      marginBottom: 20,
                    }}
                  />
                  {return_reasons.length ? (
                    <>
                      <View
                        style={{
                          width: '90%',
                          alignSelf: 'center',
                          marginBottom: 8,
                          marginTop: -10,
                        }}>
                        <Text style={{fontWeight: '700', fontSize: 16}}>
                          Choose a reason
                        </Text>
                      </View>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: '#8d8d8d',
                          borderRadius: 4,
                          width: '90%',
                          alignSelf: 'center',
                        }}>
                        {return_reasons.map((data, index) => {
                          return (
                            <Ripple
                              key={index}
                              rippleContainerBorderRadius={
                                index == 0 || index == return_reasons.length - 1
                                  ? 4
                                  : 0
                              }
                              onPress={() =>
                                this._onReasonSelectionPress(index)
                              }>
                              <View
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  borderBottomWidth:
                                    index != return_reasons.length - 1 ? 1 : 0,
                                  borderColor: '#8d8d8d',
                                  padding: 10,
                                  backgroundColor: data.is_selected
                                    ? 'rgba(66,133,244,0.1)'
                                    : 'transparent',
                                }}>
                                <Text
                                  style={{
                                    marginRight: 8,
                                    color: data.is_selected
                                      ? '#4285F4'
                                      : '#000000',
                                  }}>
                                  {index + 1}.
                                </Text>
                                <Text
                                  style={{
                                    textTransform: 'capitalize',
                                    flex: 1,
                                    flexWrap: 'wrap',
                                    color: data.is_selected
                                      ? '#4285F4'
                                      : '#000000',
                                  }}>
                                  {data.reason}
                                </Text>
                              </View>
                            </Ripple>
                          );
                        })}
                      </View>
                    </>
                  ) : null}
                  <View
                    style={{
                      ...styles.horizontalSeparator,
                      marginTop: 20,
                      marginBottom: 20,
                    }}
                  />
                  <>
                    <View
                      style={{
                        width: '90%',
                        alignSelf: 'center',
                        marginBottom: 8,
                        marginTop: -10,
                      }}>
                      <Text style={{fontWeight: '700', fontSize: 16}}>
                        Choose a return shipment method
                      </Text>
                    </View>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#8d8d8d',
                        borderRadius: 4,
                        width: '90%',
                        alignSelf: 'center',
                      }}>
                      {return_shipment_methods.map((data, index) => {
                        return (
                          <Ripple
                            key={index}
                            rippleContainerBorderRadius={
                              index == 0 ||
                              index == return_shipment_methods.length - 1
                                ? 4
                                : 0
                            }
                            onPress={() =>
                              this._onReturnShipmentMethodSelectionPress(index)
                            }>
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderBottomWidth:
                                  index != return_shipment_methods.length - 1
                                    ? 1
                                    : 0,
                                borderColor: '#8d8d8d',
                                padding: 10,
                                backgroundColor: data.is_selected
                                  ? 'rgba(66,133,244,0.1)'
                                  : 'transparent',
                              }}>
                              <Text
                                style={{
                                  marginRight: 8,
                                  color: data.is_selected
                                    ? '#4285F4'
                                    : '#000000',
                                }}>
                                {index + 1}.
                              </Text>
                              <Text
                                style={{
                                  textTransform: 'capitalize',
                                  flex: 1,
                                  flexWrap: 'wrap',
                                  color: data.is_selected
                                    ? '#4285F4'
                                    : '#000000',
                                }}>
                                {data.method}
                              </Text>
                            </View>
                          </Ripple>
                        );
                      })}
                    </View>
                  </>
                  <View
                    style={{
                      ...styles.horizontalSeparator,
                      marginTop: 20,
                      marginBottom: 20,
                    }}
                  />
                  <View>
                    <Button
                      color={'#8D8D8D'}
                      mode="outlined"
                      style={{
                        width: '90%',
                        alignSelf: 'center',
                        borderWidth: 1.1,
                      }}
                      onPress={() => this._onModalClose()}>
                      Cancel
                    </Button>
                    <Button
                      // color={'#6B23AE'}
                      icon="keyboard-return"
                      mode="contained"
                      style={{width: '90%', alignSelf: 'center', marginTop: 8}}
                      disabled={
                        selected_return_reason_id !== null &&
                        selected_return_shipment_method_id !== null
                          ? false
                          : true
                      }
                      onPress={() => this._onSubmitReturnRequest(item.uuid)}>
                      Send Request for Return
                    </Button>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View
                style={{
                  ...StyleSheet.absoluteFill,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size={25} color="purple" />
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  horizontalSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#eeeeee',
  },
});
