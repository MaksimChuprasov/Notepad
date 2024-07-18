import { View, Text } from 'react-native'
import React from 'react'

const Note = ({ note }) => {
    return (
      <View className="m-1 border rounded-xl p-1 w-40 bg-white h-full">
            <Text className="text-lg font-medium" numberOfLines={3} ellipsizeMode="tail">{note.text}</Text>
            {note.files && note.files.length > 0 && (
                <View className="mt-2">
                    {note.files.map((file, index) => (
                        <View key={index} className="p-1 border-t">
                            <Text numberOfLines={2} ellipsizeMode="tail">{file.name}</Text> 
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
  };

export default Note