const cartInitialState = {
  cartTotal: [],

  selectedShippingAddressUUID: '',
  selectedBillingAddressUUID: '',
  is_billing_address_same_as_shipping_address: false,

  total_cart_amount: 0.0,
  total_shipping_charge: 0.0,
  grand_total_amount: 0.0,
  order_total_amount: 0.0,
  promo_code_applied: '',
  promp_code_discount: 0.0,
};

const userAccountInitialState = {
  email: '',
  phone: 0,

  isSocialLogin: false,
  socialLoginProvider: '',
  socialLoginProfileName: '',

  profile_info: {},

  total_notifications_count: 0,
};

const initialState = {
  ...userAccountInitialState,
  ...cartInitialState,
};

const reducer = (state = initialState, action) => {
  if (action.type === 'CHANGE_EMAIL') {
    return {
      ...state,
      email: action.payload,
    };
  }
  if (action.type === 'CHANGE_PHONE') {
    return {
      ...state,
      phone: action.payload,
    };
  }

  if (action.type === 'CHANGE_SOCIAL_LOGIN_PROVIDER') {
    return {
      ...state,
      socialLoginProvider: action.payload,
    };
  }
  if (action.type === 'CHANGE_SOCIAL_LOGIN_TOGGLE') {
    return {
      ...state,
      isSocialLogin: action.payload,
    };
  }
  if (action.type === 'CHANGE_SOCIAL_LOGIN_PROFILE_NAME') {
    return {
      ...state,
      socialLoginProfileName: action.payload,
    };
  }

  if (action.type === 'CHANGE_TOTAL_NOTIFICATIONS_COUNT') {
    return {
      ...state,
      total_notifications_count: action.payload,
    };
  }

  // if(action.type === "CHANGE_USER_TOKEN"){
  //     return {
  //         ...state,
  //         userToken: action.payload
  //     }
  // }

  if (action.type === 'CHANGE_CART_TOTAL') {
    return {
      ...state,
      cartTotal: action.payload,
    };
  }

  if (action.type === 'CHANGE_PROFILE_INFO') {
    return {
      ...state,
      profile_info: action.payload,
    };
  }

  if (action.type === 'CHANGE_TOTAL_CART_AMOUNT') {
    return {
      ...state,
      total_cart_amount: action.payload,
    };
  }
  if (action.type === 'CHANGE_SELECTED_SHIPPING_ADDRESS_UUID') {
    return {
      ...state,
      selectedShippingAddressUUID: action.payload,
    };
  }
  if (action.type === 'CHANGE_SELECTED_BILLING_ADDRESS_UUID') {
    return {
      ...state,
      selectedBillingAddressUUID: action.payload,
    };
  }
  if (action.type === 'CHANGE_IS_BILLING_ADDRESS_AS_SHIPPING_ADDRESS') {
    return {
      ...state,
      is_billing_address_same_as_shipping_address: action.payload,
    };
  }
  if (action.type === 'CHANGE_TOTAL_SHIPPING_CHARGE') {
    return {
      ...state,
      total_shipping_charge: action.payload,
    };
  }
  if (action.type === 'CHANGE_GRAND_TOTAL_AMOUNT') {
    return {
      ...state,
      grand_total_amount: action.payload,
    };
  }
  if (action.type === 'CHANGE_ORDER_TOTAL_AMOUNT') {
    return {
      ...state,
      order_total_amount: action.payload,
    };
  }
  if (action.type === 'CHANGE_PROMO_CODE_APPLIED') {
    return {
      ...state,
      promo_code_applied: action.payload,
    };
  }
  if (action.type === 'CHANGE_PROMO_CODE_DISCOUNT') {
    return {
      ...state,
      promo_code_discount: action.payload,
    };
  }

  if (action.type === 'RESET_ALL_REDUX_VARIABLES') {
    return initialState;
  }
  if (action.type === 'RESET_CART_REDUX_VARIABLES') {
    const intialCartState = {...cartInitialState};
    if (
      Array.isArray(action.payload?.except) &&
      action.payload?.except?.length
    ) {
      const exceptVariables = action.payload.except;
      exceptVariables.map((key_name) => {
        delete intialCartState[key_name];
      });
    }
    return {
      ...state,
      ...intialCartState,
    };
  }
  return state;
};

export default reducer;
