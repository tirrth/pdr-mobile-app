import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Card, IconButton, Badge} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_ORDER_VIEW_KEY,
  API_FILTER_ORDERS_BY_STATUS_AND_DATE,
  API_GET_SELLER_INFO_KEY,
} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Icon} from 'native-base';
import {ActivityIndicator} from 'react-native';
import Ripple from 'react-native-material-ripple';
import {SafeAreaView} from 'react-native';
import {Modal} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {Dimensions} from 'react-native';
import RNPrint from 'react-native-print';
import {ToastAndroid} from 'react-native';
import {BackHandler} from 'react-native';
import {Alert} from 'react-native';

import PDFReportSVG from '../../assets/pdf_report.svg';
import PDFReportSVGEmpty from '../../assets/pdf_report_empty.svg';
import SpreadSheetSVG from '../../assets/google_sheets.svg';
import SpreadSheetEmptySVG from '../../assets/google_sheets_empty.svg';
import {PermissionsAndroid} from 'react-native';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import {Platform, NativeModules} from 'react-native';

const headerColumns = [
  {
    id: 1,
    name: 'Id',
    width: 120,
    info_needed_to_generate_report: {
      database_keys: ['order_id'],
      report_titles: ['Id'],
    },
  },
  {
    id: 2,
    name: 'Date',
    width: 100,
    info_needed_to_generate_report: {
      database_keys: ['created_at'],
      report_titles: ['Date'],
    },
  },
  {
    id: 3,
    name: 'Status',
    width: 150,
    info_needed_to_generate_report: {
      database_keys: ['order_status'],
      report_titles: ['Status'],
    },
  },
  {
    id: 4,
    name: 'Price',
    width: 100,
    info_needed_to_generate_report: {
      database_keys: ['grand_total_amount'],
      report_titles: ['Price'],
      prepend_value_with: ['$'],
    },
  },
  {
    id: 5,
    name: 'Action',
    width: 50,
    info_needed_to_generate_report: {
      database_keys: [],
      report_titles: [],
    },
    is_excluded: true,
    is_redirection_url: true,
  },
];

const initialState = {
  reportTableInformation: [],
  table_column_width_ref: [],

  order_details_next_page_url: null,
  order_details_prev_page_url: null,
  current_page_no: null,
  isLoading: true,
  error_msg: '',

  is_data_filter_modal_visible: false,

  selected_order_status: [],
  selected_from_date: null,
  selected_to_date: null,

  is_pdf_generator_loading: false,
  is_spreadsheet_generator_loading: false,

  enable_column_modification: false,
  important_note: null,
};

export default class OrderReport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...initialState,
    };
  }

  backAction = () => {
    const {enable_column_modification} = this.state;
    if (enable_column_modification) {
      this.setState({enable_column_modification: false});
    } else {
      this.backHandler.remove();
      const applyParentBackHandler = this.props.backHandler;
      applyParentBackHandler();
    }
    return true;
  };

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
    // this._getOrdersData(UNIVERSAL_ENTRY_POINT_ADDRESS + API_ORDER_VIEW_KEY);
    this._onFilterOrders();
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  _onHeaderColumnPress = (table_column_info) => {
    if (table_column_info.id == 5) {
      this._onToastMessageSend("Can't Include this field in the Report");
      return;
    }
    const is_excluded = table_column_info.is_excluded; // rather than using index can do it this way too
    table_column_info.is_excluded = !is_excluded;
    this.setState({reportTableInformation: this.state.reportTableInformation});
  };

  _setTableHeader = (table_data) => {
    table_data.push(headerColumns);
    const {table_column_width_ref} = this.state;
    table_data[0].map((table_header_info, index) => {
      table_column_width_ref[index] = table_header_info.width;
    });
    this.setState({table_column_width_ref: table_column_width_ref});
    return table_data;
  };

  _pushDataToTable = (order_details, table_data) => {
    table_data.push({
      id: <Text>{order_details.order_id || ''}</Text>,
      date: <Text>{`${order_details.created_at}`.split(' ')[0] || ''}</Text>,

      status: (
        <Text style={{textTransform: 'capitalize'}}>
          {order_details.order_status.status || ''}
        </Text>
      ),
      price: (
        <Text>
          <Text>$</Text>
          {`${order_details.grand_total_amount}` || ''}
        </Text>
      ),
      action: (
        <IconButton
          onPress={() =>
            this.props.navigation.navigate('OrderDetails', {
              order_id: order_details.id,
            })
          }
          icon="eye"
          size={18}
          color="#8d8d8d"
        />
      ),
    });

    return table_data;
  };

  // _getOrdersData = async (url) => {
  //   let table_data = [];
  //   table_data = this._setTableHeader(table_data);
  //   this.setState({isLoading: true});
  //   const token = await AsyncStorage.getItem('token');
  //   axios
  //     .get(url, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       params: {},
  //     })
  //     .then((res) => {
  //       console.log('orderrrrrrr', res);

  //       if (res.data.product_order.data.length) {
  //         res.data.product_order.data.map((order_details) => {
  //           table_data = this._pushDataToTable(order_details, table_data);
  //         });

  //         this.setState({
  //           reportTableInformation: [...table_data],
  //           isLoading: false,
  //           order_details_next_page_url: res.data.product_order.next_page_url,
  //           current_page_no: res.data.product_order.current_page,
  //           order_details_prev_page_url: res.data.product_order.prev_page_url,
  //         });
  //       } else {
  //         this.setState({error_msg: 'Order List is empty!'});
  //       }
  //     })
  //     .catch((err) => {
  //       console.log({...err});
  //       alert(err.response.data.message);
  //       this.setState({error_msg: err.response.data.message});
  //     });
  // };

  _onFilterOrders = async (
    url = `${
      UNIVERSAL_ENTRY_POINT_ADDRESS + API_FILTER_ORDERS_BY_STATUS_AND_DATE
    }`,
    order_status = [],
    from = null,
    to = null,
  ) => {
    let table_data = [];
    table_data = this._setTableHeader(table_data);
    this.setState({
      isLoading: true,
      selected_order_status: order_status,
      selected_from_date: from,
      selected_to_date: to,
    });
    const token = await AsyncStorage.getItem('token');
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          order_status: order_status.length ? [...order_status] : null,
          from: from,
          to: to,
        },
      })
      .then((res) => {
        console.log(res);
        if (res.data.product_order.data.length) {
          res.data.product_order.data.map((order_details) => {
            table_data = this._pushDataToTable(order_details, table_data);
          });

          this.setState({
            reportTableInformation: [...table_data],
            isLoading: false,
            order_details_next_page_url: res.data.product_order.next_page_url,
            current_page_no: res.data.product_order.current_page,
            order_details_prev_page_url: res.data.product_order.prev_page_url,
          });
        } else {
          this._onToastMessageSend('No Orders found!!');
          this.setState({isLoading: false});
        }
      })
      .catch((err) => {
        console.log({...err});
        this.setState({error_msg: err.response.data.message});
        alert(err.response.data.message);
      });
  };

  _onFilterDataPress = () => {
    this.setState({is_data_filter_modal_visible: true});
  };

  _closeDataFilterModal = () => {
    this.setState({is_data_filter_modal_visible: false});
  };

  _convertReactElementToHTMLString = (element) => {
    console.log(element);
  };

  _onPrintPDFReportPress = async () => {
    const {enable_column_modification} = this.state;
    if (!enable_column_modification) {
      return;
    }

    this.setState({is_pdf_generator_loading: true});
    const {
      reportTableInformation,
      selected_order_status,
      selected_from_date,
      selected_to_date,
    } = this.state;
    const header_colums = reportTableInformation[0].filter(
      (header_column) => !header_column.is_excluded,
    );
    let table = '';

    // ---------------------------------------- colgroup (set fixed width to every column) ------------------------------------- //
    const total_width = header_colums.reduce(function (sum, current) {
      return sum + current.width;
    }, 0);
    header_colums.map((header_column_info) => {
      if (header_column_info.is_excluded) {
        return;
      }
      table += `<col width="${
        (header_column_info.width / total_width) * 100
      }%">`;
    });
    table = `<colgroup>
              ${table}
            </colgroup>`;

    // ---------------------------------------- thead ------------------------------------- //
    let thead_tr = '';
    header_colums.map((header_column, index) => {
      thead_tr += `<th
            style="text-align:left; text-transform:capitalize;  ${
              index == 0
                ? 'border-top-left-radius:6px; border-bottom-left-radius:6px;'
                : ''
            } ${
        index == header_colums.length - 1
          ? 'border-top-right-radius:6px; border-bottom-right-radius:6px;'
          : ''
      } padding-top:15px; padding-bottom:15px; color: #454545; padding-left:11px; padding-right:11px">
            ${header_column.name || '-'}</th>`;
    });
    thead_tr = `<tr style="background-color: #eeeeee;">${thead_tr}</tr>`;
    const thead = `<thead>${thead_tr}</thead>`;
    table += thead;

    // ---------------------------------------- tfoot ------------------------------------- //
    let tfooter_content = `
      <tr>
        <td colspan="5" style="text-align: center; color: #8d8d8d;">---------------------- PDR Order Report ----------------------</td>
      </tr>`;
    const tfoot = `<tfoot>${tfooter_content}</tfoot>`;

    // ---------------------------------------- tbody ------------------------------------- //
    const _getAllFilteredOrdersInfo = async (
      url = `${
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_FILTER_ORDERS_BY_STATUS_AND_DATE
      }`,
      order_status = [],
      from = null,
      to = null,
    ) => {
      const token = await AsyncStorage.getItem('token');
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            order_status: order_status.length ? [...order_status] : null,
            from: from,
            to: to,
          },
        })
        .then(async (res) => {
          console.log('orderrrrrrr', res);
          if (res.data.product_order.data.length) {
            res.data.product_order.data.map((data) => {
              data.created_at = `${data.created_at}`.split(' ')[0];
              data.order_status = data.order_status.status;
            });
            table_body_data.push(...res.data.product_order.data);

            if (res.data.product_order.next_page_url) {
              _getAllFilteredOrdersInfo(
                res.data.product_order.next_page_url,
                selected_order_status,
                selected_from_date,
                selected_to_date,
              );
            } else {
              // // console.log(table_body_data);
              // let tbody_rows = '';
              // table_body_data.map((data) => {
              //   tbody_rows += `
              //       <tr>
              //         <td
              //             style="padding-left:11px; padding-right:11px;border-bottom:2px #eeeeee solid; border-top:2px #eeeeee solid; border-left:2px #eeeeee solid; padding-top:10px; padding-bottom:10px;border-top-left-radius:6px; border-bottom-left-radius:6px;">
              //             ${data.order_id}
              //         </td>
              //         <td
              //             style="padding-left:11px; padding-right:11px;border-bottom:2px #eeeeee solid; border-top:2px #eeeeee solid; padding-top:10px; padding-bottom:10px;">
              //             ${`${data.created_at}`.split(' ')[0]}
              //         </td>
              //         <td
              //             style="text-transform:capitalize; padding-left:11px; padding-right:11px;padding-top:10px; padding-bottom:10px;border-bottom:2px #eeeeee solid; border-top:2px #eeeeee solid;">
              //             ${data.order_status.status}
              //         </td>
              //         <td
              //             style="padding-left:11px; padding-right:11px;border-bottom:2px #eeeeee solid; border-top:2px #eeeeee solid; padding-top:10px; padding-bottom:10px;">
              //             $${data.grand_total_amount}
              //         </td>
              //         <td
              //             style="padding-left:11px; padding-right:11px;border-bottom:2px #eeeeee solid; border-top:2px #eeeeee solid; border-right:2px #eeeeee solid; padding-top:10px; padding-bottom:10px; border-top-right-radius:6px; border-bottom-right-radius:6px;">
              //             <a href="https://www.pdrtoolsdirect.com/orders/${
              //               data.order_id
              //             }">View</a>
              //         </td>
              //       </tr>`;
              //   // tbody_rows = tbody_rows + tbody_rows + tbody_rows;
              // });
              // const tbody = `<tbody>${tbody_rows}</tbody>`;
              // table += tbody;
              // // table += tfoot;

              // // -------------------------------------------- final table -------------------------------------------------- //
              // table = `<table style="border-spacing:0 15px; width:100%; color:black">${table}</table>`;
              // const html = `<div>${table}</div>`;

              // // -------------------------------------------- print to pdf ------------------------------------------------- //
              // this.setState({is_pdf_generator_loading: false});
              // await RNPrint.print({
              //   html: html,
              //   jobName: `Order_Report_${_dateFormatter(new Date())}`,
              // });

              let tbody_rows = ``;

              // ----------------------- business logic to add data in tbody_rows(table) -----------------------
              table_body_data.map((data) => {
                let tbody_td = ``;
                header_colums.map((header_column, index) => {
                  const {
                    database_keys,
                    prepend_value_with,
                    append_value_with,
                  } = header_column.info_needed_to_generate_report;

                  const value_to_prepend = Array.isArray(prepend_value_with)
                    ? prepend_value_with[0] || ''
                    : '';
                  const value_to_append = Array.isArray(append_value_with)
                    ? append_value_with[0] || ''
                    : '';
                  const value = data[database_keys[0]] || '';
                  tbody_td += `
                          <td
                            style="text-transform: capitalize; padding-left:11px; padding-right:11px;border-bottom:2px #eeeeee solid; border-top:2px #eeeeee solid; padding-top:10px; padding-bottom:10px; 
                            ${
                              index == 0
                                ? `border-left:2px #eeeeee solid; border-top-left-radius:6px; border-bottom-left-radius:6px;`
                                : ``
                            } 
                            ${
                              index == header_colums.length - 1
                                ? `border-right:2px #eeeeee solid; border-top-right-radius:6px; border-bottom-right-radius:6px;`
                                : ``
                            }">
                            ${value_to_prepend}${value}${value_to_append}
                          </td>`;
                });
                // ----------------------- (EXIT) business logic to add data in tbody_rows(table) -----------------------

                if (header_colums.length) {
                  tbody_rows += `<tr>${tbody_td}</tr>`;
                }
              });

              if (!tbody_rows) {
                this.setState({is_pdf_generator_loading: false});
                this._onToastMessageSend('No data found to Print.');
                return;
              }
              const tbody = `<tbody>${tbody_rows}</tbody>`;
              table += tbody;
              //   table += tfoot;

              // -------------------------------------------- final table -------------------------------------------------- //
              table = `<table style="border-spacing:0 15px; width:100%; color:black">${table}</table>`;
              const html = `<div>${table}</div>`;

              // -------------------------------------------- print to pdf ------------------------------------------------- //
              this.setState({is_pdf_generator_loading: false});
              await RNPrint.print({
                html: html,
                jobName: `Order_Report_${_dateFormatter(new Date())}`,
              });
            }
          } else {
            _getAllFilteredOrdersInfo();
          }
        })
        .catch((err) => {
          console.log({...err});
          this.setState({
            is_pdf_generator_loading: false,
            error_msg: err.response.data.message,
          });
        });
    };

    let table_body_data = [];

    _getAllFilteredOrdersInfo(
      UNIVERSAL_ENTRY_POINT_ADDRESS + API_FILTER_ORDERS_BY_STATUS_AND_DATE,
      selected_order_status,
      selected_from_date,
      selected_to_date,
    );
  };

  _onExportToExcelPress = (is_exported_to_csv = false) => {
    const {enable_column_modification} = this.state;
    if (enable_column_modification) {
      const {
        reportTableInformation,
        selected_order_status,
        selected_from_date,
        selected_to_date,
      } = this.state;
      this.setState({is_spreadsheet_generator_loading: true});
      var json_data = [];

      const _getAllFilteredOrdersInfo = async (
        url = `${
          UNIVERSAL_ENTRY_POINT_ADDRESS + API_FILTER_ORDERS_BY_STATUS_AND_DATE
        }`,
        order_status = [],
        from = null,
        to = null,
      ) => {
        const token = await AsyncStorage.getItem('token');
        axios
          .get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              order_status: order_status.length ? [...order_status] : null,
              from: from,
              to: to,
            },
          })
          .then(async (res) => {
            if (res.data.product_order.data.length) {
              //capitalize all words of a string.
              function _capitalizeWords(string) {
                return string.replace(/(?:^|\s)\S/g, function (a) {
                  return a.toUpperCase();
                });
              }

              res.data.product_order.data.map((data) => {
                data.created_at = `${data.created_at}`.split(' ')[0];
                data.order_status = _capitalizeWords(data.order_status.status);
              });
              api_response_data.push(...res.data.product_order.data);

              if (res.data.product_order.next_page_url) {
                _getAllFilteredOrdersInfo(
                  res.data.product_order.next_page_url,
                  selected_order_status,
                  selected_from_date,
                  selected_to_date,
                );
              } else {
                console.log('api_response_data', api_response_data);

                const header_colums = reportTableInformation[0];

                api_response_data.map((data) => {
                  let json_data_obj = {};
                  header_colums.map((column) => {
                    const {
                      database_keys,
                      prepend_value_with,
                      append_value_with,
                    } = column.info_needed_to_generate_report;
                    if (column.is_redirection_url && !column.is_excluded) {
                      // json_data_obj[
                      // 'GoTo'
                      // ] = `https://www.pdrtoolsdirect.com/merchant/orders/${data.order_id}`;
                      return;
                    }
                    if (!column.is_excluded) {
                      column.info_needed_to_generate_report.report_titles.map(
                        (title, index) => {
                          const column_name = title;
                          const value_to_prepend = Array.isArray(
                            prepend_value_with,
                          )
                            ? prepend_value_with[index] || ''
                            : '';
                          const value_to_append = Array.isArray(
                            append_value_with,
                          )
                            ? append_value_with[index] || ''
                            : '';

                          const value = data[database_keys[index]]
                            ? `${value_to_prepend}${
                                data[database_keys[index]]
                              }${value_to_append}`
                            : '-';

                          json_data_obj[column_name] = value;
                        },
                      );
                    }
                  });

                  const json_data_object_key_arr = Object.keys(json_data_obj);
                  if (!json_data.length) {
                    let empty_object = {}; // to generate empty row in spreadsheet (right after header_row)
                    json_data_object_key_arr.map((key) => {
                      empty_object[key] = '';
                    });
                    Object.keys(empty_object).length &&
                      json_data.push(empty_object);
                  }

                  if (json_data_object_key_arr.length) {
                    json_data.push(json_data_obj);
                  }
                });

                if (!json_data.length) {
                  this.setState({
                    is_spreadsheet_generator_loading: false,
                    enable_column_modification: false,
                  });
                  return this._onToastMessageSend(
                    'No data to show in the spreadsheet!!',
                  );
                }

                var work_sheet = XLSX.utils.json_to_sheet(json_data);
                console.log('json = ', json_data);
                var work_book = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(
                  work_book,
                  work_sheet,
                  'Order_Report',
                );

                const wbout = is_exported_to_csv
                  ? XLSX.utils.sheet_to_csv(work_sheet)
                  : XLSX.write(work_book, {
                      type: 'binary',
                      bookType: 'xlsx',
                    });
                const file_extension = is_exported_to_csv ? 'csv' : 'xlsx';

                try {
                  await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                  ]);
                } catch (err) {
                  console.warn(err);
                }
                const readGranted = await PermissionsAndroid.check(
                  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                );
                const writeGranted = await PermissionsAndroid.check(
                  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                );
                if (!readGranted || !writeGranted) {
                  console.log(
                    'Read and write permissions have not been granted',
                  );
                  return;
                }
                var path = `${RNFS.ExternalStorageDirectoryPath}/PdrMerchant`;
                RNFS.mkdir(path);
                const current_date = new Date();

                const fileExistsInLocalFileSystem = (file_path) => {
                  return RNFS.exists(file_path);
                };

                const newFileNameGenerator = async (
                  parent_file_path,
                  file_name,
                ) => {
                  let i = 1;
                  let new_file_path = `${parent_file_path}/${file_name}_${i}.${file_extension}`;
                  while (await fileExistsInLocalFileSystem(new_file_path)) {
                    i++;
                    new_file_path = `${parent_file_path}/${file_name}_${i}.${file_extension}`;
                  }
                  return Promise.resolve({new_file_path});
                };

                const _writeFile = (file_path) => {
                  RNFS.writeFile(
                    file_path,
                    wbout,
                    'ascii' /* -- or -- utf-8 (can be replaced with each-other, utf-8 is more advanced than ascii, but for some reason can'be used to convert .xlsx file, so kept ascii here for both types) */,
                  )
                    .then((r) => {
                      this._onToastMessageSend('File downloaded successfully');

                      const RNFetchBlob = NativeModules.RNFetchBlob;
                      if (Platform.OS === 'android') {
                        // only for android
                        const mimeType = is_exported_to_csv
                          ? `text/csv`
                          : `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
                        RNFetchBlob.actionViewIntent(file_path, mimeType);
                      } else if (Platform.OS === 'ios') {
                        // only for ios
                        RNFetchBlob.openDocument(file_path);
                      }
                    })
                    .catch((err) => {
                      console.log(
                        'failed writing file to the path: ' + file_path,
                        err,
                      );
                    })
                    .finally(() => {
                      this.setState({
                        is_spreadsheet_generator_loading: false,
                      });
                    });
                };

                fileExistsInLocalFileSystem(
                  `${path}/Order_Report_${_dateFormatter(
                    current_date,
                  )}.${file_extension}`,
                )
                  .then((file_exist) => {
                    if (file_exist) {
                      newFileNameGenerator(
                        path,
                        `Order_Report_${_dateFormatter(current_date)}`,
                      ).then((res) => {
                        path = res.new_file_path;
                        _writeFile(path);
                      });
                    } else {
                      path += `/Order_Report_${_dateFormatter(
                        current_date,
                      )}.${file_extension}`;
                      _writeFile(path);
                    }
                  })
                  .catch((err) => console.log(err));
              }
            } else {
              this.setState({
                is_spreadsheet_generator_loading: false,
                enable_column_modification: false,
              });
              this._onToastMessageSend('No data to show in the spreadsheet!!');
            }
          })
          .catch((err) => {
            console.log({...err});
            this.setState({
              is_spreadsheet_generator_loading: false,
              enable_column_modification: false,
              error_msg: err.response.data.message,
            });
          });
      };

      let api_response_data = [];
      _getAllFilteredOrdersInfo(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_FILTER_ORDERS_BY_STATUS_AND_DATE,
        selected_order_status,
        selected_from_date,
        selected_to_date,
      );
    }
  };

  _onToastMessageSend = (message) => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  render() {
    const {
      table_column_width_ref,
      reportTableInformation,
      order_details_prev_page_url,
      current_page_no,
      order_details_next_page_url,
      isLoading,
      is_data_filter_modal_visible,

      selected_order_status,
      selected_from_date,
      selected_to_date,

      is_pdf_generator_loading,
      is_spreadsheet_generator_loading,

      enable_column_modification,
    } = this.state;
    return (
      <View style={{flex: 1}}>
        {!isLoading ? (
          <>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: 10,
                zIndex: !is_data_filter_modal_visible ? 1 : 0,
              }}>
              <Card
                style={{
                  width: '100%',
                  backgroundColor: '#eeeeee',
                  padding: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  {!enable_column_modification ? (
                    <>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Card
                          style={{
                            height: 40,
                            width: 40,
                            borderRadius: 40 / 2,
                            backgroundColor: '#0F9D58',
                            marginRight: 5,
                          }}
                          onPress={() => this._onFilterDataPress()}>
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              flex: 1,
                            }}>
                            <Icon
                              name="filter"
                              style={{
                                color: '#fff', //#9d9d9d
                                fontSize: 20,
                              }}
                            />
                          </View>
                        </Card>
                        <Card
                          style={{
                            height: 40,
                            width: 40,
                            borderRadius: 40 / 2,
                            backgroundColor: '#FFA500',
                            marginLeft: 5,
                          }}
                          onPress={() =>
                            this.setState({enable_column_modification: true})
                          }>
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              flex: 1,
                            }}>
                            <Icon
                              name="print"
                              style={{
                                color: '#fff', //#9d9d9d
                                fontSize: 20,
                              }}
                            />
                          </View>
                        </Card>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Ripple
                          style={{marginRight: 5}}
                          rippleContainerBorderRadius={4}
                          disabled={!order_details_prev_page_url ? true : false}
                          onPress={() =>
                            this._onFilterOrders(
                              order_details_prev_page_url,
                              selected_order_status,
                              selected_from_date,
                              selected_to_date,
                            )
                          }>
                          <View
                            style={{
                              height: 40,
                              width: 40,
                              borderRadius: 4,
                              backgroundColor: order_details_prev_page_url
                                ? '#4285F4'
                                : '#fff',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Icon
                              name="arrow-back"
                              style={{
                                color: order_details_prev_page_url
                                  ? '#fff'
                                  : '#eeeeee',
                                fontSize: 20,
                              }}
                            />
                          </View>
                        </Ripple>
                        <View>
                          <Badge
                            style={{
                              backgroundColor: '#fff',
                              fontSize: 10,
                              fontWeight: 'bold',
                              color: '#454545',
                            }}
                            textBreakStrategy="simple"
                            size={24}>
                            {current_page_no}
                          </Badge>
                        </View>
                        <Ripple
                          style={{marginLeft: 5}}
                          rippleContainerBorderRadius={4}
                          disabled={!order_details_next_page_url ? true : false}
                          onPress={() =>
                            this._onFilterOrders(
                              order_details_next_page_url,
                              selected_order_status,
                              selected_from_date,
                              selected_to_date,
                            )
                          }>
                          <View
                            style={{
                              height: 40,
                              width: 40,
                              borderRadius: 4,
                              backgroundColor: order_details_next_page_url
                                ? '#4285F4'
                                : '#fff',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Icon
                              name="arrow-forward"
                              style={{
                                color: order_details_next_page_url
                                  ? '#fff'
                                  : '#eeeeee',
                                fontSize: 20,
                              }}
                            />
                          </View>
                        </Ripple>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text
                        style={{
                          color: '#454545',
                          flex: 1,
                          flexWrap: 'wrap',
                          textAlign: 'center',
                          fontWeight: 'bold',
                        }}>
                        Toggle{' '}
                        <Icon
                          name="check-circle"
                          type="FontAwesome5"
                          style={{color: '#1aa260', fontSize: 14}}
                        />{' '}
                        and{' '}
                        <Icon
                          name="times-circle"
                          type="FontAwesome5"
                          style={{color: '#DB4437', fontSize: 14}}
                        />{' '}
                        to Exclude or Include columns in the report.
                      </Text>

                      <TouchableOpacity
                        style={{
                          backgroundColor: 'transparent',
                        }}
                        onPress={() =>
                          !is_pdf_generator_loading
                            ? this._onPrintPDFReportPress()
                            : null
                        }>
                        {!is_pdf_generator_loading ? (
                          <PDFReportSVG width={42} height={42} />
                        ) : (
                          <>
                            <PDFReportSVGEmpty width={42} height={42} />
                            <ActivityIndicator
                              size={15}
                              color="rgb(234,84,64)"
                              style={{
                                position: 'absolute',
                                top: 9,
                                alignSelf: 'center',
                              }}
                            />
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: 'transparent',
                        }}
                        onPress={() =>
                          !is_spreadsheet_generator_loading
                            ? Alert.alert(
                                'Choose one',
                                'Which format you want your data to be in?',
                                [
                                  {
                                    text: 'Cancel',
                                    style: 'cancel',
                                  },
                                  {
                                    text: '.csv',
                                    onPress: () =>
                                      this._onExportToExcelPress(true),
                                  },
                                  {
                                    text: '.xlxs',
                                    onPress: () =>
                                      this._onExportToExcelPress(false),
                                  },
                                ],
                                {cancelable: true},
                              )
                            : null
                        }>
                        {!is_spreadsheet_generator_loading ? (
                          <>
                            <SpreadSheetSVG />
                          </>
                        ) : (
                          <>
                            <SpreadSheetEmptySVG />
                            <ActivityIndicator
                              size={17}
                              color="#fff"
                              style={{
                                position: 'absolute',
                                bottom: 10,
                                alignSelf: 'center',
                              }}
                            />
                          </>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </Card>
            </View>
            <View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 300}}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}>
                  <View style={{margin: 10}}>
                    {reportTableInformation.map((table_info, index) => {
                      if (index == 0) {
                        return (
                          <View
                            style={{
                              flexDirection: 'row',
                              paddingVertical: 10,
                              borderRadius: 4,
                              backgroundColor: '#eeeeee',
                              marginTop: enable_column_modification ? 12 : 0,
                            }}
                            key={index}>
                            {table_info.map((table_column_info, index) => {
                              return (
                                <TouchableOpacity
                                  key={index}
                                  onPress={() =>
                                    this._onHeaderColumnPress(table_column_info)
                                  }>
                                  <View
                                    style={{
                                      width: table_column_info.width,
                                      marginLeft: 20,
                                      justifyContent: 'center',
                                    }}>
                                    {enable_column_modification ? (
                                      <View
                                        style={{
                                          width: 18,
                                          alignItems: 'center',
                                          marginTop: -20,
                                        }}>
                                        <View
                                          style={{
                                            height: 18,
                                            width: 18,
                                            borderRadius: 9,
                                            backgroundColor: table_column_info.is_excluded
                                              ? '#DB4437'
                                              : '#1aa260',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}>
                                          <Icon
                                            name={
                                              table_column_info.is_excluded
                                                ? 'times'
                                                : 'check'
                                            }
                                            style={{fontSize: 8, color: '#fff'}}
                                            type="FontAwesome5"
                                          />
                                        </View>
                                        <View
                                          style={{
                                            width: 2,
                                            height: 18,
                                            marginTop: -2,
                                            borderRadius: 2,
                                            backgroundColor: table_column_info.is_excluded
                                              ? '#DB4437'
                                              : '#1aa260',
                                          }}
                                        />
                                      </View>
                                    ) : null}
                                    <Text
                                      style={{
                                        color: '#454545',
                                        fontWeight: 'bold',
                                      }}>
                                      {table_column_info.name}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        );
                      }
                      return (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 5,
                            borderWidth: 1,
                            borderRadius: 4,
                            borderColor: '#dddddd',
                            marginTop: 10,
                          }}>
                          {Object.keys(table_info).map((column_key, index) => {
                            const column_width = table_column_width_ref[index];
                            return (
                              <View
                                key={index}
                                style={{width: column_width, marginLeft: 20}}>
                                {table_info[column_key]}
                              </View>
                            );
                          })}
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </ScrollView>
            </View>

            {is_data_filter_modal_visible ? (
              <DataFilterModal
                filterOrders={(order_status = [], from = null, to = null) =>
                  this._onFilterOrders(
                    `${
                      UNIVERSAL_ENTRY_POINT_ADDRESS +
                      API_FILTER_ORDERS_BY_STATUS_AND_DATE
                    }`,
                    order_status,
                    from,
                    to,
                  )
                }
                closeModal={this._closeDataFilterModal}
              />
            ) : null}
          </>
        ) : (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'center',
            }}>
            {this.state.error_msg ? (
              <Text
                style={{padding: 10, textAlign: 'center', color: '#8d8d8d'}}>
                {this.state.error_msg}
              </Text>
            ) : (
              <ActivityIndicator size={22} color={'#6B23AE'} />
            )}
          </View>
        )}
      </View>
    );
  }
}

const statusInfo = [
  {
    name: 'all',
    database_id: [],
    id: 1,
    is_selected: true,
  },
  {
    database_id: [1, 2],
    name: 'on-going',
    id: 2,
  },
  {
    name: 'Completed',
    database_id: [3],
    id: 3,
  },
  {
    name: 'cancelled',
    database_id: [4],
    id: 4,
  },
  {
    database_id: [5],
    name: 'returned',
    id: 5,
  },
];

const _dateFormatter = (date_object, format_with = '-') => {
  const dd = String(date_object.getDate()).padStart(2, '0');
  const mm = String(date_object.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = date_object.getFullYear();
  return `${yyyy}${format_with}${mm}${format_with}${dd}`;
};

const _dateCounter = (
  days_to_add = 0,
  months_to_add = 0,
  years_to_add = 0,
  date_to_manipulate = new Date(),
) => {
  const date = new Date(
    date_to_manipulate.getFullYear(),
    date_to_manipulate.getMonth(),
    date_to_manipulate.getDate() + parseInt(days_to_add),
  );
  date.setMonth(date.getMonth() + parseInt(months_to_add)); // alternative (rather than writing it in the date object -- like -- parseInt(days_to_add))
  date.setFullYear(date.getFullYear() + parseInt(years_to_add));
  return date;
};

class DataFilterModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      status_info: [],
      date_info: [],
      user_account_created_at: '',

      is_date_picker_visible: false,
      selected_date_for_picker: new Date(),
      on_date_picker_change_state_name: '',

      selected_from_date: null,
      selected_to_date: null,

      picker_max_date: new Date(),
      picker_min_date: new Date(),

      isLoading: true,
    };
  }

  async componentDidMount() {
    const token = await AsyncStorage.getItem('token');
    axios
      .get(UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_SELLER_INFO_KEY, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const user_account_created_at = new Date(
          `${res.data.created_at}`.split(' ')[0],
        );
        const account_created_at_year = user_account_created_at.getFullYear();
        // const account_created_at_year = 2016;
        const current_year = new Date().getFullYear();

        let years_until_now = [];
        years_until_now.push(account_created_at_year);
        for (let i = 1; i <= current_year - account_created_at_year; i++) {
          years_until_now.push(account_created_at_year + i);
        }

        const dateInfo = [
          {
            name: 'today',
            from: _dateCounter(),
            to: _dateCounter(),
            id: 1,
          },
          {
            name: 'weekly',
            from: _dateCounter(/* days_to_add */ -7),
            to: _dateCounter(),
            id: 2,
          },
          {
            name: 'monthly',
            from: _dateCounter(/* days_to_add */ 0, /* months_to_add */ -1),
            to: _dateCounter(),
            id: 3,
            is_selected: true,
          },
        ];
        years_until_now = years_until_now.reverse();
        years_until_now.map((year) => {
          dateInfo.push({
            name: `${year}`,
            id: dateInfo.length + 1,
            from: new Date(`${year}-01-01`),
            to: new Date(`${year}-12-31`),
          });
        });

        this.setState({
          user_account_created_at: user_account_created_at,
          status_info: statusInfo,
          date_info: dateInfo,
          picker_min_date: new Date(`${account_created_at_year}-01-01`),
          picker_max_date: new Date(),
          isLoading: false,
        });
        dateInfo.map((date) => {
          if (date.is_selected) {
            this.setState({
              selected_from_date: date.from,
              selected_to_date: date.to,
            });
          }
        });
      })
      .catch((err) => {
        console.log({...err});
      });
  }

  _onDateChange = (date_state_name, date_val) => {
    // Below commented code was written for textInputField to enter date, but as of now we use date picker to do the same
    // // adds - after 4th and 6th character
    // const date_val_wihtout_hyphen = `${date_val}`.split('-').join(''); // remove hyphens
    // if (
    //   date_val_wihtout_hyphen.length == 4 ||
    //   date_val_wihtout_hyphen.length == 6
    // ) {
    //   date_val += '-';
    // }

    this.setState({[date_state_name]: date_val});

    // to remove is_selected flag from all date_info object elements
    const {date_info} = this.state;
    date_info.map((date) => {
      if (date.is_selected) {
        date.is_selected = false;
      }
    });
  };

  _onStateChange = (state_name, val) => {
    this.setState({[state_name]: val});
  };

  _onSelectStatus = (index) => {
    const {status_info} = this.state;
    const is_selected = status_info[index].is_selected;
    if (index == 0 && !is_selected) {
      status_info.map((status) => (status.is_selected = false));
    } else if (index != 0 && status_info[0].is_selected) {
      status_info[0].is_selected = false;
    }
    status_info[index].is_selected = !is_selected;
    this._onStateChange('status_info', status_info);
  };

  _onSelectDate = (index, is_selected = true) => {
    const {date_info} = this.state;
    const from = date_info[index].from;
    const to = date_info[index].to;
    date_info.map((date) => (date.is_selected = false));
    date_info[index].is_selected = is_selected;
    this._onStateChange('date_info', date_info);
    this._onStateChange('selected_from_date', from);
    this._onStateChange('selected_to_date', to);
  };

  _onFilterDataPress = () => {
    const {selected_from_date, selected_to_date, status_info} = this.state;
    let order_status = [];
    status_info.map((status_info) => {
      if (status_info.is_selected) {
        order_status.push(...status_info.database_id);
      }
    });
    this.props.filterOrders(
      order_status,
      _dateFormatter(selected_from_date),
      _dateFormatter(selected_to_date),
    );
    this.props.closeModal();
  };

  render() {
    const {
      status_info,
      date_info,
      is_date_picker_visible,
      on_date_picker_change_state_name,
      selected_date_for_picker,
      picker_max_date,
      picker_min_date,
      user_account_created_at,
    } = this.state;
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
        <Modal
          animationType="slide"
          onRequestClose={this.props.closeModal}
          transparent={true}
          visible={true}>
          <SafeAreaView
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              height: '56%',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
            }}>
            <View>
              <Card>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginHorizontal: 10,
                  }}>
                  <View>
                    <IconButton
                      icon="close"
                      onPress={
                        is_date_picker_visible
                          ? () => {
                              this._onStateChange(
                                'is_date_picker_visible',
                                false,
                              );
                              this._onStateChange(
                                'selected_date_for_picker',
                                new Date(),
                              );
                            }
                          : this.props.closeModal
                      }
                    />
                  </View>
                  <View>
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>
                      {is_date_picker_visible ? 'Pick a Date' : 'Order Filter'}
                      {is_date_picker_visible &&
                      on_date_picker_change_state_name === 'selected_from_date'
                        ? ' (From)'
                        : is_date_picker_visible &&
                          on_date_picker_change_state_name ===
                            'selected_to_date'
                        ? ' (To)'
                        : ''}
                    </Text>
                  </View>
                  <View>
                    <IconButton
                      icon="check"
                      onPress={
                        is_date_picker_visible
                          ? () => {
                              // ---------- logic to let user enter only the dates having gap of 1 year in from and to...
                              if (
                                on_date_picker_change_state_name ==
                                'selected_from_date'
                              ) {
                                const date_after_one_year_from_selected_date = _dateCounter(
                                  /* days_to_add */ 0,
                                  /* months_to_add */ 0,
                                  /* years_to_add */ 1,
                                  /* date_to_manipulate */ selected_date_for_picker,
                                );
                                const current_date = new Date();
                                if (
                                  new Date(
                                    date_after_one_year_from_selected_date,
                                  ) > current_date
                                ) {
                                  this.setState({
                                    picker_max_date: current_date,
                                  });
                                  console.log(
                                    'from---->',
                                    _dateFormatter(selected_date_for_picker),
                                    _dateFormatter(current_date),
                                  );
                                } else {
                                  this.setState({
                                    picker_max_date: date_after_one_year_from_selected_date,
                                  });
                                  console.log(
                                    'from---->',
                                    _dateFormatter(selected_date_for_picker),
                                    _dateFormatter(
                                      date_after_one_year_from_selected_date,
                                    ),
                                  );
                                }
                                this._onStateChange(
                                  'picker_min_date',
                                  selected_date_for_picker,
                                );
                              } else if (
                                on_date_picker_change_state_name ==
                                'selected_to_date'
                              ) {
                                const date_before_one_year_from_selected_date = _dateCounter(
                                  /* days_to_add */ 0,
                                  /* months_to_add */ 0,
                                  /* years_to_add */ -1,
                                  /* date_to_manipulate */ selected_date_for_picker,
                                );
                                if (
                                  date_before_one_year_from_selected_date <
                                  user_account_created_at
                                ) {
                                  this.setState({
                                    picker_min_date: user_account_created_at,
                                  });
                                } else {
                                  this.setState({
                                    picker_min_date: date_before_one_year_from_selected_date,
                                  });
                                }
                                this._onStateChange(
                                  'picker_max_date',
                                  selected_date_for_picker,
                                );
                                console.log(
                                  'to---->',
                                  _dateFormatter(picker_min_date),
                                  _dateFormatter(picker_max_date),
                                );
                              }
                              // ---------- (EXIT) logic to let user enter only the dates having gap of 1 year in from and to...

                              this._onStateChange(
                                on_date_picker_change_state_name ||
                                  'selected_from_date',
                                selected_date_for_picker,
                              );
                              this._onStateChange(
                                'is_date_picker_visible',
                                false,
                              );
                            }
                          : this._onFilterDataPress
                      }
                    />
                  </View>
                </View>
              </Card>
            </View>
            {!this.state.isLoading ? (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flex: 1}}>
                    <View
                      style={{
                        borderRadius: 4,
                        backgroundColor: 'rgba(141, 141, 141, 0.2)', //rgba(66, 133, 244, 0.2)
                        padding: 10,
                        margin: 10,
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'rgba(141, 141, 141, 1)'}}>
                        Status
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      height: 4,
                      width: 4,
                      borderRadius: 2,
                      backgroundColor: 'rgba(141, 141, 141, 0.2)',
                      alignSelf: 'center',
                    }}
                  />
                  <View style={{flex: 1}}>
                    <View
                      style={{
                        borderRadius: 4,
                        backgroundColor: 'rgba(141, 141, 141, 0.2)', //rgba(66, 133, 244, 0.2)
                        padding: 10,
                        margin: 10,
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'rgba(141, 141, 141, 1)'}}>
                        Date
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    ...styles.horizontalSeparator,
                    backgroundColor: '#eeeeee',
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flex: 1,
                  }}>
                  <View style={{flex: 1}}>
                    {/* <View
                  style={{
                    borderRadius: 4,
                    backgroundColor: 'rgba(141, 141, 141, 0.2)', //rgba(66, 133, 244, 0.2)
                    padding: 10,
                    margin: 10,
                    alignItems: 'center',
                  }}>
                  <Text style={{color: 'rgba(141, 141, 141, 1)'}}>Status</Text>
                </View>
                <View
                  style={{
                    ...styles.horizontalSeparator,
                    backgroundColor: '#eeeeee',
                  }}
                /> */}
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{paddingBottom: 50}}>
                      {status_info.map((status, index) => {
                        return (
                          <Pressable
                            key={'status-' + index}
                            onPress={() => this._onSelectStatus(index)}>
                            <View
                              style={{
                                padding: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: '#eeeeee',
                                backgroundColor: status.is_selected
                                  ? 'rgba(66, 133, 244, 0.2)'
                                  : 'transparent',
                              }}>
                              <Text
                                style={{
                                  textTransform: 'capitalize',
                                  color: status.is_selected
                                    ? 'rgba(66, 133, 244, 1)'
                                    : '#000',
                                }}>
                                {status.name}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                  <View
                    style={{
                      height: '100%',
                      width: 1,
                      backgroundColor: '#eeeeee',
                    }}
                  />
                  <View style={{flex: 1}}>
                    {/* <View
                  style={{
                    borderRadius: 4,
                    backgroundColor: 'rgba(141, 141, 141, 0.2)', //rgba(66, 133, 244, 0.2)
                    padding: 10,
                    margin: 10,
                    alignItems: 'center',
                  }}>
                  <Text style={{color: 'rgba(141, 141, 141, 1)'}}>Date</Text>
                </View>
                <View
                  style={{
                    ...styles.horizontalSeparator,
                    backgroundColor: '#eeeeee',
                  }}
                /> */}
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{paddingBottom: 50}}>
                      {date_info.map((date, index) => {
                        return (
                          <Pressable
                            key={'date-' + index}
                            onPress={() => this._onSelectDate(index)}>
                            <View
                              style={{
                                padding: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: '#eeeeee',
                                backgroundColor: date.is_selected
                                  ? 'rgba(247, 181, 41, 0.2)'
                                  : 'transparent',
                              }}>
                              <Text
                                style={{
                                  textTransform: 'capitalize',
                                  color: date.is_selected
                                    ? 'rgba(247, 181, 41, 1)'
                                    : '#000',
                                }}>
                                {date.name}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}
                      {/* --------------------------------- Keep below commented code as it is for future use --------------------------------- */}
                      {/* <View
                        style={{
                          height: 25,
                          width: 25,
                          borderRadius: 25 / 2,
                          borderWidth: 1,
                          borderColor: '#8d8d8d',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                          marginTop: 10,
                        }}>
                        <Text style={{fontSize: 9, color: '#8d8d8d'}}>OR</Text>
                      </View> */}
                      {/* <View style={{padding: 10}}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <View>
                            <Text style={{fontWeight: 'bold', fontSize: 18}}>
                              From:{' '}
                            </Text>
                          </View>
                          <View>
                            <Card
                              style={{
                                backgroundColor: '#eeeeee',
                                paddingLeft: 10,
                                paddingRight: 22,
                              }}>
                              <Pressable
                                onPress={() => {
                                  this._onStateChange(
                                    'on_date_picker_change_state_name',
                                    'selected_from_date',
                                  );
                                  this._onStateChange(
                                    'is_date_picker_visible',
                                    true,
                                  );
                                }}>
                                <View
                                  style={{
                                    backgroundColor: 'transparent',
                                    height: 30,
                                    margin: 0,
                                    padding: 0,
                                    justifyContent: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: this.state.selected_from_date
                                        ? '#000'
                                        : '#8d8d8d',
                                    }}>
                                    {this.state.selected_from_date
                                      ? _dateFormatter(
                                          this.state.selected_from_date,
                                        )
                                      : 'YYYY-MM-DD'}
                                  </Text>
                                </View>
                              </Pressable>
                            </Card>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 10,
                            justifyContent: 'space-between',
                          }}>
                          <View>
                            <Text style={{fontWeight: 'bold', fontSize: 18}}>
                              To:{' '}
                            </Text>
                          </View>
                          <View>
                            <Card
                              style={{
                                backgroundColor: '#eeeeee',
                                paddingLeft: 10,
                                paddingRight: 22,
                              }}>
                              <Pressable
                                onPress={() => {
                                  this._onStateChange(
                                    'on_date_picker_change_state_name',
                                    'selected_to_date',
                                  );
                                  this._onStateChange(
                                    'is_date_picker_visible',
                                    true,
                                  );
                                }}>
                                <View
                                  style={{
                                    backgroundColor: 'transparent',
                                    height: 30,
                                    margin: 0,
                                    padding: 0,
                                    justifyContent: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: this.state.selected_to_date
                                        ? '#000'
                                        : '#8d8d8d',
                                    }}>
                                    {this.state.selected_from_date
                                      ? _dateFormatter(
                                          this.state.selected_to_date,
                                        )
                                      : 'YYYY-MM-DD'}
                                  </Text>
                                </View>
                              </Pressable>
                            </Card>
                          </View>
                        </View>
                      </View> */}
                    </ScrollView>
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      width: '100%',
                      bottom: 0,
                      left: 0,
                      backgroundColor: '#eeeeee',
                    }}>
                    {is_date_picker_visible ? (
                      <DatePicker
                        date={selected_date_for_picker}
                        minimumDate={picker_min_date}
                        maximumDate={picker_max_date}
                        onDateChange={(chosen_date) => {
                          this._onDateChange(
                            'selected_date_for_picker',
                            chosen_date,
                          );
                        }}
                        mode="date"
                        androidVariant="iosClone"
                        style={{
                          borderBottomLeftRadius: 10,
                          borderBottomRightRadius: 10,
                          width: Dimensions.get('window').width,
                          height: Dimensions.get('window').height / 2,
                        }}
                      />
                    ) : null}
                  </View>
                </View>
              </>
            ) : (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  justifyContent: 'center',
                }}>
                <ActivityIndicator size={22} color="#6B23AE" />
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
    backgroundColor: '#ddd',
  },
});

// ------------------------------------------------------------------------------------------------ //

// import React, {Component} from 'react';
// import {
//   AppRegistry,
//   Button,
//   StyleSheet,
//   NativeModules,
//   Platform,
//   Text,
//   View,
// } from 'react-native';

// import RNHTMLtoPDF from 'react-native-html-to-pdf';
// import RNPrint from 'react-native-print';

// export default class RNPrintExample extends Component {
//   state = {
//     selectedPrinter: null,
//   };

//   // @NOTE iOS Only
//   selectPrinter = async () => {
//     const selectedPrinter = await RNPrint.selectPrinter({x: 100, y: 100});
//     this.setState({selectedPrinter});
//   };

//   // @NOTE iOS Only
//   silentPrint = async () => {
//     if (!this.state.selectedPrinter) {
//       alert('Must Select Printer First');
//     }

//     const jobName = await RNPrint.print({
//       printerURL: this.state.selectedPrinter.url,
//       html: '<h1>Silent Print</h1>',
//     });
//   };

//   async printHTML() {
//     let html = '<h1>Custom converted PDF Document</h1>';
//     for (let i = 0; i < 10; i++) {
//       html = `${html}${html}`;
//     }
//     await RNPrint.print({
//       html: html,
//     });
//   }

//   async printPDF() {
//     let html = '<h1>Custom converted PDF Document</h1>';
//     for (let i = 0; i < 10; i++) {
//       html = `${html}${html}`;
//     }
//     // console.log('html', html);
//     const results = await RNHTMLtoPDF.convert({
//       html: html,
//       fileName: 'test',
//       base64: true,
//     });
//     console.log('resultsresultsresultsresults', results);
//     await RNPrint.print({filePath: results.filePath});
//   }

//   async printRemotePDF() {
//     await RNPrint.print({
//       filePath: 'https://graduateland.com/api/v2/users/jesper/cv',
//     });
//   }

//   customOptions = () => {
//     return (
//       <View>
//         {this.state.selectedPrinter && (
//           <View>
//             <Text>{`Selected Printer Name: ${this.state.selectedPrinter.name}`}</Text>
//             <Text>{`Selected Printer URI: ${this.state.selectedPrinter.url}`}</Text>
//           </View>
//         )}
//         <Button onPress={this.selectPrinter} title="Select Printer" />
//         <Button onPress={this.silentPrint} title="Silent Print" />
//       </View>
//     );
//   };

//   render() {
//     return (
//       <View style={styles.container}>
//         {Platform.OS === 'ios' && this.customOptions()}
//         <Button onPress={this.printHTML} title="Print HTML" />
//         <Button onPress={this.printPDF} title="Print PDF" />
//         <Button onPress={this.printRemotePDF} title="Print Remote PDF" />
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//   },
// });
