import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Note from '../components/Note.jsx'
import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeView = ({ navigation }) => {

    const [notes, setNotes] = useState([]);

    const addNote = (note) => {
        const newNote = { id: Date.now().toString(), text: note };
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        saveNotes(updatedNotes);
    }

    useEffect(() => {
        loadnotes();
    }, [])

    const loadnotes = async () => {
        try {
            const savedNotes = await AsyncStorage.getItem('notes');
            if (savedNotes !== null) {
                const parsedNotes = JSON.parse(savedNotes);
                const validNotes = parsedNotes.filter(note => note && note.id);
                setNotes(validNotes);
            }
        } catch (error) {
            console.error('Failed to load notes.', error);
        }
    }


    const saveNotes = async (newNotes) => {
        try {
            await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
        } catch (error) {
            console.error('Failed to save notes.', error);
        }
    };
    const numColumns = notes.length > 1 ? 2 : 1;

    return (
        <SafeAreaView>
            <View className="bg-white h-full px-2 w-screen items-center">
                <FlatList
                    key={`flatlist-${numColumns}`}
                    numColumns={numColumns}
                    data={notes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <Note note={item} />}
                />
                <TouchableOpacity className="rounded-2xl w-20 h-20 justify-center bg-black items-center absolute bottom-2 right-2" title='Add Note' onPress={() => navigation.navigate('Note', { addNote })} >
                    <Image
                        source={require('../images/document-svgrepo-com.png')}
                        className="w-16 h-16"
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default HomeView;