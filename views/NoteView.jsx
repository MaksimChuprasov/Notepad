import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const NoteView = ({ navigation, route }) => {
    const { addNote, updateNote, noteToEdit } = route.params || {};
    const [text, setText] = useState(noteToEdit ? noteToEdit.text : '');
    const [files, setFiles] = useState(noteToEdit ? noteToEdit.files : []);
    const [editingFileIndex, setEditingFileIndex] = useState(-1);
    const [editedFileContent, setEditedFileContent] = useState('');

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

    const getNewFileUri = (originalUri) => {
        const timestamp = new Date().getTime();
        const lastIndex = originalUri.lastIndexOf('/');
        const directory = originalUri.substring(0, lastIndex + 1);
        const fileName = originalUri.substring(lastIndex + 1);

        const newFileUri = `${directory}copy_${timestamp}_${fileName}`;
        return newFileUri;
    };

    const saveFileToDownloads = async (fileUri, fileName) => {
        try {
            const downloadsDirectory = `${FileSystem.documentDirectory}Documents/`;
            await FileSystem.makeDirectoryAsync(downloadsDirectory, { intermediates: true });

            const newFileUri = `${downloadsDirectory}${fileName}`;

            await FileSystem.copyAsync({
                from: fileUri,
                to: newFileUri,
            });
        } catch (error) {
            console.error('Error saving file to Downloads:', error);
        }
    };

    const copyFileToPermanentLocation = async (uri) => {
        try {
            const fileName = uri.split('/').pop();
            const permanentFileUri = `${FileSystem.documentDirectory}Documents/${fileName}`;

            // Копируем файл в постоянное место
            await FileSystem.copyAsync({
                from: uri,
                to: permanentFileUri,
            });

            return permanentFileUri;
        } catch (error) {
            console.error('Error copying file:', error);
            throw error;
        }
    };

    const saveEditedFile = async () => {
        if (editingFileIndex !== -1) {
            try {
                const originalFileUri = files[editingFileIndex].uri;
    
                // Проверяем, находится ли файл в временной директории
                const permanentFileUri = originalFileUri.startsWith('file:///data/user/0/host.exp.exponent/cache')
                    ? await copyFileToPermanentLocation(originalFileUri)
                    : originalFileUri;

                    console.log(permanentFileUri)
    
                // Перезаписываем файл с новыми данными
                await FileSystem.writeAsStringAsync(permanentFileUri, editedFileContent);
    
                // Обновляем список файлов с новым URI
                const updatedFiles = [...files];
                updatedFiles[editingFileIndex] = { ...updatedFiles[editingFileIndex], uri: permanentFileUri };
                setFiles(updatedFiles);
    
                // Сбрасываем индекс и содержимое редактируемого файла
                setEditingFileIndex(-1);
                setEditedFileContent('');
    
                Alert.alert('Success', 'File has been saved.');
            } catch (err) {
                console.error('Error saving file:', err);
                Alert.alert('Error', 'Unable to save file.');
            }
        }
    };

    const openFile = async (fileUri, index) => {
        try {
            const fileContent = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.UTF8,
            });
            console.log('File Content:', fileContent); // Проверьте содержимое файла
            setEditingFileIndex(index);
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
            // Здесь уже не нужно перезаписывать файлы, так как это делается в saveEditedFile
        } catch (error) {
            console.error('Error saving files:', error);
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
                <TouchableOpacity
                    className="flex rounded-2xl w-20 h-20 justify-center items-center ml-auto mr-1"
                    title='Save Note'
                    onPress={saveNote}
                >
                    <Image
                        source={require('../images/save-note.png')}
                        className="w-10 h-10"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};


export default NoteView;