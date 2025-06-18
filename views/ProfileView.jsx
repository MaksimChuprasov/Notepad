import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Image
} from 'react-native';


const ProfileView = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = () => {
        if (name && email && password) {
            setIsLoggedIn(true);
        }
    };
    const handleLogOut = () => {
        setIsLoggedIn(false);
    };

    return isLoggedIn ? (
        <SafeAreaView className="mt-16 px-5">
            <View className='flex-row justify-between items-start'>
                <View>
                    <View className='flex-row items-center w-3/4'>
                        <Text className='font-bold text-3xl' numberOfLines={1} ellipsizeMode="tail">{name}</Text>
                        <Image
                            source={require('../images/user.png')}
                            className="w-10 h-10 ml-1"
                        />
                    </View>
                    <Text className='text-lg text-gray-500 mt-[-10px]' numberOfLines={1} ellipsizeMode="tail">{email}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleLogOut}
                    className="items-center"
                >
                    <Image
                        source={require('../images/logout.png')}
                        className="w-10 h-10"
                    />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    ) : (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 justify-center px-6">
                    <Text className="text-2xl font-bold text-center mb-6 text-gray-800">
                        Create Your Profile
                    </Text>

                    <Text className="text-base mb-1 text-gray-600">Name</Text>
                    <TextInput
                        className="border border-gray-300 bg-gray-100 rounded-xl px-4 py-3 mb-4"
                        placeholder="Your name"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text className="text-base mb-1 text-gray-600">Email</Text>
                    <TextInput
                        className="border border-gray-300 bg-gray-100 rounded-xl px-4 py-3 mb-4"
                        placeholder="Your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text className="text-base mb-1 text-gray-600">Create New Password</Text>
                    <TextInput
                        className="border border-gray-300 bg-gray-100 rounded-xl px-4 py-3 mb-6"
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        className="bg-blue-600 py-3 rounded-xl shadow-lg active:opacity-80"
                        onPress={handleRegister}
                    >
                        <Text className="text-white text-center text-lg font-semibold">
                            Create Profile
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}


export default ProfileView