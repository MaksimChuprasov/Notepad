import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, ScrollView, StatusBar, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoteContext from '@/app/NoteContext';
import AdvancedNativeAd from '../components/AdvancedNativeAd'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import mobileAds from 'react-native-google-mobile-ads';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { changeLanguage } from '../src/i18n';
import { useTranslation } from 'react-i18next';
import i18n from '../src/i18n';


const ProfileView = () => {
    const { saveToken, handleGoogleLogin, handleLogOut, isLoggedIn, name, email, expoPushToken } = useContext(NoteContext);

    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const languages = [
        { code: 'en', label: 'English' },
        { code: 'ru', label: 'Русский' },
        { code: 'tr', label: 'Türkçe' },
        { code: 'de', label: 'Deutsch' },
        { code: 'it', label: 'Italiano' },
        { code: 'fr', label: 'Français' },
        { code: 'es', label: 'Español' },
        { code: 'pt', label: 'Português' },
    ];

    const currentLang = i18n.language;

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    /* const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-5613402667721593/7654096833'; */

    useEffect(() => {
        mobileAds()
            .initialize()
    }, []);

    const maxLabelLength = Math.max(...languages.map((lang) => lang.label.length));
    const estimatedMinWidth = maxLabelLength * 10 + 30;

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
            <View className='flex-row items-center mt-8 mb-4'>
                <Image
                    source={require('../images/language.png')}
                    className="w-10 h-10"
                />
                <Text className='text-lg'>{t('Change Language')}</Text>
            </View>
            <View className="flex-row flex-wrap gap-4 justify-start w-full">
                {languages.map((lang) => {
                    const isActive = lang.code === currentLang;
                    return (
                        <TouchableOpacity
                            key={lang.code}
                            onPress={() => changeLanguage(lang.code)}
                            className={`w-[45%] py-2 rounded-lg border items-center ${isActive
                                ? 'bg-gray-100 border-gray-600'
                                : 'bg-white border-gray-300'
                                }`}
                            style={{ minWidth: estimatedMinWidth }}
                        >
                            <Text
                                className='text-base font-medium text-gray-700'>
                                {lang.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {/* <Text className='mt-3 text-center' selectable={true}>{expoPushToken}</Text> */}

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
                            {t('Sign in with Google')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}


export default ProfileView