import { StyleSheet, View, Image, Text, SafeAreaView, Pressable, Share, Alert, Button } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';
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
            <Text>Home Screen Test</Text>
            {mongoObjs.map((item) => {
                // const fileName = getJPEG(item.imageUrl);
                const filename = item.imageUrl;
                return (
                    <View key={item.id}>
                        <Image
                            style={{ width: 100, height: 10 }}
                            // source={{ uri: `http://${ip}:8080/temp/img/${filename}` }}
                            source={{uri: `http://${ip}:8080/temp/image/649dd0754ebffa9faa53a06b`}}
                        />

                        <Text>{item.date}</Text>
                    </View>
                );
            })}
            <Button
                onPress={() => navigation.navigate('NowPlaying')}
                title="Open Modal"
            />
        </SafeAreaView>
    );
}

export default HomeScreen;