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
import {IconButton} from 'react-native-paper';
import {Icon} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_PRODUCT_CATEGORIES_WITH_HIERARCHY_KEY,
} from '@env';
import LinearGradient from 'react-native-linear-gradient';
import {BackHandler} from 'react-native';

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
          {/* {this.props.is_usr_logged_in ? (
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
          ) : null} */}

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
          <IconButton
            icon="menu"
            color="#fff"
            onPress={this.props.onMenuPress}
          />
        }
        centerComponent={{
          text: 'Explore Categories',
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

export default class ExploreAllCategories extends Component {
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

  backAction = () => {
    const {reset} = this.props.navigation;
    reset({routes: [{name: 'HomeRoot'}]});
    return true;
  };
  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.backAction);
    });

    this.props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    });

    const userToken = await AsyncStorage.getItem('token');
    this.setState({usr_token: userToken});

    await axios
      .get(
        UNIVERSAL_ENTRY_POINT_ADDRESS +
          API_PRODUCT_CATEGORIES_WITH_HIERARCHY_KEY,
      )
      .then((response) => {
        console.log('API_PRODUCT_CATEGORIES_WITH_HIERARCHY_KEY', response.data);
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
        console.log({...error});
        this.setState({
          errorMessage: error.response.data.message,
          isLoading: false,
        });
        alert(error.response.data.message);
      });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  _onLoadMore = async (totalProducts, productsPerPage) => {
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    if (totalPages > 1 && this.state.nextProductPageNo <= totalPages) {
      this.setState({nextCategoryPageLoader: true});

      const userToken = await AsyncStorage.getItem('token');
      const url =
        UNIVERSAL_ENTRY_POINT_ADDRESS +
        API_PRODUCT_CATEGORIES_WITH_HIERARCHY_KEY;
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

  _renderChildCategoryGrid = ({item}) => {
    return (
      <View
        style={{
          borderWidth: 1,
          borderRadius: 4,
          borderColor: '#eeeeee',
          marginVertical: 4,
          padding: 10,
          width: '48.8%',
        }}>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
          onPress={() =>
            this.props.navigation.navigate('HomeRoot', {
              screen: 'CategoryAndBrandProductList',
              params: {
                categoryId: item.uuid,
                categoryName: item.category,
              },
            })
          }>
          <View>
            <ImageBackground
              source={item.image ? {uri: item.image} : null}
              imageStyle={{borderRadius: 2, resizeMode: 'cover'}}
              style={{
                height: 44,
                width: 44,
                backgroundColor: '#eeeeee',
                borderRadius: 2,
              }}>
              {!item.image && (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#eeeeee',
                    borderRadius: 2,
                  }}>
                  <Icon
                    type="FontAwesome5"
                    name="terminal"
                    style={{fontSize: 12, color: '#8d8d8d'}}
                  />
                </View>
              )}
            </ImageBackground>
          </View>
          <View style={{marginLeft: 8, flex: 1}}>
            <Text
              style={{
                fontSize: 15,
                textTransform: 'capitalize',
                color: '#454545',
              }}>
              {item.category}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  _renderCategoryList = ({item}) => {
    return (
      <View style={{marginVertical: 4}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginLeft: 8,
          }}>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
            }}
            onPress={() =>
              this.props.navigation.navigate('HomeRoot', {
                screen: 'CategoryAndBrandProductList',
                params: {
                  categoryId: item.uuid,
                  categoryName: item.category,
                },
              })
            }>
            <View>
              <ImageBackground
                source={item.image ? {uri: item.image} : null}
                imageStyle={{borderRadius: 2, resizeMode: 'cover'}}
                style={{
                  height: 44,
                  width: 44,
                  backgroundColor: '#eeeeee',
                  borderRadius: 2,
                }}>
                {!item.image && (
                  <View
                    style={{
                      width: '100%',
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#eeeeee',
                      borderRadius: 2,
                    }}>
                    <Icon
                      type="FontAwesome5"
                      name="terminal"
                      style={{fontSize: 12, color: '#8d8d8d'}}
                    />
                  </View>
                )}
              </ImageBackground>
            </View>
            <View style={{marginLeft: 8}}>
              <Text
                style={{
                  fontSize: 15,
                  textTransform: 'capitalize',
                  color: '#454545',
                }}>
                {item.category}
              </Text>
            </View>
          </Pressable>

          {Array.isArray(item.child_categories) &&
          item.child_categories.length ? (
            <View style={{marginRight: 8, marginLeft: 12}}>
              {!item.is_child_expanded ? (
                <Icon
                  type="FontAwesome5"
                  onPress={() => {
                    item.is_child_expanded = true;
                    this.setState({categoryData: this.state.categoryData});
                  }}
                  name="plus-square"
                  style={{fontSize: 20, color: '#8d8d8d'}}
                />
              ) : (
                <Icon
                  type="FontAwesome5"
                  name="minus-square"
                  onPress={() => {
                    item.is_child_expanded = false;
                    this.setState({categoryData: this.state.categoryData});
                  }}
                  style={{fontSize: 20, color: '#8d8d8d'}}
                />
              )}
            </View>
          ) : null}
        </View>

        {item.is_child_expanded ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={item.child_categories}
            renderItem={this._renderChildCategoryGrid}
            keyExtractor={(item, index) => `${index}`}
            contentContainerStyle={{marginTop: 10}}
            numColumns={2}
            key={'ChildCategoryGridView'}
            columnWrapperStyle={{justifyContent: 'space-between'}}
          />
        ) : null}
        <View style={{...styles.horizontalSeparator}} />
      </View>
    );
  };

  render() {
    return (
      <View style={{height: '100%', backgroundColor: '#ffffff'}}>
        <HeaderBar
          onMenuPress={() => this.props.navigation.openDrawer()}
          navigation={this.props.navigation}
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
              <Text
                style={{
                  color: '#8d8d8d',
                  textAlign: 'center',
                  paddingHorizontal: 10,
                }}>
                {this.state.errorMessage}
              </Text>
            </View>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this.state.categoryData.data}
              extraData={this.state.categoryData}
              renderItem={this._renderCategoryList}
              keyExtractor={(item, index) => `${index}`}
              contentContainerStyle={{
                paddingBottom: 80,
                marginHorizontal: 10,
                paddingTop: 12,
              }}
              key={'CategoryListView'}
              onEndReached={() => {
                if (this.state.nextCategoryPageLoader) {
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
  horizontalSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#eeeeee',
    marginTop: 10,
  },

  CategoryListContainer: {
    maxWidth: Dimensions.get('window').width / 2,
    height: 260,
    width: '47.8%',
    backgroundColor: 'white',
    elevation: 1,
    marginTop: 4,
    marginBottom: 2,
    borderRadius: 2,
  },
  CategoryListImageContainer: {
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
