import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const NoteView = ({ navigation, route }) => {
    const { addNote, updateNote, noteToEdit } = route.params || {};
    const [text, setText] = useState(noteToEdit ? noteToEdit.text : '');
    const [files, setFiles] = useState(noteToEdit ? noteToEdit.files : []);

    useEffect(() => {
        if (noteToEdit) {
            setText(noteToEdit.text);
            setFiles(noteToEdit.files || []);
        }
    }, [noteToEdit]);

    const selectFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['*/*'],
                multiple: true,
            });

            if (result.canceled) {
                console.log('File selection was cancelled');
            } else {
                const selectedFiles = result.assets || [];
                setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
            }
        } catch (err) {
            console.error('Error selecting files:', err);
        }
    };

    const openFile = async (fileUri) => {
        try {
            const contentUri = await FileSystem.getContentUriAsync(fileUri);
            await WebBrowser.openBrowserAsync(contentUri);
        } catch (err) {
            console.error('Error opening file:', err);
            Alert.alert('Error', 'Unable to open file.');
        }
    };

    const saveNote = () => {
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
        navigation.goBack();
    };

    return (
        <View className="bg-white h-full">
            <TextInput
                className="p-2 mt-2 mx-2 bg-white"
                placeholder='Enter your note...'
                onChangeText={(text) => setText(text)}
                value={text}
            />
            <TouchableOpacity
                className="p-2 mt-2 mx-2 bg-gray-200"
                onPress={selectFiles}
            >
                <Text>Select Files</Text>
            </TouchableOpacity>

            {files.length > 0 ? (
                <View>
                    {files.map((file, index) => (
                        <TouchableOpacity
                            key={index}
                            className="p-2"
                            onPress={() => openFile(file.uri)}
                        >
                            <Text>{file.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <Text className="p-2">No files selected</Text>
            )}

            <TouchableOpacity
                className="rounded-2xl w-20 h-20 justify-center items-center mt-2 ml-auto mr-1"
                title='Save Note'
                onPress={saveNote}
            >
                <Image
                    source={require('../images/align-right-svgrepo-com.png')}
                    className="w-12 h-12"
                />
            </TouchableOpacity>
        </View>
    );
};


export default NoteView;