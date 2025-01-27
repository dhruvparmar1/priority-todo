import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Priority = "High" | "Medium" | "Low";
export type Category = "Work" | "Personal" | "Urgent";

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: number;
}

interface TodoState {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, "id" | "completed" | "createdAt">) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, updates: Partial<Todo>) => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  addTodo: (todo) => {
    set((state) => {
      const newTodo: Todo = {
        ...todo,
        id: Date.now().toString(),
        completed: false,
        createdAt: Date.now(),
      };
      const newTodos = [...state.todos, newTodo];
      AsyncStorage.setItem("todos", JSON.stringify(newTodos));
      return { todos: newTodos };
    });
  },
  toggleTodo: (id) => {
    set((state) => {
      const newTodos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      AsyncStorage.setItem("todos", JSON.stringify(newTodos));
      return { todos: newTodos };
    });
  },
  deleteTodo: (id) => {
    set((state) => {
      const newTodos = state.todos.filter((todo) => todo.id !== id);
      AsyncStorage.setItem("todos", JSON.stringify(newTodos));
      return { todos: newTodos };
    });
  },
  editTodo: (id, updates) => {
    set((state) => {
      const newTodos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, ...updates } : todo
      );
      AsyncStorage.setItem("todos", JSON.stringify(newTodos));
      return { todos: newTodos };
    });
  },
}));
