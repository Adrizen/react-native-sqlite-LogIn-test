import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
  TextInput,
  Alert,
  TextStyle,
  ViewStyle,
  ImageBackground,
  FlatList,
  BackHandler,
  Pressable,
} from 'react-native';

// 3rd party libraries.
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import Sound from 'react-native-sound';

const Stack = createNativeStackNavigator();

import SQLite from 'react-native-sqlite-storage';
import {SafeAreaView} from 'react-native-safe-area-context';

// Define the prop interface.
//TODO: Normalice uppercases in Username/username.
interface GreetingProps {
  username: string;
  loggedIn: boolean;
  greetingStyle?: TextStyle | ViewStyle;
}

interface Score {
  Username: string;
  Score: number;
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

function App(): React.JSX.Element {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const playBackgroundMusic = () => {
    Sound.setCategory('Ambient');

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

  // eslint-disable-next-line react/no-unstable-nested-components
  const HomeScreen = ({navigation}: {navigation: any}) => {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require('../Sqlite/src/assets/img/mainscreen.jpg')}
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

function RankingScoreScreen() {
  const [scores, setScores] = useState<Score[]>([]);
  const db = SQLite.openDatabase(
    {
      name: 'MainDB',
      location: 'default',
    },
    () => {
      console.log('DB opened - SCORES');
    },
    error => {
      console.log('Error opening Database: ' + error);
    },
  );

  useEffect(() => {
    createMockValues();
    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createMockValues = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Scores',
        [],
        (_tx, results) => {
          if (results.rows.length <= 0) {
            tx.executeSql(
              'INSERT INTO Scores (Username, Score) VALUES ("Andy", 10)',
            );
            tx.executeSql(
              'INSERT INTO Scores (Username, Score) VALUES ("Tuki", 5)',
            );
            tx.executeSql(
              'INSERT INTO Scores (Username, Score) VALUES ("Taka", 20)',
            );
          }
        },
        (_, error) => {
          console.error('Error aasdasfasgasdas:', error);
          return false;
        },
      );
    });
  };

  const fetchScores = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Scores ORDER BY Score DESC',
        [],
        (_tx, results) => {
          let temp: Score[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i) as Score);
          }
          setScores(temp);
        },
      );
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../Sqlite/src/assets/img/ranking.jpg')}
        resizeMode="cover"
        style={styles.image}>
        <Text style={styles.greenText}>Ranking Scores</Text>
        <SafeAreaView>
          <FlatList
            data={scores}
            renderItem={({item}) => (
              <Text style={styles.mainText}>
                {item.Username}: {item.Score}
              </Text>
            )}
          />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

// Screen that contains all the login, register, enter ranking and delete database logic.
const LogInScreen = ({navigation}: {navigation: any}) => {
  // FIXME: 1° User logs in successfully. 2° Writes another username in the input. 3° The "Logged In as: [name]" changes in real time.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDefaultLanguage, setIsDefaultLanguage] = useState(true);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const db = SQLite.openDatabase(
    {
      name: 'MainDB',
      location: 'default',
    },
    () => {
      console.log('DB opened - LogIn');
    },
    error => {
      console.log(error);
    },
  );

  const createTables = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Users (ID INTEGER PRIMARY KEY AUTOINCREMENT, Username TEXT, Password TEXT);',
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Scores (ID INTEGER PRIMARY KEY AUTOINCREMENT, Username TEXT, Score INTEGER);',
      );
    });
  };

  useEffect(() => {
    createTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = async () => {
    if (username.length > 0 && password.length > 0) {
      await db.transaction(async tx => {
        // Check if the user already exist.
        tx.executeSql(
          "SELECT * FROM Users WHERE Username = '" + username + "'",
          [],
          (_tx, results) => {
            const len = results.rows.length;
            if (len > 0) {
              Alert.alert('Error', 'That username already exists', [
                {text: 'OK'},
              ]);
            } else {
              tx.executeSql(
                'INSERT INTO Users (Username, Password) VALUES (?, ?)',
                [username, password], //TODO: Usar esto en el select de arriba para "safely insert into your SQL query" and prevent sql injection
              );
            }
          },
        );
      });
      // Reset both.
      setUsername('');
      setPassword('');
    } else {
      Alert.alert(
        'Data missing',
        'You need to complete username and password',
        [
          {
            text: 'OK',
            //onPress: () => console.log('OK pressed'),
          },
        ],
      );
    }
  };

  const deleteUsers = () => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM Scores');
      tx.executeSql('DELETE FROM Users');
    });
  };

  const login = async () => {
    await db.transaction(async tx => {
      if (username.length > 0 && password.length > 0) {
        tx.executeSql(
          "SELECT * FROM Users WHERE Username = '" +
            username +
            "' AND Password = '" +
            password +
            "'",
          [],
          (_tx, results) => {
            const len = results.rows.length;
            console.log('longitud: ' + len);
            if (len > 0) {
              setLoggedIn(true);
            } else {
              Alert.alert('Wrong data', 'Username or password is not valid', [
                {text: 'OK'},
              ]);
            }
          },
        );
        // Reset password.
        setPassword('');
      } else {
        Alert.alert(
          'Data missing',
          'You need to complete username and password',
          [
            {
              text: 'OK',
              //onPress: () => console.log('OK pressed'),
            },
          ],
        );
      }
    });
  };

  const clearTextInput = () => {
    if (usernameRef.current) {
      usernameRef.current.clear();
    }
    if (passwordRef.current) {
      passwordRef.current.clear();
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../Sqlite/src/assets/img/login.jpg')}
        resizeMode="cover"
        style={styles.image}>
        <Pressable
          style={styles.containerTopRight}
          onPress={() => {
            setIsMuted(!isMuted);
          }}>
          {isMuted && <Icon name={'volume-off'} color={'white'} size={50} />}
          {!isMuted && <Icon name={'volume-up'} color={'white'} size={50} />}
        </Pressable>
        <Pressable
          style={styles.containerTopLeft}
          onPress={() => {
            console.log('change language xdd');
            setIsDefaultLanguage(!isDefaultLanguage);
          }}>
          <Icon name={'language'} color={'white'} size={50} />
        </Pressable>
        <Greeting
          greetingStyle={styles.greenText}
          loggedIn={loggedIn}
          username={username}
        />
        {!loggedIn && (
          <View>
            <TextInput
              ref={usernameRef}
              onChangeText={newText => setUsername(newText)}
              style={styles.inputText}
              placeholder="Username"
              placeholderTextColor={'white'}
            />
            <TextInput
              ref={passwordRef}
              onChangeText={newText => setPassword(newText)}
              secureTextEntry={true}
              style={styles.inputText}
              placeholder="Password"
              placeholderTextColor={'white'}
            />
            <View style={styles.buttonContainer}>
              <Button
                onPress={() => {
                  createTables();
                  register();
                  clearTextInput();
                }}
                title="Register"
              />
              <Button
                onPress={() => {
                  login();
                  clearTextInput();
                }}
                title="Login"
              />
            </View>
          </View>
        )}
        {loggedIn && (
          <View style={styles.buttonContainer}>
            <Button title="Start game" color={'green'} />
            <Button
              title="Exit app"
              onPress={() => BackHandler.exitApp()}
              color={'red'}
            />
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => navigation.navigate('RankingScore')}
            title="See ranking"
          />
          {/* TODO: For DEBUG only: comment the button below in production xd. */}
          <Button
            onPress={() => {
              deleteUsers();
              setLoggedIn(false);
            }}
            color={'red'}
            title="Delete all data in Users"
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
  containerTopRight: {
    position: 'absolute',
    alignSelf: 'center',
    width: 50,
    top: 60,
    right: 10,
  },
  containerTopLeft: {
    position: 'absolute',
    alignSelf: 'center',
    width: 50,
    top: 60,
    left: 10,
  },
  icon: {
    color: 'white',
  },
  muteText: {
    color: 'white',
    fontSize: 20,
  },
  buttonContainer: {
    margin: 20,
    gap: 8,
  },
  inputText: {
    height: 40,
    margin: 20,
    fontWeight: '600',
    borderBottomWidth: 0.7,
    borderColor: 'white',
    fontSize: 17,
    color: 'white',
  },
  mainText: {
    fontFamily: 'Press Start 2P',
    fontSize: 30,
    alignSelf: 'center',
    fontWeight: '400',
    color: 'black',
  },
  greenText: {
    fontFamily: 'Press Start 2P',
    fontSize: 22,
    alignSelf: 'center',
    color: 'rgba(0, 246, 53, 0.9)',
    fontWeight: '600',
    textShadowColor: 'black',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 10,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  customText: {
    fontFamily: 'Press Start 2P',
    fontSize: 40,
    color: 'white',
  },
});

export default App;
