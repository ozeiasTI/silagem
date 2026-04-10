import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "../constants/theme";
import { BrandLogo } from "./BrandLogo";

type SplashGateProps = {
    onFinish: () => void;
};

export function SplashGate({ onFinish }: SplashGateProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 450,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 450,
                useNativeDriver: true,
            }),
        ]).start();

        const timeout = setTimeout(onFinish, 3200);
        return () => clearTimeout(timeout);
    }, [onFinish, opacity, translateY]);

    return (
        <LinearGradient
            colors={[theme.colors.forest, "#1E4B39", "#9EAF7A"]}
            style={styles.screen}
        >
            <Animated.View
                style={[
                    styles.card,
                    {
                        opacity,
                        transform: [{ translateY }],
                    },
                ]}
            >
                <BrandLogo />
                <Text style={styles.headline}>
                    Gestão técnica para densidade de silagens
                </Text>
                <Text style={styles.caption}>
                    Cálculo preciso, histórico persistido e relatórios prontos
                    para compartilhar.
                </Text>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: "center",
    },
    card: {
        backgroundColor: "rgba(255, 253, 248, 0.92)",
        borderRadius: theme.radius.xl,
        padding: 28,
        gap: 18,
        ...theme.shadow,
    },
    headline: {
        color: theme.colors.ink,
        fontSize: 28,
        lineHeight: 34,
        fontWeight: "800",
    },
    caption: {
        color: theme.colors.textMuted,
        fontSize: 15,
        lineHeight: 22,
    },
});
