import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, TouchableWithoutFeedback, BackHandler, Modal, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import NoteContext from '../app/NoteContext';
import SaveModal from '../components/SaveModal'
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import Checkbox from 'expo-checkbox';

const NoteView = ({ navigation, route }) => {
    const { addNote, updateNote } = useContext(NoteContext);
    const { noteToEdit: initialNoteToEdit } = route.params || {};
    const { noteToEdit } = route.params || {};
    const [text, setText] = useState(initialNoteToEdit ? initialNoteToEdit.text : '');
    const [title, setTitle] = useState(initialNoteToEdit ? initialNoteToEdit.title : '');
    const [files, setFiles] = useState(initialNoteToEdit ? initialNoteToEdit.files : []);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFileContent, setEditedFileContent] = useState('');
    const [fileUri, setFileUri] = useState('');
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [deleteImageModal, setDeleteImageModal] = useState(false);
    const [collabModal, setCollabModal] = useState(false);
    const [imageToDeleteIndex, setImageToDeleteIndex] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [editingFileIndex, setEditingFileIndex] = useState(-1);
    const [saveButtonLabel, setSaveButtonLabel] = useState('Save File');
    const [Gptimage, setGptImage] = useState(require('../images/Chat_Gpt.png'));

    const [isModalVisible, setModalVisible] = useState(false);

    const [tasks, setTasks] = useState([]); // Храним список задач


    // Функция добавления новой задачи
    const addTask = () => {
        setTasks(prevTasks => [
            ...prevTasks,
            { id: Date.now().toString(), text: '', checked: false }
        ]);
    };

    // Функция обновления текста задачи
    const updateTask = (id, newText) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, text: newText } : task
            )
        );
    };

    // Функция для переключения состояния checkbox
    const toggleCheckbox = (id) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, checked: !task.checked } : task
            )
        );
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const toggleCollabModal = () => {
        setCollabModal(!collabModal);
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
        if (route.params?.noteToEdit) {
            setTitle(route.params.noteToEdit.title || '');
            setText(route.params.noteToEdit.text || '');
            setFiles(route.params.noteToEdit.files || []);
            setTasks(route.params.noteToEdit?.tasks ?? []);
            setShowSaveModal(false);

            setSelectedImages(initialNoteToEdit.files?.map(file => file.uri) || []);
        }
    }, [route.params]);

    const saveNote = () => {
        const updatedNote = {
            id: initialNoteToEdit ? initialNoteToEdit.id : Date.now().toString(),
            title,
            text,
            files: [...files, ...selectedImages.map(uri => ({ uri }))],
            tasks,
        };

        console.log("Saving note:", updatedNote);

        if (initialNoteToEdit) {
            updateNote(updatedNote);
        } else {
            addNote(updatedNote);
        }

        setTitle('');
        setText('');
        setFiles([]);
        setTasks([]);
        setSelectedImages([]);
        setShowSaveModal(false);

        navigation.goBack();
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            const hasChanges =
                text !== initialNoteToEdit?.text ||
                title !== initialNoteToEdit?.title ||
                JSON.stringify(files) !== JSON.stringify(initialNoteToEdit?.files || []) ||
                JSON.stringify(tasks) !== JSON.stringify(initialNoteToEdit?.tasks || []);
            if (hasChanges) {
                e.preventDefault();
                setShowSaveModal(true);
            }
        });

        return unsubscribe;
    }, [navigation, text, title, files, tasks, initialNoteToEdit]);



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

    const confirmDeleteImage = (index) => {
        setImageToDeleteIndex(index);
        setDeleteImageModal(true);
    };

    const handleConfirmDelete = () => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== imageToDeleteIndex));
        setDeleteImageModal(false);
        setImageToDeleteIndex(null);
    };

    const handleCancelDelete = () => {
        setDeleteImageModal(false);
        setImageToDeleteIndex(null);
    };

    const handleExitWithoutSaving = () => {
        setShowSaveModal(false);
        setGptImage(require('../images/Chat_Gpt.png'))
        setIsNavigating(true);

        setTitle('');
        setText('');
        setFiles([]);
        setTasks([]);
        setSelectedImages([]);

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
        if (text !== noteToEdit?.text || title !== noteToEdit?.title || files.length !== (noteToEdit?.files?.length || 0) || tasks.length !== (noteToEdit?.tasks?.length || 0)) {
            setShowSaveModal(true);
        } else {
            setTitle('');
            setText('');
            setFiles([]);
            setTasks([]);
            setSelectedImages([]);
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
            paddingBottom: 50,
        },
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView className=" h-full pt-9 bg-white">
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <TouchableOpacity className="mx-2" onPress={handleBackPress}>
                            <Image
                                source={require('../images/back.png')}
                                className="w-8 h-8 mt-4"
                            />
                        </TouchableOpacity>
                        <TextInput
                            scrollEnabled={true}
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
                    <ScrollView className='flex-1 mb-4' contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
                        <TextInput
                            className="p-2 mt-2 mx-2 bg-white"
                            placeholder='Enter your note...'
                            onChangeText={(text) => setText(text)}
                            value={text}
                            multiline={true}
                        />

                        {/* <View className="px-3">
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
                        </View> */}

                        <View className="pt-4 px-3 w-full">
                            {selectedImages.map((uri, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onLongPress={() => confirmDeleteImage(index)}
                                    delayLongPress={300}
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={{ uri }}
                                        style={{
                                            width: 300,
                                            height: 400,
                                            borderRadius: 8,
                                            marginBottom: 12,
                                        }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Modal
                            transparent={true}
                            visible={deleteImageModal}
                            onRequestClose={handleCancelDelete}
                            animationType="none"
                        >
                            <TouchableWithoutFeedback onPress={handleCancelDelete}>
                                <View className="flex-1 bg-black/60 justify-center items-center">
                                    <TouchableWithoutFeedback>
                                        <View
                                            className="w-[65%] rounded-2xl p-5 items-center bg-gray-200"
                                            style={{
                                                backgroundColor: '#f0f0f0',
                                                borderWidth: 2,
                                                borderColor: 'rgba(100, 120, 180, 0.3)',
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                elevation: 10,
                                            }}
                                        >
                                            <Text className="text-xl font-semibold text-gray-800 mb-3">
                                                Delete this image?
                                            </Text>

                                            <TouchableOpacity
                                                className="w-full border-t border-gray-300 pt-2 mb-1 items-center"
                                                onPress={handleConfirmDelete}
                                            >
                                                <Text className="text-lg text-red-600">Yes, delete</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                className="w-full border-t border-gray-300 pt-2 items-center"
                                                onPress={handleCancelDelete}
                                            >
                                                <Text className="text-lg text-gray-700">Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>
                        {tasks.map((task) => (
                            <View key={task.id} className="flex flex-row items-center gap-3 p-2 bg-white rounded-lg shadow">
                                {/* Чекбокс */}
                                <Pressable
                                    onPress={() => toggleCheckbox(task.id)}
                                    className="w-6 h-6 flex items-center justify-center border border-gray-400 rounded"
                                >
                                    <Text className={task.checked ? 'text-green-600 text-lg' : 'text-gray-500 text-lg'}>
                                        {task.checked ? '✔' : ''}
                                    </Text>
                                </Pressable>

                                {/* Инпут */}
                                <TextInput
                                    multiline={true}
                                    textAlignVertical="top"
                                    value={task.text}
                                    onChangeText={(text) => updateTask(task.id, text)}
                                    placeholder="Enter your task"
                                    className="flex-1 m-1 border-b border-gray-300 bg-white rounded-lg "
                                />
                            </View>
                        ))}

                    </ScrollView>

                    <View className="bg-[#F7F7F7] py-2 px-6 absolute bottom-0 left-0 w-full">
                        <View className="flex-row justify-between">
                            {/* Первая кнопка */}
                            <View className="items-center w-12">
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
                                className="items-center"
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
                                            className="absolute bottom-[75px] left-20 rounded-xl px-2 w-1/2 bg-gray-200 items-left shadow-lg"
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
                                                onPress={addTask}
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
                                                    <Text>Add Voice Message</Text>
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
                            {/* <TouchableOpacity
                                className="bg-white items-center"
                            >
                                <Image
                                    source={require('../images/txtFormate.png')}
                                    className="w-8 h-8"
                                />
                                <Text className="text-[12px]">Formate text</Text>
                            </TouchableOpacity> */}

                            {/* Четвертая кнопка*/}
                            <TouchableOpacity
                                onPress={toggleCollabModal}
                                className="items-center"
                            >
                                <Image
                                    source={require('../images/collaborator.png')}
                                    className="w-8 h-8"
                                />
                                <Text className="text-[12px]">Collaborator</Text>
                            </TouchableOpacity>
                            <Modal
                                animationType="none"
                                transparent={true}
                                visible={collabModal}
                                onRequestClose={toggleCollabModal}
                            >
                                <TouchableWithoutFeedback onPress={toggleCollabModal}>
                                    <View className="flex-1">
                                        {/* модальное окно */}
                                        <View
                                            className="absolute bottom-[75px] right-2 left-2 rounded-xl px-2 bg-gray-200 items-left shadow-lg max-h-40"
                                        >
                                            <TextInput
                                                className="border border-[#ddd] bg-white rounded-md mt-1 p-2 flex-1 h-12"
                                                placeholder="Search your collaborator..."
                                            />
                                            <ScrollView>
                                                <TouchableOpacity
                                                    className="py-2 border-b border-gray-300"
                                                >
                                                    <View className="flex-row">
                                                        <Image
                                                            source={require('../images/collaborator.png')}
                                                            className="w-5 h-5 mr-2"
                                                        />
                                                        <Text>Max</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    className="py-2 border-b border-gray-300"
                                                >
                                                    <View className="flex-row">
                                                        <Image
                                                            source={require('../images/collaborator.png')}
                                                            className="w-5 h-5 mr-2"
                                                        />
                                                        <Text>Max</Text>
                                                    </View>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    className="py-2 border-b border-gray-300"
                                                >
                                                    <View className="flex-row">
                                                        <Image
                                                            source={require('../images/collaborator.png')}
                                                            className="w-5 h-5 mr-2"
                                                        />
                                                        <Text>Max</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    className="py-2 border-b border-gray-300"
                                                >
                                                    <View className="flex-row">
                                                        <Image
                                                            source={require('../images/collaborator.png')}
                                                            className="w-5 h-5 mr-2"
                                                        />
                                                        <Text>Max</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    className="py-2 border-b border-gray-300"
                                                >
                                                    <View className="flex-row">
                                                        <Image
                                                            source={require('../images/collaborator.png')}
                                                            className="w-5 h-5 mr-2"
                                                        />
                                                        <Text>Max</Text>
                                                    </View>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    className="py-2 border-gray-300"
                                                >
                                                    <View className="flex-row">
                                                        <Image
                                                            source={require('../images/collaborator.png')}
                                                            className="w-5 h-5 mr-2"
                                                        />
                                                        <Text>MaxCh</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </ScrollView>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        </View>
                    </View>

                    <SaveModal
                        visible={showSaveModal}
                        onExit={handleExitWithoutSaving}
                        onSave={saveNote}
                        onClose={handleOutsidePress}
                    />
                </View>

            </SafeAreaView >
        </GestureHandlerRootView>
    );
};


export default NoteView;