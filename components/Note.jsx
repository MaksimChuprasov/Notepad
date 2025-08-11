import { View, Text, Image, Pressable } from 'react-native';
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const Note = ({ note, isSelected, onPress, onLongPress }) => {

    const { t } = useTranslation();
    const formattedDate = note?.createdAt
        ? format(new Date(note.createdAt), 'd MMM yyyy HH:mm')  // 4 Aug 2025
        : '';

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            className={`flex-1 bg-white rounded-3xl p-4 pb-0 mb-4 border w-full h-48
    ${isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-300'}`} style={{ minHeight: 192 }}>
            <View className='flex flex-row justify-between items-center mb-2 mr-4'>
                {/* Title */}
                {note?.title && (
                    <Text
                        className="text-lg font-bold text-gray-900 w-full"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {note.title}
                    </Text>
                )}
                {Array.isArray(note.selectedGroupIds) && note.selectedGroupIds.length > 0 && (
                    <Image
                        source={require('../images/group-check.png')}
                        className="w-5 h-5"
                    />
                )}

            </View>


            {/* Tasks */}
            {Array.isArray(note?.tasks) && note.tasks.length > 0 && (
                <View className="mt-1 space-y-1">
                    {note.tasks.slice(0, 3).map((task, i) => (
                        <View key={i} className="flex-row items-center space-x-3 mb-1">
                            <View
                                className={`w-4 h-4 rounded-full border-2 
              ${task.checked ? 'border-green-500 bg-green-500' : 'border-gray-400'} 
              items-center justify-center`}
                            >
                                {task.checked && (
                                    <Text className="text-white text-[10px] text-center">✓</Text>
                                )}
                            </View>

                            <Text
                                className={`text-xs flex-1 ${task.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {task.text || ''}
                            </Text>
                        </View>
                    ))}
                    {note.tasks.length > 3 && (
                        <Text className="text-xs text-gray-400 italic">+ {note.tasks.length - 3} {t('more')}</Text>
                    )}
                </View>
            )}

            {/* Text */}
            {note?.text ? (
                <Text
                    className="text-gray-600 text-sm mb-2 flex-shrink"
                    numberOfLines={3}
                    ellipsizeMode="tail"
                >
                    {note.text}
                </Text>
            ) : null}

            <View className="flex-grow" />

            <View className="flex-row justify-end border-t border-gray-200 mt-1">
                {/* Файл */}
                {/* {note?.files?.length > 0 && note.files[0].name ? (
                    <Text
                        className="text-xs text-gray-500 max-w-[140px]"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        📎 {note.files[0].name}
                    </Text>
                ) : (
                    <View className="w-[140px]" />
                )} */}

                {/* Дата создания */}
                <Text className="text-xs text-gray-400 py-2">
                    {formattedDate}
                </Text>
            </View>
        </Pressable>
    );
};

export default Note;