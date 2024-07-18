import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  Button,
  View,
  TextInput,
  Alert,
  ImageBackground,
  BackHandler,
  Pressable,
} from 'react-native';

// My components.
import GreetingMessage from '../common/GreetingMessage';

// 3rd party libraries.
import Icon from 'react-native-vector-icons/FontAwesome';

import SQLite from 'react-native-sqlite-storage';

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
        source={require('../../assets/img/login.jpg')}
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
        <GreetingMessage
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
});

export default LogInScreen;
