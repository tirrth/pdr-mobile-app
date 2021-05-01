import React, {Component} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import {Header} from 'react-native-elements';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Checkbox, TextInput, Button, Appbar, Card} from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_SAVE_SHIPPING_ADDRESS_KEY,
  API_FETCH_COUNTRIES_KEY,
  API_FETCH_CITIES_KEY,
  API_FETCH_STATES_KEY,
  API_SAVE_BILLING_ADDRESS_KEY,
} from '@env';
import RNPicker from './rn-modal-picker';
import {ToastAndroid} from 'react-native';

export default class AddNewAddress extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checkboxToggle: false,
      addressOne: '',
      addressTwo: '',
      landmark: '',
      locality: '',
      pincode: 0,
      phone: 0,
      name: '',
      countryCode: 0,
      stateCode: 0,
      cityCode: 0,
      isButtonLoading: false,
      countries: [],
      states: [],
      cities: [],
      selectedCountry: {},
      selectedState: {},
      selectedCity: {},
      isLoading: true,
    };
  }

  componentDidMount() {
    axios
      .get(API_FETCH_COUNTRIES_KEY)
      .then(async (response) => {
        // console.log(response.data.countries);
        this.setState({countries: response.data.countries});
        await this._handlerCountryCodeInput(response.data.countries[0]);
        await this._handlerStateCodeInput(this.state.states[0]);
        this.setState({isLoading: false});
      })
      .catch((err) => {
        console.log(err);
        this.setState({isLoading: false});
        alert(err);
      });
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

  _checkboxToggle = () => {
    this.setState({checkboxToggle: !this.state.checkboxToggle});
  };

  _handlerNameInput = (input_value) => {
    this.setState({name: input_value});
  };

  _handlerPhoneInput = (input_value) => {
    this.setState({phone: input_value});
  };

  _handlerAddressOneInput = (input_value) => {
    this.setState({addressOne: input_value});
  };

  _handlerAddressTwoInput = (input_value) => {
    this.setState({addressTwo: input_value});
  };

  _handlerLandmarkInput = (input_value) => {
    this.setState({landmark: input_value});
  };

  _handlerLocalityInput = (input_value) => {
    this.setState({locality: input_value});
  };

  _handlerPincodeInput = (input_value) => {
    this.setState({pincode: input_value});
  };

  _handlerCountryCodeInput = async (country_data) => {
    this.setState({selectedCountry: country_data});
    await axios
      .get(API_FETCH_STATES_KEY, {
        params: {
          country_id: country_data.id,
        },
      })
      .then((response) => {
        // console.log(response.data.states);
        if (response.data.states.length) {
          this.setState({
            states: response.data.states,
            selectedState: response.data.states[0],
            isLoading: false,
          });
        } else {
          this.setState({states: [], cities: []});
          this.setState({
            selectedState: {name: '', id: null},
            selectedCity: {name: '', id: null},
          });
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  _handlerStateCodeInput = async (state_data) => {
    this.setState({selectedState: state_data});
    await axios
      .get(API_FETCH_CITIES_KEY, {
        params: {
          state_id: state_data.id,
        },
      })
      .then((response) => {
        // console.log(response.data.city);
        if (response.data.city.length) {
          this.setState({
            cities: response.data.city,
            selectedCity: response.data.city[0],
            isLoading: false,
          });
        } else {
          this.setState({cities: []});
          this.setState({selectedCity: {name: '', id: null}});
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  _handlerCityCodeInput = (city_data) => {
    this.setState({selectedCity: city_data});
  };

  _onSubmit = async () => {
    const {
      addressOne,
      addressTwo,
      name,
      phone,
      locality,
      landmark,
      selectedState,
      selectedCountry,
      pincode,
      selectedCity,
      checkboxToggle,
    } = this.state;
    if (
      addressOne === '' ||
      addressTwo === '' ||
      name === '' ||
      phone === 0 ||
      locality === '' ||
      landmark === '' ||
      selectedState.id === null ||
      selectedCountry.id === null ||
      pincode === 0 ||
      selectedCity.id === null
    ) {
      this._toastMessage('All the fileds are required!!');
    } else {
      this.setState({isButtonLoading: true});
      const addressData = {
        address_line_one: addressOne,
        street_address: addressTwo,
        locality: locality,
        landmark: landmark,
        city_id: selectedCity.id,
        pincode: pincode,
        state_id: selectedState.id,
        country_id: selectedCountry.id,
        receiver_name: name,
        receiver_phone: phone,
        is_default: checkboxToggle ? 1 : 0,
      };
      const token = await AsyncStorage.getItem('token');
      const {is_billing_address} = this.props.route?.params;
      let url = '';
      if (!is_billing_address) {
        url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_SAVE_SHIPPING_ADDRESS_KEY;
      } else {
        url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_SAVE_BILLING_ADDRESS_KEY;
      }

      axios
        .post(url, addressData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          // console.log("rererrereeerer", response);
          this.setState({isButtonLoading: false});
          this._toastMessage(response.data.message);

          const {redirect_to_cart} = this.props.route?.params;
          if (redirect_to_cart) {
            // this.props.navigation.push('AddToCartRoot');
            this.props.navigation.reset({routes: [{name: 'AddToCartRoot'}]});
          } else {
            this.props.navigation.push('SelectAddress');
          }
          // this.props.navigation.push('SelectAddress');
          // this.props.navigation.reset({routes: [{ name: 'SelectAddress' }]});
        })
        .catch((err) => {
          this.setState({isButtonLoading: false});
          console.log({...err});
          alert(err);
        });
    }
  };

  render() {
    const {navigate} = this.props.navigation;
    const {is_billing_address} = this.props.route?.params;
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
            text: `Add New ${
              !is_billing_address ? 'Shipping' : 'Billing'
            } Address`,
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
          // containerStyle={{borderBottomLeftRadius:8, borderBottomRightRadius:8}}
        />
        {!this.state.isLoading ? (
          <>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{...styles.inputsGroup, marginBottom: 0}}>
                <Text style={styles.inputsGroupHeader}>Contact Details</Text>
                <View>
                  <View style={{...styles.textInput}}>
                    <TextInput
                      style={{backgroundColor: 'white'}}
                      mode="outlined"
                      placeholder=" Name"
                      onChangeText={(name) => {
                        this._handlerNameInput(name);
                      }}
                      dense
                    />
                  </View>
                  <View style={styles.textInput}>
                    <TextInput
                      style={{backgroundColor: 'white'}}
                      mode="outlined"
                      placeholder=" Mobile Number"
                      keyboardType={'phone-pad'}
                      maxLength={13}
                      onChangeText={(phone) => {
                        this._handlerPhoneInput(phone);
                      }}
                      dense
                    />
                  </View>
                </View>
              </View>
              <View style={{...styles.inputsGroup}}>
                <Text style={styles.inputsGroupHeader}>Address</Text>
                <View>
                  <View style={styles.textInput}>
                    <TextInput
                      style={{backgroundColor: 'white'}}
                      mode="outlined"
                      placeholder=" Address-1 (House No)"
                      onChangeText={(address_one) => {
                        this._handlerAddressOneInput(address_one);
                      }}
                      dense
                    />
                  </View>
                  <View style={styles.textInput}>
                    <TextInput
                      style={{backgroundColor: 'white'}}
                      mode="outlined"
                      placeholder=" Address-2 (Street Address)"
                      onChangeText={(address_two) => {
                        this._handlerAddressTwoInput(address_two);
                      }}
                      dense
                    />
                  </View>
                  <View style={styles.textInput}>
                    <TextInput
                      style={{backgroundColor: 'white'}}
                      mode="outlined"
                      placeholder=" Locality / Town"
                      onChangeText={(locality) => {
                        this._handlerLocalityInput(locality);
                      }}
                      dense
                    />
                  </View>
                  <View style={styles.textInput}>
                    <TextInput
                      style={{backgroundColor: 'white'}}
                      mode="outlined"
                      placeholder=" Landmark"
                      onChangeText={(landmark) => {
                        this._handlerLandmarkInput(landmark);
                      }}
                      dense
                    />
                  </View>
                  <View style={styles.textInput}>
                    <TextInput
                      style={{backgroundColor: 'white'}}
                      mode="outlined"
                      placeholder=" Pincode"
                      autoCapitalize="none"
                      keyboardType={'phone-pad'}
                      onChangeText={(pincode) => {
                        this._handlerPincodeInput(pincode);
                      }}
                      dense
                    />
                  </View>
                  <View
                    style={{
                      ...styles.textInput,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 14,
                    }}>
                    <View style={{width: '48%', height: 44}}>
                      <RNPicker
                        dataSource={this.state.countries}
                        dummyDataSource={this.state.countries}
                        // defaultValue={this.state.selectedCountry.name}
                        pickerTitle={'Select Country'}
                        showSearchBar={true}
                        disablePicker={false}
                        placeHolderLabel={this.state.selectedCountry.name}
                        placeHolderTextStyle={{
                          color: '#000',
                          padding: 10,
                          textAlign: 'left',
                          width: '99%',
                          flexDirection: 'row',
                        }}
                        selectedLabel={this.state.selectedCountry.name}
                        changeAnimation={'none'}
                        searchBarPlaceHolder={'Search.....'}
                        showPickerTitle={true}
                        pickerStyle={styles.pickerStyle}
                        selectedValue={(index, item) =>
                          this._handlerCountryCodeInput(item)
                        }
                      />
                    </View>
                    <View style={{width: '48%', height: 44}}>
                      <RNPicker
                        dataSource={this.state.states}
                        dummyDataSource={this.state.states}
                        // defaultValue={this.state.selectedState.name}
                        pickerTitle={'Select State'}
                        showSearchBar={true}
                        disablePicker={false}
                        placeHolderLabel={this.state.selectedState.name}
                        placeHolderTextStyle={{
                          color: '#000',
                          padding: 10,
                          textAlign: 'left',
                          width: '99%',
                          flexDirection: 'row',
                        }}
                        selectedLabel={this.state.selectedState.name}
                        changeAnimation={'none'}
                        searchBarPlaceHolder={'Search.....'}
                        showPickerTitle={true}
                        pickerStyle={styles.pickerStyle}
                        selectedValue={(index, item) =>
                          this._handlerStateCodeInput(item)
                        }
                      />
                    </View>
                  </View>
                  <View style={{width: '100%', height: 44, marginTop: 14}}>
                    <RNPicker
                      dataSource={this.state.cities}
                      dummyDataSource={this.state.cities}
                      // defaultValue={this.state.selectedCity.name}
                      pickerTitle={'Select City'}
                      showSearchBar={true}
                      disablePicker={false}
                      placeHolderLabel={this.state.selectedCity.name}
                      placeHolderTextStyle={{
                        color: '#000',
                        padding: 10,
                        textAlign: 'left',
                        width: '99%',
                        flexDirection: 'row',
                      }}
                      selectedLabel={this.state.selectedCity.name}
                      changeAnimation={'none'}
                      searchBarPlaceHolder={'Search.....'}
                      showPickerTitle={true}
                      pickerStyle={styles.pickerStyle}
                      selectedValue={(index, item) =>
                        this._handlerCityCodeInput(item)
                      }
                    />
                  </View>
                </View>
              </View>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={this.state.checkboxToggle ? 'checked' : 'unchecked'}
                  onPress={() => this._checkboxToggle()}
                  color="#468bf5"
                />
                <Text
                  onPress={() => this._checkboxToggle()}
                  style={{marginLeft: 4}}>
                  {'Make this my deafult Address'}
                </Text>
              </View>
            </ScrollView>
            <Card
              elevation={20}
              style={{
                borderRadius: 0,
                position: 'absolute',
                bottom: 0,
                width: '100%',
                backgroundColor: 'white',
                padding: 10,
              }}>
              <Button
                mode="contained"
                loading={this.state.isButtonLoading ? true : false}
                color="#6B23AE"
                textTransform={'uppercase'}
                onPress={() => this._onSubmit()}>
                {!this.state.isButtonLoading
                  ? `Add ${
                      !is_billing_address ? 'Shipping' : 'Billing'
                    } Address`
                  : null}
              </Button>
            </Card>
          </>
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

  inputsGroupHeader: {
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputsGroup: {
    margin: 10,
    elevation: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
  },
  textInput: {
    marginTop: 8,
  },

  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 100,
    alignItems: 'center',
    paddingLeft: 10,
  },

  pickerStyle: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#8d8d8d',
    borderRadius: 4,
    justifyContent: 'space-around',
  },
});
