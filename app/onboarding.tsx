import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: "Welcome to Priority Todo",
    description: "Your personal task manager for better productivity",
    icon: "checkbox",
    color: "#007AFF",
  },
  {
    id: 2,
    title: "Smart Categories",
    description: "Organize tasks into Work, Personal, and Urgent categories",
    icon: "layers",
    color: "#FF9500",
  },
  {
    id: 3,
    title: "Set Priorities",
    description: "Focus on what matters most with priority levels",
    icon: "star",
    color: "#FF2D55",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    translateX.value = event.contentOffset.x;
  });

  const handleGetStarted = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      router.push("/login");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.push("/login");
    }
  };

  const skipOnboarding = async () => {
    try {
      Haptics.selectionAsync();
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      router.push("/login");
    } catch (error) {
      router.push("/login");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 20 }]}
        onPress={skipOnboarding}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {ONBOARDING_SLIDES.map((slide, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const iconStyle = useAnimatedStyle(() => {
            const scale = interpolate(
              translateX.value,
              inputRange,
              [0.5, 1, 0.5],
              Extrapolation.CLAMP
            );
            const opacity = interpolate(
              translateX.value,
              inputRange,
              [0.3, 1, 0.3],
              Extrapolation.CLAMP
            );
            return { transform: [{ scale }], opacity };
          });

          const textStyle = useAnimatedStyle(() => {
            const translateY = interpolate(
              translateX.value,
              inputRange,
              [20, 0, 20],
              Extrapolation.CLAMP
            );
            const opacity = interpolate(
              translateX.value,
              inputRange,
              [0, 1, 0],
              Extrapolation.CLAMP
            );
            return { transform: [{ translateY }], opacity };
          });

          return (
            <View
              key={slide.id}
              style={[styles.slide, { width: SCREEN_WIDTH }]}
            >
              <Animated.View style={[styles.iconContainer, iconStyle]}>
                <Ionicons
                  name={slide.icon as any}
                  size={120}
                  color={slide.color}
                />
              </Animated.View>
              <Animated.View style={textStyle}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: 20,
          },
        ]}
      >
        <View style={styles.pagination}>
          {ONBOARDING_SLIDES.map((_, index) => {
            const dotStyle = useAnimatedStyle(() => {
              const inputRange = [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ];
              const width = interpolate(
                translateX.value,
                inputRange,
                [8, 20, 8],
                Extrapolation.CLAMP
              );
              const opacity = interpolate(
                translateX.value,
                inputRange,
                [0.5, 1, 0.5],
                Extrapolation.CLAMP
              );
              return { width, opacity };
            });

            return (
              <Animated.View
                key={index}
                style={[styles.paginationDot, dotStyle]}
              />
            );
          })}
        </View>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  skipButton: {
    position: "absolute",
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  skipText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#000",
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  footer: {
    paddingTop: 20,
    backgroundColor: "#F2F2F7",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginHorizontal: 4,
  },
  getStartedButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
});
