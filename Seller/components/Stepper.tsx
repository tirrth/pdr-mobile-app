import React, {FC, useState, ReactElement} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ScrollView,
} from 'react-native';

export interface StepperProps {
  active: number;
  content: ReactElement[];
  onNext: Function;
  onBack: Function;
  onFinish: Function;
  wrapperStyle?: ViewStyle;
  stepStyle?: ViewStyle;
  stepTextStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  showButton?: boolean;
}

const search = (keyName: number, myArray: number[]): boolean => {
  let value = false;
  myArray.map((val) => {
    if (val === keyName) {
      value = true;
    }
  });
  return value;
};

const Stepper: FC<StepperProps> = (props) => {
  const {
    active,
    content,
    onBack,
    onNext,
    onFinish,
    wrapperStyle,
    stepStyle,
    stepTextStyle,
    buttonStyle,
    buttonTextStyle,
    showButton = true,
  } = props;
  const [step, setStep] = useState<number[]>([0]);
  const pushData = (val: number) => {
    setStep((prev) => [...prev, val]);
  };

  const removeData = () => {
    setStep((prev) => {
      prev.pop();
      return prev;
    });
  };
  return (
    <View style={wrapperStyle}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {content.map((_, i) => {
            return (
              <React.Fragment key={i}>
                <View style={{flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                  <View style={{backgroundColor:'transparent', flexDirection:'row', alignItems:'center'}}>
                    <View
                      style={{
                      height: active >= i ? 2 : 1,
                      width:26,
                      backgroundColor: i ? (active >= i ? '#1976d2' : '#8d8d8d') : 'transparent',
                      opacity: 1,
                      }}
                    />
                    <View
                      style={[
                        {
                          backgroundColor: '#1976d2',
                          width: 30,
                          height: 30,
                          borderRadius: 30,
                          justifyContent: 'center',
                          alignItems: 'center',
                          opacity: active >= i ? 1 : 0.3,
                        },
                        stepStyle,
                      ]}>
                      {active > i ? (
                        <Text
                          style={[
                            {
                              color: 'white',
                            },
                            stepTextStyle,
                          ]}>
                          &#10003;
                        </Text>
                      ) : (
                        <Text
                          style={[
                            {
                              color: 'white',
                            },
                            stepTextStyle,
                          ]}>
                          {i + 1}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                      height: active > i ? 2 : 1,
                      width:26,
                      backgroundColor: i !== content.length - 1 ? (active > i ? '#1976d2' : '#8d8d8d') : 'transparent',
                      opacity: 1,
                      }}
                    />
                  </View>
                  <Text style={{marginTop:8, color:active === i ? '#000' : '#8d8d8d'}}>{content[i].props.title}</Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false}>
        {content[active]}
      </ScrollView>
      {showButton && (
        <View
          style={{
            flexDirection: 'row',
          }}>
          {active !== 0 && (
            <TouchableOpacity
              style={[
                {
                  padding: 10,
                  borderRadius: 4,
                  alignSelf: 'flex-start',
                  marginRight: 10,
                },
                buttonStyle,
                {
                  backgroundColor: '#a1a1a1',
                },
              ]}
              onPress={() => {
                removeData();
                onBack();
              }}>
              <Text style={[{color: 'white'}, buttonTextStyle]}>Back</Text>
            </TouchableOpacity>
          )}
          {content.length - 1 !== active && (
            <TouchableOpacity
              style={[
                {
                  padding: 10,
                  borderRadius: 4,
                  backgroundColor: '#1976d2',
                  alignSelf: 'flex-start',
                  marginRight: 10,
                },
                buttonStyle,
              ]}
              onPress={() => {
                pushData(active + 1);
                onNext();
              }}>
              <Text style={[{color: 'white'}, buttonTextStyle]}>Next</Text>
            </TouchableOpacity>
          )}
          {content.length - 1 === active && (
            <TouchableOpacity
              style={[
                {
                  padding: 10,
                  borderRadius: 4,
                  backgroundColor: '#1976d2',
                  alignSelf: 'flex-start',
                },
                buttonStyle,
              ]}
              onPress={() => onFinish()}>
              <Text style={[{color: 'white'}, buttonTextStyle]}>Finish</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default Stepper;
