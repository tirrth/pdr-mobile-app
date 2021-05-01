import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {AuthContext} from '../../App/context';

const HooksForClassComp = () => {
  const {authUser} = React.useContext(AuthContext);

  React.useEffect(() => {
    authUser();
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size={25} color="purple" />
    </View>
  );
};

export default HooksForClassComp;
