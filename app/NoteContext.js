import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";

const NoteContext = createContext();

SplashScreen.preventAutoHideAsync();

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [token, setToken] = useState(null);
  const [groups, setGroups] = useState([]);

  const STORAGE_KEY = "groups_data";

  const saveGroupsToStorage = async (data) => {
    try {
      const json = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
      console.error("Ошибка при сохранении групп в хранилище:", e);
    }
  };

  const loadGroupsFromStorage = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      return json != null ? JSON.parse(json) : [];
    } catch (e) {
      console.error("Ошибка при загрузке групп из хранилища:", e);
      return [];
    }
  };

  useEffect(() => {
    const load = async () => {
      const savedGroups = await loadGroupsFromStorage();
      setGroups(savedGroups);
    };
    load();
  }, []);

  useEffect(() => {
    saveGroupsToStorage(groups);
  }, [groups]);

  useEffect(() => {
    async function prepare() {
      // Здесь можно загрузить ресурсы, данные и т.п.

      // Когда всё готово, скрываем splash
      await SplashScreen.hideAsync();
    }

    prepare();
  }, []);

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

    const loadGroups = async () => {
      try {
        const response = await fetch(
          "https://notepad.faceqd.site/api/v1/groups",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error loading groups");

        const apiGroups = await response.json();

        // Загружаем локальные заметки
        const storedJson = await AsyncStorage.getItem("notes");
        const localGroups = storedJson ? JSON.parse(storedJson) : [];

        // Сливаем заметки по id, сохраняем selectedGroupIds
        const mergedGroups = apiGroups.map((apiGroup) => {
          const local = localGroups.find((n) => n.id === apiGroup.id);
          return {
            ...apiGroup,
            selectedGroupIds: local?.selectedGroupIds || [],
          };
        });

        setGroups(mergedGroups);
        saveGroupsToStorage(mergedGroups);
      } catch (error) {
        console.warn("API is not available, loading from storage:", error);
        try {
          const storedNotes = await AsyncStorage.getItem("groups");
          if (storedNotes !== null) {
            setGroups(JSON.parse(storedNotes));
          }
        } catch (storageError) {
          console.error("Error loading from storage:", storageError);
        }
      }
    };

    loadGroupsFromStorage();
    loadGroups();
  }, [token]);

  /* const addGroup = () => {
    const newGroup = { id: Date.now().toString(), name: "New group" };
    setGroups((prev) => [...prev, newGroup]);
  }; */

  const addGroup = async (group) => {
    if (!token) return;

    try {
      const response = await fetch(
        "https://notepad.faceqd.site/api/v1/groups",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: group.id,
            name: group.name,
            collaborators: group.collaborators,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.log("Response error text:", text);
        throw new Error("Error adding group");
      }

      const data = await response.json(); // новая группа с id от сервера

      const updatedGroups = groups.map((g) =>
        g.id === group.id
          ? { ...data, collaborators: data.collaborators || [] }
          : g
      );

      setGroups(updatedGroups);
      saveGroupsToStorage(updatedGroups);
    } catch (error) {
      console.error("Error adding group:", error);
    }
  };

  const updateGroup = async (updatedGroup) => {
    if (!token) return;

    try {
      const response = await fetch(
        `https://notepad.faceqd.site/api/v1/groups/${updatedGroup.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedGroup),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error text:", errorText);
        throw new Error("Error updating group on server");
      }

      const newGroups = groups.map((group) =>
        group.id === updatedGroup.id ? updatedGroup : group
      );

      setGroups(newGroups);
      saveGroupsToStorage(newGroups);
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  const deleteGroups = async (idsToDelete) => {
    if (!token) return;

    try {
      // Отправляем запросы на удаление для каждого id
      await Promise.all(
        idsToDelete.map((id) =>
          fetch(`https://notepad.faceqd.site/api/v1/groups/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      // Удаляем из локального состояния группы с этими id
      const updatedGroups = groups.filter(
        (group) => !idsToDelete.includes(group.id)
      );

      setGroups(updatedGroups);
      saveGroupsToStorage(updatedGroups);
    } catch (error) {
      console.error("Error deleting groups:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadNotes = async () => {
      try {
        const response = await fetch(
          "https://notepad.faceqd.site/api/v1/notes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error loading notes");

        const apiNotes = await response.json();

        // Загружаем локальные заметки
        const storedJson = await AsyncStorage.getItem("notes");
        const localNotes = storedJson ? JSON.parse(storedJson) : [];

        // Сливаем заметки по id, сохраняем selectedGroupIds
        const mergedNotes = apiNotes.map((apiNote) => {
          const local = localNotes.find((n) => n.id === apiNote.id);
          return {
            ...apiNote,
            selectedGroupIds: local?.selectedGroupIds || [],
          };
        });

        setNotes(mergedNotes);
        saveNotesToStorage(mergedNotes);
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

    loadNotesFromStorage();
    loadNotes();
  }, [token]);

  const saveNotesToStorage = async (newNotes) => {
    try {
      await AsyncStorage.setItem("notes", JSON.stringify(newNotes));
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const loadNotesFromStorage = async () => {
    try {
      const json = await AsyncStorage.getItem("notes");
      if (json) {
        const savedNotes = JSON.parse(json);
        setNotes(savedNotes);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
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
      const serverNote = await response.json();

      const newNote = {
        ...note,
        id: serverNote.id,
      };

      const newNotes = [newNote, ...notes];
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
    <NoteContext.Provider
      value={{
        notes,
        addNote,
        updateNote,
        deleteNotes,
        updateToken,
        token,
        groups,
        setGroups,
        addGroup,
        updateGroup,
        deleteGroups,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export default NoteContext;
