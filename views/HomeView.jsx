import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Pressable, Image, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import NoteContext from '../app/NoteContext';
import { useFocusEffect } from '@react-navigation/native';
import Note from '../components/Note';
import { StatusBar } from 'expo-status-bar';

const HomeView = ({ navigation }) => {
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const { notes: contextNotes, addNote, updateNote, deleteNotes } = useContext(NoteContext);

    useEffect(() => {
        setFilteredNotes(contextNotes);
    }, [contextNotes]);

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = contextNotes.filter(note =>
            note.text.toLowerCase().includes(lowercasedQuery) ||
            note.title.toLowerCase().includes(lowercasedQuery) ||
            note.files.some(file =>
                typeof file === 'string' && file.toLowerCase().includes(lowercasedQuery) ||
                file.name && file.name.toLowerCase().includes(lowercasedQuery)
            )
        );
        setFilteredNotes(filtered);
    }, [searchQuery, contextNotes]);

    useFocusEffect(
        React.useCallback(() => {
            setFilteredNotes(contextNotes.filter(note =>
                note.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.files.some(file =>
                    typeof file === 'string' && file.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    file.name && file.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            ));
        }, [contextNotes, searchQuery])
    );

    useEffect(() => {
        if (selectedNotes.length === 0) {
            setSelectMode(false);
        }
    }, [selectedNotes]);

    const handleLongPress = (note) => {
        if (!selectMode) {
            setSelectMode(true);
        }
        if (!selectedNotes.includes(note.id)) {
            setSelectedNotes((prevSelected) => [...prevSelected, note.id]);
        }
    };

    const handlePress = (note) => {
        if (selectMode) {
            if (selectedNotes.includes(note.id)) {
                setSelectedNotes((prevSelected) =>
                    prevSelected.filter(id => id !== note.id)
                );
            } else {
                setSelectedNotes((prevSelected) => [...prevSelected, note.id]);
            }
        } else {
            navigation.navigate('Note', {
                noteToEdit: note
            });
        }
    };

    const handleDeleteSelected = () => {
        deleteNotes(selectedNotes);
        setSelectedNotes([]);
        setSelectMode(false);
    };

    const handleOutsidePress = () => {
        if (selectMode) {
            setSelectedNotes([]);
            setSelectMode(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date)) return '';

        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    

    return (
        <SafeAreaView className="flex-1 pt-9 bg-[#F7F7F7]">
            <StatusBar style="dark" />
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View className="flex-1">
                    <View className="bg-[#F7F7F7] flex-1 px-2">
                        <View className="p-2 flex-row items-center">
                            <TextInput
                                className="border border-[#ddd] bg-white rounded-md p-2 flex-1"
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
                            data={filteredNotes}
                            numColumns={2}
                            keyExtractor={(item) => item.id}
                            columnWrapperStyle="justify-between px-4 mb-4"
                            renderItem={({ item }) => (
                                <Pressable
                                    onLongPress={() => handleLongPress(item)}
                                    onPress={() => handlePress(item)}
                                    className="flex-1 mx-1"
                                >
                                    <Note
                                        note={item}
                                        isSelected={selectedNotes.includes(item.id)}
                                        formattedDate={formatDate(item.date)}
                                    />
                                </Pressable>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

export default HomeView;