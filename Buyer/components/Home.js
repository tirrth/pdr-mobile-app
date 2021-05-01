import React, {Component} from 'react';
import {lang_strings as locales, currency_strings} from '../locales';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_PRODUCT_CATEGORIES_KEY,
  API_BANNER_IMAGES_KEY,
  API_ADD_PRODUCT_TO_WISHLIST_KEY,
  API_REMOVE_PRODUCT_FROM_WISHLIST_KEY,
  API_TOP_RATED_PRODUCTS,
  API_RECENTLY_ADDED_PRODUCTS_KEY,
  API_CART_VIEW_KEY,
  NO_AUTH_API_TOP_RATED_PRODUCTS,
  NO_AUTH_API_RECENTLY_ADDED_PRODUCTS_KEY,
  API_PRODUCT_BRANDS_KEY,
} from '@env';
import {
  BackHandler,
  Dimensions,
  Pressable,
  StatusBar,
  Animated,
  ToastAndroid,
} from 'react-native';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  ImageBackground,
  TextInput,
  Platform,
} from 'react-native';
import {Header} from 'react-native-elements';
import {Icon} from 'react-native-elements';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Carousel, {getInputRangeFromIndexes} from 'react-native-snap-carousel';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDeviceId} from 'react-native-device-info';
import {Badge, Card, IconButton, Searchbar} from 'react-native-paper';
import {createShimmerPlaceholder} from './content-loaders/ShimmerPlaceholder';
import {connect} from 'react-redux';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const {width: screenWidth} = Dimensions.get('window');
const deviceId = getDeviceId();

const ImageAssets = [
  {
    img: require('../assets/swiper/1.jpg'),
    name: 'Pushing Machine',
    price: 21.3,
  },
  {
    img: require('../assets/swiper/2.jpg'),
    name: 'Pushing Machine',
    price: 21.3,
  },
  {
    img: require('../assets/swiper/3.jpg'),
    name: 'Pushing Machine',
    price: 21.3,
  },
  {
    img: require('../assets/swiper/4.png'),
    name: 'Pushing Machine',
    price: 21.3,
  },
  {
    img: require('../assets/swiper/5.png'),
    name: 'Pushing Machine',
    price: 21.3,
  },
  {
    img: require('../assets/swiper/5.png'),
    name: 'Pushing Machine',
    price: 21.3,
  },
  {
    img: require('../assets/swiper/5.png'),
    name: 'Pushing Machine',
    price: 21.3,
  },
  {
    img: require('../assets/swiper/1.jpg'),
    name: 'Pushing Machine',
    price: 21.3,
  },
  {
    img: require('../assets/swiper/2.jpg'),
    name: 'Pushing Machine',
    price: 21.3,
  },
  {
    img: require('../assets/swiper/3.jpg'),
    name: 'Pushing Machine',
    price: 21.3,
  },
];

const DealsOfTheDayAssets = [
  {
    id: '0',
    img: require('../assets/swiper/7.jpg'),
    name: 'Pushing Machine',
    price: 21.3,
  },
  {
    id: '1',
    img: require('../assets/swiper/7.jpg'),
    name: 'Pants',
    price: 20.3,
  },
  {
    id: '2',
    img: require('../assets/swiper/7.jpg'),
    name: 'Payjama',
    price: 12.3,
  },
  {
    id: '3',
    img: require('../assets/swiper/7.jpg'),
    name: 'Saree',
    price: 21.3,
  },
  {
    id: '4',
    img: require('../assets/swiper/7.jpg'),
    name: 'T-Shirt',
    price: 25.3,
  },
];

const _onToastMessageSend = (message = null) => {
  message &&
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
};

class HeaderIcons extends Component {
  _navigationFunc = (navigation) => {
    const {push} = this.props.navigation;
    push(navigation);
  };

  render() {
    const {is_usr_logged_in, total_notifications_count} = this.props;
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
          {is_usr_logged_in ? (
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
                <View
                  style={{marginLeft: -20, marginTop: -15, marginRight: 12}}>
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
          {!is_usr_logged_in && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}>
              <IconButton
                color="#fff"
                size={20}
                icon={'login'}
                onPress={
                  () =>
                    this.props.navigation.navigate('Auth', {screen: 'Login'})
                  // this.props.navigation.reset({routes: [{name: 'Auth'}]})
                }
              />
            </View>
          )}
        </>
      </View>
    );
  }
}

export class HeaderBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searched_text: '',
    };
  }

  render() {
    const {is_usr_logged_in} = this.props;
    return (
      <>
        <Header
          placement="left"
          leftComponent={
            // is_usr_logged_in ? (
            <IconButton icon="menu" color="#fff" onPress={this.props.onPress} />
            // ) : null
          }
          centerComponent={{
            text: locales.home.header_title,
            style: {
              color: '#fff',
              // marginLeft: is_usr_logged_in ? -10 : 0,
              marginLeft: -10,
              fontSize: 16,
              letterSpacing: 0.8,
            },
          }}
          rightComponent={
            <HeaderIcons
              is_usr_logged_in={is_usr_logged_in}
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
        {/* <LinearGradient
          colors={['#6B23AE', '#FAD44D']}
          start={{x: 0, y: 0}}
          end={{x: 1.8, y: 0}}
          style={{padding: 10, paddingTop: 0, marginTop: -5}}>
          <View
            style={{
              height: 38,
              width: '100%',
              borderRadius: 4,
              backgroundColor: '#ffffff',
              justifyContent: 'space-between',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <IconButton color="#8d8d8d" icon={'magnify'} />
            <TextInput
              value={this.state.searched_text}
              style={{flex: 1}}
              onChangeText={(searched_text) => this.setState({searched_text})}
              placeholder="Search"
              onSubmitEditing={() => {
                const {searched_text} = this.state;
                searched_text &&
                  this.props.navigation.navigate('Search', {searched_text});
              }}
            />
            {this.state.searched_text ? (
              <Pressable onPress={() => this.setState({searched_text: ''})}>
                <IconButton color="#8d8d8d" icon={'close'} />
              </Pressable>
            ) : null}
          </View>
        </LinearGradient> */}
      </>
    );
  }
}

class ImageSwiper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      banner_info: [
        {uuid: `1`},
        {uuid: `2`},
        {uuid: `3`},
        {uuid: `4`},
        {uuid: `5`},
        {uuid: `6`},
      ],

      banner_swiper_current_index: 0,
      isLoading: true,
    };
  }

  async componentDidMount() {
    // const token = await AsyncStorage.getItem('token');
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_BANNER_IMAGES_KEY, {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      })
      .then((res) => {
        console.log(res);
        this.setState({banner_info: res.data.banner, isLoading: false});
      })
      .catch((err) => {
        console.log({...err});
        // alert(err.response.data.message);
      });
  }

  _onPressBannerImage = (banner_info) => {
    this.props.navigation.push('BannerProducts', {banner_info});
  };

  _renderItem = ({item, index}, parallaxProps) => {
    const {banner_swiper_current_index} = this.state;
    return !this.state.isLoading ? (
      <Pressable
        key={index}
        style={{
          ...styles.item,
          borderRadius: 6,
          elevation:
            index == banner_swiper_current_index ||
            banner_swiper_current_index + 3 == index ||
            banner_swiper_current_index + 6 == index
              ? 1
              : 0,
          backgroundColor: '#fff',
          marginBottom: 1,
        }}
        onPress={() =>
          !this.state.isLoading ? this._onPressBannerImage(item) : null
        }>
        <Image
          source={{uri: item.image}}
          style={{
            ...styles.image,
            resizeMode: 'contain',
          }}
        />
      </Pressable>
    ) : (
      <ShimmerPlaceholder
        visible={!this.state.isLoading}
        style={{
          elevation:
            index == banner_swiper_current_index ||
            banner_swiper_current_index + 3 == index ||
            banner_swiper_current_index + 6 == index
              ? 1
              : 0,
          ...styles.item,
          borderRadius: 6,
          marginBottom: 1,
        }}></ShimmerPlaceholder>
    );
  };

  render() {
    return (
      <Carousel
        data={this.state.banner_info}
        renderItem={this._renderItem}
        sliderWidth={screenWidth}
        sliderHeight={screenWidth}
        itemWidth={screenWidth - 50}
        hasParallaxImages={true}
        onBeforeSnapToItem={(snap_to_index) =>
          this.setState({banner_swiper_current_index: snap_to_index})
        }
        autoplay={true}
        loop
      />
    );
  }
}

export class SliderHeader extends Component {
  render() {
    return (
      <View
        style={{
          ...styles.CategorySwiperHeaderText,
          marginTop: this.props.marginTop ? 10 : 20,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              ...styles.CategorySwiperHeaderName,
              marginLeft: this.props.marginLeftHeader ? 14 : 26,
            }}>
            {this.props.HeaderTitle}
          </Text>
          {this.props.noProducts && (
            <View
              style={{
                backgroundColor: 'red',
                paddingVertical: 3,
                paddingHorizontal: 5,
                marginLeft: 10,
                borderRadius: 2,
              }}>
              <Text style={{color: 'white', fontSize: 8}}>No Data Found</Text>
            </View>
          )}
        </View>
        {/* {!this.props.isLoading && !this.props.noProducts ? <Text style={{...styles.CategorySwiperHeaderViewAll, color:this.props.viewAllBlueText ? 'blue' : '#8d8d8d'}}>View All{" "}  
                <Icon style={{marginBottom:-1}} size={9} color={this.props.viewAllBlueText ? 'blue' : '#8d8d8d'} name='chevron-right' type='font-awesome-5' />
            </Text> : null} */}

        {this.props.needViewAllButton ? (
          <Pressable onPress={this.props._onPressViewAll}>
            <Text
              style={{...styles.CategorySwiperHeaderViewAll, color: 'blue'}}>
              {locales.home.view_all}{' '}
              <Icon
                style={{marginBottom: -1}}
                size={9}
                color={'blue'}
                name="chevron-right"
                type="font-awesome-5"
              />
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
}

class CategorySwiper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewAllBlueText: false,
      isLoading: true,
      noProducts: false,
      isPaginationAvailable: false,
      categoryList: [
        {uuid: `1`},
        {uuid: `2`},
        {uuid: `3`},
        {uuid: `4`},
        {uuid: `5`},
        {uuid: `6`},
      ],
    };
  }

  async componentDidMount() {
    try {
      const value = await AsyncStorage.getItem('token');
      const config = {
        headers: {Authorization: `Bearer ${value}`},
      };

      await axios
        .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_PRODUCT_CATEGORIES_KEY)
        .then((response) => {
          // console.log("res",response);
          if (response.data.categories.data.length === 0) {
            this.setState({noProducts: true, isLoading: false});
          } else {
            if (response.data.categories.next_page_url) {
              this.setState({isPaginationAvailable: true});
            }
            this.setState({
              categoryList: response.data.categories.data,
              isLoading: false,
            });
          }
        })
        .catch((error) => {
          console.log({...error});
          // this.setState({ isLoading: false });
          this.setState({noProducts: true});
          // alert(error);
          // _onToastMessageSend(err.response?.data?.message)
        });
    } catch (err) {
      console.log(err);
    }
  }

  _onSwiperEndReached = () => {
    this.setState({viewAllBlueText: true});
    setTimeout(() => {
      this.setState({viewAllBlueText: false});
    }, 1000);
  };

  _onCategoryPress = (category_id, category_name) => {
    this.props.navigation.push('CategoryAndBrandProductList', {
      brandId: null,
      brandName: null,
      categoryId: category_id,
      categoryName: category_name,
    });
  };

  _onPressViewAll = () => {
    this.props.navigation.navigate('CategoryExpandedList');
  };

  _renderCategory = ({item}) => {
    return (
      <View style={styles.CategoryContainer}>
        <Card
          onPress={
            this.state.isLoading
              ? null
              : () => this._onCategoryPress(item.uuid, item.category)
          }
          style={{
            ...styles.CategoryImageContainer,
            elevation: !this.state.isLoading ? 1 : 0,
            ...styles.CategoryImage,
            borderRadius: 4,
          }}>
          <ShimmerPlaceholder
            visible={!this.state.isLoading}
            style={{...styles.CategoryImage, borderRadius: 4}}>
            <Image
              source={{uri: item.image}}
              style={{
                ...styles.CategoryImage,
                resizeMode: 'contain',
                borderRadius: 0,
              }}
            />
          </ShimmerPlaceholder>
        </Card>
        <ShimmerPlaceholder
          visible={!this.state.isLoading}
          style={{
            ...styles.CategoryItemText,
            width: this.state.isLoading ? 90 : null,
            borderRadius: 2,
          }}>
          <View style={{alignItems: 'center'}}>
            {item.category ? (
              <Text
                style={{
                  ...styles.CategoryItemText,
                  textTransform: 'capitalize',
                }}>
                {item.category.length > 15
                  ? item.category.slice(0, 15) + '...'
                  : item.category}
              </Text>
            ) : null}
          </View>
        </ShimmerPlaceholder>
      </View>
    );
  };

  render() {
    return (
      <View>
        <SliderHeader
          _onPressViewAll={() => this._onPressViewAll()}
          HeaderTitle={this.props.title}
          needViewAllButton={this.state.isPaginationAvailable ? true : false}
          viewAllBlueText={this.state.viewAllBlueText}
          isLoading={this.state.isLoading}
          noProducts={this.state.noProducts}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={this.state.categoryList}
          renderItem={this._renderCategory}
          keyExtractor={(item) => `${item.uuid}`}
          contentContainerStyle={{paddingRight: 22, paddingLeft: 10}}
          onEndReachedThreshold={0.1}
          onEndReached={this._onSwiperEndReached}
          // ListFooterComponent={this.state.isPaginationAvailable ? <View style={{...styles.CategoryContainer, marginLeft:10, height:88, justifyContent:'center', alignItems:'center', transform:[{rotate:'180deg'}]}}><Appbar.BackAction style={{borderWidth:1, borderColor:'purple'}} size={26} color='purple' onPress={() => this.props.navigation.navigate("CategoryExpandedList")} /></View> : null}
          key={'Category List'}
        />
      </View>
    );
  }
}

class BrandsSwiper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewAllBlueText: false,
      isLoading: true,
      noProducts: false,
      isPaginationAvailable: false,
      brandsList: [
        {uuid: `1`},
        {uuid: `2`},
        {uuid: `3`},
        {uuid: `4`},
        {uuid: `5`},
        {uuid: `6`},
      ],
      image_base_url: '',
    };
  }

  async componentDidMount() {
    try {
      await axios
        .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_PRODUCT_BRANDS_KEY)
        .then((response) => {
          console.log('brands', response);
          if (response.data.brands.data.length === 0) {
            this.setState({noProducts: true, isLoading: false});
          } else {
            if (response.data.brands.next_page_url) {
              this.setState({isPaginationAvailable: true});
            }
            this.setState({
              image_base_url: response.data.base_url,
              brandsList: response.data.brands.data,
              isLoading: false,
            });
          }
        })
        .catch((error) => {
          console.log({...error});
          this.setState({noProducts: true});
          // alert(error);
          // _onToastMessageSend(err.response?.data?.message)
        });
    } catch (err) {
      console.log(err);
    }
  }

  _onSwiperEndReached = () => {
    this.setState({viewAllBlueText: true});
    setTimeout(() => {
      this.setState({viewAllBlueText: false});
    }, 1000);
  };

  _onBrandPress = (brand_id, brand_name) => {
    this.props.navigation.push('CategoryAndBrandProductList', {
      categoryId: null,
      categoryName: null,
      brandId: brand_id,
      brandName: brand_name,
    });
  };

  _onPressViewAll = () => {
    this.props.navigation.navigate('BrandExpandedList');
  };

  _renderBrand = ({item}) => {
    return (
      <View style={styles.CategoryContainer}>
        <Card
          onPress={
            this.state.isLoading
              ? null
              : () => this._onBrandPress(item.uuid, item.brand_name)
          }
          style={{
            ...styles.CategoryImageContainer,
            elevation: !this.state.isLoading ? 1 : 0,
            ...styles.CategoryImage,
            borderRadius: 4,
          }}>
          <ShimmerPlaceholder
            visible={!this.state.isLoading}
            style={{...styles.CategoryImage, borderRadius: 4}}>
            <Image
              source={{uri: this.state.image_base_url + '/' + item.brand_logo}}
              style={{
                ...styles.CategoryImage,
                resizeMode: 'contain',
                borderRadius: 0,
              }}
            />
          </ShimmerPlaceholder>
        </Card>
        <ShimmerPlaceholder
          visible={!this.state.isLoading}
          style={{
            ...styles.CategoryItemText,
            width: this.state.isLoading ? 90 : null,
            borderRadius: 2,
          }}>
          <View style={{alignItems: 'center'}}>
            {item.brand_name ? (
              <Text
                style={{
                  ...styles.CategoryItemText,
                  textTransform: 'capitalize',
                }}>
                {item.brand_name.length > 15
                  ? item.brand_name.slice(0, 15) + '...'
                  : item.brand_name}
              </Text>
            ) : null}
          </View>
        </ShimmerPlaceholder>
      </View>
    );
  };

  render() {
    return (
      <View>
        <SliderHeader
          _onPressViewAll={() => this._onPressViewAll()}
          HeaderTitle={this.props.title}
          needViewAllButton={this.state.isPaginationAvailable ? true : false}
          viewAllBlueText={this.state.viewAllBlueText}
          isLoading={this.state.isLoading}
          noProducts={this.state.noProducts}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={this.state.brandsList}
          renderItem={this._renderBrand}
          keyExtractor={(item) => `${item.uuid}`}
          contentContainerStyle={{paddingRight: 22, paddingLeft: 10}}
          onEndReachedThreshold={0.1}
          onEndReached={this._onSwiperEndReached}
          // ListFooterComponent={this.state.isPaginationAvailable ? <View style={{...styles.CategoryContainer, marginLeft:10, height:88, justifyContent:'center', alignItems:'center', transform:[{rotate:'180deg'}]}}><Appbar.BackAction style={{borderWidth:1, borderColor:'purple'}} size={26} color='purple' onPress={() => this.props.navigation.navigate("CategoryExpandedList")} /></View> : null}
          key={'Category List'}
        />
      </View>
    );
  }
}

// class DealsOfTheDaySwiper extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       viewAllBlueText: false,
//     };
//   }

//   _onSwiperEndReached = () => {
//     this.setState({viewAllBlueText: true});
//     setTimeout(() => {
//       this.setState({viewAllBlueText: false});
//     }, 1000);
//   };

//   _renderDealsOfTheDay = ({item}) => {
//     return (
//       <View style={styles.DealsOfTheDayContainer}>
//         <ImageBackground
//           source={item.img}
//           style={styles.DealsOfTheDayImage}
//           imageStyle={{borderRadius: 8}}>
//           <View
//             style={{
//               alignSelf: 'flex-end',
//               backgroundColor: 'white',
//               width: 22,
//               height: 22,
//               borderRadius: 22 / 2,
//               marginTop: 8,
//               marginRight: 8,
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}>
//             <Icon name="heart" type="font-awesome-5" size={12} />
//           </View>
//         </ImageBackground>
//         <View style={styles.DealsOfTheDayText}>
//           <Text style={styles.DealsOfTheDayItemName}>{item.name}</Text>
//           <Text style={styles.DealsOfTheDayItemPrice}>$ {item.price}</Text>
//         </View>
//       </View>
//     );
//   };

//   render() {
//     return (
//       <View>
//         <SliderHeader
//           HeaderTitle="Deals Of The Day"
//           viewAllBlueText={this.state.viewAllBlueText}
//         />
//         <FlatList
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           data={DealsOfTheDayAssets}
//           renderItem={this._renderDealsOfTheDay}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={{paddingRight: 22}}
//           onEndReachedThreshold={0.1}
//           onEndReached={this._onSwiperEndReached}
//         />
//       </View>
//     );
//   }
// }

class RecentlyAdded extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewAllBlueText: false,
      recentlyAddedProducts: [
        {uuid: `1`},
        {uuid: `2`},
        {uuid: `3`},
        {uuid: `4`},
        {uuid: `5`},
        {uuid: `6`},
      ],
      usr_token: null,
      isLoading: true,
      noProducts: false,
      isPaginationAvailable: false,
    };
  }

  async componentDidMount() {
    const value = await AsyncStorage.getItem('token');
    this.setState({usr_token: value});
    this._getData();
  }

  _getData = async () => {
    const {usr_token} = this.state;
    let url = '';
    let config = {};
    try {
      if (usr_token) {
        url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_RECENTLY_ADDED_PRODUCTS_KEY;
        config = {
          headers: {Authorization: `Bearer ${usr_token}`},
        };
      } else {
        url =
          UNIVERSAL_ENTRY_POINT_ADDRESS +
          NO_AUTH_API_RECENTLY_ADDED_PRODUCTS_KEY;
      }
      axios
        .get(url, config)
        .then((response) => {
          // console.log("response recently added = ", response);
          if (response.data.products.data.length === 0) {
            this.setState({noProducts: true, isLoading: false});
          } else {
            if (response.data.products.next_page_url) {
              this.setState({isPaginationAvailable: true});
            }
            this.setState({
              recentlyAddedProducts: response.data.products.data,
              isLoading: false,
            });
          }
        })
        .catch((error) => {
          console.log({...error});
          //    this.setState({ isLoading: false })
          this.setState({noProducts: true});
          //    alert(error);
        });
    } catch (err) {
      console.log(err);
    }
  };

  _onSwiperEndReached = () => {
    this.setState({viewAllBlueText: true});
    setTimeout(() => {
      this.setState({viewAllBlueText: false});
    }, 1000);
  };

  _onRecentlyAddedProductClick = (product_id, navigationProp) => {
    navigationProp.navigation.push('Product', {
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
        <Card style={{...styles.RecentlyAddedContainer}}>
          <ShimmerPlaceholder
            visible={!this.state.isLoading}
            style={{...styles.RecentlyAddedImageBackground, borderRadius: 4}}>
            {!this.state.isLoading && (
              <ImageBackground
                source={
                  item.images.length !== 0 ? {uri: item.images[0].image} : null
                }
                style={{
                  ...styles.RecentlyAddedImageBackground,
                }}
                // imageStyle={{borderRadius: 4, resizeMode: 'cover'}}
                imageStyle={{resizeMode: 'contain'}}>
                <View
                  style={{
                    backgroundColor: item.images.length
                      ? 'rgba(0,0,0,0.5)'
                      : '#9f9f9f',
                    flex: 1,
                    borderRadius: 4,
                  }}>
                  {item.discount ? (
                    <View
                      style={{
                        alignItems: !item.images.length ? 'center' : 'flex-end',
                        height: '100%',
                        justifyContent: !item.images.length ? 'center' : null,
                      }}>
                      <Text
                        style={{
                          color: '#fff',
                          backgroundColor: 'red',
                          paddingVertical: 4,
                          paddingHorizontal: 6,
                          borderRadius: 4,
                          fontSize: 9,
                          marginTop: item.images.length ? 10 : -14,
                          marginRight: item.images.length ? 10 : null,
                        }}>
                        {item.discount}% OFF
                      </Text>
                    </View>
                  ) : null}
                  {item.images.length === 0 && (
                    <View
                      style={{
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          ...styles.RecentlyAddedItemName,
                          color: '#fff',
                          marginTop: 10,
                        }}>
                        No Image Available
                      </Text>
                    </View>
                  )}
                  <View style={{...styles.RecentlyAddedText}}>
                    <Text
                      style={{...styles.RecentlyAddedItemName, color: '#fff'}}>
                      {item.product_name.length > 20
                        ? item.product_name.slice(0, 20) + '...'
                        : item.product_name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          ...styles.RecentlyAddedItemDiscountedPrice,
                          color: '#fff',
                          marginRight: 6,
                        }}>
                        {/* ${item.price_after_discount} */}
                        {`${currency_symbol}${(
                          item.price_after_discount * per_dollar_rate
                        ).toFixed(2)}`}
                      </Text>
                      {item.discount !== 0 ? (
                        <Text
                          style={{
                            ...styles.RecentlyAddedItemActualPrice,
                            color: '#fff',
                            marginLeft: 6,
                            textDecorationLine: 'line-through',
                          }}>
                          {/* ${item.actual_price} */}
                          {`${currency_symbol}${(
                            item.actual_price * per_dollar_rate
                          ).toFixed(2)}`}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </ImageBackground>
            )}
          </ShimmerPlaceholder>
        </Card>
      </TouchableWithoutFeedback>
    );
  };

  _onPressViewAll = () => {
    this.props.navigation.navigate('RecentlyAddedExpandedList');
  };

  render() {
    return (
      <View>
        <SliderHeader
          _onPressViewAll={() => this._onPressViewAll()}
          needViewAllButton={this.state.isPaginationAvailable ? true : false}
          HeaderTitle={this.props.title}
          viewAllBlueText={this.state.viewAllBlueText}
          isLoading={this.state.isLoading}
          noProducts={this.state.noProducts}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={this.state.recentlyAddedProducts}
          renderItem={({item}) => this._renderRecentlyAdded({item})}
          keyExtractor={(item) => `${item.uuid}`}
          contentContainerStyle={{paddingRight: 22}}
          // onEndReachedThreshold={0.1}
          // onEndReached={this._onSwiperEndReached}
          // ListFooterComponent={this.state.isPaginationAvailable ? <View style={{...styles.CategoryContainer, marginLeft:10, height:240, justifyContent:'center', alignItems:'center', transform:[{rotate:'180deg'}]}}><Appbar.BackAction style={{borderWidth:1, borderColor:'purple'}} size={26} color='purple' onPress={() => this.props.navigation.navigate("RecentlyAddedExpandedList")} /></View> : null}
          key={'RecentlyAddedProducts'}
        />
      </View>
    );
  }
}

class TopRatedProducts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewAllBlueText: false,
      prevIndex: 0,
      errorMsg: '',

      top_product_data: [],
      usr_token: null,
      isLoading: true,
    };
  }

  async componentDidMount() {
    const token = await AsyncStorage.getItem('token');
    this.setState({usr_token: token});
    this._onFetchTopRatedProducts();
  }

  _onFetchTopRatedProducts = () => {
    const {usr_token} = this.state;
    let url = '';
    let config = {};
    if (usr_token) {
      config = {
        headers: {
          Authorization: `Bearer ${usr_token}`,
        },
      };
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_TOP_RATED_PRODUCTS;
    } else {
      url = UNIVERSAL_ENTRY_POINT_ADDRESS + NO_AUTH_API_TOP_RATED_PRODUCTS;
    }
    axios
      .get(url, config)
      .then((res) => {
        if (!res.data.topRatedProducts.length) {
          this.setState({errorMsg: 'No Top-Rated Products available.'});
          return;
        }
        this.setState({
          top_product_data: res.data.topRatedProducts,
          isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({errorMsg: err.response.data.message});
        console.log({...err});
      });
  };

  _onSwiperEndReached = () => {
    if (this._carousel.currentIndex == 3 && this.state.prevIndex != 4) {
      this.setState({viewAllBlueText: true});
      setTimeout(() => {
        this.setState({viewAllBlueText: false});
      }, 1000);
    }
    this.setState({prevIndex: this._carousel.currentIndex});
  };

  _onTopRatedProductsPress = (product_id) => {
    this.props.navigation.push('Product', {
      productId: product_id,
    });
  };

  _onMoveToWishListPress = async (uuid) => {
    console.log(uuid);
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_ADD_PRODUCT_TO_WISHLIST_KEY,
        {
          product_uuid: uuid,
        },
        {
          headers: {Authorization: `Bearer ${this.state.usr_token}`},
        },
      )
      .then((response) => {
        // console.log("added to the wishlist",response);
        const productsUUID = this.state.top_product_data.map(
          (data) => data.product[0].uuid,
        );
        const top_product_data = this.state.top_product_data;
        top_product_data[productsUUID.indexOf(uuid)].product[0].wishlist = 1;
        top_product_data[productsUUID.indexOf(uuid)].product[0].wishlist_uuid =
          response.data.wishlist_uuid;
        this.setState({top_product_data: top_product_data});
      })
      .catch((err) => {
        console.log({...err});
        _onToastMessageSend(
          err.response?.data?.message || 'Product is already in the WishList!!',
        );
      });
  };

  _onRemoveFromWishListPress = async (wishlist_uuid) => {
    console.log(wishlist_uuid);
    // const value = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_REMOVE_PRODUCT_FROM_WISHLIST_KEY,
        {
          wishlist_uuid: wishlist_uuid,
        },
        {
          headers: {Authorization: `Bearer ${this.state.usr_token}`},
        },
      )
      .then((response) => {
        // console.log("removed from wishlist",response);
        // alert(response.data.message);
        const productsUUID = this.state.top_product_data.map(
          (data) => data.product[0].wishlist_uuid,
        );
        this.state.top_product_data[
          productsUUID.indexOf(wishlist_uuid)
        ].product[0].wishlist = 0;
        this.setState({top_product_data: this.state.top_product_data});
      })
      .catch((err) => {
        console.log({...err});
        _onToastMessageSend(
          err.response?.data?.message ||
            'Product could not be removed from the WishList!!',
        );
      });
  };

  _renderItem = ({item}) => {
    const {product} = item;
    return (
      <Card
        style={{...styles.itemTinder, borderRadius: 6}}
        onPress={() => this._onTopRatedProductsPress(product[0].uuid)}>
        {product[0].images.length ? (
          <Image
            source={{uri: product[0].images[0].image}}
            style={{
              ...styles.imageTinder,
              borderRadius: 6,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              resizeMode: 'cover',
            }}
          />
        ) : (
          <View
            style={{
              ...styles.imageTinder,
              borderRadius: 6,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#dddddd',
            }}>
            <Text style={{color: 'red', fontSize: 13}}>No Image Available</Text>
          </View>
        )}

        <View style={styles.TopRatedProductsFooter}>
          <Text
            style={{
              ...styles.TopRatedProductsFooterName,
              textTransform: 'capitalize',
            }}>
            {product[0].product_name}
          </Text>
          <Text style={styles.TopRatedProductsFooterPrice}>
            $ {product[0].price_after_discount}
          </Text>
        </View>

        <Card
          style={{
            alignSelf: 'flex-end',
            backgroundColor: 'white',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 22,
            height: 22,
            borderRadius: 22 / 2,
            marginTop: 8,
            marginRight: 8,
          }}
          onPress={() => null}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }}>
            <IconButton
              size={14}
              color={
                this.state.usr_token
                  ? product[0].wishlist === 0
                    ? '#000'
                    : 'red'
                  : '#000'
              }
              icon={
                this.state.usr_token
                  ? product[0].wishlist === 0
                    ? 'heart-outline'
                    : 'heart'
                  : 'heart-outline'
              }
              onPress={() =>
                this.state.usr_token
                  ? product[0].wishlist === 0
                    ? this._onMoveToWishListPress(product[0].uuid)
                    : this._onRemoveFromWishListPress(product[0].wishlist_uuid)
                  : _onToastMessageSend('Please Sign In')
              }
            />
          </View>
        </Card>
      </Card>
    );
  };

  _scrollInterpolator(index, carouselProps) {
    var range = [3, 2, 1, 0, -1];

    const inputRange = getInputRangeFromIndexes(range, index, carouselProps);
    const outputRange = range;

    return {inputRange, outputRange};
  }

  _animatedStyles(index, animatedValue, carouselProps) {
    const sizeRef = carouselProps.vertical
      ? carouselProps.itemHeight
      : carouselProps.itemWidth;
    const translateProp = carouselProps.vertical ? 'translateY' : 'translateX';

    return {
      zIndex: carouselProps.data.length - index,
      opacity: animatedValue.interpolate({
        inputRange: [2, 2],
        outputRange: [1, 0],
      }),
      transform: [
        {
          translateY: animatedValue.interpolate({
            inputRange: [-1, 0, 1, 2, 3],
            outputRange: [-10, 0, 10, 20, 30],
            extrapolate: 'clamp',
          }),
        },
        {
          scale: animatedValue.interpolate({
            inputRange: [-1, 0, 1, 2, 3],
            outputRange: [1, 0.96, 0.92, 0.88, 0.84],
            extrapolate: 'clamp',
          }),
        },
        {
          [translateProp]: animatedValue.interpolate({
            inputRange: [-1, 0, 1, 2, 3],
            outputRange: [
              -sizeRef * 1,
              0,
              -sizeRef / 0.92, // centered
              (-sizeRef * 2) / 0.88, // centered
              (-sizeRef * 3) / 0.84, // centered
            ],
            extrapolate: 'clamp',
          }),
        },
      ],
    };
  }

  render() {
    const {top_product_data, errorMsg, isLoading} = this.state;
    return (
      <View style={{marginBottom: 120}}>
        {!errorMsg && !isLoading ? (
          <SliderHeader
            HeaderTitle={this.props.title}
            viewAllBlueText={this.state.viewAllBlueText}
          />
        ) : null}
        <Carousel
          ref={(c) => {
            this._carousel = c;
          }}
          data={top_product_data}
          renderItem={this._renderItem}
          keyExtractor={(item, index) => index.toString()}
          sliderWidth={screenWidth}
          sliderHeight={screenWidth}
          itemWidth={screenWidth - 40}
          scrollInterpolator={this._scrollInterpolator}
          slideInterpolatedStyle={this._animatedStyles}
          useScrollView={true}
          removeClippedSubviews={false}
          onMomentumScrollBegin={this._onSwiperEndReached}
        />
      </View>
    );
  }
}

class Home extends Component {
  state = {
    backClickCount: 0,

    is_usr_logged_in: false,
  };

  constructor(props) {
    super(props);

    this.springValue = new Animated.Value(100);
  }

  backAction = () => {
    this.state.backClickCount === 1 ? BackHandler.exitApp() : this._spring();
    return true;
  };

  _showToastWithGravityAndOffset = () => {
    ToastAndroid.showWithGravityAndOffset(
      'Press Again to exit!',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  _spring = () => {
    const {height} = Dimensions.get('window');
    this.setState({backClickCount: 1}, () => {
      Animated.sequence([
        Animated.spring(this.springValue, {
          toValue: -0.15 * height,
          friction: 5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(this.springValue, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        this.setState({backClickCount: 0});
      });
    });
    this._showToastWithGravityAndOffset();
  };

  async componentDidMount() {
    // locales.setLanguage('it');

    // const {changeTotalNotificationsCount} = this.props;
    // changeTotalNotificationsCount(0);

    const token = await AsyncStorage.getItem('token');
    this.setState({is_usr_logged_in: token ? true : false});

    this.props.navigation.addListener('focus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.backAction);
    });

    this.props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    });

    if (deviceId === 'iPhone13,4') {
      StatusBar.setBarStyle('dark-content');
    }

    if (token) {
      // await axios
      //   .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_FETCH_USER_DETAILS, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   })
      //   .then((res) => {
      //     // console.log(res);
      //     this.props.changeProfileInfo(res.data);
      //   })
      //   .catch((err) => {
      //     console.log({...err});
      //   });

      axios
        .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_CART_VIEW_KEY, {
          headers: {Authorization: `Bearer ${token}`},
        })
        .then((response) => {
          // ---------------- Set redux cart total count -------------------
          this.props.changeCartTotalCount([]);
          // ---------------- (EXIT) Set redux cart total count -------------------

          if (response.data.cart.length) {
            if (!response.data.cart.hasOwnProperty('original')) {
              // ---------------- Set redux cart total count -------------------
              response.data.cart[0].cart_items.map((data) => {
                this.props.changeCartTotalCount([
                  ...this.props.cartTotal,
                  data.product.uuid,
                ]);
              });
              // ---------------- (EXIT) Set redux cart total count -------------------
            }
          } else {
            this.props.changeCartTotalCount([]);
          }
        })
        .catch((err) => {
          console.log(err);
          // alert(err);
          // _onToastMessageSend(err.response?.data?.message);
        });

      // this._getTotalNotificationsCount();
    } else {
      this.props.changeCartTotalCount([]);
    }
  }

  // _getTotalNotificationsCount = () => {
  //   const {uuid: documentId} = this.props.profile_info;
  //   const collection_name = 'buyers';
  //   const documentRef = firestore().collection(collection_name).doc(documentId);

  //   documentRef
  //     .get()
  //     .then((snap) => {
  //       if (snap.exists) {
  //         const total_notifications_count = snap._data?.messages?.filter(
  //           (message) => !message.is_seen,
  //         )?.length;

  //         const {changeTotalNotificationsCount} = this.props;
  //         if (total_notifications_count) {
  //           changeTotalNotificationsCount(
  //             (this.props.total_notifications_count || 0) +
  //               total_notifications_count,
  //           );
  //         }
  //       }
  //     })
  //     .catch((err) => console.log(err));
  // };

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  render() {
    const {home: lang} = locales;
    return (
      <View>
        <HeaderBar
          is_usr_logged_in={this.state.is_usr_logged_in}
          onPress={() => this.props.navigation.openDrawer()}
          navigation={this.props.navigation}
          cartTotal={this.props.cartTotal.length}
          total_notifications_count={this.props.total_notifications_count}
        />
        <ScrollView
          style={{backgroundColor: 'transparent'}}
          showsVerticalScrollIndicator={false}>
          <ImageSwiper navigation={this.props.navigation} />
          <CategorySwiper
            title={lang.categories}
            navigation={this.props.navigation}
          />
          <BrandsSwiper
            title={lang.brands}
            navigation={this.props.navigation}
          />
          <RecentlyAdded
            title={lang.recently_added}
            navigation={this.props.navigation}
          />
          <TopRatedProducts
            title={lang.top_rated_products}
            navigation={this.props.navigation}
          />
        </ScrollView>
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
    marginRight: 12,
  },
  shadow: {
    shadowOffset: {width: 10, height: 10},
    shadowColor: 'black',
    shadowOpacity: 1,
    elevation: 3,
    // background color must be set
    backgroundColor: '#0000', // invisible color
  },

  item: {
    width: screenWidth - 50,
    height: 180,
    marginTop: 16,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },

  CategorySwiperHeaderText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  CategorySwiperHeaderName: {
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: 16,
  },
  CategorySwiperHeaderViewAll: {
    textTransform: 'capitalize',
    fontWeight: '600',
    marginRight: 14,
    fontSize: 11,
  },
  CategoryContainer: {
    marginTop: 10,
    marginLeft: 16,
    alignItems: 'center',
  },
  CategoryImage: {
    borderRadius: 4,
    // elevation:1,
    width: 90,
    height: 90,
  },
  CategoryItemText: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: '600',
    color: '#8d8d8d',
  },

  DealsOfTheDaySwiperHeaderText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  DealsOfTheDaySwiperHeaderName: {
    textTransform: 'uppercase',
    fontWeight: '700',
    marginLeft: 26,
    fontSize: 16,
  },
  DealsOfTheDaySwiperHeaderViewAll: {
    textTransform: 'capitalize',
    fontWeight: '600',
    color: '#8d8d8d',
    marginRight: 14,
    fontSize: 11,
  },
  DealsOfTheDayContainer: {
    marginTop: 10,
    marginLeft: 26,
    alignItems: 'flex-start',
  },
  DealsOfTheDayImage: {
    width: 200,
    height: 130,
  },
  DealsOfTheDayText: {
    marginLeft: 4,
  },
  DealsOfTheDayItemName: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  DealsOfTheDayItemPrice: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#8d8d8d',
  },

  RecentlyAddedSwiperHeaderText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  RecentlyAddedSwiperHeaderName: {
    textTransform: 'uppercase',
    fontWeight: '700',
    marginLeft: 26,
    fontSize: 16,
  },
  RecentlyAddedSwiperHeaderViewAll: {
    textTransform: 'capitalize',
    fontWeight: '600',
    color: '#8d8d8d',
    marginRight: 14,
    fontSize: 11,
  },
  RecentlyAddedContainer: {
    marginTop: 10,
    marginLeft: 26,
    // borderRadius: 8,
    borderRadius: 4,
  },
  RecentlyAddedImageBackground: {
    width: 200,
    height: 240,
    // borderRadius: 8,
    borderRadius: 4,
    resizeMode: 'contain',
  },
  RecentlyAddedText: {
    marginLeft: 4,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  RecentlyAddedItemName: {
    marginTop: 6,
    fontSize: 15,
    color: '#fff',
    fontWeight: '800',
  },
  RecentlyAddedItemDiscountedPrice: {
    marginTop: 2,
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },

  TopRatedProductsSwiperHeaderText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  TopRatedProductsSwiperHeaderName: {
    textTransform: 'uppercase',
    fontWeight: '700',
    marginLeft: 26,
    fontSize: 16,
  },
  TopRatedProductsSwiperHeaderViewAll: {
    textTransform: 'capitalize',
    fontWeight: '600',
    color: '#8d8d8d',
    marginRight: 14,
    fontSize: 11,
  },
  TopRatedProductsFooter: {
    // position:'absolute',
    // bottom:0,
    width: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    paddingLeft: 14,
    height: 60,
    // elevation:1
  },
  TopRatedProductsFooterName: {
    fontSize: 16,
    fontWeight: '700',
  },
  TopRatedProductsFooterPrice: {
    fontSize: 12,
  },
  imageTinder: {
    width: screenWidth - 40,
    height: 170,
    flex: 1,
  },
  itemTinder: {
    marginTop: 8,
    marginBottom: 20,
    // shadowOffset:{
    //     width:-2,
    //     height:4,
    // },
    // ...Platform.select({
    //     ios:{
    //         shadowColor:'#f0f0f0',
    //         shadowOpacity:1,
    //     },
    //     android:{
    //         elevation:1,
    //     }
    // })
  },
});

const mapStateToProps = (state) => {
  return {
    cartTotal: state.cartTotal,
    profile_info: state.profile_info,
    total_notifications_count: state.total_notifications_count,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeProfileInfo: (profile_info) => {
      dispatch({type: 'CHANGE_PROFILE_INFO', payload: profile_info});
    },
    changeCartTotalCount: (cartTotal) => {
      dispatch({type: 'CHANGE_CART_TOTAL', payload: cartTotal});
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
