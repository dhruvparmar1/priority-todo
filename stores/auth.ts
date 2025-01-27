import { create } from "zustand";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (username: string, password: string) => {
    try {
      const response = await axios.post("https://dummyjson.com/auth/login", {
        username,
        password,
      });

      await AsyncStorage.setItem("user", JSON.stringify(response.data));
      set({ isAuthenticated: true, user: response.data });
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem("user");
    set({ isAuthenticated: false, user: null });
  },
}));
