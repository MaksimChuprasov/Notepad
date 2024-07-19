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

    const saveEditedFile = async () => {
        if (editingFileIndex !== -1) {
            try {
                const originalFileUri = files[editingFileIndex].uri;
                const newFileUri = getNewFileUri(originalFileUri);
    
                await FileSystem.copyAsync({ from: originalFileUri, to: newFileUri });
    
                const updatedFiles = [...files];
                updatedFiles[editingFileIndex].uri = newFileUri;
                setFiles(updatedFiles);
    
                await FileSystem.writeAsStringAsync(newFileUri, editedFileContent);
    
                const fileName = `edited_${new Date().getTime()}.txt`;
                await saveFileToDownloads(newFileUri, fileName);
    
                setEditingFileIndex(-1);
                setEditedFileContent('');
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
            const promises = files.map(async (file) => {
                const fileUri = file.uri;
                const fileContent = await FileSystem.readAsStringAsync(fileUri);
                await FileSystem.writeAsStringAsync(fileUri, fileContent);
            });

            await Promise.all(promises);
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
                            <TextInput className=""
                                onChangeText={(content) => setEditedFileContent(content)}
                                placeholder='Change your file...'
                                value={editedFileContent}
                                multiline={true}
                            />
                        )}
                    </View>
                ))}
            </View>
            {editingFileIndex !== -1 && (
                <TouchableOpacity
                    className="items-center bg-gray-300 p-2 mx-1 rounded-xl mt-1"
                    onPress={saveEditedFile}
                >
                    <Text>Save File</Text>
                </TouchableOpacity>
            )}
            {editingFileIndex === -1 && (
                <TouchableOpacity
                    className="items-center bg-gray-300 p-2 mx-1 rounded-xl mt-1"
                    onPress={selectFiles}
                >
                    <Text>Add Files</Text>
                </TouchableOpacity>
            )}


            <TouchableOpacity
                className="rounded-2xl w-20 h-20 justify-center items-center ml-auto mr-1"
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