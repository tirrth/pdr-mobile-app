import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Pressable,
} from 'react-native';
import {Header} from 'react-native-elements';
import {FlatList} from 'react-native-gesture-handler';
import {Appbar, IconButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_RECENTLY_ADDED_PRODUCTS_KEY,
  NO_AUTH_API_RECENTLY_ADDED_PRODUCTS_KEY,
  API_ADD_PRODUCT_TO_CART_KEY,
  API_ADD_PRODUCT_TO_WISHLIST_KEY,
  API_REMOVE_PRODUCT_FROM_WISHLIST_KEY,
} from '@env';
import LinearGradient from 'react-native-linear-gradient';
import {SwipeRating} from './rating-stars';
import Ripple from 'react-native-material-ripple';
import {currency_strings} from '../locales';

class HeaderIcons extends Component {
  _navigationFunc = (navigation) => {
    const {navigate} = this.props.navigation;
    navigate(navigation);
  };

  render() {
    return (
      <View style={styles.headerIconsView}>
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
          {this.props.is_usr_logged_in ? (
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
                style={{marginRight: 0}}
                onPress={() => this._navigationFunc('Notifications')}
              />
              <View
                style={{
                  backgroundColor: 'red',
                  height: 14,
                  width: 14,
                  borderRadius: 14 / 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: -15,
                  marginTop: -15,
                  marginRight: 12,
                  borderWidth: 0.5,
                  borderColor: '#fff',
                }}>
                <Text style={{color: '#fff', fontSize: 7}}>1</Text>
              </View>
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
        </>
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
          <Appbar.BackAction
            color="#fff"
            onPress={() => this.props.navigation.goBack()}
          />
        }
        centerComponent={{
          text: 'Recently Added Products',
          style: {
            color: '#fff',
            textTransform: 'capitalize',
            letterSpacing: 0.8,
            fontSize: 16,
            marginLeft: -10,
          },
        }}
        rightComponent={
          <HeaderIcons
            is_usr_logged_in={this.props.is_usr_logged_in}
            navigation={this.props.navigation}
          />
        }
        ViewComponent={LinearGradient} // Don't forget this!
        linearGradientProps={{
          colors: ['#6B23AE', '#FAD44D'],
          start: {x: 0, y: 0},
          end: {x: 1.8, y: 0},
        }}
      />
    );
  }
}

export default class RecentlyAddedExpandedList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categoryData: [],
      isLoading: true,
      nextCategoryPageLoader: false,
      nextProductPageNo: 2,
      errorMessage: '',

      is_usr_logged_in: false,
    };
  }

  async componentDidMount() {
    const userToken = await AsyncStorage.getItem('token');
    this.setState({is_usr_logged_in: userToken ? true : false});

    let url = '';
    let headers = {};
    if (userToken) {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_RECENTLY_ADDED_PRODUCTS_KEY;
      headers = {Authorization: `Bearer ${userToken}`};
    } else {
      url =
        UNIVERSAL_ENTRY_POINT_ADDRESS + NO_AUTH_API_RECENTLY_ADDED_PRODUCTS_KEY;
    }
    await axios
      .get(url, {headers: headers})
      .then((response) => {
        console.log('recently-added', response);
        if (response.data.products.data.length !== 0) {
          this.setState({
            categoryData: response.data.products,
            isLoading: false,
          });
        } else {
          this.setState({
            errorMessage: 'Product List is Empty!!',
            isLoading: false,
          });
        }
      })
      .catch((error) => {
        // console.log(error.response.data.message);
        this.setState({
          errorMessage: error.response.data.message,
          isLoading: false,
        });
        alert(error.response.data.message);
      });
  }

  // _formatData = (data, numColumns) => {
  //     // console.log(data, numColumns);
  //     const numOfFullRows = Math.floor(data.length / numColumns);
  //     let numOfElementsLastRow = data.length - (numOfFullRows * numColumns);

  //     while ((numOfElementsLastRow !== numColumns) && (numOfElementsLastRow !== 0)) {
  //         data.push({
  //             uuid: `${Math.random()}`,
  //             img: '',
  //             category: '',
  //             parent_category: '',
  //             empty: true
  //         });
  //         numOfElementsLastRow++;
  //     }

  //     return data;
  // }

  _onLoadMore = async (totalProducts, productsPerPage) => {
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    if (totalPages > 1 && this.state.nextProductPageNo <= totalPages) {
      this.setState({nextCategoryPageLoader: true});

      const userToken = await AsyncStorage.getItem('token');
      let url = '';
      let headers = {};
      if (userToken) {
        url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_RECENTLY_ADDED_PRODUCTS_KEY;
        headers = {Authorization: `Bearer ${userToken}`};
      } else {
        url =
          UNIVERSAL_ENTRY_POINT_ADDRESS +
          NO_AUTH_API_RECENTLY_ADDED_PRODUCTS_KEY;
      }
      await axios
        .get(url, {
          headers: headers,
          params: {page: this.state.nextProductPageNo},
        })
        .then((response) => {
          this.setState({nextCategoryPageLoader: false});
          var joinedData = {
            ...this.state.categoryData,
            data: [
              ...this.state.categoryData.data,
              ...response.data.products.data,
            ],
          };
          this.setState({categoryData: joinedData});
          this.setState((prevState) => {
            return {nextProductPageNo: prevState.nextProductPageNo + 1};
          });
        })
        .catch((error) => {
          console.log(error);
          alert(error);
        });
    } else {
      this.setState({nextCategoryPageLoader: false});
    }
  };

  _onMoveToWishListPress = async (uuid) => {
    // console.log(uuid);
    const value = await AsyncStorage.getItem('token');
    // console.log(value);
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
        // alert("Product has been successfully added to your wishlist!");
        const productsUUID = this.state.categoryData.data.map(
          (data) => data.uuid,
        );
        this.state.categoryData.data[productsUUID.indexOf(uuid)].wishlist = 1;
        this.state.categoryData.data[productsUUID.indexOf(uuid)].wishlist_uuid =
          response.data.wishlist_uuid;
        this.setState({categoryData: this.state.categoryData});
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          alert('Product is already in the WishList!!');
        } else {
          alert(err);
        }
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
        // alert(response.data.message);
        const productsUUID = this.state.categoryData.data.map(
          (data) => data.wishlist_uuid,
        );
        this.state.categoryData.data[
          productsUUID.indexOf(wishlist_uuid)
        ].wishlist = 0;
        this.setState({categoryData: this.state.categoryData});
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  _onPressAddToCart = async (product_uuid) => {
    // console.log(product_uuid);
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
        alert(response.data.message);
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  _renderCategoryList = ({item}) => {
    // console.log(item);
    const {per_dollar_rate, currency_symbol} = currency_strings;
    return (
      <Pressable
        onPress={() =>
          this.props.navigation.navigate('Product', {productId: item.uuid})
        }>
        <View style={styles.CategoryListContainer}>
          <View style={styles.CategoryListInfoView}>
            <View style={styles.CategoryListImageContainer}>
              {item.images.length !== 0 ? (
                <ImageBackground
                  source={{uri: item.images[0].image}}
                  style={{
                    ...styles.CategoryListImage,
                    backgroundColor: '#eeeeee',
                  }}
                  imageStyle={{resizeMode: 'contain' /* borderRadius:4 */}}
                />
              ) : (
                <View
                  style={{
                    ...styles.CategoryListImage,
                    backgroundColor: '#eeeeee',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{color: 'red'}}>No Image</Text>
                </View>
              )}
            </View>
            <View style={{...styles.CategoryCenterContainer, flex: 1}}>
              <View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{fontSize: 16, flexShrink: 1}}>
                    {item.product_name.length > 60
                      ? item.product_name.slice(0, 60) + '...'
                      : item.product_name}
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{color: '#8d8d8d', fontSize: 12, flexShrink: 1}}>
                    {item.highlights.length > 90
                      ? item.highlights.slice(0, 90) + '...'
                      : item.highlights}
                  </Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View>
                  <SwipeRating
                    imageSize={18}
                    ratingCount={5}
                    readonly
                    startingValue={item.rating_stars ? item.rating_stars : 0}
                  />
                </View>
                <View style={{marginLeft: 6}}>
                  <Text style={{color: '#8d8d8d'}}>(1)</Text>
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
                    }}>{`(${item.discount}%)`}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {this.state.is_usr_logged_in ? (
            <>
              <View
                style={{width: '100%', height: 1, backgroundColor: '#dddddd'}}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: 44,
                }}>
                <Ripple
                  onPress={() => this._onPressAddToCart(item.uuid)}
                  rippleContainerBorderRadius={4}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}>
                  <Text style={{textTransform: 'uppercase', color: '#6B23AE'}}>
                    Add To Cart
                  </Text>
                </Ripple>
                <View
                  style={{width: 1, height: '100%', backgroundColor: '#dddddd'}}
                />
                <IconButton
                  style={{flex: 1}}
                  size={20}
                  color={item.wishlist === 0 ? '#8d8d8d' : 'red'}
                  icon={item.wishlist === 0 ? 'heart-outline' : 'heart'}
                  onPress={
                    item.wishlist === 0
                      ? () => this._onMoveToWishListPress(item.uuid)
                      : () =>
                          this._onRemoveFromWishListPress(item.wishlist_uuid)
                  }
                />
              </View>
            </>
          ) : null}
        </View>
      </Pressable>
    );
  };

  render() {
    return (
      <View style={{height: '100%'}}>
        <HeaderBar
          is_usr_logged_in={this.props.is_usr_logged_in}
          navigation={this.props.navigation}
        />

        {!this.state.isLoading ? (
          this.state.errorMessage !== '' ? (
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
              <Text
                style={{color: '#8d8d8d', textAlign: 'center', padding: 10}}>
                {this.state.errorMessage}
              </Text>
            </View>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this.state.categoryData.data}
              extraData={this.state.categoryData}
              renderItem={this._renderCategoryList}
              keyExtractor={(item) => `${item.uuid}`}
              contentContainerStyle={{paddingBottom: 80}}
              key={'RecentlyAddedProductListView'}
              onEndReached={() => {
                if (!this.state.nextCategoryPageLoader) {
                  this._onLoadMore(
                    this.state.categoryData.total,
                    this.state.categoryData.per_page,
                  );
                }
              }}
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                this.state.nextCategoryPageLoader ? (
                  <ActivityIndicator size="small" color="#8d8d8d" />
                ) : (
                  <></>
                )
              }
              ListFooterComponentStyle={{marginTop: 10}}
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
            {this.state.isEmptyCategory ? (
              <Text style={{color: '#8d8d8d'}}>No Categories Available</Text>
            ) : (
              <ActivityIndicator size={25} color="purple" />
            )}
          </View>
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
    marginLeft: 9,
    marginRight: 9,
  },

  CategoryListContainer: {
    elevation: 1,
    width: '96%',
    alignSelf: 'center',
    // height:140,
    backgroundColor: 'white',
    borderRadius: 4,
    marginTop: 8,
    // marginBottom:8,
    justifyContent: 'center',
  },
  CategoryListImageContainer: {
    justifyContent: 'center',
  },
  CategoryListImage: {
    height: 130,
    width: 120,
    // width:110,
    marginLeft: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  CategoryListInfoView: {
    flexDirection: 'row',
  },
  CategoryCenterContainer: {
    // marginHorizontal:16,
    marginHorizontal: 12,
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: 130,
    marginVertical: 8,
    alignSelf: 'center',
  },
  userRatingContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 32,
    alignItems: 'center',
  },
  userRatingContainerRateSection: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'baseline',
  },
  userRatingContainerUserCount: {
    paddingTop: 6,
    paddingBottom: 6,
    textAlign: 'center',
    borderLeftWidth: 0.8,
    borderLeftColor: '#dddddd',
  },
  itemPricingContainer: {
    flexDirection: 'row',
  },
});
