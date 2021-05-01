import React, {Component} from 'react';
import {View, StatusBar, StyleSheet, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Appbar} from 'react-native-paper';
import {Header} from 'react-native-elements';
import OrderReport from './OrderReport';
import ProductReport from './ProductReport';
import {Card} from 'react-native-paper';
import ProductReportSVG from '../../assets/product_report.svg';
import OrderReportSVG from '../../assets/order_report.svg';
import {BackHandler} from 'react-native';

export default class ReportManagement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      select_order_report: false,
      select_product_report: false,
    };
  }

  backAction = () => {
    const {select_order_report, select_product_report} = this.state;
    if (select_order_report || select_product_report) {
      this.setState({select_order_report: false, select_product_report: false});
    } else {
      try {
        this.props.navigation.goBack();
      } catch (err) {
        console.log(err);
      }
    }
    return true;
  };

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  render() {
    const {select_order_report, select_product_report} = this.state;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            !select_order_report && !select_product_report ? null : '#fff',
        }}>
        <StatusBar backgroundColor="#ffffff" barStyle={'dark-content'} />
        <View
          style={{
            backgroundColor: '#fff',
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            elevation: 4,
          }}>
          <Header
            placement="left"
            leftComponent={
              <Appbar.BackAction
                color="#fff"
                onPress={() => this.backAction()}
              />
            }
            centerComponent={{
              text: 'Report Management',
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
        </View>

        {!select_order_report && !select_product_report ? (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'center',
            }}>
            <Card
              style={{
                width: 130,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 6,
                alignSelf: 'center',
                padding: 10,
              }}
              onPress={() => this.setState({select_order_report: true})}>
              <View style={{alignItems: 'center'}}>
                <OrderReportSVG height={100} width={100} fill="black" />
              </View>
              <View style={{marginTop: 10}}>
                <Text
                  style={{
                    alignSelf: 'center',
                    fontWeight: 'bold',
                    fontSize: 15,
                    textAlign: 'center',
                  }}>
                  Order Report
                </Text>
              </View>
            </Card>
            <Card
              style={{
                width: 130,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 6,
                alignSelf: 'center',
                padding: 10,
              }}
              onPress={() => this.setState({select_product_report: true})}>
              <View style={{alignItems: 'center'}}>
                <ProductReportSVG height={100} width={100} fill="#000" />
              </View>
              <View style={{marginTop: 10}}>
                <Text
                  style={{
                    alignSelf: 'center',
                    fontWeight: 'bold',
                    fontSize: 15,
                    textAlign: 'center',
                  }}>
                  Product Report
                </Text>
              </View>
            </Card>
          </View>
        ) : null}

        {select_order_report ? (
          <OrderReport
            backHandler={() => this.backAction()}
            navigation={this.props.navigation}
          />
        ) : null}

        {select_product_report ? (
          <ProductReport
            backHandler={() => this.backAction()}
            navigation={this.props.navigation}
          />
        ) : null}
      </View>
    );
  }
}
