import React, {Component} from 'react';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_SINGLE_PRODUCT_DETAILS_KEY,
  API_REMOVE_PRODUCT_FROM_WISHLIST_KEY,
  API_SINGLE_PRODUCT_IMAGES_KEY,
  API_ADD_PRODUCT_TO_CART_KEY,
  API_ADD_PRODUCT_TO_WISHLIST_KEY,
  API_CATEGORY_PRODUCT_LIST_KEY,
  NO_AUTH_API_CATEGORY_PRODUCT_LIST_KEY,
  NO_AUTH_API_SINGLE_PRODUCT_DETAILS_KEY,
} from '@env';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  FlatList,
  ImageBackground,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {Header, Icon} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {
  Button,
  Appbar,
  IconButton,
  Badge,
  Card,
  TextInput,
} from 'react-native-paper';
import {currency_strings} from '../locales';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {connect} from 'react-redux';
import {ToastAndroid, Modal} from 'react-native';
const {width: screenWidth} = Dimensions.get('window');
import {SwipeRating} from './rating-stars';
import ImageView from 'react-native-image-viewing';
import {Platform} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

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
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'row',
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
              onPress={() => this.props.navigation.push('AddToCartRoot')}
              style={{marginRight: 0}}
            />
            <View style={{marginLeft: -10, marginTop: -15, marginRight: 9}}>
              {this.props.cartTotal ? (
                <Badge
                  style={{
                    backgroundColor:
                      this.props.cartTotal !== 0 ? 'red' : 'transparent',
                    borderWidth: 0.5,
                    borderColor:
                      this.props.cartTotal !== 0 ? '#fff' : 'transparent',
                  }}
                  size={14}>
                  {this.props.cartTotal}
                </Badge>
              ) : null}
            </View>
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
          text: 'Product',
          style: {
            color: '#fff',
            marginLeft: -10,
            fontSize: 16,
            letterSpacing: 0.8,
          },
        }}
        rightComponent={
          <HeaderIcons
            navigation={this.props.navigation}
            cartTotal={this.props.cartTotal}
            is_usr_logged_in={this.props.is_usr_logged_in}
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

const ImageViewer = (props) => {
  const [index, setIndex] = React.useState(props.index + 1);

  return (
    <ImageView
      images={props.images}
      imageIndex={props.index}
      onImageIndexChange={(index) => setIndex(index + 1)}
      visible={props.visible}
      onRequestClose={() => props.setIsVisible()}
      swipeToCloseEnabled={false}
      FooterComponent={() => {
        return (
          <Text
            style={{
              color: '#fff',
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 20,
            }}>{`${index}/${props.images.length}`}</Text>
        );
      }}
      presentationStyle={
        Platform.OS === 'android' ? 'overFullScreen' : 'fullScreen'
      }
    />
  );
};

class ImageSwiper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSlide: 0,

      product_imgs_for_viewer: [],

      toggle_image_viewer: false,
      image_viewer_index: 0,
    };
  }

  _onImagePress = (index) => {
    let product_imgs_for_viewer = [];
    this.props.productImages.map((item) => {
      product_imgs_for_viewer = [...product_imgs_for_viewer, {uri: item.image}];
    });
    this.setState({
      product_imgs_for_viewer,
      image_viewer_index: index,
      toggle_image_viewer: true,
    });
  };

  _renderItem = ({item, index}, parallaxProps) => {
    return (
      <Pressable
        key={index}
        style={styles.item}
        onPress={() => this._onImagePress(index)}>
        <Image
          source={{uri: item.image}}
          style={{...styles.image, resizeMode: 'contain'}}
        />
      </Pressable>
    );
  };

  get pagination() {
    const {activeSlide} = this.state;
    return (
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          padding: 8,
          borderRadius: 50,
          elevation: 1,
          marginVertical: 10,
        }}>
        {this.props.productImages.map((data, index) => {
          return (
            <Card
              key={index}
              style={{
                height: 6,
                width: 6,
                borderRadius: 6,
                backgroundColor: index === activeSlide ? '#4285F4' : '#ffffff',
                marginLeft: 4,
                marginRight: 4,
                borderWidth: 0.5,
                borderColor: '#4285F4',
              }}
            />
          );
        })}
      </View>
    );
  }

  render() {
    return this.props.productImages.length !== 0 ? (
      <>
        <View
          style={{
            borderBottomWidth: this.props.productImages.length > 1 ? 0.5 : 0,
            borderBottomColor:
              this.props.productImages.length > 1 ? '#dddddd' : null,
          }}>
          <Carousel
            data={this.props.productImages}
            renderItem={this._renderItem}
            sliderWidth={screenWidth}
            sliderHeight={screenWidth}
            itemWidth={screenWidth}
            hasParallaxImages={true}
            autoplay
            onSnapToItem={(index) => this.setState({activeSlide: index})}
          />
        </View>
        {this.props.productImages.length > 1 ? this.pagination : null}
        <ImageViewer
          index={this.state.image_viewer_index}
          setIsVisible={() => this.setState({toggle_image_viewer: false})}
          visible={this.state.toggle_image_viewer}
          images={this.state.product_imgs_for_viewer}
        />
      </>
    ) : (
      <View
        style={{
          height: 220,
          width: screenWidth,
          backgroundColor: '#eeeeee',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{color: 'red'}}>No Image Available</Text>
      </View>
    );
  }
}

const ListHeaderComponent = (props) => {
  const productSpecifications =
    props.singleProductDetails.product_specifications;
  const [cartTotalCount, setCartTotalCount] = React.useState(1);
  const [toggleTextInputLimit, setToggleTextInputLimit] = React.useState(1);
  const [
    productDescWrappingLimit,
    setProductDescWrappingLimit,
  ] = React.useState(120);
  const [openCartTotalInputField, setCartTotalInputFieldBool] = React.useState(
    false,
  );
  const [
    toggleCustomerReviewSection,
    setCustomerReviewVisibility,
  ] = React.useState(false);
  const rating_star_ranges = [
    {
      range: [0, 1],
    },
    {
      range: [1, 2],
    },
    {
      range: [2, 3],
    },
    {
      range: [3, 4],
    },
    {
      range: [4, 5],
    },
  ];

  rating_star_ranges.map((rating_range) => {
    let rating_range_count = 0;
    props.singleProductDetails.product_ratings.map((rating_info) => {
      const {range} = rating_range;
      if (rating_info.stars >= range[0] && rating_info.stars <= range[1]) {
        rating_range_count++;
      }
    });
    rating_range.count_in_percentage =
      rating_range_count &&
      Math.round(
        (rating_range_count / props.singleProductDetails.total_ratings_count) *
          100,
      );
    rating_range.count = rating_range_count;
  });

  const _onAddToCart = async () => {
    const value = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_ADD_PRODUCT_TO_CART_KEY,
        {
          product_uuid: props.singleProductDetails.uuid,
          quantity: cartTotalCount,
        },
        {
          headers: {Authorization: `Bearer ${value}`},
        },
      )
      .then((response) => {
        // console.log("response = ", response);
        alert(response.data.message);
        if (
          !props.cartTotalModification.cartTotal.includes(
            props.singleProductDetails.uuid,
          )
        ) {
          props.cartTotalModification.changeCartTotalCount([
            ...props.cartTotalModification.cartTotal,
            props.singleProductDetails.uuid,
          ]);
        }
        // console.log(props.cartTotalModification.cartTotal);
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  const _onAddToWishList = async () => {
    const value = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_ADD_PRODUCT_TO_WISHLIST_KEY,
        {
          product_uuid: props.singleProductDetails.uuid,
        },
        {
          headers: {Authorization: `Bearer ${value}`},
        },
      )
      .then((response) => {
        // console.log(response.data.wishlist_uuid);
        // alert(response.data.message);
        props.addedToWishlist(response.data.wishlist_uuid);
      })
      .catch((err) => {
        // console.log("errr")
        if (JSON.stringify(err) !== '{}') {
          console.log({...err});
          if (err.response.status === 400) {
            alert('Product is already in the WishList!!');
          } else {
            alert(err.response.data.message);
          }
        }
      });
  };

  const _onRemoveFromWishList = async (wishlist_uuid) => {
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
        props.removedFromWishlist();
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  const _toastMessage = (message) => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  const _dateFormatter = (date) => {
    const date_obj = new Date(date);

    var month = '';
    switch (date_obj.getMonth()) {
      case 0:
        month = 'January';
        break;
      case 1:
        month = 'Febuary';
        break;
      case 2:
        month = 'March';
        break;
      case 3:
        month = 'April';
        break;
      case 4:
        month = 'May';
        break;
      case 5:
        month = 'June';
        break;
      case 6:
        month = 'July';
        break;
      case 7:
        month = 'August';
        break;
      case 8:
        month = 'September';
        break;
      case 9:
        month = 'Ocotober';
        break;
      case 10:
        month = 'November';
        break;
      case 11:
        month = 'December';
        break;
    }

    const splitted_date = `${date_obj}`.split(' ');
    return month + ' ' + splitted_date[2] + ', ' + splitted_date[3];
  };

  const {per_dollar_rate, currency_symbol} = currency_strings;
  return (
    <View>
      <ImageSwiper productImages={props.productImages} />
      <View style={{width: '100%', backgroundColor: 'white', padding: 10}}>
        <Text
          style={{
            textTransform: 'uppercase',
            fontWeight: '700',
            marginLeft: 10,
            marginTop: 4,
          }}>
          {props.singleProductDetails.product_name}
        </Text>
        <Text
          style={{
            color: '#8d8d8d',
            fontSize: 12,
            marginLeft: 10,
            marginTop: 0,
          }}>
          {props.singleProductDetails.highlights}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 10,
            marginTop: 8,
          }}>
          <Text style={{fontWeight: '700'}}>
            {/* ${props.singleProductDetails.price_after_discount} */}
            {`${currency_symbol}${(
              props.singleProductDetails.price_after_discount * per_dollar_rate
            ).toFixed(2)}`}
          </Text>
          <Text
            style={{
              color: '#8d8d8d',
              textDecorationLine: 'line-through',
              marginLeft: 10,
            }}>
            {/* ${props.singleProductDetails.actual_price} */}
            {`${currency_symbol}${(
              props.singleProductDetails.actual_price * per_dollar_rate
            ).toFixed(2)}`}
          </Text>
          {props.singleProductDetails.discount ? (
            <Text style={{color: 'purple', marginLeft: 10}}>
              ({props.singleProductDetails.discount}% Off)
            </Text>
          ) : null}
        </View>
        <View
          style={{
            marginLeft: 10,
            marginTop: 8,
          }}>
          {props.singleProductDetails.category?.category ? (
            <Text style={{textTransform: 'capitalize'}}>
              <Text style={{fontWeight: '700'}}>Category: </Text>
              {props.singleProductDetails.category.category}
            </Text>
          ) : null}
        </View>

        <View
          style={{
            marginLeft: 10,
            marginTop: 8,
          }}>
          {props.singleProductDetails.brand?.brand_name ? (
            <Text style={{textTransform: 'capitalize'}}>
              <Text style={{fontWeight: '700'}}>Brand: </Text>
              {props.singleProductDetails.brand.brand_name}
            </Text>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 10,
            marginTop: 8,
          }}>
          <View>
            <SwipeRating
              imageSize={18}
              ratingCount={5}
              readonly
              startingValue={
                props.singleProductDetails.rating_stars
                  ? props.singleProductDetails.rating_stars
                  : 0
              }
            />
          </View>
          <View style={{marginLeft: 6}}>
            <Text style={{color: '#8d8d8d'}}>
              ({props.singleProductDetails.total_ratings_count})
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.productDetailsCard}>
        <View>
          <Text style={styles.productDetailsCardHeader}>Product Details</Text>
          {props.singleProductDetails.details.length >
          productDescWrappingLimit ? (
            <Pressable
              onPress={() =>
                setProductDescWrappingLimit(productDescWrappingLimit + 160)
              }>
              <Text style={{color: '#8d8d8d'}}>
                {props.singleProductDetails.details.slice(
                  0,
                  productDescWrappingLimit,
                )}{' '}
                <Text style={{color: '#4285F4'}}>more</Text>
              </Text>
            </Pressable>
          ) : (
            <Text style={{color: '#8d8d8d'}}>
              {props.singleProductDetails.details}
            </Text>
          )}
        </View>
      </View>

      {productSpecifications ? (
        <View style={{...styles.productDataCardAdditionalInfo}}>
          <Text style={styles.productAdditionalInfoCardHeader}>
            Product Additional Information
          </Text>
          <View style={{marginTop: 8, borderWidth: 1, borderColor: '#dddddd'}}>
            {productSpecifications.map((data, index) => {
              return (
                <View
                  key={index}
                  style={{
                    ...styles.productDataCardAdditionalInfoList,
                    borderBottomWidth:
                      index === productSpecifications.length - 1 ? 0 : 1,
                    borderColor: '#dddddd',
                  }}>
                  <View
                    style={{...styles.productDataCardAdditionalInfoListHeader}}>
                    <Text style={{textTransform: 'capitalize'}}>
                      {data.specification_key}
                    </Text>
                  </View>
                  <View
                    style={{
                      ...styles.productDataCardAdditionalInfoListHeaderInfo,
                    }}>
                    <Text style={{textTransform: 'capitalize'}}>
                      {data.specification_value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {props.singleProductDetails.in_stock === 0 && (
        <Button
          color={'red'}
          icon="shopping"
          mode="contained"
          style={{width: '90%', alignSelf: 'center', marginTop: 20}}>
          Out Of Stock
        </Button>
      )}

      {props.singleProductDetails.in_stock !== 0 && (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '90%',
              justifyContent: 'flex-start',
              alignSelf: 'center',
              marginTop: 30,
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 18, marginRight: 10}}>
              Quantity:{' '}
            </Text>
            {Math.abs(cartTotalCount - toggleTextInputLimit) < 5 &&
            !openCartTotalInputField ? (
              <Card style={{borderRadius: 100}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <IconButton
                    onPress={() => {
                      if (cartTotalCount > 1) {
                        setCartTotalCount(cartTotalCount - 1);
                      }
                    }}
                    icon="minus"
                    size={18}
                    style={{backgroundColor: '#eeeeee'}}
                  />
                  <Pressable
                    onPress={() => setCartTotalInputFieldBool(true)}
                    style={{marginHorizontal: 8}}>
                    <Text>{cartTotalCount}</Text>
                  </Pressable>
                  <IconButton
                    onPress={() => {
                      if (
                        cartTotalCount < props.singleProductDetails.quantity
                      ) {
                        setCartTotalCount(cartTotalCount + 1);
                      } else {
                        alert(
                          `This product has a limited stock of ${props.singleProductDetails.quantity} items.`,
                        );
                      }
                    }}
                    icon="plus"
                    size={18}
                    style={{backgroundColor: '#eeeeee'}}
                  />
                </View>
              </Card>
            ) : (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TextInput
                  dense
                  defaultValue={`${cartTotalCount}`}
                  keyboardType="number-pad"
                  label="Quantity"
                  mode="outlined"
                  style={{width: 120, borderWidth: 0}}
                  onEndEditing={(e) => {
                    if (!e.nativeEvent.text || !parseInt(e.nativeEvent.text)) {
                      setToggleTextInputLimit(1);
                      setCartTotalCount(1);
                    } else if (
                      parseInt(e.nativeEvent.text) >
                      props.singleProductDetails.quantity
                    ) {
                      _toastMessage(
                        `This product has a limited stock of ${props.singleProductDetails.quantity} items.`,
                      );
                      setToggleTextInputLimit(
                        props.singleProductDetails.quantity,
                      );
                      setCartTotalCount(props.singleProductDetails.quantity);
                    } else {
                      setCartTotalCount(parseInt(e.nativeEvent.text));
                      setToggleTextInputLimit(parseInt(e.nativeEvent.text));
                    }
                    setCartTotalInputFieldBool(false);
                  }}
                />
              </View>
            )}
          </View>
          <Button
            icon="cart"
            mode="contained"
            onPress={() =>
              props.is_usr_logged_in ? _onAddToCart() : alert('Please Sign In')
            }
            style={{width: '90%', alignSelf: 'center', marginTop: 10}}>
            Add to Cart
          </Button>
          <Button
            icon="heart"
            mode="outlined"
            onPress={() =>
              props.is_usr_logged_in
                ? props.singleProductDetails.wishlist === 0
                  ? _onAddToWishList()
                  : _onRemoveFromWishList(
                      props.singleProductDetails.wishlist_uuid,
                    )
                : alert('Please Sign In')
            }
            style={{width: '90%', alignSelf: 'center', marginTop: 10}}>
            {props.singleProductDetails.wishlist === 0 ||
            !props.is_usr_logged_in
              ? 'Add to Wishlist'
              : 'Remove from Wishlist'}
          </Button>
        </>
      )}

      <View style={{...styles.customerRatingsCard}}>
        <View>
          <Text
            style={{
              textTransform: 'capitalize',
              color: '#000',
              fontSize: 16,
              fontWeight: '700',
            }}>
            {props.singleProductDetails.total_ratings_count} Customer Ratings
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
          }}>
          <View>
            <SwipeRating
              imageSize={18}
              ratingCount={5}
              readonly
              startingValue={props.singleProductDetails.rating_stars || 0}
            />
          </View>
          <View style={{marginLeft: 6}}>
            <Text style={{color: '#8d8d8d', fontWeight: '700'}}>
              {props.singleProductDetails.rating_stars || 0} out of 5 stars
            </Text>
          </View>
        </View>

        {props.singleProductDetails.total_ratings_count ? (
          <>
            <View style={{marginTop: 14}}>
              {rating_star_ranges.map((rating_start_range_info, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      marginVertical: 4,
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          textAlign: 'left',
                          fontWeight: '700',
                          color: rating_start_range_info.count_in_percentage
                            ? '#1A6AC2'
                            : '#000000',
                        }}>
                        {rating_start_range_info.range[1]} star
                      </Text>
                    </View>
                    <View
                      style={{
                        width: '66%',
                        height: 24,
                        borderWidth: 1,
                        borderColor: '#CECECE',
                      }}>
                      <LinearGradient
                        style={{
                          width: '100%',
                          backgroundColor: '#F3F3F3',
                          height: '100%',
                        }}
                        locations={[0, 0.15, 0.15]}
                        colors={[
                          'rgba(200, 200, 218, 0.25)',
                          'rgba(200, 200, 218, 0.005)',
                          '#F3F3F3',
                        ]}>
                        <LinearGradient
                          colors={['#F6AE42', '#F8C246']}
                          style={{
                            height: 24,
                            width: rating_start_range_info.count_in_percentage
                              ? `${
                                  rating_start_range_info.count_in_percentage +
                                  1
                                }%`
                              : 0,
                            borderWidth: rating_start_range_info.count_in_percentage
                              ? 1
                              : 0,
                            borderColor: '#C09B35',
                            marginTop: -1,
                            marginLeft: -1,
                          }}
                        />
                      </LinearGradient>
                    </View>
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          textAlign: 'right',
                          fontWeight: '700',
                          color: rating_start_range_info.count_in_percentage
                            ? '#1A6AC2'
                            : '#000000',
                        }}>
                        {rating_start_range_info.count_in_percentage}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.horizontalSeparator} />

            {!toggleCustomerReviewSection ? (
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => setCustomerReviewVisibility(true)}
                style={{marginTop: 10}}>
                <Text style={{color: '#1A6AC2', textAlign: 'center'}}>
                  See all {props.singleProductDetails.total_ratings_count}{' '}
                  customer reviews {'›'}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={{marginTop: 6}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View>
                      <Text
                        style={{
                          color: '#000',
                          fontSize: 16,
                          fontWeight: '700',
                        }}>
                        Customer Reviews
                      </Text>
                    </View>
                    <View>
                      <IconButton
                        icon="arrow-up"
                        size={14}
                        onPress={() => setCustomerReviewVisibility(false)}
                      />
                    </View>
                  </View>
                </View>

                {props.singleProductDetails.product_ratings.map(
                  (rating_info, index) => {
                    const reviewee_full_name = `${rating_info.buyer[0].first_name} ${rating_info.buyer[0].last_name}`;
                    return (
                      <View key={index} style={{marginTop: 8}}>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Image
                            source={require('../assets/default_user.jpeg')}
                            style={{height: 30, width: 30}}
                          />
                          <View style={{marginLeft: 10}}>
                            <Text style={{textTransform: 'capitalize'}}>
                              {reviewee_full_name}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            marginTop: 6,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <SwipeRating
                            imageSize={14}
                            ratingCount={5}
                            readonly
                            startingValue={rating_info.stars || 0}
                          />
                          {/* <Text
                            style={{
                              marginLeft: 4,
                              color: '#F8C246',
                              fontSize: 12,
                            }}>
                            ({rating_info.stars || 0})
                          </Text> */}
                          <Text
                            style={{
                              marginLeft: 8,
                              flex: 1,
                              flexWrap: 'wrap',
                              color: '#8d8d8d',
                              fontSize: 12,
                            }}>
                            {`Reviewed on ${_dateFormatter(
                              rating_info.created_at,
                            )}`}
                          </Text>
                        </View>
                        <View style={{marginTop: 5}}>
                          <Text style={{flex: 1, flexWrap: 'wrap'}}>
                            {`${rating_info.description}`}
                          </Text>
                        </View>
                      </View>
                    );
                  },
                )}
              </>
            )}
          </>
        ) : null}
      </View>

      {!props.isEmptyRelatedProducts ? (
        <View
          style={{
            width: '100%',
            borderWidth: 0.6,
            borderColor: '#dddddd',
            marginTop: 20,
            marginBottom: 15,
          }}
        />
      ) : null}
      {!props.isEmptyRelatedProducts && (
        <Text
          style={{
            alignSelf: 'center',
            fontSize: 15,
            fontWeight: '700',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
          Related Products
        </Text>
      )}
    </View>
  );
};

class Product extends Component {
  constructor(props) {
    super(props);

    this.state = {
      singleProductDetails: [],
      productImages: [],
      isLoading: true,
      relatedProducts: [],

      is_usr_logged_in: false,
    };
  }

  componentDidMount() {
    const {productId} = this.props.route?.params;
    console.log('productId', productId);

    const _getData = async () => {
      const value = await AsyncStorage.getItem('token');
      this.setState({is_usr_logged_in: value ? true : false});
      let url = '';
      let headers = {};
      if (value) {
        url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_SINGLE_PRODUCT_DETAILS_KEY;
        headers = {Authorization: `Bearer ${value}`};
      } else {
        url =
          UNIVERSAL_ENTRY_POINT_ADDRESS +
          NO_AUTH_API_SINGLE_PRODUCT_DETAILS_KEY;
      }
      await axios
        .get(url, {
          headers: headers,
          params: {uuid: productId},
        })
        .then((response) => {
          console.log('response product = ', response.data.products);
          this.setState({
            singleProductDetails: response.data.products,
            isLoading: false,
          });
          if (response.data.products.images !== '') {
            this.setState({productImages: [response.data.products.images[0]]});
          }

          axios
            .get(
              UNIVERSAL_ENTRY_POINT_ADDRESS + API_SINGLE_PRODUCT_IMAGES_KEY,
              {
                // headers: {Authorization: `Bearer ${value}`},
                params: {uuid: productId},
              },
            )
            .then((response) => {
              // console.log("res = ",response.data.images);
              if (response.data.images.length !== 0) {
                const productImages = [
                  ...this.state.productImages,
                  ...response.data.images,
                ];
                this.setState({productImages: productImages, isLoading: false});
              }
            })
            .catch((error) => {
              console.log({...error});
              alert(error.response.data.message);
            });

          const categoryId = response.data.products.category.uuid;
          console.log('categoryId', categoryId);

          if (value) {
            axios
              .get(
                UNIVERSAL_ENTRY_POINT_ADDRESS + API_CATEGORY_PRODUCT_LIST_KEY,
                {
                  headers: {Authorization: `Bearer ${value}`},
                  params: {category_uuid: categoryId},
                },
              )
              .then((response) => {
                // console.log(response.data);
                const relatedProducts = [...response.data.products.data];
                const removeIndex = relatedProducts
                  .map((item) => {
                    return item.uuid;
                  })
                  .indexOf(productId);
                console.log(relatedProducts);
                if (removeIndex !== -1) {
                  relatedProducts.splice(removeIndex, 1);
                }
                this.setState({
                  relatedProducts: relatedProducts,
                  isLoading: false,
                });
              })
              .catch((error) => {
                console.log({...error});
                alert(error.response.data.message);
              });
          } else {
            axios
              .get(
                UNIVERSAL_ENTRY_POINT_ADDRESS +
                  NO_AUTH_API_CATEGORY_PRODUCT_LIST_KEY,
                {
                  params: {category_uuid: categoryId},
                },
              )
              .then((response) => {
                // console.log(response.data);
                const relatedProducts = [...response.data.products.data];
                const removeIndex = relatedProducts
                  .map((item) => {
                    return item.uuid;
                  })
                  .indexOf(productId);
                console.log(relatedProducts);
                if (removeIndex !== -1) {
                  relatedProducts.splice(removeIndex, 1);
                }
                this.setState({
                  relatedProducts: relatedProducts,
                  isLoading: false,
                });
              })
              .catch((error) => {
                console.log({...error});
                alert(error.response.data.message);
              });
          }
        })
        .catch((error) => {
          console.log({...error});
          alert(error.response.data.message);
        });
    };

    _getData();
  }

  _onMoveToWishListPress = async (uuid) => {
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
        const productsUUID = this.state.relatedProducts.map(
          (data) => data.uuid,
        );
        this.state.relatedProducts[productsUUID.indexOf(uuid)].wishlist = 1;
        this.state.relatedProducts[productsUUID.indexOf(uuid)].wishlist_uuid =
          response.data.wishlist_uuid;
        this.setState({relatedProducts: this.state.relatedProducts});
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

  _onRemoveFromListPress = async (wishlist_uuid) => {
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
        const productsUUID = this.state.relatedProducts.map(
          (data) => data.wishlist_uuid,
        );
        this.state.relatedProducts[
          productsUUID.indexOf(wishlist_uuid)
        ].wishlist = 0;
        this.setState({relatedProducts: this.state.relatedProducts});
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  _renderCategoryGrid = ({item}) => {
    const {per_dollar_rate, currency_symbol} = currency_strings;
    return !item.empty ? (
      <View style={styles.CategoryGridContainer}>
        <Pressable
          onPress={() =>
            this.props.navigation.push('Product', {productId: item.uuid})
          }>
          <View style={styles.CategoryGridImageContainer}>
            <ImageBackground
              source={item.image !== '' ? {uri: item.image} : null}
              imageStyle={{borderTopLeftRadius: 2, borderTopRightRadius: 2}}
              style={{...styles.CategoryGridImage}}>
              {item.image === '' && (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#eeeeee',
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
            {this.state.is_usr_logged_in ? (
              <View style={{position: 'absolute', top: 0, left: 0}}>
                <IconButton
                  style={{
                    backgroundColor: '#fff',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                  size={16}
                  color={item.wishlist === 0 ? '#000' : 'red'}
                  icon={item.wishlist === 0 ? 'heart-outline' : 'heart'}
                  onPress={() =>
                    item.wishlist === 0
                      ? this._onMoveToWishListPress(item.uuid)
                      : this._onRemoveFromListPress(item.wishlist_uuid)
                  }
                />
              </View>
            ) : null}
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
              }}>
              <Text style={{fontSize: 13, flex: 1, flexWrap: 'wrap'}}>
                {/* ${item.price_after_discount} */}
                {`${currency_symbol}${(
                  item.price_after_discount * per_dollar_rate
                ).toFixed(2)}`}
              </Text>
              {/* {item.discount ? ( */}
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
              {/* // ) : null} */}
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
                    {item.discount}% off
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

  _formatData = (data, numColumns) => {
    // console.log(data, numColumns);
    const numOfFullRows = Math.floor(data.length / numColumns);
    let numOfElementsLastRow = data.length - numOfFullRows * numColumns;

    while (numOfElementsLastRow !== numColumns && numOfElementsLastRow !== 0) {
      data.push({
        id: '',
        uuid: `${Math.random()}`,
        img: '',
        titleHeader: '',
        subTitle: '',
        rating: 0,
        retailPrice: 0,
        discountedPrice: 0,
        ratedUserCount: 0,
        discountedPercentages: 0,
        empty: true,
      });
      numOfElementsLastRow++;
    }

    return data;
  };

  _onAddedToWishlist = (wishlist_uuid) => {
    this.state.singleProductDetails.wishlist = 1;
    this.state.singleProductDetails.wishlist_uuid = wishlist_uuid;
    this.setState({singleProductDetails: this.state.singleProductDetails});
  };

  _onRemovedFromWishlist = () => {
    this.state.singleProductDetails.wishlist = 0;
    this.setState({singleProductDetails: this.state.singleProductDetails});
  };

  render() {
    return (
      <View style={{height: '100%'}}>
        <HeaderBar
          navigation={this.props.navigation}
          cartTotal={this.props.cartTotal.length}
          is_usr_logged_in={this.state.is_usr_logged_in}
        />
        {this.state.isLoading ? (
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
            <ActivityIndicator size={26} color="purple" />
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <ListHeaderComponent
                navigation={this.props.navigation}
                addedToWishlist={(wishlist_uuid) =>
                  this._onAddedToWishlist(wishlist_uuid)
                }
                removedFromWishlist={() => this._onRemovedFromWishlist()}
                singleProductDetails={this.state.singleProductDetails}
                productImages={this.state.productImages}
                isEmptyRelatedProducts={
                  this.state.relatedProducts.length === 0 ? true : false
                }
                is_usr_logged_in={this.state.is_usr_logged_in}
                cartTotalModification={this.props}
              />
            }
            data={this._formatData(this.state.relatedProducts, 2)}
            renderItem={this._renderCategoryGrid}
            numColumns={2}
            keyExtractor={(item) => item.uuid.toString()}
            key={'GridView'}
            columnWrapperStyle={{justifyContent: 'space-evenly'}}
            contentContainerStyle={{paddingBottom: 120}}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  horizontalSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#eeeeee',
    marginTop: 10,
  },
  headerIconsView: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 20,
    marginRight: 20,
  },

  item: {
    width: screenWidth,
    height: 260,
    // marginTop:16,
  },
  imageContainer: {
    flex: 1,
    // marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
    backgroundColor: 'white',
    // borderRadius: 8,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },

  productDetailsCard: {
    width: '95%',
    backgroundColor: 'white',
    borderRadius: 6,
    alignSelf: 'center',
    padding: 14,
    marginTop: 20,
  },

  customerRatingsCard: {
    width: '95%',
    backgroundColor: 'white',
    borderRadius: 6,
    alignSelf: 'center',
    padding: 14,
    marginTop: 26,
  },

  productDetailsCardHeader: {
    textTransform: 'uppercase',
    color: '#000',
    fontWeight: '700',
    marginBottom: 8,
  },
  productAdditionalInfoCardHeader: {
    textTransform: 'uppercase',
    color: '#000',
    fontWeight: '700',
  },

  productDataCardAdditionalInfo: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
  },
  productDataCardAdditionalInfoList: {
    flexDirection: 'row',
    width: '100%',
  },
  productDataCardAdditionalInfoListHeader: {
    width: '40%',
    backgroundColor: '#eeeeee',
    padding: 10,
    paddingRight: 0,
  },
  productDataCardAdditionalInfoListHeaderInfo: {
    width: '60%',
    backgroundColor: 'white',
    padding: 10,
    paddingRight: 0,
  },

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

  // CategoryGridContainer:{
  //     maxWidth: (Dimensions.get('window').width /2),
  //     height:260,
  //     width:'47.8%',
  //     backgroundColor:'white',
  //     elevation:1,
  //     marginTop:4,
  //     marginBottom:2,
  //     borderRadius:2
  // },
  // CategoryGridImageContainer:{
  //     height:'74%',
  //     width:'100%',
  // },
  // CategoryGridImage:{
  //     flex: 1,
  //     resizeMode: 'cover',
  // },
  // CategoryGridInfo:{
  //     flexDirection:'row',
  //     height:'26%',
  //     justifyContent:'space-around',
  //     alignItems:'center'
  // },
  userRatingContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 32,
    alignItems: 'center',
    width: 100,
    borderWidth: 0.4,
    borderColor: '#dddddd',
  },
  userRatingContainerRateSection: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'baseline',
    width: 60,
  },
  userRatingContainerUserCount: {
    paddingTop: 6,
    paddingBottom: 6,
    width: 40,
    textAlign: 'center',
    borderLeftWidth: 0.8,
    borderLeftColor: '#dddddd',
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

export default connect(mapStateToProps, mapDispatchToProps)(Product);
