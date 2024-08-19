import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native'
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

const CheckList = ({ navigation, route }) => {
  const { addNote, updateNote, noteToEdit: initialNoteToEdit } = route.params || {};
  const [noteToEdit, setNoteToEdit] = useState(initialNoteToEdit); // Initialize state with noteToEdit from route.params
  const [text, setText] = useState(initialNoteToEdit ? initialNoteToEdit.text : ''); // Initialize text state
  const [files, setFiles] = useState(initialNoteToEdit ? initialNoteToEdit.files : []); // Initialize files state

  const isFocused = useIsFocused(); 

  useEffect(() => {
    if (noteToEdit) {
      setText(noteToEdit.text);
      setFiles(noteToEdit.files || []);
    }
  }, [noteToEdit]);
  const saveNote = async () => {
    if (noteToEdit) {
      noteToEdit.text = text;
      noteToEdit.files = files;
      updateNote((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteToEdit.id ? noteToEdit : note
        )
      );
    } else {
      addNote({
        text,
        files,
      });
    }

    try {
    } catch (error) {
      console.error('Error saving files:', error);
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home'); 
    }
  };

  useEffect(() => {
    if (!isFocused) {
      saveNote();
    }
  }, [isFocused, text, files, noteToEdit]); 

  return (
    <View className="bg-white h-full">
      <TextInput
        className="p-2 mt-2 mx-2 bg-white"
        placeholder='Enter your note...'
        onChangeText={(text) => setText(text)}
        value={text}
        multiline={true}
      />
    </View>
  );
};


export default CheckList;