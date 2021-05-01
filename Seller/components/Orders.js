import React, {Component} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import {Appbar, Card} from 'react-native-paper';
import {Header} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import Ripple from 'react-native-material-ripple';
import {FlatList} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_ALL_STATUS_KEY,
  API_ORDER_VIEW_KEY,
  API_FETCH_FILTER_ORDER_BY_STATUS_KEY,
  API_SEARCH_ORDER_BY_ID_KEY,
} from '@env';
import axios from 'axios';
import RNModalPicker from './rn-modal-picker';
import {Icon} from 'native-base';

export default class Orders extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainTabNavigationToggle: true,
      isLoading: true,
      error_msg: '',
      navigationSubTabs: [],
      orderDetails: [],
      order_details_next_page_url: null,
      filteredOrdersByStatusDetails: [],
      is_order_filter_view_visible: false,

      sortingPickerSelectedText: 'Filter By Status',

      searched_order_no: '',
    };
  }

  async componentDidMount() {
    const token = await AsyncStorage.getItem('token');
    const {highlighted_order_no} = this.props.route.params;
    this._getAllStatus(token);
    this._getOrdersData(
      token,
      UNIVERSAL_ENTRY_POINT_ADDRESS + API_ORDER_VIEW_KEY,
      highlighted_order_no ? true : false,
    );
  }

  _isHighlightedOrderAlreadyAvailable = () => {
    const {orderDetails} = this.state;
    const {highlighted_order_no} = this.props.route.params;

    const orders_without_highlighted_order_no = orderDetails.filter(
      (order) => order.order_id != highlighted_order_no,
    );

    return orders_without_highlighted_order_no.length == orderDetails.length
      ? false
      : true;
  };

  _onSearchHighlightedOrderNo = async (highlighted_order_no) => {
    this.setState({isLoading: true});
    const token = await AsyncStorage.getItem('token');

    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_SEARCH_ORDER_BY_ID_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          order_id: highlighted_order_no,
        },
      })
      .then((res) => {
        console.log(res);
        if (Array.isArray(res.data.product_order)) {
          this.setState({error_msg: 'No Order Found!'});
        } else if (res.data.product_order.data.length) {
          const {orderDetails} = this.state;
          Array.prototype.insert = function (index) {
            this.splice.apply(
              this,
              [index, 0].concat(this.slice.call(arguments, 1)),
            );
          };

          // Function to generate random number
          function randomNumber(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
          }
          const random_insertion_index = randomNumber(
            0,
            orderDetails.length - 1,
          );

          orderDetails.insert(
            random_insertion_index,
            ...res.data.product_order.data,
          );
          this.setState({
            orderDetails: orderDetails,
            isLoading: false,
          });

          this._highlightOrder(true);
        } else {
          this.setState({error_msg: 'No Order Found!'});
        }
      })
      .catch((err) => {
        console.log({...err});
        this.setState({error_msg: err.response.data.message});
      });
  };

  _getAllStatus = (token) => {
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_ALL_STATUS_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res);
        let navigationSubTabs = [
          {
            created_at: '2020-12-18 07:35:53',
            id: null,
            status: 'all',
            updated_at: '2020-12-18 07:35:53',
          },
          ...res.data.status,
        ];

        this.setState({navigationSubTabs: navigationSubTabs});
      })
      .catch((err) => {
        console.log(err);
        this.setState({isLoading: true, error_msg: err.response.data.message});
      });
  };

  _highlightOrder = (want_highlighted_background) => {
    const {orderDetails} = this.state;
    let {highlighted_order_no} = this.props.route.params;
    orderDetails.map((order, index) => {
      if (highlighted_order_no && order.order_id == highlighted_order_no) {
        highlighted_order_no = null;
        if (want_highlighted_background) {
          setTimeout(
            () =>
              this.orders_flatlist_ref.scrollToIndex({
                index: index,
                viewOffset: 80,
                animated: true,
              }),
            500,
          );
        }

        order.highlight_background = want_highlighted_background;
      }
    });

    this.setState({orderDetails: orderDetails});

    if (want_highlighted_background) {
      setTimeout(() => {
        this._highlightOrder(false);
      }, 3000);
    }
  };

  scrollToIndexFailed = (error) => {
    console.log('error while scrolling....', error);
    const offset = error.averageItemLength * error.index;
    this.orders_flatlist_ref.scrollToOffset({offset});
    setTimeout(
      () => this.orders_flatlist_ref.scrollToIndex({index: error.index}),
      100,
    );
  };

  _getOrdersData = (token, url, highlight_an_order) => {
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log('orders = ', res);

        if (res.data?.product_order?.data?.length) {
          this.setState({
            orderDetails: [
              ...this.state.orderDetails,
              ...res.data.product_order.data,
            ],
            isLoading: false,
            order_details_next_page_url: res.data.product_order.next_page_url,
          });

          if (highlight_an_order) {
            const is_highlighted_order_already_exists = this._isHighlightedOrderAlreadyAvailable();
            if (!is_highlighted_order_already_exists) {
              const {highlighted_order_no} = this.props.route.params;
              this._onSearchHighlightedOrderNo(highlighted_order_no);
            } else {
              this._highlightOrder(true);
            }
          }
        } else {
          this.setState({error_msg: 'Order List is empty!'});
        }
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response?.data?.message);
        this.setState({error_msg: err.response?.data?.message});
      });
  };

  _onRenderOrders = ({item}) => {
    return (
      <View
        style={{
          backgroundColor: item.highlight_background
            ? 'rgba(66,133,244, 0.2)'
            : 'transparent',
          paddingVertical: 5,
        }}>
        <Card
          onPress={() => {
            item.highlight_background = false;
            this.setState({orderDetails: this.state.orderDetails});
            this.props.navigation.push('OrderDetails', {order_id: item.id});
          }}
          style={styles.orderContainer}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 14,
                marginVertical: 10,
              }}>
              <Text
                style={{
                  flexShrink: 1,
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  fontSize: 16,
                }}>
                {item.created_at.split(' ')[0]}
              </Text>
              <Text
                style={{
                  flexShrink: 1,
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  fontSize: 16,
                }}>
                {item.order_status.status}
              </Text>
            </View>
            <View
              style={{
                ...styles.horizontalSeparator,
                marginTop: 0,
                width: '100%',
                height: 1,
              }}
            />
            <View style={{paddingHorizontal: 14, paddingVertical: 10}}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{fontWeight: 'bold'}}>Order No.:</Text>
                  <Text
                    style={{
                      color: '#8d8d8d',
                      fontSize: 13,
                      flexShrink: 1,
                      marginLeft: 12,
                    }}>
                    {item.order_id}
                  </Text>
                </View>
                {Array.isArray(item.order_items) && item.order_items.length ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{fontWeight: 'bold'}}>Total Products:</Text>
                    <Text style={{color: '#8d8d8d', fontSize: 13}}>
                      {item.order_items.length}
                    </Text>
                  </View>
                ) : null}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{fontWeight: 'bold'}}>Grand Total:</Text>
                  <Text style={{color: '#8d8d8d', fontSize: 13}}>
                    ${item.grand_total_amount}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{fontWeight: 'bold'}}>Payment Mode:</Text>
                  <Text
                    style={{
                      color: '#8d8d8d',
                      fontSize: 13,
                      textTransform: 'capitalize',
                    }}>
                    {'Paypal'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  _sortingPickerSelectedValue = (index, item_data) => {
    this._getFilterOrderByStatus(item_data.id, item_data.status);
  };

  _getFilterOrderByStatus = async (order_item_status = 1, status_text) => {
    this.setState({isLoading: true});
    if (order_item_status == null) {
      this.setState({
        is_order_filter_view_visible: false,
        sortingPickerSelectedText: 'filter by status',
        isLoading: false,
      });
      return;
    }
    const token = await AsyncStorage.getItem('token');
    axios
      .get(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_FETCH_FILTER_ORDER_BY_STATUS_KEY,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            order_item_status: order_item_status,
          },
        },
      )
      .then((res) => {
        console.log(res);
        if (res.data.product_order_details.length) {
          this.setState({
            sortingPickerSelectedText: status_text,
            filteredOrdersByStatusDetails: res.data.product_order_details,
            is_order_filter_view_visible: true,
            isLoading: false,
          });
        } else {
          alert('No data available for this filter!');
          this.setState({
            isLoading: false,
          });
        }
      })
      .catch((err) => {
        console.log({...err});
        this.setState({error_msg: err.response.data.message});
      });
  };

  _onSearchByOrderNoPress = async (searched_order_no) => {
    this.setState({isLoading: true});
    const token = await AsyncStorage.getItem('token');
    // const {searched_order_no} = this.state;

    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_SEARCH_ORDER_BY_ID_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          order_id: searched_order_no,
        },
      })
      .then((res) => {
        console.log(res);
        if (Array.isArray(res.data.product_order)) {
          // this.setState({error_msg: 'No data found!'});
          alert('No data found!');
          this.setState({isLoading: false});
        } else if (res.data.product_order.data.length) {
          this.setState({
            orderDetails: res.data.product_order.data,
            isLoading: false,
            order_details_next_page_url: res.data.product_order.next_page_url,
          });
        } else {
          alert('No data found!');
          this.setState({isLoading: false});
        }
      })
      .catch((err) => {
        console.log({...err});
        this.setState({error_msg: err.response.data.message});
      });
  };

  _onRenderFilterOrdersByStatus = ({item}) => {
    return (
      <Card
        onPress={() =>
          this.props.navigation.push('OrderDetails', {order_id: item.id})
        }
        style={{...styles.orderContainer, marginVertical: 5}}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
              marginVertical: 10,
            }}>
            <Text
              style={{
                flexShrink: 1,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: 16,
              }}>
              {/* {item.payment_gateway_token} */}
              {item.order_id}
            </Text>
            <Text
              style={{
                flexShrink: 1,
                // fontWeight: 'bold',
                textTransform: 'capitalize',
                fontSize: 16,
              }}>
              {item.created_at.split(' ')[0]}
            </Text>
          </View>

          {item.order_items.map((product_data, index) => {
            return (
              <View key={index}>
                <View
                  style={{
                    ...styles.horizontalSeparator,
                    marginTop: 0,
                    width: '100%',
                    height: 1,
                  }}
                />
                <View style={{flexDirection: 'row'}}>
                  {product_data.product.images.length ? (
                    <View
                      style={{
                        margin: 10,
                        borderColor: '#eee',
                        borderWidth: 1,
                        alignSelf: 'center',
                      }}>
                      <Image
                        source={{
                          uri: item.url + product_data.product.images[0].image,
                        }}
                        style={{height: 120, width: 100}}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        margin: 10,
                        borderColor: '#eee',
                        borderWidth: 1,
                        alignSelf: 'center',
                      }}>
                      <View
                        style={{
                          height: 120,
                          width: 100,
                          backgroundColor: '#eee',
                          justifyContent: 'center',
                          display: 'flex',
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
                      {product_data.product_name_when_order_placed.length >= 20
                        ? product_data.product_name_when_order_placed.slice(
                            0,
                            25,
                          ) + '...'
                        : product_data.product_name_when_order_placed}
                    </Text>
                    <View style={{flexDirection: 'row', marginTop: 2}}>
                      <Text style={{color: '#8d8d8d'}}>Product SKU:</Text>
                      <Text style={{marginLeft: 10, flexShrink: 1}}>
                        {/* #{Math.floor(Math.random() * 1000000001)} */}
                        {product_data.product.sku}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 2}}>
                      <Text style={{color: '#8d8d8d'}}>Product Qty:</Text>
                      <Text style={{marginLeft: 10, flexShrink: 1}}>
                        {product_data.quantity}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 2}}>
                      <Text style={{color: '#8d8d8d'}}>Product Price:</Text>
                      <Text style={{marginLeft: 10, flexShrink: 1}}>
                        ${product_data.product_actual_price_when_order_placed}
                      </Text>
                    </View>
                    {product_data.product_discount_when_order_placed ? (
                      <View style={{flexDirection: 'row', marginTop: 2}}>
                        <Text style={{color: '#8d8d8d'}}>
                          Product Discount:
                        </Text>
                        <Text style={{marginLeft: 10, flexShrink: 1}}>
                          {product_data.product_discount_when_order_placed}%
                        </Text>
                      </View>
                    ) : null}
                    <View style={{flexDirection: 'row', marginTop: 2}}>
                      <Text style={{color: '#8d8d8d'}}>Total Charges:</Text>
                      <Text style={{marginLeft: 10, flexShrink: 1}}>
                        ${product_data.total_amount}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    );
  };

  _renderViewHeaderComponent = () => {
    return (
      <View
        style={{
          marginVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          width: '96%',
          alignSelf: 'center',
        }}>
        <Card style={{flex: 1, marginRight: 8, height: 40, overflow: 'hidden'}}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              flex: 1,
              alignItems: 'center',
            }}>
            <View>
              <TextInput
                defaultValue={this.state.searched_order_no}
                style={{
                  marginLeft: 8,
                  backgroundColor: '#fff',
                  borderRadius: 5,
                  width: '100%',
                }}
                placeholderTextColor="gray"
                maxLength={15}
                onChangeText={(text) =>
                  this.setState({searched_order_no: text})
                }
                onSubmitEditing={() =>
                  this._onSearchByOrderNoPress(this.state.searched_order_no)
                }
                placeholder="Search by Order No."
              />
            </View>
            <Ripple
              style={{marginHorizontal: 4}}
              rippleContainerBorderRadius={4}
              onPress={() =>
                this._onSearchByOrderNoPress(this.state.searched_order_no)
              }
              disabled={this.state.searched_order_no ? false : true}>
              <View
                style={{
                  height: '82%',
                  width: 30,
                  backgroundColor: this.state.searched_order_no
                    ? '#4c8bf5'
                    : '#e8e8e8',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="search" style={{color: '#ffffff', fontSize: 18}} />
              </View>
            </Ripple>
          </View>
        </Card>
        <RNModalPicker
          dataSource={this.state.navigationSubTabs}
          dummyDataSource={this.state.navigationSubTabs}
          defaultValue={false}
          dataSourceKey="status"
          pickerTitle={'Filter By Status'}
          showSearchBar={false}
          disablePicker={false}
          changeAnimation={'fade'}
          placeHolderLabel={this.state.sortingPickerSelectedText}
          selectedLabel={this.state.sortingPickerSelectedText}
          showPickerTitle={true}
          pickerStyle={styles.pickerStyle}
          placeHolderTextStyle={{
            color: '#000',
            textTransform: 'capitalize',
          }}
          selectedValue={(index, item) =>
            this._sortingPickerSelectedValue(index, item)
          }
        />
      </View>
    );
  };

  _onLoadMoreOrders = async () => {
    const {order_details_next_page_url} = this.state;
    if (order_details_next_page_url) {
      const token = await AsyncStorage.getItem('token');
      this._getOrdersData(token, order_details_next_page_url, false);
    }
    return;
  };

  render() {
    const {
      isLoading,
      is_order_filter_view_visible,
      filteredOrdersByStatusDetails,
    } = this.state;
    return (
      <View style={{flex: 1}}>
        <StatusBar backgroundColor="#ffffff" barStyle={'dark-content'} />
        <View
          style={{
            backgroundColor: '#fff',
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            elevation: 4,
          }}>
          <Header
            placement="left"
            leftComponent={
              <Appbar.BackAction
                color="#fff"
                onPress={() => this.props.navigation.goBack()}
              />
            }
            centerComponent={{
              text: 'Orders',
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
        </View>

        {!isLoading && (
          <>
            {!is_order_filter_view_visible ? (
              <FlatList
                ref={(comp) => (this.orders_flatlist_ref = comp)}
                onScrollToIndexFailed={this.scrollToIndexFailed}
                ListHeaderComponent={this._renderViewHeaderComponent}
                showsVerticalScrollIndicator={false}
                data={this.state.orderDetails}
                renderItem={this._onRenderOrders}
                keyExtractor={(item, index) => `${index}`}
                contentContainerStyle={{paddingBottom: 40}}
                onEndReachedThreshold={0.3}
                onEndReached={() =>
                  this.state.order_details_next_page_url
                    ? this._onLoadMoreOrders()
                    : null
                }
                ListFooterComponent={() => {
                  return this.state.order_details_next_page_url ? (
                    <ActivityIndicator
                      style={{marginTop: 8}}
                      size={20}
                      color="#8d8d8d"
                    />
                  ) : (
                    <></>
                  );
                }}
              />
            ) : (
              <FlatList
                ListHeaderComponent={this._renderViewHeaderComponent}
                showsVerticalScrollIndicator={false}
                data={filteredOrdersByStatusDetails}
                renderItem={this._onRenderFilterOrdersByStatus}
                keyExtractor={(item) => `${item.uuid}`}
                contentContainerStyle={{paddingBottom: 40}}
              />
            )}
          </>
        )}

        {isLoading && (
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
                  padding: 10,
                  textTransform: 'capitalize',
                }}>
                {this.state.error_msg}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  horizontalSeparator: {
    height: '100%',
    width: 1,
    backgroundColor: '#eeeeee',
  },

  orderContainer: {
    width: '95%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    // marginTop: 10,
  },

  pickerStyle: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
});
