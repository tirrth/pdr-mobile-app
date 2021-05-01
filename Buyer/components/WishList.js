import React, {Component} from 'react';
import {Appbar} from 'react-native-paper';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {Header} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {SwipeRating} from './rating-stars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_WISHLIST_VIEW_KEY,
  API_ADD_PRODUCT_TO_CART_KEY,
  API_REMOVE_PRODUCT_FROM_WISHLIST_KEY,
} from '@env';
import Ripple from 'react-native-material-ripple';
import NoAuthAccess from './NoAuthAccess';

const shoppingCartProductData = [
  {
    id: 0,
    img: require('../assets/swiper/10.webp'),
    productName: 'Main Title',
    productSubTitle: 'Solid Handheld Bag',
    discountedPrice: 15.83,
    retailPrice: 18.03,
  },
  {
    id: 1,
    img: require('../assets/swiper/10.webp'),
    productName: 'Main Title',
    productSubTitle: 'Solid Handheld Bag',
    discountedPrice: 15.83,
    retailPrice: 18.03,
  },
  {
    id: 2,
    img: require('../assets/swiper/10.webp'),
    productName: 'Main Title',
    productSubTitle: 'Solid Handheld Bag',
    discountedPrice: 15.83,
    retailPrice: 18.03,
  },
  {
    id: 3,
    img: require('../assets/swiper/10.webp'),
    productName: 'Main Title',
    productSubTitle: 'Solid Handheld Bag',
    discountedPrice: 15.83,
    retailPrice: 18.03,
  },
  {
    id: 4,
    img: require('../assets/swiper/10.webp'),
    productName: 'Main Title',
    productSubTitle: 'Solid Handheld Bag',
    discountedPrice: 15.83,
    retailPrice: 18.03,
  },
  {
    id: 5,
    img: require('../assets/swiper/10.webp'),
    productName: 'Main Title',
    productSubTitle: 'Solid Handheld Bag',
    discountedPrice: 15.83,
    retailPrice: 18.03,
  },
];

export default class Wishlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      productQuantity: 1,
      shoppingWishListProductData: [],
      isLoading: true,
      errorWishListMessage: '',

      is_usr_signed_in: false,
    };
  }

  async componentDidMount() {
    const value = await AsyncStorage.getItem('token');
    this.setState({is_usr_signed_in: value ? true : false});
    if (value) {
      this._getWishlistData(value);
    } else {
      this.setState({errorWishListMessage: 'You are Unauthorised.'});
    }
  }

  _getWishlistData = (value) => {
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_WISHLIST_VIEW_KEY, {
        headers: {Authorization: `Bearer ${value}`},
      })
      .then((response) => {
        console.log(response.data.products_wishlists);
        if (response.data.products_wishlists.data.length !== 0) {
          this.setState({
            shoppingWishListProductData: response.data.products_wishlists,
            isLoading: false,
          });
        } else {
          this.setState({errorWishListMessage: 'WishList is Empty!'});
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
        this.setState({errorWishListMessage: 'Network Error!'});
      });
  };

  _onAddToCartPress = async (uuid, wishlist_uuid) => {
    console.log(wishlist_uuid);
    const value = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_ADD_PRODUCT_TO_CART_KEY,
        {
          product_uuid: uuid,
          quantity: 1,
        },
        {
          headers: {Authorization: `Bearer ${value}`},
        },
      )
      .then((response) => {
        console.log(response);
        alert('Product has been successfully added to your cart!');
        this._onRemoveFromWishListPress(wishlist_uuid);
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  _onRemoveFromWishListPress = async (wishlist_uuid) => {
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
        const wishlistProductData = this.state.shoppingWishListProductData;
        const wishlistProductId = wishlistProductData.data.map((data) => {
          return data.uuid;
        });
        const indexOfProductToBeRemoved = wishlistProductId.indexOf(
          wishlist_uuid,
        );
        wishlistProductData.data.splice(indexOfProductToBeRemoved, 1);
        // console.log(wishlistProductData);
        this.setState({shoppingWishListProductData: wishlistProductData});
        if (this.state.shoppingWishListProductData.data.length === 0) {
          this.setState({
            isLoading: true,
            errorWishListMessage: 'WishList is Empty!',
          });
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  _renderProductList = ({item}) => {
    return (
      <View style={{...styles.shoppingCartProductCard}}>
        <Pressable
          onPress={() =>
            this.props.navigation.navigate('Product', {
              productId: item.products[0].uuid,
            })
          }>
          <View style={{...styles.shoppingCartProductAllData, height: 160}}>
            <View
              style={{
                ...styles.shoppingCartProductImageContainer,
                padding: 10,
                borderTopLeftRadius: 4,
              }}>
              {item.image !== '' ? (
                <Image
                  style={{
                    ...styles.shoppingCartProductImage,
                    borderWidth: 1,
                    borderColor: '#dddddd',
                  }}
                  source={{uri: item.image}}
                />
              ) : (
                <View
                  style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: '#eeeeee',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                  }}>
                  <Text
                    style={{color: 'red', textAlign: 'center', fontSize: 12}}>
                    No Image Available
                  </Text>
                </View>
              )}
            </View>
            <View
              style={{
                borderLeftWidth: 1,
                borderLeftColor: '#dddddd',
                height: '100%',
              }}
            />
            <View
              style={{...styles.shoppingCartProductTextualData, padding: 10}}>
              <View>
                <Text style={{fontSize: 16, fontWeight: '700'}}>
                  {item.products[0].product_name.length > 15
                    ? item.products[0].product_name.slice(0, 15) + '...'
                    : item.products[0].product_name}
                </Text>
                <Text style={{fontSize: 12, color: '#8d8d8d'}}>
                  {item.products[0].highlights.length > 25
                    ? item.products[0].highlights.slice(0, 25) + '...'
                    : item.products[0].highlights}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text>${item.products[0].price_after_discount}</Text>
                {item.products[0].discount ? (
                  <Text
                    style={{
                      color: '#8d8d8d',
                      marginLeft: 10,
                      textDecorationLine: 'line-through',
                    }}>
                    ${item.products[0].actual_price}
                  </Text>
                ) : null}
              </View>
              {item.products[0].discount ? (
                <Text style={{color: 'purple'}}>
                  Discount: {item.products[0].discount}%
                </Text>
              ) : null}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <SwipeRating
                  readonly
                  showRating={false}
                  imageSize={20}
                  ratingCount={5}
                  startingValue={
                    item.products[0].rating_stars
                      ? item.products[0].rating_stars
                      : 0
                  }
                />
                <Text style={{marginLeft: 8, fontSize: 13, color: '#8d8d8d'}}>
                  (30)
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
        <View style={styles.shoppingCartProductFooter}>
          <Ripple
            style={{
              width: '35%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() =>
              this._onAddToCartPress(item.products[0].uuid, item.uuid)
            }>
            <View>
              <Text style={{color: '#8d8d8d', textTransform: 'uppercase'}}>
                Add To Cart
              </Text>
            </View>
          </Ripple>
          <View
            style={{
              borderLeftWidth: 1,
              borderLeftColor: '#dddddd',
              height: '100%',
            }}
          />
          <Ripple
            style={{
              width: '65%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => this._onRemoveFromWishListPress(item.uuid)}>
            <Text
              style={{backgroundColor: 'yellow'}}
              style={{color: 'red', textTransform: 'uppercase'}}>
              Remove From Wishlist
            </Text>
          </Ripple>
        </View>
      </View>
    );
  };

  _searchBarToggle = () => {
    const {navigate} = this.props.navigation;
    navigate('Home');
  };

  render() {
    return (
      <View style={{height: '100%'}}>
        <Header
          placement="left"
          leftComponent={
            <Appbar.BackAction
              color="#fff"
              onPress={() => this.props.navigation.goBack()}
            />
          }
          centerComponent={{
            text: 'WishList',
            style: {color: '#fff', marginLeft: -10, letterSpacing: 0.8},
          }}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ['#6B23AE', '#FAD44D'],
            start: {x: 0, y: 0},
            end: {x: 1.8, y: 0},
          }}
          // containerStyle={{ borderBottomLeftRadius:8, borderBottomRightRadius:8}}
        />

        {this.state.is_usr_signed_in ? (
          <>
            {!this.state.isLoading ? (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={this.state.shoppingWishListProductData.data}
                renderItem={this._renderProductList}
                keyExtractor={(item) => `${item.uuid}`}
                key={'Sort Type'}
                contentContainerStyle={{paddingBottom: 100}}
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
                {this.state.errorWishListMessage !== '' ? (
                  <Text style={{color: '#8d8d8d'}}>
                    {this.state.errorWishListMessage}
                  </Text>
                ) : (
                  <ActivityIndicator size={26} color="purple" />
                )}
              </View>
            )}
          </>
        ) : (
          <NoAuthAccess
            navigation={() =>
              this.props.navigation.navigate('Auth', {screen: 'Login'})
            }
            page_name="WishList"
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerIcon: {
    marginLeft: 9,
    marginRight: 9,
  },

  shoppingCartTopBar: {
    width: '100%',
    backgroundColor: 'white',
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginTop: 8,
  },

  shoppingCartProductCard: {
    width: '96%',
    alignSelf: 'center',
    backgroundColor: 'white',
    elevation: 1,
    borderRadius: 4,
    marginTop: 8,
  },
  shoppingCartProductAllData: {
    flexDirection: 'row',
    // padding:10,
  },
  shoppingCartProductImageContainer: {
    height: '100%',
    width: '35%',
    backgroundColor: 'white',
  },
  shoppingCartProductImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },

  productQuantityContainer: {
    flexDirection: 'row',
  },
  shoppingCartProductTextualData: {
    marginLeft: 14,
    height: '100%',
    width: '65%',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  shoppingCartProductFooter: {
    height: 45,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    justifyContent: 'space-between',
    borderTopColor: '#dddddd',
  },
  shoppingCartPlaceOrderFooter: {
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
