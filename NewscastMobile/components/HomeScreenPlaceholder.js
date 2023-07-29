import { StyleSheet, View, Image, Text, SafeAreaView, Pressable, Share, Alert, Button } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Asset } from 'expo-asset';
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
    // let ip = 'USE YOUR IP ADDRESS HERE or localhost might work if testing on the web';
    useEffect(() => {
        // axios.get('http://localhost:8080/newscasts/iskander/')
        axios.get(`http://${ip}:8080/newscasts/iskander/`)
            .then(async (response) => {
                // console.log(response);
                // console.log(response.data);
                let mongoData = response.data;
                const updatedObjs = await Promise.all(mongoData.map(async (item) => {
                    const imageUrl = item.imageUrl;
                    // return `http://${ip}:8080/temp/image/${imageUrl}`;
                    const [{ localUri: localImageUri }] = await Asset.loadAsync(`http://${ip}:8080/temp/image/${item.imageUrl}`);
                    // console.log(localImageUri);
                    item.localImageUrl = localImageUri;
                    const [{ localUri: localAudioUri, type }] = await Asset.loadAsync(`http://${ip}:8080/temp/audio/${item.mp3Url}`);
                    console.log(localAudioUri);
                    console.log(type);
                    item.localAudioUrl = localAudioUri;
                    // const asset = await Asset.loadAsync(`http://${ip}:8080/temp/image/${imageUrl}`);
                    // item.localImageUrl = asset.localUri;
                    // console.log(asset.localUri);
                    // console.log(item);
                    return item;
                }));
                // console.log(updatedObjs);
                // setMongoObjs(response.data);
                setMongoObjs(updatedObjs);
            })
            .catch(error => {
                console.log(error);
            });
        
        // const imageUrls = mongoObjs.map((item) => {
        //     const imageUrl = item.imageUrl;
        //     return `http://${ip}:8080/temp/image/${imageUrl}`;
        // });
        // const imageAssets = Asset.loadAsync(imageUrls);
        // imageAssets.forEach(console.log('imageassets' + imageAssets));

        // console.log(mongoObjs);
        // const updatedObjs = mongoObjs.map((item) => {
        //     const imageUrl = item.imageUrl;
        //     // return `http://${ip}:8080/temp/image/${imageUrl}`;
        //     const { localUri } = Asset.loadAsync(`http://${ip}:8080/temp/image/${imageUrl}`);
        //     item.localImageUrl = localUri;
        //     console.log(localUri);
        //     return item;
        // });
        // setMongoObjs(updatedObjs);
        // console.log(updatedObjs);
    }, []);

    // useEffect(() => {
    //     const updatedObjs = mongoObjs.map(async (item) => {
    //         const imageUrl = item.imageUrl;
    //         // return `http://${ip}:8080/temp/image/${imageUrl}`;
    //         const [{ localUri }] = await Asset.loadAsync(`http://${ip}:8080/temp/image/${imageUrl}`);
    //         item.localImageUrl = localUri;
    //         return item;
    //     });
    //     setMongoObjs(updatedObjs);
    //     console.log(updatedObjs);
    // }, [mongoObjs]);

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
                // console.log(item.mp3Url);
                // console.log('localuri' + item.localImageUrl);
                return (
                    <Pressable
                        onPress={() => {
                            navigation.navigate('NowPlaying', {
                                ip: ip,
                                title: date,
                                imageUrl: filename,
                                audioUrl: audioURL,
                                localImageUrl: item.localImageUrl,
                                localAudioUrl: item.localAudioUrl,
                            });
                        }}>
                        <View key={item.id}>
                            <Text>{date + audioURL}</Text>
                            <Image
                                style={{ width: 100, height: 100 }}
                                // source={{ uri: `http://${ip}:8080/temp/image/${filename}` }}
                                source={{ uri: item.localImageUrl }}
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