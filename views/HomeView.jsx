import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Image, Pressable, Modal, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import Note from '../components/Note.jsx'
import DeleteModal from '../components/DeleteModal.jsx'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const HomeView = ({ navigation }) => {
    const [notes, setNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [addModalVisible, setAddModalVisible] = useState(false);

    const toggleAddModal = () => {
        setAddModalVisible(!addModalVisible);
    };

    const addNote = (note) => {
        const newNote = { id: Date.now().toString(), text: note.text, files: note.files };
        setNotes((prevNotes) => {
            const updatedNotes = [newNote, ...prevNotes];
            saveNotes(updatedNotes);
            return updatedNotes;
        });
    };

    const updateNote = (updatedNotes) => {
        setNotes(updatedNotes);
        saveNotes(updatedNotes);
    };

    useEffect(() => {
        loadNotes();
    }, []);

    useEffect(() => {
        saveNotes(notes);
    }, [notes]);

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = notes.filter(note =>
            note.text.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredNotes(filtered);
    }, [searchQuery, notes]);

    const loadNotes = async () => {
        try {
            const savedNotes = await AsyncStorage.getItem('notes');
            if (savedNotes !== null) {
                const parsedNotes = JSON.parse(savedNotes);
                const validNotes = parsedNotes.filter(note => note && note.id);
                setNotes(validNotes);
            }
        } catch (error) {
            console.error('', error);
        }
    };

    const saveNotes = async (newNotes) => {
        try {
            await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
        } catch (error) {
            console.error('', error);
        }
    };

    const handleLongPress = (note) => {
        Haptics.selectionAsync();
        setSelectedNote(note);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedNote(null);
    };

    const handleDeleteModal = () => {
        if (selectedNote) {
            setNotes((prevNotes) => {
                const updatedNotes = prevNotes.filter(note => note.id !== selectedNote.id);
                saveNotes(updatedNotes);
                return updatedNotes;
            });
        }
        setModalVisible(false);
    };

    return (
        <SafeAreaView className="pt-10">
            <View>
                <View className="bg-white h-full px-2 w-screen ${notes.length > 1 ? 'items-center' : ''}">
                    <View className="p-2">
                        <TextInput
                            className="border border-[#ddd] rounded-md p-2"
                            placeholder="Search..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <FlatList
                        numColumns={2}
                        data={filteredNotes}
                        keyExtractor={(item) => item.id}
                        columnWrapperStyle={{
                            flex: 1
                        }}
                        renderItem={({ item }) => (
                            <Pressable className="mb-3"
                                onLongPress={() => handleLongPress(item)}
                                onPress={() => navigation.navigate('Note', { addNote, updateNote, noteToEdit: item })}
                            >
                                <View className="flex-1">
                                    <Note note={item}></Note>
                                </View>
                            </Pressable>
                        )}
                    />
                </View>
                <View className="flex-1 justify-end items-end">
                    <TouchableOpacity
                        className="absolute bottom-3 right-3"
                        onPress={toggleAddModal}
                    >
                        <Image
                            source={require('../images/plus.png')}
                            className="w-20 h-20"
                        />
                    </TouchableOpacity>
                    <Modal
                        transparent={true}
                        visible={addModalVisible}
                        animationType="none"
                        onRequestClose={toggleAddModal}
                    >
                        <TouchableOpacity
                            className="flex-1"
                            onPress={toggleAddModal}
                        >
                            <View className="absolute bottom-24 right-3">
                                <TouchableOpacity
                                    className="w-14 h-14"
                                    onPress={() => {
                                        toggleAddModal();
                                        navigation.navigate('Note', { addNote, updateNote });
                                    }}
                                >
                                    <Image
                                        source={require('../images/add-check.png')}
                                        className="w-14 h-14"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="w-14 h-14"
                                    onPress={() => {
                                        toggleAddModal();
                                        navigation.navigate('Note', { addNote, updateNote });
                                    }}
                                >
                                    <Image
                                        source={require('../images/add-note.png')}
                                        className="w-14 h-14"
                                    />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
                <View>
                    <DeleteModal
                        visible={modalVisible}
                        onClose={handleCloseModal}
                        onDelete={handleDeleteModal}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};


export default HomeView;