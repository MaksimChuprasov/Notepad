import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Pressable, Image, SafeAreaView, TouchableWithoutFeedback, Button } from 'react-native';
import NoteContext from '../app/NoteContext';
import { useFocusEffect } from '@react-navigation/native';


const ProfileView = () => {
    const { addNote, updateNote } = useContext(NoteContext);

    console.log(addNote, updateNote)
    return (
        <SafeAreaView className="mt-16 px-5">
            <View className='flex-row items-center'>
                
                <Text className=' font-bold text-3xl'>Profile</Text>
                <Image
                    source={require('../images/user.png')}
                    className="w-10 h-10 ml-1"
                />
            </View>
            <Text className='text-lg text-gray-500 mt-[-10px]'>maxchuprasov07@gmail.com</Text>
        </SafeAreaView>
    );
};

export default ProfileView