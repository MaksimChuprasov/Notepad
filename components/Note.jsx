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
    ${isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-300'}`} style={{ minHeight: 160 }}>
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
                className="text-gray-600 text-sm mb-2 flex-shrink"
                numberOfLines={3}
                ellipsizeMode="tail"
            >
                {note?.text || 'Empty note'}
            </Text>

            {/* Таски (если есть) */}
            {note?.tasks?.length > 0 && (
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
                        <Text className="text-xs text-gray-400 italic">+ {note.tasks.length - 3} more</Text>
                    )}
                </View>
            )}

            {/* Spacer чтобы прижать футер вниз */}
            <View className="flex-grow" />

            {/* Файлы и дата */}
            <View className="flex-row justify-between items-center border-t border-gray-200 pt-2 mt-2">
                {note?.files?.length > 0 && note.files[0].name ? (
                    <Text
                        className="text-xs text-gray-500 max-w-[140px]"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        📎 {note.files[0].name}
                    </Text>
                ) : (
                    <View className="w-[100px]" /> // Пустое место, чтобы сохранить симметрию
                )}
            </View>
        </View>
    );
};

export default Note;