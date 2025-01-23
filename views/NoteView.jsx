import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, TouchableWithoutFeedback, BackHandler, Modal, ScrollView, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import NoteContext from '../app/NoteContext';
import SaveModal from '../components/SaveModal'
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';

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
    const [Gptimage, setGptImage] = useState(require('../images/Chat_Gpt.png'));

    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const toggleImage = () => {
        setGptImage((prevImage) =>
            prevImage === require('../images/Chat_Gpt.png')
                ? require('../images/Chat_Gpt_On.png')
                : require('../images/Chat_Gpt.png')
        );
    };

    const isFocused = useIsFocused();

    useEffect(() => {
        if (initialNoteToEdit) {
            setTitle(initialNoteToEdit.title || '');
            setText(initialNoteToEdit.text || '');
            setFiles(initialNoteToEdit.files || []);
            setGptImage(require('../images/Chat_Gpt.png'))
        }
    }, [initialNoteToEdit]);

    const saveNote = () => {
        const updatedNote = {
            id: initialNoteToEdit ? initialNoteToEdit.id : Date.now().toString(),
            title,
            text,
            files
        };

        if (initialNoteToEdit) {
            updateNote(updatedNote);
        } else {
            addNote(updatedNote);
        }

        setTitle('');
        setText('');
        setFiles([]);

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
        setGptImage(Gptimage);
        try {
            const fileContent = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.UTF8,
            });
            setEditedFileContent(fileContent);
        } catch (err) {
            console.error('Error opening file:', err);
        }
    };

    const deleteFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleExitWithoutSaving = () => {
        setShowSaveModal(false);
        setGptImage(require('../images/Chat_Gpt.png'))
        setIsNavigating(true);

        setTitle('');
        setText('');
        setFiles([]);

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
        if (text !== noteToEdit?.text || title !== noteToEdit?.title || files.length !== (noteToEdit?.files?.length || 0)) {
            setShowSaveModal(true);
        } else {
            setTitle('');
            setText('');
            setFiles([]);
            navigation.goBack();
        }
    };

    useEffect(() => {
        const backAction = () => {
            handleBackPress();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [text, title, files, noteToEdit]);

    const handleSwipe = (event) => {
        if (event.nativeEvent.translationX < -100) {
            handleBackPress();
        }
    }

    const [selectedImages, setSelectedImages] = useState([]);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);

    const addPhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedImages([...selectedImages, result.assets[0].uri]);
            }
        } catch (error) {
            console.error("Error selecting photo:", error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
        },
        scrollViewContent: {
           
        },
    });

    return (
        <SafeAreaView className=" h-full pt-9 bg-white">
            <PanGestureHandler onGestureEvent={handleSwipe}>
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <TouchableOpacity className="mx-2" onPress={handleBackPress}>
                            <Image
                                source={require('../images/back.png')}
                                className="w-8 h-8 mt-4"
                            />
                        </TouchableOpacity>
                        <TextInput
                            className="p-2 mt-2 bg-white text-xl font-bold w-2/3"
                            placeholder='New Note'
                            onChangeText={(title) => setTitle(title)}
                            value={title}
                            multiline={true}
                        />
                        <TouchableOpacity className="mx-2" onPress={toggleImage}>
                            <Image
                                source={Gptimage}
                                className="w-8 h-8 mt-4"
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
                                        onLongPress={() => deleteFile(index)}
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

                        <View className='pt-4 px-3 w-full'>
                            {selectedImages.map((uri, index) => (
                                <Image
                                    key={index}
                                    source={{ uri }}
                                    style={{
                                        width: 300,
                                        height: 400,
                                        borderRadius: 8,
                                        marginBottom: 12,
                                    }}
                                />
                            ))}
                        </View>
                    </ScrollView>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isImageModalVisible}
                        onRequestClose={() => setIsImageModalVisible(false)}
                    >
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}
                        >
                            <View
                                style={{
                                    width: '80%',
                                    backgroundColor: 'white',
                                    borderRadius: 8,
                                    padding: 16,
                                }}
                            >
                                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                                    Choose an Option
                                </Text>

                                <TouchableOpacity
                                    style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: 'gray' }}
                                    onPress={() => addPhoto(false)} // Для галереи
                                >
                                    <Text style={{ fontSize: 16 }}>Choose from Gallery</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: 'gray' }}
                                    onPress={() => addPhoto(true)} // Для камеры
                                >
                                    <Text style={{ fontSize: 16 }}>Take a Photo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        padding: 12,
                                        marginTop: 8,
                                        alignItems: 'center',
                                    }}
                                    onPress={() => setIsImageModalVisible(false)}
                                >
                                    <Text style={{ fontSize: 16, color: '#007AFF' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <View className="bg-white py-2 px-6 absolute bottom-0 left-0 w-full">
                        <View className="flex-row justify-between">
                            {/* Первая кнопка */}
                            <View className="bg-white items-center w-12">
                                {editingFileIndex !== -1 && (
                                    <TouchableOpacity
                                        className="flex items-center rounded-xl"
                                        onPress={saveEditedFile}
                                    >
                                        <Image
                                            source={require('../images/save-file.png')}
                                            className="w-8 h-8"
                                        />
                                        <Text className="text-[12px]">Save File</Text>
                                    </TouchableOpacity>
                                )}
                                {editingFileIndex === -1 && (
                                    <TouchableOpacity
                                        className="flex items-center rounded-xl"
                                        onPress={selectFiles}
                                    >
                                        <Image
                                            source={require('../images/add-file.png')}
                                            className="w-8 h-8"
                                        />
                                        <Text className="text-[12px]">Add File</Text>
                                    </TouchableOpacity>
                                )}

                            </View>

                            {/* Вторая кнопка */}
                            <TouchableOpacity
                                className="bg-white items-center"
                                onPress={toggleModal}
                            >
                                <Image
                                    source={require('../images/plus.png')}
                                    className="w-8 h-8"
                                />
                                <Text className="text-[12px]">Add</Text>
                            </TouchableOpacity>

                            <Modal
                                animationType="none"
                                transparent={true}
                                visible={isModalVisible}
                                onRequestClose={toggleModal}
                            >
                                <TouchableWithoutFeedback onPress={toggleModal}>
                                    <View className="flex-1">
                                        {/* модальное окно */}
                                        <View
                                            className="absolute bottom-[75px] left-16 rounded-xl px-2 w-1/2 bg-gray-200 items-left shadow-lg"
                                        >
                                            <TouchableOpacity
                                                className="py-2 border-b border-gray-300"
                                                onPress={addPhoto}
                                            >
                                                <View className="flex-row">
                                                    <Image
                                                        source={require('../images/images.png')}
                                                        className="w-5 h-5 mr-2"
                                                    />
                                                    <Text>Add Photo</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                className="py-2 border-b border-gray-300"
                                                onPress={() => { /* Add photo logic */ }}
                                            >
                                                <View className="flex-row">
                                                    <Image
                                                        source={require('../images/tasks.png')}
                                                        className="w-5 h-5 mr-2"
                                                    />
                                                    <Text>Add Tasks</Text>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                className="py-2 border-b border-gray-300"
                                                onPress={() => { /* Add photo logic */ }}
                                            >
                                                <View className="flex-row">
                                                    <Image
                                                        source={require('../images/microphone.png')}
                                                        className="w-5 h-5 mr-2"
                                                    />
                                                    <Text>Add Voise Message</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                className="py-2 border-gray-300"
                                                onPress={() => { /* Add photo logic */ }}
                                            >
                                                <View className="flex-row">
                                                    <Image
                                                        source={require('../images/location.png')}
                                                        className="w-5 h-5 mr-2"
                                                    />
                                                    <Text>Add Location</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>


                            {/* Третья кнопка */}
                            <TouchableOpacity
                                className="bg-white items-center"
                            >
                                <Image
                                    source={require('../images/txtFormate.png')}
                                    className="w-8 h-8"
                                />
                                <Text className="text-[12px]">Formate text</Text>
                            </TouchableOpacity>

                            {/* Четвертая кнопка*/}
                            <TouchableOpacity
                                className="bg-white items-center"
                            >
                                <Image
                                    source={require('../images/collaborator.png')}
                                    className="w-8 h-8"
                                />
                                <Text className="text-[12px]">Collabolator</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <SaveModal
                        visible={showSaveModal}
                        onExit={handleExitWithoutSaving}
                        onSave={saveNote}
                        onClose={handleOutsidePress}
                    />
                </View>

            </PanGestureHandler>
        </SafeAreaView >
    );
};


export default NoteView;