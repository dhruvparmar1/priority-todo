import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "../../stores/auth";

export default function AuthLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(app)/dashboard");
    }
  }, [isAuthenticated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
