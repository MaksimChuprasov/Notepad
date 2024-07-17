import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Image, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import Note from '../components/Note.jsx'
import DeleteModal from '../components/DeleteModal.jsx'
import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeView = ({ navigation }) => {
    const [notes, setNotes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const addNote = (note) => {
        const newNote = { id: Date.now().toString(), text: note.text, files: note.files };
        setNotes((prevNotes) => {
            const updatedNotes = [...prevNotes, newNote];
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
            
        }
    };

    const handleLongPress = (note) => {
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
        <SafeAreaView>
            <View>
                <View className="bg-white h-full px-2 w-screen ${notes.length > 1 ? 'items-center' : ''}">
                    <FlatList
                        numColumns={2}
                        data={notes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Pressable
                                onLongPress={() => handleLongPress(item)}
                                onPress={() => navigation.navigate('Note', { noteToEdit: item, updateNote })}
                            >
                                <View>
                                    <Note note={item} />
                                    {item.files && item.files.map((file, index) => (
                                        <View key={index} className="p-2">
                                            <Text>{file.name}</Text>
                                            <Text>{file.type}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Pressable>
                        )}
                    />
                </View>
                <TouchableOpacity
                    title='Add Note'
                    onPress={() => navigation.navigate('Note', { addNote })}
                >
                    <Image
                        source={require('../images/plus.png')}
                        className="w-14 h-14 absolute bottom-3 right-3"
                    />
                </TouchableOpacity>
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