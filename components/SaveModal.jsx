import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import React from 'react'

const SaveModal = ({ visible, onSave, onClose, onExit }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType='none'
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/60 justify-center items-center">
                    <TouchableWithoutFeedback>
                        <View
                            className="w-[65%] rounded-2xl p-5 items-center bg-gray-200"
                            style={{
                                backgroundColor: '#f0f0f0',
                                borderWidth: 2,
                                borderColor: 'rgba(100, 120, 180, 0.3)',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 10,
                            }}
                        >
                            <Text className="text-xl font-semibold text-gray-800 mb-3">
                                You didn`t save your note. Save this note?
                            </Text>

                            <TouchableOpacity
                                className="w-full border-t border-gray-300 pt-2 mb-1 items-center"
                                onPress={onSave}
                            >
                                <Text className="text-lg text-green-700">Save</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="w-full border-t border-gray-300 pt-2 items-center"
                                onPress={onExit}
                            >
                                <Text className="text-lg text-gray-700">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default SaveModal;