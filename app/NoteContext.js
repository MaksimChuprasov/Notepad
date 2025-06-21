import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await fetch("http://192.168.1.100/api/v1/notes");
        const apiNotes = await response.json();
        setNotes(apiNotes);
        saveNotesToStorage(apiNotes);
      } catch (error) {
        console.warn("API не доступен, загружаем из хранилища:", error);
        try {
          const storedNotes = await AsyncStorage.getItem("notes");
          if (storedNotes !== null) {
            setNotes(JSON.parse(storedNotes));
          }
        } catch (storageError) {
          console.error("Ошибка загрузки из хранилища:", storageError);
        }
      }
    };

    loadNotes();
  }, []);

  const saveNotesToStorage = async (newNotes) => {
    try {
      await AsyncStorage.setItem("notes", JSON.stringify(newNotes));
    } catch (error) {
      console.error("Ошибка при сохранении заметок:", error);
    }
  };

  const addNote = async (note) => {
    try {
      const response = await fetch("http://192.168.1.100/api/v1/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });

      if (!response.ok) {
        throw new Error("Ошибка при добавлении заметки на сервер");
      }

      const createdNote = await response.json();

      const newNotes = [createdNote, ...notes];
      setNotes(newNotes);
      saveNotesToStorage(newNotes);
    } catch (error) {
      console.error("Ошибка при добавлении заметки:", error);
    }
  };

  const updateNote = async (updatedNote) => {
    try {
      const response = await fetch(
        `http://192.168.1.100/api/v1/notes/${updatedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedNote),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при обновлении заметки на сервере");
      }

      const newNotes = notes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note
      );
      setNotes(newNotes);
      saveNotesToStorage(newNotes);
    } catch (error) {
      console.error("Ошибка при обновлении заметки:", error);
    }
  };


  const deleteNotes = (idsToDelete) => {
    setNotes((prevNotes) =>
      prevNotes.filter((note) => !idsToDelete.includes(note.id))
    );
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNotes }}>
      {children}
    </NoteContext.Provider>
  );
};

export default NoteContext;
