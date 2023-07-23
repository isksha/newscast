import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NowPlayingScreen from './components/NowPlayingScreen';
import HomeScreen from './components/HomeScreenPlaceholder';

// const Stack = createNativeStackNavigator();
const Stack = createStackNavigator();

export default function App() {
  return (
    // <View style={styles.container}>
    //   <Text>Open up App.js to start working on your app!</Text>
    //   <StatusBar style="auto" />
    // </View>
    // <NowPlayingScreen />
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="NowPlaying"
          component={NowPlayingScreen}
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            // fullScreenGestureEnabled: true,
            // fullScreenSwipeEnabled: true,
            // swipeDirection: 'vertical',
            gestureDirection: 'vertical',
            // customAnimationOnSwipe: true,
            // stackAnimation: 'slide_from_bottom',
            ...TransitionPresets.ModalSlideFromBottomIOS,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
