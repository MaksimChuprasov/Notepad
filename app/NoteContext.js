import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await AsyncStorage.getItem("userToken");
      setToken(savedToken);
    };

    loadToken();
  }, []);

  const updateToken = (newToken) => {
    setToken(newToken);
  };

  useEffect(() => {
    if (!token) return;

    const loadNotes = async () => {
      try {
        const response = await fetch("http://192.168.1.100/api/v1/notes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Ошибка при загрузке заметок");

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
  }, [token]);

  const saveNotesToStorage = async (newNotes) => {
    try {
      await AsyncStorage.setItem("notes", JSON.stringify(newNotes));
    } catch (error) {
      console.error("Ошибка при сохранении заметок:", error);
    }
  };

  const addNote = async (note) => {
    if (!token) return;

    try {
      const response = await fetch("http://192.168.1.100/api/v1/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    if (!token) return;

    try {
      const response = await fetch(
        `http://192.168.1.100/api/v1/notes/${updatedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

  const deleteNotes = async (idsToDelete) => {
    if (!token) return;

    try {
      await Promise.all(
        idsToDelete.map((id) =>
          fetch(`http://192.168.1.100/api/v1/notes/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      const updatedNotes = notes.filter(
        (note) => !idsToDelete.includes(note.id)
      );
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
    } catch (error) {
      console.error("Ошибка при удалении заметок:", error);
    }
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNotes, updateToken, token }}>
      {children}
    </NoteContext.Provider>
  );
};

export default NoteContext;
