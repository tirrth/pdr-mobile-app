import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {Header} from 'react-native-elements';
import {Icon} from 'react-native-elements';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {UNIVERSAL_ENTRY_POINT_ADDRESS, API_FETCH_ALL_ORDERS_KEY} from '@env';
import {Card} from 'react-native-paper';
import {BackHandler} from 'react-native';

export default class Orders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ordersList: [],
      isLoading: true,
      isError: null,

      next_page_url: null,
    };
  }

  backAction = () => {
    this.props.navigation.reset({routes: [{name: 'HomeRoot'}]});
    return true;
  };

  _isHighlightedOrderAlreadyAvailable = () => {
    const {ordersList} = this.state;
    const {highlighted_order_no} = this.props.route?.params;

    const orders_without_highlighted_order_no = ordersList.filter(
      (order) => order.order_id != highlighted_order_no,
    );

    return orders_without_highlighted_order_no.length == ordersList.length
      ? false
      : true;
  };

  _highlightOrder = (want_highlighted_background) => {
    const {ordersList} = this.state;
    let {highlighted_order_no} = this.props.route?.params;
    ordersList.map((order, index) => {
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

    this.setState({ordersList: ordersList});

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

  async componentDidMount() {
    console.log(this.props.route?.params);
    this.props.navigation.addListener('focus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.backAction);
    });

    this.props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    });

    const token = await AsyncStorage.getItem('token');
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_FETCH_ALL_ORDERS_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('oders', response.data);
        if (Array.isArray(response.data.summery_of_details)) {
          this.setState({
            isError: `You've not placed any orders yet`,
            isLoading: false,
          });
        } else if (response.data.summery_of_details.data.length) {
          this.setState({
            ordersList: response.data.summery_of_details.data,
            next_page_url: response.data.summery_of_details.next_page_url,
            isLoading: false,
          });

          // To highlight given order in the props - for notification purpose
          const {highlighted_order_no} = this.props.route?.params;
          if (
            highlighted_order_no &&
            this._isHighlightedOrderAlreadyAvailable()
          ) {
            this._highlightOrder(true);
          }
          // (EXIT) - To highlight given order in the props - for notification purpose
        } else {
          this.setState({
            isError: `You've not placed any orders yet`,
            isLoading: false,
          });
        }
      })
      .catch((err) => {
        console.log(err.response.data.message);
        this.setState({isError: err.response.data.message, isLoading: false});
        alert(err.response.data.message);
      });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  _onRenderOrderList = ({item}) => {
    return (
      <View
        style={{
          backgroundColor: item.highlight_background
            ? 'rgba(66,133,244, 0.2)'
            : 'transparent',
          paddingVertical: 5,
        }}>
        <Card
          style={{...styles.orderContainer}}
          onPress={() => {
            item.highlight_background = false;
            this.setState({ordersList: this.state.ordersList});
            this.props.navigation.navigate('OrderProducts', {
              order_id: item.id,
            });
          }}>
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
              {item.created_at.split(' ', 1)}
            </Text>
            <Text
              style={{
                flexShrink: 1,
                fontWeight: 'bold',
                textTransform: 'capitalize',
                fontSize: 16,
              }}>
              {item.global_order_status}
            </Text>
          </View>
          <View style={{...styles.horizontalSeparator, marginTop: 0}} />
          <View style={{paddingHorizontal: 14, paddingVertical: 10}}>
            <View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontWeight: 'bold'}}>Order No.:</Text>
                <Text
                  style={{
                    color: '#8d8d8d',
                    fontSize: 13,
                    flexShrink: 1,
                    marginLeft: 12,
                    textTransform: 'uppercase',
                  }}>
                  {/* {item.payment_gateway_token} */}
                  {item.order_id}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontWeight: 'bold'}}>Total Products:</Text>
                <Text style={{color: '#8d8d8d', fontSize: 13}}>
                  {item.total_items_per_order}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontWeight: 'bold'}}>Coupon Discount:</Text>
                <Text style={{color: '#8d8d8d', fontSize: 13}}>$03.45</Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontWeight: 'bold'}}>Grand Total:</Text>
                <Text style={{color: '#8d8d8d', fontSize: 13}}>
                  ${item.grand_total_amount}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontWeight: 'bold'}}>Payment Mode:</Text>
                <Text style={{color: '#8d8d8d', fontSize: 13}}>Paypal</Text>
              </View>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  _onLoadMoreOrders = async (next_page_url) => {
    const token = await AsyncStorage.getItem('token');
    token &&
      next_page_url &&
      axios
        .get(next_page_url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.summery_of_details.data.length) {
            this.setState({
              ordersList: [
                ...this.state.ordersList,
                ...response.data.summery_of_details.data,
              ],
              next_page_url: response.data.summery_of_details.next_page_url,
              isLoading: false,
            });
          }
        })
        .catch((err) => {
          console.log(err.response.data.message);
          this.setState({isError: err.response.data.message, isLoading: false});
          alert(err.response.data.message);
        });
  };

  render() {
    return (
      <View style={{height: '100%'}}>
        {/* <StatusBar backgroundColor="#ffffff" barStyle={'dark-content'} /> */}
        <Header
          placement="left"
          leftComponent={
            <TouchableWithoutFeedback
              onPress={() => this.props.navigation.openDrawer()}>
              <Icon name="menu" color="#fff" style={styles.headerIcon} />
            </TouchableWithoutFeedback>
          }
          centerComponent={{
            text: 'Orders',
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
          // containerStyle={{borderBottomLeftRadius:8, borderBottomRightRadius:8}}
        />
        {!this.state.isLoading ? (
          this.state.isError ? (
            <View
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                top: 0,
                left: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{color: '#8d8d8d', textAlign: 'center'}}>
                {this.state.isError}!
              </Text>
            </View>
          ) : (
            <FlatList
              ref={(comp) => (this.orders_flatlist_ref = comp)}
              onScrollToIndexFailed={this.scrollToIndexFailed}
              data={this.state.ordersList}
              renderItem={({item}) => this._onRenderOrderList({item})}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => `${item.id}`}
              contentContainerStyle={{paddingBottom: 40, paddingTop: 4}}
              onEndReached={() =>
                this.state.next_page_url
                  ? this._onLoadMoreOrders(this.state.next_page_url)
                  : null
              }
              onEndReachedThreshold={0.2}
              ListFooterComponent={() => {
                return this.state.next_page_url ? (
                  <ActivityIndicator
                    size={16}
                    style={{marginTop: 10}}
                    color={'#8d8d8d'}
                  />
                ) : null;
              }}
            />
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
            <ActivityIndicator color="purple" size={25} />
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

  orderContainer: {
    width: '95%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    // marginTop: 10,
  },
  horizontalSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#eeeeee',
    marginTop: 10,
  },
});

const modals = StyleSheet.create({
  feedbackModalContainer: {
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'column',
    elevation: 20,
  },
});
