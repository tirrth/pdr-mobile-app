import React, {Component} from 'react';
import {View, Text, StatusBar, StyleSheet, Image, Modal} from 'react-native';
import {Header} from 'react-native-elements';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Appbar, Card, IconButton, TextInput} from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ripple from 'react-native-material-ripple';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_GET_INDIVIDUAL_ORDER_KEY,
  API_UPDATE_ORDER_ITEM_STAUTS_KEY,
  API_RESPONSE_TO_RETURN_REQUEST_KEY,
} from '@env';
import {ActivityIndicator} from 'react-native';
import {Button} from 'react-native-paper';
import {Pressable} from 'react-native';
import {ToastAndroid} from 'react-native';
import StatusHistory from './StatusHistory';
import {Linking} from 'react-native';
import {Alert} from 'react-native';

// const orders = {
//   created_at: '12 Aug 2020',
//   order_no: 'AGHJSG32WHKGD322',
//   total_products: 4,
//   coupon_discount: 20,
//   grand_total: 400,
//   payment_mode: 'paypal',
//   products: [
//     {
//       product_no: '#43884739089',
//       product_name:
//         'Seller-1 Product-1 Seller-1 Product-1 Seller-1 Product-1 Seller-1 Product-1',
//       product_quantity: 2,
//       product_price: 20.21,
//       total_charges: 23.32,
//       order_status: 'Delivered',
//       delivered_date: '20 Aug 2021',
//       images: [
//         {
//           image: require('../assets/swiper/9.jpg'),
//         },
//       ],
//     },
//     {
//       product_no: '#62234964332',
//       product_name: 'Seller-2 Product-3',
//       product_quantity: 10,
//       product_price: 120.32,
//       total_charges: 127.32,
//       order_status: 'Under Process',
//       delivered_date: '10 Sep 2019',
//       images: [
//         {
//           image: require('../assets/swiper/9.jpg'),
//         },
//       ],
//     },
//   ],
// };

const initialState = {
  additionalDetails: {},
  orderProductDetails: [],
  isLoading: true,
  error_msg: '',

  is_update_status_modal_visible: false,
  update_status_modal_props_info: {},

  is_status_history_modal_visible: false,
  status_history_modal_props_info: {},

  is_submit_loader_visible: false,
};

export default class OrderDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...initialState,
    };
  }

  async componentDidMount() {
    this._getIndividiualOrderData();
  }

  _highlightOrderItem = (want_highlighted_background) => {
    const {orderProductDetails: product_details} = this.state;
    let {highlighted_order_item_uuid} = this.props.route.params;
    product_details.map((order_item, index) => {
      if (
        highlighted_order_item_uuid &&
        order_item.uuid == highlighted_order_item_uuid
      ) {
        highlighted_order_item_uuid = null;
        if (want_highlighted_background) {
          setTimeout(
            () =>
              this.order_details_flatlist_ref.scrollToIndex({
                index: index,
                animated: true,
                viewOffset: 80,
              }),
            500,
          );
        }

        order_item.highlight_background = want_highlighted_background;
      }
    });
    this.setState({orderProductDetails: product_details});

    if (want_highlighted_background) {
      setTimeout(() => {
        this._highlightOrderItem(false);
      }, 3000);
    }
  };

  _scrollToIndexFailed = (error) => {
    console.log('error while scrolling....', error);
    const offset = error.averageItemLength * error.index;
    this.order_details_flatlist_ref.scrollToOffset({offset});
    setTimeout(
      () => this.order_details_flatlist_ref.scrollToIndex({index: error.index}),
      100,
    );
  };

  _getIndividiualOrderData = async () => {
    const {order_id, highlighted_order_item_uuid} = this.props.route.params;
    const token = await AsyncStorage.getItem('token');
    axios
      .get(
        UNIVERSAL_ENTRY_POINT_ADDRESS +
          API_GET_INDIVIDUAL_ORDER_KEY +
          `/${order_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => {
        console.log('Product details', res);
        if (res.data.product_details.length) {
          this.setState({additionalDetails: res.data.additional_info});
          this.setState({
            orderProductDetails: res.data.product_details,
            isLoading: false,
          });

          if (highlighted_order_item_uuid) {
            this._highlightOrderItem(true);
          }
        } else {
          this.setState({error_msg: 'No data found!'});
        }
      })
      .catch((err) => {
        console.log({...err});
        this.setState({
          error_msg: err.response.data.message || 'Error occured!',
        });
      });
  };

  _onUpdateStatusModal = (update_status_modal_props_info) => {
    this.setState({
      update_status_modal_props_info: update_status_modal_props_info,
      is_update_status_modal_visible: true,
    });
  };

  _onStatusHistoryModal = (status_history_modal_props_info) => {
    this.setState({
      status_history_modal_props_info: status_history_modal_props_info,
      is_status_history_modal_visible: true,
    });
  };

  _onShipmentTrackingLinkPress = async (redirection_url) => {
    const supported = Linking.canOpenURL(redirection_url);
    if (supported) {
      await Linking.openURL(redirection_url);
    } else {
      alert(`Don't know how to open this URL: ${redirection_url}`);
    }
  };

  _onRenderOrderProductDetails = ({item}) => {
    return (
      <View
        style={{
          paddingVertical: 5,
          backgroundColor: item.highlight_background
            ? 'rgba(66,133,244,0.2)'
            : 'transparent',
        }}>
        <Card style={{marginHorizontal: 14}}>
          <View>
            <View style={{padding: 12}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 16,
                    textTransform: 'capitalize',
                  }}>
                  Current Status -{' '}
                  <Text>{item.order_status_for_this_product}</Text>
                </Text>
              </View>

              {item.order_status_id_for_this_product == 2 &&
              item.shipment_tracking_link ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 4,
                    width: '100%',
                    alignSelf: 'center',
                    borderColor: '#4285F4',
                    marginTop: 10,
                    padding: 8,
                  }}>
                  <Text style={{color: '#4285F4'}}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}>
                      Shipment Tracking Link:{' '}
                    </Text>
                    <Text
                      onPress={() =>
                        this._onShipmentTrackingLinkPress(
                          item.shipment_tracking_link,
                        )
                      }
                      style={{textDecorationLine: 'underline'}}>
                      {item.shipment_tracking_link}
                    </Text>
                  </Text>
                </View>
              ) : null}

              {item.order_status_id_for_this_product == 7 ? (
                <>
                  <View
                    style={{
                      borderWidth: 1,
                      borderRadius: 4,
                      width: '100%',
                      alignSelf: 'center',
                      borderColor: '#DB4437',
                      marginTop: 10,
                      padding: 8,
                    }}>
                    <Text style={{color: '#DB4437'}}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}>
                        Reason of Rejection:{' '}
                      </Text>
                      <Text>
                        {item.reason_for_rejecting_return_request ||
                          'No Reason Given!!'}
                      </Text>
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
            <View style={{...styles.horizontalSeparator}} />
            <View style={{flexDirection: 'row'}}>
              {item.product.images.length ? (
                <View
                  style={{
                    margin: 10,
                    borderColor: '#eee',
                    borderWidth: 1,
                    alignSelf: 'center',
                  }}>
                  <Image
                    source={{uri: item.base_url + item.product.images[0].image}}
                    style={{height: 120, width: 100}}
                  />
                </View>
              ) : (
                <View
                  style={{
                    margin: 10,
                    borderColor: '#eee',
                    backgroundColor: '#eee',
                    borderWidth: 1,
                    alignSelf: 'center',
                    height: 120,
                    width: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      padding: 10,
                      textAlign: 'center',
                      color: 'red',
                      textDecorationLine: 'line-through',
                    }}>
                    No Image
                  </Text>
                </View>
              )}
              <View
                style={{
                  ...styles.horizontalSeparator,
                  width: 1,
                  height: '100%',
                }}
              />
              <View
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 15,
                    textTransform: 'capitalize',
                  }}>
                  {item.product_name_when_order_placed.length >= 20
                    ? item.product_name_when_order_placed.slice(0, 25) + '...'
                    : item.product_name_when_order_placed}
                </Text>
                <View style={{flexDirection: 'row', marginTop: 2}}>
                  <Text style={{color: '#8d8d8d'}}>Product No.:</Text>
                  <Text
                    style={{
                      marginLeft: 10,
                      flexShrink: 1,
                      textTransform: 'uppercase',
                    }}>
                    {/* #{Math.floor(Math.random() * 1000000001)} */}
                    {item.product.sku}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 2}}>
                  <Text style={{color: '#8d8d8d'}}>Product Qty:</Text>
                  <Text style={{marginLeft: 10, flexShrink: 1}}>
                    {item.quantity}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 2}}>
                  <Text style={{color: '#8d8d8d'}}>Product Price:</Text>
                  <Text style={{marginLeft: 10, flexShrink: 1}}>
                    ${item.product_actual_price_when_order_placed}
                  </Text>
                </View>
                {item.product_discount_when_order_placed ? (
                  <View style={{flexDirection: 'row', marginTop: 2}}>
                    <Text style={{color: '#8d8d8d'}}>Product Discount:</Text>
                    <Text style={{marginLeft: 10, flexShrink: 1}}>
                      {item.product_discount_when_order_placed}%
                    </Text>
                  </View>
                ) : null}
                <View style={{flexDirection: 'row', marginTop: 2}}>
                  <Text style={{color: '#8d8d8d'}}>Total Charges:</Text>
                  <Text style={{marginLeft: 10, flexShrink: 1}}>
                    ${item.total_amount}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{...styles.horizontalSeparator}} />
            {item.status_information.product_next_order_status.length &&
            (item.status_information.product_next_order_status_id.length ===
              item.status_information.product_next_order_status.length) ==
              1 &&
            item.status_information.product_current_order_status.length &&
            item.status_information.product_current_order_status.length ===
              item.status_information.product_current_order_status.length ? (
              <>
                {/* <View style={{...styles.horizontalSeparator}} /> */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    padding: 12,
                  }}>
                  <Button
                    onPress={() => this._onUpdateStatusModal(item)}
                    mode="contained"
                    style={{width: '100%', backgroundColor: '#4285F4'}}>
                    Update Status
                  </Button>
                </View>
              </>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    padding: 12,
                  }}>
                  <Button
                    onPress={() => this._onStatusHistoryModal(item)}
                    mode="contained"
                    style={{width: '100%', backgroundColor: '#0F9D58'}}>
                    Status History
                  </Button>
                </View>
              </>
            )}

            {/* {item.order_status_id_for_this_product == 7 ? (
            <>
              <View style={{...styles.horizontalSeparator}} />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                  padding: 12,
                }}>
                <Text
                  style={{
                    textTransform: 'capitalize',
                    flex: 1,
                    flexWrap: 'wrap',
                    textAlign: 'center',
                  }}>
                  <Text
                    style={{textTransform: 'capitalize', fontWeight: 'bold'}}>
                    Reason of rejection:{' '}
                  </Text>
                  {item.reason_for_rejecting_return_request ||
                    'No Reason Given!!'}
                </Text>
              </View>
            </>
          ) : null} */}
          </View>
        </Card>
      </View>
    );
  };

  _flatListHeader = () => {
    const {additionalDetails, orderProductDetails} = this.state;
    return (
      <View style={{padding: 14, paddingBottom: 0}}>
        <View>
          <Text
            style={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: 16,
            }}>
            Order Details
          </Text>
          <View style={{marginTop: 4}}>
            <View style={{flexDirection: 'row', marginTop: 2}}>
              <Text style={{color: '#8d8d8d'}}>Order No: </Text>
              <Text style={{marginLeft: 6, flexShrink: 1}}>
                {
                  // additionalDetails.payment_gateway_order_details_url.split(
                  //   'orders/',
                  // )[1]
                  // additionalDetails.payment_gateway_token
                  additionalDetails.order_id
                }
              </Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: 2}}>
              <Text style={{color: '#8d8d8d'}}>Order Date: </Text>
              <Text style={{marginLeft: 6, flexShrink: 1}}>
                {additionalDetails.payment_gateway_order_create_time}
              </Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: 2}}>
              <Text style={{color: '#8d8d8d'}}>Order Time: </Text>
              <Text style={{marginLeft: 6, flexShrink: 1}}>
                {additionalDetails.created_at.split(' ')[1]}
              </Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: 2}}>
              <Text style={{color: '#8d8d8d'}}>Total Products: </Text>
              <Text style={{marginLeft: 6, flexShrink: 1}}>
                {orderProductDetails.length}
              </Text>
            </View>
            {/* <View style={{flexDirection:'row', marginTop:2}}>
                            <Text style={{color:'#8d8d8d'}}>Coupon Discount: </Text>
                            <Text style={{marginLeft:6, flexShrink:1}}>{`10`}%</Text>
                        </View> */}
            <View style={{flexDirection: 'row', marginTop: 2}}>
              <Text style={{color: '#8d8d8d'}}>Grand Total: </Text>
              <Text style={{marginLeft: 6, flexShrink: 1}}>
                ${additionalDetails.grand_total_amount}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            ...styles.horizontalSeparator,
            marginTop: 10,
            marginBottom: 10,
          }}
        />
        <View>
          <Text
            style={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: 16,
            }}>
            User Details
          </Text>
          <View style={{marginTop: 4}}>
            <Text
              style={{
                fontWeight: 'bold',
                color: '#8d8d8d',
                fontSize: 15,
                textTransform: 'capitalize',
              }}>
              {additionalDetails.buyer[0].first_name +
                ' ' +
                additionalDetails.buyer[0].last_name}
            </Text>
            {/* <View style={{flexDirection:'row', alignItems:'center', marginTop:2}}>
                            <Text style={{color:'#8d8d8d'}}>Order Date: </Text>
                            <Text style={{marginLeft:10, flexShrink:1}}>01 Sep. 2020</Text>
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center', marginTop:2}}>
                            <Text style={{color:'#8d8d8d'}}>Order Time: </Text>
                            <Text style={{marginLeft:10, flexShrink:1}}>10:00 PM</Text>
                        </View> */}
            <View style={{flexDirection: 'row', marginTop: 2}}>
              <Text style={{color: '#8d8d8d'}}>Contact No.: </Text>
              <Text style={{marginLeft: 6, flexShrink: 1}}>
                {additionalDetails.buyer[0].phone}
              </Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: 2}}>
              <Text style={{color: '#8d8d8d'}}>Delivery Address: </Text>
              {/* <Text style={{marginLeft:6, flexShrink:1}}>79 Faulkner Street, ABERFOYLE, New South Wales - 2350</Text> */}
              <Text
                style={{
                  marginLeft: 6,
                  flexShrink: 1,
                  textTransform: 'capitalize',
                }}>{`${additionalDetails.shipping_address[0].address_line_one}, ${additionalDetails.shipping_address[0].street_address}, ${additionalDetails.shipping_address[0].landmark}, ${additionalDetails.shipping_address[0].locality}`}</Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: 2}}>
              <Text style={{color: '#8d8d8d'}}>Transaction Mode: </Text>
              <Text
                style={{
                  marginLeft: 6,
                  flexShrink: 1,
                  textTransform: 'capitalize',
                }}>{`Paypal`}</Text>
            </View>
          </View>
        </View>
        <View
          style={{
            ...styles.horizontalSeparator,
            marginTop: 10,
            marginBottom: 10,
          }}
        />
        <View>
          <Text
            style={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: 16,
              marginBottom: 6,
            }}>
            Product Details
          </Text>
        </View>
      </View>
    );
  };

  _onModalClose = () => {
    this.setState({
      is_update_status_modal_visible: false,
      is_status_history_modal_visible: false,
    });
  };

  _onReloadComponent = () => {
    this.setState(initialState);
    this._getIndividiualOrderData();
  };

  render() {
    const {orderProductDetails, isLoading} = this.state;
    return (
      <View style={{flex: 1}}>
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
            text: 'Order Details',
            style: {
              color: '#fff',
              textTransform: 'capitalize',
              letterSpacing: 0.8,
              fontSize: 15,
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

        {isLoading ? (
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
            {!this.state.error_msg ? (
              <ActivityIndicator size={25} color="#6B23AE" />
            ) : (
              <Text
                style={{
                  color: '#8d8d8d',
                  textAlign: 'center',
                  padding: 10,
                  textTransform: 'capitalize',
                }}>
                {this.state.error_msg}
              </Text>
            )}
          </View>
        ) : (
          <>
            <FlatList
              ListHeaderComponent={this._flatListHeader}
              showsVerticalScrollIndicator={false}
              data={orderProductDetails}
              renderItem={this._onRenderOrderProductDetails}
              onScrollToIndexFailed={this._scrollToIndexFailed}
              keyExtractor={(item) => `${item.uuid}`}
              contentContainerStyle={{paddingBottom: 40}}
              ref={(comp) => (this.order_details_flatlist_ref = comp)}
            />
            {this.state.is_update_status_modal_visible ? (
              <UpdateStatusModal
                statusInfo={
                  this.state.update_status_modal_props_info.status_information
                }
                orderItemInfo={this.state.update_status_modal_props_info}
                onModalClose={() => this._onModalClose()}
                onReloadData={() => this._onReloadComponent()}
              />
            ) : null}

            {this.state.is_status_history_modal_visible ? (
              <StatusHistoryModal
                orderItemInfo={this.state.status_history_modal_props_info}
                onModalClose={() => this._onModalClose()}
                onReloadData={() => this._onReloadComponent()}
              />
            ) : null}
          </>
        )}
      </View>
    );
  }
}

const _onToastMessageSent = (message) => {
  ToastAndroid.showWithGravityAndOffset(
    message,
    ToastAndroid.SHORT,
    ToastAndroid.BOTTOM,
    25,
    50,
  );
};

class UpdateStatusModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected_status_id_to_update: null,

      product_current_order_status: {},
      product_next_order_status: [],

      is_return_request_deny_reason_input_enables: false,

      reason_to_deny_return_request: '',
      shipment_tracking_link: '',
    };
  }

  componentDidMount() {
    const {statusInfo: status_info} = this.props;
    console.log(
      'this.props.orderItemInfothis.props.orderItemInfo',
      this.props.orderItemInfo,
    );
    const product_next_order_status = [];
    const product_current_order_status = {
      id: status_info.product_current_order_status_id[0],
      status: status_info.product_current_order_status[0],
    };
    status_info.product_next_order_status.map((status, index) => {
      product_next_order_status.push({
        id: status_info.product_next_order_status_id[index],
        status: status_info.product_next_order_status[index],
        is_selected:
          status_info.product_next_order_status.length > 1 ? false : true,
      });
    });

    if (status_info.product_next_order_status_id.length == 1) {
      this.setState({
        selected_status_id_to_update:
          status_info.product_next_order_status_id[0],
      });
    }

    this.setState({
      product_current_order_status: product_current_order_status,
      product_next_order_status: product_next_order_status,
    });
  }

  _onStatusSelectionPress = (index) => {
    const {
      product_next_order_status,
      product_current_order_status,
    } = this.state;
    product_next_order_status.map((data, idx) => {
      if (idx == index) {
        if (product_current_order_status.id == 5 && index == 1) {
          this.setState({is_return_request_deny_reason_input_enables: true});
        } else {
          this.setState({is_return_request_deny_reason_input_enables: false});
        }
        data.is_selected = true;
        return;
      }
      data.is_selected = false;
    });
    this.setState({
      selected_status_id_to_update: product_next_order_status[index].id,
      product_next_order_status: product_next_order_status,
    });
  };

  _onUpdateOrderItemStatusChange = async () => {
    const {selected_status_id_to_update, shipment_tracking_link} = this.state;

    if (
      shipment_tracking_link &&
      selected_status_id_to_update == 2 &&
      this.state.product_current_order_status.id == 1
    ) {
      var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
      var regex = new RegExp(expression);
      if (!shipment_tracking_link.match(regex)) {
        _onToastMessageSent('Invalid URL Type.');
        this.setState({shipment_tracking_link: ''});
        return;
      }
    }

    this.setState({is_submit_loader_visible: true});
    const {orderItemInfo: order_item_info} = this.props;
    const token = await AsyncStorage.getItem('token');

    let data_header = {
      order_id: order_item_info.id,
      status: selected_status_id_to_update,
    };

    if (
      selected_status_id_to_update == 2 &&
      this.state.product_current_order_status.id == 1
    ) {
      data_header = {
        ...data_header,
        shipment_tracking_link: shipment_tracking_link,
      };
    } else {
      data_header = {
        ...data_header,
        shipment_tracking_link: '',
      };
    }

    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_UPDATE_ORDER_ITEM_STAUTS_KEY,
        data_header,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => {
        console.log(res);
        _onToastMessageSent(res.data.message);
        this.props.onModalClose();
        this.props.onReloadData();
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
        this.props.onModalClose();
        this.setState({is_submit_loader_visible: false});
      });
  };

  _onResponseToReturnRequestStatus = async () => {
    this.setState({is_submit_loader_visible: true});
    const {orderItemInfo: order_item_info} = this.props;
    const {
      selected_status_id_to_update,
      product_current_order_status,
      reason_to_deny_return_request,
    } = this.state;
    const token = await AsyncStorage.getItem('token');

    let header_data = {};
    if (selected_status_id_to_update == product_current_order_status.id + 1) {
      header_data = {request_accepted: 1};
    } else {
      header_data = {
        request_accepted: 0,
        reason_for_action: reason_to_deny_return_request,
      };
    }

    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS +
          API_RESPONSE_TO_RETURN_REQUEST_KEY +
          '/' +
          order_item_info.uuid,
        header_data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => {
        console.log(res);
        _onToastMessageSent(res.data.message);
        this.props.onModalClose();
        this.props.onReloadData();
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
        this.props.onModalClose();
        this.setState({is_submit_loader_visible: false});
      });
  };

  render() {
    const {
      product_current_order_status,
      product_next_order_status,
      is_submit_loader_visible,
      shipment_tracking_link,
    } = this.state;
    const {orderItemInfo: order_item_info} = this.props;
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
              height:
                product_current_order_status.id == 5
                  ? '75%'
                  : product_current_order_status.id == 1 &&
                    this.state.selected_status_id_to_update == 2
                  ? '60%'
                  : '46%',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
            }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{marginBottom: 80}}>
                <View>
                  <View>
                    <View
                      style={{
                        width: '90%',
                        alignSelf: 'center',
                        marginBottom: 8,
                        marginTop: 15,
                      }}>
                      <Text style={{fontWeight: '700', fontSize: 16}}>
                        Current Status
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
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 10,
                          backgroundColor: 'transparent',
                        }}>
                        <Text
                          style={{
                            textTransform: 'capitalize',
                            flex: 1,
                            flexWrap: 'wrap',
                            color: '#8d8d8d',
                          }}>
                          {product_current_order_status.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {product_current_order_status.id == 5 ? (
                    <>
                      <View>
                        <View
                          style={{
                            width: '90%',
                            alignSelf: 'center',
                            marginBottom: 8,
                            marginTop: 15,
                          }}>
                          <Text style={{fontWeight: '700', fontSize: 16}}>
                            Reason given by Customer
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
                          <View
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: 10,
                              backgroundColor: 'transparent',
                            }}>
                            <Text
                              style={{
                                textTransform: 'capitalize',
                                flex: 1,
                                flexWrap: 'wrap',
                                color: '#8d8d8d',
                              }}>
                              {
                                order_item_info.user_selected_request_id[0]
                                  .reason
                              }
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View>
                        <View
                          style={{
                            width: '90%',
                            alignSelf: 'center',
                            marginBottom: 8,
                            marginTop: 15,
                          }}>
                          <Text style={{fontWeight: '700', fontSize: 16}}>
                            Shipping Charges bearing info
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
                          <View
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: 10,
                              backgroundColor: 'transparent',
                            }}>
                            <Text
                              style={{
                                textTransform: 'capitalize',
                                flex: 1,
                                flexWrap: 'wrap',
                                color: '#8d8d8d',
                              }}>
                              {order_item_info.is_shipping_by_seller
                                ? 'You will bear the return shipping cost.'
                                : 'Customer will bear the return shipping cost.'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </>
                  ) : null}
                  <View>
                    <View
                      style={{
                        width: '90%',
                        alignSelf: 'center',
                        marginBottom: 8,
                        marginTop: 15,
                      }}>
                      <Text style={{fontWeight: '700', fontSize: 16}}>
                        Update to Status
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
                      {product_next_order_status.map((data, index) => {
                        return (
                          <Ripple
                            key={index}
                            rippleContainerBorderRadius={
                              index == 0 ||
                              index == product_next_order_status.length - 1
                                ? 4
                                : 0
                            }
                            onPress={() =>
                              product_next_order_status.length > 1
                                ? this._onStatusSelectionPress(index)
                                : null
                            }>
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderBottomWidth:
                                  index != product_next_order_status.length - 1
                                    ? 1
                                    : 0,
                                borderColor: '#8d8d8d',
                                padding: 10,
                                backgroundColor: data.is_selected
                                  ? 'rgba(66,133,244,0.1)'
                                  : 'transparent',
                              }}>
                              {product_next_order_status.length > 1 ? (
                                <Text
                                  style={{
                                    marginRight: 8,
                                    color: data.is_selected
                                      ? '#4285F4'
                                      : '#000000',
                                  }}>
                                  {index + 1}.
                                </Text>
                              ) : null}
                              <Text
                                style={{
                                  textTransform: 'capitalize',
                                  flex: 1,
                                  flexWrap: 'wrap',
                                  color: data.is_selected
                                    ? '#4285F4'
                                    : '#000000',
                                }}>
                                {data.status}
                              </Text>
                            </View>
                          </Ripple>
                        );
                      })}
                    </View>
                  </View>
                  {product_current_order_status.id == 5 &&
                  this.state.is_return_request_deny_reason_input_enables ? (
                    <View>
                      <View
                        style={{
                          width: '90%',
                          alignSelf: 'center',
                          marginBottom: 8,
                          marginTop: 15,
                        }}>
                        <Text style={{fontWeight: '700', fontSize: 16}}>
                          Reason for denying the request
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '90%',
                          alignSelf: 'center',
                        }}>
                        <TextInput
                          value={this.state.reason_to_deny_return_request}
                          mode="outlined"
                          // dense
                          multiline
                          numberOfLines={2}
                          label="Reason..."
                          style={{backgroundColor: 'white'}}
                          onChangeText={(text) =>
                            this.setState({reason_to_deny_return_request: text})
                          }
                        />
                      </View>
                    </View>
                  ) : null}

                  {product_current_order_status.id == 1 &&
                  this.state.selected_status_id_to_update == 2 ? (
                    <View>
                      <View
                        style={{
                          width: '90%',
                          alignSelf: 'center',
                          marginBottom: 8,
                          marginTop: 15,
                        }}>
                        <Text style={{fontWeight: '700', fontSize: 16}}>
                          Shipment Tracking Link
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '90%',
                          alignSelf: 'center',
                          marginTop: -6,
                        }}>
                        <TextInput
                          value={shipment_tracking_link}
                          textContentType="URL"
                          mode="outlined"
                          dense
                          autoCapitalize="none"
                          placeholder="https://www.shipment-tracker.com"
                          style={{backgroundColor: 'white'}}
                          onChangeText={(link) =>
                            this.setState({shipment_tracking_link: link})
                          }
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
                <View style={{...styles.horizontalSeparator, marginTop: 30}} />
                <View>
                  <Text
                    style={{
                      alignSelf: 'center',
                      fontWeight: 'bold',
                      marginTop: 10,
                      fontSize: 18,
                      color: '#0F9D58',
                    }}>
                    Status History
                  </Text>
                  <StatusHistory order_item_id={order_item_info.id} />
                </View>
              </View>
            </ScrollView>

            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                borderTopWidth: 1,
                borderTopColor: '#eeeeee',
                backgroundColor: '#fff',
              }}>
              {is_submit_loader_visible ? (
                <View
                  style={{
                    margin: 6,
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                  }}>
                  <ActivityIndicator size={24} color="#4285F4" />
                </View>
              ) : (
                <>
                  <Button
                    onPress={this.props.onModalClose}
                    mode="contained"
                    style={{
                      flex: 1,
                      backgroundColor: '#DB4437',
                      margin: 10,
                    }}>
                    Cancel
                  </Button>
                  <View
                    style={{
                      ...styles.horizontalSeparator,
                      height: '100%',
                      width: 1,
                      backgroundColor: '#eeeeee',
                    }}
                  />
                  <Button
                    onPress={() =>
                      product_current_order_status.id == 5
                        ? this._onResponseToReturnRequestStatus()
                        : this._onUpdateOrderItemStatusChange()
                    }
                    mode="contained"
                    // style={
                    //   product_current_order_status.id == 5 &&
                    //   this.state.selected_status_id_to_update !=
                    //     product_current_order_status.id + 1
                    //     ? this.state.reason_to_deny_return_request &&
                    //       this.state.selected_status_id_to_update
                    //       ? {
                    //           flex: 1,
                    //           margin: 10,
                    //           backgroundColor: '#4285F4',
                    //         }
                    //       : {flex: 1, margin: 10}
                    //     : product_current_order_status.id == 1 &&
                    //       this.state.selected_status_id_to_update == 2
                    //     ? shipment_tracking_link
                    //       ? {
                    //           flex: 1,
                    //           margin: 10,
                    //           backgroundColor: '#4285F4',
                    //         }
                    //       : {flex: 1, margin: 10}
                    //     : this.state.selected_status_id_to_update
                    //     ? {
                    //         flex: 1,
                    //         margin: 10,
                    //         backgroundColor: '#4285F4',
                    //       }
                    //     : {flex: 1, margin: 10}
                    // }
                    // disabled={
                    //   product_current_order_status.id == 5 &&
                    //   this.state.selected_status_id_to_update !=
                    //     product_current_order_status.id + 1
                    //     ? this.state.reason_to_deny_return_request &&
                    //       this.state.selected_status_id_to_update
                    //       ? false
                    //       : true
                    //     : product_current_order_status.id == 1 &&
                    //       this.state.selected_status_id_to_update == 2
                    //     ? shipment_tracking_link
                    //       ? false
                    //       : true
                    //     : this.state.selected_status_id_to_update
                    //     ? false
                    //     : true}
                    style={
                      product_current_order_status.id == 5 &&
                      this.state.selected_status_id_to_update !=
                        product_current_order_status.id + 1
                        ? this.state.reason_to_deny_return_request &&
                          this.state.selected_status_id_to_update
                          ? {
                              flex: 1,
                              margin: 10,
                              backgroundColor: '#4285F4',
                            }
                          : {flex: 1, margin: 10}
                        : this.state.selected_status_id_to_update
                        ? {
                            flex: 1,
                            margin: 10,
                            backgroundColor: '#4285F4',
                          }
                        : {flex: 1, margin: 10}
                    }
                    disabled={
                      product_current_order_status.id == 5 &&
                      this.state.selected_status_id_to_update !=
                        product_current_order_status.id + 1
                        ? this.state.reason_to_deny_return_request &&
                          this.state.selected_status_id_to_update
                          ? false
                          : true
                        : this.state.selected_status_id_to_update
                        ? false
                        : true
                    }>
                    Confirm
                  </Button>
                </>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    );
  }
}

class StatusHistoryModal extends Component {
  render() {
    const {orderItemInfo} = this.props;
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
              height: '50%',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
            }}>
            <View style={{borderBottomWidth: 1, borderBottomColor: '#eee'}}>
              <IconButton
                icon="arrow-down"
                style={{alignSelf: 'center'}}
                onPress={this.props.onModalClose}
              />
            </View>
            <StatusHistory order_item_id={orderItemInfo.id} />
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
    backgroundColor: '#ddd',
  },
});
