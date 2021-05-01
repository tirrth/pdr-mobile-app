import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {Header} from 'react-native-elements';
import {FlatList} from 'react-native-gesture-handler';
import {Appbar, IconButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {UNIVERSAL_ENTRY_POINT_ADDRESS, API_PRODUCT_CATEGORIES_KEY} from '@env';
import LinearGradient from 'react-native-linear-gradient';

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
                <Text style={{color: '#fff', fontSize: 7}}>
                  {this.props.total_notifications_count > 9
                    ? '9+'
                    : this.props.total_notifications_count}
                </Text>
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
          text: 'Categories',
          style: {
            color: '#fff',
            textTransform: 'capitalize',
            letterSpacing: 0.8,
            fontSize: 15,
            marginLeft: -10,
          },
        }}
        rightComponent={
          <HeaderIcons
            total_notifications_count={this.props.total_notifications_count}
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

export default class CategoryExpandedList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categoryData: [],
      isLoading: true,
      nextCategoryPageLoader: false,
      nextProductPageNo: 2,
      errorMessage: '',

      usr_token: null,
    };
  }

  async componentDidMount() {
    const userToken = await AsyncStorage.getItem('token');
    this.setState({usr_token: userToken});
    // const config = {
    //   headers: {Authorization: `Bearer ${userToken}`},
    // };
    await axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_PRODUCT_CATEGORIES_KEY)
      .then((response) => {
        // console.log(response.data);
        if (response.data.categories.data.length !== 0) {
          this.setState({
            categoryData: response.data.categories,
            isLoading: false,
          });
        } else {
          this.setState({
            errorMessage: 'Category List is Empty!!',
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

  _formatData = (data, numColumns) => {
    // console.log(data, numColumns);
    const numOfFullRows = Math.floor(data.length / numColumns);
    let numOfElementsLastRow = data.length - numOfFullRows * numColumns;

    while (numOfElementsLastRow !== numColumns && numOfElementsLastRow !== 0) {
      data.push({
        uuid: `${Math.random()}`,
        img: '',
        category: '',
        parent_category: '',
        empty: true,
      });
      numOfElementsLastRow++;
    }

    return data;
  };

  _onLoadMore = async (totalProducts, productsPerPage) => {
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    if (totalPages > 1 && this.state.nextProductPageNo <= totalPages) {
      this.setState({nextCategoryPageLoader: true});

      const userToken = await AsyncStorage.getItem('token');
      const url = UNIVERSAL_ENTRY_POINT_ADDRESS + API_PRODUCT_CATEGORIES_KEY;
      await axios
        .get(url, {
          headers: {Authorization: `Bearer ${userToken}`},
          params: {page: this.state.nextProductPageNo},
        })
        .then((response) => {
          this.setState({nextCategoryPageLoader: false});
          var joinedData = {
            ...this.state.categoryData,
            data: [
              ...this.state.categoryData.data,
              ...response.data.categories.data,
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

  _renderCategoryGrid = ({item}) => {
    return !item.empty ? (
      <View style={styles.CategoryGridContainer}>
        <Pressable
          onPress={() =>
            this.props.navigation.navigate('CategoryAndBrandProductList', {
              brandId: null,
              brandName: null,
              categoryId: item.uuid,
              categoryName: item.category,
            })
          }>
          <View style={styles.CategoryGridImageContainer}>
            <ImageBackground
              source={item.image !== '' ? {uri: item.image} : null}
              imageStyle={{
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                resizeMode: 'contain',
              }}
              style={{...styles.CategoryGridImage, backgroundColor: '#f9f9f9'}}>
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
            </ImageBackground>
          </View>

          <View style={{...styles.CategoryGridInfo}}>
            <Text
              style={{
                fontSize: 15,
                textTransform: 'capitalize',
                padding: 8,
                textAlign: 'center',
              }}>
              {item.category.length > 50
                ? item.category.slice(0, 50) + '...'
                : item.category}
            </Text>
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

  render() {
    return (
      <View style={{height: '100%'}}>
        <HeaderBar
          {...this.props}
          is_usr_logged_in={this.state.usr_token ? true : false}
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
              <Text style={{color: '#8d8d8d'}}>{this.state.errorMessage}</Text>
            </View>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this._formatData(this.state.categoryData.data, 2)}
              extraData={this.state.categoryData}
              renderItem={this._renderCategoryGrid}
              keyExtractor={(item) => `${item.uuid}`}
              contentContainerStyle={{paddingBottom: 80}}
              numColumns={2}
              key={'CategoryGridView'}
              columnWrapperStyle={{justifyContent: 'space-evenly'}}
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
