import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useTodoStore, Category } from "../../stores/todo";
import { Ionicons } from "@expo/vector-icons";
import AddTodoModal from "./components/AddTodoModal";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useAuth } from "../../stores/auth";

const EmptyList = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="list" size={64} color="#C7C7CC" />
    <Text style={styles.emptyTitle}>No Tasks Yet</Text>
    <Text style={styles.emptyDescription}>
      Tap the + button to create your first task
    </Text>
  </View>
);

const EmptyCategory = () => (
  <View style={styles.emptyCategoryContainer}>
    <Text style={styles.emptyCategoryText}>No tasks in this category</Text>
  </View>
);

interface DashboardHeaderProps {
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
  activeTasks: number;
  hasCompletedTasks: boolean;
  onLogout: () => void;
}

const DashboardHeader = ({
  showCompleted,
  setShowCompleted,
  activeTasks,
  hasCompletedTasks,
  onLogout,
}: DashboardHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <BlurView intensity={80} style={styles.headerBlur}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Tasks</Text>
            <View style={styles.headerSubtitleContainer}>
              <Text style={styles.headerSubtitle}>
                {activeTasks} active tasks
              </Text>
              {hasCompletedTasks && (
                <>
                  <Ionicons name="ellipse" size={4} color="#666" />
                  <TouchableOpacity
                    onPress={() => setShowCompleted(!showCompleted)}
                    style={styles.showHideButton}
                  >
                    <Text style={styles.showHideText}>
                      {showCompleted ? "Hide" : "Show"} Completed
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF453A" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

export default function DashboardScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const todos = useTodoStore((state) => state.todos);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const activeTasks = todos.filter((todo) => !todo.completed).length;
  const hasCompletedTasks = todos.some((todo) => todo.completed);

  const groupedTodos = todos.reduce((acc, todo) => {
    const key = todo.completed ? "completed" : todo.category;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(todo);
    return acc;
  }, {} as Record<Category | "completed", typeof todos>);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleToggleTodo = (id: string) => {
    Haptics.selectionAsync();
    toggleTodo(id);
  };

  const handleDeleteTodo = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteTodo(id);
  };

  const renderTodoItem = ({ item, index, section }) => {
    const priorityColors = {
      High: "#FF453A",
      Medium: "#FF9F0A",
      Low: "#30D158",
    };

    const handleToggle = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      handleToggleTodo(item.id);
    };

    return (
      <Animated.View
        entering={FadeIn}
        layout={LinearTransition}
        style={styles.todoItem}
      >
        <BlurView intensity={80} style={styles.todoItemBlur}>
          <TouchableOpacity
            style={styles.todoCheckbox}
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            <Animated.View>
              <Ionicons
                name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={item.completed ? "#30D158" : "#007AFF"}
              />
            </Animated.View>
          </TouchableOpacity>
          <View style={styles.todoContent}>
            <Text
              style={[
                styles.todoTitle,
                item.completed && styles.completedTodoTitle,
              ]}
            >
              {item.title}
            </Text>
            {item.description ? (
              <Text
                style={[
                  styles.todoDescription,
                  item.completed && styles.completedTodoDescription,
                ]}
              >
                {item.description}
              </Text>
            ) : null}
            <View style={styles.todoMeta}>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: priorityColors[item.priority] },
                  item.completed && styles.completedPriorityBadge,
                ]}
              >
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
              <View
                style={[
                  styles.categoryBadge,
                  item.completed && styles.completedCategoryBadge,
                ]}
              >
                <Ionicons
                  name={
                    {
                      Work: "briefcase",
                      Personal: "person",
                      Urgent: "alert-circle",
                    }[item.category]
                  }
                  size={12}
                  color={item.completed ? "#999" : "#666"}
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryText,
                    item.completed && styles.completedCategoryText,
                  ]}
                >
                  {item.category}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTodo(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#FF453A" />
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    );
  };

  const renderCategory = ({ item: category }) => {
    const categoryTodos = groupedTodos[category] || [];
    const sortedTodos = [...categoryTodos].sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    if (category === "completed" && !showCompleted) return null;
    if (category === "completed" && !sortedTodos.length) return null;

    const categoryIcons = {
      Work: "briefcase",
      Personal: "person",
      Urgent: "alert-circle",
      completed: "checkmark-done-circle",
    };

    return (
      <Animated.View
        entering={FadeIn}
        layout={LinearTransition}
        style={styles.categoryContainer}
      >
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Ionicons
              name={categoryIcons[category]}
              size={24}
              color="#007AFF"
              style={styles.categoryIcon}
            />
            <Text style={styles.categoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </View>
          <Text style={styles.todoCount}>
            {sortedTodos.length} {sortedTodos.length === 1 ? "task" : "tasks"}
          </Text>
        </View>
        {sortedTodos.length > 0 ? (
          <FlatList
            data={sortedTodos}
            renderItem={renderTodoItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
          />
        ) : (
          <EmptyCategory />
        )}
      </Animated.View>
    );
  };

  const categories: (Category | "completed")[] = [
    "Work",
    "Personal",
    "Urgent",
    "completed",
  ];

  return (
    <View style={styles.container}>
      <DashboardHeader
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
        activeTasks={activeTasks}
        hasCompletedTasks={hasCompletedTasks}
        onLogout={logout}
      />
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item}
        contentContainerStyle={[
          styles.listContent,
          todos.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={EmptyList}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => setShowAddModal(true)}
      >
        <BlurView intensity={100} style={styles.fabBlur}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </BlurView>
      </TouchableOpacity>

      <AddTodoModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  headerContainer: {
    backgroundColor: "rgba(242,242,247,0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  headerBlur: {
    width: "100%",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  headerSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  categoryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  todoCount: {
    fontSize: 14,
    color: "#666",
  },
  todoItem: {
    borderRadius: 16,
    marginBottom: 2,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  todoItemBlur: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  todoCheckbox: {
    marginRight: 12,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  completedTodoTitle: {
    textDecorationLine: "line-through",
    color: "#8E8E93",
  },
  todoDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  todoMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
  },
  deleteButton: {
    padding: 8,
  },
  separator: {
    height: 12,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "#fff",
  },
  fabBlur: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  showHideButton: {
    // Remove background and border for a cleaner look
  },
  showHideText: {
    color: "#007AFF",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  emptyCategoryContainer: {
    padding: 32,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 16,
    alignItems: "center",
  },
  emptyCategoryText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  completedTodoDescription: {
    color: "#8E8E93",
    textDecorationLine: "line-through",
  },
  completedPriorityBadge: {
    opacity: 0.6,
  },
  completedCategoryBadge: {
    backgroundColor: "#F2F2F7",
  },
  completedCategoryText: {
    color: "#8E8E93",
  },
  logoutButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
});
