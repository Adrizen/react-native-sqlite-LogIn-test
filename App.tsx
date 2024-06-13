import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, Button, View, TextInput} from 'react-native';

import SQLite from 'react-native-sqlite-storage';

// Define the prop interface.
interface GreetingProps {
  username: string;
  style?: React.CSSProperties;
}

// Changes depending if the user is logged.
const Greeting: React.FC<GreetingProps> = ({username}) => {
  if (username.length > 0) {
    return (
      <View>
        <Text>Logged In as: {username}</Text>
      </View>
    );
  } else {
    return <Text>You need to LogIn.</Text>;
  }
};

function App(): React.JSX.Element {
  const [username, setUsername] = useState('');
  //const [password, setPassword] = useState('');
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

  const register = async (name: String, password: String) => {
    await db.transaction(async tx => {
      tx.executeSql('INSERT INTO Users (Name, Password) VALUES (?, ?)', [
        name,
        password,
      ]);
    });
  };

  const deleteUsers = () => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM Users');
    });
  };

  const login = async (name: String, password: String) => {
    await db.transaction(async tx => {
      tx.executeSql(
        "SELECT * FROM Users WHERE Name = '" +
          name +
          "' AND Password = '" +
          password +
          "'",
        [],
        (_tx, results) => {
          const len = results.rows.length;
          console.log('longitud: ' + len);
          if (len > 0) {
            setUsername(results.rows.item(0).Name);
          } else {
            setUsername('');
          }
        },
      );
    });
  };

  useEffect(() => {
    createTable();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.centeredText}>Register</Text>
      <TextInput
        onChangeText={newText => setUsername(newText)}
        style={styles.inputText}
        placeholder="Username"
      />
      <TextInput
        //onChangeText={newText => setPassword(newText)}
        secureTextEntry={true}
        style={styles.inputText}
        placeholder="Password"
      />
      <Button
        onPress={() => {
          createTable();
          register('Andy', '1234');
        }}
        title="Register"
      />
      <Button
        onPress={() => {
          login('Andy', '1234');
        }}
        title="Login"
      />
      <Greeting style={{fontSize: 30}} username={username} />
      <Button
        onPress={() => {
          deleteUsers();
        }}
        color={'red'}
        title="Delete all data in Users"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
  },
  inputText: {
    height: 40,
    paddingLeft: 30,
    fontSize: 15,
  },
  centeredText: {
    fontSize: 40,
    alignSelf: 'center',
  },
});

export default App;
