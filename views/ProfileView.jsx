import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Linking, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoteContext from '@/app/NoteContext';

const ProfileView = () => {
    const { updateToken } = useContext(NoteContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    setIsLoggedIn(true);
                    const userInfo = await AsyncStorage.getItem('userInfo');
                    if (userInfo) {
                        const user = JSON.parse(userInfo);
                        setName(user.name);
                        setEmail(user.email);
                    }
                }
            } catch (e) {
                console.error('Ошибка загрузки токена:', e);
            }
        };

        checkToken();
    }, []);

    // 🎯 Обработка deep link после Google авторизации
    useEffect(() => {
        const handleDeepLink = async (event) => {
            const url = event.url;
            const tokenMatch = url.match(/token=([^&]+)/);

            if (tokenMatch) {
                const token = decodeURIComponent(tokenMatch[1]);

                try {
                    const res = await fetch("https://notepad.faceqd.site/api/v1/user", {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (!res.ok) throw new Error('Ошибка при получении данных пользователя');

                    const user = await res.json();

                    await AsyncStorage.setItem('userToken', token);
                    await AsyncStorage.setItem('userInfo', JSON.stringify(user));

                    updateToken(token);
                    setIsLoggedIn(true);
                    setName(user.name);
                    setEmail(user.email);

                    console.log('✅ Google вход успешен');
                } catch (e) {
                    Alert.alert('Ошибка', e.message);
                }
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);

        Linking.getInitialURL().then(url => {
            if (url) handleDeepLink({ url });
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // 📤 Запросить ссылку и открыть браузер
    const handleGoogleLogin = async () => {
        try {
            const res = await fetch("https://notepad.faceqd.site/api/v1/auth/google", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!res.ok) throw new Error('Ошибка сервера: ' + res.status);

            const data = await res.json();

            if (!data.url) throw new Error('Ответ сервера не содержит ссылку');

            Linking.openURL(data.url);
        } catch (e) {
            console.error(e);
            Alert.alert('Ошибка', e.message || 'Не удалось получить ссылку авторизации');
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        try {
            const response = await fetch("https://notepad.faceqd.site/api/v1/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка входа');
            }

            const data = await response.json();

            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));

            updateToken(data.token);

            setIsLoggedIn(true);
            setName(data.user.name);
            setEmail(data.user.email);
        } catch (error) {
            console.error('Ошибка при входе:', error.message);
            Alert.alert('Ошибка', error.message);
        }
    };

    const handleLogOut = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
        updateToken(null);
        setIsLoggedIn(false);
        setName('');
        setEmail('');
        setPassword('');
    };

    return isLoggedIn ? (
        <SafeAreaView className="px-5">
            <StatusBar style="dark" />
            <View className='flex-row justify-between items-start mt-10'>
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
                    className="items-center mt-1"
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

                    <TouchableOpacity
                        className="bg-gray-600 mt-3 py-3 rounded-xl shadow-lg active:opacity-80"
                        onPress={handleGoogleLogin}
                    >
                        <Text className="text-white text-center text-lg font-semibold">
                            GOOGLE
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}


export default ProfileView