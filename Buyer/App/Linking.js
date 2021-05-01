const config = {
  screens: {
    OrdersRoot: {
      screens: {
        Orders: 'orders/:highlighted_order_no?',
        OrderProducts: {
          path: 'order/view/:order_id/:highlighted_order_item_uuid?',
        },
      },
    },
  },
};

const linking = {
  prefixes: [
    'https://www.pdrtoolsdirect.com/consumer',
    'pdrtoolsdirect://consumer',
  ],
  config,
};

export default linking;
