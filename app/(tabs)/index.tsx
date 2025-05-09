import { StyleSheet } from 'react-native';

import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.titleContainer}>Welcome to React Native!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginTop: 46,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
