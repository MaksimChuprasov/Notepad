import { View, Text } from 'react-native'
import React from 'react'

const Note = ({ note }) => {
    return (
      <View className="m-1 border rounded-xl p-1 w-40 ">
        <Text className="text-xl">{note.text}</Text>
      </View>
    );
  };

export default Note