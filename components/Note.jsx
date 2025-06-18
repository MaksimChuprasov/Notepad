import { View, Text } from 'react-native';
import React from 'react';
import { format } from 'date-fns';

const Note = ({ note, formattedDate, isSelected }) => {
    return (
        <View
            className={`
        flex-1
        bg-white
        rounded-3xl
        p-4
        mb-4
        border
        ${isSelected ? 'border-purple-600' : 'border-gray-300'}
        ${isSelected ? 'bg-purple-50' : 'bg-white'}`}
            style={{
                minHeight: 160,
            }}
        >
            {/* Заголовок */}
            {note?.title && (
                <Text
                    className="text-lg font-bold mb-2 text-gray-900"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {note.title}
                </Text>
            )}

            {/* Основной текст */}
            <Text
                className="text-gray-600 text-sm mb-3 flex-grow"
                numberOfLines={4}
                ellipsizeMode="tail"
            >
                {note?.text || 'Пустая заметка'}
            </Text>

            {/* Файлы и дата */}
            <View className="flex-row justify-between items-center border-t border-gray-200 pt-2">
                <View>
                    {note?.files && note.files.length > 0 && (
                        <Text
                            className="text-xs text-gray-500 max-w-[140px]"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            📎 {note.files[0].name}
                        </Text>
                    )}
                </View>

                <Text className="text-xs text-gray-400">{formattedDate}</Text>
            </View>
        </View>
    );
};

export default Note;