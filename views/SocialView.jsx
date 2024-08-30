import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Pressable, Image, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import NoteContext from '../app/NoteContext';
import { useFocusEffect } from '@react-navigation/native';


const SocialView = () => {
    const { addNote, updateNote } = useContext(NoteContext);

    console.log(addNote, updateNote)
    return (
        <View className="mt-10">
            <Text>Social</Text>
        </View>
    );
};

export default SocialView