import React, {Component} from 'react';
import {View, Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {Card, Badge} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';
import {UNIVERSAL_ENTRY_POINT_ADDRESS, API_GET_PRODUCT_LIST_KEY} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Icon} from 'native-base';
import {ActivityIndicator} from 'react-native';
import Ripple from 'react-native-material-ripple';
import RNPrint from 'react-native-print';
import {ToastAndroid} from 'react-native';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import {PermissionsAndroid} from 'react-native';
import PDFReportSVG from '../../assets/pdf_report.svg';
import PDFReportSVGEmpty from '../../assets/pdf_report_empty.svg';
import SpreadSheetSVG from '../../assets/google_sheets.svg';
import SpreadSheetEmptySVG from '../../assets/google_sheets_empty.svg';
import {BackHandler} from 'react-native';
import {Pressable} from 'react-native';
import {Alert} from 'react-native';
import {Linking, NativeModules} from 'react-native';
import {Platform} from 'react-native';

const database_keys_to_exclude_always_when_generating_report = [
  'created_at',
  'updated_at',
  'deactivated_by_admin',
  'deactivated_by_admin_user',
  'deactivated_by_seller',
  'deactivated_by_seller_user',
  'uuid',
  'update_at',
  'seller_id',
  'id',
  'is_active',
  'in_stock',
  'import_duty',
  'shiping_charge_domestic',
  'shiping_charge_international',
];

const headerColumns = [
  {
    id: 1,
    name: 'Product',
    width: 200,
    info_needed_to_generate_report: {
      database_keys: ['product_name', 'image'],
      report_titles: ['Product Name', 'Image Link'],
    },
  },
  {
    id: 2,
    name: <Text style={{textTransform: 'uppercase'}}>SKU</Text>,
    width: 120,
    is_excluded: false,
    info_needed_to_generate_report: {
      database_keys: ['sku'],
      report_titles: ['SKU'],
    },
  },
  {
    id: 3,
    name: 'price',
    width: 100,
    info_needed_to_generate_report: {
      database_keys: ['actual_price'],
      report_titles: ['Actual Price'],
      prepend_value_with: ['$'],
    },
  },
  {
    id: 4,
    name: 'Sold',
    width: 80,
    info_needed_to_generate_report: {
      database_keys: ['total_sold_quantity'],
      report_titles: ['Sold'],
    },
  },
  {
    id: 5,
    name: 'left qty.',
    width: 80,
    info_needed_to_generate_report: {
      database_keys: ['quantity'],
      report_titles: ['Quantity Left'],
    },
  },
  {
    id: 6,
    name: 'discount',
    width: 80,
    is_excluded: true,
    info_needed_to_generate_report: {
      database_keys: ['discount'],
      report_titles: ['Discount'],
      append_value_with: ['%'],
    },
  },
];

const initialState = {
  reportTableInformation: [],
  table_column_width_ref: [],

  product_details_next_page_url: null,
  product_details_prev_page_url: null,
  current_page_no: null,
  isLoading: true,
  error_msg: '',

  is_pdf_generator_loading: false,
  is_spreadsheet_generator_loading: false,

  enable_column_modification: false,
  important_note: null,
};

const _dateFormatter = (date_object, format_with = '-') => {
  const dd = String(date_object.getDate()).padStart(2, '0');
  const mm = String(date_object.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = date_object.getFullYear();
  return `${yyyy}${format_with}${mm}${format_with}${dd}`;
};

export default class ProductReport extends Component {
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

    this._getProductsData(
      UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_PRODUCT_LIST_KEY,
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  _onHeaderColumnPress = (table_column_info) => {
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

  _pushDataToTable = (product_details, table_data) => {
    table_data.push({
      product: (
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginLeft: -6}}>
          <View
            style={{
              backgroundColor: '#eeeeee',
              height: 50,
              width: 50,
              borderRadius: 2,
            }}>
            {product_details.image ? (
              <Image
                style={{
                  height: '100%',
                  width: '100%',
                  resizeMode: 'cover',
                }}
                borderRadius={2}
                source={{uri: product_details.image}}
              />
            ) : (
              <View
                style={{
                  height: '100%',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon
                  type="FontAwesome5"
                  name="terminal"
                  style={{fontSize: 12, color: '#8d8d8d'}}
                />
              </View>
            )}
          </View>
          <View style={{marginLeft: 10, flex: 1}}>
            <Text
              style={{
                textTransform: 'capitalize',
                fontWeight: 'bold',
                flexWrap: 'wrap',
              }}>
              {product_details.product_name || '-'}
            </Text>
          </View>
        </View>
      ),
      sku: (
        <Text style={{textTransform: 'uppercase'}}>{product_details.sku}</Text>
      ),
      price: (
        <Text style={{textTransform: 'uppercase'}}>
          ${product_details.actual_price || '-'}
        </Text>
      ),
      sold: (
        <Text style={{textTransform: 'uppercase'}}>
          {product_details.total_sold_quantity || '-'}
        </Text>
      ),
      current_quantity: (
        <Text style={{textTransform: 'uppercase'}}>
          {product_details.quantity || '-'}
        </Text>
      ),
      discount: (
        <Text style={{textTransform: 'uppercase'}}>
          {product_details.discount ? `${product_details.discount}%` : '-'}
        </Text>
      ),
    });

    return table_data;
  };

  _getProductsData = async (url) => {
    let table_data = [];
    table_data = this._setTableHeader(table_data);
    this.setState({reportTableInformation: table_data});
    this.setState({isLoading: true});
    const token = await AsyncStorage.getItem('token');
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log('product_report_res=', res);
        if (res.data.product_list.data.length) {
          res.data.product_list.data.map((product_details) => {
            table_data = this._pushDataToTable(product_details, table_data);
          });

          this.setState({
            reportTableInformation: [...table_data],
            isLoading: false,
            product_details_next_page_url: res.data.product_list.next_page_url,
            current_page_no: res.data.product_list.current_page,
            product_details_prev_page_url: res.data.product_list.prev_page_url,
          });
          this.setState({isLoading: false});
        } else {
          this.setState({error_msg: 'Product List is Empty!!'});
        }
      })
      .catch((err) => {
        console.log({...err});
        this.setState({error_msg: err.response.data.message});
        alert(err.response.data.message);
      });
  };

  _onPrintPDFReportPress = () => {
    const {enable_column_modification} = this.state;
    if (!enable_column_modification) {
      return;
    }
    this.setState({is_pdf_generator_loading: true});
    const {reportTableInformation} = this.state;
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
            ${
              typeof header_column.name === 'object'
                ? header_column.name.props.children || '-'
                : header_column.name || '-'
            }</th>`;
    });
    thead_tr = `<tr style="background-color: #eeeeee;">${thead_tr}</tr>`;
    const thead = `<thead>${thead_tr}</thead>`;
    table += thead;

    // ---------------------------------------- tfoot ------------------------------------- //
    let tfooter_content = `
        <tr>
            <td colspan="5" style="text-align: center; color: #8d8d8d;">---------------------- PDR Product Report ----------------------</td>
        </tr>`;
    const tfoot = `<tfoot style="margin-top:10px;">${tfooter_content}</tfoot>`;

    // ---------------------------------------- tbody ------------------------------------- //
    const _getAllProductData = async (url) => {
      const token = await AsyncStorage.getItem('token');
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(async (res) => {
          console.log('product_on_print_res', res);

          if (res.data.product_list.data.length) {
            table_body_data.push(...res.data.product_list.data);
            if (res.data.product_list.next_page_url) {
              _getAllProductData(res.data.product_list.next_page_url);
            } else {
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
                  if (database_keys.length > 1) {
                    tbody_td += `
                          <td style="padding-left:11px; padding-right:11px;border-bottom:2px #eeeeee solid; border-top:2px #eeeeee solid;  padding-top:10px; padding-bottom:10px; ${
                            index == 0
                              ? `border-left:2px #eeeeee solid; border-top-left-radius:6px; border-bottom-left-radius:6px;`
                              : ``
                          }">
                            <div style="display:flex; flex-direction: row-reverse; align-items: center; justify-content: flex-end;">
                              <p style="font-weight: bold; margin-left: 10px">
                                ${data[database_keys[0]] || '-'}
                              </p>
                              ${
                                !data[database_keys[1]]
                                  ? `<div style="width: 50px; height:50px; background-color: #eeeeee; border-radius:2px; display: grid; place-items: center;"><p style="color: #454545; font-weight: bold; font-size: 16px">🚫</p></div>`
                                  : `<img style="height: 50px; width: 50px; border-radius: 2px; background-color: #eeeeee;" src=${
                                      data[database_keys[1]]
                                    } />`
                              }
                            </div>
                          </td>`;
                  } else if (database_keys.length == 1) {
                    const value_to_prepend = Array.isArray(prepend_value_with)
                      ? prepend_value_with[0] || ''
                      : '';
                    const value_to_append = Array.isArray(append_value_with)
                      ? append_value_with[0] || ''
                      : '';
                    const value = data[database_keys[0]] || '';
                    tbody_td += `
                          <td
                            style="padding-left:11px; padding-right:11px;border-bottom:2px #eeeeee solid; border-top:2px #eeeeee solid; padding-top:10px; padding-bottom:10px; 
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
                  } else {
                    return;
                  }
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
                jobName: `Product_Report_${_dateFormatter(new Date())}`,
              });
            }
          } else {
            this.setState({is_pdf_generator_loading: false});
            this._onToastMessageSend('No data found to Print.');
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
    _getAllProductData(
      UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_PRODUCT_LIST_KEY,
    );
  };

  _onExportToExcelPress = (is_exported_to_csv = false) => {
    const {enable_column_modification} = this.state;
    if (enable_column_modification) {
      const {reportTableInformation} = this.state;
      this.setState({is_spreadsheet_generator_loading: true});
      var json_data = [];

      const _getAllProductData = async (url) => {
        const token = await AsyncStorage.getItem('token');
        axios
          .get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(async (res) => {
            if (res.data.product_list.data.length) {
              api_response_data.push(...res.data.product_list.data);
              if (res.data.product_list.next_page_url) {
                _getAllProductData(res.data.product_list.next_page_url);
              } else {
                console.log('api_response_data', api_response_data);

                const deleteKeyFromObj = (obj, keys = []) => {
                  if (!Array.isArray(keys)) {
                    keys = [];
                  }
                  keys.map((key) => {
                    delete obj[key];
                  });
                };

                const keys_to_delete = [
                  ...database_keys_to_exclude_always_when_generating_report,
                ];
                const header_colums = reportTableInformation[0];

                api_response_data.map((data) => {
                  let json_data_obj = {};
                  header_colums.map((column) => {
                    const {
                      database_keys,
                      prepend_value_with,
                      append_value_with,
                    } = column.info_needed_to_generate_report;
                    if (column.is_excluded) {
                      keys_to_delete.push(...database_keys);
                    } else {
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
                            ? value_to_prepend +
                              data[database_keys[index]] +
                              value_to_append
                            : '-';

                          json_data_obj[column_name] = value;
                        },
                      );
                    }
                  });

                  // for learning purpose
                  deleteKeyFromObj(data, keys_to_delete);
                  // (EXIT) - for learning purpose

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
                    important_note_msg: null,
                    enable_column_modification: false,
                  });
                  return this._onToastMessageSend(
                    'No data to show in the spreadsheet!!',
                  );
                }

                var work_sheet = XLSX.utils.json_to_sheet(json_data);
                var work_book = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(
                  work_book,
                  work_sheet,
                  'Product_Report',
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
                    'ascii' /* -- or -- utf-8 (can be replaced with eachother, utf-8 is more advanced than ascii, but for some reason can'be used to convert .xlsx file, so kept ascii here for both types) */,
                  )
                    .then((res) => {
                      this._onToastMessageSend('File downloaded successfully');

                      const RNFetchBlob = NativeModules.RNFetchBlob; // Must be having rn-fetch-blob library installed in the project to use this module
                      if (Platform.OS === 'android') {
                        // For Android
                        const mimeType = is_exported_to_csv
                          ? `text/csv`
                          : `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
                        RNFetchBlob.actionViewIntent(file_path, mimeType).catch(
                          (err) => {
                            console.log(err);
                          },
                        );
                      } else if (Platform.OS === 'ios') {
                        // For IOS
                        RNFetchBlob.previewDocument(file_path).catch((err) => {
                          console.log(err);
                        });
                      }
                    })
                    .catch((err) => {
                      console.log(
                        'Failed writing file to the path: ' + file_path,
                        err,
                      );
                    })
                    .finally(() => {
                      this.setState({
                        is_spreadsheet_generator_loading: false,
                        important_note_msg: null,
                      });
                    });
                };

                fileExistsInLocalFileSystem(
                  `${path}/Product_Report_${_dateFormatter(
                    current_date,
                  )}.${file_extension}`,
                )
                  .then((file_exist) => {
                    if (file_exist) {
                      newFileNameGenerator(
                        path,
                        `Product_Report_${_dateFormatter(current_date)}`,
                      ).then((res) => {
                        path = res.new_file_path;
                        _writeFile(path);
                      });
                    } else {
                      path += `/Product_Report_${_dateFormatter(
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
                important_note_msg: null,
                enable_column_modification: false,
              });
              this._onToastMessageSend('No data to show in the spreadsheet!!');
            }
          })
          .catch((err) => {
            console.log({...err});
            this.setState({
              is_spreadsheet_generator_loading: false,
              important_note_msg: null,
              enable_column_modification: false,
              error_msg: err.response.data.message,
            });
          });
      };

      let api_response_data = [];
      _getAllProductData(
        UNIVERSAL_ENTRY_POINT_ADDRESS + API_GET_PRODUCT_LIST_KEY,
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
      product_details_prev_page_url,
      current_page_no,
      product_details_next_page_url,
      isLoading,

      is_pdf_generator_loading,
      is_spreadsheet_generator_loading,

      enable_column_modification,
      // important_note,
    } = this.state;

    // const important_note_msg = (
    //   <Text
    //     style={{
    //       color: '#454545',
    //       flex: 1,
    //       flexWrap: 'wrap',
    //       paddingHorizontal: 10,
    //       textAlign: 'center',
    //       fontWeight: 'bold',
    //     }}>
    //     {/* Exclude or Include columns accordingly by toggling{' '} */}
    //     Toggle{' '}
    //     <Icon
    //       name="check-circle"
    //       type="FontAwesome5"
    //       style={{color: '#1aa260', fontSize: 14}}
    //     />{' '}
    //     and{' '}
    //     <Icon
    //       name="times-circle"
    //       type="FontAwesome5"
    //       style={{color: '#DB4437', fontSize: 14}}
    //     />{' '}
    //     to Exclude or Include columns in your report. Click again to generate
    //     report.
    //   </Text>
    // );
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
                zIndex: 1,
              }}>
              {/* {enable_column_modification && important_note ? (
                <Card
                  style={{
                    width: '100%',
                    backgroundColor: '#eeeeee',
                    marginBottom: 10,
                  }}>
                  <Pressable
                    onPress={() => this.setState({important_note: null})}
                    style={{padding: 8}}>
                    <Icon
                      name="times"
                      type="FontAwesome5"
                      style={{
                        color: '#8d8d8d',
                        fontSize: 11,
                        alignSelf: 'flex-end',
                        margin: 0,
                        padding: 0,
                        marginRight: 6,
                      }}
                    />
                  </Pressable>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: 10,
                      paddingHorizontal: 10,
                    }}>
                    {important_note}
                  </View>
                </Card>
              ) : null} */}
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
                      <Card
                        style={{
                          height: 40,
                          width: 40,
                          borderRadius: 40 / 2,
                          backgroundColor: '#FFA500',
                          marginLeft: 5,
                        }}
                        onPress={() =>
                          this.setState({
                            enable_column_modification: true,
                            // important_note: important_note_msg,
                          })
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
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Ripple
                          style={{marginRight: 5}}
                          rippleContainerBorderRadius={4}
                          disabled={
                            !product_details_prev_page_url ? true : false
                          }
                          onPress={() =>
                            this._getProductsData(product_details_prev_page_url)
                          }>
                          <View
                            style={{
                              height: 40,
                              width: 40,
                              borderRadius: 4,
                              backgroundColor: product_details_prev_page_url
                                ? '#4285F4'
                                : '#fff',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Icon
                              name="arrow-back"
                              style={{
                                color: product_details_prev_page_url
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
                          disabled={
                            !product_details_next_page_url ? true : false
                          }
                          onPress={() =>
                            this._getProductsData(product_details_next_page_url)
                          }>
                          <View
                            style={{
                              height: 40,
                              width: 40,
                              borderRadius: 4,
                              backgroundColor: product_details_next_page_url
                                ? '#4285F4'
                                : '#fff',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Icon
                              name="arrow-forward"
                              style={{
                                color: product_details_next_page_url
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
                          paddingHorizontal: 10,
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
                                        textTransform: 'capitalize',
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
          </>
        ) : (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'center',
            }}>
            <ActivityIndicator size={22} color={'#6B23AE'} />
          </View>
        )}
      </View>
    );
  }
}

// -------------------------------------------------------------------------------------------------- //

// /* xlsx.js (C) 2013-present  SheetJS -- http://sheetjs.com */
// import XLSX from 'xlsx';

// import React, {Component} from 'react';
// import {
//   AppRegistry,
//   StyleSheet,
//   Text,
//   View,
//   Button,
//   Alert,
//   Image,
//   ScrollView,
//   TouchableWithoutFeedback,
// } from 'react-native';
// import {Table, Row, Rows, TableWrapper} from 'react-native-table-component';

// // react-native-fs
// import {writeFile, readFile, DownloadDirectoryPath} from 'react-native-fs';
// import RNFS from 'react-native-fs';
// import {PermissionsAndroid} from 'react-native';
// const DDP = DownloadDirectoryPath + '/';
// const input = (res) => res;
// const output = (str) => str;

// // react-native-fetch-blob
// /*
// import RNFetchBlob from 'react-native-fetch-blob';
// const { writeFile, readFile, dirs:{ DocumentDir } } = RNFetchBlob.fs;
// const DDP = DocumentDir + "/";
// const input = res => res.map(x => String.fromCharCode(x)).join("");
// const output = str => str.split("").map(x => x.charCodeAt(0));
// */

// const make_cols = (refstr) =>
//   Array.from({length: XLSX.utils.decode_range(refstr).e.c + 1}, (x, i) =>
//     XLSX.utils.encode_col(i),
//   );
// const make_width = (refstr) =>
//   Array.from({length: XLSX.utils.decode_range(refstr).e.c + 1}, () => 60);

// export default class SheetJS extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       data: [
//         [1, 2, 3],
//         [4, 5, 6],
//       ],
//       widthArr: [60, 60, 60],
//       cols: make_cols('A1:C2'),
//     };
//     this.importFile = this.importFile.bind(this);
//     this.exportFile = this.exportFile.bind(this);
//   }
//   importFile() {
//     Alert.alert('Rename file to sheetjs.xlsx', 'Copy to ' + DDP, [
//       {text: 'Cancel', onPress: () => {}, style: 'cancel'},
//       {
//         text: 'Import',
//         onPress: () => {
//           readFile(DDP + 'sheetjs.xlsx', 'ascii')
//             .then((res) => {
//               /* parse file */
//               const wb = XLSX.read(input(res), {type: 'binary'});

//               /* convert first worksheet to AOA */
//               const wsname = wb.SheetNames[0];
//               const ws = wb.Sheets[wsname];
//               const data = XLSX.utils.sheet_to_json(ws, {header: 1});

//               /* update state */
//               this.setState({
//                 data: data,
//                 cols: make_cols(ws['!ref']),
//                 widthArr: make_width(ws['!ref']),
//               });
//             })
//             .catch((err) => {
//               Alert.alert('importFile Error', 'Error ' + err.message);
//             });
//         },
//       },
//     ]);
//   }
//   async exportFile() {
//     /* convert AOA back to worksheet */
//     const ws = XLSX.utils.aoa_to_sheet(this.state.data);

//     /* build new workbook */
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');

//     /* write file */
//     const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
//     console.log(wbout);
//     // const file = DDP + 'sheetjsw.xlsx';

//     try {
//       await PermissionsAndroid.requestMultiple([
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//         PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//       ]);
//     } catch (err) {
//       console.warn(err);
//     }
//     const readGranted = await PermissionsAndroid.check(
//       PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//     );
//     const writeGranted = await PermissionsAndroid.check(
//       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//     );
//     if (!readGranted || !writeGranted) {
//       console.log('Read and write permissions have not been granted');
//       return;
//     }
//     var path = `${RNFS.ExternalStorageDirectoryPath}/PDRMerchantApp`;
//     RNFS.mkdir(path);

//     path += `/${parseInt(Math.random() * 1000000000)}.xlsx`;

//     writeFile(path, output(wbout), 'ascii')
//       .then((res) => {
//         Alert.alert('exportFile success', 'Exported to ' + path);
//       })
//       .catch((err) => {
//         Alert.alert('exportFile Error', 'Error ' + err.message);
//       });
//   }
//   render() {
//     return (
//       <ScrollView contentContainerStyle={styles.container} vertical={true}>
//         <Text style={styles.welcome}> </Text>
//         {/* <Image
//           style={{width: 128, height: 128}}
//           source={require('./logo.png')}
//         /> */}
//         <Text style={styles.welcome}>SheetJS React Native Demo</Text>
//         <Text style={styles.instructions}>Import Data</Text>
//         <Button
//           onPress={this.importFile}
//           title="Import data from a spreadsheet"
//           color="#841584"
//         />
//         <Text style={styles.instructions}>Export Data</Text>
//         <Button
//           disabled={!this.state.data.length}
//           onPress={this.exportFile}
//           title="Export data to XLSX"
//           color="#841584"
//         />

//         <Text style={styles.instructions}>Current Data</Text>

//         <ScrollView style={styles.table} horizontal={true}>
//           <Table style={styles.table}>
//             <TableWrapper>
//               <Row
//                 data={this.state.cols}
//                 style={styles.thead}
//                 textStyle={styles.text}
//                 widthArr={this.state.widthArr}
//               />
//             </TableWrapper>
//             <TouchableWithoutFeedback>
//               <ScrollView vertical={true}>
//                 <TableWrapper>
//                   <Rows
//                     data={this.state.data}
//                     style={styles.tr}
//                     textStyle={styles.text}
//                     widthArr={this.state.widthArr}
//                   />
//                 </TableWrapper>
//               </ScrollView>
//             </TouchableWithoutFeedback>
//           </Table>
//         </ScrollView>
//       </ScrollView>
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
//   welcome: {fontSize: 20, textAlign: 'center', margin: 10},
//   instructions: {textAlign: 'center', color: '#333333', marginBottom: 5},
//   thead: {height: 40, backgroundColor: '#f1f8ff'},
//   tr: {height: 30},
//   text: {marginLeft: 5},
//   table: {width: '100%'},
// });
