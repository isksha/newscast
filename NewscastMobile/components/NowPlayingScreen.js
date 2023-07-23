import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Text, SafeAreaView, Pressable, Share, Alert, Button } from 'react-native';
import { Audio } from 'expo-av'
import Slider from '@react-native-community/slider'
// import { useFonts } from 'expo-font';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import Ionicons from '@expo/vector-icons/Ionicons';

function NowPlayingScreen({ navigation, route }) {
    const { ip, title, imageUrl, audioUrl } = route.params;
    const [currNewsletter, setCurrNewsletter] = useState('Wed, May 31');

    const currTranscript = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const currAudioInfo = useRef(null);
    const [currPos, setCurrPos] = useState(0);
    const [currDuration, setCurrDuration] = useState(60000);
    // const [isSeeking, setIsSeeking] = useState(false);
    const isSeeking = useRef(false);
    const [favorite, setFavorite] = useState(false);

    const backFn = async () => {
        // Alert.alert('back button pressed');
        navigation.goBack();
    }

    const toggleFavorite = async () => {
        setFavorite(!favorite);
    }

    const playPause = async () => {
        if (currTranscript.current) {
            if (isPlaying) {
                await currTranscript.current.pauseAsync();
            } else {
                await currTranscript.current.playAsync();
            }
            setIsPlaying(!isPlaying);
        } else {
            console.log('No audio');
        }
    };

    const skip15 = async () => {
        if (currTranscript.current) {
            // const currTime = await currTranscript.current.getStatusAsync();
            // const newTime = currTime.positionMillis + 15000;
            const newTime = currPos + 15000;
            await currTranscript.current.setPositionAsync(newTime);
        }
    };

    const back15 = async () => {
        if (currTranscript.current) {
            // const currTime = await currTranscript.current.getStatusAsync();
            // const newTime = currTime.positionMillis - 15000;
            const newTime = currPos - 15000;
            // console.log(newTime);
            await currTranscript.current.setPositionAsync(newTime);
        }
    };

    const setPositionMillis = status => {
        // if (currTranscript.current) {
        if (!isSeeking.current) {
            setCurrPos(status.positionMillis || 0);
            console.log(`${isSeeking.current}` + status.positionMillis);
            setCurrDuration(status.durationMillis);
            console.log('duration' + status.durationMillis);
        } else {
            console.log('playback update sees isSeeking true?');
        }
    };

    // const valueChange = value => {
    //     if (!isSeeking) {
    //         setCurrPos(value);
    //     }
    // }

    const loadTranscript = async () => {
        try {
            if (!currTranscript.current) {
                await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
                const { sound, status } = await Audio.Sound.createAsync(
                    // require('../assets/placeholder3.mp3'),
                    { uri: `http://${ip}:8080/temp/audio/${audioUrl}` },
                    {},
                    setPositionMillis
                );
                // console.log('initial sound ' + sound);
                // console.log('inital pos sound ' + sound.positionMillis);
                // console.log('initial pos status ' + status.positionMillis);
                // currAudioInfo.current = status;
                // await sound.playAsync();
                currTranscript.current = sound;
                // console.log(status);
                setCurrDuration(status.durationMillis);
            }
        } catch (error) {
            console.error('Failed to load audio', error);
        }
    };

    // const getPositionMillis = async () => {
    //     if (currTranscript.current) {
    //         const status = await currTranscript.current.getStatusAsync();
    //         const positionMillis = status.positionMillis || 0;
    //         setCurrPos(positionMillis);
    //         return positionMillis;
    //     }
    //     return 0;
    // };
    const seekingStart = () => {
        // setIsSeeking(true);
        isSeeking.current = true;
    }

    const seekingComplete = async (value) => {
        if (currTranscript.current) {

            console.log(isSeeking.current);
            isSeeking.current = true;
            await currTranscript.current.setPositionAsync(value);
            setCurrPos(value);
            console.log('time start');
            isSeeking.current = false;
            // setTimeout(() => {
            //     console.log("time out?");
            //     // isSeeking.current = false;
            //     console.log(isSeeking.current);
            //     // setIsSeeking(false);
            // }, 10);
        }
    };

    const toDisplayTime = (ms) => {
        const totalSeconds = ms / 1000;
        let min = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        return min + ':' + seconds;
    };

    const shareFn = async () => {
        try {
            const result = await Share.share({
                // message: `Sharing ${currNewsletter}`,
                message: `Sharing ${title}`,
            });
        } catch (error) {
            Alert.alert(error.message);
        }
    };
    // loadTranscript();
    useEffect(() => {
        loadTranscript();
    }, []);
    // useEffect(() => {
    //     getPositionMillis();
    // }, [currTranscript.current.getStatusAsync()])
    // getPositionMillis();
    // if (currTranscript.current) {
    //     console.log('curr status astync' + currTranscript.current.getStatusAsync().positionMillis);
    //     // console.log('pos' + currAudioInfo.positionMillis);
    //     // getPositionMillis()
    //     console.log(currPos);
    // }
    // if (isPlaying) {
    //     console.log('isplaying posmil' + currTranscript.current.getStatusAsync().positionMillis);
    // }

    // const [fontsLoaded] = useFonts({
    //     'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
    // });

    // const [fontsLoaded] = useFonts(Ionicons.font);
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
        'ionicons': Ionicons.font['ionicons'],
    });

    if (!fontsLoaded) {
        return null;
    }

    // const { ip, title, imageUrl, audioUrl } = route.params;
    console.log(ip);
    console.log(title);
    console.log(imageUrl);
    console.log(audioUrl);
    // const img = `http://${ip}:8080/temp/image/${JSON.stringify(imageUrl)}`;
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topbar}>
                <Ionicons.Button
                    paddingVertical={0}
                    paddingHorizontal={0}
                    name="ios-chevron-back"
                    color="black"
                    size={30}
                    iconStyle={{ marginRight: 0 }}
                    backgroundColor="white"
                    // borderRadius={20}
                    onPress={backFn}
                    activeOpacity={1}
                />
                {/* <Pressable onPress={backFn}> */}
                {/* <Image source={require('../assets/arrow-left.png')} /> */}
                {/* <Text>&#5176;</Text> */}
                {/* </Pressable> */}
                <Text style={styles.topbarText}>Now playing</Text>
                {/* <Pressable onPress={shareFn}>
                    <Image source={require('../assets/Share.png')} />
                </Pressable> */}
                <Ionicons.Button
                    paddingVertical={0}
                    // paddingHorizontal={0}
                    name="ios-share-social"
                    color='black'
                    size={24}
                    iconStyle={{ marginRight: 0 }}
                    backgroundColor="white"
                    onPress={shareFn}
                    activeOpacity={1}
                />
            </View>
            <View style={styles.thumbnail}>
                {/* <Image source={require('../assets/placeholder.png')} /> */}
                <Image
                    style={{ width: 334, height: 330, borderRadius: 16 }}
                    source={{ uri: `http://${ip}:8080/temp/image/${imageUrl}` }} 
                />
            </View>
            <View style={styles.player}>
                <View style={styles.playerHeader}>
                    {/* <Text style={styles.playerText}>{currNewsletter}</Text> */}
                    <Text style={styles.playerText}>{title}</Text>
                    {/* <Text>&#9825;</Text> */}
                    {/* <Text>&#9829;</Text> */}
                    <Ionicons.Button
                        paddingHorizontal={0}
                        paddingVertical={0}
                        name={favorite ? "ios-heart" : 'ios-heart-outline'}
                        color={favorite ? '#FF6D45' : 'black'}
                        size={30}
                        iconStyle={{ marginRight: 0 }}
                        backgroundColor="white"
                        // borderRadius={20}
                        onPress={toggleFavorite}
                        activeOpacity={1}
                    />
                </View>
                <Slider
                    style={{ width: '101.5%', height: '100', padding: 0, margin: 0 }}
                    thumbImage={require('../assets/thumb.png')}
                    minimumValue={0}
                    maximumValue={currDuration}
                    minimumTrackTintColor="#000000"
                    maximumTrackTintColor="#AAAAAA"
                    value={currPos}
                    onValueChange={setCurrPos}
                    // onValueChange={valueChange}
                    // onSlidingStart={setIsSeeking(true)}
                    onSlidingStart={seekingStart}
                    onSlidingComplete={seekingComplete}
                />
                <View style={styles.playerTime}>
                    <Text style={styles.playerTimeText}>{toDisplayTime(currPos)}</Text>
                    <Text style={[styles.playerTimeText, styles.playerTimeDuration]}>{toDisplayTime(currDuration)}</Text>
                </View>
                <View style={styles.playerButtons}>
                    <Pressable onPress={back15}>
                        <Image source={require('../assets/backward-15.png')} />
                    </Pressable>
                    {/* <Pressable onPress={playPause}> */}
                    {/* <Text>{isPlaying ? '&#9654;' : '&#9208;'}</Text> */}
                    {/* <Text style={styles.playerPlayButton}>{isPlaying ? String.fromCharCode(8214) : String.fromCharCode(9654)}</Text> */}
                    {/* </Pressable> */}
                    <Ionicons.Button
                        name={isPlaying ? "ios-pause" : "ios-play"}
                        color='black'
                        size={60}
                        iconStyle={{ marginRight: 0 }}
                        backgroundColor="white"
                        borderRadius={100}
                        onPress={playPause}
                    />
                    <Pressable onPress={skip15}>
                        <Image source={require('../assets/forward-15.png')} />
                    </Pressable>
                    {/* <Button title={isPlaying ? 'Pause' : 'Play'} onPress={playPause} /> */}
                    {/* <Button title="Seek Forward" onPress={skip15} /> */}
                    {/* <Button title="Seek Backward" onPress={back15} /> */}
                </View>
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
        // paddingLeft: 30,
        // paddingRight: 30,
        paddingHorizontal: 30,
    },
    topbarText: {
        // fontFamily: 'Times New Roman',
        // fontFamily: 'Inter',
        fontFamily: 'Inter_600SemiBold',
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
        // flex: 1,
        padding: 30,
        // alignItems: 'left',
        // alignContent: 'center',
        alignItems: 'center',
        // flexDirection: 'row',
        // flexWrap: 'wrap',
        // justifyContent: 'center'
    },
    playerHeader: {
        // flex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 25,
    },
    playerText: {
        fontFamily: 'Inter_600SemiBold',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: 24,
    },
    playerTime: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        // paddingHorizontal: 5,
        marginTop: -10,
        // paddingTop: -20,
        // paddingBottom: 40,
        paddingBottom: 30,
    },
    playerTimeText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        width: 26,
        height: 16,
        fontWeight: 400,
    },
    playerTimeDuration: {
        opacity: 0.3,
    },
    playerButtons: {
        width: '70%',
        // flex: 1,
        flexDirection: 'row',
        // justifyContent: 'center',
        justifyContent: 'space-between',
        alignItems: 'center',
        // margin: 50,
    },
    playerPlayButton: {
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: 24,
        margin: 50,
        height: 45,
        width: 45,
        justifyContent: 'center',
    }
});

export default NowPlayingScreen;