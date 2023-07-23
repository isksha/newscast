import { StyleSheet, View, Image, Text, SafeAreaView, Pressable, Share, Alert, Button } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
// import { generateTranscript } from '../server/api/newscastApi';
// import { getJPEG } from 'server/db/gridfsOperations';
// import { getMP3 } from '../../server/db/gridfsOperations';

// require('dotenv').config();
// import { config } from 'dotenv';
// config({ path: '../../.env' });
// const ip = process.env.IP;


function HomeScreen({ navigation }) {
    
    const [mongoObjs, setMongoObjs] = useState([]);
    // console.log(ip);
    let ip = 'USE YOUR IP ADDRESS HERE or localhost might work if testing on the web';
    useEffect(() => {
        // axios.get('http://localhost:8080/newscasts/iskander/')
        axios.get(`http://${ip}:8080/newscasts/iskander/`)
            .then((response) => {
                // console.log(response);
                setMongoObjs(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    return (
        <SafeAreaView>
            <ScrollView>
            <Text>Home Screen Test</Text>
            {mongoObjs.map((item) => {
                // const fileName = getJPEG(item.imageUrl);
                const date = item.date;
                const filename = item.imageUrl;
                const audioURL = item.mp3Url;
                // console.log(filename);
                console.log(item.mp3Url);
                return (
                    <Pressable
                        onPress={() => {
                            navigation.navigate('NowPlaying', {
                                ip: ip,
                                title: date,
                                imageUrl: filename,
                                audioUrl: audioURL,
                            });
                        }}>
                        <View key={item.id}>
                            <Text>{date + audioURL}</Text>
                            <Image
                                style={{ width: 100, height: 100 }}
                                source={{ uri: `http://${ip}:8080/temp/image/${filename}` }}
                            // source={{uri: `http://${ip}:8080/temp/image/649291a055e953273208425b`}}
                            />

                        </View>
                    </Pressable>
                );
            })}
            <Button
                onPress={() => navigation.navigate('NowPlaying')}
                title="Open Modal"
            />
            </ScrollView>
        </SafeAreaView>
    );
}

export default HomeScreen;