import { Modal, View, Text, TouchableOpacity } from 'react-native';
import React from 'react'

const DeleteModal = ({ visible, onClose, onDelete }) => {
    return (
            <Modal
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
                animationType='slide'
            >
                <View className="absolute mt-[250px] ml-[85px] rounded-xl p-2 w-1/2 bg-gray-200 items-center">
                    <View>
                        <Text className="text-lg mb-1">Delete this note?</Text>
                    </View>
                    <View className="flex ">
                        <TouchableOpacity className="border-t min-w-full items-center pb-1 p-1" onPress={onDelete}>
                            <Text className="text-lg text-red-600">Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="border-t items-center p-1" onPress={onClose}>
                            <Text className="text-lg">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
    )
}

export default DeleteModal