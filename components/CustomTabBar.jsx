import React, { useState, useContext, useEffect } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import NoteContext from '../app/NoteContext';

const CustomTabBar = ({ state, descriptors, navigation }) => {

    const currentRouteName = state.routes[state.index].name;
    const { addNote, updateNote } = useContext(NoteContext);

    const handleAddPress = () => {
        navigation.navigate('Note', {
            addNote,
            updateNote,
            noteToEdit: null,
        });
    };

   
    const isTabBarVisible = currentRouteName !== 'Note';

    if (!isTabBarVisible) {
        return null;
    }

    return (
        <View className="bg-white py-2 px-6">
            <View className="flex-row justify-between">
                {/* Первая кнопка */}
                <TouchableOpacity
                    className="bg-white items-center"
                    onPress={() => navigation.navigate('Home')}
                >
                    <Image
                        source={require('../images/home.png')}
                        className="w-8 h-8"
                    />
                    <Text className="text-[12px]">Home</Text>
                </TouchableOpacity>

                {/* Вторая кнопка */}
                <TouchableOpacity
                    className="bg-white items-center"
                    onPress={() => navigation.navigate('Social')}
                >
                    <Image
                        source={require('../images/social.png')}
                        className="w-8 h-8"
                    />
                    <Text className="text-[12px]">Social</Text>
                </TouchableOpacity>

                {/* Третья кнопка */}
                <TouchableOpacity
                    className="bg-white items-center"
                    onPress={() => navigation.navigate('Shop')}
                >
                    <Image
                        source={require('../images/shop.png')}
                        className="w-8 h-8"
                    />
                    <Text className="text-[12px]">Shop</Text>
                </TouchableOpacity>

                {/* Кнопка создания заметки */}
                <TouchableOpacity
                    className="bg-white items-center"
                    onPress={handleAddPress}
                >
                    <Image
                        source={require('../images/add-note.png')}
                        className="w-8 h-8"
                    />
                    <Text className="text-[12px]">New Note</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CustomTabBar;