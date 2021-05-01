import React, {Component} from 'react';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_SEARCH_PRODUCT_KEY,
  API_RECENT_SEARCH_KEY,
  API_REMOVE_PRODUCT_FROM_WISHLIST_KEY,
  API_ADD_PRODUCT_TO_CART_KEY,
  API_SEARCH_WITH_FILTER_KEY,
  NO_AUTH_API_SEARCH_WITH_FILTER_KEY,
  API_REMOVE_RECENT_SEARCH_PRODUCT_KEY,
  API_ADD_PRODUCT_TO_WISHLIST_KEY,
  NO_AUTH_API_SEARCH_PRODUCT_KEY,
  NO_AUTH_API_RECENTLY_ADDED_PRODUCTS_KEY,
} from '@env';
import {
  API_RECENTLY_ADDED_PRODUCTS_KEY,
  API_PRODUCT_CATEGORIES_KEY,
} from '@env';
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  Image,
  Modal,
  Text,
  StatusBar,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Icon, Rating} from 'react-native-elements';
import {Searchbar, RadioButton, Card} from 'react-native-paper';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import axios from 'axios';
import {Chip, IconButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SliderHeader} from './Home';
import {FAB} from 'react-native-paper';
import PriceRangeSlider from './PriceRangeSlider/PriceRangeSlider';
import {TextInput} from 'react-native-paper';
import Ripple from 'react-native-material-ripple';
import RNPicker from './rn-modal-picker';
import {ToastAndroid} from 'react-native';
import {currency_strings} from '../locales';

class RecommendedProducts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewAllBlueText: false,
      recentlyAddedProducts: [],
      isLoading: true,
      noProducts: false,
    };
  }

  async componentDidMount() {
    const value = await AsyncStorage.getItem('token');
    let url = '';
    let config = {};
    if (value) {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_RECENTLY_ADDED_PRODUCTS_KEY;
      config = {
        headers: {Authorization: `Bearer ${value}`},
      };
    } else {
      url =
        UNIVERSAL_ENTRY_POINT_ADDRESS + NO_AUTH_API_RECENTLY_ADDED_PRODUCTS_KEY;
    }
    await axios
      .get(url, config)
      .then((response) => {
        if (response.data.products.length === 0) {
          this.setState({noProducts: true, isLoading: false});
        } else {
          this.setState({
            recentlyAddedProducts: response.data.products,
            isLoading: false,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({isLoading: false, noProducts: true});
        //    alert(error);
      });
  }

  _onSwiperEndReached = () => {
    this.setState({viewAllBlueText: true});
    setTimeout(() => {
      this.setState({viewAllBlueText: false});
    }, 1000);
  };

  _onRecentlyAddedProductClick = (product_id, navigationProp) => {
    navigationProp.props.navigation.navigate('Product', {
      productId: product_id,
    });
  };

  _renderRecentlyAdded = ({item}) => {
    const {per_dollar_rate, currency_symbol} = currency_strings;
    return (
      <TouchableWithoutFeedback
        onPress={() =>
          this._onRecentlyAddedProductClick(item.uuid, this.props)
        }>
        <View style={styles.RecentlyAddedContainer}>
          {item.images.length !== 0 ? (
            <Image
              source={{uri: item.images[0].image}}
              style={{
                ...styles.RecentlyAddedImageBackground,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              }}
            />
          ) : (
            <View
              style={{
                ...styles.RecentlyAddedImageBackground,
                backgroundColor: '#eeeeee',
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 15,
              }}>
              <Text style={{color: 'red', textAlign: 'center'}}>
                No Image Available
              </Text>
            </View>
          )}
          <View
            style={{
              height: '30%',
              width: '100%',
              paddingLeft: 10,
              justifyContent: 'space-evenly',
              borderTopWidth: 0.4,
              borderTopColor: '#eeeeee',
            }}>
            <View>
              <View>
                <Text>{item.product_name}</Text>
              </View>
              <View>
                <Text style={{color: '#8d8d8d', fontSize: 12}}>
                  {'Its a good Product!'}
                </Text>
              </View>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 13}}>
                {/* ${item.price_after_discount} */}
                {`${currency_symbol}${(
                  item.price_after_discount * per_dollar_rate
                ).toFixed(2)}`}
              </Text>
              <Text
                style={{
                  textDecorationLine: 'line-through',
                  marginLeft: 8,
                  color: '#8d8d8d',
                  fontSize: 13,
                }}>
                {/* ${item.actual_price} */}
                {`${currency_symbol}${(
                  item.actual_price * per_dollar_rate
                ).toFixed(2)}`}
              </Text>
              <Text style={{color: 'red', marginLeft: 8, fontSize: 13}}>
                {item.discount}%
              </Text>
            </View>
            {/* <View></View> */}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  render() {
    return (
      <View style={{backgroundColor: '#fff'}}>
        <View style={{paddingBottom: 10}}>
          <SliderHeader
            HeaderTitle="Recommended For You"
            viewAllBlueText={this.state.viewAllBlueText}
            isLoading={this.state.isLoading}
            noProducts={this.state.noProducts}
            marginTop={true}
            marginLeftHeader={true}
          />
        </View>
        {!this.state.isLoading && (
          <ImageBackground
            source={require('../assets/swiper/1.jpg')}
            style={{width: '100%', height: 300}}>
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                flexDirection: 'row',
                flex: 1,
              }}>
              <View
                style={{alignSelf: 'center', marginLeft: 20, marginRight: 10}}>
                <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
                  Check Now
                </Text>
                <Text style={{color: '#fff', fontSize: 20, fontWeight: 'bold'}}>
                  New Added
                </Text>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={this.state.recentlyAddedProducts.data}
                renderItem={({item}) => this._renderRecentlyAdded({item})}
                keyExtractor={(item) => `${item.uuid}`}
                contentContainerStyle={{paddingRight: 20, alignSelf: 'center'}}
                onEndReachedThreshold={0.1}
                onEndReached={this._onSwiperEndReached}
                key={'RecentlyAddedProducts'}
              />
            </View>
          </ImageBackground>
        )}
      </View>
    );
  }
}

class FavoriteCategory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewAllBlueText: false,
      recommendedCategoryList: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_PRODUCT_CATEGORIES_KEY)
      .then((response) => {
        if (response.data.categories.length === 0) {
          this.setState({noProducts: true, isLoading: false});
        } else {
          this.setState({
            recommendedCategoryList: response.data.categories,
            isLoading: false,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({isLoading: false, noProducts: true});
      });
  }

  _onCategoryPress = (category_id, category_name) => {
    this.props.props.navigation.navigate('CategoryAndBrandProductList', {
      brandId: null,
      brandName: null,
      categoryId: category_id,
      categoryName: category_name,
    });
  };

  _renderRecommendedCategoryList = ({item}) => {
    return (
      <Card
        onPress={() => this._onCategoryPress(item.uuid, item.category)}
        style={{paddingVertical: 10, marginTop: 10}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 25,
            }}>
            {item.image !== '' && (
              <Image
                source={{uri: item.image}}
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 60 / 2,
                  borderWidth: 1,
                  borderColor: '#eeeeee',
                }}
              />
            )}
            {item.image === '' && (
              <View
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 60 / 2,
                  backgroundColor: '#eeeeee',
                }}></View>
            )}
            <View style={{marginLeft: 10}}>
              <Text>{item.category}</Text>
            </View>
          </View>
          <View style={{marginRight: 10}}>
            <IconButton
              icon="arrow-right"
              color="#8d8d8d"
              onPress={() => this._onCategoryPress(item.uuid, item.category)}
            />
          </View>
        </View>
      </Card>
    );
  };

  _onSwiperEndReached = () => {
    this.setState({viewAllBlueText: true});
    setTimeout(() => {
      this.setState({viewAllBlueText: false});
    }, 1000);
  };

  render() {
    return (
      <View
        style={{
          marginTop: 14,
          paddingBottom: !this.state.isLoading ? 80 : null,
        }}>
        <Card
          style={{paddingBottom: 10, backgroundColor: '#fff', borderRadius: 0}}>
          <SliderHeader
            HeaderTitle="Shop Your Favorite Category"
            viewAllBlueText={this.state.viewAllBlueText}
            isLoading={this.state.isLoading}
            noProducts={this.state.noProducts}
            marginTop={true}
            marginLeftHeader={true}
          />
        </Card>
        {!this.state.isLoading && (
          <View style={{paddingHorizontal: 10}}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this.state.recommendedCategoryList.data}
              renderItem={({item}) =>
                this._renderRecommendedCategoryList({item})
              }
              keyExtractor={(item) => `${item.uuid}`}
              onEndReachedThreshold={0.1}
              onEndReached={this._onSwiperEndReached}
              key={'RecommendedCategories'}
            />
          </View>
        )}
      </View>
    );
  }
}

export default class SearchComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      textSearch: '',
      searchDone: false,
      searchedItems: [],
      recentSearches: [],
      isDefaultSearchContentVisible: true,
      filterModalVisibility: false,
      isLoading: true,
      recentSearchNextPage: false,
      searchedProductsNextPage: false,

      sortingPickerSelectedText: 'Sort By',
      sortingPickerToggle: true,

      usr_token: null,
    };
  }

  async componentDidMount() {
    const token = await AsyncStorage.getItem('token');
    this.setState({usr_token: token});
    if (token) {
      axios
        .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_RECENT_SEARCH_KEY, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log('recent searches = ', response);
          if (response.data.message.length) {
            this.setState({
              recentSearches: response.data.message,
              isLoading: false,
            });
          } else {
            // console.log("Not Found!");
            this.setState({isLoading: false});
          }
          // axios.get(response.data.message.last_page_url, {
          //     headers:{
          //         Authorization: `Bearer ${token}`
          //     }
          // })
          // .then((response) => {
          //     // console.log("recent first page searches = ", response);
          //     if(response.data.message){
          //         this.setState({ recentSearches: response.data.message.data.reverse(), recentSearchNextPage: response.data.message.prev_page_url, isLoading: false});
          //     }
          //     else{
          //         console.log("Not Found!");
          //         this.setState({ isLoading: false });
          //     }
          // })
          // .catch(err => {
          //     console.log({...err});
          //     alert(err.response.data.message);
          // })
        })
        .catch((err) => {
          console.log({...err});
          alert(err.response.data.message);
        });
    } else {
      this.setState({isLoading: false});
    }
  }

  _onChangeText = (textSearch) => {
    this.setState({textSearch: textSearch});
  };

  _toastMessage = (message) => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  _onSearchPress = async (textSearch = this.state.textSearch) => {
    if (textSearch) {
      this.setState({
        isDefaultSearchContentVisible: false,
        isLoading: true,
        searchDone: false,
      });
      const value = await AsyncStorage.getItem('token');
      let url = '';
      let headers = {};
      if (value) {
        url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_SEARCH_PRODUCT_KEY;
        headers = {Authorization: `Bearer ${value}`};
      } else {
        url = UNIVERSAL_ENTRY_POINT_ADDRESS + NO_AUTH_API_SEARCH_PRODUCT_KEY;
      }
      axios
        .get(url, {
          headers: headers,
          params: {product_name: textSearch},
        })
        .then((response) => {
          // console.log('searched_product_data', response);
          if (response.data.products) {
            this.setState({
              searchedItems: response.data.products.data,
              isLoading: false,
              searchDone: true,
              searchedProductsNextPage: response.data.products.next_page_url,
            });
            var recent_searches_includes_searched_text =
              this.state.recentSearches.filter(
                (recent_search) => recent_search.search_text === textSearch,
              ).length > 0
                ? true
                : false;
            if (!recent_searches_includes_searched_text) {
              this.setState({
                recentSearches: [
                  {search_text: textSearch},
                  ...this.state.recentSearches,
                ],
              });
            }
          } else {
            // alert("No item Available!");
            this._toastMessage('No item Available!');
            var recent_searches_includes_searched_text =
              this.state.recentSearches.filter(
                (recent_search) => recent_search.search_text === textSearch,
              ).length > 0
                ? true
                : false;
            if (!recent_searches_includes_searched_text) {
              this.setState({
                recentSearches: [
                  {search_text: textSearch},
                  ...this.state.recentSearches,
                ],
              });
            }
            this.setState({
              isLoading: false,
              searchDone: false,
              textSearch: '',
              isDefaultSearchContentVisible: true,
            });
          }
        })
        .catch((error) => {
          console.log({...error});
          this.setState({searchDone: false});
          alert(error.response.data.message);
        });
    } else {
      alert("Product Name can't be empty!!");
    }
  };

  _onRemoveRecentSearchItem = async (recent_search_text) => {
    // console.log(recent_search_uuid);
    const value = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_REMOVE_RECENT_SEARCH_PRODUCT_KEY,
        {
          recent_search_text: recent_search_text,
        },
        {
          headers: {Authorization: `Bearer ${value}`},
        },
      )
      .then((response) => {
        // console.log(response);
        // alert(response.data.message);
        const indexOfSearchToBeRemoved = this.state.recentSearches
          .map((data) => {
            return data.search_text;
          })
          .indexOf(recent_search_text);
        this.state.recentSearches.splice(indexOfSearchToBeRemoved, 1);
        this.setState({recentSearches: this.state.recentSearches});
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
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
        const productsUUID = this.state.searchedItems.map((data) => data.uuid);
        this.state.searchedItems[productsUUID.indexOf(uuid)].wishlist = 1;
        this.state.searchedItems[productsUUID.indexOf(uuid)].wishlist_uuid =
          response.data.wishlist_uuid;
        this.setState({searchedItems: this.state.searchedItems});
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
        const productsUUID = this.state.searchedItems.map(
          (data) => data.wishlist_uuid,
        );
        this.state.searchedItems[
          productsUUID.indexOf(wishlist_uuid)
        ].wishlist = 0;
        this.setState({searchedItems: this.state.searchedItems});
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

  _renderProductList = ({item}) => {
    const {per_dollar_rate, currency_symbol} = currency_strings;
    return (
      <Pressable
        onPress={() =>
          this.props.navigation.navigate('Product', {productId: item.uuid})
        }>
        <View style={styles.CategoryListContainer}>
          <View style={styles.CategoryListInfoView}>
            <View style={styles.CategoryListImageContainer}>
              {item.images.length ? (
                <ImageBackground
                  source={{uri: item.images[0].image}}
                  style={{
                    ...styles.CategoryListImage,
                    backgroundColor: '#eeeeee',
                  }}
                  imageStyle={{borderRadius: 4, resizeMode: 'contain'}}>
                  {this.state.usr_token ? (
                    <IconButton
                      style={{backgroundColor: '#fff'}}
                      size={14}
                      color={item.wishlist === 0 ? '#000' : 'red'}
                      icon={item.wishlist === 0 ? 'heart-outline' : 'heart'}
                      onPress={
                        item.wishlist === 0
                          ? () => this._onMoveToWishListPress(item.uuid)
                          : () =>
                              this._onRemoveFromWishListPress(
                                item.wishlist_uuid,
                              )
                      }
                    />
                  ) : null}
                </ImageBackground>
              ) : (
                <View
                  style={{
                    ...styles.CategoryListImage,
                    backgroundColor: '#eeeeee',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {this.state.usr_token ? (
                    <IconButton
                      style={{
                        backgroundColor: '#fff',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                      size={14}
                      color={item.wishlist === 0 ? '#000' : 'red'}
                      icon={item.wishlist === 0 ? 'heart-outline' : 'heart'}
                      onPress={
                        item.wishlist === 0
                          ? () => this._onMoveToWishListPress(item.uuid)
                          : () =>
                              this._onRemoveFromWishListPress(
                                item.wishlist_uuid,
                              )
                      }
                    />
                  ) : null}
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
          {this.state.usr_token ? (
            <>
              <View
                style={{width: '100%', height: 1, backgroundColor: '#dddddd'}}
              />
              <Ripple
                onPress={() => this._onPressAddToCart(item.uuid)}
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
          ) : null}
        </View>
      </Pressable>
    );
  };

  _renderRecentSearchList = ({item}) => {
    return (
      <Chip
        style={{
          backgroundColor: 'white',
          margin: 8,
          marginRight: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={async () => {
          await this.setState({textSearch: item.search_text});
          this._onSearchPress();
        }}
        onClose={() => this._onRemoveRecentSearchItem(item.search_text)}>
        {item.search_text}
      </Chip>
    );
  };

  _defaultSearchContent = () => {
    return (
      <>
        <RecommendedProducts props={this.props} />
        <FavoriteCategory props={this.props} />
      </>
    );
  };

  _onFiltersClick = () => {
    this.setState({filterModalVisibility: !this.state.filterModalVisibility});
  };

  // _onRecentSearchesLoadMore = async () => {
  //     const { recentSearchNextPage } = this.state;
  //     if(recentSearchNextPage){
  //         // console.log(recentSearchNextPage);
  //         const token = await AsyncStorage.getItem('token');
  //         axios.get(recentSearchNextPage, {
  //             headers:{
  //                 Authorization: `Bearer ${token}`
  //             }
  //         })
  //         .then((response) => {
  //             // console.log(response);
  //             if(response.data.message !== ""){
  //                 this.setState({ recentSearches: [...this.state.recentSearches, ...response.data.message.data.reverse()], recentSearchNextPage: response.data.message.prev_page_url});
  //             }
  //         })
  //         .catch(err => {
  //             console.log({...err});
  //             alert(err.response.data.message);
  //         })
  //     }
  // }

  _onSearchedProductListLoadMore = async () => {
    const {searchedProductsNextPage} = this.state;
    if (searchedProductsNextPage) {
      const {textSearch} = this.state;
      const token = await AsyncStorage.getItem('token');
      axios
        .get(searchedProductsNextPage, {
          headers: {Authorization: `Bearer ${token}`},
          params: {product_name: textSearch},
        })
        .then((response) => {
          // console.log("top_product_data", response);
          if (response.data.products && response.data.products.data) {
            this.setState({
              searchedItems: [
                ...this.state.searchedItems,
                ...response.data.products.data,
              ],
              searchedProductsNextPage: response.data.products.next_page_url,
            });
          } else if (response.data.filter && response.data.filter.data) {
            this.setState({
              searchedItems: [
                ...this.state.searchedItems,
                ...response.data.filter.data,
              ],
              searchedProductsNextPage: response.data.filter.next_page_url,
            });
          }
        })
        .catch((error) => {
          console.log({...error});
          alert(error.response.data.message);
        });
    }
  };

  _sortingPickerSelectedValue = async (index, item_data) => {
    this.setState({searchDone: false, isLoading: true});

    let params = '';
    const token = await AsyncStorage.getItem('token');

    switch (index) {
      case 0:
        params = 'price_high_to_low';
        break;
      case 1:
        params = 'price_low_to_high';
        break;
      case 2:
        params = 'ratings';
        break;
      case 3:
        params = 'discounts';
        break;
      default:
        params = 'price_high_to_low';
        break;
    }

    let url = '';
    let headers = {};
    if (token) {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_SEARCH_WITH_FILTER_KEY;
      headers = {
        Authorization: `Bearer ${token}`,
      };
    } else {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + NO_AUTH_API_SEARCH_WITH_FILTER_KEY;
    }
    axios
      .get(url, {
        headers: headers,
        params: {
          product_name: this.state.textSearch,
          [params]: 1,
        },
      })
      .then((response) => {
        console.log('res = ', response);
        // if(response.data.filter.length){
        this.setState({
          sortingPickerSelectedText: item_data.name,
          searchedItems: response.data.filter.data,
          isLoading: false,
          searchedProductsNextPage: response.data.filter.next_page_url,
          searchDone: true,
        });
        // }
        // else{
        // alert("No Product Available for given specifications!");
        // this.setState({searchDone: true, isLoading: false });
        // }
      })
      .catch((err) => {
        console.log({...err});
        this.setState({isLoading: false});
        alert(err.response.data.message);
      });
  };

  _onViewableItemsChanged = ({viewableItems, changed}) => {
    console.log('Visible items are', changed);

    if (viewableItems[0].index === 0) {
      this.setState({sortingPickerToggle: true});
    } else if (viewableItems[0].index === 1) {
      this.setState({sortingPickerToggle: false});
    }
  };

  _productListHeaderComponent = (sortListData) => {
    return this.state.textSearch ? (
      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          width: '96%',
          alignSelf: 'center',
        }}>
        <RNPicker
          dataSource={sortListData}
          dummyDataSource={sortListData}
          defaultValue={false}
          pickerTitle={'Sorting Type'}
          showSearchBar={false}
          disablePicker={false}
          changeAnimation={'fade'}
          placeHolderLabel={this.state.sortingPickerSelectedText}
          selectedLabel={this.state.sortingPickerSelectedText}
          showPickerTitle={true}
          pickerStyle={styles.pickerStyle}
          placeHolderTextStyle={{color: '#000'}}
          selectedValue={(index, item) =>
            this._sortingPickerSelectedValue(index, item)
          }
        />
      </View>
    ) : null;
  };

  render() {
    let index = 0;
    const sortListData = [
      {
        id: index++,
        name: 'Price - High to Low',
      },
      {
        id: index++,
        name: 'Price - Low to High',
      },
      {
        id: index++,
        name: 'Popularity',
      },
      {
        id: index++,
        name: 'Discount',
      },
    ];

    return (
      <View style={{height: '100%'}}>
        <StatusBar barStyle={'dark-content'} backgroundColor="white" />
        <SafeAreaView></SafeAreaView>
        <View style={{...styles.fab, zIndex: 1000}}>
          <FAB
            icon={({color, size}) => (
              <Icon
                type="font-awesome"
                name={'filter'}
                color={color}
                size={size}
              />
            )}
            color="white"
            style={{backgroundColor: '#4285F4'}}
            onPress={() =>
              this.setState({
                filterModalVisibility: !this.state.filterModalVisibility,
              })
            }
          />
        </View>

        <View style={{marginTop: StatusBar.currentHeight}}>
          <Searchbar
            placeholder="Search"
            onChangeText={this._onChangeText}
            value={this.state.textSearch}
            onSubmitEditing={() => this._onSearchPress()}
            style={{
              borderRadius: 0,
              opacity: this.state.filterModalVisibility ? 0.2 : 1,
            }}
          />
        </View>

        {!this.state.isLoading ? (
          <>
            <Card
              style={{
                elevation: 2,
                backgroundColor: '#efefef',
                borderRadius: 0,
              }}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={this.state.recentSearches}
                renderItem={this._renderRecentSearchList}
                keyExtractor={(item, index) => `${index}`}
                key={'RecentSearchList'}
                contentContainerStyle={{paddingRight: 22}}
                // onEndReached={() => this._onRecentSearchesLoadMore()}
                // onEndReachedThreshold={0.1}
                ListFooterComponentStyle={{marginLeft: 10}}
                ListFooterComponent={
                  this.state.recentSearchNextPage ? (
                    <ActivityIndicator
                      size="small"
                      color="#8d8d8d"
                      style={{flex: 1}}
                    />
                  ) : null
                }
              />
            </Card>

            {this.state.isDefaultSearchContentVisible && (
              <FlatList
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={this._defaultSearchContent}
              />
            )}
          </>
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator color={'purple'} size={25} />
          </View>
        )}

        {this.state.isLoading && (
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
            <ActivityIndicator size={25} color="purple" />
          </View>
        )}

        {this.state.searchDone && (
          <>
            <View>
              <FlatList
                ref={(ref) => {
                  this.flatList = ref;
                }}
                ListHeaderComponent={() =>
                  this._productListHeaderComponent(sortListData)
                }
                showsVerticalScrollIndicator={false}
                data={this.state.searchedItems}
                renderItem={this._renderProductList}
                keyExtractor={(item) => `${item.uuid}`}
                contentContainerStyle={{paddingBottom: 300}}
                key={'SearchListView'}
                onEndReached={() => this._onSearchedProductListLoadMore()}
                onEndReachedThreshold={0.4}
                // onViewableItemsChanged={this._onViewableItemsChanged }
                viewabilityConfig={{itemVisiblePercentThreshold: 50}}
                ListFooterComponent={
                  this.state.searchedProductsNextPage ? (
                    <ActivityIndicator
                      size="small"
                      color="#8d8d8d"
                      style={{flex: 1, marginTop: 8}}
                    />
                  ) : null
                }
              />
            </View>
          </>
        )}

        <ModalComponent
          searchedProductsNextPage={(next_page_url) =>
            this.setState({searchedProductsNextPage: next_page_url})
          }
          onChangeSearchText={this._onChangeText}
          isDefaultSearchContentVisible={(boolean) =>
            this.setState({isDefaultSearchContentVisible: boolean})
          }
          searchedItemsStateChange={(filter_data) =>
            this.setState({searchedItems: filter_data})
          }
          searchDone={(boolean) => this.setState({searchDone: boolean})}
          textSearch={this.state.textSearch}
          onFiltersClick={() => this._onFiltersClick()}
          filterModalVisibility={this.state.filterModalVisibility}
        />
      </View>
    );
  }
}

class ModalComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filtersListData: [],
      setLowPriceRange: 100,
      setHighPriceRange: 2000,
      minPriceRange: 100,
      maxPriceRange: 2000,
      checkboxCheckedValue: {
        discount: 0,
        rating: 0,
      },
      isLoading: false,
    };
  }

  async componentDidMount() {
    const filtersListData = [
      {
        id: 0,
        name: 'Product',
      },
      {
        id: 1,
        name: 'Price Range',
      },
      {
        id: 2,
        name: 'Discount',
        options: [
          {name: '0% and above', value: 0},
          {name: '10% and above', value: 10},
          {name: '20% and above', value: 20},
          {name: '30% and above', value: 30},
          {name: '40% and above', value: 40},
          {name: '50% and above', value: 50},
          {name: '60% and above', value: 60},
          {name: '70% and above', value: 70},
          {name: '80% and above', value: 80},
          {name: '90% and above', value: 90},
        ],
      },
      {
        id: 3,
        name: 'Rating',
        options: [
          {name: '0.0 and above', value: 0},
          {name: '1.0 and above', value: 1},
          {name: '2.0 and above', value: 2},
          {name: '3.0 and above', value: 3},
          {name: '4.0 and above', value: 4},
        ],
      },
    ];
    this.setState({filtersListData: filtersListData});
  }

  _renderFiltersNameList = ({item, index}) => {
    return (
      <Ripple
        onPress={() => this._onFilterNamePress(index)}
        key={item.id}
        style={
          item.selected
            ? {...modals.filterName, backgroundColor: 'rgba(76, 139, 245, 0.2)'}
            : {...modals.filterName}
        }>
        <Text style={item.selected ? {color: '#4c8bf5'} : {color: '#8d8d8d'}}>
          {item.name}
        </Text>
      </Ripple>
    );
  };

  _onFilterNamePress = (index) => {
    const filtersList = this.state.filtersListData.map((item) => {
      item.selected = false;
      return item;
    });

    filtersList[index].selected = true;
    this.setState({filtersListData: filtersList});
  };

  _renderFiltersCheckboxList = ({item}) => {
    // console.log("sd",item.options);
    const item_name = item.name;
    if (item.selected) {
      switch (item.name) {
        case 'Price Range':
          return (
            <PriceRangeSlider
              setLow={(low) => {
                this.setState({setLowPriceRange: low});
                console.log(this.state.minPriceRange);
              }}
              setHigh={(high) => this.setState({setHighPriceRange: high})}
              low={this.state.setLowPriceRange}
              high={this.state.setHighPriceRange}
              min={this.state.minPriceRange}
              max={this.state.maxPriceRange}
            />
          );
        case 'Product':
          return (
            <View style={{padding: 10}}>
              <TextInput
                mode="flat"
                label="Product Name"
                autoCapitalize="sentences"
                value={this.props.textSearch}
                style={{backgroundColor: 'white'}}
                onChangeText={(email_or_phone) =>
                  this.props.onChangeSearchText(email_or_phone)
                }
                autoFocus={true}
              />
            </View>
          );
        default:
          return (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={item.options}
              renderItem={({item}) =>
                this._onRenderCheckboxFlatlist({item}, item_name)
              }
              keyExtractor={(item) => `${item.value}`}
              key={'Sort Type'}
              ListFooterComponentStyle={{marginTop: 8, marginBottom: 8}}
            />
          );
      }
    }
  };

  radioButtonStatus = (listName, value) => {
    switch (listName) {
      case 'Discount':
        return this.state.checkboxCheckedValue.discount === value
          ? 'checked'
          : 'unchecked';
      case 'Rating':
        return this.state.checkboxCheckedValue.rating === value
          ? 'checked'
          : 'unchecked';
    }
  };

  radioButtonOnPress = (listName, value) => {
    switch (listName) {
      case 'Discount':
        this.setState({
          checkboxCheckedValue: {
            ...this.state.checkboxCheckedValue,
            discount: value,
          },
        });
        break;
      case 'Rating':
        this.setState({
          checkboxCheckedValue: {
            ...this.state.checkboxCheckedValue,
            rating: value,
          },
        });
        break;
    }
  };

  _onRenderCheckboxFlatlist = ({item}, itemName) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <RadioButton
          status={this.radioButtonStatus(itemName, item.value)}
          onPress={() =>
            this.radioButtonOnPress(itemName, item.value, item.name)
          }
          color="#4285F4"
        />
        <Text>{item.name}</Text>
      </View>
    );
  };

  _onApplyPress = async () => {
    const {
      checkboxCheckedValue,
      setLowPriceRange,
      setHighPriceRange,
    } = this.state;
    if (this.props.textSearch) {
      this.setState({isLoading: true});
      const token = await AsyncStorage.getItem('token');
      let url = '';
      let headers = {};
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
            product_name: this.props.textSearch,
            rating_stars: checkboxCheckedValue.rating,
            price_range_from: setLowPriceRange,
            price_range_to: setHighPriceRange,
            discount: checkboxCheckedValue.discount,
          },
          headers: headers,
        })
        .then(async (res) => {
          console.log('resresresres', res);
          if (res.data.filter.data) {
            this.props.isDefaultSearchContentVisible(false);
            this.props.searchedItemsStateChange(res.data.filter.data);
            this.props.onFiltersClick();
            this.props.searchDone(true);
            this.setState({isLoading: false});
            this.props.searchedProductsNextPage(res.data.filter.next_page_url);
          } else {
            this.setState({isLoading: false});
            // this.props.onFiltersClick();
            alert('No Product Found!!');
          }
        })
        .catch((err) => {
          console.log({...err});
          this.setState({isLoading: false});
          alert(err.response.data.message);
        });
    } else {
      alert("Product name can't be empty!!");
    }
  };

  _onPressClearAll = () => {
    this.props.onChangeSearchText('');
    this.setState({
      checkboxCheckedValue: {
        ...this.state.checkboxCheckedValue,
        discount: 0,
        rating: 0,
        setLowPriceRange: 0,
        setHighPriceRange: 2000,
      },
    });
  };

  render() {
    return (
      <View
        style={{
          height: this.props.filterModalVisibility ? '100%' : null,
          width: this.props.filterModalVisibility ? '100%' : null,
          position: 'absolute',
          bottom: 0,
          left: 0,
          backgroundColor: this.props.filterModalVisibility
            ? 'rgba(0,0,0,0.5)'
            : null,
        }}>
        <SafeAreaView></SafeAreaView>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.props.filterModalVisibility}>
          <SafeAreaView style={{...modals.filterModalContainer}}>
            <View style={{...modals.modalHeader}}>
              <Text
                style={{
                  color: '#8d8d8d',
                  textTransform: 'uppercase',
                  marginLeft: 16,
                }}>
                Filters
              </Text>
              <Text
                style={{
                  color: 'red',
                  textTransform: 'uppercase',
                  marginRight: 16,
                }}
                onPress={() => this._onPressClearAll()}>
                Clear All
              </Text>
            </View>
            <View style={modals.filterModalBody}>
              <View style={modals.filterModalBodyOptions}>
                {this.state.filtersListData.find(
                  (filter) => filter.selected,
                ) === undefined ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {this.state.filtersListData.map((filterInfo, index) => (
                      <Pressable
                        key={filterInfo.id}
                        onPress={() => this._onFilterNamePress(index)}>
                        <View
                          style={
                            index == 0
                              ? {
                                  ...modals.filterName,
                                  backgroundColor: 'rgba(76, 139, 245, 0.2)',
                                }
                              : {...modals.filterName}
                          }>
                          <Text
                            style={
                              index == 0
                                ? {color: '#4c8bf5'}
                                : {color: '#8d8d8d'}
                            }>
                            {filterInfo.name}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={this.state.filtersListData}
                    renderItem={this._renderFiltersNameList}
                    keyExtractor={(item) => `${item.id}`}
                    key={'FiltersName'}
                  />
                )}
              </View>
              <View style={{...modals.filterModalBodyCheckboxes}}>
                {this.state.filtersListData.find(
                  (filter) => filter.selected,
                ) === undefined ? (
                  <View style={{padding: 10}}>
                    <TextInput
                      mode="flat"
                      label="Product Name"
                      autoCapitalize="sentences"
                      value={this.props.textSearch}
                      style={{backgroundColor: 'white'}}
                      onChangeText={(product_name) =>
                        this.props.onChangeSearchText(product_name)
                      }
                      autoFocus={true}
                    />
                  </View>
                ) : (
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={this.state.filtersListData}
                    renderItem={this._renderFiltersCheckboxList}
                    keyExtractor={(item) => `${item.id}`}
                    key={'FiltersCheckboxes'}
                    contentContainerStyle={{paddingTop: 20, paddingBottom: 30}}
                  />
                )}
              </View>
            </View>
            <View style={modals.filterModalFooter}>
              <Ripple
                style={{
                  width: '50%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={this.props.onFiltersClick}>
                <Text
                  style={{backgroundColor: 'yellow'}}
                  style={{color: 'red', textTransform: 'uppercase'}}>
                  Close
                </Text>
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
                onPress={() => this._onApplyPress()}>
                {this.state.isLoading ? (
                  <ActivityIndicator size={25} color="purple" />
                ) : (
                  <Text style={{color: '#8d8d8d', textTransform: 'uppercase'}}>
                    Apply
                  </Text>
                )}
              </Ripple>
            </View>
          </SafeAreaView>
        </Modal>
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
    marginRight: 4,
  },

  RecentlyAddedContainer: {
    marginLeft: 16,
    borderRadius: 4,
    height: 280,
    width: 180,
    backgroundColor: '#fff',
  },
  RecentlyAddedImageBackground: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
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

  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },

  pickerStyle: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
});

const modals = StyleSheet.create({
  filterModalContainer: {
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'column',
    elevation: 20,
  },
  modalHeader: {
    height: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },
  filterModalBody: {
    height: 250,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterModalBodyOptions: {
    height: '100%',
    width: '40%',
    backgroundColor: '#dddddd',
  },
  filterModalBodyCheckboxes: {
    height: '100%',
    width: '60%',
    backgroundColor: 'white',
  },
  filterModalFooter: {
    height: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        borderBottomColor: '#dddddd',
        borderBottomWidth: 1,
      },
    }),
    justifyContent: 'space-between',
    borderTopColor: '#dddddd',
  },
  filterName: {
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
});
