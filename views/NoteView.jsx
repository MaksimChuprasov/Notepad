import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'

const NoteView = ({ navigation, route }) => {

    const [text, setText] = useState('');
    const { addNote } = route.params;

    const saveNote = () => {
        addNote(text);
        navigation.goBack();
    };

    return (
        <View className="bg-white h-full">
            <TextInput
                className="border p-2 rounded-xl mt-2 mx-2 bg-white"
                placeholder='Enter your note...'
                onChangeText={(text) => setText(text)}
                value={text}
            />
            <TouchableOpacity className="rounded-2xl w-20 h-20 justify-center items-center mt-2 ml-auto mr-2" title='Add Note' onPress={() => saveNote()} >
                <Image
                    source={require('../images/align-right-svgrepo-com.png')}
                    className="w-16 h-16"
                />
            </TouchableOpacity>
        </View>
    )
}

export default NoteView;