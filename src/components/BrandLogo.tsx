import { View, Text, StyleSheet } from "react-native";

import { theme } from "../constants/theme";

type BrandLogoProps = {
    compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
    return (
        <View style={[styles.row, compact && styles.rowCompact]}>
            <View style={[styles.mark, compact && styles.markCompact]}>
                <View style={styles.ring} />
                <View style={styles.core}>
                    <Text
                        style={[
                            styles.coreText,
                            compact && styles.coreTextCompact,
                        ]}
                    >
                        S
                    </Text>
                </View>
            </View>
            <View>
                <Text style={[styles.kicker, compact && styles.kickerCompact]}>
                    OZEIAS MEIRA
                </Text>
                <Text style={[styles.title, compact && styles.titleCompact]}>
                    Silagem
                </Text>
                {!compact ? (
                    <Text style={styles.subtitle}>
                        Medição, histórico e relatórios em campo.
                    </Text>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    rowCompact: {
        gap: 12,
    },
    mark: {
        width: 74,
        height: 74,
        borderRadius: 26,
        backgroundColor: theme.colors.clay,
        alignItems: "center",
        justifyContent: "center",
    },
    markCompact: {
        width: 54,
        height: 54,
        borderRadius: 18,
    },
    ring: {
        position: "absolute",
        width: "78%",
        height: "78%",
        borderRadius: 999,
        borderWidth: 3,
        borderColor: theme.colors.forest,
    },
    core: {
        width: "56%",
        height: "56%",
        borderRadius: 999,
        backgroundColor: theme.colors.forest,
        alignItems: "center",
        justifyContent: "center",
    },
    coreText: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: 1.2,
    },
    coreTextCompact: {
        fontSize: 14,
    },
    kicker: {
        color: theme.colors.accent,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.6,
        marginBottom: 2,
    },
    kickerCompact: {
        fontSize: 9,
    },
    title: {
        color: theme.colors.ink,
        fontSize: 26,
        fontWeight: "800",
    },
    titleCompact: {
        fontSize: 18,
    },
    subtitle: {
        marginTop: 4,
        color: theme.colors.textMuted,
        maxWidth: 220,
    },
});
