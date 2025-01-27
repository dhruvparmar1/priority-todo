import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Priority, Category, useTodoStore } from "../../../stores/todo";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddTodoModal({ visible, onClose }: AddTodoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [category, setCategory] = useState<Category>("Personal");
  const addTodo = useTodoStore((state) => state.addTodo);
  const insets = useSafeAreaInsets();

  const priorities: Priority[] = ["High", "Medium", "Low"];
  const categories: Category[] = ["Work", "Personal", "Urgent"];

  const handleOptionSelect = (type: "priority" | "category", value: string) => {
    Haptics.selectionAsync();
    if (type === "priority") {
      setPriority(value as Priority);
    } else {
      setCategory(value as Category);
    }
  };

  const handleSubmit = () => {
    if (title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addTodo({
        title,
        description,
        priority,
        category,
      });
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setCategory("Personal");
      onClose();
    }
  };

  const categoryIcons = {
    Work: "briefcase",
    Personal: "person",
    Urgent: "alert-circle",
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
            <View
              style={[styles.modalContent, { paddingBottom: insets.bottom }]}
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>New Task</Text>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !title.trim() && styles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={!title.trim()}
                >
                  <Text
                    style={[
                      styles.submitButtonText,
                      !title.trim() && styles.disabledButtonText,
                    ]}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.form}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Task title"
                  placeholderTextColor="#999"
                  autoFocus
                />

                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add description"
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                />

                <Text style={styles.sectionTitle}>Priority</Text>
                <View style={styles.optionsContainer}>
                  {priorities.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.option,
                        priority === p && styles.selectedOption,
                      ]}
                      onPress={() => handleOptionSelect("priority", p)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          priority === p && styles.selectedOptionText,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.optionsContainer}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.categoryOption,
                        category === c && styles.selectedCategoryOption,
                      ]}
                      onPress={() => handleOptionSelect("category", c)}
                    >
                      <Ionicons
                        name={categoryIcons[c]}
                        size={16}
                        color={category === c ? "white" : "#666"}
                        style={styles.categoryIcon}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          category === c && styles.selectedOptionText,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  modalContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 8,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#007AFF",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#E5E5EA",
  },
  disabledButtonText: {
    color: "#8E8E93",
  },
  form: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 16,
    paddingVertical: 8,
    color: "#000",
  },
  descriptionInput: {
    fontSize: 16,
    marginBottom: 24,
    paddingTop: 8,
    minHeight: 100,
    color: "#000",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  optionsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 8,
  },
  option: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    alignItems: "center",
  },
  categoryOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  selectedCategoryOption: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  optionText: {
    color: "#000",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "white",
  },
  categoryIcon: {
    marginRight: 6,
  },
});
