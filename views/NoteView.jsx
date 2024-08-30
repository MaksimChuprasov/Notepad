import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import NoteContext from '../app/NoteContext';
import SaveModal from '../components/SaveModal'

const NoteView = ({ navigation, route }) => {
    const { addNote, updateNote } = useContext(NoteContext);
    const { noteToEdit: initialNoteToEdit } = route.params || {};
    const { noteToEdit } = route.params || {};
    const [text, setText] = useState(initialNoteToEdit ? initialNoteToEdit.text : '');
    const [title, setTitle] = useState(initialNoteToEdit ? initialNoteToEdit.title : '');
    const [files, setFiles] = useState(initialNoteToEdit ? initialNoteToEdit.files : []);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFileContent, setEditedFileContent] = useState('');
    const [fileUri, setFileUri] = useState('');
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [editingFileIndex, setEditingFileIndex] = useState(-1);
    const [saveButtonLabel, setSaveButtonLabel] = useState('Save File');

    const isFocused = useIsFocused();

    useEffect(() => {
        if (noteToEdit) {
            setTitle(noteToEdit.title || '');
            setText(noteToEdit.text || '');
            setFiles(noteToEdit.files || []);
        } else {
            setTitle('');
            setText('');
            setFiles([]);
        }
    }, [noteToEdit]);

    const saveNote = () => {
        const updatedNote = {
            id: noteToEdit ? noteToEdit.id : Date.now().toString(),
            title,
            text,
            files
        };

        if (noteToEdit) {
            updateNote(updatedNote);
        } else {
            addNote(updatedNote);
        }

        navigation.goBack();
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            const hasChanges =
                text !== initialNoteToEdit?.text ||
                title !== initialNoteToEdit?.title ||
                files.length !== (initialNoteToEdit?.files?.length || 0);

            if (hasChanges) {
                e.preventDefault();
                setShowSaveModal(true);
            }
        });

        return unsubscribe;
    }, [navigation, text, title, files, initialNoteToEdit]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            const hasChanges = text !== initialNoteToEdit?.text ||
                title !== initialNoteToEdit?.title ||
                files.length !== (initialNoteToEdit?.files?.length || 0);

            if (!isNavigating && hasChanges) {
                e.preventDefault();
                setShowSaveModal(true);
            }
        });

        return unsubscribe;
    }, [navigation, text, title, files, initialNoteToEdit, isNavigating]);

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
        }
    };

    const handleExitWithoutSaving = () => {
        setShowSaveModal(false);
        setIsNavigating(true);
        setTimeout(() => {
            navigation.goBack();
        }, 100);
    };

    const handleOutsidePress = () => {
        if (showSaveModal) {
            setShowSaveModal(false);
        }
    };

    const handleBackPress = () => {
        if (text !== noteToEdit?.text ||
            title !== noteToEdit?.title ||
            files.length !== (noteToEdit?.files?.length || 0)) {
                setShowSaveModal(true);
        } else {
            navigation.goBack();
        }
    };
    
    return (
        <SafeAreaView className=" h-full pt-9 bg-white">
            <View className="flex-row items-center">
                <TouchableOpacity className="mx-2" onPress={handleBackPress}>
                    <Image
                        source={require('../images/back.png')}
                        className="w-8 h-8 mt-4"
                    />
                </TouchableOpacity>
                <TextInput
                    className="p-2 mt-2 bg-white text-xl font-bold w-full"
                    placeholder='New Note'
                    onChangeText={(title) => setTitle(title)}
                    value={title}
                    multiline={true}
                />
            </View>
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

            <SaveModal
                visible={showSaveModal}
                onExit={handleExitWithoutSaving}
                onSave={saveNote}
                onClose={handleOutsidePress}
            />
        </SafeAreaView>
    );
};


export default NoteView;