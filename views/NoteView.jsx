import React, { useState, useEffect, useCallback, } from 'react';
import { Alert } from 'react-native';
import { View, Text, TouchableOpacity, Image, TextInput, TouchableWithoutFeedback } from 'react-native'
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import DeleteModal from '../components/SaveModal'

const NoteView = ({ navigation, route }) => {
    const { addNote, updateNote, noteToEdit: initialNoteToEdit } = route.params || {};
    const [noteToEdit, setNoteToEdit] = useState(initialNoteToEdit);
    const [text, setText] = useState(initialNoteToEdit ? initialNoteToEdit.text : '');
    const [files, setFiles] = useState(initialNoteToEdit ? initialNoteToEdit.files : []);
    const [editingFileIndex, setEditingFileIndex] = useState(-1);
    const [editedFileContent, setEditedFileContent] = useState('');
    const [fileUri, setFileUri] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saveButtonLabel, setSaveButtonLabel] = useState('Save File');
    const [showSaveModal, setshowSaveModal] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (noteToEdit) {
            setText(noteToEdit.text);
            setFiles(noteToEdit.files || []);
        }
    }, [noteToEdit]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (!isNavigating && (text !== initialNoteToEdit?.text || files !== initialNoteToEdit?.files)) {
                e.preventDefault();
                setshowSaveModal(true);
            }
        });

        return unsubscribe;
    }, [navigation, text, files, initialNoteToEdit, isNavigating]);

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
                const documentDirectory = FileSystem.documentDirectory;
                const fileName = fileUri.split('/').pop();
                const destinationUri = documentDirectory + fileName;

                await FileSystem.writeAsStringAsync(destinationUri, editedFileContent, {
                    encoding: FileSystem.EncodingType.UTF8,
                });

                // Обновляем состояние файлов с новым URI
                setFiles((prevFiles) =>
                    prevFiles.map((file, index) =>
                        index === editingFileIndex ? { ...file, uri: destinationUri } : file
                    )
                );

                setIsEditing(false);
                setEditingFileIndex(-1);
                setSaveButtonLabel('Save File');
                setFileUri('');
                setEditedFileContent('');
            } catch (err) {
                console.error('Error saving file:', err);
            }
        }
    };

    const openFile = async (fileUri, index) => {
        setEditingFileIndex(index);
        setFileUri(fileUri);
        setSaveButtonLabel('Save Changes');
        setIsEditing(true);
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

        setshowSaveModal(false);
        setIsNavigating(true);
        setTimeout(() => {
            navigation.goBack();
        }, 100);
    };
    
    const handleExitWithoutSaving = () => {
        setshowSaveModal(false);
        setIsNavigating(true);
        setTimeout(() => {
            navigation.goBack();
        }, 100);
    };

    const handleOutsidePress = () => {
        if (showSaveModal) {
            setshowSaveModal(false);
        }
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
            </View>

            <DeleteModal
                visible={showSaveModal}
                onExit={handleExitWithoutSaving}
                onSave={saveNote}
                onClose={handleOutsidePress}
            />
        </View>
    );
};


export default NoteView;