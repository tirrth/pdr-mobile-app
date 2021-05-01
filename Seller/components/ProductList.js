import React, {Component} from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Appbar,
  Button,
  Card,
  Divider,
  IconButton,
  Menu,
  TextInput,
} from 'react-native-paper';
import {Header} from 'react-native-elements';
import {
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_PRODUCT_GALLERY_IMAGE_DELETE_KEY,
  API_DELETE_PRODUCT_SPECIFICATIONS_KEY,
  API_ADD_PRODUCT_SPECIFICATIONS_KEY,
  API_UPDATE_FEATURE_IMAGE_KEY,
  API_PRODUCT_ADD_GALLERY_IMAGE_KEY,
  API_PRODUCT_UPDATE_KEY,
  API_GET_PRODUCT_LIST_KEY,
  API_GET_GALLERY_IMAGES_KEY,
  API_GET_SINGLE_PRODUCT_DETAILS_KEY,
  API_DELETE_PRODUCT_KEY,
  API_FETCH_CATEGORIES_KEY,
  API_FETCH_BRANDS_KEY,
} from '@env';
import {Alert} from 'react-native';
import RNPicker from './rn-modal-picker';
import Picture from '../assets/default_gallery.svg';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import {ToastAndroid} from 'react-native';
import {Icon} from 'native-base';

export default class ProductList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toggleProductCardMenu: false,
      editModalVisibility: false,
      editProductUUID: '',

      productList: [],
      isLoading: true,
      errorMessage: '',
      nextProductListUrl: '',
    };
  }

  async componentDidMount() {
    const token = await AsyncStorage.getItem('token');
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_PRODUCT_LIST_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log('resssssssssssssssssssssss=', res);
        if (res.data.product_list.data.length) {
          res.data.product_list.data.map((data) => {
            data.toggle_setting = false;
          });
          this.setState({
            productList: res.data.product_list.data,
            nextProductListUrl: res.data.product_list.next_page_url,
          });
          this.setState({isLoading: false});
        } else {
          this.setState({errorMessage: 'Product List is Empty!!'});
        }
      })
      .catch((err) => {
        console.log({...err});
        this.setState({errorMessage: err.response.data.message});
        alert(err.response.data.message);
      });
  }

  _onEditProductPress = async (product_uuid, index) => {
    this._toggleProductCardMenu(index);
    await this.setState({
      editProductUUID: product_uuid,
      editModalVisibility: true,
    });
  };

  _toggleProductCardMenu = (index) => {
    const {productList} = this.state;
    const boolean = productList[index].toggle_setting;
    productList.map((product_info, idx) => {
      if (index == idx) {
        product_info.toggle_setting = !boolean;
      } else {
        product_info.toggle_setting = false;
      }
    });
    this.setState({productList: productList});
  };

  _onConfirmDeleteProduct = async (product_uuid, index) => {
    const token = await AsyncStorage.getItem('token');
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_DELETE_PRODUCT_KEY,
        {
          product_uuid: product_uuid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => {
        // console.log(res);
        alert(res.data.message);
        this.state.productList.splice(index, 1);
        this.setState({productList: this.state.productList});
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  _onDeleteProductPress = (product_uuid, index, product_name) => {
    Alert.alert(
      'Hold on!',
      `Are you sure you want to delete ${product_name}?`,
      [
        {
          text: 'YES',
          onPress: () => this._onConfirmDeleteProduct(product_uuid, index),
        },
        {
          text: 'Cancel',
          onPress: () => this._toggleProductCardMenu(index),
          style: 'cancel',
        },
      ],
    );
  };

  _onRenderProductList = (data) => {
    const {item, index} = data;
    return (
      <Card
        style={{...styles.productCard}}
        onPress={() =>
          item.toggle_setting ? this._toggleProductCardMenu(index) : null
        }>
        {item.toggle_setting ? (
          <Card
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              elevation: 10,
              zIndex: 100,
            }}>
            <Menu.Item
              title={
                <Text style={{color: '#454545'}}>
                  <Icon
                    name="edit"
                    style={{fontSize: 16, color: '#454545'}}
                    type="FontAwesome5"
                  />
                  {'  '}
                  Edit
                </Text>
              }
              onPress={() => this._onEditProductPress(item.uuid, index)}
            />
            <Divider />
            <Menu.Item
              title={
                <Text style={{color: '#454545'}}>
                  <Icon
                    name="trash-alt"
                    style={{fontSize: 16, color: '#454545'}}
                    type="FontAwesome5"
                  />
                  {'  '}
                  Delete
                </Text>
              }
              onPress={() =>
                this._onDeleteProductPress(item.uuid, index, item.product_name)
              }
            />
          </Card>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', marginLeft: 14}}>
            <Text style={{fontWeight: 'bold'}}>Product No. </Text>
            {/* <Text style={{color: '#8d8d8d'}}>SAKJJ213122NSADA</Text> */}
            <Text style={{color: '#8d8d8d', textTransform: 'uppercase'}}>
              {item.sku}
            </Text>
          </View>
          <View>
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => this._toggleProductCardMenu(index)}
            />
          </View>
        </View>
        <View style={{...styles.horizontalSeparator}} />
        <View style={{flexDirection: 'row', padding: 10}}>
          <View style={{borderWidth: 1, borderColor: '#eeeeee'}}>
            {item.image ? (
              <Image
                source={{uri: item.image}}
                style={{height: 120, width: 100}}
              />
            ) : (
              <View
                style={{
                  height: 120,
                  width: 100,
                  backgroundColor: '#eeeeee',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: 'red', fontSize: 12, textAlign: 'center'}}>
                  No Image Available
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              marginLeft: 10,
              flex: 1,
              marginBottom: 10,
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                textTransform: 'capitalize',
                fontWeight: 'bold',
                fontSize: 16,
              }}>
              {item.product_name}
            </Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={{color: '#8d8d8d', fontSize: 13}}>
                Available Quantity:{' '}
              </Text>
              <Text style={{fontSize: 13}}>{item.quantity}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{color: '#8d8d8d', fontSize: 13}}>SKU: </Text>
              <Text style={{textTransform: 'uppercase', fontSize: 13}}>
                {item.sku}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{color: '#8d8d8d', fontSize: 13}}>Posted On: </Text>
              <Text style={{fontSize: 13}}>
                {item.created_at.split(' ')[0]}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{color: '#8d8d8d', fontSize: 13}}>Price: </Text>
              <View style={{flexDirection: 'row', flex: 1}}>
                <Text style={{fontSize: 13, flexShrink: 1}}>
                  ${item.price_after_discount}
                </Text>
                <Text
                  style={{
                    textDecorationLine: 'line-through',
                    color: 'red',
                    fontSize: 13,
                    marginLeft: 6,
                    flexShrink: 1,
                  }}>
                  ${item.actual_price}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  _onLoadMore = async () => {
    const {nextProductListUrl, productList} = this.state;
    const token = await AsyncStorage.getItem('token');
    axios
      .get(nextProductListUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log('onLoadMore=', res);
        if (res.data.product_list.data.length) {
          res.data.product_list.data.map((data) => {
            data.toggle_setting = false;
          });
          this.setState({
            productList: [...productList, ...res.data.product_list.data],
            nextProductListUrl: res.data.product_list.next_page_url,
          });
        } else {
          this.setState({errorMessage: 'Product List is Empty!!'});
        }
      })
      .catch((err) => {
        console.log({...err});
        this.setState({errorMessage: err.response.data.message});
        alert(err.response.data.message);
      });
  };

  render() {
    const {productList, isLoading} = this.state;
    return (
      <View style={{height: '100%'}}>
        <StatusBar backgroundColor="#ffffff" barStyle={'dark-content'} />
        <Header
          placement="left"
          leftComponent={
            <Appbar.BackAction
              color="#fff"
              onPress={() =>
                this.props.navigation.reset({routes: [{name: 'Home'}]})
              }
            />
          }
          centerComponent={{
            text: 'Product List',
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
        />
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: 14,
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>All Products</Text>
            <Button
              onPress={() => this.props.navigation.navigate('AddNewProduct')}
              mode="contained">
              Add Product
            </Button>
          </View>
          {isLoading ? (
            <View
              style={{
                ...StyleSheet.absoluteFill,
                height: '100%',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {this.state.errorMessage ? (
                <Text style={{color: '#8d8d8d'}}>
                  {this.state.errorMessage}
                </Text>
              ) : (
                <ActivityIndicator size={25} color="#6B23AE" />
              )}
            </View>
          ) : (
            <FlatList
              data={productList}
              showsVerticalScrollIndicator={false}
              renderItem={this._onRenderProductList}
              keyExtractor={(item) => `${item.uuid}`}
              contentContainerStyle={{paddingBottom: 200}}
              onEndReached={
                this.state.nextProductListUrl ? this._onLoadMore : null
              }
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                this.state.nextProductListUrl ? (
                  <ActivityIndicator
                    color="#8d8d8d"
                    size={18}
                    style={{marginTop: 10}}
                  />
                ) : null
              }
            />
          )}
        </>

        {this.state.editModalVisibility ? (
          <ProductEditModalComponent
            props={this.props}
            editModalVisibility={this.state.editModalVisibility}
            editProductUUID={this.state.editProductUUID}
            toggleEditModalVisibility={() =>
              this.setState({
                editModalVisibility: !this.state.editModalVisibility,
              })
            }
          />
        ) : null}
      </View>
    );
  }
}

// const initialEditProductDetailsState = {
//     product_name: "",
//     product_desc: "",
//     product_quantity: "",
//     product_no: "",
//     product_highlights: "",
//     product_price: "",
//     discount: "",
//     product_specifications: [],
//     images: [],
// }

class ProductEditModalComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editProductDetails: {},
      isLoading: true,
      categories: [],
      brands: [],
      selectedCategory: {},
      selectedBrand: {},

      additionalSpecifications: [],
      toggleRemoveAdditionalSpecifications: false,
      currentIdOfAddSpec: 0,

      localProductImages: [],
      productImagesBefore: [],
      isImageLoading: false,
      isButtonLoading: false,
    };
  }

  async componentDidMount() {
    // console.log("editProductUUID", this.props.editProductUUID);
    this._editProductDetailsFetch();
  }

  _categoryFetch = async (user_token, url) => {
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + url, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      })
      .then((res) => {
        console.log('categories', res.data.categories.data);
        if (res.data.categories.current_page === 1) {
          this.setState({selectedCategory: res.data.categories.data[0]});
        }
        if (res.data.categories.next_page_url) {
          this._categoryFetch(user_token, res.data.categories.next_page_url);
        }
        this.setState({categories: res.data.categories.data});
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  _brandsFetch = async (user_token, url) => {
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + url, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      })
      .then((res) => {
        console.log('brands', res.data.brands.data);
        if (res.data.brands.current_page === 1) {
          this.setState({selectedBrand: res.data.brands.data[0]});
        }
        if (res.data.brands.next_page_url) {
          this._brandsFetch(user_token, res.data.brands.next_page_url);
        }
        this.setState({brands: res.data.brands.data});
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  _editProductDetailsFetch = async () => {
    this.setState({isLoading: true});
    const token = await AsyncStorage.getItem('token');
    await this._categoryFetch(token, API_FETCH_CATEGORIES_KEY);
    await this._brandsFetch(token, API_FETCH_BRANDS_KEY);

    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_SINGLE_PRODUCT_DETAILS_KEY, {
        params: {
          product_uuid: this.props.editProductUUID,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log('single = ', res);
        this.setState({
          editProductDetails: res.data.product,
          additionalSpecifications: res.data.product.product_specification,
          localProductImages: res.data.product.images
            ? [
                {
                  id: res.data.product.images[0].uuid,
                  uri: res.data.product.images[0].image,
                  local_image: res.data.product.images[0].image,
                  toggle_remove: false,
                  empty: false,
                },
              ]
            : [],
          productImagesBefore: res.data.product.images
            ? [
                {
                  id: res.data.product.images[0].uuid,
                  uri: res.data.product.images[0].image,
                },
              ]
            : [],
        });

        // get product's selected category and store it in selectedCategory
        this.state.categories.map((category, index) => {
          if (category.uuid === res.data.product.category.uuid) {
            this.setState({
              selectedCategory: {
                category:
                  `${category.category}`.charAt(0).toUpperCase() +
                  `${category.category}`.slice(1),
                uuid: category.uuid,
                id: category.id,
              },
            });
          }
        });

        // get product's selected brand and store it in selectedBrand
        this.state.brands.map((brand, index) => {
          if (brand.id === res.data.product.brand_id) {
            this.setState({
              selectedBrand: {
                brand_name:
                  `${brand.brand_name}`.charAt(0).toUpperCase() +
                  `${brand.brand_name}`.slice(1),
                uuid: brand.uuid,
                id: brand.id,
              },
            });
          }
        });

        this.setState({
          localProductImages: [
            {
              id: ``,
              uri: ``,
              empty: false,
              toggle_remove: false,
              local_image: res.data.product.images
                ? res.data.product.images[0].image
                : res.data.product.images,
            },
          ],
        });

        if (res.data.product.images) {
          this.setState({
            productImagesBefore: [
              {
                id: ``,
                uri: ``,
                empty: false,
                toggle_remove: false,
                local_image: res.data.product.images[0].image,
              },
            ],
          });
        }
        console.log(
          this.state.localProductImages,
          this.state.productImagesBefore,
        );
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });

    let localProductImages = this.state.localProductImages,
      productImagesBefore = this.state.productImagesBefore;
    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_GALLERY_IMAGES_KEY, {
        params: {
          product_uuid: this.props.editProductUUID,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log('gallery images = ', res);
        if (res.data.images) {
          res.data.images.map((image_data) => {
            localProductImages = [
              ...localProductImages,
              {
                id: image_data.uuid,
                uri: image_data.image,
                local_image: image_data.image,
                toggle_remove: false,
                empty: false,
              },
            ];
            productImagesBefore = [
              ...productImagesBefore,
              {id: image_data.uuid, uri: image_data.image},
            ];
            // console.log(localProductImages);
          });
          // this.setState({ productImages: [...this.state.productImages, ...res.data.images] });
        }
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });

    if (localProductImages.length === 0) {
      // localProductImages = [...localProductImages, { id: `${Math.random()}`, uri: "", empty: false, toggle_remove: false, local_image:"" }, { id: `${Math.random()}`, uri: "", empty: false, toggle_remove: false, local_image:"" }];
      localProductImages = [
        ...localProductImages,
        {
          id: `${Math.random()}`,
          uri: '',
          empty: false,
          toggle_remove: false,
          local_image: '',
        },
        {id: ``, uri: '', empty: false, toggle_remove: false, local_image: ''},
      ];
    } else if (localProductImages.length < 10) {
      // localProductImages = [...localProductImages, { id: `${Math.random()}`, uri: "", empty: false, toggle_remove: false, local_image:"" }];
      localProductImages = [
        ...localProductImages,
        {id: ``, uri: '', empty: false, toggle_remove: false, local_image: ''},
      ];
    }
    localProductImages = this._formatData(localProductImages, 3);

    this.setState({
      localProductImages: localProductImages,
      productImagesBefore: productImagesBefore,
    });
    this.setState({isLoading: false});
  };

  _onChangeText = (name, text) => {
    this.setState({
      editProductDetails: {...this.state.editProductDetails, [name]: text},
    });
  };

  _onAddSpecificationPress = () => {
    const {additionalSpecifications} = this.state;

    if (additionalSpecifications.length) {
      if (
        additionalSpecifications[additionalSpecifications.length - 1]
          .specification_key &&
        additionalSpecifications[additionalSpecifications.length - 1]
          .specification_value
      ) {
        this.setState({
          additionalSpecifications: [
            ...this.state.additionalSpecifications,
            {
              uuid: '',
              specification_key: '',
              specification_value: '',
            },
          ],
        });
      } else {
        this._onToastMessageSent('Please add a specification before!!');
      }
    } else {
      this.setState({
        additionalSpecifications: [
          ...this.state.additionalSpecifications,
          {uuid: '', specification_key: '', specification_value: ''},
        ],
        currentIdOfAddSpec: this.state.currentIdOfAddSpec + 1,
      });
    }
  };

  // _onChangeSpecificationKey = (specification_key, item_uuid) => {
  //     this.setState({ toggleRemoveAdditionalSpecifications: false });
  //     const additionalSpecItemIds = this.state.additionalSpecifications.map((item) => {return item.uuid});
  //     const indexOfItemToBeModified = additionalSpecItemIds.indexOf(item_uuid);
  //     this.state.additionalSpecifications[indexOfItemToBeModified].specification_key = specification_key;
  //     this.setState({ additionalSpecifications: this.state.additionalSpecifications });
  // }

  _onChangeSpecificationKey = (specification_key, index) => {
    this.setState({toggleRemoveAdditionalSpecifications: false});
    // const additionalSpecItemIds = this.state.additionalSpecifications.map((item) => {return item.uuid});
    // const indexOfItemToBeModified = additionalSpecItemIds.indexOf(item_uuid);
    this.state.additionalSpecifications[
      index
    ].specification_key = specification_key;
    this.setState({
      additionalSpecifications: this.state.additionalSpecifications,
    });
  };

  // _onChangeSpecificationValue = (specification_value, item_uuid) => {
  //     this.setState({ toggleRemoveAdditionalSpecifications: false });
  //     const additionalSpecItemIds = this.state.additionalSpecifications.map((item) => {return item.uuid});
  //     const indexOfItemToBeModified = additionalSpecItemIds.indexOf(item_uuid);
  //     this.state.additionalSpecifications[indexOfItemToBeModified].specification_value = specification_value;
  //     this.setState({ additionalSpecifications: this.state.additionalSpecifications });
  // }

  _onChangeSpecificationValue = (specification_value, index) => {
    this.setState({toggleRemoveAdditionalSpecifications: false});
    // const additionalSpecItemIds = this.state.additionalSpecifications.map((item) => {return item.uuid});
    // const indexOfItemToBeModified = additionalSpecItemIds.indexOf(item_uuid);
    this.state.additionalSpecifications[
      index
    ].specification_value = specification_value;
    this.setState({
      additionalSpecifications: this.state.additionalSpecifications,
    });
  };

  _onRemoveSpecificationPress = async (item_uuid) => {
    if (item_uuid) {
      const token = await AsyncStorage.getItem('token');
      await axios
        .post(
          UNIVERSAL_ENTRY_POINT_ADDRESS + API_DELETE_PRODUCT_SPECIFICATIONS_KEY,
          {
            product_uuid: this.props.editProductUUID,
            specification_uuid: item_uuid,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((res) => {
          console.log('delete-specification', res);
        })
        .catch((err) => {
          console.log({...err});
          alert(err.response.data.message);
        });
    }
    const additionalSpecItemIds = this.state.additionalSpecifications.map(
      (item) => {
        return item.uuid;
      },
    );
    const indexOfItemToBeRemoved = additionalSpecItemIds.indexOf(item_uuid);
    this.state.additionalSpecifications.splice(indexOfItemToBeRemoved, 1);
    this.setState({
      additionalSpecifications: this.state.additionalSpecifications,
    });
  };

  _base64Converter = async (productImages) => {
    console.log(productImages);
    let product_images = [];
    product_images = productImages.filter((img_data, index) => {
      return img_data.local_image;
    });
    const asyncRes = await Promise.all(
      product_images.map(async (img_data) => {
        let response = await RNFS.readFile(img_data.local_image, 'base64');
        return `data:jpg;base64,${response}`;
      }),
    );
    return asyncRes;
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

  _onSubmitEdittingProduct = async () => {
    this.setState({isButtonLoading: true});
    const token = await AsyncStorage.getItem('token');
    const {productImagesBefore} = this.state;
    let removedFormattedData = this.state.localProductImages.filter((item) => {
      return item.local_image;
    });

    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_PRODUCT_UPDATE_KEY,
        {
          uuid: this.state.editProductDetails.uuid,
          product_category: this.state.selectedCategory.id,
          brand: this.state.selectedBrand.id,
          sku: this.state.editProductDetails.sku,
          product_name: this.state.editProductDetails.product_name,
          highlights: this.state.editProductDetails.highlights,
          details: this.state.editProductDetails.details,
          actual_price: this.state.editProductDetails.actual_price,
          discount: this.state.editProductDetails.discount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => {
        // console.log(res);
        // console.log(removedFormattedData, productImagesBefore);

        let additionalSpecifications = this.state.additionalSpecifications.filter(
          (specification_data) =>
            specification_data.specification_key &&
            specification_data.specification_value,
        );
        additionalSpecifications.map(async (specification_data) => {
          if (specification_data.uuid) {
            await axios
              .post(
                UNIVERSAL_ENTRY_POINT_ADDRESS +
                  API_DELETE_PRODUCT_SPECIFICATIONS_KEY,
                {
                  product_uuid: this.props.editProductUUID,
                  specification_uuid: specification_data.uuid,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              )
              .then((res) => {
                console.log('delete-specification', res);
              })
              .catch((err) => {
                console.log({...err});
                alert(err.response.data.message);
              });
          }

          const header_data = {
            product_uuid: this.props.editProductUUID,
            specification_key: specification_data.specification_key,
            specification_value: specification_data.specification_value,
          };
          await axios
            .post(
              UNIVERSAL_ENTRY_POINT_ADDRESS +
                API_ADD_PRODUCT_SPECIFICATIONS_KEY,
              header_data,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )
            .then((res) => {
              console.log('add-specification', res);
            })
            .catch((err) => {
              console.log({...err});
              alert(err.response.data.message);
            });
        });

        if (removedFormattedData.length >= productImagesBefore.length) {
          let imagesToBeReplacedFiltered = productImagesBefore.filter(
            (item, index) => removedFormattedData[index].id !== item.id,
          );
          let imagesToBeReplaced = imagesToBeReplacedFiltered.map(
            (data, index) => {
              return {
                old_img_uuid: data.id,
                local_image: removedFormattedData[index].uri,
              };
            },
          );
          // console.log("imagesToBeReplaced", imagesToBeReplaced);

          if (imagesToBeReplaced.length) {
            imagesToBeReplaced.map((data) => {
              const header_data = {
                product_uuid: this.props.editProductUUID,
                image_uuid: data.old_img_uuid,
              };
              // const token = await AsyncStorage.getItem('token');
              axios
                .post(
                  UNIVERSAL_ENTRY_POINT_ADDRESS +
                    API_PRODUCT_GALLERY_IMAGE_DELETE_KEY,
                  header_data,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                )
                .then((res) => {
                  console.log('toberepalce - delete1', res);
                })
                .catch((err) => {
                  console.log({...err});
                });
            });

            this._base64Converter(imagesToBeReplaced)
              .then((res) => {
                console.log(res);
                res.map((img_base64) => {
                  const header_data = {
                    uuid: this.props.editProductUUID,
                    gallery_image: img_base64,
                  };
                  // const token = await AsyncStorage.getItem('token');
                  axios
                    .post(
                      UNIVERSAL_ENTRY_POINT_ADDRESS +
                        API_PRODUCT_ADD_GALLERY_IMAGE_KEY,
                      header_data,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    )
                    .then((res) => {
                      console.log('tobereplace - addd1', res);
                    })
                    .catch((err) => {
                      console.log({...err});
                    });
                });
              })
              .catch((err) => {
                console.log({...err});
              });
          }

          let imagesToBeAdded = removedFormattedData.filter((item, index) => {
            if (index > productImagesBefore.length - 1) {
              return item;
            }
          });
          // console.log("imagesToBeAdded", imagesToBeAdded);

          if (imagesToBeAdded.length) {
            this._base64Converter(imagesToBeAdded)
              .then((res) => {
                console.log(res);
                res.map(async (img_base64) => {
                  const header_data = {
                    uuid: this.props.editProductUUID,
                    gallery_image: img_base64,
                  };
                  const token = await AsyncStorage.getItem('token');
                  axios
                    .post(
                      UNIVERSAL_ENTRY_POINT_ADDRESS +
                        API_PRODUCT_ADD_GALLERY_IMAGE_KEY,
                      header_data,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    )
                    .then((res) => {
                      console.log('tobeaddd2=', res);
                    })
                    .catch((err) => {
                      console.log({...err});
                    });
                });
              })
              .catch((err) => {
                console.log({...err});
              });
          }
        } else if (removedFormattedData.length < productImagesBefore.length) {
          let imagesToBeReplacedFiltered = removedFormattedData.filter(
            (item, index) => item.id !== productImagesBefore[index].id,
          );
          let imagesToBeReplaced = imagesToBeReplacedFiltered.map(
            (data, index) => {
              return {
                old_img_uuid: removedFormattedData[index].id,
                local_image: data.uri,
              };
            },
          );

          // console.log(imagesToBeReplacedFiltered, imagesToBeReplaced)

          if (imagesToBeReplaced.length) {
            imagesToBeReplaced.map(async (data) => {
              const header_data = {
                product_uuid: this.props.editProductUUID,
                image_uuid: data.old_img_uuid,
              };
              const token = await AsyncStorage.getItem('token');
              axios
                .post(
                  UNIVERSAL_ENTRY_POINT_ADDRESS +
                    API_PRODUCT_GALLERY_IMAGE_DELETE_KEY,
                  header_data,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                )
                .then((res) => {
                  console.log('tbr- delete2=', res);
                })
                .catch((err) => {
                  console.log({...err});
                });
            });

            this._base64Converter(imagesToBeReplacedFiltered)
              .then((res) => {
                console.log(res);
                res.map(async (img_base64) => {
                  const header_data = {
                    uuid: this.props.editProductUUID,
                    gallery_image: img_base64,
                  };
                  // const token = await AsyncStorage.getItem('token');
                  axios
                    .post(
                      UNIVERSAL_ENTRY_POINT_ADDRESS +
                        API_PRODUCT_ADD_GALLERY_IMAGE_KEY,
                      header_data,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    )
                    .then((res) => {
                      console.log('tbr - add3', res);
                    })
                    .catch((err) => {
                      console.log({...err});
                    });
                });
              })
              .catch((err) => {
                console.log({...err});
              });
          }

          let imagesToBeRemoved = productImagesBefore.filter(
            (item, index) => index > removedFormattedData.length - 1,
          );
          imagesToBeRemoved.map((data) => {
            const header_data = {
              product_uuid: this.props.editProductUUID,
              image_uuid: data.id,
            };
            // const token = await AsyncStorage.getItem('token');
            axios
              .post(
                UNIVERSAL_ENTRY_POINT_ADDRESS +
                  API_PRODUCT_GALLERY_IMAGE_DELETE_KEY,
                header_data,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              )
              .then((res) => {
                console.log('dele3=', res);
              })
              .catch((err) => {
                console.log({...err});
              });
          });
        }
      })
      .then(() => {
        this.setState({isButtonLoading: false});
        this._onToastMessageSent('Product Upated Successfully');
        this._onModalClose();
        this.props.props.navigation.reset({routes: [{name: 'ProductList'}]});
        // this.props.navigation.push('ProductList');
      })
      .catch((err) => {
        console.log('error!!!');
        this.setState({isButtonLoading: false});
        console.log({...err});
      });
  };

  _onImagePicker = (image_index, is_multi_select) => {
    let imageValidSize = 5120; //In KB(5 MB);
    this.setState({isImageLoading: true});
    if (!is_multi_select) {
      ImagePicker.openPicker({
        cropping: true,
        includeBase64: true,
        mediaType: 'photo',
      })
        .then(async (img_data) => {
          if (
            img_data.mime === 'image/jpeg' ||
            img_data.mime === 'image/jpg' ||
            img_data.mime === 'image/png' ||
            img_data.mime === 'image/bmp'
          ) {
            if (Math.ceil(img_data.size / 1024) <= imageValidSize) {
              this.state.localProductImages[image_index].local_image =
                img_data.path;
              // this.state.localProductImages[image_index].uri = `data:${img_data.mime};base64,` + img_data.data;
              this.state.localProductImages[image_index].uri = ``;
              this.state.localProductImages[image_index].id = ``;
              // this.state.localProductImages[image_index].feature_image = true;
              this.setState({
                localProductImages: this.state.localProductImages,
              });
              let img_base64 = await RNFS.readFile(img_data.path, 'base64');
              img_base64 = `data:jpg;base64,${img_base64}`;
              const token = await AsyncStorage.getItem('token');
              const header_data = {
                uuid: this.props.editProductUUID,
                feature_image: img_base64,
              };
              axios
                .post(
                  UNIVERSAL_ENTRY_POINT_ADDRESS + API_UPDATE_FEATURE_IMAGE_KEY,
                  header_data,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                )
                .then((res) => {
                  console.log('addd-img', res);
                })
                .catch((err) => {
                  console.log({...err});
                });
            } else {
              alert('Image size exceeds 5 MB!!');
            }
          } else {
            alert(
              'Invalid Image Type. Only JPEG, PNG, JPG or BMP types allowed!!',
            );
          }
          this.setState({isImageLoading: false});
        })
        .catch((err) => {
          console.log({...err});
          this.setState({isImageLoading: false});
        });
    } else {
      ImagePicker.openPicker({
        // includeBase64: true,
        maxFiles: 9,
        mediaType: 'photo',
        minFiles: 1,
        multiple: true,
        // compressImageQuality:0.2,
      })
        .then((images) => {
          console.log(images);
          if (images.length < 10) {
            let tempProductImages = this.state.localProductImages;
            let localProductImages = [];
            tempProductImages.map((data, index) => {
              if (index < image_index) {
                localProductImages = [
                  ...localProductImages,
                  tempProductImages[index],
                ];
              } else if (data.local_image) {
                localProductImages = [...localProductImages, data];
              }
            });
            if (localProductImages.length + images.length <= 10) {
              images.map((img_data) => {
                if (
                  img_data.mime === 'image/jpeg' ||
                  img_data.mime === 'image/jpg' ||
                  img_data.mime === 'image/png' ||
                  img_data.mime === 'image/bmp'
                ) {
                  if (Math.ceil(img_data.size / 1024) <= imageValidSize) {
                    // productImages = [...productImages, { id: this.state.currentIdOfProductImg, uri: ``, local_path: img_data.path }];
                    localProductImages = [
                      ...localProductImages,
                      {id: ``, uri: ``, local_image: img_data.path},
                    ];
                    this.setState({localProductImages: localProductImages});
                  } else {
                    // console.log("image_exceed", img_data);
                    this.setState({localProductImages: tempProductImages});
                    alert('One of the Images exceeds 5 MB size limit!!');
                  }
                } else {
                  // console.log("image_invalid", img_data);
                  this.setState({localProductImages: tempProductImages});
                  alert(
                    'Invalid Image Type. Only JPEG, PNG, JPG or BMP types allowed!!',
                  );
                }
              });
              if (this.state.localProductImages.length < 10) {
                // this.setState({ productImages: [...this.state.productImages, { id: this.state.currentIdOfProductImg, uri: "", local_path: "" }], currentIdOfProductImg: this.state.currentIdOfProductImg + 1 });
                this.setState({
                  localProductImages: [
                    ...this.state.localProductImages,
                    {id: ``, uri: '', local_image: ''},
                  ],
                  currentIdOfProductImg: this.state.currentIdOfProductImg + 1,
                });
              }
              this.state.localProductImages = this._formatData(
                this.state.localProductImages,
                3,
              );
              this.setState({
                localProductImages: this.state.localProductImages,
              });
            } else {
              alert(
                `Only total of 10 images are allowed to upload. You've already uploaded ${localProductImages.length} images!!`,
              );
            }
          } else {
            alert('Only 10 images are allowed to upload!!');
          }
          this.setState({isImageLoading: false});
        })
        .catch((err) => {
          console.log({...err});
          this.setState({isImageLoading: false});
        });
    }
  };

  _handlerCategoryInput = (selected_category) => {
    this.setState({selectedCategory: selected_category});
  };

  _handlerBrandInput = (selected_brand) => {
    this.setState({selectedBrand: selected_brand});
  };

  _onModalClose = () => {
    this.setState({
      editProductDetails: {},
      isLoading: true,
      categories: [],
      selectedCategory: {},

      additionalSpecifications: [],
      productImages: [],
      toggleRemoveAdditionalSpecifications: false,
      currentIdOfAddSpec: 0,

      localProductImages: [],
      isImageLoading: false,
    });
    this.props.toggleEditModalVisibility();
  };

  _formatData = (data, numColumns) => {
    let formatted_data = data;
    const numOfFullRows = Math.floor(formatted_data.length / numColumns);
    let numOfElementsLastRow =
      formatted_data.length - numOfFullRows * numColumns;
    while (numOfElementsLastRow !== numColumns && numOfElementsLastRow !== 0) {
      // formatted_data.push({ id: `${Math.random()}`, uri: "", empty: true, toggle_remove: false, local_image:"" });
      formatted_data.push({
        id: ``,
        uri: '',
        empty: true,
        toggle_remove: false,
        local_image: '',
      });
      numOfElementsLastRow++;
    }
    return formatted_data;
  };

  _onProductImageLongPress = (product_index) => {
    console.log('p_i', product_index);
    this.state.localProductImages[product_index].toggle_remove = !this.state
      .localProductImages[product_index].toggle_remove;
    this.setState({localProductImages: this.state.localProductImages});
  };

  _onRemoveProductImagePress = (product_index, arr) => {
    let filteredArr = arr.filter((data) => data.local_image);

    if (filteredArr.length === 10 || product_index === 0) {
      arr[product_index] = {local_path: '', id: ``};
    } else {
      arr.splice(product_index, 1);
    }
    arr = this._formatData(arr, 3);
    this.setState({localProductImages: arr});
  };

  render() {
    const {
      editProductDetails,
      additionalSpecifications,
      localProductImages,
    } = this.state;
    // const screenWidth = Math.round(Dimensions.get('window').width);

    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
        }}>
        <Modal animationType="slide" transparent={true} visible={true}>
          <SafeAreaView
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              height: '92%',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: !this.state.isLoading
                  ? 'space-between'
                  : 'center',
                marginHorizontal: 14,
              }}>
              <IconButton
                icon="arrow-down"
                onPress={() => this._onModalClose()}
              />
              {!this.state.isLoading ? (
                <Text
                  style={{
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}>
                  {editProductDetails.product_name}
                </Text>
              ) : null}
              {!this.state.isLoading ? (
                <IconButton
                  icon="refresh"
                  onPress={() => this._editProductDetailsFetch()}
                />
              ) : null}
            </View>
            <View style={{...styles.horizontalSeparator}} />

            {!this.state.isLoading ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* {productImages.length ?
                            <View>
                                <FlatListSlider
                                    // data={localProductImages}
                                    data={productImages}
                                    timer={3000}
                                    imageKey={'image'}
                                    local={false}
                                    width={screenWidth}
                                    separator={0}
                                    loop={false}
                                    autoscroll={false}
                                    currentIndexCallback={index => console.log('Index', index)}
                                    onPress={(item) => this._onImageEditPress(item)}
                                    indicator
                                    animation
                                    component={<ChildItem />}
                                />
                                <View style={{position:'absolute', top:10, right:0, height:34, paddingRight:10, elevation:20, borderTopRightRadius:0, borderBottomRightRadius:0, backgroundColor:'white', justifyContent:'center', borderTopLeftRadius:34/2, borderBottomLeftRadius:34/2}} pointerEvents='none'>
                                    <IconButton icon='pencil' size={18} />
                                </View>
                            </View> : null} */}

                <View style={{padding: 14}}>
                  <View style={{...styles.inputsGroup, paddingBottom: 100}}>
                    <View style={{marginBottom: 10, marginTop: 12}}>
                      <Text style={{fontWeight: 'bold', fontSize: 18}}>
                        Product Information
                      </Text>
                    </View>
                    <View>
                      <Text>Select Category</Text>
                      <View style={{marginTop: 6, height: 45}}>
                        <RNPicker
                          dataSource={this.state.categories}
                          dummyDataSource={this.state.categories}
                          pickerTitle={'Select Category'}
                          showSearchBar={true}
                          disablePicker={false}
                          placeHolderLabel={
                            this.state.selectedCategory.category
                          }
                          placeHolderTextStyle={{
                            color: '#000',
                            padding: 10,
                            textAlign: 'left',
                            width: '99%',
                            flexDirection: 'row',
                          }}
                          selectedLabel={this.state.selectedCategory.category}
                          changeAnimation={'none'}
                          searchBarPlaceHolder={'Search.....'}
                          showPickerTitle={true}
                          pickerStyle={styles.pickerStyle}
                          dataSourceKey="category"
                          selectedValue={(index, item) =>
                            this._handlerCategoryInput(item)
                          }
                        />
                      </View>
                    </View>
                    <View style={{marginTop: 10}}>
                      <Text>Select Brand</Text>
                      <View style={{marginTop: 6, height: 45}}>
                        <RNPicker
                          dataSource={this.state.brands}
                          dummyDataSource={this.state.brands}
                          pickerTitle={'Select Brand'}
                          showSearchBar={true}
                          disablePicker={false}
                          placeHolderLabel={this.state.selectedBrand.brand_name}
                          placeHolderTextStyle={{
                            color: '#000',
                            padding: 10,
                            textAlign: 'left',
                            width: '99%',
                            flexDirection: 'row',
                          }}
                          selectedLabel={this.state.selectedBrand.brand_name}
                          changeAnimation={'none'}
                          searchBarPlaceHolder={'Search.....'}
                          showPickerTitle={true}
                          pickerStyle={styles.pickerStyle}
                          dataSourceKey="brand_name"
                          selectedValue={(index, item) =>
                            this._handlerBrandInput(item)
                          }
                        />
                      </View>
                    </View>
                    <View style={{marginTop: 10}}>
                      <TextInput
                        value={editProductDetails.product_name}
                        mode="outlined"
                        dense
                        label="Product Name*"
                        style={{backgroundColor: 'white'}}
                        onChangeText={(text) =>
                          this._onChangeText('product_name', text)
                        }
                        onSubmitEditing={() => this.lastName.focus()}
                      />
                    </View>
                    <View style={{marginTop: 10}}>
                      <TextInput
                        value={`${editProductDetails.sku}`}
                        mode="outlined"
                        dense
                        label="Product Number*"
                        style={{backgroundColor: 'white'}}
                        onChangeText={(text) => this._onChangeText('sku', text)}
                        onSubmitEditing={() => this.lastName.focus()}
                      />
                    </View>
                    <View style={{marginTop: 10}}>
                      <TextInput
                        value={`${editProductDetails.quantity}`}
                        mode="outlined"
                        dense
                        label="Product Quantity*"
                        keyboardType="number-pad"
                        style={{backgroundColor: 'white'}}
                        onChangeText={(text) =>
                          this._onChangeText('quantity', text)
                        }
                        onSubmitEditing={() => this.lastName.focus()}
                      />
                    </View>
                    <View style={{marginTop: 10}}>
                      <TextInput
                        value={editProductDetails.details}
                        mode="outlined"
                        // dense
                        label="Product Description*"
                        multiline
                        style={{backgroundColor: 'white'}}
                        onChangeText={(text) =>
                          this._onChangeText('details', text)
                        }
                        onSubmitEditing={() => this.lastName.focus()}
                      />
                    </View>
                    <View style={{marginTop: 10}}>
                      <TextInput
                        value={editProductDetails.highlights}
                        mode="outlined"
                        // dense
                        label="Product Highlights*"
                        multiline
                        style={{backgroundColor: 'white'}}
                        onChangeText={(text) =>
                          this._onChangeText('highlights', text)
                        }
                        onSubmitEditing={() => this.lastName.focus()}
                      />
                    </View>
                    <View style={{marginTop: 10}}>
                      <TextInput
                        value={editProductDetails.price_after_discount}
                        mode="outlined"
                        dense
                        label="Product Price*"
                        style={{backgroundColor: 'white'}}
                        keyboardType="number-pad"
                        onChangeText={(text) =>
                          this._onChangeText('price_after_discount', text)
                        }
                        onSubmitEditing={() => this.lastName.focus()}
                      />
                    </View>
                    <View style={{marginTop: 10}}>
                      <TextInput
                        value={`${editProductDetails.discount}`}
                        mode="outlined"
                        dense
                        label="Discount(%)"
                        keyboardType="number-pad"
                        style={{backgroundColor: 'white'}}
                        onChangeText={(text) =>
                          this._onChangeText('discount', text)
                        }
                        onSubmitEditing={() => this.lastName.focus()}
                      />
                    </View>

                    <View
                      style={{
                        marginTop: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text style={{fontWeight: 'bold', fontSize: 18}}>
                        Additional Specifications
                      </Text>
                      <View style={{flexDirection: 'row'}}>
                        <IconButton
                          icon="minus"
                          color="#000"
                          onPress={() =>
                            this.setState({
                              toggleRemoveAdditionalSpecifications: !this.state
                                .toggleRemoveAdditionalSpecifications,
                            })
                          }
                        />
                        <IconButton
                          icon="plus"
                          color="#000"
                          onPress={() => this._onAddSpecificationPress()}
                        />
                      </View>
                    </View>
                    {!additionalSpecifications.length ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 0,
                          }}>
                          <TextInput
                            value={'Size'}
                            mode="outlined"
                            disabled
                            dense
                            label="Specification*"
                            style={{backgroundColor: 'white', width: '48%'}}
                            onSubmitEditing={() => this.lastName.focus()}
                          />
                          <TextInput
                            value={'12'}
                            mode="outlined"
                            dense
                            disabled
                            label="Value*"
                            style={{backgroundColor: 'white', width: '48%'}}
                            onSubmitEditing={() => this.lastName.focus()}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 10,
                          }}>
                          <TextInput
                            value={'Color'}
                            mode="outlined"
                            disabled
                            dense
                            label="Specification*"
                            style={{backgroundColor: 'white', width: '48%'}}
                            onSubmitEditing={() => this.lastName.focus()}
                          />
                          <TextInput
                            value={'White'}
                            mode="outlined"
                            dense
                            disabled
                            label="Value*"
                            style={{backgroundColor: 'white', width: '48%'}}
                            onSubmitEditing={() => this.lastName.focus()}
                          />
                        </View>
                      </>
                    ) : null}

                    {additionalSpecifications.map((item, index) => {
                      return (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: index === 0 ? 0 : 10,
                          }}>
                          <TextInput
                            value={item.specification_key}
                            mode="outlined"
                            dense
                            label="Specification*"
                            style={{
                              backgroundColor: 'white',
                              flex: 1,
                              marginRight: this.state
                                .toggleRemoveAdditionalSpecifications
                                ? 0
                                : 7,
                            }}
                            // onChangeText={(key) => {this._onChangeSpecificationKey(key, item.uuid)}}
                            onChangeText={(key) => {
                              this._onChangeSpecificationKey(key, index);
                            }}
                          />

                          {this.state.toggleRemoveAdditionalSpecifications ? (
                            <View style={{marginTop: 6}}>
                              <IconButton
                                icon="minus"
                                size={16}
                                style={{backgroundColor: '#eeeeee'}}
                                color="#000"
                                onPress={() =>
                                  this._onRemoveSpecificationPress(item.uuid)
                                }
                              />
                            </View>
                          ) : null}

                          <TextInput
                            value={item.specification_value}
                            mode="outlined"
                            dense
                            label="Value*"
                            style={{
                              backgroundColor: 'white',
                              flex: 1,
                              marginLeft: this.state
                                .toggleRemoveAdditionalSpecifications
                                ? 0
                                : 7,
                            }}
                            onChangeText={(val) => {
                              // this._onChangeSpecificationValue(val, item.uuid)
                              this._onChangeSpecificationValue(val, index);
                            }}
                          />
                        </View>
                      );
                    })}

                    {localProductImages.length ? (
                      <View>
                        <View
                          style={{
                            marginTop: 20,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <Text style={{fontWeight: 'bold', fontSize: 18}}>
                            Product Images
                          </Text>
                          {this.state.isImageLoading && (
                            <ActivityIndicator size={18} color="purple" />
                          )}
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 6,
                          }}>
                          {localProductImages.map((item, index) => {
                            return item.empty ? (
                              <View
                                key={index}
                                style={{
                                  marginTop: 10,
                                  height: 100,
                                  width: 100,
                                  backgroundColor: 'transparent',
                                }}
                              />
                            ) : (
                              <View
                                key={index}
                                style={{
                                  marginTop: 10,
                                  height: 100,
                                  width: 100,
                                  ...styles.elevation,
                                  backgroundColor: '#eeeeee',
                                  borderRadius: 6,
                                }}>
                                {item.local_image ? (
                                  <TouchableOpacity
                                    onPress={
                                      item.toggle_remove
                                        ? () =>
                                            this._onProductImageLongPress(index)
                                        : () =>
                                            this._onImagePicker(index, false)
                                    }
                                    onLongPress={() =>
                                      this._onProductImageLongPress(index)
                                    }
                                    delayLongPress={100}
                                    activeOpacity={0.6}>
                                    <ImageBackground
                                      borderRadius={6}
                                      style={{
                                        resizeMode: 'cover',
                                        height: 100,
                                        width: 100,
                                        overflow: 'hidden',
                                        borderWidth: index === 0 ? 2 : null,
                                        borderColor:
                                          index === 0 ? '#4285F4' : null,
                                        borderRadius: 6,
                                      }}
                                      source={{uri: item.local_image}}>
                                      {item.toggle_remove ? (
                                        <TouchableWithoutFeedback
                                          style={{
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            height: '100%',
                                            width: '100%',
                                            borderRadius: 6,
                                          }}>
                                          <IconButton
                                            onPress={
                                              index !== 0
                                                ? () =>
                                                    this._onRemoveProductImagePress(
                                                      index,
                                                      localProductImages,
                                                    )
                                                : () => {
                                                    this._onToastMessageSent(
                                                      "You can't delete feature image. You can only update it.",
                                                    );
                                                    this._onProductImageLongPress(
                                                      index,
                                                    );
                                                  }
                                            }
                                            icon="minus"
                                            style={{backgroundColor: '#fff'}}
                                            size={14}
                                          />
                                        </TouchableWithoutFeedback>
                                      ) : null}
                                    </ImageBackground>
                                  </TouchableOpacity>
                                ) : (
                                  <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() =>
                                      !item.toggle_remove
                                        ? this._onImagePicker(
                                            index,
                                            index === 0 ? false : true,
                                          )
                                        : null
                                    }>
                                    <View
                                      style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        marginTop: -2,
                                      }}>
                                      <Picture height={40} width={40} />
                                      <Text
                                        style={{
                                          fontSize: 12,
                                          color: '#8d8d8d',
                                        }}>
                                        {index === 0
                                          ? 'Feature Image'
                                          : 'Gallery Images'}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ) : null}
                    <View style={{marginTop: 40}}>
                      <Button
                        loading={this.state.isButtonLoading ? true : false}
                        mode="contained"
                        onPress={() => this._onSubmitEdittingProduct()}>
                        {this.state.isButtonLoading ? `` : `Edit Product`}
                      </Button>
                    </View>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View
                style={{
                  ...StyleSheet.absoluteFill,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size={25} color="purple" />
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  horizontalSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#eeeeee',
  },

  elevation: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.8,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  productCard: {
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 6,
    marginHorizontal: 14,
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
