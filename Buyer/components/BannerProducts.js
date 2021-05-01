import React, {Component} from 'react';
import {View, Text, FlatList} from 'react-native';
import {Appbar, IconButton, Badge} from 'react-native-paper';
import {Header, Rating} from 'react-native-elements';
import axios from 'axios';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_FILTER_WITH_CATEGORY,
  API_SEARCH_WITH_FILTER_KEY,
  NO_AUTH_API_SEARCH_WITH_FILTER_KEY,
  API_ADD_PRODUCT_TO_WISHLIST_KEY,
  API_REMOVE_PRODUCT_FROM_WISHLIST_KEY,
  API_ADD_PRODUCT_TO_CART_KEY,
  NO_AUTH_API_FILTER_WITH_CATEGORY,
} from '@env';
import LinearGradient from 'react-native-linear-gradient';
import {StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator} from 'react-native';
import {Pressable} from 'react-native';
import {ImageBackground} from 'react-native';
import Ripple from 'react-native-material-ripple';
import {connect} from 'react-redux';
import {Alert} from 'react-native';
import {currency_strings} from '../locales';

export class HeaderBar extends Component {
  render() {
    return (
      <Header
        placement="left"
        leftComponent={
          <Appbar.BackAction
            color="#fff"
            onPress={() => this.props.navigation.goBack()}
          />
        }
        centerComponent={{
          text: 'Products',
          style: {
            color: '#fff',
            marginLeft: -10,
            fontSize: 16,
            letterSpacing: 0.8,
          },
        }}
        rightComponent={
          <HeaderIcons
            is_usr_logged_in={this.props.is_usr_logged_in}
            navigation={this.props.navigation}
            cartTotal={this.props.cartTotal}
            total_notifications_count={this.props.total_notifications_count}
          />
        }
        ViewComponent={LinearGradient}
        linearGradientProps={{
          colors: ['#6B23AE', '#FAD44D'],
          start: {x: 0, y: 0},
          end: {x: 1.8, y: 0},
        }}
        // containerStyle={{ borderBottomLeftRadius:8, borderBottomRightRadius:8 }}
      />
    );
  }
}

class HeaderIcons extends Component {
  _navigationFunc = (navigation) => {
    const {navigate} = this.props.navigation;
    navigate(navigation);
  };

  render() {
    const {is_usr_logged_in, total_notifications_count, cartTotal} = this.props;
    return (
      <View style={{...styles.headerIconsView}}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
          <IconButton
            color="#fff"
            icon={'magnify'}
            onPress={() => this._navigationFunc('Search')}
          />
        </View>
        <>
          {is_usr_logged_in ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                flexDirection: 'row',
              }}>
              <IconButton
                color="#fff"
                size={19}
                icon={'bell'}
                onPress={() => this._navigationFunc('Notifications')}
              />
              {total_notifications_count ? (
                <View
                  style={{marginLeft: -20, marginTop: -15, marginRight: 12}}>
                  <Badge
                    style={{
                      backgroundColor: 'red',
                      borderWidth: 0.5,
                      borderColor: '#fff',
                    }}
                    size={14}>
                    {total_notifications_count > 9
                      ? '9+'
                      : total_notifications_count}
                  </Badge>
                </View>
              ) : null}
            </View>
          ) : null}
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}>
            <IconButton
              color="#fff"
              size={20}
              icon={'heart-outline'}
              onPress={() => this._navigationFunc('WishList')}
            />
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'row',
            }}>
            <IconButton
              color="#fff"
              size={21}
              icon={'cart'}
              onPress={() => this._navigationFunc('AddToCartRoot')}
            />
            {cartTotal ? (
              <View style={{marginLeft: -16, marginTop: -15, marginRight: 9}}>
                <Badge
                  style={{
                    backgroundColor: 'red',
                    borderWidth: 0.5,
                    borderColor: '#fff',
                  }}
                  size={14}>
                  {cartTotal}
                </Badge>
              </View>
            ) : null}
          </View>
        </>
      </View>
    );
  }
}

class BannerProducts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      banner_product_info: [],
      next_page_url: null,

      err_msg: '',
      isLoading: true,

      usr_token: null,
    };
  }

  async componentDidMount() {
    const {banner_info} = this.props.route?.params;
    const token = await AsyncStorage.getItem('token');
    this.setState({usr_token: token});
    let url = '';
    let headers = {};
    // console.log('banner_info', banner_info);

    if (typeof banner_info !== 'object' || !banner_info) {
      this.setState({isLoading: true, err_msg: 'No data found!'});
      Alert.alert(
        'Alert',
        'No data found!',
        [
          {
            text: 'Okay',
            style: 'cancel',
          },
          {
            text: 'Go Back',
            onPress: () => {
              const {reset} = this.props.navigation;
              reset({routes: [{name: 'HomeRoot'}]});
            },
          },
        ],
        {cancelable: false},
      );
      return;
    }

    if (banner_info.category_id) {
      if (token) {
        url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_FILTER_WITH_CATEGORY;
        headers = {
          Authorization: `Bearer ${token}`,
          'content-type': `application/json`,
        };
      } else {
        url = UNIVERSAL_ENTRY_POINT_ADDRESS + NO_AUTH_API_FILTER_WITH_CATEGORY;
      }
      axios
        .get(url, {
          headers: headers,
          params: {
            category_uuid: banner_info.category.uuid,
            price_range_from: banner_info.price_range_from,
            price_range_to: banner_info.price_range_to,
            discount: banner_info.discount,
          },
        })
        .then((response) => {
          // console.log('response = ', response);
          this.setState({
            banner_product_info: response.data.filter.data,
            next_page_url: response.data.filter.next_page_url,
            isLoading: false,
          });
        })
        .catch((err) => {
          this.setState({err_msg: err.response.data.message});
          console.log({...err});
        });
    } else {
      if (token) {
        url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_SEARCH_WITH_FILTER_KEY;
        headers = {
          Authorization: `Bearer ${token}`,
        };
      } else {
        url =
          UNIVERSAL_ENTRY_POINT_ADDRESS + NO_AUTH_API_SEARCH_WITH_FILTER_KEY;
      }
      axios
        .get(url, {
          params: {
            product_name: '',
            price_range_from: banner_info.price_range_from,
            price_range_to: banner_info.price_range_to,
            discount: banner_info.discount,
          },
          headers: headers,
        })
        .then(async (response) => {
          // console.log('response = ', response);
          if (response.data.filter.data) {
            response.data.filter.data.map((data) => {
              data.image = data.images.length ? data.images[0].image : '';
              delete data.images;
            });
            this.setState({
              banner_product_info: response.data.filter.data,
              next_page_url: response.data.filter.next_page_url,
              isLoading: false,
            });
          } else {
            this.setState({err_msg: 'No Product Found!!'});
          }
        })
        .catch((err) => {
          console.log({...err});
          this.setState({err_msg: err.response.data.message || 'Error Found!'});
        });
    }
  }

  _onLoadMore = async (next_page_url) => {
    const {banner_info} = this.props.route?.params;
    const token = await AsyncStorage.getItem('token');
    axios
      .get(next_page_url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': `application/json`,
        },
        params: {
          category_uuid: banner_info.category.uuid,
          price_range_from: banner_info.price_range_from,
          price_range_to: banner_info.price_range_to,
          discount: banner_info.discount,
        },
      })
      .then((response) => {
        console.log('on_load_more = ', response);
        this.setState({
          banner_product_info: [
            ...this.state.banner_product_info,
            response.data.filter.data,
          ],
          next_page_url: response.data.filter.next_page_url,
        });
      })
      .catch((err) => {
        this.setState({err_msg: err.response.data.message});
        console.log({...err});
      });
  };

  _onMoveToWishListPress = async (uuid, index) => {
    const value = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_ADD_PRODUCT_TO_WISHLIST_KEY,
        {
          product_uuid: uuid,
        },
        {
          headers: {Authorization: `Bearer ${value}`},
        },
      )
      .then((response) => {
        // console.log(response);
        this.state.banner_product_info[index].wishlist_uuid =
          response.data.wishlist_uuid;
        this.state.banner_product_info[index].wishlist = 1;
        this.setState({banner_product_info: this.state.banner_product_info});
      })
      .catch((err) => {
        console.log({...err});
        if (err.response.status === 400) {
          alert('Product is already in the WishList!!');
        } else {
          alert(err.response.data.message);
        }
      });
  };

  _onRemoveFromWishListPress = async (wishlist_uuid, index) => {
    const value = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_REMOVE_PRODUCT_FROM_WISHLIST_KEY,
        {
          wishlist_uuid: wishlist_uuid,
        },
        {
          headers: {Authorization: `Bearer ${value}`},
        },
      )
      .then((response) => {
        // console.log(response);
        this.state.banner_product_info[index].wishlist = 0;
        this.setState({banner_product_info: this.state.banner_product_info});
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  _onPressAddToCart = async (product_uuid) => {
    const value = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_ADD_PRODUCT_TO_CART_KEY,
        {
          product_uuid: product_uuid,
          quantity: 1,
        },
        {
          headers: {Authorization: `Bearer ${value}`},
        },
      )
      .then((response) => {
        // console.log(response);
        alert(response.data.message);
        if (!this.props.cartTotal.includes(product_uuid)) {
          this.props.changeCartTotalCount([
            ...this.props.cartTotal,
            product_uuid,
          ]);
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  _renderProductList = ({item, index}) => {
    const {per_dollar_rate, currency_symbol} = currency_strings;
    return (
      <Pressable
        onPress={() =>
          this.props.navigation.push('Product', {productId: item.uuid})
        }>
        <View style={styles.CategoryListContainer}>
          <View style={styles.CategoryListInfoView}>
            <View style={styles.CategoryListImageContainer}>
              {item.image !== '' ? (
                <ImageBackground
                  source={{uri: item.image}}
                  style={styles.CategoryListImage}
                  imageStyle={{borderRadius: 4}}>
                  {/* {this.state.usr_token ? ( */}
                  <IconButton
                    style={{backgroundColor: '#fff'}}
                    size={14}
                    color={
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? '#000'
                          : 'red'
                        : '#000'
                    }
                    icon={
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? 'heart-outline'
                          : 'heart'
                        : 'heart-outline'
                    }
                    onPress={() =>
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? this._onMoveToWishListPress(item.uuid, index)
                          : this._onRemoveFromWishListPress(
                              item.wishlist_uuid,
                              index,
                            )
                        : alert('Please Sing In')
                    }
                  />
                  {/* ) : null} */}
                </ImageBackground>
              ) : (
                <View
                  style={{
                    ...styles.CategoryListImage,
                    backgroundColor: '#eeeeee',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {/* {this.state.usr_token ? ( */}
                  <IconButton
                    style={{
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                    size={14}
                    color={
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? '#000'
                          : 'red'
                        : '#000'
                    }
                    icon={
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? 'heart-outline'
                          : 'heart'
                        : 'heart-outline'
                    }
                    onPress={() =>
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? this._onMoveToWishListPress(item.uuid, index)
                          : this._onRemoveFromWishListPress(
                              item.wishlist_uuid,
                              index,
                            )
                        : alert('Please Sign In')
                    }
                  />
                  {/* ) : null} */}
                  <Text style={{color: 'red'}}>No Image</Text>
                </View>
              )}
            </View>
            <View style={{...styles.CategoryCenterContainer, flex: 1}}>
              <View>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontSize: 16,
                      flexShrink: 1,
                      textTransform: 'capitalize',
                    }}>
                    {item.product_name.length > 60
                      ? item.product_name.slice(0, 60) + '...'
                      : item.product_name}
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{color: '#8d8d8d', fontSize: 12, flexShrink: 1}}>
                    {item.highlights.length > 60
                      ? item.highlights.slice(0, 60) + '...'
                      : item.highlights}
                  </Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View>
                  <Rating
                    imageSize={18}
                    ratingCount={5}
                    readonly
                    startingValue={item.rating_stars ? item.rating_stars : 0}
                  />
                </View>
                <View style={{marginLeft: 6}}>
                  <Text style={{color: '#8d8d8d'}}>
                    ({item.total_ratings_count})
                  </Text>
                </View>
              </View>
              <View style={{...styles.itemPricingContainer}}>
                <Text style={{flexShrink: 1}}>
                  {/* ${item.price_after_discount} */}
                  {`${currency_symbol}${(
                    item.price_after_discount * per_dollar_rate
                  ).toFixed(2)}`}
                </Text>
                {item.discount ? (
                  <Text
                    style={{
                      color: '#8d8d8d',
                      textDecorationLine: 'line-through',
                      marginLeft: 10,
                      flexShrink: 1,
                    }}>
                    {/* ${item.actual_price} */}
                    {`${currency_symbol}${(
                      item.actual_price * per_dollar_rate
                    ).toFixed(2)}`}
                  </Text>
                ) : null}
                {item.discount ? (
                  <Text
                    style={{
                      color: 'red',
                      marginLeft: 10,
                      flexShrink: 1,
                    }}>{`${item.discount}% off`}</Text>
                ) : null}
              </View>
            </View>
          </View>
          {/* {this.state.usr_token ? ( */}
          <>
            <View
              style={{width: '100%', height: 1, backgroundColor: '#dddddd'}}
            />
            <Ripple
              onPress={() =>
                this.state.usr_token
                  ? this._onPressAddToCart(item.uuid)
                  : alert('Please Sign In')
              }
              rippleContainerBorderRadius={4}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                paddingVertical: 12,
              }}>
              <Text
                style={{
                  textTransform: 'uppercase',
                  color: '#6B23AE',
                  fontWeight: 'bold',
                }}>
                Add To Cart
              </Text>
            </Ripple>
          </>
          {/* ) : null} */}
        </View>
      </Pressable>
    );
  };

  render() {
    const {isLoading, err_msg, banner_product_info} = this.state;
    return (
      <View style={{flex: 1}}>
        <HeaderBar
          onPress={() => this.props.navigation.openDrawer()}
          navigation={this.props.navigation}
          is_usr_logged_in={this.state.usr_token ? true : false}
          cartTotal={this.props.cartTotal.length}
          total_notifications_count={this.props.total_notifications_count}
        />
        {isLoading ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {err_msg ? (
              <Text
                style={{
                  color: '#8d8d8d',
                  fontSize: 14,
                  padding: 10,
                  textAlign: 'center',
                }}>
                {err_msg}
              </Text>
            ) : (
              <ActivityIndicator size={25} color="#6B23AE" />
            )}
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={banner_product_info}
            renderItem={this._renderProductList}
            keyExtractor={(item) => `${item.uuid}`}
            ListFooterComponent={
              this.state.next_page_url ? (
                <ActivityIndicator size="small" color="#8d8d8d" />
              ) : (
                <></>
              )
            }
            ListFooterComponentStyle={{marginTop: 10}}
            contentContainerStyle={{paddingTop: 2, paddingBottom: 80}}
            key={'ListView'}
            onEndReached={() => {
              if (this.state.next_page_url) {
                this._onLoadMore(this.state.next_page_url);
              }
            }}
            onEndReachedThreshold={0.1}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerIconsView: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 12,
    marginRight: 12,
  },

  //Product List CSS
  CategoryListContainer: {
    elevation: 1,
    width: '96%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 4,
    justifyContent: 'center',
  },
  CategoryListImageContainer: {
    justifyContent: 'center',
  },
  CategoryListImage: {
    height: 130,
    width: 108,
    marginLeft: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  CategoryListInfoView: {
    flexDirection: 'row',
  },
  CategoryCenterContainer: {
    marginHorizontal: 16,
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: 130,
    marginVertical: 8,
    alignSelf: 'center',
  },
  // userRatingContainer:{
  //     backgroundColor:'white',
  //     borderRadius:6,
  //     flexDirection:'row',
  //     justifyContent:'space-around',
  //     height:32,
  //     alignItems:'center'
  // },
  // userRatingContainerRateSection:{
  //     flexDirection:'row',
  //     justifyContent:'space-evenly',
  //     alignItems:'baseline'
  // },
  // userRatingContainerUserCount:{
  //     paddingTop:6,
  //     paddingBottom:6,
  //     textAlign:'center',
  //     borderLeftWidth:0.8,
  //     borderLeftColor:'#dddddd'
  // },
  itemPricingContainer: {
    flexDirection: 'row',
  },
});

const mapStateToProps = (state) => {
  return {
    cartTotal: state.cartTotal,
    total_notifications_count: state.total_notifications_count,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeCartTotalCount: (cartTotal) => {
      dispatch({type: 'CHANGE_CART_TOTAL', payload: cartTotal});
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BannerProducts);
