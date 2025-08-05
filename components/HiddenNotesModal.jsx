import React, { useEffect, useRef, useState } from 'react';
import Note from "./Note"
import {
    Modal,
    View,
    Text,
    Pressable,
    Animated,
    PanResponder,
    Dimensions,
    FlatList,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function HiddenNotesModal({
    visible,
    onClose,
    hiddenNotes,
    onRestore,
    renderNote,
}) {
    const [selected, setSelected] = useState([]);
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT * 0.2,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setSelected([]));
        }
    }, [visible]);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(SCREEN_HEIGHT * 0.2 + gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    Animated.timing(translateY, {
                        toValue: SCREEN_HEIGHT,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        setSelected([]);
                        onClose();
                    });
                } else {
                    Animated.timing(translateY, {
                        toValue: SCREEN_HEIGHT * 0.2,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const toggleSelect = (id) => {
        const idStr = id.toString();
        setSelected((prev) => {
            const isSelected = prev.includes(idStr);
            if (isSelected) {
                return prev.filter((noteId) => noteId !== idStr);
            } else {
                return [...prev, idStr];
            }
        });
    };

    const handleRestore = () => {
        if (selected.length === 0) return;
        onRestore(selected);
        setSelected([]);
        onClose();
    };

    const isSelected = (id) => selected.includes(id.toString());

    return (
        <Modal visible={visible} transparent animationType="none">
            <Pressable
                className="flex-1 bg-black/40"
                onPress={() => {
                    Animated.timing(translateY, {
                        toValue: SCREEN_HEIGHT,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        setSelected([]);
                        onClose();
                    });
                }}
            >
                <Animated.View
                    style={{ transform: [{ translateY }] }}
                    className="absolute bottom-0 w-full h-full bg-white rounded-t-3xl p-4"
                    {...panResponder.panHandlers}
                    onStartShouldSetResponder={() => true}
                >
                    {/* Полоска сверху */}
                    <View className="w-12 h-1.5 bg-gray-400 rounded-full self-center mb-4" />

                    <Text className="text-xl font-bold mb-4 text-center">Скрытые заметки</Text>

                    <FlatList
                        data={hiddenNotes}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        renderItem={({ item }) => {
                            const selectedNow = isSelected(item.id);
                            return (
                                <Pressable
                                    onPress={() => toggleSelect(item.id)}
                                    className={`mb-3 rounded-lg overflow-hidden relative w-[161px]`}
                                >
                                    <Note note={item} onPress={() => toggleSelect(item.id)} />

                                    {selectedNow && (
                                        <View className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Text className="text-white font-bold">✓</Text>
                                        </View>
                                    )}
                                </Pressable>
                            );
                        }}
                    />

                    <Pressable
                        disabled={selected.length === 0}
                        onPress={handleRestore}
                        className={`absolute bottom-44 left-4 right-4 rounded-xl py-3
              ${selected.length === 0 ? 'bg-blue-300' : 'bg-blue-600'}
              `}
                    >
                        <Text className="text-white text-center font-semibold">
                            Вернуть ({selected.length})
                        </Text>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

