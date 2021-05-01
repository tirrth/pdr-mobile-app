const config = {
  screens: {
    OrderDetails: {
      path: 'order/view/:order_id/:highlighted_order_item_uuid?',
    },
    Orders: {
      path: 'orders/:highlighted_order_no',
    },
  },
};

const linking = {
  prefixes: [
    'https://www.pdrtoolsdirect.com/merchant',
    'pdrtoolsdirect://merchant',
  ],
  config,
};

// parse: {
//   order_id: (order_id) => `${order_id}`,
//   highlighted_order_item_uuid: (highlighted_order_item_uuid) =>
//     `${highlighted_order_item_uuid}`,
// },

export default linking;
