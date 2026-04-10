import { View, Text, StyleSheet } from "react-native";

import { theme } from "../constants/theme";

type MetricCardProps = {
    label: string;
    value: string;
    hint?: string;
    tone?: "default" | "accent";
};

export function MetricCard({
    label,
    value,
    hint,
    tone = "default",
}: MetricCardProps) {
    const accent = tone === "accent";

    return (
        <View style={[styles.card, accent && styles.cardAccent]}>
            <Text style={[styles.label, accent && styles.labelAccent]}>
                {label}
            </Text>
            <Text style={[styles.value, accent && styles.valueAccent]}>
                {value}
            </Text>
            {hint ? (
                <Text style={[styles.hint, accent && styles.hintAccent]}>
                    {hint}
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        minWidth: 150,
        padding: 18,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.line,
        ...theme.shadow,
    },
    cardAccent: {
        backgroundColor: theme.colors.forest,
        borderColor: theme.colors.forest,
    },
    label: {
        color: theme.colors.textMuted,
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 10,
    },
    labelAccent: {
        color: "#D7E9DE",
    },
    value: {
        color: theme.colors.ink,
        fontSize: 26,
        fontWeight: "800",
    },
    valueAccent: {
        color: theme.colors.white,
    },
    hint: {
        marginTop: 8,
        color: theme.colors.textMuted,
        fontSize: 13,
    },
    hintAccent: {
        color: "#E3F4EA",
    },
});
