import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Image, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import NoteContext from '../app/NoteContext';
import { useFocusEffect } from '@react-navigation/native';
import HiddenNotesModal from "../components/HiddenNotesModal"
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import SwipeableNote from '../components/SwipeableNote';
import { FlatList } from 'react-native-gesture-handler';

const HomeView = ({ navigation }) => {
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const { notes: contextNotes = [], notes, loadNotes, updateNote, deleteNotes, setNotes } = useContext(NoteContext);
    const { t } = useTranslation();
    const scrollRef = useRef(null);
    const [showHidden, setShowHidden] = useState(false);

    const refreshPage = () => {
        loadNotes();
    };

    useFocusEffect(
        useCallback(() => {
            refreshPage();
        }, [])
    );

    useEffect(() => {
        setFilteredNotes(contextNotes);
    }, [contextNotes]);

    const filterNotes = (notes = [], query) => {
        const lowercasedQuery = query.toLowerCase();
        return notes.filter(note =>
            (note.text || '').toLowerCase().includes(lowercasedQuery) ||
            (note.title || '').toLowerCase().includes(lowercasedQuery)
        );
    };

    useEffect(() => {
        if (Array.isArray(contextNotes)) {
            const filtered = filterNotes(contextNotes, searchQuery);
            const sorted = filtered.slice().sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });

            setFilteredNotes(sorted);
        } else {
            setFilteredNotes([]);
        }
    }, [searchQuery, contextNotes]);

    useFocusEffect(
        React.useCallback(() => {
            if (Array.isArray(contextNotes)) {
                const filtered = filterNotes(contextNotes, searchQuery);
                const sorted = filtered.slice().sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                });
                setFilteredNotes(sorted);
            }
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

    return (
        <SafeAreaView className="flex-1 pt-9 bg-[#F7F7F7]">
            <StatusBar style="dark" />

            <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View>
                    <View className="p-2 flex-row items-center">
                        <TextInput
                            className="border border-[#ddd] bg-white rounded-md p-2 flex-1"
                            placeholder={t('Search...')}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {selectedNotes.length > 0 && (
                            <TouchableOpacity onPress={handleDeleteSelected} className="ml-2">
                                <Image source={require('../images/bin.png')} className="w-8 h-8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>

            <View className="flex-1 bg-[#F7F7F7] px-2">
                <FlatList
                    ref={scrollRef}
                    data={filteredNotes.filter(note => !note.hidden)}
                    extraData={selectedNotes}
                    numColumns={2}
                    keyExtractor={(item, index) => String(item?.id ?? index)}
                    columnWrapperStyle={{
                        gap: 6,
                        paddingHorizontal: 4,
                    }}
                    renderItem={({ item }) => (
                        <SwipeableNote
                            scrollRef={scrollRef}
                            note={item}
                            onPress={() => handlePress(item)}
                            onLongPress={() => handleLongPress(item)}
                            isSelected={selectedNotes.includes(item.id)}
                            onSwipe={(id) => {
                                const noteToUpdate = notes.find(n => n.id === id);
                                if (!noteToUpdate) return;

                                const updatedNote = { ...noteToUpdate, hidden: true };
                                updateNote(updatedNote);
                            }}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <TouchableOpacity
                onPress={() => setShowHidden(true)}
                className="absolute bottom-20 right-4 w-14 h-14 bg-white rounded-full shadow-lg items-center justify-center border border-gray-400"
                activeOpacity={0.7}
            >
                <Image
                    source={require('../images/hidden.png')}
                    className="w-10 h-10"
                    resizeMode="contain"
                />
            </TouchableOpacity>

            <HiddenNotesModal
                visible={showHidden}
                onClose={() => setShowHidden(false)}
                hiddenNotes={notes.filter(note => note.hidden)}
                onRestore={(selectedIds) => {
                    const normalizedIds = selectedIds.map(String);

                    setNotes(prev => {
                        const updatedNotes = prev.map(note =>
                            normalizedIds.includes(String(note.id))
                                ? { ...note, hidden: false }
                                : note
                        );

                        updatedNotes.forEach(note => {
                            if (normalizedIds.includes(String(note.id))) {
                                updateNote(note, false);
                            }
                        });

                        return updatedNotes;
                    });
                }}

            />

            <TouchableOpacity
                onPress={refreshPage}
                className="absolute bottom-4 right-4 w-14 h-14 bg-white rounded-full shadow-lg items-center justify-center border border-gray-400"
                activeOpacity={0.7}
            >
                <Image
                    source={require('../images/refresh.png')}
                    className="w-8 h-8"
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </SafeAreaView>

    );
};

export default HomeView;