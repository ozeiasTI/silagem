import { View, Text, StyleSheet } from "react-native";

import { theme } from "../constants/theme";
import type { Measurement } from "../types";

type SimpleBarChartProps = {
    items: Measurement[];
};

export function SimpleBarChart({ items }: SimpleBarChartProps) {
    if (!items.length) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Sem dados suficientes</Text>
                <Text style={styles.emptyText}>
                    Salve medições para visualizar a tendência de densidade.
                </Text>
            </View>
        );
    }

    const maxDensity = Math.max(...items.map((item) => item.densityKgM3), 1);

    return (
        <View style={styles.chartWrap}>
            {items.map((item) => {
                const height = Math.max(
                    28,
                    (item.densityKgM3 / maxDensity) * 150,
                );
                const label = new Date(item.createdAt).toLocaleDateString(
                    "pt-BR",
                    {
                        day: "2-digit",
                        month: "2-digit",
                    },
                );

                return (
                    <View key={item.id} style={styles.barGroup}>
                        <Text style={styles.barValue}>
                            {Math.round(item.densityKgM3)}
                        </Text>
                        <View style={styles.track}>
                            <View style={[styles.bar, { height }]} />
                        </View>
                        <Text style={styles.barLabel}>{label}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    chartWrap: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 10,
        minHeight: 220,
    },
    barGroup: {
        flex: 1,
        alignItems: "center",
        gap: 8,
    },
    track: {
        width: "100%",
        maxWidth: 40,
        height: 160,
        borderRadius: 18,
        backgroundColor: "#E7DDCD",
        justifyContent: "flex-end",
        padding: 5,
    },
    bar: {
        width: "100%",
        borderRadius: 14,
        backgroundColor: theme.colors.accent,
    },
    barValue: {
        color: theme.colors.ink,
        fontSize: 12,
        fontWeight: "700",
    },
    barLabel: {
        color: theme.colors.textMuted,
        fontSize: 11,
    },
    emptyState: {
        paddingVertical: 24,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    emptyTitle: {
        color: theme.colors.ink,
        fontSize: 16,
        fontWeight: "700",
    },
    emptyText: {
        color: theme.colors.textMuted,
        textAlign: "center",
    },
});
