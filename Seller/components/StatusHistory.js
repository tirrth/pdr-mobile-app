import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {View, FlatList, Text} from 'react-native';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_FETCH_ORDER_ITEM_STATUS_HISTORY_KEY,
} from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ScrollView} from 'react-native-gesture-handler';

export default class StatusHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      statusHistoryDetails: [],
    };
  }

  componentDidMount() {
    this._getStatusHistory();
  }

  _getStatusHistory = async () => {
    const token = await AsyncStorage.getItem('token');
    axios
      .get(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_FETCH_ORDER_ITEM_STATUS_HISTORY_KEY,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            order_id: this.props.order_item_id,
          },
        },
      )
      .then((res) => {
        console.log(res);
        if (res.data.order_status_traits.length) {
          res.data.order_status_traits.map((status_info) => {
            // if (status_info.order_status[0].id == 2) {
            //   status_info.is_extra_component_available = true;
            //   status_info.extra_details_component = () => {
            //     return <Text>{'asyu'}</Text>;
            //   };
            // } else if (status_info.order_status[0].id == 5) {
            //   status_info.is_extra_component_available = true;
            //   status_info.extra_details_component = () => {
            //     return (
            //       <View>
            //         <Text style={{textTransform: 'capitalize'}}>
            //           {status_info.user_selected_reason.reason}
            //         </Text>
            //         <Text style={{textTransform: 'capitalize'}}>
            //           {status_info.is_return_shipment_borne_by
            //             ? "You've"
            //             : 'Customer'}
            //         </Text>
            //       </View>
            //     );
            //   };
            // } else if (status_info.order_status[0].id == 6) {
            //   status_info.is_extra_component_available = true;
            //   status_info.extra_details_component = () => {
            //     return <Text>{status_info.reason_for_action_by_seller}</Text>;
            //   };
            // } else if (status_info.order_status[0].id == 7) {
            //   status_info.is_extra_component_available = true;
            //   status_info.extra_details_component = () => {
            //     return <Text>{status_info.reason_for_action_by_seller}</Text>;
            //   };
            // }
          });
          this.setState({statusHistoryDetails: res.data.order_status_traits});
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  _renderStatus = ({item, index}) => {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          height: 100,
          marginTop: index == 0 ? 30 : 0,
        }}>
        <View style={{flex: 1}}>
          <Text style={{textAlign: 'right', marginTop: -3}}>
            {`${item.updated_at}`.split(':')[0] +
              ':' +
              `${item.updated_at}`.split(':')[1]}
          </Text>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: 30,
          }}>
          {index == 0 ? (
            <View
              style={{
                borderWidth: 1,
                height: 16,
                width: 16,
                borderRadius: 16 / 2,
                borderColor: '#4885ed',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 10 / 2,
                  backgroundColor: '#4885ed',
                }}
              />
            </View>
          ) : (
            <View
              style={{
                height: 10,
                width: 10,
                borderRadius: 10 / 2,
                backgroundColor: '#8d8d8d',
              }}
            />
          )}
          <>
            <View
              style={{
                width: 1,
                height: 90,
                backgroundColor:
                  this.state.statusHistoryDetails.length == 1 ||
                  this.state.statusHistoryDetails.length - 1 == index
                    ? 'transparent'
                    : '#ddd',
              }}
            />
          </>
        </View>
        <View style={{flex: 1}}>
          <Text
            style={{
              margin: 0,
              padding: 0,
              textTransform: 'capitalize',
              fontWeight: 'bold',
              marginTop: -3,
            }}>
            {item.order_status[0].status}
          </Text>
          {item.is_extra_component_available
            ? item.extra_details_component()
            : null}

          {/* <View
            style={{
              borderWidth: 1,
              borderRadius: 4,
              borderColor: '#4885ed',
              padding: 4,
            }}>
            <Text style={{color: '#4885ed', fontSize: 12}}>
              <Text style={{fontWeight: 'bold'}}>Important: </Text>
            </Text>
          </View> */}
        </View>
      </View>
    );
  };

  render() {
    const {statusHistoryDetails} = this.state;
    return (
      <View style={{width: '90%', alignSelf: 'center'}}>
        {/* <FlatList
          showsVerticalScrollIndicator={false}
          data={statusHistoryDetails}
          renderItem={this._renderStatus}
          keyExtractor={(item, index) => index}
          contentContainerStyle={{paddingBottom: 100}}
        /> */}
        {/* --------------------------------------------- ALTERNATIVE ---------------------------------------------*/}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{paddingBottom: 100}}>
            {statusHistoryDetails.map((status_info, index) => {
              return (
                <View key={index}>
                  {this._renderStatus({item: status_info, index: index})}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  horizontalSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
  },
});
