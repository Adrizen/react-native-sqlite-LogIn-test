import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  ImageBackground,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import SQLite from 'react-native-sqlite-storage';

// Define the score interface.
interface Score {
  Username: string;
  Score: number;
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
          console.error('Error inserting ' + error);
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
        source={require('../../assets/img/ranking.jpg')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
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
});

export default RankingScoreScreen;
