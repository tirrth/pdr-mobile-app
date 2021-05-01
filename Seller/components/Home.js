import React, {Component} from 'react';
import {View, Text, StyleSheet, Image, FlatList, Pressable} from 'react-native';
import {IconButton, Badge} from 'react-native-paper';
import {Header} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import Products from '../assets/products.svg';
import Orders from '../assets/orders.svg';
import ReportManagement from '../assets/report-management.svg';
import OfferManagement from '../assets/offers-management.svg';
import MostSoldProducts from '../assets/most-sold-products.svg';
import TotalRevenue from '../assets/total-revenue.svg';
import Ripple from 'react-native-material-ripple';
import {ScrollView, TouchableHighlight} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {UNIVERSAL_ENTRY_POINT_ADDRESS, API_GET_SELLER_INFO_KEY} from '@env';
import {connect} from 'react-redux';
import firestore from '@react-native-firebase/firestore';

const totalRevenue = [
  {
    title: 'Total Recieve Payment',
    amount: '1200.00',
  },
  {
    title: 'Total Pending Payment',
    amount: '1200.00',
  },
  {
    title: 'Total Refund Payment',
    amount: '1200.00',
  },
  // {
  //     title: 'Total Recieve Payment',
  //     amount: '1200.00'
  // },
  // {
  //     title: 'Total Pending Payment',
  //     amount: '1200.00'
  // },
  // {
  //     title: 'Total Refund Payment',
  //     amount: '1200.00'
  // },
  // {
  //     title: 'Total Recieve Payment',
  //     amount: '1200.00'
  // },
  // {
  //     title: 'Total Pending Payment',
  //     amount: '1200.00'
  // },
  // {
  //     title: 'Total Refund Payment',
  //     amount: '1200.00'
  // },
  // {
  //     title: 'Total Recieve Payment',
  //     amount: '1200.00'
  // },
  // {
  //     title: 'Total Pending Payment',
  //     amount: '1200.00'
  // },
  // {
  //     title: 'Total Refund Payment',
  //     amount: '1200.00'
  // }
];

class HeaderIcons extends Component {
  _navigationFunc = navigation => {
    const {push} = this.props.navigation;
    push(navigation);
  };

  render() {
    const {total_notifications_count} = this.props;
    return (
      <View style={{...styles.headerIconsView}}>
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
            <View style={{marginLeft: -20, marginTop: -15, marginRight: 12}}>
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
      </View>
    );
  }
}

class HeaderBar extends Component {
  render() {
    return (
      <Header
        placement="left"
        leftComponent={
          <IconButton icon="menu" color="#fff" onPress={this.props.onPress} />
        }
        centerComponent={{
          text: 'Home',
          style: {color: '#fff', marginLeft: -10},
        }}
        rightComponent={
          <HeaderIcons
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
      />
    );
  }
}

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      seller_info: {},
    };
  }

  async componentDidMount() {
    // const {changeTotalNotificationsCount} = this.props;
    // changeTotalNotificationsCount(0);
    // const token = await AsyncStorage.getItem('token');
    // await axios
    //   .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_SELLER_INFO_KEY, {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   })
    //   .then((res) => {
    //     this.setState({seller_info: res.data});
    //     this.props.changeProfileInfo(res.data);
    //   })
    //   .catch((err) => {
    //     console.log({...err});
    //   });
  }

  _listHeaderComponent = () => {
    const {profile_info: seller_info} = this.props;
    const {first_name, last_name, phone} = seller_info;
    return (
      <View>
        <View style={{width: '100%', height: 200}}>
          <LinearGradient
            style={{
              flex: 1,
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              justifyContent: 'flex-start',
            }}
            colors={['#6B23AE', '#FAD44D']}
            start={{x: 0, y: 0}}
            end={{x: 1.8, y: 0}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: 30,
              }}>
              {Object.keys(seller_info).length ? (
                <View>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>
                    {first_name + ' ' + last_name}
                  </Text>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>
                    +61 {phone}
                  </Text>
                </View>
              ) : null}
              <View>
                <Image
                  style={{
                    width: 80,
                    height: 80,
                    resizeMode: 'cover',
                    borderRadius: 100 / 2,
                    overflow: 'hidden',
                  }}
                  source={require('../assets/image_picker.png')}
                />
              </View>
            </View>
          </LinearGradient>
        </View>
        <View style={{...styles.navigatorBox}}>
          <View style={{...styles.navigatorBoxRow}}>
            <View style={{width: '30%'}}>
              <Ripple
                rippleContainerBorderRadius={6}
                style={{...styles.navigatorBoxRowEle}}
                onPress={() => this.props.navigation.navigate('ProductList')}>
                <Products height={44} width={44} />
                <Text style={{...styles.navigatorBoxRowEleText}}>Products</Text>
              </Ripple>
            </View>
            <View style={{width: '30%'}}>
              <Ripple
                rippleContainerBorderRadius={6}
                style={{...styles.navigatorBoxRowEle}}
                onPress={() => this.props.navigation.navigate('Orders')}>
                <Orders height={44} width={44} />
                <Text style={{...styles.navigatorBoxRowEleText}}>Orders</Text>
              </Ripple>
            </View>
            <View style={{width: '30%'}}>
              <Ripple
                rippleContainerBorderRadius={6}
                style={{...styles.navigatorBoxRowEle}}>
                <TotalRevenue height={44} width={44} />
                <Text style={{...styles.navigatorBoxRowEleText}}>
                  Total Revenue
                </Text>
              </Ripple>
            </View>
          </View>
          <View
            style={{...styles.navigatorBoxRow, justifyContent: 'space-around'}}>
            <View style={{width: '40%'}}>
              <Ripple
                rippleContainerBorderRadius={6}
                style={{...styles.navigatorBoxRowEle}}>
                <MostSoldProducts height={44} width={44} />
                <Text style={{...styles.navigatorBoxRowEleText}}>
                  Most Sold Products
                </Text>
              </Ripple>
            </View>
            <View style={{width: '40%'}}>
              <Ripple
                rippleContainerBorderRadius={6}
                style={{...styles.navigatorBoxRowEle}}
                onPress={() =>
                  this.props.navigation.navigate('ReportManagement')
                }>
                <ReportManagement height={44} width={44} />
                <Text style={{...styles.navigatorBoxRowEleText}}>
                  Report Management
                </Text>
              </Ripple>
            </View>
          </View>
        </View>
        <View style={{width: '90%', alignSelf: 'center', marginTop: 20}}>
          <Text style={{fontWeight: 'bold', fontSize: 16}}>Total Revenue</Text>
        </View>
      </View>
    );
  };

  _onRenderItem = ({item}) => {
    return !item.empty ? (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
          borderWidth: 1.5,
          borderColor: 'purple',
          marginTop: 8,
          marginHorizontal: 4,
          flex: 1,
          borderRadius: 6,
        }}>
        <Text style={{fontWeight: 'bold', fontSize: 18}}>${item.amount}</Text>
        <Text style={{fontSize: 14, textAlign: 'center'}}>{item.title}</Text>
      </View>
    ) : (
      <View
        style={{
          flex: 1,
          marginTop: 8,
          borderWidth: 1.5,
          borderColor: 'transparent',
          padding: 10,
          marginHorizontal: 4,
        }}></View>
    );
  };

  _formatData = (data, numColumns) => {
    const numOfFullRows = Math.floor(data.length / numColumns);
    let numOfElementsLastRow = data.length - numOfFullRows * numColumns;

    while (numOfElementsLastRow !== numColumns && numOfElementsLastRow !== 0) {
      data.push({
        title: `${Math.random()}`,
        amount: `${Math.random()}`,
        empty: true,
      });

      numOfElementsLastRow++;
    }

    return data;
  };

  render() {
    return (
      <View>
        <HeaderBar
          onPress={() => this.props.navigation.openDrawer()}
          navigation={this.props.navigation}
          total_notifications_count={this.props.total_notifications_count}
        />
        <View style={{marginTop: -1}}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={this._formatData(totalRevenue, 2)}
            ListHeaderComponent={this._listHeaderComponent}
            renderItem={this._onRenderItem}
            keyExtractor={item => `${item.title}`}
            numColumns={2}
            key={'GridView'}
            contentContainerStyle={{paddingBottom: 200}}
            columnWrapperStyle={{
              justifyContent: 'space-evenly',
              width: '90%',
              alignSelf: 'center',
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerIconsView: {
    flexDirection: 'row',
  },

  navigatorBox: {
    backgroundColor: 'white',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    elevation: 3,
    marginTop: -40,
    paddingHorizontal: 14,
  },
  navigatorBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  navigatorBoxRowEle: {
    width: '100%',
    // backgroundColor:'yellow',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
  },
  navigatorBoxRowEleText: {
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
});

const mapStateToProps = state => {
  return {
    profile_info: state.profile_info,
    total_notifications_count: state.total_notifications_count,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeProfileInfo: profile_info => {
      dispatch({type: 'CHANGE_PROFILE_INFO', payload: profile_info});
    },
    // changeTotalNotificationsCount: (count) => {
    //   dispatch({
    //     type: 'CHANGE_TOTAL_NOTIFICATIONS_COUNT',
    //     payload: count,
    //   });
    // },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
