import React, {Component} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {Header} from 'react-native-elements';
import {Appbar, Button} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {UNIVERSAL_ENTRY_POINT_ADDRESS, API_APPLY_PROMO_CODE} from '@env';
import {connect} from 'react-redux';

class Coupons extends Component {
  constructor(props) {
    super(props);

    this.state = {
      couponLoader: undefined,
      couponCode: undefined,
      maxSavings: undefined,
      couponMessage: undefined,
      totalPayableAmount: undefined,
      couponDiscountPercentage: undefined,
    };
  }

  async componentDidMount() {
    const {promo_code_applied, promo_code_discount} = this.props;
    if (promo_code_discount) {
      this._couponLoader(promo_code_applied);
    }
  }

  _searchBarToggle = () => {
    const {navigate} = this.props.navigation;
    navigate('Home');
  };

  // _couponLoader = () => {
  //     this.setState({ couponLoader: true });
  // }

  _onChangeText = (input_value) => {
    this.setState({couponCode: input_value});
  };

  _couponLoader = async (couponCode) => {
    if (couponCode) {
      this.setState({couponLoader: true});
      const token = await AsyncStorage.getItem('token');
      axios
        .post(
          UNIVERSAL_ENTRY_POINT_ADDRESS + API_APPLY_PROMO_CODE,
          {
            promo_code: couponCode,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((response) => {
          this.setState({
            couponCode: couponCode,
            maxSavings: parseFloat(response.data.offer_discount_amount).toFixed(
              2,
            ),
            couponMessage: response.data.message,
            totalPayableAmount: response.data.payable_amount,
            couponDiscountPercentage: response.data.offer_discount_percentage,
            couponLoader: false,
          });

          this.props.changePromoCodeApplied(couponCode);
          this.props.changePromoCodeDiscount(
            response.data.offer_discount_percentage,
          );
        })
        .catch((err) => {
          console.log({...err});
          this.setState({couponLoader: false});
          alert(err.response.data.message);
        });
    } else {
      alert('Please enter a coupon code!!');
    }
  };

  _onNavigateToPlaceOrder = () => {
    this.props.navigation.replace('ShoppingCartPayment');
    // const {
    //   couponDiscountPercentage,
    //   couponCode,
    //   totalPayableAmount,
    //   maxSavings,
    // } = this.state;
    // if (
    //   couponDiscountPercentage &&
    //   couponCode &&
    //   totalPayableAmount &&
    //   maxSavings
    // ) {

    // this.props.navigation.navigate('ShoppingCartPayment', {
    //   couponDiscountPercentage: couponDiscountPercentage,
    //   couponCode: couponCode,
    //   totalPayableAmount: totalPayableAmount,
    //   couponDiscount: maxSavings,
    // });
    // } else {
    //   this.props.navigation.replace('ShoppingCartPayment');
    // }
  };

  render() {
    const {navigate} = this.props.navigation;
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
            text: 'Coupons',
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
        />

        <View
          style={styles.addCouponCode}
          contentStyle={{
            width: '100%',
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          mode="outlined"
          color="#000000"
          onPress={() => push('AddNewAddress', {redirect_to_cart: false})}>
          <TextInput
            label="Text"
            style={{width: '75%', color: '#8d8d8d', marginLeft: 10}}
            onChangeText={(text) => this._onChangeText(text)}
            value={this.state.couponCode}
            onSubmitEditing={() => this._couponLoader(this.state.couponCode)}
            placeholder={'Enter Coupon Code'}
            placeholderTextColor="#8d8d8d"
          />
          {!this.state.couponLoader ? (
            <Text
              style={{
                color: 'purple',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                marginRight: 16,
              }}
              onPress={() => this._couponLoader(this.state.couponCode)}>
              Apply
            </Text>
          ) : (
            <ActivityIndicator
              size={22}
              style={{marginRight: 25}}
              color="purple"
            />
          )}
        </View>

        <View style={{...styles.availableCouponContainer, padding: 20}}>
          <Text
            style={{
              ...styles.availableCouponContainerEmptyMessage,
              textAlign: 'center',
            }}>
            {this.state.couponMessage
              ? this.state.couponMessage
              : 'No other coupons available'}
          </Text>
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            backgroundColor: 'white',
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View>
            <Text style={{fontSize: 12}}>Maximum Savings</Text>
            <Text style={{fontSize: 18, fontWeight: '700'}}>
              ${this.state.maxSavings ? this.state.maxSavings : 0}{' '}
              {this.state.couponDiscountPercentage ? (
                <Text style={{fontSize: 10, fontWeight: 'normal'}}>
                  (-{this.state.couponDiscountPercentage}%)
                </Text>
              ) : null}
            </Text>
          </View>
          <Button
            mode="contained"
            // color="#6B23AE"
            textTransform={'uppercase'}
            onPress={() => this._onNavigateToPlaceOrder()}>
            Place Order
          </Button>
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

  addCouponCode: {
    elevation: 1,
    backgroundColor: 'white',
    width: '95%',
    height: 45,
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 0,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  availableCouponContainerEmptyMessage: {
    color: '#8d8d8d',
    marginTop: 40,
    alignSelf: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    cartTotal: state.cartTotal,
    total_cart_amount: state.total_cart_amount,
    total_shipping_charge: state.total_shipping_charge,
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Coupons);
