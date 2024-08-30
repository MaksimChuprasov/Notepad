import { View, Text } from 'react-native';
import React from 'react';
import { format } from 'date-fns';

const Note = ({ note, style }) => {
    const creationDate = note?.createdAt ? new Date(note.createdAt) : new Date();
    const formattedDate = format(creationDate, 'dd.MM.yyyy HH:mm');

    return (
        <View style={style} className="w-[165px] mr-3 mb-3 p-3 bg-white rounded-3xl border border-[#e8e8e8]">
            {/* Заголовок заметки */}
            {note?.title && (
                <View className="flex-row justify-between items-center pb-1 mb-1 border-b border-[#e8e8e8]">
                    <View className="flex-row items-center">
                        <Text className="text-lg font-bold">{note.title}</Text>
                    </View>
                </View>
            )}
            {/* Контент заметки */}
            <View className="mb-2">
                <Text className="text-sm text-gray-600" numberOfLines={3} ellipsizeMode="tail">
                    {note?.text}
                </Text>
            </View>

            {/* Футер заметки */}
            <View className="flex-row justify-between items-center text-gray-400">
                <View className="flex-row items-center">
                    {note?.files && note.files.length > 0 && (
                        <View className="mb-2">
                            <View className="p-1 border-t border-[#e8e8e8]">
                                <Text numberOfLines={2} ellipsizeMode="tail">{note.files[0].name}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
            <Text className="text-xs absolute bottom-1 right-3">{formattedDate}</Text>
        </View>
    );
};

export default Note;