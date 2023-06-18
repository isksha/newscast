import React, { useState } from 'react';
import { StyleSheet, View, Image, Text, SafeAreaView, Pressable, Share, Alert } from 'react-native';

function NowPlayingScreen(props) {
    const [currNewsletter, setCurrNewsletter] = useState('Wed, May 31');

    const backFn = async () => {
        Alert.alert('back button pressed');
    }

    const shareFn = async () => {
        try {
            const result = await Share.share({
                message: `Sharing ${currNewsletter}`,
            });
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    return (
        <SafeAreaView style = {styles.container}>
            <View style = {styles.topbar}>
                <Pressable onPress={backFn}>
                    <Image source={require('../assets/arrow-left.png')} />
                    {/* <Text>&#5176;</Text> */}
                </Pressable>
                <Text style={styles.topbarText}>Now playing</Text>
                <Pressable onPress={shareFn}>
                    <Image source={require('../assets/Share.png')}/>
                </Pressable>
            </View>
            <View style = {styles.thumbnail}>
                <Image source={require('../assets/placeholder.png')}/>
            </View>
            <View style = {styles.player}>
                <Text style = {styles.playerText}>{currNewsletter}</Text>
            </View>
        </SafeAreaView>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // justifyContent: 'flex-start',
    },
    topbar: {
        // flex: 1,
        height: '5%',
        
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 30,
        paddingRight: 30,
    },
    topbarText: {
        // fontFamily: 'Times New Roman',
        // fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: 16,
    },
    thumbnail: {
        // flex: 1,
        // height: '40%',
        padding: 30,
        alignItems: 'center',
    },
    player: {
        flex: 1,
        padding: 30,
        alignItems: 'left',
    },
    playerText: {
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: 24,
    }
});

export default NowPlayingScreen;