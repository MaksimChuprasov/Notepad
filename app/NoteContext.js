import React, { createContext, useState } from 'react';

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState([]);

    const addNote = (note) => {
        const newNote = { 
            id: Date.now().toString(), 
            title: note.title, 
            text: note.text, 
            files: note.files,
            tasks: note.tasks, 
        };
        setNotes((prevNotes) => [newNote, ...prevNotes]);
    };

    const updateNote = (updatedNote) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) =>
                note.id === updatedNote.id ? updatedNote : note
            )
        );
    };

    const deleteNotes = (idsToDelete) => {
        setNotes((prevNotes) =>
            prevNotes.filter(note => !idsToDelete.includes(note.id))
        );
    };

    return (
        <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNotes }}>
            {children}
        </NoteContext.Provider>
    );
};

export default NoteContext;