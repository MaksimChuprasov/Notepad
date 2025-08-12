import React, { createContext, useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { registerForPushNotifications } from "../hooks/registerForPushNotifications";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { navigate } from "../app/navigationRef";

const NoteContext = createContext();

SplashScreen.preventAutoHideAsync();

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [token, setToken] = useState(null);
  const [groups, setGroups] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hiddenNotes, setHiddenNotes] = useState([]);
  const [pendingNoteId, setPendingNoteId] = useState(null);

  const isSigningInRef = useRef(false);

  // push properties
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowList: true,
    }),
  });

  useEffect(() => {
    // Listener for notifications received while the application is open
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Notification received:", notification);
        loadNotes();
      }
    );

    // Notification Click Listener
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("Notification data:", data);

        if (data && data.note_id) {
          const foundNote = notes.find((n) => n.id === data.note_id);
          if (foundNote) {
            navigate("Note", { noteToEdit: foundNote });
          } else {
            console.log("⏳ Заметка ещё не загружена, ждём...");
            setPendingNoteId(data.note_id);
          }
        } else {
          loadNotes();
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  useEffect(() => {
    if (pendingNoteId && notes.length > 0) {
      const foundNote = notes.find((n) => n.id === pendingNoteId);
      if (foundNote) {
        navigate("Note", { noteToEdit: foundNote });
        setPendingNoteId(null); // сбрасываем
      }
    }
  }, [notes, pendingNoteId]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "890755548909-dmr6ej2o4t02i1998bv4gj1i8it2qt21.apps.googleusercontent.com", // из Firebase Console
      offlineAccess: true,
    });
  }, []);

  // Google login function
  const handleGoogleLogin = async () => {
    if (isSigningInRef.current) {
      console.log("Google sign-in уже выполняется, ждите...");
      return; // блокируем повторный вызов
    }
    isSigningInRef.current = true;

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const id_token = userInfo.idToken || userInfo.data?.idToken;

      const response = await fetch(
        "https://notepad.faceqd.site/api/v1/auth/google-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_token }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Authorization error: ${text}`);
      }

      const data = await response.json();

      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(data.user));

      updateToken(data.token);
      setIsLoggedIn(true);
      setName(data.user.name);
      setEmail(data.user.email);
    } catch (error) {
      console.error("❌ Google login error", error);
    } finally {
      isSigningInRef.current = false;
    }
  };

  // Logout function
  const handleLogOut = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userInfo");
    updateToken(null);
    setIsLoggedIn(false);
    setName("");
    setEmail("");
    await GoogleSignin.signOut();
  };

  // Check token function
  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        setToken(token); // <--- обязательно
        setIsLoggedIn(true);

        const userInfo = await AsyncStorage.getItem("userInfo");
        if (userInfo) {
          const user = JSON.parse(userInfo);
          setName(user.name);
          setEmail(user.email);
        }

        return token; // <--- возвращаем сам токен
      } else {
        console.warn("❗ Токен не найден");
        return null;
      }
    } catch (e) {
      console.error("Ошибка при получении токена:", e);
      return null;
    }
  };

  // Save token function
  const saveToken = async () => {
    try {
      const expoToken = await registerForPushNotifications();
      console.log(expoToken);

      if (expoToken) {
        setExpoPushToken(expoToken);

        const expoResponse = await Notifications.getExpoPushTokenAsync();

        const response = await fetch(
          "https://notepad.faceqd.site/api/v1/save-token",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ expo_token: expoResponse.data }),
          }
        );
      }
    } catch (error) {
      console.error("Ошибка при сохранении токена:", error);
    }
  };

  // update token function
  const updateToken = (newToken) => {
    setToken(newToken);
  };

  // Load notes from local storage function
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

  // Save notes to local storage function
  const saveNotesToStorage = async (newNotes) => {
    try {
      await AsyncStorage.setItem("notes", JSON.stringify(newNotes));
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  // Load notes function
  const loadNotes = async () => {
    const ensuredToken = await checkToken(); // ждём token
    if (!ensuredToken) {
      console.error("❗ Не удалось получить токен, остановка запроса");
      return;
    }

    try {
      const response = await fetch("https://notepad.faceqd.site/api/v1/notes", {
        headers: {
          Authorization: `Bearer ${ensuredToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка API /notes:", response.status, errorText);
        throw new Error("Error loading notes");
      }

      const apiNotes = await response.json();
      const notesWithDates = apiNotes.map((note) => ({
        ...note,
        createdAt:
          note.createdAt || note.updated_at || new Date().toISOString(),
      }));

      notesWithDates.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotes(notesWithDates);
    } catch (error) {
      console.error("Ошибка загрузки заметок:", error.message);
    }
  };

  // Add note function
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
        id: serverNote.id, // ID от сервера
      };

      const newNotes = [newNote, ...notes];
      setNotes(newNotes);
      saveNotesToStorage(newNotes);
    } catch (error) {
      console.warn("Ошибка при добавлении заметки, сохраняем локально:", error);

      const fallbackNote = {
        ...note,
        id: Date.now().toString(), // временный id
        unsynced: true, // можно использовать для последующей синхронизации
      };

      const newNotes = [fallbackNote, ...notes];
      setNotes(newNotes);
      saveNotesToStorage(newNotes);
    }
  };

  // Update note function
  const updateNote = async (updatedNote, updateState = true) => {
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

      if (updateState) {
        const newNotes = notes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        );
        setNotes(newNotes);
        saveNotesToStorage(newNotes);
      }
    } catch (error) {
      console.warn("Ошибка при обновлении заметки, обновляем локально:", error);

      if (updateState) {
        const newNotes = notes.map((note) =>
          note.id === updatedNote.id ? { ...updatedNote, unsynced: true } : note
        );
        setNotes(newNotes);
        saveNotesToStorage(newNotes);
      }
    }
  };

  // Delete note function
  const deleteNotes = async (idsToDelete) => {
    if (!token) return;

    // 1. Удаляем локально
    const updatedNotes = notes.filter((note) => !idsToDelete.includes(note.id));
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);

    try {
      // 2. Пробуем удалить с сервера
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
    } catch (error) {
      console.warn(
        "Удаление с сервера не удалось, будет повторено позже:",
        error
      );

      // 3. Сохраняем список отложенных удалений
      try {
        const existing = await AsyncStorage.getItem("deletedNoteIds");
        const existingIds = existing ? JSON.parse(existing) : [];
        const merged = [...new Set([...existingIds, ...idsToDelete])];
        await AsyncStorage.setItem("deletedNoteIds", JSON.stringify(merged));
      } catch (e) {
        console.error(
          "Ошибка при сохранении удалённых заметок для синхронизации:",
          e
        );
      }
    }
  };

  // Sync delete notes function
  const syncDeletedNotes = async () => {
    if (!token) return;

    try {
      const stored = await AsyncStorage.getItem("deletedNoteIds");
      const idsToDelete = stored ? JSON.parse(stored) : [];

      if (idsToDelete.length === 0) return;

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

      // Очистить список отложенных удалений
      await AsyncStorage.removeItem("deletedNoteIds");
      console.log("Удалённые заметки успешно синхронизированы с сервером.");
    } catch (error) {
      console.warn("Синхронизация удалённых заметок не удалась:", error);
    }
  };

  // Save groups to local storage function
  const saveGroupsToStorage = async (data) => {
    try {
      const json = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
      console.error("Ошибка при сохранении групп в хранилище:", e);
    }
  };

  // Load groups from local storage function
  const loadGroupsFromStorage = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      return json != null ? JSON.parse(json) : [];
    } catch (e) {
      console.error("Ошибка при загрузке групп из хранилища:", e);
      return [];
    }
  };

  // Load groups function
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

  // Add group function
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

  // Update group function
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

  // Delete group function
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

  // ??
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  }, []);

  const hasSavedPushToken = useRef(false);

  useEffect(() => {
    if (token && !hasSavedPushToken.current) {
      hasSavedPushToken.current = true;
      saveToken();
    }
  }, [token]);

  const STORAGE_KEY = "groups_data";

  // Load groups from local storage call function
  useEffect(() => {
    const load = async () => {
      const savedGroups = await loadGroupsFromStorage();
      setGroups(savedGroups);
    };
    load();
  }, []);

  // Save groups to local storage call function
  useEffect(() => {
    saveGroupsToStorage(groups);
  }, [groups]);

  // Splash screen
  useEffect(() => {
    async function prepare() {
      // Здесь можно загрузить ресурсы, данные и т.п.

      // Когда всё готово, скрываем splash
      await SplashScreen.hideAsync();
    }

    prepare();
  }, []);

  // Load User Data call function
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("userToken");
        if (savedToken) {
          setToken(savedToken);
          setIsLoggedIn(true);

          const userInfo = await AsyncStorage.getItem("userInfo");
          if (userInfo) {
            const user = JSON.parse(userInfo);
            setName(user.name);
            setEmail(user.email);
          }
        } else {
          // Если токена нет, сбрасываем состояние
          setToken(null);
          setIsLoggedIn(false);
          setName("");
          setEmail("");
        }
      } catch (e) {
        console.error("Error loading user data:", e);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (!token) return;

    let called = false;
    const load = async () => {
      if (called) return;
      called = true;
      await loadNotesFromStorage();
      await loadNotes();
    };

    load();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    syncDeletedNotes();
  }, [token]);

  return (
    <NoteContext.Provider
      value={{
        notes,
        setNotes,
        hiddenNotes,
        setHiddenNotes,
        loadNotes,
        addNote,
        updateNote,
        deleteNotes,
        token,
        groups,
        setGroups,
        addGroup,
        updateGroup,
        deleteGroups,
        saveToken,
        handleGoogleLogin,
        isLoggedIn,
        name,
        email,
        handleLogOut,
        expoPushToken,
        isAppReady,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export default NoteContext;
