import React, {Component} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  Image,
  Platform,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {Appbar, Button, IconButton, TextInput} from 'react-native-paper';
import {Header} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import Picture from '../assets/default_gallery.svg';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_FETCH_CATEGORIES_KEY,
  API_ADD_PRODUCT_KEY,
  API_ADD_GALLERY_IMAGE_KEY,
  API_ADD_FEATURE_IMAGE_KEY,
  API_FETCH_BRANDS_KEY,
} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNPicker from './rn-modal-picker';
import ImagePicker from 'react-native-image-crop-picker';
import {Pressable} from 'react-native';
import RNFS from 'react-native-fs';
import {ToastAndroid} from 'react-native';

export default class AddNewProduct extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      brands: [],

      toggleRemoveAdditionalSpecifications: false,
      currentIdOfAddSpec: 0,
      currentIdOfProductImg: 0,

      selectedCategory: {},
      selectedBrand: {},
      productImages: [],
      additionalSpecifications: [],
      product_name: '',
      product_desc: '',
      product_quantity: '',
      product_no: '',
      product_highlights: '',
      product_price: '',
      discount: '',
      errDiscount: '',

      isLoading: true,
      isAPILoader: false,
      isImageLoading: false,

      errMessage: '',
    };
  }

  async componentDidMount() {
    //cetgories fetch
    const token = await AsyncStorage.getItem('token');
    await this._categoryFetch(token, API_FETCH_CATEGORIES_KEY);
    await this._brandsFetch(token, API_FETCH_BRANDS_KEY);

    //To add a gallery image in an array
    await this.setState({
      productImages: [
        ...this.state.productImages,
        {id: this.state.currentIdOfProductImg, local_path: ''},
      ],
      currentIdOfProductImg: this.state.currentIdOfProductImg + 1,
    });
    await this.setState({
      productImages: [
        ...this.state.productImages,
        {id: this.state.currentIdOfProductImg, local_path: ''},
      ],
      currentIdOfProductImg: this.state.currentIdOfProductImg + 1,
    });
    var productImages = await this._formatData(this.state.productImages, 3);
    await this.setState({productImages: productImages});
  }

  _categoryFetch = async (user_token, url) => {
    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + url, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      })
      .then((res) => {
        if (res.data.categories.data.length) {
          if (res.data.categories.current_page === 1) {
            this.setState({selectedCategory: res.data.categories.data[0]});
          }
          if (res.data.categories.next_page_url) {
            this._categoryFetch(user_token, res.data.categories.next_page_url);
          }
          this.setState({
            categories: res.data.categories.data,
          });
        } else {
          this.setState({
            errMessage: 'No categories added by admin.',
          });
        }
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  _brandsFetch = async (user_token, url) => {
    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + url, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      })
      .then((res) => {
        if (res.data.brands.data.length) {
          if (res.data.brands.current_page === 1) {
            this.setState({selectedBrand: res.data.brands.data[0]});
          }
          if (res.data.brands.next_page_url) {
            this._brandsFetch(user_token, res.data.brands.next_page_url);
          }
          this.setState({
            brands: res.data.brands.data,
            isLoading: false,
          });
        } else {
          this.setState({
            isLoading: true,
            errMessage: 'No brands added by admin.',
          });
        }
      })
      .catch((err) => {
        console.log({...err});
        alert(err.response.data.message);
      });
  };

  _onChangeText = (name, text) => {
    this.setState({[name]: text});
  };

  _onAddSpecificationPress = () => {
    if (this.state.additionalSpecifications.length) {
      if (
        this.state.additionalSpecifications[this.state.currentIdOfAddSpec - 1]
          .specification_key &&
        this.state.additionalSpecifications[this.state.currentIdOfAddSpec - 1]
          .specification_value
      ) {
        this.setState({
          additionalSpecifications: [
            ...this.state.additionalSpecifications,
            {
              id: this.state.currentIdOfAddSpec,
              specification_key: '',
              specification_value: '',
            },
          ],
          currentIdOfAddSpec: this.state.currentIdOfAddSpec + 1,
        });
      } else {
        alert('Please add a specification before!!');
      }
    } else {
      this.setState({
        additionalSpecifications: [
          ...this.state.additionalSpecifications,
          {
            id: this.state.currentIdOfAddSpec,
            specification_key: '',
            specification_value: '',
          },
        ],
        currentIdOfAddSpec: this.state.currentIdOfAddSpec + 1,
      });
    }
  };

  _onAddProductImagePress = () => {
    if (this.state.productImages.length) {
      if (
        this.state.productImages[this.state.currentIdOfProductImg - 1]
          .local_path
      ) {
        this.setState({
          productImages: [
            ...this.state.productImages,
            {id: this.state.currentIdOfProductImg, toggle_remove: false},
          ],
          currentIdOfProductImg: this.state.currentIdOfProductImg + 1,
        });
      } else {
        alert('Please add an image before!!');
      }
    } else {
      this.setState({
        productImages: [
          ...this.state.productImages,
          {id: this.state.currentIdOfProductImg, toggle_remove: false},
        ],
        currentIdOfProductImg: this.state.currentIdOfProductImg + 1,
      });
    }
  };

  _onChangeSpecificationKey = (specification_key, item_id) => {
    this.setState({toggleRemoveAdditionalSpecifications: false});
    const additionalSpecItemIds = this.state.additionalSpecifications.map(
      (item) => {
        return item.id;
      },
    );
    const indexOfItemToBeModified = additionalSpecItemIds.indexOf(item_id);
    this.state.additionalSpecifications[
      indexOfItemToBeModified
    ].specification_key = specification_key;
    this.setState({
      additionalSpecifications: this.state.additionalSpecifications,
    });
  };

  _onChangeSpecificationValue = (specification_value, item_id) => {
    this.setState({toggleRemoveAdditionalSpecifications: false});
    const additionalSpecItemIds = this.state.additionalSpecifications.map(
      (item) => {
        return item.id;
      },
    );
    const indexOfItemToBeModified = additionalSpecItemIds.indexOf(item_id);
    this.state.additionalSpecifications[
      indexOfItemToBeModified
    ].specification_value = specification_value;
    this.setState({
      additionalSpecifications: this.state.additionalSpecifications,
    });
  };

  _onRemoveSpecificationPress = (item_id) => {
    const additionalSpecItemIds = this.state.additionalSpecifications.map(
      (item) => {
        return item.id;
      },
    );
    const indexOfItemToBeRemoved = additionalSpecItemIds.indexOf(item_id);
    this.state.additionalSpecifications.splice(indexOfItemToBeRemoved, 1);
    this.setState({
      additionalSpecifications: this.state.additionalSpecifications,
    });
  };

  _onProductImageLongPress = (product_index) => {
    this.state.productImages[product_index].toggle_remove = !this.state
      .productImages[product_index].toggle_remove;
    this.setState({productImages: this.state.productImages});
  };

  _onRemoveProductImagePress = (product_index, arr_length) => {
    if (arr_length === 3) {
      this.state.productImages[product_index] = {local_path: '', id: 0};
    } else {
      this.state.productImages.splice(product_index, 1);
    }
    this.state.productImages = this._formatData(this.state.productImages, 3);
    this.setState({productImages: this.state.productImages});
  };

  _onImagePicker = (image_index) => {
    let imageValidSize = 5120; //In KB(5 MB);
    this.setState({isImageLoading: true});
    if (image_index === 0) {
      ImagePicker.openPicker({
        cropping: true,
        // includeBase64: true,
        mediaType: 'photo',
      })
        .then((img_data) => {
          if (
            img_data.mime === 'image/jpeg' ||
            img_data.mime === 'image/jpg' ||
            img_data.mime === 'image/png' ||
            img_data.mime === 'image/bmp'
          ) {
            if (Math.ceil(img_data.size / 1024) <= imageValidSize) {
              console.log(img_data);
              // this.state.productImages[image_index].uri = ``;
              // this.state.productImages[image_index].uri = `data:${img_data.mime};base64,` + img_data.data;
              this.state.productImages[image_index].local_path = img_data.path;
              this.setState({productImages: this.state.productImages});
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
          this.setState({isImageLoading: false});
          console.log({...err});
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
            let tempProductImages = this.state.productImages;
            let productImages = [];
            tempProductImages.map((data, index) => {
              if (index === 0) {
                productImages = [tempProductImages[0]];
              } else if (data.local_path) {
                productImages = [...productImages, data];
              }
            });
            if (productImages.length + images.length <= 10) {
              images.map((img_data) => {
                if (
                  img_data.mime === 'image/jpeg' ||
                  img_data.mime === 'image/jpg' ||
                  img_data.mime === 'image/png' ||
                  img_data.mime === 'image/bmp'
                ) {
                  if (Math.ceil(img_data.size / 1024) <= imageValidSize) {
                    // console.log("image_data", img_data);
                    // uri: `data:${img_data.mime};base64,${img_data.data}`
                    productImages = [
                      ...productImages,
                      {
                        id: this.state.currentIdOfProductImg,
                        local_path: img_data.path,
                      },
                    ];
                    this.setState({productImages: productImages});
                  } else {
                    // console.log("image_exceed", img_data);
                    this.setState({productImages: tempProductImages});
                    alert('One of the Images exceeds 5 MB size limit!!');
                  }
                } else {
                  // console.log("image_invalid", img_data);
                  this.setState({productImages: tempProductImages});
                  alert(
                    'Invalid Image Type. Only JPEG, PNG, JPG or BMP types allowed!!',
                  );
                }
              });
              if (this.state.productImages.length < 10) {
                this.setState({
                  productImages: [
                    ...this.state.productImages,
                    {id: this.state.currentIdOfProductImg, local_path: ''},
                  ],
                  currentIdOfProductImg: this.state.currentIdOfProductImg + 1,
                });
              }
              this.state.productImages = this._formatData(
                this.state.productImages,
                3,
              );
              this.setState({productImages: this.state.productImages});
            } else {
              alert(
                `Only total of 10 images are allowed to upload. You've already uploaded ${productImages.length} images!!`,
              );
            }
          } else {
            alert('Only 10 images are allowed to upload!!');
          }
          this.setState({isImageLoading: false});
        })
        .catch((err) => {
          this.setState({isImageLoading: false});
          console.log({...err});
        });
    }
  };

  _base64Converter = async (productImages) => {
    console.log(productImages);
    let product_images = [];
    product_images = productImages.filter((img_data, index) => {
      return img_data.local_path;
    });
    const asyncRes = await Promise.all(
      product_images.map(async (img_data) => {
        let response = await RNFS.readFile(img_data.local_path, 'base64');
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

  _onAddProductPress = async () => {
    const {
      additionalSpecifications,
      selectedCategory,
      selectedBrand,
      productImages,
      product_name,
      product_desc,
      product_quantity,
      product_no,
      product_highlights,
      product_price,
      discount,
      errDiscount,
    } = this.state;

    if (
      product_price &&
      product_desc &&
      product_highlights &&
      product_name &&
      product_no &&
      !errDiscount
    ) {
      this.setState({isAPILoader: true});
      let specifications = {};

      Object.values(additionalSpecifications).forEach((val) => {
        if (val.specification_key && val.specification_value) {
          specifications = {
            ...specifications,
            [val.specification_key]: val.specification_value,
          };
        }
      });
      const productInfo = {
        category_uuid: selectedCategory.uuid,
        brand_uuid: selectedBrand.uuid,
        sku: product_no.toUpperCase(),
        product_name: product_name,
        highlights: product_highlights,
        details: product_desc,
        actual_price: product_price,
        discount: discount,
        inventory: product_quantity,
        specifications: specifications,
      };

      const token = await AsyncStorage.getItem('token');
      axios
        .post(
          UNIVERSAL_ENTRY_POINT_ADDRESS + API_ADD_PRODUCT_KEY,
          productInfo,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then(async (res) => {
          const product_uuid = res.data.product_uuid;
          if (productImages.length) {
            this._base64Converter(productImages)
              .then((res) => {
                // console.log("product_images =",res);
                res.map((image_base64, index) => {
                  let url = '';
                  let header_key = '';
                  if (image_base64) {
                    if (index === 0) {
                      url = API_ADD_FEATURE_IMAGE_KEY;
                      header_key = 'feature_image';
                    } else {
                      url = API_ADD_GALLERY_IMAGE_KEY;
                      header_key = 'gallery_image';
                    }

                    if (url && header_key) {
                      axios
                        .post(
                          UNIVERSAL_ENTRY_POINT_ADDRESS + url,
                          {
                            uuid: product_uuid,
                            [header_key]: image_base64,
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          },
                        )
                        .then((response) => {
                          console.log(response);
                        })
                        .catch((err) => {
                          console.log({...err});
                          alert(err.response.data.message);
                        });
                    }
                  }
                });
              })
              .then(() => {
                // alert("Product Saved Successfully!!");
                this._onToastMessageSent('Product Added Successfully!');
                this._resetAllToInitialState();
                this.props.navigation.reset({routes: [{name: 'ProductList'}]});
              })
              .catch((err) => {
                console.log({...err});
              });
          } else {
            // alert("Product Saved Successfully!!");
            this._onToastMessageSent('Product Added Successfully!');
            this._resetAllToInitialState();
          }
        })
        .catch((err) => {
          console.log({...err});
          this._resetAllToInitialState();
          alert(err.response.data.message);
        });
    } else {
      this._onToastMessageSent('Please fill up all the required fields!!');
    }
  };

  _resetAllToInitialState = async () => {
    this.setState({
      categories: [],
      brands: [],

      toggleRemoveAdditionalSpecifications: false,
      currentIdOfAddSpec: 0,
      currentIdOfProductImg: 0,

      selectedCategory: {},
      selectedBrand: {},
      productImages: [],
      additionalSpecifications: [],
      product_name: '',
      product_desc: '',
      product_quantity: '',
      product_no: '',
      product_highlights: '',
      product_price: '',
      discount: '',
      errDiscount: '',

      isLoading: true,
      isAPILoader: false,
      isImageLoading: false,

      errMessage: '',
    });

    await this.setState({
      productImages: [
        ...this.state.productImages,
        {id: this.state.currentIdOfProductImg, local_path: ''},
      ],
      currentIdOfProductImg: this.state.currentIdOfProductImg + 1,
    });
    await this.setState({
      productImages: [
        ...this.state.productImages,
        {id: this.state.currentIdOfProductImg, local_path: ''},
      ],
      currentIdOfProductImg: this.state.currentIdOfProductImg + 1,
    });
    var productImages = await this._formatData(this.state.productImages, 3);
    await this.setState({productImages: productImages});
  };

  _handlerCategoryInput = (selected_category) => {
    this.setState({selectedCategory: selected_category});
  };

  _handlerBrandInput = (selected_brand) => {
    this.setState({selectedBrand: selected_brand});
  };

  _removeEmptyArray = (index_to_be_removed, data) => {
    data.splice(index_to_be_removed, 1);
    return data;
  };

  _formatData = (data, numColumns) => {
    let formatted_data = data;
    // console.log("length = ", data.length);
    const numOfFullRows = Math.floor(formatted_data.length / numColumns);
    let numOfElementsLastRow =
      formatted_data.length - numOfFullRows * numColumns;
    while (numOfElementsLastRow !== numColumns && numOfElementsLastRow !== 0) {
      formatted_data.push({
        id: this.state.currentIdOfProductImg,
        // uri: '',
        toggle_remove: false,
        empty: true,
      });
      numOfElementsLastRow++;
    }
    return formatted_data;
  };

  render() {
    return (
      <View style={{backgroundColor: '#fff', height: '100%'}}>
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
            text: 'Add New Product',
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

        {!this.state.isLoading ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{...styles.inputsGroup, paddingBottom: 100}}>
              <View style={{marginBottom: 10}}>
                <Text style={{fontWeight: 'bold', fontSize: 18}}>
                  Product Information
                </Text>
              </View>
              <View>
                <Text>Select Category</Text>
                <View style={{marginTop: 8, height: 45}}>
                  <RNPicker
                    dataSource={this.state.categories}
                    dummyDataSource={this.state.categories}
                    pickerTitle={'Select Category'}
                    showSearchBar={true}
                    disablePicker={false}
                    placeHolderLabel={this.state.selectedCategory.category}
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
                <View style={{marginTop: 8, height: 45}}>
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
                  value={this.state.product_name}
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
                  value={this.state.product_no}
                  mode="outlined"
                  dense
                  label="Product Number*"
                  style={{backgroundColor: 'white'}}
                  onChangeText={(text) =>
                    this._onChangeText('product_no', text)
                  }
                  onSubmitEditing={() => this.lastName.focus()}
                />
              </View>
              <View style={{marginTop: 10}}>
                <TextInput
                  value={`${this.state.product_quantity}`}
                  mode="outlined"
                  dense
                  label="Product Quantity*"
                  keyboardType="number-pad"
                  style={{backgroundColor: 'white'}}
                  onChangeText={(text) =>
                    this._onChangeText('product_quantity', text)
                  }
                  onSubmitEditing={() => this.lastName.focus()}
                />
              </View>
              <View style={{marginTop: 10}}>
                <TextInput
                  value={this.state.product_desc}
                  mode="outlined"
                  // dense
                  label="Product Description*"
                  multiline
                  style={{backgroundColor: 'white'}}
                  onChangeText={(text) =>
                    this._onChangeText('product_desc', text)
                  }
                  onSubmitEditing={() => this.lastName.focus()}
                />
              </View>
              <View style={{marginTop: 10}}>
                <TextInput
                  value={this.state.product_highlights}
                  mode="outlined"
                  // dense
                  label="Product Highlights*"
                  multiline
                  style={{backgroundColor: 'white'}}
                  onChangeText={(text) =>
                    this._onChangeText('product_highlights', text)
                  }
                  onSubmitEditing={() => this.lastName.focus()}
                />
              </View>
              <View style={{marginTop: 10}}>
                <TextInput
                  value={`${this.state.product_price}`}
                  mode="outlined"
                  dense
                  label="Product Price*"
                  style={{backgroundColor: 'white'}}
                  keyboardType="number-pad"
                  onChangeText={(text) =>
                    this._onChangeText('product_price', text)
                  }
                  onSubmitEditing={() => this.lastName.focus()}
                />
              </View>
              <View style={{marginTop: 10}}>
                <TextInput
                  value={`${this.state.discount}`}
                  mode="outlined"
                  dense
                  error={this.state.errDiscount ? true : false}
                  label={
                    this.state.errDiscount
                      ? this.state.errDiscount + '*'
                      : 'Discount(%)'
                  }
                  keyboardType="number-pad"
                  style={{backgroundColor: 'white'}}
                  onChangeText={(text) => {
                    this._onChangeText('discount', text);
                    text > 100
                      ? this.setState({
                          errDiscount: "Discount can't be more than 100",
                        })
                      : this.setState({errDiscount: ''});
                  }}
                  onSubmitEditing={
                    this.state.discount > 100
                      ? null
                      : () => this.lastName.focus()
                  }
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
                  {this.state.additionalSpecifications.length ? (
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
                  ) : null}
                  <IconButton
                    icon="plus"
                    color="#000"
                    onPress={() => this._onAddSpecificationPress()}
                  />
                </View>
              </View>
              {!this.state.additionalSpecifications.length ? (
                <Pressable onPress={() => this._onAddSpecificationPress()}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <TextInput
                      value={'Size'}
                      mode="outlined"
                      disabled
                      dense
                      label="Specification*"
                      style={{backgroundColor: 'white', width: '48%'}}
                      // onChangeText={this._onChange}
                      onSubmitEditing={() => this.lastName.focus()}
                    />
                    <TextInput
                      value={'12'}
                      mode="outlined"
                      dense
                      disabled
                      label="Value*"
                      style={{backgroundColor: 'white', width: '48%'}}
                      // onChangeText={(name) => {this._handlerFirstNameInput(name)}}
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
                      // onChangeText={(name) => {this._handlerFirstNameInput(name)}}
                      onSubmitEditing={() => this.lastName.focus()}
                    />
                    <TextInput
                      value={'White'}
                      mode="outlined"
                      dense
                      disabled
                      label="Value*"
                      style={{backgroundColor: 'white', width: '48%'}}
                      // onChangeText={(name) => {this._handlerFirstNameInput(name)}}
                      onSubmitEditing={() => this.lastName.focus()}
                    />
                  </View>
                </Pressable>
              ) : null}
              {this.state.additionalSpecifications.map((item, index) => {
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
                      onChangeText={(key) => {
                        this._onChangeSpecificationKey(key, item.id);
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
                            this._onRemoveSpecificationPress(item.id)
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
                      onChangeText={(key) => {
                        this._onChangeSpecificationValue(key, item.id);
                      }}
                    />
                  </View>
                );
              })}
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
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 6,
                  }}>
                  {/* {this._formatData(this.state.productImages, 3).map((item, index)=> { */}
                  {this.state.productImages.map((item, index) => {
                    return item.empty ? (
                      <View
                        key={index}
                        style={{
                          marginTop: 10,
                          height: 100,
                          width: 100,
                          backgroundColor: 'transparent',
                        }}></View>
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
                        {item.local_path ? (
                          <TouchableOpacity
                            onLongPress={
                              item.toggle_remove
                                ? () => this._onProductImageLongPress(index)
                                : () => this._onImagePicker(index)
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
                                borderColor: index === 0 ? '#4285F4' : null,
                                borderRadius: 6,
                              }}
                              source={{uri: item.local_path}}>
                              {item.toggle_remove ? (
                                <TouchableWithoutFeedback
                                  style={{
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    height: '100%',
                                    width: '100%',
                                    borderRadius: 6,
                                  }}>
                                  <IconButton
                                    onPress={() =>
                                      this._onRemoveProductImagePress(
                                        index,
                                        this.state.productImages.length,
                                      )
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
                                ? this._onImagePicker(index)
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
                              <Text style={{fontSize: 12, color: '#8d8d8d'}}>
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
              <View style={{marginTop: 40}}>
                <Button
                  loading={this.state.isAPILoader ? true : false}
                  onPress={() => this._onAddProductPress()}
                  mode="contained">
                  {!this.state.isAPILoader ? 'Add Product' : ''}
                </Button>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {this.state.errMessage ? (
              <Text style={{padding: 10, color: '#8d8d8d'}}>
                {this.state.errMessage || 'No error message available.'}
              </Text>
            ) : (
              <ActivityIndicator size={25} color="#6B23AE" />
            )}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputsGroup: {
    padding: 14,
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
