import React from 'react';
import {
  View,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  BackHandler,
  Alert,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {
  API_PAYPAL_OAUTH2_TOKEN_KEY,
  API_PAYPAL_CHECKOUT_ORDERS_KEY,
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_CREATE_ORDER_KEY,
  PAYPAL_USERNAME,
  PAYPAL_PASSWORD,
  API_FETCH_SINGLE_SHIPPING_ADDRESS,
  API_SAVE_BILLING_ADDRESS_KEY,
  API_DELETE_BILLING_ADDRESS_KEY,
} from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Buffer} from 'buffer';
import {connect} from 'react-redux';
import LottieView from 'lottie-react-native';
const queryString = require('querystring');

class PaypalPaymentGateway extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: null,
      approvalUrl: null,
      paymentId: null,
      orderStatus: null,
      isPaypalProcessingLoader: false,
    };
  }

  backAction = () => {
    Alert.alert('Hold on!', 'Are you sure you want to go back?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: 'YES',
        onPress: () => this.props.navigation.reset({routes: [{name: 'Home'}]}),
      },
    ]);
    return true;
  };

  _onErrorOccurred = () => {
    Alert.alert(
      'Alert',
      'Something is wrong! Try again later.',
      [
        {
          text: 'Okay',
          onPress: () =>
            this.props.navigation.reset({routes: [{name: 'Home'}]}),
        },
      ],
      {cancelable: false},
    );
    return true;
  };

  _saveBillingAddressAsShippingAddress = async () => {
    const {selectedShippingAddressUUID} = this.props;
    const token = await AsyncStorage.getItem('token');

    const selectedShippingAddressData = await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_FETCH_SINGLE_SHIPPING_ADDRESS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          uuid: selectedShippingAddressUUID,
        },
      })
      .then((res) => {
        return res.data.shipping_address[0];
      })
      .catch((err) => {
        throw err;
      });

    const addressData = {
      address_line_one: selectedShippingAddressData.address_line_one,
      street_address: selectedShippingAddressData.street_address,
      locality: selectedShippingAddressData.locality,
      landmark: selectedShippingAddressData.landmark,
      city_id: selectedShippingAddressData.city_id,
      pincode: selectedShippingAddressData.pincode,
      state_id: selectedShippingAddressData.state_id,
      country_id: selectedShippingAddressData.country_id,
      receiver_name: selectedShippingAddressData.receiver_name,
      receiver_phone: selectedShippingAddressData.receiver_phone,
      is_default: 0,
    };
    const response = await axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_SAVE_BILLING_ADDRESS_KEY,
        addressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then(function (response) {
        return response;
      })
      .catch((err) => {
        throw err;
      });

    return response;
  };

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );

    this.props.navigation.addListener('beforeRemove', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    });

    if (this.props.grand_total_amount == 0) {
      this._onErrorOccurred();
    }

    const dataDetail = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'AUD',
            value: `${this.props.grand_total_amount}`,
          },
        },
      ],
      application_context: {
        return_url: 'http://technotery.com',
        cancel_url: 'http://technotery.com',
      },
    };

    // const username =
    //   'AVDlWYGeKmebRoeBiXX7Vii9_2rmS5uSZGzr20L_XMLYfs9h-lR7Rrve13XxsLo4e4wZA0sSPNeVMuhC';
    // const password =
    //   'EMoLDJ8RlFwG48JPp_RFe07SnTGq0f0Fh3C9vntrYiuu28h-sE0TNWIhQyNcMj22A417KCuMlyHRvV57';
    const token = Buffer.from(
      `${PAYPAL_USERNAME}:${PAYPAL_PASSWORD}`,
      'utf8',
    ).toString('base64');

    const data = {
      grant_type: 'client_credentials',
    };

    axios
      .post(API_PAYPAL_OAUTH2_TOKEN_KEY, queryString.stringify(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${token}`,
        },
      })
      .then((res) => {
        this.setState({
          accessToken: res.data.access_token,
        });

        axios
          .post(API_PAYPAL_CHECKOUT_ORDERS_KEY, dataDetail, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.state.accessToken}`,
            },
          })
          .then((response) => {
            const {id} = response.data;
            const approvalUrl = response.data.links.filter((data) => {
              return data.rel === 'approve';
            })[0].href;
            this.setState({
              paymentId: id,
              approvalUrl: approvalUrl,
            });
          })
          .catch((err) => {
            // alert(err);
            console.log({...err});
            this._onErrorOccurred();
          });
      })
      .catch((error) => {
        // alert(error);
        console.error({...error});
        this._onErrorOccurred();
      });
  }

  _onRemoveBillingAddressAsShippingAddress = async () => {
    const userToken = await AsyncStorage.getItem('token');

    await axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_DELETE_BILLING_ADDRESS_KEY,
        {
          uuid: this.props.selectedBillingAddressUUID,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      )
      .then((response) => null)
      .catch((err) => null);
    return true;
  };

  _onNavigationStateChange = async (webViewState) => {
    if (webViewState.url.includes('http://www.technotery.com')) {
      this.setState({approvalUrl: null, isPaypalProcessingLoader: true});

      const {is_billing_address_same_as_shipping_address} = this.props;
      if (is_billing_address_same_as_shipping_address) {
        await this._saveBillingAddressAsShippingAddress()
          .then((res) => {
            this.props.changeBillingAddressUUID(res.data.billing_address);
          })
          .catch((err) => {
            console.log(err);
            this._onErrorOccurred();
          });
      }

      let url = webViewState.url;
      let regex = /[?&]([^=#]+)=([^&#]*)/g,
        params = {},
        match;
      while ((match = regex.exec(url))) {
        params[match[1]] = match[2];
      }
      const {token, PayerID} = params;
      const payerData = {
        payer_id: PayerID,
      };

      axios
        .post(`${API_PAYPAL_CHECKOUT_ORDERS_KEY}/${token}/capture`, payerData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.state.accessToken}`,
            Prefer: 'return=representation',
          },
        })
        .then(async (response) => {
          console.log('final payment data = ', response.data);

          const userToken = await AsyncStorage.getItem('token');
          // const orderStatus = response.data.status;
          var order_create_time = response.data.create_time;
          var order_update_time = response.data.update_time;

          order_create_time = order_create_time.replace('T', ' ');
          order_create_time = order_create_time.replace('Z', '');
          order_update_time = order_update_time.replace('T', ' ');
          order_update_time = order_update_time.replace('Z', '');

          const data = {
            payment_gateway_token: response.data.id,
            payment_gateway_payment_status: response.data.status,
            payment_gateway_merchant_id:
              response.data.purchase_units[0].payee.merchant_id,
            payment_gateway_payer_id: response.data.payer.payer_id,
            payment_gateway_payer_email_address:
              response.data.payer.email_address,
            payment_gateway_merchant_transaction_id:
              response.data.purchase_units[0].payments.captures[0].id,
            payment_gateway_gross_amount:
              response.data.purchase_units[0].payments.captures[0]
                .seller_receivable_breakdown.gross_amount.value,
            payment_gateway_fees:
              response.data.purchase_units[0].payments.captures[0]
                .seller_receivable_breakdown.paypal_fee.value,
            payment_gateway_net_amount:
              response.data.purchase_units[0].payments.captures[0]
                .seller_receivable_breakdown.net_amount.value,
            payment_gateway_refund_url:
              response.data.purchase_units[0].payments.captures[0].links[1]
                .href,
            payment_gateway_order_details_url:
              response.data.purchase_units[0].payments.captures[0].links[2]
                .href,
            payment_gateway_order_create_time: order_create_time,
            payment_gateway_order_update_time: order_update_time,
            payment_gateway_payer_country_code:
              response.data.purchase_units[0].payments.captures[0].amount
                .currency_code,
            order_status: 1,
            shipping_address: this.props.selectedShippingAddressUUID,
            billing_address: this.props.selectedBillingAddressUUID,
            promo_code_applied: this.props.promo_code_applied || '',
          };

          axios
            .post(UNIVERSAL_ENTRY_POINT_ADDRESS + API_CREATE_ORDER_KEY, data, {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            })
            .then(async (response) => {
              console.log(response);
              if (is_billing_address_same_as_shipping_address) {
                // await this._onRemoveBillingAddressAsShippingAddress();
              }
              this._onSuccessfulOrder();
            })
            .catch(async (err) => {
              console.log({...err});
              if (is_billing_address_same_as_shipping_address) {
                // await this._onRemoveBillingAddressAsShippingAddress();
              }
              this.setState({orderStatus: 'Failed'});
            });
        })
        .catch(async (err) => {
          console.log({...err});
          if (is_billing_address_same_as_shipping_address) {
            // await this._onRemoveBillingAddressAsShippingAddress();
          }
          this.setState({orderStatus: 'Failed'});
        });
    }
  };

  _onSuccessfulOrder = () => {
    this.setState({orderStatus: 'COMPLETED'});
    this.props.resetCartReduxVariables();
    setTimeout(() => {
      this.props.navigation.reset({routes: [{name: 'HomeRoot'}]});
    }, 2000);
  };

  componentWillUnmount() {
    this.removeBackHandler = BackHandler.removeEventListener(
      'hardwareBackPress',
    );
  }

  render() {
    const {approvalUrl, orderStatus, isPaypalProcessingLoader} = this.state;

    return (
      <>
        <StatusBar barStyle={'dark-content'} backgroundColor="white" />
        <SafeAreaView
          style={{
            flex: 1,
            alignItems: orderStatus ? 'center' : null,
            justifyContent: orderStatus ? 'center' : null,
          }}>
          {!orderStatus ? (
            approvalUrl ? (
              <WebView
                source={{uri: approvalUrl}}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                renderLoading={() => (
                  <View
                    style={{
                      height: '100%',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <LottieView
                      source={require('../../assets/paypal_started.json')}
                      autoPlay
                      loop
                    />
                  </View>
                )}
                startInLoadingState
                showsVerticalScrollIndicator={false}
                onNavigationStateChange={this._onNavigationStateChange}
                style={
                  Platform.OS === 'android'
                    ? {marginTop: StatusBar.currentHeight}
                    : null
                }
              />
            ) : (
              <View
                style={{
                  height: '100%',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {isPaypalProcessingLoader ? (
                  <LottieView
                    source={require('../../assets/paypal_processing.json')}
                    autoPlay
                    loop
                    style={{width: '80%'}}
                  />
                ) : (
                  <ActivityIndicator size="large" color="#4285F4" />
                )}
              </View>
            )
          ) : orderStatus === 'COMPLETED' ? (
            <LottieView
              source={require('../../assets/successful.json')}
              autoPlay
              loop
              style={{width: '60%'}}
            />
          ) : (
            <LottieView
              source={require('../../assets/unsuccessful.json')}
              autoPlay
              loop
              style={{width: '60%'}}
            />
          )}
        </SafeAreaView>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    selectedShippingAddressUUID: state.selectedShippingAddressUUID,
    selectedBillingAddressUUID: state.selectedBillingAddressUUID,
    is_billing_address_same_as_shipping_address:
      state.is_billing_address_same_as_shipping_address,
    grand_total_amount: state.grand_total_amount,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeBillingAddressUUID: (selectedBillingAddressUUID) => {
      dispatch({
        type: 'CHANGE_SELECTED_BILLING_ADDRESS_UUID',
        payload: selectedBillingAddressUUID,
      });
    },

    resetCartReduxVariables: () => {
      dispatch({
        type: 'RESET_CART_REDUX_VARIABLES',
        payload: null,
      });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PaypalPaymentGateway);
