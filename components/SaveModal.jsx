import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import React from 'react'

const SaveModal = ({ visible, onSave, onClose, onExit }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType='slide'
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="h-full w-full">
                    <TouchableWithoutFeedback>
                        <View className="absolute mt-[250px] ml-[85px] rounded-xl p-2 w-1/2 bg-gray-200 items-center">
                            <View>
                                <Text className="text-lg mb-1">Save this note?</Text>
                            </View>
                            <View className="flex ">
                                <TouchableOpacity className="border-t min-w-full items-center pb-1 p-1" onPress={onSave}>
                                    <Text className="text-lg text-green-700">Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="border-t items-center p-1" onPress={onExit}>
                                    <Text className="text-lg">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default SaveModal;