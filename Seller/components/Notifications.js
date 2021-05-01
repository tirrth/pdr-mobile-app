import React, {Component} from 'react';
import {StyleSheet, View, Text, FlatList} from 'react-native';
import {Header} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {Appbar} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {ActivityIndicator} from 'react-native';
import {Pressable} from 'react-native';
import {Linking} from 'react-native';
import {connect} from 'react-redux';
import {ImageBackground} from 'react-native';
import {Icon} from 'native-base';

const _redirectTo = (redirect_to) => {
  Linking.canOpenURL(redirect_to).then(async (can_open_url) => {
    if (can_open_url) {
      console.log('redirect_to = ', redirect_to);
      await Linking.openURL(redirect_to);
    } else {
      console.log('Can not open url: ', redirect_to);
    }
  });
};

export const _onNotificationPress = async (
  notification_data,
  profile_info,
  is_seen = false,
) => {
  if (!is_seen) {
    const notification_uuid = notification_data.data.notification_uuid;
    const collection_name = 'sellers';
    const documentId = profile_info?.uuid;
    const documentRef = firestore().collection(collection_name).doc(documentId);

    return documentRef
      .get()
      .then(async (doc) => {
        if (doc.exists && doc._data.messages && notification_uuid) {
          const notification_data = doc._data.messages.filter(
            (notification) =>
              notification.data.notification_uuid == notification_uuid,
          )[0];
          console.log(notification_uuid, notification_data);

          return documentRef
            .update({
              messages: firestore.FieldValue.arrayRemove(notification_data),
            })
            .then(async () => {
              console.log('Removed old array');
              return documentRef
                .update({
                  messages: firestore.FieldValue.arrayUnion({
                    ...notification_data,
                    is_seen: true,
                  }),
                })
                .then(async () => {
                  console.log('Added new array');
                })
                .catch((err) => {
                  console.log(err);
                  throw err;
                });
            })
            .catch((err) => {
              console.log(err);
              throw err;
            });
        }
      })
      .catch((err) => {
        console.log(err);
        throw err;
      })
      .finally(() => {
        _redirectTo(notification_data.data?.redirect_to);
      });
  } else {
    _redirectTo(notification_data.data?.redirect_to);
  }
};

export const _getTotalNotificationsCount = async (profile_info) => {
  const {uuid: documentId} = profile_info;
  const collection_name = 'sellers';
  const documentRef = firestore().collection(collection_name).doc(documentId);
  return await documentRef
    .get()
    .then((snap) => {
      if (snap.exists) {
        const total_notifications_count = snap._data?.messages?.filter(
          (message) => !message.is_seen,
        )?.length;
        return total_notifications_count || 0;
      }
      return 0;
    })
    .catch((err) => {
      throw err;
    });
};

function totalDaysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function isLeapYear(year = new Date().getFullYear()) {
  return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}

const _countTimeDifference = (date_object) => {
  const currentDateMilli = new Date().getTime();
  const givenDateMilli = new Date(date_object).getTime();

  const time_difference_in_milli_seconds = Math.abs(
    currentDateMilli - givenDateMilli,
  );
  const time_difference_in_seconds = Math.floor(
    time_difference_in_milli_seconds / 1000,
  );
  const time_difference_in_minutes = Math.floor(
    time_difference_in_seconds / 60,
  );
  const time_difference_in_hours = Math.floor(time_difference_in_minutes / 60);
  const time_difference_in_days = Math.floor(time_difference_in_hours / 24);
  const time_difference_in_weeks = Math.floor(time_difference_in_days / 7);
  const time_difference_in_months = Math.floor(
    time_difference_in_days / totalDaysInMonth(),
  );
  const time_difference_in_years = Math.floor(
    time_difference_in_days / (isLeapYear() ? 366 : 365),
  );

  if (time_difference_in_seconds == 0) {
    return 'Just now';
  }

  if (time_difference_in_years >= 1) {
    if (time_difference_in_years > 9) {
      return `9+ years ago`;
    }
    return `${time_difference_in_years} year${
      time_difference_in_years == 1 ? '' : 's'
    } ago`;
  }

  if (time_difference_in_months >= 1) {
    return `${time_difference_in_months} ${
      time_difference_in_months == 1 ? 'month' : 'months'
    } ago`;
  }

  if (time_difference_in_weeks >= 1) {
    return `${time_difference_in_weeks} ${
      time_difference_in_weeks == 1 ? 'week' : 'weeks'
    } ago`;
  }

  if (time_difference_in_days >= 1) {
    return `${time_difference_in_days} ${
      time_difference_in_days == 1 ? 'day' : 'days'
    } ago`;
  }

  if (time_difference_in_hours >= 1) {
    return `${time_difference_in_hours} ${
      time_difference_in_hours == 1 ? 'hour' : 'hours'
    } ago`;
  }

  if (time_difference_in_minutes >= 1) {
    return `${time_difference_in_minutes} ${
      time_difference_in_minutes == 1 ? 'minute' : 'minutes'
    } ago`;
  }

  // return 'Just now';
  return `${time_difference_in_seconds} second${
    time_difference_in_seconds == 1 ? '' : 's'
  } ago`;
};

class HeaderBar extends Component {
  render() {
    return (
      <Header
        placement="left"
        leftComponent={
          <Appbar.BackAction
            color="#fff"
            onPress={() => this.props.props.navigation.goBack()}
          />
        }
        centerComponent={{
          text: 'Notifications',
          style: {
            color: '#fff',
            letterSpacing: 0.8,
            fontSize: 16,
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
    );
  }
}

class Notifications extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      notificationData: [],

      err_msg: '',
    };
  }

  componentDidMount() {
    this._getNotificationData();
  }

  _getNotificationData = async () => {
    const collection_name = 'sellers';
    const documentId = this.props.profile_info?.uuid;
    const documentRef = firestore().collection(collection_name).doc(documentId);

    documentRef
      .get()
      .then((doc) => {
        if (doc.exists && doc._data.messages) {
          const notification_data = doc._data.messages;
          const notify_sorted_data = [];

          notify_sorted_data.push(
            ...notification_data
              .filter((notification) => notification.created_at)
              .map((notification) => {
                notification.received_before = _countTimeDifference(
                  notification.created_at?.toDate(),
                );
                return notification;
              })
              .sort((notification_first, notification_second) => {
                const dateA = new Date(notification_first.created_at?.toDate()),
                  dateB = new Date(notification_second.created_at?.toDate());
                return dateB - dateA;
              }),
            ...notification_data.filter(
              (notification) => !notification.created_at,
            ),
          );

          console.log('notify_sorted_data = ', notify_sorted_data);

          this.setState({
            notificationData: notify_sorted_data,
            isLoading: false,
          });
        } else {
          this.setState({err_msg: 'No notification received.'});
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({err_msg: 'Error found.'});
      });
  };

  _renderNotification = ({item}) => {
    const {notification, is_seen, received_before} = item;
    const {
      profile_info,
      changeTotalNotificationsCount,
      total_notifications_count,
    } = this.props;
    return (
      <Pressable
        onPress={() => {
          _onNotificationPress(item, profile_info, is_seen)
            .then(() => {
              total_notifications_count > 0 &&
                !is_seen &&
                changeTotalNotificationsCount(total_notifications_count - 1);
            })
            .catch((err) => console.log(err))
            .finally(() => {
              item.is_seen = true;
              this.setState({notificationData: this.state.notificationData});
            });
        }}
        style={styles.NotificationListContainer}>
        <View
          style={{
            height: 4,
            width: 4,
            borderRadius: 2,
            backgroundColor:
              is_seen || !item.data?.redirect_to ? 'transparent' : '#4285F4',
            marginLeft: 4,
          }}
        />
        <View
          style={{
            ...styles.NotificationLeftContainer,
            paddingLeft: 0,
            marginLeft: -2,
          }}>
          <ImageBackground
            source={notification?.image ? {uri: notification.image} : null}
            style={{
              ...styles.NotificationListImage,
              backgroundColor: '#eeeeee',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            imageStyle={{
              borderColor: '#eeeeee',
              borderWidth: notification?.image ? 0.8 : 0,
              borderRadius: 3,
            }}>
            {!notification?.image ? (
              <Icon name="cart" style={{fontSize: 30, color: '#8d8d8d'}} />
            ) : null}
          </ImageBackground>
        </View>
        <View style={styles.NotificationCenterContainer}>
          <Text
            style={{
              fontSize: 13,
              // color: notification?.body ? 'black' : '#8d8d8d',
            }}>
            {notification?.body || 'Notification text body not found!!'}
          </Text>
        </View>

        {/* <View style={styles.NotificationRightView}>
          <Text
            style={{
              width: 70,
              fontSize: 11,
              // color: notification?.body ? '#8d8d8d' : 'red',
              textAlign: 'center',
              color: '#8d8d8d',
              transform: [{rotate: '-90deg'}],
            }}>
            {received_before}
          </Text>
        </View> */}

        <View style={{position: 'absolute', bottom: 6, right: 8}}>
          {received_before ? (
            <Text style={{fontSize: 11, color: '#8d8d8d'}}>
              {received_before}
            </Text>
          ) : (
            ''
          )}
        </View>
      </Pressable>
    );
  };

  render() {
    const {navigate} = this.props.navigation;
    const {isLoading, notificationData, err_msg} = this.state;
    return (
      <View style={{height: '100%'}}>
        <HeaderBar navigation={navigate} props={this.props} />
        {!isLoading ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={notificationData}
            renderItem={this._renderNotification}
            keyExtractor={(item, index) => `${index}`}
            contentContainerStyle={{marginTop: 4, paddingBottom: 60}}
          />
        ) : (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'center',
            }}>
            {err_msg ? (
              <Text
                style={{
                  color: '#8d8d8d',
                  marginHorizontal: 10,
                  textAlign: 'center',
                }}>
                {err_msg}
              </Text>
            ) : (
              <ActivityIndicator size={22} color="#6B23AE" />
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

  NotificationListContainer: {
    flexDirection: 'row',
    elevation: 1,
    width: '96%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 4,
    alignItems: 'center',
  },

  NotificationLeftContainer: {
    width: '25%',
    padding: 10,
    paddingRight: 0,
  },
  NotificationListImage: {
    height: 70,
    width: 70,
    marginLeft: 6,
    borderRadius: 70 / 2,
  },
  NotificationCenterContainer: {
    // marginLeft: 18,
    marginHorizontal: 6,
    // flexDirection: 'column',
    // justifyContent: 'space-between',
    // width: '54%',
    flex: 1,
    // backgroundColor: 'red',
    // alignItems: 'center',
  },
  NotificationRightView: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: -4,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '13%',
  },
});

const mapStateToProps = (state) => {
  return {
    profile_info: state.profile_info,
    total_notifications_count: state.total_notifications_count,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeTotalNotificationsCount: (count) => {
      dispatch({
        type: 'CHANGE_TOTAL_NOTIFICATIONS_COUNT',
        payload: count,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
