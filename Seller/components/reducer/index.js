const initialState = {
  email: '',
  phone: '',

  isSocialLogin: false,
  socialLoginProvider: '',
  socialLoginProfileName: '',

  account_type: 1,
  userToken: '',

  profile_info: {},

  total_notifications_count: 0,
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
  if (action.type === 'CHANGE_ACCOUNT_TYPE') {
    return {
      ...state,
      account_type: action.payload,
    };
  }
  if (action.type === 'CHANGE_USER_TOKEN') {
    return {
      ...state,
      userToken: action.payload,
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

  if (action.type === 'CHANGE_PROFILE_INFO') {
    return {
      ...state,
      profile_info: action.payload,
    };
  }

  if (action.type === 'CHANGE_TOTAL_NOTIFICATIONS_COUNT') {
    return {
      ...state,
      total_notifications_count: action.payload,
    };
  }
  return state;
};

export default reducer;
