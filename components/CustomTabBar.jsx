import React, { useState, useContext, useEffect } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import NoteContext from '../app/NoteContext';

const CustomTabBar = ({ state, descriptors, navigation }) => {

    const currentRouteName = state.routes[state.index].name;
    const { addNote, updateNote } = useContext(NoteContext);
    const [log, setLog] = useState(false);

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
                {/* First button */}
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

                {/* Second button*/}
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

                {/* Third button */}
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


                {/* fourth button */}
                <TouchableOpacity
                    className="bg-white items-center hidden"
                    onPress={() => navigation.navigate('LogIn')}
                >
                    <Image
                        source={require('../images/profile.png')}
                        className="w-8 h-8"
                    />
                    <Text className="text-[12px]">Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white items-center"
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Image
                        source={require('../images/profile.png')}
                        className="w-8 h-8"
                    />
                    <Text className="text-[12px]">Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CustomTabBar;