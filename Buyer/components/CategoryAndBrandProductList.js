import React, {Component} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ImageBackground,
  Dimensions,
  Modal,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Header, Icon, Button, Rating} from 'react-native-elements';
import {
  IconButton,
  Appbar,
  RadioButton,
  Badge,
  Searchbar,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_CATEGORY_PRODUCT_LIST_KEY,
  NO_AUTH_API_CATEGORY_PRODUCT_LIST_KEY,
  API_ADD_PRODUCT_TO_CART_KEY,
  NO_AUTH_API_FILTER_WITH_CATEGORY_AND_BRAND,
  API_ADD_PRODUCT_TO_WISHLIST_KEY,
  API_REMOVE_PRODUCT_FROM_WISHLIST_KEY,
  API_FILTER_WITH_CATEGORY_AND_BRAND,
  API_PRODUCT_CATEGORIES_KEY,
  API_GET_PRODUCT_HIGHEST_PRICE_KEY,
  API_PRODUCT_BRANDS_KEY,
  API_BRAND_PRODUCT_LIST_KEY,
  NO_AUTH_API_BRAND_PRODUCT_LIST_KEY,
  API_FILTER_WITH_CATEGORY,
  NO_AUTH_API_FILTER_WITH_CATEGORY,
  API_FILTER_WITH_BRAND,
  NO_AUTH_API_FILTER_WITH_BRAND,
} from '@env';
import PriceRangeSlider from './PriceRangeSlider/PriceRangeSlider';
import Ripple from 'react-native-material-ripple';
import {connect} from 'react-redux';
import {ToastAndroid} from 'react-native';
import {Card} from 'react-native-paper';
import {currency_strings} from '../locales';

const sortListData = [
  {
    id: 0,
    type: 'Price - High to Low',
  },
  {
    id: 1,
    type: 'Price - Low to High',
  },
  {
    id: 2,
    type: 'Popularity',
  },
  {
    id: 3,
    type: 'Discount',
  },
];

class HeaderIcons extends Component {
  _navigationFunc = (navigation) => {
    const {navigate} = this.props.navigation;
    navigate(navigation);
  };

  render() {
    return (
      <View style={{...styles.headerIconsView}}>
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
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'row',
            }}>
            <IconButton
              color="#fff"
              size={21}
              icon={'cart'}
              onPress={() => this._navigationFunc('AddToCartRoot')}
            />
            {this.props.cartTotal ? (
              <View style={{marginLeft: -16, marginTop: -15, marginRight: 9}}>
                <Badge
                  style={{
                    backgroundColor: 'red',
                    borderWidth: 0.5,
                    borderColor: '#fff',
                  }}
                  size={14}>
                  {this.props.cartTotal}
                </Badge>
              </View>
            ) : null}
          </View>
        </>
      </View>
    );
  }
}

const centerComponent = (props) => {
  return (
    <View style={{marginLeft: -10}}>
      <Text style={{color: '#fff', fontSize: 16, textTransform: 'capitalize'}}>
        {props.headerTitle.length > 26
          ? props.headerTitle.slice(0, 26) + '...'
          : props.headerTitle}
      </Text>
      {props.itemTotal && (
        <Text style={{color: '#fff', fontSize: 10}}>
          {props.itemTotal} Items
        </Text>
      )}
    </View>
  );
};

class HeaderBar extends Component {
  render() {
    const {categoryId} = this.props.route.params;
    return (
      <Header
        placement="left"
        leftComponent={
          <Appbar.BackAction
            color="#fff"
            onPress={() => this.props.navigation.goBack()}
          />
        }
        centerComponent={centerComponent({
          headerTitle:
            this.props.headerTitle ||
            `${categoryId ? 'Category' : 'Brand'} Products`,
          itemTotal: this.props.itemTotal,
        })}
        rightComponent={
          <HeaderIcons
            is_usr_logged_in={this.props.is_usr_logged_in}
            navigation={this.props.navigation}
            cartTotal={this.props.cartTotal.length}
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

const initialState = {
  filtersListData: [],
  sortListData: sortListData,

  gridViewToggle: false,
  filterModalVisibility: false,
  sortModalVisibility: false,

  productsList: [],
  nextProductPageNo: 2,
  nextPageLoader: false,

  isCategoryAndBrandFilterSearch: false,
  isCategoryAndBrandProductSearch: false,
  setLowPriceRange: 0,
  setHighPriceRange: 10000,
  minPriceRange: 0,
  maxPriceRange: 10000,
  checkboxCheckedValue: {
    selectedDiscount: 0,
    selectedRating: 0,
    selectedCategory: '',
    selectedBrand: '',
  },

  currentCategoryId: '',
  currentCategoryName: '',
  tempCategoryName: '',

  currentBrandId: '',
  currentBrandName: '',
  tempBrandName: '',

  categoryPaginatedNextURL: null,
  brandPaginatedNextURL: null,
  nextCategoryFilterCheckboxLoader: false,
  nextBrandFilterCheckboxLoader: false,

  isLoading: true,
  errorMessage: '',

  searchText: '',
  toggleSearchBar: false,

  usr_token: null,
};

class CategoryAndBrandProductList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...initialState,
    };
  }

  componentDidMount() {
    const {categoryId, brandId} = this.props.route?.params;

    if (categoryId) {
      this.setState({
        currentCategoryId: categoryId,
        currentCategoryName: this.props.route?.params.categoryName,
        tempCategoryName: this.props.route?.params.categoryName,
      });
    } else if (brandId) {
      this.setState({
        currentBrandId: brandId,
        currentBrandName: this.props.route?.params.brandName,
        tempBrandName: this.props.route?.params.brandName,
      });
    }

    this._getAllDataRequired();
    this._getProductMaxPrice();
  }

  _getProductMaxPrice = async () => {
    // const token = await AsyncStorage.getItem('token');
    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_PRODUCT_HIGHEST_PRICE_KEY)
      .then((res) => {
        this.setState({
          maxPriceRange: parseInt(res.data.max_product_price),
          setHighPriceRange: parseInt(res.data.max_product_price),
        });
      })
      .catch((err) => console.log(err));
  };

  _getAllDataRequired = async () => {
    const token = await AsyncStorage.getItem('token');
    this.setState({usr_token: token});
    const {categoryId, brandId} = this.props.route?.params;

    if (categoryId) {
      this.setState({
        checkboxCheckedValue: {
          ...this.state.checkboxCheckedValue,
          selectedCategory: categoryId,
        },
      });
    } else if (brandId) {
      this.setState({
        checkboxCheckedValue: {
          ...this.state.checkboxCheckedValue,
          selectedBrand: brandId,
        },
      });
    }

    const filtersListData = [
      {
        id: 0,
        name: 'Price Range',
        is_price_range_slider: true,
      },
      {
        id: 1,
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
        id: 2,
        name: 'Rating',
        options: [
          {name: '0.0 and above', value: 0},
          {name: '1.0 and above', value: 1},
          {name: '2.0 and above', value: 2},
          {name: '3.0 and above', value: 3},
          {name: '4.0 and above', value: 4},
        ],
      },
      {
        id: 3,
        name: 'Categories',
        options: [],
      },
      {
        id: 4,
        name: 'Brands',
        options: [],
      },
    ];

    const value = await AsyncStorage.getItem('token');
    const config = {
      headers: {Authorization: `Bearer ${value}`},
    };

    ////////!!!! -------------- Fetch all products of either a brand or a category -------------- !!!!/////////
    if (value) {
      if (categoryId) {
        await axios
          .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_CATEGORY_PRODUCT_LIST_KEY, {
            ...config,
            params: {category_uuid: categoryId},
          })
          .then((response) => {
            if (response.data.products.data.length === 0) {
              this.setState({
                errorMessage: 'Category Product List is Empty!!',
                isLoading: false,
              });
            } else {
              this.setState({
                productsList: response.data.products,
                isLoading: false,
              });
            }
          })
          .catch((error) => {
            this.setState({
              errorMessage: error.response.data.message,
              isLoading: false,
            });
            alert(error.response.data.message);
          });
      } else if (brandId) {
        await axios
          .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_BRAND_PRODUCT_LIST_KEY, {
            ...config,
            params: {brand_uuid: brandId},
          })
          .then((response) => {
            if (response.data.products.data.length === 0) {
              this.setState({
                errorMessage: 'Brand Product List is Empty!!',
                isLoading: false,
              });
            } else {
              this.setState({
                productsList: response.data.products,
                isLoading: false,
              });
            }
          })
          .catch((error) => {
            console.log({...err});
            this.setState({
              errorMessage: error.response.data.message,
              isLoading: false,
            });
            alert(error.response.data.message);
          });
      }
    } else {
      if (categoryId) {
        await axios
          .get(
            UNIVERSAL_ENTRY_POINT_ADDRESS +
              NO_AUTH_API_CATEGORY_PRODUCT_LIST_KEY,
            {
              params: {category_uuid: categoryId},
            },
          )
          .then((response) => {
            if (response.data.products.data.length === 0) {
              this.setState({
                errorMessage: 'Category Product List is Empty!!',
                isLoading: false,
              });
            } else {
              this.setState({
                productsList: response.data.products,
                isLoading: false,
              });
            }
          })
          .catch((error) => {
            this.setState({
              errorMessage: error.response.data.message,
              isLoading: false,
            });
            alert(error.response.data.message);
          });
      } else if (brandId) {
        await axios
          .get(
            UNIVERSAL_ENTRY_POINT_ADDRESS + NO_AUTH_API_BRAND_PRODUCT_LIST_KEY,
            {
              params: {brand_uuid: brandId},
            },
          )
          .then((response) => {
            if (response.data.products.data.length === 0) {
              this.setState({
                errorMessage: 'Brand Product List is Empty!!',
                isLoading: false,
              });
            } else {
              this.setState({
                productsList: response.data.products,
                isLoading: false,
              });
            }
          })
          .catch((error) => {
            console.log({...error});
            this.setState({
              errorMessage: error.response.data.message,
              isLoading: false,
            });
            alert(error.response.data.message);
          });
      }
    }
    ////////!!!! -------------- (EXIT) Fetch all products of either a brand or a category -------------- !!!/////////

    ///////!!!! ----------------- Fetch all categories and brands ---------------- !!!!///////////
    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_PRODUCT_CATEGORIES_KEY, config)
      .then((response) => {
        if (response.data.categories.data.length !== 0) {
          const filterCategoryOptions = response.data.categories.data.map(
            (item) => {
              return {name: item.category, value: item.uuid};
            },
          );
          filtersListData[3].options.push(...filterCategoryOptions);
          this.setState({
            categoryPaginatedNextURL: response.data.categories.next_page_url,
            filtersListData: filtersListData,
          });

          // Check the first radio button of all in categories section in filter products if no categoryId given
          if (!categoryId) {
            this.setState({
              checkboxCheckedValue: {
                ...this.state.checkboxCheckedValue,
                selectedCategory: filterCategoryOptions[0].value,
              },
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });

    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_PRODUCT_BRANDS_KEY, config)
      .then((response) => {
        if (response.data.brands.data.length !== 0) {
          const filterBrandOptions = response.data.brands.data.map((item) => {
            return {name: item.brand_name, value: item.uuid};
          });

          filtersListData[4].options.push(...filterBrandOptions);

          this.setState({
            brandPaginatedNextURL: response.data.brands.next_page_url,
            filtersListData: filtersListData,
          });

          // Check the first radio button of all in brands section in filter products if no brandId given
          if (!brandId) {
            this.setState({
              checkboxCheckedValue: {
                ...this.state.checkboxCheckedValue,
                selectedBrand: filterBrandOptions[0].value,
              },
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
    ///////!!!! ----------------- (EXIT) Fetch all categories and brands ----------------!!!! ///////////
  };

  // Wowweeeee, You can do even this in react..
  componentDidUpdate() {
    const {
      categoryId,
      categoryName,
      brandId,
      brandName,
    } = this.props.route?.params;
    const {currentCategoryId, currentCategoryName} = this.state;
    if (
      categoryId != currentCategoryId ||
      categoryName != currentCategoryName
    ) {
      this.setState({
        ...initialState,
        currentCategoryId: categoryId,
        currentCategoryName: categoryName,
        tempCategoryName: categoryName,

        currentBrandId: brandId,
        currentBrandName: brandName,
        tempBrandName: brandName,
      });
      this._getAllDataRequired();
    }
  }
  // (EXIT) - Wowweeeee, You can do even this in react..

  _gridViewToggle = () => {
    this.setState({gridViewToggle: !this.state.gridViewToggle});
  };

  _onFiltersClick = () => {
    this.setState({filterModalVisibility: !this.state.filterModalVisibility});
  };

  _onSortClick = () => {
    this.setState({sortModalVisibility: true});
  };

  _formatData = (data, numColumns) => {
    // console.log(data, numColumns);
    if (this.state.gridViewToggle) {
      const numOfFullRows = Math.floor(data.length / numColumns);
      let numOfElementsLastRow = data.length - numOfFullRows * numColumns;

      while (
        numOfElementsLastRow !== numColumns &&
        numOfElementsLastRow !== 0
      ) {
        data.push({
          id: '',
          uuid: `${Math.random()}`,
          image: '',
          product_name: '',
          highlights: '',
          total_ratings_count: 0,
          rating: 0,
          price_after_discount: 0,
          rating_stars: 0,
          discount: 0,
          actual_price: 0,
          category: '',
          empty: true,
        });
        numOfElementsLastRow++;
      }

      return data;
    } else {
      if (data.find((data) => data.empty === true) === undefined) {
        return data;
      } else {
        let indexOfEmptyView = data.indexOf(
          data.find((data) => data.empty === true),
        );
        data.splice(indexOfEmptyView, 1);
        return data;
      }
    }
  };

  _onPressAddToCart = async (product_uuid) => {
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
        if (!this.props.cartTotal.includes(product_uuid)) {
          this.props.changeCartTotalCount([
            ...this.props.cartTotal,
            product_uuid,
          ]);
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  _renderCategoryOrBrandProductList = ({item}) => {
    const {per_dollar_rate, currency_symbol} = currency_strings;
    return (
      <Pressable
        onPress={() =>
          this.props.navigation.push('Product', {productId: item.uuid})
        }>
        <View style={styles.CategoryListContainer}>
          <View style={styles.CategoryListInfoView}>
            <View style={styles.CategoryListImageContainer}>
              {item.image !== '' ? (
                <ImageBackground
                  source={{uri: item.image}}
                  style={{
                    ...styles.CategoryListImage,
                    backgroundColor: '#eeeeee',
                  }}
                  // imageStyle={{borderRadius: 4}}
                  imageStyle={{resizeMode: 'contain'}}>
                  {/* {this.state.usr_token ? ( */}
                  <IconButton
                    style={{backgroundColor: '#fff'}}
                    size={14}
                    color={
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? '#000'
                          : 'red'
                        : '#000'
                    }
                    icon={
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? 'heart-outline'
                          : 'heart'
                        : 'heart-outline'
                    }
                    onPress={() =>
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? this._onMoveToWishListPress(item.uuid)
                          : this._onRemoveFromWishListPress(item.wishlist_uuid)
                        : alert('Please Sign In')
                    }
                  />
                  {/* ) : null} */}
                </ImageBackground>
              ) : (
                <View
                  style={{
                    ...styles.CategoryListImage,
                    backgroundColor: '#eeeeee',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {/* {this.state.usr_token ? ( */}
                  <IconButton
                    style={{
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                    size={14}
                    color={
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? '#000'
                          : 'red'
                        : '#000'
                    }
                    icon={
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? 'heart-outline'
                          : 'heart'
                        : 'heart-outline'
                    }
                    onPress={() =>
                      this.state.usr_token
                        ? item.wishlist === 0
                          ? this._onMoveToWishListPress(item.uuid)
                          : this._onRemoveFromWishListPress(item.wishlist_uuid)
                        : alert('Please Sign In')
                    }
                  />
                  {/* ) : null} */}
                  <Text style={{color: 'red'}}>No Image</Text>
                </View>
              )}
            </View>
            <View style={{...styles.CategoryCenterContainer, flex: 1}}>
              <View>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontSize: 16,
                      flexShrink: 1,
                      textTransform: 'capitalize',
                    }}>
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
          <View
            style={{width: '100%', height: 1, backgroundColor: '#dddddd'}}
          />
          {/* <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:44}}> */}
          {/* {this.state.usr_token ? ( */}
          <Ripple
            onPress={() =>
              this.state.usr_token
                ? this._onPressAddToCart(item.uuid)
                : alert('Please Sign In')
            }
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
          {/* ) : null} */}
          {/* <View style={{width:1, height:'100%', backgroundColor:'#dddddd'}} /> */}
          {/* <IconButton size={20} style={{flex:1}} color={item.wishlist === 0 ? '#8d8d8d' : 'red'} icon={item.wishlist === 0 ? 'heart-outline' : 'heart'} onPress={item.wishlist === 0 ? () => this._onMoveToWishListPress(item.uuid) : () => this._onRemoveFromWishListPress(item.wishlist_uuid)} /> */}
          {/* </View> */}
        </View>
      </Pressable>
    );
  };

  _renderCategoryOrBrandProductGrid = ({item}) => {
    const {per_dollar_rate, currency_symbol} = currency_strings;
    return !item.empty ? (
      <View style={{...styles.CategoryGridContainer, overflow: 'hidden'}}>
        <Pressable
          onPress={() =>
            this.props.navigation.push('Product', {productId: item.uuid})
          }>
          <View style={styles.CategoryGridImageContainer}>
            <ImageBackground
              source={item.image !== '' ? {uri: item.image} : null}
              // imageStyle={{borderTopLeftRadius: 2, borderTopRightRadius: 2}}
              imageStyle={{resizeMode: 'contain'}}
              style={{...styles.CategoryGridImage, backgroundColor: '#eeeeee'}}>
              {item.image === '' && (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // backgroundColor: '#eeeeee',
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                  }}>
                  <Text style={{color: 'red', fontSize: 12}}>
                    No Image Available
                  </Text>
                </View>
              )}
              <View
                style={{
                  ...styles.userRatingContainer,
                  height: 24,
                  width: 80,
                  borderRadius: 2,
                  position: 'absolute',
                  bottom: 10,
                  backgroundColor: 'white',
                  elevation: 1,
                  left: 10,
                  alignSelf: 'flex-start',
                }}>
                <View
                  style={{
                    ...styles.userRatingContainerRateSection,
                    width: '60%',
                  }}>
                  <Text style={{fontSize: 12}}>
                    {item.rating_stars ? item.rating_stars : 0}
                  </Text>
                  <Icon
                    type="font-awesome"
                    name="star"
                    color={'orange'}
                    size={14}
                  />
                </View>
                <Text
                  style={{
                    ...styles.userRatingContainerUserCount,
                    fontSize: 12,
                    width: '40%',
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}>
                  {item.total_ratings_count}
                </Text>
              </View>

              {item.discount ? (
                <Card
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'red',
                    paddingVertical: 2,
                    paddingHorizontal: 4,
                    borderRadius: 2,
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{fontSize: 10, color: '#ffffff'}}>
                      {item.discount}% OFF
                    </Text>
                  </View>
                </Card>
              ) : null}
            </ImageBackground>

            <View style={{position: 'absolute', top: 0, left: 0}}>
              <IconButton
                style={{
                  backgroundColor: '#fff',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                size={16}
                color={
                  this.state.usr_token
                    ? item.wishlist === 0
                      ? '#000'
                      : 'red'
                    : '#000'
                }
                icon={
                  this.state.usr_token
                    ? item.wishlist === 0
                      ? 'heart-outline'
                      : 'heart'
                    : 'heart-outline'
                }
                onPress={() =>
                  this.state.usr_token
                    ? item.wishlist === 0
                      ? this._onMoveToWishListPress(item.uuid)
                      : this._onRemoveFromWishListPress(item.wishlist_uuid)
                    : alert('Please Sign In')
                }
              />
            </View>
          </View>

          <View
            style={{
              ...styles.CategoryGridProductInfo,
              justifyContent: 'space-between',
              height: '26%',
              width: '100%',
              paddingHorizontal: 8,
              paddingVertical: 6,
            }}>
            <Text
              style={{
                fontSize: 15,
                textTransform: 'capitalize',
                letterSpacing: 0.1,
                flex: 1,
                flexWrap: 'wrap',
              }}>
              {item.product_name.length > 18
                ? item.product_name.slice(0, 18) + '...'
                : item.product_name}
            </Text>
            <Text
              style={{
                color: '#8d8d8d',
                fontSize: 11,
                flex: 1,
                flexWrap: 'wrap',
              }}>
              {item.highlights.length > 30
                ? item.highlights.slice(0, 30) + '...'
                : item.highlights}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 2,
                flex: 1,
                flexWrap: 'wrap',
              }}>
              <Text style={{fontSize: 13}}>
                {/* ${item.price_after_discount} */}
                {`${currency_symbol}${(
                  item.price_after_discount * per_dollar_rate
                ).toFixed(2)}`}
              </Text>
              {item.discount ? (
                <Text
                  style={{
                    color: '#8d8d8d',
                    fontSize: 13,
                    marginLeft: 8,
                    textDecorationLine: 'line-through',
                    flex: 1,
                    flexWrap: 'wrap',
                  }}>
                  {/* {item.actual_price} */}
                  {`${currency_symbol}${(
                    item.actual_price * per_dollar_rate
                  ).toFixed(2)}`}
                </Text>
              ) : null}
              {/* {item.discount ? (
                item.actual_price.length > 9 &&
                item.price_after_discount.length > 9 ? null : (
                  <Text
                    style={{
                      fontSize: 12,
                      color: 'red',
                      marginLeft: 8,
                      flex: 1,
                      flexWrap: 'wrap',
                    }}>
                    -{item.discount}%
                  </Text>
                )
              ) : null} */}
            </View>
          </View>
        </Pressable>
      </View>
    ) : (
      <View
        style={{
          ...styles.CategoryGridContainer,
          backgroundColor: 'transparent',
          elevation: 0,
        }}></View>
    );
  };

  _onMoveToWishListPress = async (uuid) => {
    // console.log(uuid);
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
        // console.log(response);
        // alert(response.data.message);
        const productsUUID = this.state.productsList.data.map(
          (data) => data.uuid,
        );
        this.state.productsList.data[productsUUID.indexOf(uuid)].wishlist = 1;
        this.state.productsList.data[productsUUID.indexOf(uuid)].wishlist_uuid =
          response.data.wishlist_uuid;
        this.setState({productsList: this.state.productsList});
      })
      .catch((err) => {
        console.log({...err});
        if (err.response.status === 400) {
          alert('Product is already in the WishList!!');
        } else {
          alert(err);
        }
      });
  };

  _onRemoveFromWishListPress = async (wishlist_uuid) => {
    console.log(wishlist_uuid);
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
        const productsUUID = this.state.productsList.data.map(
          (data) => data.wishlist_uuid,
        );
        this.state.productsList.data[
          productsUUID.indexOf(wishlist_uuid)
        ].wishlist = 0;
        this.setState({productsList: this.state.productsList});
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  _renderSortList = ({item, index}) => {
    return (
      <Ripple
        key={index}
        onPress={() => this._onSortButtonPress(index)}
        style={{...modals.sortingType}}>
        <Text>{item.type}</Text>
      </Ripple>
    );
  };

  _renderFiltersNameList = ({item, index}) => {
    return (
      <Ripple
        onPress={() => this._onFilterNamePress(index)}
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

  _onRenderCheckboxFlatlist = ({item}, itemName) => {
    return (
      <Pressable
        style={{
          flexDirection: 'row',
          // justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: 10,
        }}
        onPress={() =>
          this.radioButtonOnPress(itemName, item.value, item.name)
        }>
        <RadioButton
          status={this.radioButtonStatus(itemName, item.value)}
          color="#4285F4"
          onPress={() =>
            this.radioButtonOnPress(itemName, item.value, item.name)
          }
        />
        <Text style={{textTransform: 'capitalize', flexShrink: 1}}>
          {item.name}
        </Text>
      </Pressable>
    );
  };

  _onLoadMoreCategories = async () => {
    this.setState({nextCategoryFilterCheckboxLoader: true});
    const {filtersListData} = this.state;
    const value = await AsyncStorage.getItem('token');
    const config = {
      headers: {Authorization: `Bearer ${value}`},
    };
    await axios
      .get(this.state.categoryPaginatedNextURL, config)
      .then((response) => {
        // console.log(response.data.categories);
        if (response.data.categories.data.length !== 0) {
          const filterCategoryOptions = response.data.categories.data.map(
            (item) => {
              return {name: item.category, value: item.uuid};
            },
          );
          filtersListData[3].options = [
            ...filtersListData[3].options,
            ...filterCategoryOptions,
          ];

          this.setState({
            filtersListData: filtersListData,
            categoryPaginatedNextURL: response.data.categories.next_page_url,
            nextCategoryFilterCheckboxLoader: false,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({nextCategoryFilterCheckboxLoader: false});
        alert(error);
      });
  };

  _onLoadMoreBrands = async () => {
    this.setState({nextBrandFilterCheckboxLoader: true});
    const {filtersListData} = this.state;
    const value = await AsyncStorage.getItem('token');
    const config = {
      headers: {Authorization: `Bearer ${value}`},
    };
    await axios
      .get(this.state.brandPaginatedNextURL, config)
      .then((response) => {
        if (response.data.brands.data.length !== 0) {
          const filterBrandOptions = response.data.brands.data.map((item) => {
            return {name: item.brand_name, value: item.uuid};
          });
          filtersListData[4].options = [
            ...filtersListData[4].options,
            ...filterBrandOptions,
          ];

          this.setState({
            filtersListData: filtersListData,
            brandPaginatedNextURL: response.data.brands.next_page_url,
            nextBrandFilterCheckboxLoader: false,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({nextBrandFilterCheckboxLoader: false});
        alert(error);
      });
  };

  _renderFiltersCheckboxList = ({item}) => {
    const item_name = item.name;
    if (item.selected) {
      if (item.is_price_range_slider) {
        return (
          <PriceRangeSlider
            setLow={(low) => this.setState({setLowPriceRange: low})}
            setHigh={(high) => this.setState({setHighPriceRange: high})}
            low={this.state.setLowPriceRange}
            high={this.state.setHighPriceRange}
            min={this.state.minPriceRange}
            max={this.state.maxPriceRange}
          />
        );
      }
      return (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={item.options}
          renderItem={({item}) =>
            this._onRenderCheckboxFlatlist({item}, item_name)
          }
          keyExtractor={(item, index) => `${index}`}
          key={'Sort Type'}
          onEndReached={() => {
            if (
              item_name === 'Categories' &&
              this.state.categoryPaginatedNextURL
            ) {
              this._onLoadMoreCategories();
            } else if (
              item_name === 'Brands' &&
              this.state.brandPaginatedNextURL
            ) {
              this._onLoadMoreBrands();
            }
          }}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            <View>
              {(item_name === 'Categories' &&
                this.state.nextCategoryFilterCheckboxLoader) ||
              (item_name == 'Brands' &&
                this.state.nextBrandFilterCheckboxLoader) ? (
                <ActivityIndicator size={'small'} color={'#8d8d8d'} />
              ) : null}
            </View>
          }
          ListFooterComponentStyle={{marginVertical: 8}}
        />
      );
    }
  };

  radioButtonStatus = (listName, value) => {
    switch (listName) {
      case 'Discount':
        return this.state.checkboxCheckedValue.selectedDiscount === value
          ? 'checked'
          : 'unchecked';
      case 'Rating':
        return this.state.checkboxCheckedValue.selectedRating === value
          ? 'checked'
          : 'unchecked';
      case 'Categories':
        return this.state.checkboxCheckedValue.selectedCategory === value
          ? 'checked'
          : 'unchecked';
      case 'Brands':
        return this.state.checkboxCheckedValue.selectedBrand === value
          ? 'checked'
          : 'unchecked';
    }
  };

  radioButtonOnPress = (listName, value, name) => {
    // console.log(listName, value, name);
    switch (listName) {
      case 'Discount':
        this.setState({
          checkboxCheckedValue: {
            ...this.state.checkboxCheckedValue,
            selectedDiscount: value,
          },
        });
        break;
      case 'Rating':
        this.setState({
          checkboxCheckedValue: {
            ...this.state.checkboxCheckedValue,
            selectedRating: value,
          },
        });
        break;
      case 'Categories':
        this.setState({
          checkboxCheckedValue: {
            ...this.state.checkboxCheckedValue,
            selectedCategory: value,
          },
          tempCategoryName: name,
        });
        break;
      case 'Brands':
        this.setState({
          checkboxCheckedValue: {
            ...this.state.checkboxCheckedValue,
            selectedBrand: value,
          },
          tempBrandName: name,
        });
        break;
    }
  };

  _onLoadMore = async (nextPageURL) => {
    const token = await AsyncStorage.getItem('token');
    let headers = {};
    if (token) {
      headers = {
        Authorization: `Bearer ${token}`,
        'content-type': `application/json`,
      };
    }
    if (nextPageURL) {
      this.setState({nextPageLoader: true});
      const url = nextPageURL;
      if (
        !this.state.isCategoryAndBrandFilterSearch &&
        !this.state.isCategoryAndBrandProductSearch
      ) {
        const {categoryId, brandId} = this.props.route?.params;
        let params = {};
        if (categoryId) {
          params = {category_uuid: categoryId};
        } else if (brandId) {
          params = {brand_uuid: brandId};
        }

        axios
          .get(url, {
            headers,
            params,
          })
          .then((response) => {
            console.log('response1 = ', response);
            var joinedData = [
              ...this.state.productsList.data,
              ...response.data?.products?.data,
            ];
            this.setState({
              productsList: {
                ...response.data.products,
                data: joinedData,
              },
            });

            this.setState((prevState) => {
              return {
                nextPageLoader: !prevState.nextPageLoader,
                // nextProductPageNo: prevState.nextProductPageNo + 1,
              };
            });
          })
          .catch((error) => {
            console.log(error);
            this.setState({nextPageLoader: false});
          });
      } else if (this.state.isCategoryAndBrandFilterSearch) {
        const {
          checkboxCheckedValue,
          setLowPriceRange,
          setHighPriceRange,
        } = this.state;
        axios
          .get(url, {
            headers,
            params: {
              category_uuid: checkboxCheckedValue.selectedCategory,
              brand_uuid: checkboxCheckedValue.selectedBrand,
              rating_stars: checkboxCheckedValue.selectedRating,
              price_range_from: setLowPriceRange,
              price_range_to: setHighPriceRange,
              discount: checkboxCheckedValue.selectedDiscount,
            },
          })
          .then((response) => {
            console.log('response2 = ', response);
            if (response.data?.filter?.data?.length) {
              var joinedData = [
                ...this.state.productsList.data,
                ...response.data?.filter?.data,
              ];
              this.setState({
                productsList: {...response.data.filter, data: joinedData},
              });
            } else {
              this.setState({
                isCategoryAndBrandFilterSearch: false,
              });
            }
            this.setState((prevState) => {
              return {
                nextPageLoader: !prevState.nextPageLoader,
              };
            });
          })
          .catch((err) => {
            console.log({...err});
            // alert(err);
            this.setState({
              nextPageLoader: false,
              isCategoryAndBrandFilterSearch: false,
            });
          });
      } else if (this.state.isCategoryAndBrandProductSearch) {
        const {categoryId, brandId} = this.props.route?.params;
        if (categoryId || brandId) {
          axios
            .get(url, {headers})
            .then((response) => {
              console.log('response3 = ', response);
              if (response.data?.filter?.data?.length) {
                if (response.data.filter.next_page_url) {
                  // Append nexPageURL parameters to next_page_url of response object
                  function getParameterByName(name, url = nextPageURL) {
                    name = name.replace(/[\[\]]/g, '\\$&');
                    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                      results = regex.exec(url);
                    if (!results) return null;
                    if (!results[2]) return '';
                    return decodeURIComponent(results[2].replace(/\+/g, ' '));
                  }
                  const category_uuid = getParameterByName('category_uuid');
                  const brand_uuid = getParameterByName('brand_uuid');
                  const product_name = getParameterByName('product_name');

                  if (category_uuid) {
                    response.data.filter.next_page_url += `&category_uuid=${category_uuid}&product_name=${product_name}`;
                  } else if (brand_uuid) {
                    response.data.filter.next_page_url += `&brand_uuid=${brand_uuid}&product_name=${product_name}`;
                  }
                }

                var joinedData = [
                  ...this.state.productsList.data,
                  ...response.data?.filter?.data,
                ];
                this.setState({
                  productsList: {...response.data.filter, data: joinedData},
                });
              } else {
                this.setState({
                  isCategoryAndBrandProductSearch: false,
                });
              }
              this.setState((prevState) => {
                return {
                  nextPageLoader: !prevState.nextPageLoader,
                };
              });
            })
            .catch((err) => {
              console.log({...err});
              this.setState({
                nextPageLoader: false,
                isCategoryAndBrandProductSearch: false,
              });
            });
        } else {
          this.setState({nextPageLoader: false});
        }
      } else {
        this.setState({nextPageLoader: false});
      }
    } else {
      this.setState({nextPageLoader: false});
    }
  };

  _onPressFilterSearch = async () => {
    const {
      checkboxCheckedValue,
      setLowPriceRange,
      setHighPriceRange,
      tempCategoryName,
    } = this.state;
    // console.log(checkboxCheckedValue, setLowPriceRange, setHighPriceRange);
    if (checkboxCheckedValue.selectedCategory !== '') {
      this.setState({
        isCategoryAndBrandProductSearch: false,
        isCategoryAndBrandFilterSearch: true,
        isLoading: true,
      });
      this._onFiltersClick();
      const token = await AsyncStorage.getItem('token');
      let url = '';
      let headers = {};
      if (token) {
        url =
          UNIVERSAL_ENTRY_POINT_ADDRESS + API_FILTER_WITH_CATEGORY_AND_BRAND;
        headers = {
          Authorization: `Bearer ${token}`,
          'content-type': `application/json`,
        };
      } else {
        url =
          UNIVERSAL_ENTRY_POINT_ADDRESS +
          NO_AUTH_API_FILTER_WITH_CATEGORY_AND_BRAND;
      }
      axios
        .get(url, {
          headers: headers,
          params: {
            category_uuid: checkboxCheckedValue.selectedCategory,
            brand_uuid: checkboxCheckedValue.selectedBrand,
            rating_stars: checkboxCheckedValue.selectedRating,
            price_range_from: setLowPriceRange,
            price_range_to: setHighPriceRange,
            discount: checkboxCheckedValue.selectedDiscount,
          },
        })
        .then((response) => {
          // console.log("response = ",response);
          if (response.data.filter.data.length !== 0) {
            this.setState({
              currentCategoryName: tempCategoryName,
              productsList: response.data.filter,
              isLoading: false,
            });
          } else {
            alert('No Product Available for given specifications!');
            this.setState({
              isCategoryAndBrandFilterSearch: false,
              isLoading: false,
            });
          }
        })
        .catch((err) => {
          console.log({...err});
          this.setState({
            isCategoryAndBrandFilterSearch: false,
            isLoading: false,
          });
          alert(err.response.data.message);
        });
    } else {
      alert('Please choose Category Option Properly!!');
      this._onFiltersClick();
    }
  };

  _onSortButtonPress = async (sorting_uuid) => {
    const {checkboxCheckedValue} = this.state;
    console.log(checkboxCheckedValue);

    if (
      checkboxCheckedValue.selectedCategory &&
      checkboxCheckedValue.selectedBrand
    ) {
      this.setState({
        sortModalVisibility: !this.state.sortModalVisibility,
        isLoading: true,
      });
      let params = '';
      const token = await AsyncStorage.getItem('token');

      switch (sorting_uuid) {
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
        url =
          UNIVERSAL_ENTRY_POINT_ADDRESS + API_FILTER_WITH_CATEGORY_AND_BRAND;
        headers = {
          Authorization: `Bearer ${token}`,
        };
      } else {
        url =
          UNIVERSAL_ENTRY_POINT_ADDRESS +
          NO_AUTH_API_FILTER_WITH_CATEGORY_AND_BRAND;
      }
      axios
        .get(url, {
          headers: headers,
          params: {
            category_uuid: checkboxCheckedValue.selectedCategory,
            brand_uuid: checkboxCheckedValue.selectedBrand,
            [params]: 1,
          },
        })
        .then((response) => {
          if (response.data.filter.data.length !== 0) {
            this.setState({
              productsList: response.data.filter,
              isLoading: false,
            });
          } else {
            alert('No Product Available for given specifications!');
            this.setState({
              isCategoryAndBrandFilterSearch: false,
              isLoading: false,
            });
          }
        })
        .catch((err) => {
          console.log({...err});
          this.setState({
            isCategoryAndBrandFilterSearch: false,
            isLoading: false,
          });
          alert(err.response.data.message);
        });
    } else {
      alert('Something has gone wrong.');
    }
  };

  _onSearchPress = async () => {
    const {categoryId, brandId} = this.props.route?.params;
    if (categoryId || brandId) {
      const {selectedCategory, selectedBrand} = this.state.checkboxCheckedValue;
      this.setState({
        isCategoryAndBrandFilterSearch: false,
        isCategoryAndBrandProductSearch: true,
        isLoading: true,
      });
      const token = await AsyncStorage.getItem('token');
      let url = '';
      let headers = {};
      let params = {};

      if (categoryId) {
        if (token) {
          url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_FILTER_WITH_CATEGORY;
        } else {
          url =
            UNIVERSAL_ENTRY_POINT_ADDRESS + NO_AUTH_API_FILTER_WITH_CATEGORY;
        }
        params = {
          category_uuid: selectedCategory,
          product_name: this.state.searchText,
        };
      } else if (brandId) {
        if (token) {
          url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_FILTER_WITH_BRAND;
        } else {
          url = UNIVERSAL_ENTRY_POINT_ADDRESS + NO_AUTH_API_FILTER_WITH_BRAND;
        }
        params = {
          brand_uuid: selectedBrand,
          product_name: this.state.searchText,
        };
      }

      if (token) {
        headers = {
          Authorization: `Bearer ${token}`,
        };
      }

      axios
        .get(url, {headers, params})
        .then((response) => {
          console.log('response = ', response);

          if (response.data.filter.data.length !== 0) {
            if (response.data.filter.next_page_url) {
              // Converts the params obj into string and append it into next_page_url
              const next_page_url_params_keys = Object.keys(params);
              let next_page_url_params_in_string = '';
              next_page_url_params_keys.map((key_name) => {
                next_page_url_params_in_string += `&${key_name}=${params[key_name]}`;
              });
              response.data.filter.next_page_url = `${response.data.filter.next_page_url}${next_page_url_params_in_string}`;
            }

            this.setState({
              productsList: response.data.filter,
              isLoading: false,
            });
          } else {
            alert('No Product Available for given specifications!');
            this.setState({
              isCategoryAndBrandProductSearch: false,
              isLoading: false,
            });
          }
        })
        .catch((err) => {
          console.log({...err});
          this.setState({
            isLoading: false,
            isCategoryAndBrandProductSearch: false,
          });
          // alert(err.response.data.message);
          ToastAndroid.showWithGravityAndOffset(
            err?.response?.status == 404
              ? 'No Product found for given specifications!'
              : err?.response?.data?.message,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
            25,
            50,
          );
        });
    }
  };

  _categoryListHeaderComponent = () => {
    return (
      <Searchbar
        style={{
          borderRadius: 0,
          opacity:
            this.state.filterModalVisibility || this.state.sortModalVisibility
              ? 0.2
              : 1,
        }}
        placeholder="Search"
        onChangeText={(searchText) => this.setState({searchText})}
        value={this.state.searchText}
        onSubmitEditing={this._onSearchPress}
      />
    );
  };

  // _handleScroll = (event) => {
  //     if(event.nativeEvent.contentOffset.y > 50){
  //         this.setState({ toggleSearchBar: false });
  //     }
  //     else if(event.nativeEvent.contentOffset.y < 50){
  //         this.setState({ toggleSearchBar: true });
  //     }
  // }

  render() {
    const {currentBrandName, currentCategoryName} = this.state;

    return (
      <View style={{height: '100%'}}>
        <HeaderBar
          {...this.props}
          is_usr_logged_in={this.state.usr_token ? true : false}
          headerTitle={currentCategoryName || currentBrandName}
          itemTotal={this.state.productsList.total}
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
                padding: 20,
              }}>
              <Text style={{color: '#8d8d8d', textAlign: 'center'}}>
                {this.state.errorMessage}
              </Text>
            </View>
          ) : (
            <>
              {/* {this.state.toggleSearchBar ? this._categoryListHeaderComponent() : null} */}
              {this._categoryListHeaderComponent()}
              <FlatList
                // onScroll={this._handleScroll}
                showsVerticalScrollIndicator={false}
                data={this._formatData(
                  this.state.productsList.data,
                  this.state.gridViewToggle ? 2 : 1,
                )}
                extraData={this.state.productsList.data}
                renderItem={
                  !this.state.gridViewToggle
                    ? ({item}) => this._renderCategoryOrBrandProductList({item})
                    : this._renderCategoryOrBrandProductGrid
                }
                keyExtractor={(item) => `${item.uuid}`}
                ListFooterComponent={
                  this.state.nextPageLoader ? (
                    <ActivityIndicator size="small" color="#8d8d8d" />
                  ) : (
                    <></>
                  )
                }
                ListFooterComponentStyle={{marginTop: 10}}
                contentContainerStyle={{
                  paddingTop: !this.state.gridViewToggle ? 4 : 2,
                  paddingBottom: 80,
                }}
                numColumns={!this.state.gridViewToggle ? 1 : 2}
                key={!this.state.gridViewToggle ? 'ListView' : 'GridView'}
                columnWrapperStyle={
                  !this.state.gridViewToggle
                    ? null
                    : {justifyContent: 'space-evenly'}
                }
                onEndReached={() => {
                  if (!this.state.nextPageLoader) {
                    this._onLoadMore(this.state.productsList.next_page_url);
                  }
                }}
                onEndReachedThreshold={0.1}
              />
            </>
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
            <ActivityIndicator size={25} color="purple" />
          </View>
        )}

        {!this.state.isLoading && this.state.errorMessage == '' ? (
          <View
            style={{
              width: '100%',
              backgroundColor: 'white',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopColor: '#dddddd',
              borderTopWidth: 0.6,
              ...Platform.select({ios: {paddingBottom: 30}}),
            }}>
            <Button
              containerStyle={{
                height: 50,
                width: '33%',
                ...Platform.select({
                  ios: {borderBottomColor: '#dddddd', borderBottomWidth: 1},
                }),
              }}
              buttonStyle={{height: '100%', width: '100%'}}
              type="clear"
              onPress={() => this._gridViewToggle()}
              icon={
                <Icon
                  type="font-awesome"
                  name={!this.state.gridViewToggle ? 'th-large' : 'list'}
                  size={20}
                  color="#8d8d8d"
                />
              }
              titleStyle={{color: '#8d8d8d'}}
            />
            <View
              style={{
                borderLeftWidth: 1,
                borderLeftColor: '#dddddd',
                height: 50,
                ...Platform.select({
                  ios: {borderBottomColor: '#dddddd', borderBottomWidth: 1},
                }),
              }}
            />
            <Button
              onPress={() => this._onSortClick()}
              containerStyle={{
                height: 50,
                width: '33%',
                ...Platform.select({
                  ios: {borderBottomColor: '#dddddd', borderBottomWidth: 1},
                }),
              }}
              buttonStyle={{height: '100%', width: '100%'}}
              type="clear"
              icon={
                <Icon
                  type="font-awesome"
                  name={'sort-amount-desc'}
                  size={18}
                  color="#8d8d8d"
                />
              }
              title="Sort"
              titleStyle={{color: '#8d8d8d', marginLeft: 14}}
            />
            <View
              style={{
                borderLeftWidth: 1,
                borderLeftColor: '#dddddd',
                height: 50,
                ...Platform.select({
                  ios: {borderBottomColor: '#dddddd', borderBottomWidth: 1},
                }),
              }}
            />
            <Button
              onPress={() => this._onFiltersClick()}
              containerStyle={{
                height: 50,
                width: '33%',
                ...Platform.select({
                  ios: {borderBottomColor: '#dddddd', borderBottomWidth: 1},
                }),
              }}
              buttonStyle={{height: '100%', width: '100%'}}
              type="clear"
              icon={
                <Icon
                  type="font-awesome"
                  name={'filter'}
                  size={20}
                  color="#8d8d8d"
                />
              }
              title="Filter"
              titleStyle={{color: '#8d8d8d', marginLeft: 14}}
            />
          </View>
        ) : null}

        <View
          style={{
            height:
              this.state.filterModalVisibility || this.state.sortModalVisibility
                ? '100%'
                : null,
            width:
              this.state.filterModalVisibility || this.state.sortModalVisibility
                ? '100%'
                : null,
            position: 'absolute',
            bottom: 0,
            left: 0,
            backgroundColor:
              this.state.filterModalVisibility || this.state.sortModalVisibility
                ? 'rgba(0,0,0,0.5)'
                : null,
          }}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.filterModalVisibility}>
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
                  }}>
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
                      keyExtractor={(item, index) => `${index}`}
                      key={'FiltersName'}
                    />
                  )}
                </View>
                <View style={{...modals.filterModalBodyCheckboxes}}>
                  {this.state.filtersListData.find(
                    (filter) => filter.selected,
                  ) === undefined ? (
                    <View style={{paddingTop: 20, paddingBottom: 30}}>
                      <PriceRangeSlider
                        setLow={(low) => this.setState({setLowPriceRange: low})}
                        setHigh={(high) =>
                          this.setState({setHighPriceRange: high})
                        }
                        low={this.state.setLowPriceRange}
                        high={this.state.setHighPriceRange}
                        min={this.state.minPriceRange}
                        max={this.state.maxPriceRange}
                      />
                    </View>
                  ) : (
                    <FlatList
                      showsVerticalScrollIndicator={false}
                      data={this.state.filtersListData}
                      renderItem={this._renderFiltersCheckboxList}
                      keyExtractor={(item, index) => `${index}`}
                      key={'FiltersCheckboxes'}
                      contentContainerStyle={{
                        paddingTop: 20,
                        paddingBottom: 30,
                      }}
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
                  onPress={() => this._onFiltersClick()}>
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
                  onPress={() => this._onPressFilterSearch()}>
                  <Text style={{color: '#8d8d8d', textTransform: 'uppercase'}}>
                    Apply
                  </Text>
                </Ripple>
              </View>
            </SafeAreaView>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.sortModalVisibility}>
            <SafeAreaView style={{...modals.sortModalContainer}}>
              <View
                style={{
                  ...modals.modalHeader,
                  backgroundColor: 'white',
                  elevation: 2,
                }}>
                <Text
                  style={{
                    color: '#8d8d8d',
                    textTransform: 'uppercase',
                    marginLeft: 16,
                  }}>
                  Sort By
                </Text>
                <Ripple
                  onPress={() =>
                    this.setState({
                      sortModalVisibility: !this.state.sortModalVisibility,
                    })
                  }
                  style={{
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'red',
                      textTransform: 'uppercase',
                      paddingRight: 20,
                      paddingLeft: 40,
                    }}>
                    Close
                  </Text>
                </Ripple>
              </View>
              <View
                style={{
                  ...modals.sortModalBody,
                  ...Platform.select({
                    ios: {borderBottomWidth: 1, borderBottomColor: '#dddddd'},
                  }),
                }}>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={this.state.sortListData}
                  renderItem={this._renderSortList}
                  // keyExtractor={item => item.id}
                  keyExtractor={(item, index) => `${index}`}
                  key={'Sort Type'}
                />
              </View>
            </SafeAreaView>
          </Modal>
        </View>
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
    marginTop: 4,
    marginBottom: 4,
    justifyContent: 'center',
  },
  CategoryListImageContainer: {
    justifyContent: 'center',
  },
  CategoryListImage: {
    height: 130,
    width: 108,
    // width:110,
    marginLeft: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  CategoryListInfoView: {
    flexDirection: 'row',
  },
  CategoryCenterContainer: {
    // marginLeft:18,
    // marginLeft:16,
    marginHorizontal: 16,
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: 130,
    marginVertical: 8,
    // paddingVertical:8,
    alignSelf: 'center',
  },
  userRatingContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 32,
    alignItems: 'center',
    // width:100,
    // borderWidth:0.4,
    // borderColor:'#dddddd'
  },
  userRatingContainerRateSection: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'baseline',
    // width:60
  },
  userRatingContainerUserCount: {
    paddingTop: 6,
    paddingBottom: 6,
    // width:40,
    textAlign: 'center',
    borderLeftWidth: 0.8,
    borderLeftColor: '#dddddd',
  },
  itemPricingContainer: {
    flexDirection: 'row',
    // width:80,
    // marginBottom:10,
  },
  // CategoryRightLeftView:{
  //     alignSelf:'flex-end',
  //     position:'absolute',
  //     justifyContent:'space-between',
  //     paddingRight:10,
  //     height:'100%'
  // },

  CategoryGridContainer: {
    maxWidth: Dimensions.get('window').width / 2,
    height: 260,
    width: '47.8%',
    backgroundColor: 'white',
    elevation: 1,
    marginTop: 4,
    marginBottom: 2,
    borderRadius: 2,
  },
  CategoryGridImageContainer: {
    height: '74%',
    width: '100%',
  },
  CategoryGridImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  CategoryGridInfo: {
    flexDirection: 'row',
    height: '26%',
    justifyContent: 'space-around',
    alignItems: 'center',
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
    height: 260,
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

  sortModalContainer: {
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'column',
    elevation: 20,
  },

  sortModalBody: {
    height: 250,
  },
  sortingType: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f6f6f6',
  },
});

const mapStateToProps = (state) => {
  return {
    cartTotal: state.cartTotal,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeCartTotalCount: (cartTotal) => {
      dispatch({type: 'CHANGE_CART_TOTAL', payload: cartTotal});
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CategoryAndBrandProductList);
