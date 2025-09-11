import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Pressable, Image, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import NoteContext from '../app/NoteContext';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';


const SocialView = () => {
    const { groups, setGroups, addGroup, updateGroup, deleteGroups } = useContext(NoteContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingGroupName, setEditingGroupName] = useState('');
    const [collabInputs, setCollabInputs] = useState({});
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const { t } = useTranslation();

    const isGroupValid = (group) => {
        const hasName = group.name?.trim().length > 0;
        const hasValidCollaborator = (group.collaborators || []).some(c => c.name?.trim().length > 0);
        return hasName && hasValidCollaborator;
    };

    useEffect(() => {
        if (!searchQuery) {
            setFilteredGroups(groups);
        } else {
            const lower = searchQuery.toLowerCase();
            setFilteredGroups(
                groups.filter(group => (group.name || '').toLowerCase().includes(lower))
            );
        }
    }, [searchQuery, groups]);

    useFocusEffect(
        React.useCallback(() => {
            if (!searchQuery) {
                setFilteredGroups(groups);
            } else {
                const lower = searchQuery.toLowerCase();
                setFilteredGroups(groups.filter(group => (group.name || '').toLowerCase().includes(lower)));
            }
        }, [groups, searchQuery])
    );

    useEffect(() => {
        if (selectedGroups.length === 0) setSelectMode(false);
    }, [selectedGroups]);

    const handleAddGroup = () => {
        const newGroup = {
            id: Date.now().toString(),
            name: t('New Group'),
            collaborators: [{ id: Date.now().toString(), name: '' }],
            isDraft: true,
        };
        setGroups(prev => [...prev, newGroup]);
    };

    const saveGroupName = (groupId) => {
        const groupToSave = groups.find(g => g.id === groupId);
        if (!groupToSave || !groupToSave.name?.trim()) return;

        const groupData = {
            id: groupToSave.id,
            name: groupToSave.name,
            collaborators: groupToSave.collaborators || [],
        };

        if (groupToSave.isDraft) {
            addGroup(groupData);
        } else {
            updateGroup(groupData);
        }
    };

    const handleChangeGroupName = (text, groupId) => {
        const updatedGroups = groups.map(group =>
            group.id === groupId ? { ...group, name: text } : group
        );
        setGroups(updatedGroups);
    };

    const handleChangeCollaboratorName = (text, groupId, collabId) => {
        const updatedGroups = groups.map(group => {
            if (group.id === groupId) {
                const updatedCollaborators = (group.collaborators || []).map(collab =>
                    collab.id === collabId ? { ...collab, name: text } : collab
                );
                return { ...group, collaborators: updatedCollaborators };
            }
            return group;
        });
        setGroups(updatedGroups);
    };

    const addCollaborator = (groupId) => {
        const newCollab = { id: Date.now().toString(), name: '' };

        const updatedGroups = groups.map(group => {
            if (group.id === groupId) {
                const newCollaborators = [...(group.collaborators || []), newCollab];

                return { ...group, collaborators: newCollaborators };
            }
            return group;
        });

        setGroups(updatedGroups);
    };

    const handleDeleteCollaborator = (groupId, collabId) => {
        const updatedGroups = groups.map(group => {
            if (group.id === groupId) {
                const filteredCollaborators = (group.collaborators || []).filter(c => c.id !== collabId);

                return { ...group, collaborators: filteredCollaborators };
            }
            return group;
        });
        setGroups(updatedGroups);
    };

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

    const handleDeleteSelected = () => {
        if (selectedGroups.length === 0) return;

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

    return (
        <SafeAreaView className="flex-1 pt-9 bg-[#F7F7F7]">
            <StatusBar style="dark" />
            <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View className="flex-1">
                    <View className="bg-[#F7F7F7] flex-1 px-2">
                        <View className="p-2 flex-row items-center">
                            <TextInput
                                className="border border-[#ddd] bg-white rounded-md p-2 flex-1"
                                placeholder={t("Search for groups...")}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {selectedGroups.length === 0 && (
                                <TouchableOpacity onPress={handleAddGroup} className="ml-2">
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
                                        <View className='flex flex-row items-center w-full justify-between'>
                                            <Pressable
                                                className='w-[75%]'
                                                onLongPress={() => handleLongPress(item)}
                                                onPress={() => {
                                                    if (!selectMode) {
                                                        setEditingGroupId(item.id);
                                                    } else {
                                                        handlePress(item);
                                                    }
                                                }}
                                            >
                                                <View className={" bg-white rounded-xl shadow-md w-full min-h-[30px]"}>
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
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (isGroupValid(item)) {
                                                        saveGroupName(item.id);
                                                        setShowSavedMessage(true);
                                                        setTimeout(() => setShowSavedMessage(false), 2000);
                                                    }
                                                }}
                                                className="ml-2"
                                                disabled={!isGroupValid(item)}
                                                style={{ opacity: isGroupValid(item) ? 1 : 0.4 }}
                                            >
                                                <Image source={require('../images/saveBtn.png')} className="w-8 h-8" />
                                            </TouchableOpacity>
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
                                                        placeholder="example@example.com"
                                                        className="border border-gray-300 rounded-md px-3 py-2 my-1 bg-white w-[87%]"
                                                    />
                                                    <TouchableOpacity onPress={() => handleDeleteCollaborator(item.id, collab.id)} className="">
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
                        {showSavedMessage && (
                            <View className="absolute bottom-5 left-0 right-0 items-center">
                                <View className="bg-green-500 px-4 py-2 rounded-xl shadow-lg">
                                    <Text className="text-white font-medium">{t('Group saved')}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

export default SocialView;