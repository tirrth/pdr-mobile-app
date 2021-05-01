import React, {Component} from 'react';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_CART_VIEW_KEY,
  API_UPDATE_CART,
  API_ADD_PRODUCT_TO_WISHLIST_KEY,
  API_REMOVE_PRODUCT_FROM_CART_KEY,
  API_GET_SHIPPING_ADDRESS_KEY,
  API_GET_BILLING_ADDRESS_KEY,
} from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button, Appbar, TextInput} from 'react-native-paper';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Header} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import NumericInput from 'react-native-numeric-input';
import {connect} from 'react-redux';
// import { Badge } from 'react-native-paper';
import Ripple from 'react-native-material-ripple';
import {ToastAndroid} from 'react-native';
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

class ShoppingCartProducts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      productQuantity: 1,
      shoppingCartProductData: [],
      isLoading: true,
      // numericInputLoader: false,
      errorCartMessage: '',
      isAnyProductOutOfStock: false,

      isFetching: false,

      is_usr_logged_in: false,

      is_shipping_address_data_available: false,
      is_billing_address_data_available: false,
    };
  }

  async componentDidMount() {
    this.props.resetCartReduxVariables({except: ['cartTotal']});
    const value = await AsyncStorage.getItem('token');
    if (value) {
      this.setState({is_usr_logged_in: true});
      this._getCartProducts(value);
    } else {
      this.setState({errorCartMessage: 'You are Unauthorised.'});
    }
    // console.log("navigation", this.props.navigation);
  }

  _onRefresh = async () => {
    this.setState({isFetching: true, shoppingCartProductData: []});
    const token = await AsyncStorage.getItem('token');
    this._getCartProducts(token);
  };

  _isShippingAndBillingAddressFound = async () => {
    const token = await AsyncStorage.getItem('token');
    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_SHIPPING_ADDRESS_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('1');
        if (response.data.shipping_address.data.length !== 0) {
          this.setState({is_shipping_address_data_available: true});
        } else {
          this.setState({is_shipping_address_data_available: false});
        }
      })
      .catch((err) => {
        console.log(err);
      });

    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_BILLING_ADDRESS_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('2');
        if (response.data.billing_address.data.length !== 0) {
          this.setState({is_billing_address_data_available: true});
        } else {
          this.setState({is_billing_address_data_available: false});
        }
      })
      .catch((err) => {
        console.log(err);
      });
    return true;
  };

  _getCartProducts = (value) => {
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_CART_VIEW_KEY, {
        headers: {Authorization: `Bearer ${value}`},
      })
      .then(async (response) => {
        // console.log('response = ', response.data);

        if (response.data.cart.length) {
          if (!response.data.cart.hasOwnProperty('original')) {
            await this._isShippingAndBillingAddressFound();

            response.data.cart[0].total_amount = parseFloat(
              response.data.cart[0].total_amount,
            ).toFixed(2);
            const shoppingCartProductData = response.data.cart[0];

            // If any product is out of stock
            shoppingCartProductData.cart_items.map((data) => {
              if (data.is_this_product_out_of_the_stock) {
                this.setState({isAnyProductOutOfStock: true});
              }
            });
            // To add wishloader in every product information
            shoppingCartProductData.cart_items.map((data) => {
              data.wishlist_loader = false;
              data.move_to_addlist_button_loader = false;
              data.remove_from_cart_button_loader = false;
              data.toggle_quantity_text_field = false;
            });

            this.setState({
              shoppingCartProductData: shoppingCartProductData,
              isLoading: false,
              isFetching: false,
            });
            response.data.cart[0].cart_items.map((data) => {
              if (
                this.props.cartTotal.find((e) => e === data.product.uuid) ==
                undefined
              ) {
                this.props.changeCartTotalCount([
                  ...this.props.cartTotal,
                  data.product.uuid,
                ]);
              }
            });
          } else {
            this.setState({errorCartMessage: 'Cart is Empty!'});
          }
        } else {
          this.setState({errorCartMessage: 'Cart is Empty!'});
        }
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
        this.setState({errorCartMessage: err.response.data.message});
      });
  };

  _onChangeProductQuantity = async (
    index,
    changedQuantity,
    prevQuantity,
    cartID,
    productPrice,
  ) => {
    if (changedQuantity - prevQuantity != 0) {
      const {shoppingCartProductData} = this.state;
      shoppingCartProductData.cart_items[index].wishlist_loader = true;
      this.setState({shoppingCartProductData: shoppingCartProductData});

      const value = await AsyncStorage.getItem('token');

      axios
        .post(
          UNIVERSAL_ENTRY_POINT_ADDRESS + API_UPDATE_CART,
          {
            uuid: cartID,
            quantity: changedQuantity - prevQuantity,
          },
          {
            headers: {Authorization: `Bearer ${value}`},
          },
        )
        .then((response) => {
          shoppingCartProductData.cart_items[index].quantity +=
            changedQuantity - prevQuantity;
          shoppingCartProductData.total_amount = (
            parseFloat(shoppingCartProductData.total_amount) +
            (changedQuantity - prevQuantity) * parseFloat(productPrice)
          ).toFixed(2);
          shoppingCartProductData.cart_items[index].wishlist_loader = false;

          this.setState({shoppingCartProductData: shoppingCartProductData});
        })
        .catch((err) => {
          console.log({...err});

          shoppingCartProductData.cart_items[index].wishlist_loader = false;
          this.setState({shoppingCartProductData: shoppingCartProductData});

          alert(err.response.data.message);
        });
    }
  };

  _onMoveToWishListPress = async (
    indexOfProductToBeModified,
    uuid,
    cart_uuid,
  ) => {
    const modifiedProductData = this.state.shoppingCartProductData;
    modifiedProductData.cart_items[
      indexOfProductToBeModified
    ].move_to_addlist_button_loader = true;
    this.setState({shoppingCartProductData: modifiedProductData});

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
        alert('Product has been successfully added to your wishlist!');
        modifiedProductData.cart_items[
          indexOfProductToBeModified
        ].move_to_addlist_button_loader = false;
        this._onRemoveFromCart(cart_uuid, uuid, indexOfProductToBeModified);
        this.setState({shoppingCartProductData: modifiedProductData});
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
        modifiedProductData.cart_items[
          indexOfProductToBeModified
        ].move_to_addlist_button_loader = false;
        this.setState({shoppingCartProductData: modifiedProductData});
      });
  };

  _onRemoveFromCart = async (cart_uuid, product_uuid, index) => {
    const {shoppingCartProductData: cartProductData} = this.state;
    cartProductData.cart_items[index].remove_from_cart_button_loader = true;
    this.setState({shoppingCartProductData: cartProductData});

    const value = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_REMOVE_PRODUCT_FROM_CART_KEY,
        {
          cart_item_uuid: cart_uuid,
        },
        {
          headers: {Authorization: `Bearer ${value}`},
        },
      )
      .then((response) => {
        const isAnyProductOutOfStock =
          Array.isArray(cartProductData.cart_items) &&
          cartProductData.cart_items.find(
            (e) => e.is_this_product_out_of_the_stock === true,
          );
        if (!isAnyProductOutOfStock) {
          this.setState({isAnyProductOutOfStock: false});
        }

        if (
          Array.isArray(this.props.cartTotal) &&
          this.props.cartTotal.filter((e) => e === product_uuid).length
        ) {
          const {cartTotal} = this.props;
          const cartProductUUIDIndex = this.props.cartTotal.indexOf(
            product_uuid,
          );
          cartTotal.splice(cartProductUUIDIndex, 1);
          this.props.changeCartTotalCount([...cartTotal]);
        }

        const productTotalPriceCountingQuantity = (
          parseFloat(cartProductData.cart_items[index].quantity) *
          parseFloat(
            cartProductData.cart_items[index].product.price_after_discount,
          )
        ).toFixed(2);

        cartProductData.cart_items[
          index
        ].remove_from_cart_button_loader = false;
        cartProductData.total_amount -= parseFloat(
          productTotalPriceCountingQuantity,
        ).toFixed(2);
        cartProductData.cart_items?.splice(index, 1);

        this.setState({shoppingCartProductData: cartProductData});
        if (cartProductData.cart_items?.length === 0) {
          this.setState({isLoading: true, errorCartMessage: 'Cart is Empty!'});
        }
      })
      .catch((err) => {
        console.log({...err});
        cartProductData.cart_items[
          index
        ].remove_from_cart_button_loader = false;
        this.setState({shoppingCartProductData: cartProductData});
      });
  };

  _onToggleQuantityTextField = (index) => {
    const boolean = this.state.shoppingCartProductData.cart_items[index]
      .toggle_quantity_text_field;
    this.state.shoppingCartProductData.cart_items[
      index
    ].toggle_quantity_text_field = !boolean;
    this.setState({
      shoppingCartProductData: this.state.shoppingCartProductData,
    });
  };

  _onToastMessageSent = (message) => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  _onTextFieldQuantityChange = (
    index,
    changed_qtn,
    prev_qtn,
    max_qtn,
    cart_id,
    product_price,
  ) => {
    let current_qtn = parseInt(changed_qtn);
    if (current_qtn) {
      if (current_qtn >= max_qtn) {
        current_qtn = max_qtn;
        this._onToastMessageSent(`Only ${max_qtn} items are available!!`);
      }
      this._onChangeProductQuantity(
        index,
        current_qtn,
        prev_qtn,
        cart_id,
        product_price,
      );
      this._onToggleQuantityTextField(index);
    } else {
      // alert("Something is wrong with the quantity selection!!");
      this._onToggleQuantityTextField(index);
    }
  };

  _renderProductList = (data) => {
    const {item} = data;
    const {index} = data;
    return (
      <View style={{...styles.shoppingCartProductCard}}>
        <View style={{...styles.shoppingCartProductAllData}}>
          <Pressable
            onPress={() =>
              this.props.navigation.push('Product', {
                productId: item.product.uuid,
              })
            }>
            {item.product.image !== '' && (
              <View style={styles.shoppingCartProductImageContainer}>
                <Image
                  style={{
                    ...styles.shoppingCartProductImage,
                    resizeMode: 'contain',
                  }}
                  source={{uri: item.product.image}}
                />
              </View>
            )}
            {item.product.image === '' && (
              <View
                style={{height: 160, width: 120, backgroundColor: '#eeeeee'}}>
                <View
                  style={{
                    ...styles.shoppingCartProductImage,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'red',
                      width: '90%',
                      fontSize: 13,
                      textAlign: 'center',
                    }}>
                    No Image Available
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
          <View style={{...styles.shoppingCartProductTexualData}}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                textTransform: 'capitalize',
              }}>
              {item.product.product_name?.length > 20
                ? item.product.product_name.slice(0, 20) + '...'
                : item.product.product_name}
            </Text>
            <Text style={{marginTop: -12, fontSize: 12, color: '#8d8d8d'}}>
              {item.product.highlights?.length > 30
                ? item.product.highlights.slice(0, 30) + '...'
                : item.product.highlights}
            </Text>
            {!item.is_this_product_out_of_the_stock && (
              <View style={{...styles.productQuantityContainer}}>
                {item.toggle_quantity_text_field ? (
                  <View style={{width: 110}}>
                    <TextInput
                      onEndEditing={(e) =>
                        this._onTextFieldQuantityChange(
                          index,
                          e.nativeEvent.text,
                          item.quantity,
                          item.product.quantity,
                          item.uuid,
                          item.product.price_after_discount,
                        )
                      }
                      style={{backgroundColor: '#fff'}}
                      label="Quantity"
                      mode="outlined"
                      keyboardType="number-pad"
                      dense
                      defaultValue={`${item.quantity}`}
                    />
                  </View>
                ) : item.wishlist_loader ? (
                  <Pressable>
                    <View
                      style={{
                        alignItems: 'center',
                        width: 110,
                        height: 36,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#dddddd',
                        borderRadius: 7,
                        justifyContent: 'center',
                      }}>
                      <ActivityIndicator color="purple" size={20} />
                    </View>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => this._onToggleQuantityTextField(index)}>
                    <NumericInput
                      value={item.quantity}
                      rounded
                      minValue={1}
                      maxValue={item.product.quantity}
                      totalHeight={36}
                      separatorWidth={0.5}
                      totalWidth={110}
                      editable={false}
                      onChange={(changedQuantity) =>
                        this._onChangeProductQuantity(
                          index,
                          changedQuantity,
                          item.quantity,
                          item.uuid,
                          item.product.price_after_discount,
                        )
                      }
                      onLimitReached={() =>
                        this._onToastMessageSent(
                          'Quantity has reached to its limit!',
                        )
                      }
                    />
                  </Pressable>
                )}
              </View>
            )}

            {item.is_this_product_out_of_the_stock && (
              <View
                style={{
                  height: 36,
                  backgroundColor: 'red',
                  borderRadius: 4,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: '#fff', textTransform: 'uppercase'}}>
                  Out Of Stock
                </Text>
              </View>
            )}
            <View style={{flexDirection: 'row'}}>
              <Text>${item.product.price_after_discount}</Text>
              {item.product.discount ? (
                <Text
                  style={{
                    color: '#8d8d8d',
                    marginLeft: 10,
                    textDecorationLine: 'line-through',
                  }}>
                  ${item.product.actual_price}
                </Text>
              ) : null}
            </View>
            {item.product.discount ? (
              <Text style={{color: 'purple'}}>
                Discount: {item.product.discount}%
              </Text>
            ) : null}
          </View>
        </View>
        {!item.is_this_product_out_of_the_stock && (
          <View style={styles.shoppingCartProductFooter}>
            <Ripple
              onPress={() =>
                this._onMoveToWishListPress(index, item.product.uuid, item.uuid)
              }
              style={{
                width: '50%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View>
                {!item.move_to_addlist_button_loader ? (
                  <Text style={{color: '#8d8d8d', textTransform: 'uppercase'}}>
                    Move to Wishlist
                  </Text>
                ) : (
                  <ActivityIndicator color="purple" size={16} />
                )}
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
                width: '50%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                this._onRemoveFromCart(item.uuid, item.product.uuid, index)
              }>
              {!item.remove_from_cart_button_loader ? (
                <Text
                  style={{backgroundColor: 'yellow'}}
                  style={{color: 'red', textTransform: 'uppercase'}}>
                  Remove
                </Text>
              ) : (
                <ActivityIndicator color="purple" size={16} />
              )}
            </Ripple>
          </View>
        )}

        {item.is_this_product_out_of_the_stock && (
          <Ripple
            onPress={() =>
              this._onRemoveFromCart(item.uuid, item.product.uuid, index)
            }>
            <View
              style={{
                ...styles.shoppingCartProductFooter,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: 'red',
                  textTransform: 'uppercase',
                  marginLeft: 10,
                  fontWeight: 'bold',
                }}>
                Remove to go ahead
              </Text>
            </View>
          </Ripple>
        )}
      </View>
    );
  };

  _onPlaceOrderClick = async () => {
    const {
      is_shipping_address_data_available,
      is_billing_address_data_available,
    } = this.state;

    if (!is_shipping_address_data_available) {
      this.props.navigation.push('AddNewAddress', {
        redirect_to_cart: true,
        is_billing_address: false,
      });
    } else if (!is_billing_address_data_available) {
      this.props.navigation.push('AddNewAddress', {
        redirect_to_cart: true,
        is_billing_address: true,
      });
    } else {
      const {shoppingCartProductData} = this.state;
      this.props.changeTotalCartAmount(shoppingCartProductData.total_amount);
      this.props.navigation.push('ShoppingCartShippingAddress', {
        total_amount_from_cart: shoppingCartProductData.total_amount,
      });
    }
  };

  _goBack = () => {
    let canGoBack = this.props.navigation.canGoBack();
    if (canGoBack) {
      try {
        this.props.navigation.goBack();
      } catch (e) {
        this.props.navigation.reset({routes: [{name: 'HomeRoot'}]});
      }
    } else {
      this.props.navigation.reset({routes: [{name: 'HomeRoot'}]});
    }
  };

  render() {
    return (
      <View style={{height: '100%'}}>
        <StatusBar
          barStyle={
            Platform.OS === 'android' ? 'dark-content' : 'light-content'
          }
          backgroundColor="white"
        />
        <Header
          placement="left"
          leftComponent={
            <Appbar.BackAction color="#fff" onPress={() => this._goBack()} />
          }
          centerComponent={{
            text: 'Shopping Cart',
            style: {
              color: '#fff',
              textTransform: 'capitalize',
              marginLeft: -10,
              fontSize: 16,
              letterSpacing: 0.8,
            },
          }}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ['#6B23AE', '#FAD44D'],
            start: {x: 0, y: 0},
            end: {x: 1.8, y: 0},
          }}
        />

        {this.state.is_usr_logged_in ? (
          <>
            {!this.state.isLoading ? (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={this.state.shoppingCartProductData.cart_items}
                renderItem={(data) => this._renderProductList(data)}
                refreshing={this.state.isFetching}
                onRefresh={() => this._onRefresh()}
                keyExtractor={(item) => `${item.uuid}`}
                key={'Sort Type'}
                contentContainerStyle={{paddingBottom: 100}}
              />
            ) : (
              <View
                style={{
                  height: '100%',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}>
                {this.state.errorCartMessage ? (
                  <Text style={{color: '#8d8d8d'}}>
                    {this.state.errorCartMessage}
                  </Text>
                ) : (
                  <ActivityIndicator size={26} color="purple" />
                )}
              </View>
            )}

            {!this.state.isLoading &&
            this.state.shoppingCartProductData?.total_amount ? (
              <View style={styles.shoppingCartPlaceOrderFooter}>
                <SafeAreaView
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: '50%',
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      marginLeft: 5,
                    }}>
                    <View
                      style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                      <Text
                        style={{
                          color: '#000000',
                          fontWeight: '700',
                          fontSize: 16,
                        }}>
                        ${this.state.shoppingCartProductData.total_amount}
                      </Text>
                    </View>
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
                    onPress={
                      !this.state.isAnyProductOutOfStock
                        ? () => this._onPlaceOrderClick()
                        : () =>
                            alert(
                              'Please delete all the all out stock items first!!',
                            )
                    }>
                    Place Order
                  </Button>
                </SafeAreaView>
              </View>
            ) : null}
          </>
        ) : (
          <NoAuthAccess
            navigation={() =>
              this.props.navigation.navigate('Auth', {screen: 'Login'})
            }
            page_name="Shopping Cart"
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
    padding: 10,
  },
  shoppingCartProductImageContainer: {
    height: 160,
    width: 120,
    // elevation: 1,
    borderWidth: 0.9,
    borderColor: '#eeeeee',
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
  shoppingCartProductTexualData: {
    marginLeft: 14,
    height: 160,
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

const mapStateToProps = (state) => {
  return {
    cartTotal: state.cartTotal,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeTotalCartAmount: (total_cart_amount) => {
      dispatch({type: 'CHANGE_TOTAL_CART_AMOUNT', payload: total_cart_amount});
    },
    changeCartTotalCount: (cartTotal) => {
      dispatch({type: 'CHANGE_CART_TOTAL', payload: cartTotal});
    },

    resetCartReduxVariables: (payload) => {
      dispatch({
        type: 'RESET_CART_REDUX_VARIABLES',
        payload,
      });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ShoppingCartProducts);
