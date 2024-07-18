import React from 'react';
import {Text, View, TextStyle, ViewStyle} from 'react-native';

interface GreetingProps {
  username: string;
  loggedIn: boolean;
  greetingStyle?: TextStyle | ViewStyle;
}

// Changes depending if the user is logged.
const Greeting: React.FC<GreetingProps> = ({
  loggedIn,
  username,
  greetingStyle,
}) => {
  if (loggedIn) {
    return (
      <View>
        <Text style={greetingStyle}>Logged In as: {username}</Text>
      </View>
    );
  } else {
    return (
      <View>
        <Text style={greetingStyle}>You need to LogIn.</Text>
      </View>
    );
  }
};

export default Greeting;
