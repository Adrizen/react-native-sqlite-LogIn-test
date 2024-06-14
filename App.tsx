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
} from 'react-native';

import SQLite from 'react-native-sqlite-storage';

// Define the prop interface.
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
    return <Text style={greetingStyle}>You need to LogIn.</Text>;
  }
};

function App(): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const db = SQLite.openDatabase(
    {
      name: 'MainDB',
      location: 'default',
    },
    () => {
      console.log('DB created');
    },
    error => {
      console.log(error);
    },
  );

  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Users (ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Password TEXT);',
      );
    });
  };

  const register = async () => {
    if (username.length > 0 && password.length > 0) {
      await db.transaction(async tx => {
        tx.executeSql('INSERT INTO Users (Name, Password) VALUES (?, ?)', [
          username,
          password,
        ]);
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
      tx.executeSql('DELETE FROM Users');
    });
  };

  const login = async () => {
    await db.transaction(async tx => {
      if (username.length > 0 && password.length > 0) {
        tx.executeSql(
          "SELECT * FROM Users WHERE Name = '" +
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

  useEffect(() => {
    createTable();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../Sqlite/src/assets/img/login.jpg')}
        resizeMode="cover"
        style={styles.image}>
        <Text style={styles.mainText}>Register/LogIn</Text>
        <Greeting
          greetingStyle={styles.greetingMessage}
          loggedIn={loggedIn}
          username={username}
        />
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
              createTable();
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
  },
  buttonContainer: {
    margin: 20,
  },
  inputText: {
    height: 40,
    margin: 20,
    borderBottomWidth: 0.7,
    borderColor: 'white',
    fontSize: 15,
    color: 'white',
  },
  mainText: {
    fontSize: 40,
    fontStyle: 'italic',
    alignSelf: 'center',
    color: 'black',
    fontWeight: '800',
  },
  greetingMessage: {
    fontSize: 40,
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

export default App;
