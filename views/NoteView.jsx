import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native'
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const NoteView = ({ navigation, route }) => {
    const { addNote, updateNote, noteToEdit: initialNoteToEdit } = route.params || {};
    const [noteToEdit, setNoteToEdit] = useState(initialNoteToEdit); // Initialize state with noteToEdit from route.params
    const [text, setText] = useState(initialNoteToEdit ? initialNoteToEdit.text : ''); // Initialize text state
    const [files, setFiles] = useState(initialNoteToEdit ? initialNoteToEdit.files : []); // Initialize files state
    const [editingFileIndex, setEditingFileIndex] = useState(-1);
    const [editedFileContent, setEditedFileContent] = useState('');
    const [fileUri, setFileUri] = useState('');

    const isFocused = useIsFocused(); // Track whether the screen is focused

    // Update text and files when noteToEdit changes
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

    const saveEditedFile = async () => {
        if (fileUri) {
            try {
                // Путь для сохранения файла
                const documentDirectory = FileSystem.documentDirectory;
                const fileName = fileUri.split('/').pop(); // Извлечение имени файла
                const destinationUri = documentDirectory + fileName;
    
                // Запись содержимого в указанное место
                await FileSystem.writeAsStringAsync(destinationUri, editedFileContent, {
                    encoding: FileSystem.EncodingType.UTF8,
                });
    
                Alert.alert('Успех', `Файл успешно сохранен в ${destinationUri}`);
            } catch (err) {
                console.error('Ошибка при сохранении файла:', err);
                Alert.alert('Ошибка', 'Не удалось сохранить файл.');
            }
        } else {
            Alert.alert('Ошибка', 'Не найден URI файла.');
        }
    };

    const openFile = async (fileUri, index) => {
        setEditingFileIndex(index);
        setEditedFileContent('');
        setFileUri(fileUri);
        console.log('Opening file with URI:', fileUri);
        try {
            const fileContent = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.UTF8,
            });
            setEditedFileContent(fileContent);
        } catch (err) {
            console.error('Error opening file:', err);
            Alert.alert('Error', 'Unable to open file.');
        }
    };

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
            // Add any additional logic to save files if needed
        } catch (error) {
            console.error('Error saving files:', error);
        }

        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // Если нельзя вернуться, например, можно перенаправить на другой экран
            navigation.navigate('Home'); // Замените 'Home' на нужный вам экран
        }
    };

    // Use useEffect to track when the screen loses focus
    useEffect(() => {
        if (!isFocused) {
            saveNote();
        }
    }, [isFocused, text, files, noteToEdit]); // Depend on isFocused, text, files, and noteToEdit

    return (
        <View className="bg-white h-full">
            <TextInput
                className="p-2 mt-2 mx-2 bg-white"
                placeholder='Enter your note...'
                onChangeText={(text) => setText(text)}
                value={text}
                multiline={true}
            />
            <View className="px-3">
                {files.map((file, index) => (
                    <View key={index}>
                        <TouchableOpacity className="w-1/2 mb-1"
                            onPress={() => openFile(file.uri, index)}
                        >
                            <Text className="text-blue-600">{file.name}</Text>
                        </TouchableOpacity>
                        {editingFileIndex === index && (
                            <TextInput className="border p-2 rounded-lg"
                                onChangeText={(content) => setEditedFileContent(content)}
                                placeholder='Change your file...'
                                value={editedFileContent}
                                multiline={true}
                            />
                        )}
                    </View>
                ))}
            </View>
            <View className="flex-1 flex-row">
                {editingFileIndex !== -1 && (
                    <TouchableOpacity
                        className="flex items-center p-2 mx-1 mt-1 rounded-xl h-12"
                        onPress={saveEditedFile}
                    >
                        <Image
                            source={require('../images/save-file.png')}
                            className="w-8 h-8"
                        />
                    </TouchableOpacity>
                )}
                {editingFileIndex === -1 && (
                    <TouchableOpacity
                        className="flex items-center p-2 mx-1 mt-1 rounded-xl h-12"
                        onPress={selectFiles}
                    >
                        <Image
                            source={require('../images/add-file.png')}
                            className="w-8 h-8"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};


export default NoteView;