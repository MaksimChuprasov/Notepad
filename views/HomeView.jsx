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
    const [selectedNote, setSelectedNote] = useState(null);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [selectMode, setSelectMode] = useState(false);

    const addNote = (note) => {
        const newNote = { id: Date.now().toString(), text: note.text, files: note.files };
        setNotes((prevNotes) => {
            const updatedNotes = [newNote, ...prevNotes];
            saveNotes(updatedNotes);
            return updatedNotes;
        });
    };

    const updateNote = (updateFunction) => {
        setNotes((prevNotes) => {
            const updatedNotes = updateFunction(prevNotes);
            if (Array.isArray(updatedNotes)) {
                saveNotes(updatedNotes);
                return updatedNotes;
            } else {
                console.warn('Updated notes data is invalid:', updatedNotes);
                return prevNotes;
            }
        });
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

    useEffect(() => {
        // Check if the selection is empty and turn off select mode if needed
        if (selectMode && selectedNotes.length === 0) {
            setSelectMode(false);
        }
    }, [selectedNotes]);

    const loadNotes = async () => {
        try {
            const savedNotes = await AsyncStorage.getItem('notes');
            if (savedNotes) {
                const parsedNotes = JSON.parse(savedNotes);
                const validNotes = parsedNotes.filter(note => note && note.id);
                setNotes(validNotes);
            } else {
                setNotes([]);
            }
        } catch (error) {
            console.error('Error loading notes:', error);
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
            if (updatedNotes.length === 0) {
                setSelectMode(false); // Exit select mode if there are no more notes
            }
            saveNotes(updatedNotes);
            return updatedNotes;
        });
        setSelectedNotes([]);
    };

    const handleOutsidePress = () => {
        if (selectMode) {
            // Clear selection and exit select mode if there are no selected notes
            setSelectedNotes([]);
            setSelectMode(false);
        }
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
                            onPress={() => {
                                navigation.navigate('Note', { addNote, updateNote });
                            }}
                        >
                            <Image
                                source={require('../images/plus.png')}
                                className="w-20 h-20"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};


export default HomeView;