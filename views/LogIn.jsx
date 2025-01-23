import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Pressable, Image, SafeAreaView, TouchableWithoutFeedback, Button } from 'react-native';
import NoteContext from '../app/NoteContext';
import { useFocusEffect } from '@react-navigation/native';


const ProfileView = () => {
    const { addNote, updateNote } = useContext(NoteContext);

    console.log(addNote, updateNote)
    return (
        <SafeAreaView className="mt-10 px-5">
            <View className='w-full h-full justify-center'>
                <Text className=' font-bold text-3xl'>Log In</Text>
                <View className=' gap-4 mt-2'>
                    <TextInput
                        className='border border-black rounded-lg'
                        placeholder="Email" />
                    <TextInput
                        className='border border-black rounded-lg'
                        secureTextEntry={true}
                        placeholder="Password" />
                    <TouchableOpacity
                        className="bg-green-500 items-center rounded-md py-2 border border-green-700"
                    >
                        <Text className="font-semibold text-lg">Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ProfileView