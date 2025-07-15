import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [token, setToken] = useState(null);
  const [groups, setGroups] = useState([]);

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
        const response = await fetch("https://notepad.faceqd.site/api/v1/notes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Error loading notes");

        const apiNotes = await response.json();
        setNotes(apiNotes);
        saveNotesToStorage(apiNotes);
      } catch (error) {
        console.warn("API is not available, loading from storage:", error);
        try {
          const storedNotes = await AsyncStorage.getItem("notes");
          if (storedNotes !== null) {
            setNotes(JSON.parse(storedNotes));
          }
        } catch (storageError) {
          console.error("Error loading from storage:", storageError);
        }
      }
    };

    loadNotes();
  }, [token]);

  const saveNotesToStorage = async (newNotes) => {
    try {
      await AsyncStorage.setItem("notes", JSON.stringify(newNotes));
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const addNote = async (note) => {
    if (!token) return;

    try {
      const response = await fetch("https://notepad.faceqd.site/api/v1/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(note),
      });

      if (!response.ok) {
        throw new Error("Error adding note to server");
      }

      const createdNote = await response.json();

      const newNotes = [createdNote, ...notes];
      setNotes(newNotes);
      saveNotesToStorage(newNotes);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const updateNote = async (updatedNote) => {
    if (!token) return;

    try {
      const response = await fetch(
        `https://notepad.faceqd.site/api/v1/notes/${updatedNote.id}`,
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
        throw new Error("Error updating note on server");
      }

      const newNotes = notes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note
      );
      setNotes(newNotes);
      saveNotesToStorage(newNotes);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const deleteNotes = async (idsToDelete) => {
    if (!token) return;

    try {
      await Promise.all(
        idsToDelete.map((id) =>
          fetch(`https://notepad.faceqd.site/api/v1/notes/${id}`, {
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
      console.error("Error deleting notes:", error);
    }
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNotes, updateToken, token, groups, setGroups }}>
      {children}
    </NoteContext.Provider>
  );
};

export default NoteContext;
