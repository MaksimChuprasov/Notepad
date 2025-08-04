import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, SafeAreaView, TouchableWithoutFeedback, BackHandler, Modal, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import NoteContext from '../app/NoteContext';
import SaveModal from '../components/SaveModal'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import TitleInput from '../components/TitleInput.jsx'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const NoteView = ({ navigation, route }) => {
    const { StorageAccessFramework } = FileSystem;
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
    const [isFilePickerVisible, setFilePickerVisible] = useState(false);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [deleteFileModalVisible, setDeleteFileModalVisible] = useState(false);
    const [fileToDeleteIndex, setFileToDeleteIndex] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [lastSavedNote, setLastSavedNote] = useState(null);
    const [titleError, setTitleError] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [searchCollaborator, setSearchCollaborator] = useState('');
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);
    const { t } = useTranslation();

    const insets = useSafeAreaInsets();

    const { groups } = useContext(NoteContext);

    const handleGroupSelect = (groupId) => {
        setSelectedGroupIds(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    // Function to add a new task
    const addTask = () => {
        setTasks(prevTasks => [
            ...prevTasks,
            { id: Date.now().toString(), text: '', checked: false }
        ]);
    };

    // Task text update function
    const updateTask = (id, newText) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, text: newText } : task
            )
        );
    };

    // Function to toggle the state of a checkbox
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

    const isFocused = useIsFocused();

    // When loading a note
    useEffect(() => {
        if (route.params?.noteToEdit) {
            const note = route.params.noteToEdit;
            setTitle(note.title || '');
            setText(note.text || '');
            setTasks(note.tasks || []);
            setFiles(note.files || []);
            setSelectedImages((note.images || []).map(img => img.uri));
            setSelectedGroupIds(note.selectedGroupIds || []);
            setLastSavedNote({
                id: note.id,
                title: note.title || '',
                text: note.text || '',
                selectedGroupIds: note.selectedGroupIds || [],
                files: note.files || [],
                tasks: note.tasks || [],
                images: note.images || [],
                createdAt: initialNoteToEdit?.createdAt || new Date().toISOString(),
            });
        }
    }, [route.params]);

    const saveNote = () => {
        if (!title.trim()) {
            setTitleError(t('Title is required'));
            return;
        }

        setTitleError('');

        const updatedNote = {
            id: initialNoteToEdit ? initialNoteToEdit.id : Date.now().toString(),
            title,
            text,
            selectedGroupIds,
            /* files, */
            tasks,
            createdAt: initialNoteToEdit?.createdAt || new Date().toISOString(),
            /* images: selectedImages.map(uri => ({
                uri,
                name: getFileNameFromUri(uri),
            })), */
        };

        if (initialNoteToEdit) {
            updateNote(updatedNote);
        } else {
            addNote(updatedNote);
        }

        setIsSaved(true);
        setLastSavedNote(updatedNote);
        clearEditorAndExit();
    };

    const saveNoteModal = () => {
        saveNote();
        clearEditorAndExit();
    }

    const checkIfNoteChanged = () => {
        if (!lastSavedNote) return true;

        const imagesFromSaved = (lastSavedNote.images || []).map(img => img.uri);

        return (
            text !== lastSavedNote.text ||
            title !== lastSavedNote.title ||
            JSON.stringify(selectedGroupIds) !== JSON.stringify(lastSavedNote.selectedGroupIds || []) ||
            JSON.stringify(files) !== JSON.stringify(lastSavedNote.files || []) ||
            JSON.stringify(tasks) !== JSON.stringify(lastSavedNote.tasks || []) ||
            JSON.stringify(selectedImages) !== JSON.stringify(imagesFromSaved)
        );
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (checkIfNoteChanged()) {
                e.preventDefault();
                setShowSaveModal(true);
            }
        });

        return unsubscribe;
    }, [navigation, text, title, files, tasks, selectedImages, selectedGroupIds]);

    useEffect(() => {
        const changed = checkIfNoteChanged();
        setIsSaved(!changed);
    }, [text, title, files, tasks, selectedImages, lastSavedNote, selectedGroupIds]);

    const clearEditorAndExit = (goBack = true) => {
        setTitle('');
        setText('');
        setFiles([]);
        setTasks([]);
        setSelectedImages([]);
        setEditingFileIndex(-1);
        setShowSaveModal(false);
        setIsSaved(false);
        setTitleError('');
        setSelectedGroupIds([]);

        if (goBack) {
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.navigate('Home');
            }
        }
    };

    const handleExitWithoutSaving = () => {
        setShowSaveModal(false);
        clearEditorAndExit(true);
    };

    // Outside press function
    const handleOutsidePress = () => {
        if (showSaveModal) {
            setShowSaveModal(false);
        }
        setEditingFileIndex(null);
    };

    // Back press function
    const handleBackPress = () => {
        if (checkIfNoteChanged()) {
            setShowSaveModal(true);
        } else {
            clearEditorAndExit();
        }
    };

    // Function to handle back action on phone
    useEffect(() => {
        if (!isFocused) return;

        const backAction = () => {
            handleBackPress();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [isFocused, text, title, files, noteToEdit, selectedGroupIds]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
        },
        scrollViewContent: {
            paddingBottom: 50,
        },
    });


    /* Functions for files and photos */

    /*
       const getFileNameFromUri = (uri) => {
         try {
             const parts = uri.split('/');
             return parts[parts.length - 1];
         } catch {
             return 'image.jpg';
         }
     }; 
    
    const decodeFileNameFromUri = (uri) => {
         try {
             const parts = uri.split('document/');
             if (parts.length < 2) return 'unknown';
             const encodedPath = parts[1];
             const decodedPath = decodeURIComponent(encodedPath);
             const fileName = decodedPath.substring(decodedPath.lastIndexOf('/') + 1);
             return fileName;
         } catch {
             return 'unknown';
         }
     }; */

    /*  const selectFiles = async () => {
         try {
             const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
 
             if (!permission.granted) {
                 return;
             }
 
             const dirUri = permission.directoryUri;
             let filesList = await FileSystem.StorageAccessFramework.readDirectoryAsync(dirUri);
 
             const filtered = [];
             for (const fileUriItem of filesList) {
                 const info = await FileSystem.getInfoAsync(fileUriItem);
                 if (!info.exists) continue;
 
                 const fileName = decodeFileNameFromUri(fileUriItem);
 
                 if (
                     fileName.startsWith('._') ||
                     fileName.startsWith('.~') ||
                     fileName.toLowerCase().includes('trash') ||
                     fileName.toLowerCase().includes('recycle')
                 ) continue;
 
                 filtered.push({ uri: fileUriItem, name: fileName });
             }
 
             if (filtered.length === 0) {
                 return;
             }
 
             setFilteredFiles(filtered);
             setFilePickerVisible(true);
         } catch (err) {
             console.error('Error while selecting folder:', err);
         }
     };
 
     const saveEditedFile = async () => {
         if (!fileUri || !editedFileContent) return;
 
         try {
             await StorageAccessFramework.writeAsStringAsync(fileUri, editedFileContent, {
                 encoding: FileSystem.EncodingType.UTF8,
             });
             setEditingFileIndex(-1);
             setIsEditing(false);
             setSaveButtonLabel('Save File');
             setFileUri('');
             setEditedFileContent('');
         } catch {
             Alert.alert("Error", "Failed to save file");
         }
     };
 
     const openFile = async (uri, index) => {
         try {
             const content = await StorageAccessFramework.readAsStringAsync(uri);
             setFileUri(uri);
             setEditedFileContent(content);
             setEditingFileIndex(index);
             setIsEditing(true);
             setSaveButtonLabel('Save Changes');
         } catch {
             Alert.alert("Error", "Couldn`t open this file");
         }
     };
 
     const handleFilePress = (index, uri) => {
         if (editingFileIndex === index) {
             setEditingFileIndex(-1);
         } else {
             openFile(uri, index);
             setEditingFileIndex(index);
         }
     };
 
     const requestFileDelete = (index) => {
         setFileToDeleteIndex(index);
         setDeleteFileModalVisible(true);
     };
 
     const cancelFileDelete = () => {
         setDeleteFileModalVisible(false);
         setFileToDeleteIndex(null);
     };
 
     const confirmFileDelete = () => {
         setFiles((prev) => prev.filter((_, i) => i !== fileToDeleteIndex));
 
         if (editingFileIndex === fileToDeleteIndex) {
             setEditingFileIndex(-1);
             setIsEditing(false);
             setFileUri('');
             setEditedFileContent('');
             setSaveButtonLabel('Save File');
         } else if (editingFileIndex > fileToDeleteIndex) {
             setEditingFileIndex((prev) => prev - 1);
         }
 
         setDeleteFileModalVisible(false);
         setFileToDeleteIndex(null);
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
  }; */

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{
                paddingTop: insets.top,
            }} className=" h-full bg-white">
                <View className="flex-1">
                    <View>
                        <View className="flex-row items-center">
                            <TouchableOpacity className="mx-2" onPress={handleBackPress}>
                                <Image
                                    source={require('../images/back.png')}
                                    className="w-8 h-8 mt-4"
                                />
                            </TouchableOpacity>

                            <TitleInput className="w-full"
                                value={title}
                                onChangeText={(text) => {
                                    setTitle(text);
                                    if (text.trim()) setTitleError('');
                                }}
                                errorMessage={titleError}
                            />

                            <TouchableOpacity className="mx-2" onPress={saveNote}>
                                <Image
                                    source={require('../images/saveBtn.png')}
                                    className="w-8 h-8 mt-4"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Выбранные группы */}
                        {selectedGroupIds.length > 0 && (
                            <View className="mt-2 px-4">
                                <Text className="text-gray-600 mb-1">{t('Shared with groups')}</Text>
                                {groups
                                    .filter(group => selectedGroupIds.includes(group.id))
                                    .map(group => (
                                        <View key={group.id} className="flex-row items-center bg-white rounded-xl px-3 py-2 mb-2 border border-gray-200 shadow-sm">
                                            <Image
                                                source={require('../images/group-check.png')}
                                                className="w-4 h-4 mr-2"
                                            />
                                            <Text className='pr-4' numberOfLines={1} ellipsizeMode="tail">{group.name}</Text>
                                        </View>
                                    ))}
                            </View>
                        )}
                    </View>
                    <ScrollView className='flex-1 mb-4' contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">


                        {/* <View className="px-3 mb-2">
                            {files.map((file, index) => (
                                <View
                                    key={index}
                                    className="mb-2 bg-white rounded-xl shadow-md p-4 border border-gray-200"
                                >
                                    <TouchableOpacity
                                        className="flex-row items-center justify-between"
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleFilePress(index, file.uri);
                                        }}
                                        onLongPress={() => requestFileDelete(index)}
                                    >
                                        <Text className="text-blue-600 font-semibold text-base truncate max-w-[70%]">
                                            {file.name}
                                        </Text>
                                        <Text className="text-gray-400 text-sm italic">Tap to open</Text>
                                    </TouchableOpacity>

                                    {editingFileIndex === index && (
                                        <TextInput
                                            className="mt-3 border border-blue-200 rounded-lg p-3 text-gray-700 bg-[#F7F7F7]"
                                            onChangeText={(content) => setEditedFileContent(content)}
                                            placeholder="Change your file..."
                                            value={editedFileContent}
                                            multiline={true}
                                            textAlignVertical="top"
                                        />
                                    )}
                                </View>
                            ))}
                        </View> */}
                        {/* <Modal
                            transparent={true}
                            visible={deleteFileModalVisible}
                            onRequestClose={cancelFileDelete}
                            animationType="none"
                        >
                            <TouchableWithoutFeedback onPress={cancelFileDelete}>
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
                                                Delete this file?
                                            </Text>

                                            <TouchableOpacity
                                                className="w-full border-t border-gray-300 pt-2 mb-1 items-center"
                                                onPress={confirmFileDelete}
                                            >
                                                <Text className="text-lg text-red-600">Yes, delete</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                className="w-full border-t border-gray-300 pt-2 items-center"
                                                onPress={cancelFileDelete}
                                            >
                                                <Text className="text-lg text-gray-700">Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal> */}

                        {tasks.map((task) => (
                            <View
                                key={task.id}
                                className="flex-row items-center bg-white rounded-xl px-3 py-2 mb-2 mx-3 border border-gray-200 shadow-sm"
                            >
                                {/* Чекбокс */}
                                <Pressable
                                    onPress={() => toggleCheckbox(task.id)}
                                    className={`w-5 h-5 rounded-full border-2 mr-3 ${task.checked ? 'border-green-500 bg-green-500' : 'border-gray-400'
                                        } items-center justify-center`}
                                >
                                    {task.checked && <Text className="text-white text-xs">✔</Text>}
                                </Pressable>

                                {/* Текст задачи */}
                                <TextInput
                                    multiline
                                    textAlignVertical="center"
                                    value={task.text}
                                    onChangeText={(text) => updateTask(task.id, text)}
                                    placeholder={t("Enter your task")}
                                    placeholderTextColor="#9ca3af"
                                    className={`flex-1 text-[15px] text-gray-800 py-1 ${task.checked ? 'line-through text-gray-400' : ''
                                        }`}
                                    style={{ minHeight: 30 }}
                                />
                            </View>
                        ))}

                        <TextInput
                            className="p-4 my-2 mx-3 bg-gray-50 rounded-xl shadow-md text-gray-900 text-base"
                            placeholder={t("Enter your note...")}
                            onChangeText={text => setText(text)}
                            value={text}
                            multiline={true}
                            textAlignVertical="top"
                        />

                        {/* <View className="pt-4 px-3 w-full">
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
                        </View> */}
                        {/* <Modal
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
                        </Modal> */}


                    </ScrollView>

                    <View className="bg-[#F7F7F7] py-2 px-6 absolute bottom-0 left-0 w-full">
                        <View className="flex-row">
                            {/* Первая кнопка */}
                            {/* <View className="items-center w-12">
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

                            </View> */}

                            {/* Вторая кнопка */}
                            <TouchableOpacity
                                className="items-center mr-8"
                                onPress={addTask}
                            >
                                <Image
                                    source={require('../images/tasks.png')}
                                    className="w-8 h-8"
                                />
                                <Text className="text-[12px]">{t('Add Task')}</Text>
                            </TouchableOpacity>

                            {/* <Modal
                                animationType="none"
                                transparent={true}
                                visible={isModalVisible}
                                onRequestClose={toggleModal}
                            >
                                <TouchableWithoutFeedback onPress={toggleModal}>
                                    <View className="flex-1">
                                         модальное окно 
                                        <View
                                            className="absolute bottom-[75px] left-6 rounded-xl px-2 w-1/2 bg-gray-200 items-left shadow-lg"
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
                                                onPress={() => {  }}
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
                                                onPress={() => { }}
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
                            </Modal> */}


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
                                <Text className="text-[12px]">{t('Groups')}</Text>
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
                                                value={searchCollaborator}
                                                onChangeText={setSearchCollaborator}
                                                className="border border-[#ddd] bg-white rounded-md mt-1 p-2 flex-1 h-10 max-h-10"
                                                placeholder="Search your group..."
                                            />

                                            <ScrollView>
                                                {groups.map((group, id) => {
                                                    const isLast = id === groups.length - 1;
                                                    const isSelected = selectedGroupIds.includes(group.id);

                                                    return (
                                                        <TouchableOpacity
                                                            key={group.id}
                                                            className={`py-2 ${!isLast ? 'border-b border-gray-300' : ''}`}
                                                            onPress={() => handleGroupSelect(group.id)}

                                                        >
                                                            <View className="flex-row">
                                                                <Image
                                                                    source={
                                                                        isSelected
                                                                            ? require('../images/group-check.png')
                                                                            : require('../images/add-group.png')
                                                                    }
                                                                    className="w-5 h-5 mr-2"
                                                                />
                                                                <Text>{group.name}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}

                                                {groups.length === 0 && (
                                                    <View className="p-4 items-center">
                                                        <Text className="text-gray-500">No groups found</Text>
                                                    </View>
                                                )}
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
                        onSave={saveNoteModal}
                        onClose={handleOutsidePress}
                    />
                    {/* <Modal
                        visible={isFilePickerVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setFilePickerVisible(false)}
                    >
                        <View className="flex-1 bg-black bg-opacity-60 justify-center px-6">
                            <View className="bg-white rounded-xl max-h-[80%] p-6 shadow-lg">
                                <Text className="text-xl font-semibold mb-5 text-center text-gray-800">
                                    Choose your file
                                </Text>

                                <FlatList
                                    data={filteredFiles}
                                    keyExtractor={(item) => item.uri}
                                    className="mb-4"
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={async () => {
                                                try {
                                                    const content = await FileSystem.StorageAccessFramework.readAsStringAsync(item.uri);
                                                    setFiles(prev => [...prev, { name: item.name, uri: item.uri }]);
                                                    setFileUri(item.uri);
                                                    setEditedFileContent(content);
                                                    setIsEditing(true);
                                                    setSaveButtonLabel('Save File');
                                                    setFilePickerVisible(false);
                                                } catch (err) {
                                                    console.error('Ошибка при чтении файла:', err);
                                                    Alert.alert('Ошибка', 'Не удалось прочитать файл');
                                                }
                                            }}
                                            className="py-3 border-b border-gray-300"
                                        >
                                            <Text className="text-base text-gray-700">{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                    showsVerticalScrollIndicator={false}
                                />

                                <TouchableOpacity
                                    onPress={() => setFilePickerVisible(false)}
                                    activeOpacity={0.8}
                                    className="bg-blue-600 rounded-lg py-3"
                                >
                                    <Text className="text-white font-semibold text-center text-lg">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal> */}

                </View>

            </View >
        </GestureHandlerRootView >
    );
};


export default NoteView;