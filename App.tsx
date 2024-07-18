import React, {useEffect, useState} from 'react';
// import {StyleSheet} from 'react-native';

// My screens
import HomeScreen from './src/components/screens/Home';
import RankingScoreScreen from './src/components/screens/RankingScore';
import LogInScreen from './src/components/screens/LogIn';

// 3rd party libraries.
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Sound from 'react-native-sound';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const playBackgroundMusic = () => {
    Sound.setCategory('Ambient');
    console.log('Hola que tal');
    const backgroundMusic = new Sound(
      require('./src/assets/sounds/Alien.mp3'),
      error => {
        if (error) {
          console.log('Failed to load the sound', error);
          return;
        }

        backgroundMusic.setNumberOfLoops(-1);
        backgroundMusic.play(success => {
          if (success) {
            setIsMusicPlaying(true);
            console.log('Music is playing.');
          } else {
            console.log('Playback failed due to audio decoding errors');
          }
        });
        backgroundMusic.release();
      },
    );
  };

  useEffect(() => {
    if (!isMusicPlaying) {
      playBackgroundMusic();
    }
  }, [isMusicPlaying]); //FIXME: Not sure if this here is okay.

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Galaxy Warriors',
            headerTransparent: true,
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Press Start 2P',
              fontSize: 23,
            },
          }}
        />
        <Stack.Screen
          name="LogIn"
          component={LogInScreen}
          options={{
            title: 'Register/Login',
            headerTransparent: true,
            headerTintColor: 'white',
            headerBackVisible: false,
            headerTitleStyle: {
              fontFamily: 'Press Start 2P',
            },
          }}
        />
        <Stack.Screen
          name="RankingScore"
          component={RankingScoreScreen}
          options={{
            title: 'RankingScore',
            headerTransparent: true,
            headerTintColor: 'white',
            headerTitleStyle: {
              fontFamily: 'Press Start 2P',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-around',
//   },
//   containerTopRight: {
//     position: 'absolute',
//     alignSelf: 'center',
//     width: 50,
//     top: 60,
//     right: 10,
//   },
//   containerTopLeft: {
//     position: 'absolute',
//     alignSelf: 'center',
//     width: 50,
//     top: 60,
//     left: 10,
//   },
//   icon: {
//     color: 'white',
//   },
//   muteText: {
//     color: 'white',
//     fontSize: 20,
//   },
//   buttonContainer: {
//     margin: 20,
//     gap: 8,
//   },
//   inputText: {
//     height: 40,
//     margin: 20,
//     fontWeight: '600',
//     borderBottomWidth: 0.7,
//     borderColor: 'white',
//     fontSize: 17,
//     color: 'white',
//   },
//   mainText: {
//     fontFamily: 'Press Start 2P',
//     fontSize: 30,
//     alignSelf: 'center',
//     fontWeight: '400',
//     color: 'black',
//   },
//   greenText: {
//     fontFamily: 'Press Start 2P',
//     fontSize: 22,
//     alignSelf: 'center',
//     color: 'rgba(0, 246, 53, 0.9)',
//     fontWeight: '600',
//     textShadowColor: 'black',
//     textShadowOffset: {width: 2, height: 2},
//     textShadowRadius: 10,
//   },
//   image: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   customText: {
//     fontFamily: 'Press Start 2P',
//     fontSize: 40,
//     color: 'white',
//   },
// });

export default App;
