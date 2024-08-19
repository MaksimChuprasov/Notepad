import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Image, Pressable, Modal, TextInput, Button, TouchableWithoutFeedback } from 'react-native'
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
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [selectMode, setSelectMode] = useState(false);

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
        setSelectMode(true);
        setSelectedNotes((prevSelected) => [...prevSelected, note.id]);
    };

    const handlePress = (note) => {
        if (selectMode) {
            setSelectedNotes((prevSelected) =>
                prevSelected.includes(note.id)
                    ? prevSelected.filter(id => id !== note.id)
                    : [...prevSelected, note.id]
            );
        } else {
            navigation.navigate('Note', { addNote, updateNote, noteToEdit: note });
        }
    };

    const handleDeleteSelected = () => {
        setNotes((prevNotes) => {
            const updatedNotes = prevNotes.filter(note => !selectedNotes.includes(note.id));
            saveNotes(updatedNotes);
            return updatedNotes;
        });
        setSelectedNotes([]);
    };



    const handleOutsidePress = () => {
        setSelectedNotes([]);
        setSelectMode(false);
    };

    return (
        <SafeAreaView className="pt-10">
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View>
                    <View className="bg-white h-full px-2 w-screen ${notes.length > 1 ? 'items-center' : ''}">
                        <View className="p-2 flex-row items-center">
                            <TextInput
                                className="border border-[#ddd] rounded-md p-2 flex-1"
                                placeholder="Search..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {selectedNotes.length > 0 && (
                                <TouchableOpacity
                                    onPress={handleDeleteSelected}
                                    className="ml-2"
                                >
                                    <Image
                                        source={require('../images/bin.png')}
                                        className="w-10 h-10"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        <FlatList
                            numColumns={2}
                            data={filteredNotes}
                            keyExtractor={(item) => item.id}
                            columnWrapperStyle={{
                                flex: 1
                            }}
                            renderItem={({ item }) => (
                                <Pressable
                                    className={`mb-3`}
                                    onLongPress={() => handleLongPress(item)}
                                    onPress={() => handlePress(item)}
                                >
                                    <View className="flex-1">
                                        <Note style={{
                                            backgroundColor: selectedNotes.includes(item.id) ? '#e6e6e6' : 'white',
                                            borderColor: selectedNotes.includes(item.id) ? '#8A2BE2' : '#d1d1d1',
                                            borderWidth: selectedNotes.includes(item.id) ? 2 : 1
                                        }} note={item} />
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
                                            navigation.navigate('Check', { addNote, updateNote });
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
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};


export default HomeView;