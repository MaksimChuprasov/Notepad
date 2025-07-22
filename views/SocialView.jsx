import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Pressable, Image, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import NoteContext from '../app/NoteContext';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';



const SocialView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const { groups, setGroups } = useContext(NoteContext);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [collaborators, setCollaborators] = useState([]);

    
    const addCollaborator = (groupId) => {
        setGroups(prev =>
            prev.map(group =>
                group.id === groupId
                    ? {
                        ...group,
                        collaborators: [
                            ...(group.collaborators || []),
                            { id: Date.now().toString(), name: '' }
                        ]
                    }
                    : group
            )
        );
    };

    const handleChangeCollaboratorName = (text, groupId, collabId) => {
        setGroups(prev =>
            prev.map(group =>
                group.id === groupId
                    ? {
                        ...group,
                        collaborators: (group.collaborators || []).map(collab =>
                            collab.id === collabId ? { ...collab, name: text } : collab
                        )
                    }
                    : group
            )
        );
    };


    useEffect(() => {
        setFilteredGroups(groups);
    }, [groups]);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredGroups(groups);
        } else {
            const filtered = groups.filter(group =>
                group.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredGroups(filtered);
        }
    }, [searchQuery, groups]);

    const addGroup = () => {
        const newGroup = { id: Date.now().toString(), name: 'New group' };
        setGroups(prev => [...prev, newGroup]);
    };

    const filterGroups = (list, query) => {
        const lower = query.toLowerCase();
        return list.filter(group =>
            (group.name || '').toLowerCase().includes(lower)
        );
    };

    useEffect(() => {
        const filtered = filterGroups(groups, searchQuery);
        setFilteredGroups(filtered);
    }, [searchQuery, groups]);

    useFocusEffect(
        React.useCallback(() => {
            setFilteredGroups(filterGroups(groups, searchQuery));
        }, [groups, searchQuery])
    );

    useEffect(() => {
        if (selectedGroups.length === 0) setSelectMode(false);
    }, [selectedGroups]);

    const handleLongPress = (group) => {
        if (!selectMode) setSelectMode(true);
        if (!selectedGroups.includes(group.id)) {
            setSelectedGroups(prev => [...prev, group.id]);
        }
    };

    const handlePress = (group) => {
        if (selectMode) {
            if (selectedGroups.includes(group.id)) {
                setSelectedGroups(prev => prev.filter(id => id !== group.id));
            } else {
                setSelectedGroups(prev => [...prev, group.id]);
            }
        }
    };

    const deleteGroups = (idsToDelete) => {
        setGroups(prev => prev.filter(group => !idsToDelete.includes(group.id)));
    };

    const handleDeleteSelected = () => {
        deleteGroups(selectedGroups);
        setSelectedGroups([]);
        setSelectMode(false);
    };

    const handleOutsidePress = () => {
        if (selectMode) {
            setSelectedGroups([]);
            setSelectMode(false);
        }
    };

    const handleChangeGroupName = (text, groupId) => {
        setGroups(prev =>
            prev.map(group =>
                group.id === groupId ? { ...group, name: text } : group
            )
        );
    };

    const handleDeleteCollaborator = (groupId, collabId) => {
        setGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId
                    ? {
                        ...group,
                        collaborators: group.collaborators.filter(c => c.id !== collabId),
                    }
                    : group
            )
        );
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
                                placeholder="Search for groups..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {selectedGroups.length === 0 && (
                                <TouchableOpacity onPress={addGroup} className="ml-2">
                                    <Image
                                        source={require('../images/add-group.png')}
                                        className="w-10 h-10"
                                    />
                                </TouchableOpacity>
                            )}

                            {selectedGroups.length > 0 && (
                                <TouchableOpacity onPress={handleDeleteSelected} className="ml-2">
                                    <Image
                                        source={require('../images/bin.png')}
                                        className="w-10 h-10"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <FlatList
                            data={filteredGroups}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingHorizontal: 6, paddingVertical: 8 }}
                            renderItem={({ item }) => (
                                <Pressable
                                    onLongPress={() => handleLongPress(item)}
                                    onPress={() => handlePress(item)}
                                    className="mb-2"
                                >
                                    <View
                                        className={`p-3 bg-white rounded-xl shadow-md border-2 border-transparent ${selectedGroups.includes(item.id) ? 'border-2 border-blue-500' : ''}`}
                                    >
                                        <View className='flex flex-row items-center justify-between'>
                                            <Pressable
                                                onLongPress={() => handleLongPress(item)}
                                                onPress={() => {
                                                    if (!selectMode) {
                                                        setEditingGroupId(item.id);
                                                    } else {
                                                        handlePress(item);
                                                    }
                                                }}
                                            >
                                                <View className={" bg-white rounded-xl shadow-md w-60 min-h-[30px]"}>
                                                    {editingGroupId === item.id ? (
                                                        <TextInput
                                                            value={item.name}
                                                            onChangeText={(text) => handleChangeGroupName(text, item.id)}
                                                            onBlur={() => setEditingGroupId(null)}
                                                            autoFocus
                                                            className="text-lg font-semibold p-0 mt-1"
                                                            style={{
                                                                lineHeight: 22,
                                                            }}
                                                        />
                                                    ) : (
                                                        <Text className="text-lg font-semibold p-0 mt-1"
                                                            style={{
                                                                lineHeight: 22,
                                                            }}>
                                                            {item.name}
                                                        </Text>
                                                    )}
                                                </View>
                                            </Pressable>
                                            <TouchableOpacity onPress={() => addCollaborator(item.id)} className="ml-2">
                                                <Image
                                                    source={require('../images/collaborator.png')}
                                                    className="w-6 h-6"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View>
                                            {(item.collaborators || []).map((collab) => (
                                                <View key={collab.id} className='flex flex-row items-center justify-between'>
                                                    <TextInput
                                                        value={collab.name}
                                                        onChangeText={(text) =>
                                                            handleChangeCollaboratorName(text, item.id, collab.id)
                                                        }
                                                        placeholder="Enter the collaborator"
                                                        className="border border-gray-300 rounded-md px-3 py-2 my-1 bg-white w-60"
                                                    />
                                                    <TouchableOpacity onPress={() => handleDeleteCollaborator(item.id, collab.id)} className="ml-[14px]">
                                                        <Image
                                                            source={require('../images/bin.png')}
                                                            className="w-8 h-8"
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
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

export default SocialView;