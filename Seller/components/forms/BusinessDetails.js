import React, {Component} from 'react';
import {View, Text, StatusBar, Platform, Image, Pressable} from 'react-native';
import {Header} from 'react-native-elements';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {Appbar} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {Button, IconButton, TextInput} from 'react-native-paper';
// import Stepper from "react-native-stepper-ui";
import RNPicker from '../rn-modal-picker';
import Stepper from '../Stepper';
// import { Picker } from '@react-native-community/picker';
import axios from 'axios';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_FETCH_COUNTRIES_KEY,
  API_FETCH_CITIES_KEY,
  API_FETCH_STATES_KEY,
  API_SAVE_BUSINESS_INFO_KEY,
  API_SOCIAL_LOGIN_KEY,
} from '@env';
import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-date-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {Alert} from 'react-native';
import {ToastAndroid} from 'react-native';
import {BackHandler} from 'react-native';
import {StyleSheet} from 'react-native';
import {ActivityIndicator} from 'react-native';

class ContactDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: this.props.state.firstName,
      lastName: this.props.state.lastName,
      email: this.props.state.email,
      phone: this.props.state.phone,
      addressOne: this.props.state.addressOne,
      addressTwo: this.props.state.addressTwo,
      locality: this.props.state.locality,
      landmark: this.props.state.landmark,
      webLink: this.props.state.webLink,
      pincode: this.props.state.pincode,
      isEmailValid: true,
      isWebLinkValid: true,

      // countryCode: this.props.state.countryCode,
      // stateCode: this.props.state.stateCode,
      // cityCode: this.props.state.cityCode,
      countries: [],
      states: [],
      cities: [],

      selectedCountry: this.props.state.selectedCountry,
      selectedState: this.props.state.selectedState,
      selectedCity: this.props.state.selectedCity,
    };
  }

  async componentDidMount() {
    await axios
      .get(API_FETCH_COUNTRIES_KEY)
      .then(async (response) => {
        this.setState({countries: response.data.countries});
        if (!Object.keys(this.props.state.selectedCountry).length) {
          this.setState({selectedCountry: response.data.countries[0]});
        }

        await axios
          .get(API_FETCH_STATES_KEY, {
            params: {
              country_id: Object.keys(this.props.state.selectedCountry).length
                ? this.props.state.selectedCountry.id
                : response.data.countries[0].id,
            },
          })
          .then(async (res) => {
            this.setState({states: res.data.states});
            if (!Object.keys(this.props.state.selectedState).length) {
              this.setState({selectedState: res.data.states[0]});
            }

            await axios
              .get(API_FETCH_CITIES_KEY, {
                params: {
                  state_id: Object.keys(this.props.state.selectedState).length
                    ? this.props.state.selectedState.id
                    : res.data.states[0].id,
                },
              })
              .then((resp) => {
                this.setState({cities: resp.data.city});
                if (!Object.keys(this.props.state.selectedCity).length) {
                  this.setState({selectedCity: resp.data.city[0]});
                }
              })
              .catch((err) => {
                console.log(err);
                alert(err);
              });
          })
          .catch((err) => {
            console.log(err);
            alert(err);
          });
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  }

  // _handlerCountryCodeInput = (input_value) => {
  //     // console.log(input_value);
  //     axios
  //         .get(API_FETCH_STATES_KEY, {
  //             params:{
  //                 country_id: input_value
  //             }
  //         })
  //         .then(response => {
  //             this.setState({ states: response.data.states, isLoading: false });
  //         })
  //         .catch(err => {
  //             console.log(err);
  //             alert(err);
  //         })
  //     this.setState({ countryCode: input_value });
  // }

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
          this._handlerStateCodeInput(response.data.states[0]);
        } else {
          this.setState({states: [], cities: []});
          this.setState({selectedState: {}, selectedCity: {}});
          // this.setState({ selectedState: { name: "", id:null }, selectedCity: { name: "", id:null } })
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  // _handlerStateCodeInput = (input_value) => {
  //     // console.log(input_value);
  //     axios
  //         .get(API_FETCH_CITIES_KEY, {
  //             params:{
  //                 state_id: input_value
  //             }
  //         })
  //         .then(response => {
  //             this.setState({ cities: response.data.city, isLoading: false });
  //         })
  //         .catch(err => {
  //             console.log(err);
  //             alert(err);
  //         })
  //     this.setState({ stateCode: input_value });
  // }

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
          // this.setState({ selectedCity: { name: "", id:null } })
          this.setState({selectedCity: {}});
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

  _handlerFirstNameInput = (first_name) => {
    this.setState({firstName: first_name});
  };

  _handlerLastNameInput = (last_name) => {
    this.setState({lastName: last_name});
  };

  _handlerEmailInput = (email) => {
    this.setState({email: email});
  };

  _handlerPhoneInput = (phone) => {
    this.setState({phone: phone});
  };

  _handlerAddressOneInput = (address_one) => {
    this.setState({addressOne: address_one});
  };

  _handlerAddressTwoInput = (address_two) => {
    this.setState({addressTwo: address_two});
  };

  _handlerLocalityInput = (locality) => {
    this.setState({locality: locality});
  };

  _handlerLandmarkInput = (landmark) => {
    this.setState({landmark: landmark});
  };

  _handlerWebURLInput = (web_url) => {
    this.setState({webLink: web_url});
  };

  _handlerPincodeInput = (input) => {
    this.setState({pincode: input});
  };

  // _handlerValidEmail = (email) => {
  //     let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  //     if (!email || email.match(regexEmail)) {
  //         // console.log("valid");
  //         this.setState({ isEmailValid: true });
  //         this.phone.focus();
  //     } else {
  //         // console.log("in-valid");
  //         this.setState({ isEmailValid: false });
  //     }
  // }

  _handlerValidWebLink = (web_link) => {
    let regexWebLink = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
    if (!web_link || web_link.match(regexWebLink)) {
      this.setState({isWebLinkValid: true});
      // this.next.focus();
    } else {
      this.setState({isWebLinkValid: false});
    }
  };

  _onContactNextPress = () => {
    const {
      isWebLinkValid,
      pincode,
      webLink,
      firstName,
      lastName,
      email,
      phone,
      addressOne,
      addressTwo,
      locality,
      landmark,
      countryCode,
      stateCode,
      cityCode,
      selectedCountry,
      selectedState,
      selectedCity,
    } = this.state;
    const contactDetails = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      addressOne: addressOne,
      addressTwo: addressTwo,
      locality: locality,
      landmark: landmark,
      pincode: pincode,
      webLink: webLink,

      // countryCode: countryCode,
      // stateCode: stateCode,
      // cityCode: cityCode,

      selectedCountry: selectedCountry,
      selectedState: selectedState,
      selectedCity: selectedCity,
    };
    // if(!firstName || !pincode || !lastName || !email || !phone || !addressOne || !addressTwo || !locality || !landmark || !cityCode || !stateCode || !countryCode){
    if (
      !firstName ||
      !pincode ||
      !lastName ||
      !email ||
      !phone ||
      !addressOne ||
      !addressTwo ||
      !locality ||
      !landmark ||
      !Object.keys(selectedCountry).length ||
      !Object.keys(selectedState).length ||
      !Object.keys(selectedCity).length
    ) {
      alert('Please Enter all the fields properly!');
    } else if (!isWebLinkValid) {
      alert('Please Enter Valid Web URL!');
    } else {
      this.props.setStateContactDetails(contactDetails);
      this.props.setStateActiveComponent(this.props.activeComponent + 1);
      // axios.post(UNIVERSAL_ENTRY_POINT_ADDRESS + API_SOCIAL_LOGIN_KEY, {
      //     email: email,
      //     phone: phone,
      //     account_type: 1,
      //     first_name: firstName,
      //     last_name: lastName,
      //     provider: this.props.props.socialLoginProvider,
      //     gender: 1
      // })
      // .then(res => {
      //     // console.log(res);
      //     this.props.setStateContactDetails(contactDetails);
      //     this.props.setStateActiveComponent(this.props.activeComponent + 1);
      // })
      // .catch(err => {
      //     console.log({...err});
      //     alert(err.response.data.message);
      // })
    }
  };

  render() {
    return (
      <View style={{marginTop: 14, marginHorizontal: 14, alignItems: 'center'}}>
        <View style={{width: '100%'}}>
          <View style={{marginTop: 10}}>
            <TextInput
              disabled={this.props.state.email ? true : false}
              value={this.state.email}
              ref={(input) => {
                this.email = input;
              }}
              mode={this.props.state.email ? 'outlined' : 'flat'}
              style={
                this.props.state.email ? null : {backgroundColor: 'transparent'}
              }
              label={'Email*'}
              keyboardType="email-address"
              onChangeText={(email) => {
                this._handlerEmailInput(email);
              }}
              autoCapitalize="none"
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              disabled={this.props.state.phone ? true : false}
              value={this.state.phone}
              ref={(input) => {
                this.phone = input;
              }}
              // onSubmitEditing={() => this.addressOne.focus()}
              mode={this.props.state.phone ? 'outlined' : 'flat'}
              style={
                this.props.state.phone ? null : {backgroundColor: 'transparent'}
              }
              label="Phone Number*"
              keyboardType="number-pad"
              onChangeText={(phone) => {
                this._handlerPhoneInput(phone);
              }}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.firstName}
              mode="flat"
              label="First Name*"
              style={{backgroundColor: 'transparent'}}
              onChangeText={(name) => {
                this._handlerFirstNameInput(name);
              }}
              onSubmitEditing={() => this.lastName.focus()}
              autoFocus={true}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.lastName}
              ref={(input) => {
                this.lastName = input;
              }}
              onSubmitEditing={() => this.email.focus()}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Last Name*"
              onChangeText={(name) => {
                this._handlerLastNameInput(name);
              }}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.addressOne}
              ref={(input) => {
                this.addressOne = input;
              }}
              onSubmitEditing={() => this.addressTwo.focus()}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Address 1*"
              onChangeText={(address_one) => {
                this._handlerAddressOneInput(address_one);
              }}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.addressTwo}
              ref={(input) => {
                this.addressTwo = input;
              }}
              onSubmitEditing={() => this.locality.focus()}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Address 2*"
              onChangeText={(address_two) => {
                this._handlerAddressTwoInput(address_two);
              }}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.locality}
              ref={(input) => {
                this.locality = input;
              }}
              onSubmitEditing={() => this.landmark.focus()}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Locality*"
              onChangeText={(locality) => {
                this._handlerLocalityInput(locality);
              }}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.landmark}
              ref={(input) => {
                this.landmark = input;
              }}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              onSubmitEditing={() => this.pincode.focus()}
              label="Landmark*"
              onChangeText={(landmark) => {
                this._handlerLandmarkInput(landmark);
              }}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.pincode}
              ref={(input) => {
                this.pincode = input;
              }}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Pincode*"
              onChangeText={(landmark) => {
                this._handlerPincodeInput(landmark);
              }}
              keyboardType="numeric"
            />
          </View>
          {/* <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:14}}>
                        <View>
                            <Text>Country</Text>
                            <View style={{ width:'48%', height: 44, borderWidth:1, borderColor:'#8d8d8d', borderRadius: 4 }}>
                                <Picker
                                    selectedValue={this.state.countryCode}
                                    style={{ height: '100%', marginLeft:10}}
                                    onValueChange={(countryCode) => {this._handlerCountryCodeInput(countryCode)}}
                                    itemStyle={{paddingLeft:10}}
                                    >
                                    {this.state.countries.map((country, index) => {return(
                                        <Picker.Item key={index} label={country.name} value={country.id} />
                                    )})}
                                </Picker> 
                            </View>
                        </View>
                        <View>
                            <Text>State</Text>
                            <View style={{ width:'48%', height: 44, borderWidth:1, borderColor:'#8d8d8d', borderRadius: 4 }}>
                                <Picker
                                    selectedValue={this.state.stateCode}
                                    style={{ height: '100%', marginLeft:10}}
                                    onValueChange={(stateCode) => {this._handlerStateCodeInput(stateCode)}}
                                    itemStyle={{paddingLeft:10}}
                                >
                                    {this.state.states.map((state, index) => {return(
                                        <Picker.Item key={index} label={state.name} value={state.id} />
                                    )})}
                                </Picker> 
                            </View>
                        </View>
                    </View>
                    <View>
                        <Text>City</Text>
                        <View style={{ width:'100%', height: 44, borderWidth:1, borderColor:'#8d8d8d', borderRadius: 4, marginTop:14 }}>
                            <Picker
                                selectedValue={this.state.cityCode}
                                style={{ height:'100%', marginLeft:10 }}
                                onValueChange={(cityCode) => {this._handlerCityCodeInput(cityCode)}}
                                itemStyle={{paddingLeft:10}}
                            >
                                {this.state.cities.map((city, index) => {return(
                                    <Picker.Item key={index} label={city.name} value={city.id} />
                                )})}
                            </Picker> 
                        </View>
                    </View> */}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 14,
            }}>
            <View style={{width: '48%'}}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  marginLeft: 4,
                  marginBottom: 6,
                }}>
                Country
              </Text>
              <View style={{height: 44}}>
                <RNPicker
                  dataSource={this.state.countries}
                  dummyDataSource={this.state.countries}
                  pickerTitle={'Select Country'}
                  showSearchBar={true}
                  disablePicker={false}
                  placeHolderLabel={
                    this.state.selectedCountry.name || 'Select Country'
                  }
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
            </View>
            <View style={{width: '48%'}}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  marginLeft: 4,
                  marginBottom: 6,
                }}>
                State
              </Text>
              <View style={{height: 44}}>
                <RNPicker
                  dataSource={this.state.states}
                  dummyDataSource={this.state.states}
                  pickerTitle={'Select State'}
                  showSearchBar={true}
                  disablePicker={false}
                  placeHolderLabel={
                    this.state.selectedState.name || 'Select State'
                  }
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
          </View>
          <View style={{width: '100%', marginTop: 14}}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                marginLeft: 4,
                marginBottom: 6,
              }}>
              City
            </Text>
            <View style={{height: 44}}>
              <RNPicker
                dataSource={this.state.cities}
                dummyDataSource={this.state.cities}
                pickerTitle={'Select City'}
                showSearchBar={true}
                disablePicker={false}
                placeHolderLabel={this.state.selectedCity.name || 'Select City'}
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
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.webLink}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label={this.state.isWebLinkValid ? 'Web URL' : 'Invalid URL'}
              autoCapitalize="none"
              keyboardType="url"
              onEndEditing={(e) =>
                this._handlerValidWebLink(e.nativeEvent.text)
              }
              onChangeText={(web_url) => {
                this._handlerWebURLInput(web_url);
              }}
              error={!this.state.isWebLinkValid ? true : false}
            />
          </View>
        </View>
      </View>
    );
  }
}

class ShopDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatarSource: this.props.state.avatarSource,
      shopName: this.props.state.shopName,
      addressOne: this.props.state.addressOne,
      addressTwo: this.props.state.addressTwo,
      locality: this.props.state.locality,
      landmark: this.props.state.landmark,
      pincode: this.props.state.pincode,

      // countryCode: this.props.state.countryCode,
      // stateCode: this.props.state.stateCode,
      // cityCode: this.props.state.cityCode,
      countries: [],
      states: [],
      cities: [],

      selectedCountry: this.props.state.selectedCountry,
      selectedState: this.props.state.selectedState,
      selectedCity: this.props.state.selectedCity,
    };
  }

  async componentDidMount() {
    // axios
    //     .get(API_FETCH_COUNTRIES_KEY)
    //     .then(async response => {
    //         // console.log(response.data.countries);
    //         // this.setState({ countries: response.data.countries, isLoading: false });
    //         this.setState({ countries: response.data.countries });
    //         await this._handlerCountryCodeInput(response.data.countries[0]);
    //         await this._handlerStateCodeInput(this.state.states[0]);
    //         this.setState({ isLoading: false });
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         this.setState({ isLoading: false });
    //         alert(err);
    //     });

    await axios
      .get(API_FETCH_COUNTRIES_KEY)
      .then(async (response) => {
        this.setState({countries: response.data.countries});
        if (!Object.keys(this.props.state.selectedCountry).length) {
          this.setState({selectedCountry: response.data.countries[0]});
        }

        await axios
          .get(API_FETCH_STATES_KEY, {
            params: {
              country_id: Object.keys(this.props.state.selectedCountry).length
                ? this.props.state.selectedCountry.id
                : response.data.countries[0].id,
            },
          })
          .then(async (res) => {
            this.setState({states: res.data.states});
            if (!Object.keys(this.props.state.selectedState).length) {
              this.setState({selectedState: res.data.states[0]});
            }

            await axios
              .get(API_FETCH_CITIES_KEY, {
                params: {
                  state_id: Object.keys(this.props.state.selectedState).length
                    ? this.props.state.selectedState.id
                    : res.data.states[0].id,
                },
              })
              .then((resp) => {
                this.setState({cities: resp.data.city});
                if (!Object.keys(this.props.state.selectedCity).length) {
                  this.setState({selectedCity: resp.data.city[0]});
                }
              })
              .catch((err) => {
                console.log(err);
                alert(err);
              });
          })
          .catch((err) => {
            console.log(err);
            alert(err);
          });
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  }

  // _handlerCountryCodeInput = (input_value) => {
  //     // console.log(input_value);
  //     axios
  //         .get(API_FETCH_STATES_KEY, {
  //             params:{
  //                 country_id: input_value
  //             }
  //         })
  //         .then(response => {
  //             this.setState({ states: response.data.states, isLoading: false });
  //         })
  //         .catch(err => {
  //             console.log(err);
  //             alert(err);
  //         })
  //     this.setState({ countryCode: input_value });
  // }

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
          this._handlerStateCodeInput(response.data.states[0]);
        } else {
          this.setState({states: [], cities: []});
          this.setState({selectedState: {}, selectedCity: {}});
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  // _handlerStateCodeInput = (input_value) => {
  //     // console.log(input_value);
  //     axios
  //         .get(API_FETCH_CITIES_KEY, {
  //             params:{
  //                 state_id: input_value
  //             }
  //         })
  //         .then(response => {
  //             this.setState({ cities: response.data.city, isLoading: false });
  //         })
  //         .catch(err => {
  //             console.log(err);
  //             alert(err);
  //         })
  //     this.setState({ stateCode: input_value });
  // }

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
          this.setState({selectedCity: {}});
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  _handlerCityCodeInput = (city_data) => {
    // this.setState({ cityCode: input_value });
    this.setState({selectedCity: city_data});
  };

  _onImagePicker = () => {
    let imageValidSize = 5120; //In KB(5 MB);
    ImagePicker.openPicker({
      cropping: true,
      includeBase64: true,
      mediaType: 'photo',
    }).then((img_data) => {
      if (
        img_data.mime === 'image/jpeg' ||
        img_data.mime === 'image/jpg' ||
        img_data.mime === 'image/png' ||
        img_data.mime === 'image/bmp'
      ) {
        if (Math.ceil(img_data.size / 1024) <= imageValidSize) {
          // console.log(img_data);
          this.setState({
            avatarSource: {
              uri: `data:${img_data.mime};base64,` + img_data.data,
            },
          });
        } else {
          alert('Image size exceeds 5 MB!!');
        }
      } else {
        alert('Invalid Image Type. Only JPEG, PNG, JPG or BMP types allowed!!');
      }
    });
  };

  _handlerShopNameInput = (input) => {
    this.setState({shopName: input});
  };

  _handlerAddressOneInput = (input) => {
    this.setState({addressOne: input});
  };

  _handlerAddressTwoInput = (input) => {
    this.setState({addressTwo: input});
  };

  _handlerPincodeInput = (input) => {
    this.setState({pincode: input});
  };

  _handlerLocalityInput = (input) => {
    this.setState({locality: input});
  };

  _handlerLandmarkInput = (input) => {
    this.setState({landmark: input});
  };

  _onShopNextPress = () => {
    const {
      avatarSource,
      pincode,
      shopName,
      addressOne,
      addressTwo,
      locality,
      landmark,
      selectedCountry,
      selectedState,
      selectedCity,
      countryCode,
      stateCode,
      cityCode,
    } = this.state;
    const shopDetails = {
      avatarSource: avatarSource,
      shopName: shopName,
      addressOne: addressOne,
      addressTwo: addressTwo,
      locality: locality,
      landmark: landmark,
      pincode: pincode,

      // countryCode: countryCode,
      // stateCode: stateCode,
      // cityCode: cityCode,

      selectedCountry: selectedCountry,
      selectedState: selectedState,
      selectedCity: selectedCity,
    };
    if (
      !shopName ||
      !addressOne ||
      !addressTwo ||
      !locality ||
      !pincode ||
      !landmark ||
      !Object.keys(selectedCountry).length ||
      !Object.keys(selectedState).length ||
      !Object.keys(selectedCity).length ||
      !avatarSource.uri
    ) {
      if (!avatarSource.uri) {
        alert('Please select your shop image!!');
      } else {
        alert('Please Enter all the fields properly!');
      }
    } else {
      this.props.setStateShopDetails(shopDetails);
      this.props.setStateActiveComponent(this.props.activeComponent + 1);
    }
  };

  render() {
    return (
      <View style={{marginTop: 18, marginHorizontal: 14, alignItems: 'center'}}>
        <TouchableOpacity
          style={{marginTop: 10}}
          onPress={() => this._onImagePicker()}>
          <View>
            <Image
              borderRadius={100 / 2}
              style={{
                resizeMode: 'cover',
                height: 100,
                width: 100,
                overflow: 'hidden',
                borderColor: '#8d8d8d',
                borderWidth: 1,
              }}
              source={this.state.avatarSource}
            />
          </View>
        </TouchableOpacity>
        <View style={{width: '100%'}}>
          <View style={{marginTop: 14}}>
            <TextInput
              value={this.state.shopName}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Shop Name*"
              onChangeText={(input) => {
                this._handlerShopNameInput(input);
              }}
              onSubmitEditing={() => this.addressOne.focus()}
              autoFocus={true}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.addressOne}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Address 1*"
              ref={(input) => {
                this.addressOne = input;
              }}
              onChangeText={(input) => {
                this._handlerAddressOneInput(input);
              }}
              onSubmitEditing={() => this.addressTwo.focus()}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.addressTwo}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Address 2*"
              ref={(input) => {
                this.addressTwo = input;
              }}
              onChangeText={(input) => {
                this._handlerAddressTwoInput(input);
              }}
              onSubmitEditing={() => this.locality.focus()}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              mode="flat"
              value={this.state.locality}
              style={{backgroundColor: 'transparent'}}
              label="Locality*"
              ref={(input) => {
                this.locality = input;
              }}
              onChangeText={(input) => {
                this._handlerLocalityInput(input);
              }}
              onSubmitEditing={() => this.landmark.focus()}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.landmark}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Landmark*"
              ref={(input) => {
                this.landmark = input;
              }}
              onChangeText={(input) => {
                this._handlerLandmarkInput(input);
              }}
              onSubmitEditing={() => this.pincode.focus()}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              value={this.state.pincode}
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Pincode*"
              ref={(input) => {
                this.pincode = input;
              }}
              onChangeText={(input) => this._handlerPincodeInput(input)}
              keyboardType="numeric"
            />
          </View>
          {/* <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:14}}>
                        <View style={{ width:'48%', height: 44, borderWidth:1, borderColor:'#8d8d8d', borderRadius: 4 }}>
                            <Picker
                                selectedValue={this.state.countryCode}
                                style={{ height: '100%', marginLeft:10}}
                                onValueChange={(countryCode) => {this._handlerCountryCodeInput(countryCode)}}
                                itemStyle={{paddingLeft:10}}
                                >
                                {this.state.countries.map((country, index) => {return(
                                    <Picker.Item key={index} label={country.name} value={country.id} />
                                )})}
                            </Picker> 
                        </View>
                        <View style={{ width:'48%', height: 44, borderWidth:1, borderColor:'#8d8d8d', borderRadius: 4 }}>
                            <Picker
                                selectedValue={this.state.stateCode}
                                style={{ height: '100%', marginLeft:10}}
                                onValueChange={(stateCode) => {this._handlerStateCodeInput(stateCode)}}
                                itemStyle={{paddingLeft:10}}
                            >
                                {this.state.states.map((state, index) => {return(
                                    <Picker.Item key={index} label={state.name} value={state.id} />
                                )})}
                            </Picker> 
                        </View>
                    </View>
                    <View style={{ width:'100%', height: 44, borderWidth:1, borderColor:'#8d8d8d', borderRadius: 4, marginTop:14 }}>
                        <Picker
                            selectedValue={this.state.cityCode}
                            style={{ height:'100%', marginLeft:10 }}
                            onValueChange={(cityCode) => {this._handlerCityCodeInput(cityCode)}}
                            itemStyle={{paddingLeft:10}}
                        >
                            {this.state.cities.map((city, index) => {return(
                                <Picker.Item key={index} label={city.name} value={city.id} />
                            )})}
                        </Picker> 
                    </View> */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 14,
            }}>
            <View style={{width: '48%'}}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  marginLeft: 4,
                  marginBottom: 6,
                }}>
                Country
              </Text>
              <View style={{height: 44}}>
                <RNPicker
                  dataSource={this.state.countries}
                  dummyDataSource={this.state.countries}
                  pickerTitle={'Select Country'}
                  showSearchBar={true}
                  disablePicker={false}
                  placeHolderLabel={
                    this.state.selectedCountry.name || 'Select Country'
                  }
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
            </View>
            <View style={{width: '48%'}}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  marginLeft: 4,
                  marginBottom: 6,
                }}>
                State
              </Text>
              <View style={{height: 44}}>
                <RNPicker
                  dataSource={this.state.states}
                  dummyDataSource={this.state.states}
                  pickerTitle={'Select State'}
                  showSearchBar={true}
                  disablePicker={false}
                  placeHolderLabel={
                    this.state.selectedState.name || 'Select State'
                  }
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
          </View>
          <View style={{width: '100%', marginTop: 14}}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                marginLeft: 4,
                marginBottom: 6,
              }}>
              City
            </Text>
            <View style={{height: 44}}>
              <RNPicker
                dataSource={this.state.cities}
                dummyDataSource={this.state.cities}
                pickerTitle={'Select City'}
                showSearchBar={true}
                disablePicker={false}
                placeHolderLabel={this.state.selectedCity.name || 'Select City'}
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
      </View>
    );
  }
}

class TaxDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      current_expanded_date: this.props.state.current_expanded_date,
      current_shorten_date: this.props.state.current_shorten_date,
      toggleDatePicker: false,

      shopRegNo: this.props.state.shopRegNo,
      taxRegNo: this.props.state.taxRegNo,
    };
  }

  _onDateChange = (chosen_date) => {
    let chosen_date_string = `${chosen_date}`;
    this.setState({
      current_expanded_date: chosen_date,
      current_shorten_date:
        chosen_date_string.split(' ')[1] +
        ' ' +
        chosen_date_string.split(' ')[2] +
        ' ' +
        chosen_date_string.split(' ')[3],
    });
  };

  _handlerShopRegNoInput = (input) => {
    this.setState({shopRegNo: input});
  };

  _handlerTaxRegNoInput = (input) => {
    this.setState({taxRegNo: input});
  };

  _onTaxNextPress = () => {
    const {
      current_expanded_date,
      current_shorten_date,
      shopRegNo,
      taxRegNo,
    } = this.state;
    const taxDetails = {
      current_expanded_date: current_expanded_date,
      current_shorten_date: current_shorten_date,
      shopRegNo: shopRegNo,
      taxRegNo: taxRegNo,
    };

    if (
      !current_expanded_date ||
      !current_shorten_date ||
      !taxRegNo ||
      !shopRegNo
    ) {
      alert('Please Enater all the fields properly!');
    } else {
      this.props.setStateTaxDetails(taxDetails);
      this.props.setStateActiveComponent(this.props.activeComponent + 1);
    }
  };

  render() {
    return (
      <View style={{marginTop: 14, marginHorizontal: 14, alignItems: 'center'}}>
        <View style={{width: '100%'}}>
          <View>
            <TextInput
              mode="flat"
              value={this.state.shopRegNo}
              style={{backgroundColor: 'transparent'}}
              label="Shop Registration Number"
              onChangeText={(input) => {
                this._handlerShopRegNoInput(input);
              }}
              onSubmitEditing={() => this.TaxRegNo.focus()}
              autoFocus={true}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              mode="flat"
              value={this.state.taxRegNo}
              style={{backgroundColor: 'transparent'}}
              label="Tax Registration Number"
              ref={(input) => {
                this.TaxRegNo = input;
              }}
              onChangeText={(input) => {
                this._handlerTaxRegNoInput(input);
              }}
              onSubmitEditing={() => this.setState({toggleDatePicker: true})}
            />
          </View>
          <View style={{marginTop: 10}}>
            <Pressable
              onPress={() =>
                this.setState({toggleDatePicker: !this.state.toggleDatePicker})
              }>
              <View pointerEvents="box-only">
                <TextInput
                  mode="flat"
                  value={this.state.current_shorten_date}
                  style={{backgroundColor: 'transparent'}}
                  label="Tax Registration Date"
                />
              </View>
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}>
                <IconButton
                  color="#000"
                  size={18}
                  icon={
                    !this.state.toggleDatePicker ? 'arrow-down' : 'arrow-up'
                  }
                  onPress={() =>
                    this.setState({
                      toggleDatePicker: !this.state.toggleDatePicker,
                    })
                  }
                />
              </View>
            </Pressable>
            {this.state.toggleDatePicker ? (
              <DatePicker
                date={this.state.current_expanded_date}
                onDateChange={(chosen_date) => this._onDateChange(chosen_date)}
                mode="date"
                androidVariant="iosClone"
                style={{
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10 /* width:'100%' */,
                }}
              />
            ) : null}
          </View>
        </View>
      </View>
    );
  }
}

class BankDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bankName: this.props.state.bankName,
      bankAccountNo: this.props.state.bankAccountNo,
      bankCode: this.props.state.bankCode,
      bankHolderName: this.props.state.bankHolderName,
    };
  }

  _handlerBankNameInput = (input) => {
    this.setState({bankName: input});
  };

  _handlerBankAcNoInput = (input) => {
    this.setState({bankAccountNo: input});
  };

  _handlerBankCodeInput = (input) => {
    this.setState({bankCode: input});
  };

  _handlerBankHolderNameInput = (input) => {
    this.setState({bankHolderName: input});
  };

  _onBankNextPress = async () => {
    const {bankName, bankAccountNo, bankCode, bankHolderName} = this.state;
    const bankDetails = {
      bankName: bankName,
      bankAccountNo: bankAccountNo,
      bankCode: bankCode,
      bankHolderName: bankHolderName,
    };

    if (!bankName || !bankAccountNo || !bankCode || !bankHolderName) {
      alert('Please Enater all the fields properly!');
    } else {
      await this.props.setStateBankDetails(bankDetails);
      this.props.onSubmit();
    }
  };

  render() {
    return (
      <View style={{marginTop: 18, marginHorizontal: 14, alignItems: 'center'}}>
        <View style={{width: '100%'}}>
          <View>
            <TextInput
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Bank Name"
              onChangeText={(input) => {
                this._handlerBankNameInput(input);
              }}
              onSubmitEditing={() => this.BankAcNo.focus()}
              autoFocus={true}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Bank Account Number"
              keyboardType="numeric"
              onChangeText={(input) => {
                this._handlerBankAcNoInput(input);
              }}
              onSubmitEditing={() => this.BankCode.focus()}
              ref={(input) => {
                this.BankAcNo = input;
              }}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Bank Code"
              onChangeText={(input) => {
                this._handlerBankCodeInput(input);
              }}
              onSubmitEditing={() => this.BankHolderName.focus()}
              ref={(input) => {
                this.BankCode = input;
              }}
            />
          </View>
          <View style={{marginTop: 10}}>
            <TextInput
              mode="flat"
              style={{backgroundColor: 'transparent'}}
              label="Bank Account Holde Name"
              onChangeText={(input) => {
                this._handlerBankHolderNameInput(input);
              }}
              ref={(input) => {
                this.BankHolderName = input;
              }}
              // onSubmitEditing={() => this.TaxRegNo.focus()}
            />
          </View>
        </View>
      </View>
    );
  }
}

const content = [
  <ContactDetails title="Contact" />,
  <ShopDetails title="Shop" />,
  <TaxDetails title="Tax" />,
  <BankDetails title="Bank" />,
];

const intialStateContact = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  pincode: '',
  addressOne: '',
  addressTwo: '',
  locality: '',
  landmark: '',
  webLink: '',

  // countryCode: 0,
  // stateCode: 0,
  // cityCode: 0,

  selectedCountry: {},
  selectedState: {},
  selectedCity: {},
};

const initialStateShop = {
  avatarSource: require('../../assets/image_picker.png'),
  shopName: '',
  addressOne: '',
  addressTwo: '',
  pincode: '',
  locality: '',
  landmark: '',

  // countryCode: 0,
  // stateCode: 0,
  // cityCode: 0,

  selectedCountry: {},
  selectedState: {},
  selectedCity: {},
};

const current_date = new Date();
var month = new Array();
month[0] = 'Jan';
month[1] = 'Feb';
month[2] = 'Mar';
month[3] = 'Apr';
month[4] = 'May';
month[5] = 'Jun';
month[6] = 'Jul';
month[7] = 'Aug';
month[8] = 'Sep';
month[9] = 'Oct';
month[10] = 'Nov';
month[11] = 'Dec';
let get_month = month[current_date.getMonth()];
const initialStateTax = {
  current_expanded_date: new Date(),
  current_shorten_date: `${get_month} ${current_date.getDate()} ${current_date.getFullYear()}`,

  shopRegNo: '',
  taxRegNo: '',
};

const initialStateBank = {
  bankName: '',
  bankAccountNo: 0,
  bankCode: '',
  bankHolderName: '',
};

class BusinessDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeComponent: 0,
      contactDetails: {
        ...intialStateContact,
        email: this.props.email,
        phone: this.props.phone,
      },
      shopDetails: {...initialStateShop},
      taxDetails: {...initialStateTax},
      bankDetails: {...initialStateBank},
      is_request_loading: false,
    };
  }

  backAction = () => {
    this._onPressBack();
    return true;
  };

  componentDidMount() {
    console.log('phone = ', this.props.phone);
    console.log('email = ', this.props.email);
    this.props.navigation.addListener('focus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.backAction);
    });

    this.props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  _onNextButtonClick = () => {
    const {activeComponent} = this.state;

    if (activeComponent === 0) {
      this.contactChild._onContactNextPress();
    } else if (activeComponent === 1) {
      this.shopChild._onShopNextPress();
    } else if (activeComponent === 2) {
      this.taxChild._onTaxNextPress();
    } else if (activeComponent === 3) {
      this.bankChild._onBankNextPress();
    }
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

  // _storeData = async (token) => {
  //     try{
  //         await AsyncStorage.setItem('token', token);
  //       }
  //     catch(err){
  //         console.log(err);
  //     }
  // }

  _useContext = () => {
    this.props.navigation.reset({routes: [{name: 'Login'}]});
    // this.props.navigation.navigate("HooksForClassCompo");
    // this.props.navigation.navigate("Login");
  };

  _onSubmit = async () => {
    this.setState({is_request_loading: true});
    const {contactDetails, shopDetails, taxDetails, bankDetails} = this.state;
    let month_in_number;
    switch (`${taxDetails.current_expanded_date}`.split(' ')[1]) {
      case 'Jan':
        month_in_number = '01';
        break;
      case 'Feb':
        month_in_number = '02';
        break;
      case 'Mar':
        month_in_number = '03';
        break;
      case 'Apr':
        month_in_number = '04';
        break;
      case 'May':
        month_in_number = '05';
        break;
      case 'Jun':
        month_in_number = '06';
        break;
      case 'Jul':
        month_in_number = '07';
        break;
      case 'Aug':
        month_in_number = '08';
        break;
      case 'Sep':
        month_in_number = '09';
        break;
      case 'Oct':
        month_in_number = '10';
        break;
      case 'Nov':
        month_in_number = '11';
        break;
      case 'Dec':
        month_in_number = '12';
        break;
      default:
        month_in_number = '01';
        break;
    }
    const shortenDate =
      `${taxDetails.current_expanded_date}`.split(' ')[3] +
      '-' +
      month_in_number +
      '-' +
      `${taxDetails.current_expanded_date}`.split(' ')[2];
    const token = this.props.userToken;
    const businessDetails = {
      // first_name: contactDetails.firstName,
      // last_name: contactDetails.lastName,
      seller_address_line_one: contactDetails.addressOne,
      seller_street_address: contactDetails.addressTwo,
      seller_locality: contactDetails.locality,
      seller_landmark: contactDetails.landmark,
      seller_city_id: contactDetails.selectedCity.id,
      seller_pincode: contactDetails.pincode,
      seller_state_id: contactDetails.selectedState.id,
      seller_country_id: contactDetails.selectedCountry.id,
      url: contactDetails.webLink,
      business_shop_image: shopDetails.avatarSource.uri,
      business_shop_name: shopDetails.shopName,
      business_address_line_one: shopDetails.addressOne,
      business_street_address: shopDetails.addressTwo,
      business_locality: shopDetails.locality,
      business_landmark: shopDetails.landmark,
      business_city_id: shopDetails.selectedCity.id,
      business_pincode: shopDetails.pincode,
      business_country_id: shopDetails.selectedCountry.id,
      business_state_id: shopDetails.selectedState.id,
      business_shop_registration_number: taxDetails.shopRegNo,
      business_tax_registration_number: taxDetails.taxRegNo,
      business_tax_registration_date: shortenDate,
      business_bank_name: bankDetails.bankName,
      business_account_number: bankDetails.bankAccountNo,
      business_bank_code: bankDetails.bankCode,
      business_account_holder_name: bankDetails.bankHolderName,
    };
    console.log('business details = ', businessDetails);

    if (token) {
      axios
        .post(
          UNIVERSAL_ENTRY_POINT_ADDRESS + API_SAVE_BUSINESS_INFO_KEY,
          businessDetails,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((res) => {
          // console.log(res);
          // this._storeData(token);
          this._onToastMessageSent(
            'Application has been submitted successfully.',
          );
          this._useContext();
        })
        .catch((err) => {
          console.log({...err});
          // alert(err);
          if (err.response?.data?.message) {
            alert(err.response.data.message);
          } else if (true) {
            // TODO: Setup a merging function of validation error into a single string
            alert('Something is Wrong!!');
          } else {
            alert('Something is Wrong!!');
          }
        })
        .finally(() => {
          this.setState({is_request_loading: false});
        });
    } else {
      this.setState({is_request_loading: false});
      alert('You are unauthorized.');
    }
  };

  _onPressBack = () => {
    Alert.alert(
      'Confirmation',
      "Are you sure? You're about to finish sing up process",
      [
        {
          text: 'Yes',
          onPress: () =>
            // this.props.navigation.goBack()
            this._useContext(),
        },
        {
          text: 'No',
          onPress: () => null,
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar
          barStyle={
            Platform.OS === 'android' ? 'dark-content' : 'light-content'
          }
          backgroundColor="white"
        />
        <Header
          placement="center"
          leftComponent={
            <Appbar.BackAction
              color="#fff"
              onPress={() => this._onPressBack()}
            />
          }
          centerComponent={{
            text: content[this.state.activeComponent].props.title + ' Details',
            style: {
              color: '#fff',
              textTransform: 'capitalize',
              fontSize: 16,
              letterSpacing: 0.5,
            },
          }}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ['#6B23AE', '#FAD44D'],
            start: {x: 0, y: 0},
            end: {x: 1.8, y: 0},
          }}
          containerStyle={{
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        />
        <ScrollView
          style={{paddingTop: 20}}
          showsVerticalScrollIndicator={false}>
          <Stepper
            active={this.state.activeComponent}
            content={[
              <ContactDetails
                props={this.props}
                activeComponent={this.state.activeComponent}
                setStateActiveComponent={(active_number) =>
                  this.setState({activeComponent: active_number})
                }
                setStateContactDetails={(contact_details) =>
                  this.setState({contactDetails: contact_details})
                }
                ref={(input) => {
                  this.contactChild = input;
                }}
                title="Contact"
                state={this.state.contactDetails}
              />,
              <ShopDetails
                activeComponent={this.state.activeComponent}
                setStateActiveComponent={(active_number) =>
                  this.setState({activeComponent: active_number})
                }
                setStateShopDetails={(shop_details) =>
                  this.setState({shopDetails: shop_details})
                }
                ref={(input) => {
                  this.shopChild = input;
                }}
                title="Shop"
                state={this.state.shopDetails}
              />,
              <TaxDetails
                activeComponent={this.state.activeComponent}
                setStateActiveComponent={(active_number) =>
                  this.setState({activeComponent: active_number})
                }
                setStateTaxDetails={(tax_details) =>
                  this.setState({taxDetails: tax_details})
                }
                ref={(input) => {
                  this.taxChild = input;
                }}
                title="Tax"
                state={this.state.taxDetails}
              />,
              <BankDetails
                onSubmit={() => this._onSubmit()}
                activeComponent={this.state.activeComponent}
                setStateBankDetails={(bank_details) =>
                  this.setState({bankDetails: bank_details})
                }
                ref={(input) => {
                  this.bankChild = input;
                }}
                title="Bank"
                state={this.state.bankDetails}
              />,
            ]}
            stepStyle={{
              height: 40,
              width: 40,
              borderRadius: 40 / 2,
              borderWidth: 2,
              borderColor: '#1976d2',
              backgroundColor: 'transparent',
            }}
            stepTextStyle={{color: '#000'}}
            showButton={false}
          />
          <View
            style={{
              marginBottom: 60,
              paddingHorizontal: 14,
              marginTop: 20,
              flexDirection: 'row',
              justifyContent:
                this.state.activeComponent == 0 ? 'flex-end' : 'space-between',
              width: '100%',
            }}>
            {this.state.is_request_loading ? (
              <ActivityIndicator
                style={{alignSelf: 'center'}}
                size={22}
                color="#6B23AE"
              />
            ) : (
              <>
                {this.state.activeComponent != 0 ? (
                  <Button
                    icon="arrow-left"
                    mode="outlined"
                    onPress={() => {
                      this.setState({
                        activeComponent: this.state.activeComponent - 1,
                      });
                    }}>
                    Previous
                  </Button>
                ) : null}
                {this.state.activeComponent !== content.length - 1 ? (
                  <Button
                    icon="arrow-right"
                    mode="contained"
                    onPress={() => this._onNextButtonClick()}>
                    Next
                  </Button>
                ) : (
                  <Button
                    icon="arrow-right"
                    mode="contained"
                    onPress={() => this._onNextButtonClick()}>
                    Submit
                  </Button>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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

const mapStateToProps = (state) => {
  return {
    email: state.email,
    phone: state.phone,
    userToken: state.userToken,

    isSocialLogin: state.isSocialLogin,
    socialLoginProvider: state.socialLoginProvider,
  };
};

export default connect(mapStateToProps)(BusinessDetails);
