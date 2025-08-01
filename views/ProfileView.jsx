import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, ScrollView, StatusBar, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoteContext from '@/app/NoteContext';
import AdvancedNativeAd from '../components/AdvancedNativeAd'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import mobileAds from 'react-native-google-mobile-ads';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const ProfileView = () => {
    const { saveToken, handleGoogleLogin, handleLogOut, isLoggedIn, name, email, expoPushToken } = useContext(NoteContext);

    const insets = useSafeAreaInsets();

    /* const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-5613402667721593/7654096833'; */

    useEffect(() => {
        mobileAds()
            .initialize()
    }, []);



    return isLoggedIn ? (
        <View style={{
            paddingTop: insets.top,
        }}
            className="px-5 relative h-full">
            <View className='flex-row justify-between items-start mt-2'>
                <View>
                    <View className='flex-row items-start w-3/4'>
                        <Text className='font-bold text-3xl' numberOfLines={2} ellipsizeMode="tail">{name}</Text>
                        <Image
                            source={require('../images/user.png')}
                            className="w-10 h-10 ml-1"
                        />
                    </View>
                    <Text className='text-lg text-gray-500' numberOfLines={1} ellipsizeMode="tail">{email}</Text>
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
            <TouchableOpacity
                onPress={saveToken}
                className="items-center mt-20 border rounded py-2"
            >
                <Text>Get Token</Text>
            </TouchableOpacity>
            <Text className='mt-3 text-center' selectable={true}>{expoPushToken}</Text>

            {/* <View className='absolute bottom-0'>
                <BannerAd
                    unitId={adUnitId}
                    size={BannerAdSize.ADAPTIVE_BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                />
            </View> */}
            {/* <AdvancedNativeAd/> */}

        </View>
    ) : (
        <KeyboardAvoidingView
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 justify-center px-6">
                    <TouchableOpacity
                        className="flex flex-row items-center justify-center bg-white border border-gray-300 mt-3 py-5 rounded-xl shadow-lg active:opacity-80 "
                        onPress={handleGoogleLogin}
                    >
                        <Image
                            source={require('../images/google.png')}
                            className="w-8 h-8"
                        />
                        <Text className="text-black text-center text-xl font-semibold ml-2">
                            Sign in with Google
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}


export default ProfileView