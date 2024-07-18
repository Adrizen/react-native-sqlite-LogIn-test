import React from 'react';
import {Button, View, ImageBackground, StyleSheet} from 'react-native';

const HomeScreen = ({navigation}: {navigation: any}) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/img/mainscreen.jpg')}
        resizeMode="cover"
        style={styles.image}>
        <View style={styles.buttonContainer}>
          <Button
            title="Launch"
            // onPress={() => navigation.navigate('Login', {name: 'Andy'})}. Example while sending props
            onPress={() => navigation.navigate('LogIn')}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
  },
  buttonContainer: {
    margin: 20,
    gap: 8,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default HomeScreen;
