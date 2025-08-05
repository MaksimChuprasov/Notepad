import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';

const TitleInput = ({ value, onChangeText, errorMessage }) => {
  const [showError, setShowError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  useEffect(() => {
    if (errorMessage) {
      setShowError(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowError(false));
    }
  }, [errorMessage, fadeAnim]);

  return (
    <View className="relative w-2/3 mt-3">
  <TextInput
    className="rounded-md px-3 py-2 text-black text-lg font-semibold bg-white border border-gray-300"
    placeholder={t("Title")}
    placeholderTextColor="#9ca3af"
    value={value}
    onChangeText={onChangeText}
  />

  {showError && (
    <Animated.View
      style={{
        opacity: fadeAnim,
        position: 'absolute',
        top: 54,
        left: 8,
        maxWidth: 250,
        zIndex: 50,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        backgroundColor: '#ef4444',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -8,
          left: 24,
          width: 0,
          height: 0,
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderBottomWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#ef4444',
          zIndex: 51,
        }}
      />
      <Text className="text-white text-sm">{errorMessage}</Text>
    </Animated.View>
  )}
</View>
  );
};

export default TitleInput;