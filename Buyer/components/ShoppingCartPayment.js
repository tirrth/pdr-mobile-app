import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  SafeAreaView,
  StatusBar,
  Pressable,
} from 'react-native';
import {Header} from 'react-native-elements';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Button, Appbar} from 'react-native-paper';
import RadioButton from 'react-native-radio-button';
import {getDeviceId} from 'react-native-device-info';
import {connect} from 'react-redux';
import {Alert} from 'react-native';
import {ToastAndroid} from 'react-native';

const deviceId = getDeviceId();

class ShoppingCartPayment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isiPhone12: false,
      // totalCartAmount: 0.0,
      // priceAfterShipping: 0.0,
    };
  }

  componentDidMount() {
    const {
      promo_code_discount,
      promo_code_applied,
      changeGrandTotalAmount,
      grand_total_amount,
      order_total_amount,
    } = this.props;

    if (promo_code_applied && promo_code_discount) {
      const maximum_savings = (
        (parseFloat(order_total_amount) * parseFloat(promo_code_discount)) /
        100
      ).toFixed(2);
      const grand_total = (
        parseFloat(order_total_amount) - maximum_savings
      ).toFixed(2);

      changeGrandTotalAmount(grand_total);
    } else {
      changeGrandTotalAmount(order_total_amount);
    }

    if (grand_total_amount == 'NaN') {
      this._toastMessage('Something is wrong. Please checkout order again!');
      this.props.navigation.reset({routes: [{name: 'AddToCartRoot'}]});
    }

    // const {
    //   total_amount_from_cart,
    //   price_after_shipping,
    // } = this.props.route?.params;
    // this.setState({
    //   totalCartAmount: this.props.total_cart_amount,
    //   priceAfterShipping: this.props.grand_total_amount,
    // });
    if (deviceId === 'iPhone13,4') {
      {
        this.setState({isiPhone12: true});
      }
    }
  }

  _toastMessage = (message) => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  _searchBarToggle = () => {
    const {navigate} = this.props.navigation;
    navigate('Home');
  };

  _onRemoveCouponPress = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to remove coupon discount?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const {
                changePromoCodeApplied,
                changePromoCodeDiscount,
                order_total_amount,
                changeGrandTotalAmount,
              } = this.props;
              changePromoCodeApplied('');
              changePromoCodeDiscount(0.0);
              changeGrandTotalAmount(order_total_amount);
            } catch (err) {
              console.log(err);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  render() {
    const {navigate} = this.props.navigation;
    // const {
    //   couponDiscountPercentage,
    //   couponCode,
    //   totalPayableAmount,
    //   couponDiscount,
    // } = this.props.route?.params;
    return (
      <View style={{height: '100%'}}>
        <StatusBar
          barStyle={
            Platform.OS === 'android' ? 'dark-content' : 'light-content'
          }
          backgroundColor="white"
        />
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
                text: 'Shopping Payment',
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
                text: 'Shopping Payment',
                style: {
                  color: '#fff',
                  textTransform: 'capitalize',
                  letterSpacing: 0.8,
                  fontSize: 15,
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <View style={{...styles.shoppingCartTotalCountFooter}}>
              <View
                style={{flexDirection: 'row', marginTop: 5, marginBottom: 5}}>
                <Text style={{textTransform: 'uppercase', fontWeight: '700'}}>
                  Payment Options
                </Text>
              </View>
              {/* <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:10, }}>
                                <Text style={{color:'#8d8d8d', textTransform:'uppercase', fontSize:12}}>Pay On Delivery (Cash/Card/UPI)</Text>
                                <View style={{marginRight:10}}>
                                    <RadioButton
                                        animation={'bounceIn'}
                                        isSelected={false}
                                        onPress={() => doSomething('hello')}
                                        size={10}
                                        innerColor={'purple'}
                                        outerColor={'purple'}
                                        />
                                </View>
                            </View>
                            <View style={styles.horizontalSeparator} />
                            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:10, }}>
                                <Text style={{color:'#8d8d8d', textTransform:'uppercase', fontSize:12}}>Credit/Debit Card</Text>
                                <View style={{marginRight:10}}>
                                    <RadioButton
                                        animation={'bounceIn'}
                                        isSelected={true}
                                        onPress={() => doSomething('hello')}
                                        size={10}
                                        innerColor={'purple'}
                                        outerColor={'purple'}
                                        />
                                </View>
                            </View>
                            <View style={styles.horizontalSeparator} />
                            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:10}}>
                                <Text style={{color:'#8d8d8d', textTransform:'uppercase', fontSize:12}}>Net Banking</Text>
                                <View style={{marginRight:10}}>
                                    <RadioButton
                                        animation={'bounceIn'}
                                        isSelected={false}
                                        onPress={() => doSomething('hello')}
                                        size={10}
                                        innerColor={'purple'}
                                        outerColor={'purple'}
                                        />
                                </View>
                            </View> */}
              {/* <View style={styles.horizontalSeparator} />  */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Text
                  style={{
                    color: '#8d8d8d',
                    textTransform: 'uppercase',
                    fontSize: 12,
                  }}>
                  PayPal
                </Text>
                <View style={{marginRight: 10}}>
                  <RadioButton
                    isSelected={true}
                    size={10}
                    innerColor={'purple'}
                    outerColor={'purple'}
                  />
                </View>
              </View>
            </View>
          </View>
          {/* <View>      
                        <View style={{...styles.shoppingCartTotalCountFooter}}>
                            <View style={{flexDirection:'row',}}>
                                <Text style={{textTransform:'uppercase'}}>Price Details</Text><Text style={{marginLeft:4}}>(2 Items)</Text>
                            </View>
                            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:10, }}>
                                <Text style={{color:'#8d8d8d'}}>Order Total</Text>
                                <Text>$30.06</Text>
                            </View>
                            <View style={styles.horizontalSeparator} />
                            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:10}}>
                                <Text style={{textTransform:'uppercase', fontWeight:'700'}}>Total</Text>
                                <Text>$30.06</Text>
                            </View>
                        </View>
                    </View> */}

          <View style={{marginTop: 10, marginBottom: 100}}>
            {/* <View style={{width:'100%', borderWidth:0.4, borderColor:'#dddddd', }}></View> */}

            <View
              style={{backgroundColor: 'white', padding: 14, marginTop: 10}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 5,
                }}>
                <Text
                  style={{
                    textTransform: 'uppercase',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                  Price Details
                </Text>
                <Text style={{marginLeft: 5, fontSize: 16, fontWeight: '700'}}>
                  ({this.props.cartTotal.length} Item)
                </Text>
              </View>
              <View style={{paddingLeft: 5, paddingRight: 5}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignContent: 'center',
                    padding: 5,
                    marginTop: 2,
                    marginBottom: 2,
                  }}>
                  <Text>Cart Total</Text>
                  <Text style={{color: '#8d8d8d'}}>
                    ${this.props.total_cart_amount}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignContent: 'center',
                    padding: 5,
                    marginTop: 2,
                    marginBottom: 2,
                  }}>
                  <Text>Shipping Charge</Text>
                  <Text style={{color: '#8d8d8d'}}>
                    ${this.props.total_shipping_charge}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignContent: 'center',
                    padding: 5,
                    marginTop: 2,
                    marginBottom: 2,
                  }}>
                  <Text>Coupon Discount</Text>
                  <Pressable
                    onPress={() =>
                      !this.props.promo_code_applied
                        ? navigate('Coupons')
                        : null
                    }>
                    <Text
                      style={{
                        color: 'purple',
                      }}>
                      {this.props.promo_code_applied
                        ? `-${this.props.promo_code_discount}%`
                        : 'Apply Coupon'}
                    </Text>
                  </Pressable>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignContent: 'center',
                    padding: 5,
                    marginTop: 2,
                    marginBottom: 2,
                  }}>
                  <Text>Order Total</Text>
                  <Text style={{fontWeight: '700', color: '#777777'}}>
                    ${this.props.order_total_amount}
                  </Text>
                </View>
                <View
                  style={{
                    width: '100%',
                    borderTopWidth: 0.6,
                    borderTopColor: '#dddddd',
                    marginTop: 5,
                    marginBottom: 5,
                  }}></View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignContent: 'center',
                    padding: 5,
                    marginTop: 2,
                    marginBottom: 2,
                  }}>
                  <Text style={{textTransform: 'uppercase', fontWeight: '700'}}>
                    Total
                  </Text>
                  <Text style={{fontWeight: '700'}}>
                    ${this.props.grand_total_amount}
                  </Text>
                </View>
              </View>
              <Button
                style={{marginTop: 10, marginLeft: 10, marginRight: 10}}
                mode="contained"
                icon="pencil"
                onPress={() => this.props.navigation.navigate('Coupons')}>
                {this.props.promo_code_applied ? 'Change' : 'Apply'} Coupon
              </Button>
              {this.props.promo_code_applied ? (
                <Button
                  style={{marginTop: 10, marginLeft: 10, marginRight: 10}}
                  mode="outlined"
                  color="#DB4437"
                  icon="tag"
                  onPress={() => this._onRemoveCouponPress()}>
                  Remove Coupon
                </Button>
              ) : null}
            </View>
          </View>
        </ScrollView>

        <View style={{...styles.shoppingCartPaymentFooter}}>
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
              <Text style={{color: '#000000', fontWeight: '700', fontSize: 16}}>
                ${this.props.grand_total_amount}
              </Text>
              <Text
                style={{
                  color: '#8d8d8d',
                  textTransform: 'uppercase',
                  color: 'purple',
                  fontSize: 10,
                }}>
                {/* View Details */}
                Total Amount
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => {
                const {grand_total_amount} = this.props;
                if (
                  parseFloat(grand_total_amount) &&
                  grand_total_amount != 'NaN'
                ) {
                  this.props.navigation.navigate('PaypalPaymentGateway');
                } else {
                  this._toastMessage(
                    'Something is wrong. Please checkout order again!',
                  );
                  this.props.navigation.reset({
                    routes: [{name: 'AddToCartRoot'}],
                  });
                }
              }}
              style={{marginRight: 5}}>
              Continue
            </Button>
          </SafeAreaView>
        </View>
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
    paddingBottom: 20,
  },
  horizontalSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#eeeeee',
    marginTop: 10,
  },

  shoppingCartPaymentFooter: {
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
    grand_total_amount: state.grand_total_amount,
    promo_code_applied: state.promo_code_applied,
    promo_code_discount: state.promo_code_discount,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changePromoCodeApplied: (promo_code_applied) => {
      dispatch({
        type: 'CHANGE_PROMO_CODE_APPLIED',
        payload: promo_code_applied,
      });
    },
    changePromoCodeDiscount: (promo_code_discount) => {
      dispatch({
        type: 'CHANGE_PROMO_CODE_DISCOUNT',
        payload: promo_code_discount,
      });
    },
    changeGrandTotalAmount: (grand_total_amount) => {
      dispatch({
        type: 'CHANGE_GRAND_TOTAL_AMOUNT',
        payload: grand_total_amount,
      });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ShoppingCartPayment);
