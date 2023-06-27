import { StyleSheet, View, Image, Text, SafeAreaView, Pressable, Share, Alert, Button } from 'react-native';

function HomeScreen({ navigation }) {
    return (
        <SafeAreaView>
            <Text>Home Screen Test</Text>
            <Button
                onPress={() => navigation.navigate('NowPlaying')}
                title="Open Modal"
            />
        </SafeAreaView>
    );
}

export default HomeScreen;