import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import { BrandLogo } from "./src/components/BrandLogo";
import { MetricCard } from "./src/components/MetricCard";
import { SimpleBarChart } from "./src/components/SimpleBarChart";
import { SplashGate } from "./src/components/SplashGate";
import { theme } from "./src/constants/theme";
import type { AppSettings, Measurement } from "./src/types";
import {
    calculateDensityMeasurement,
    formatDateTime,
    formatDecimal,
    formatInteger,
    formatVolume,
} from "./src/utils/calculations";
import { exportHistoryAsCsv, exportHistoryAsPdf } from "./src/utils/exporters";

type TabKey = "painel" | "historico" | "analises" | "sobre";

type ResultState = ReturnType<typeof calculateDensityMeasurement> | null;

const SETTINGS_KEY = "@silagem-admin/settings";
const HISTORY_KEY = "@silagem-admin/history";
const DEFAULT_SETTINGS: AppSettings = { diameterMm: 48 };
const TABS: Array<{ key: TabKey; label: string }> = [
    { key: "painel", label: "Painel" },
    { key: "historico", label: "Histórico" },
    { key: "analises", label: "Análises" },
    { key: "sobre", label: "Sobre" },
];

function parseLocalizedNumber(value: string) {
    return Number(value.replace(",", "."));
}

function createMeasurement(
    result: NonNullable<ResultState>,
    settings: AppSettings,
    depthCm: number,
    massG: number,
): Measurement {
    return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        diameterMm: settings.diameterMm,
        depthCm,
        massG,
        volumeM3: result.volumeM3,
        densityKgM3: result.densityKgM3,
        createdAt: new Date().toISOString(),
    };
}

export default function App() {
    const [bootFinished, setBootFinished] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>("painel");
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [depthValue, setDepthValue] = useState("17");
    const [massValue, setMassValue] = useState("240");
    const [result, setResult] = useState<ResultState>(null);
    const [history, setHistory] = useState<Measurement[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        async function hydrate() {
            try {
                const [settingsRaw, historyRaw] = await AsyncStorage.multiGet([
                    SETTINGS_KEY,
                    HISTORY_KEY,
                ]);
                const parsedSettings = settingsRaw[1]
                    ? (JSON.parse(settingsRaw[1]) as AppSettings)
                    : DEFAULT_SETTINGS;
                const parsedHistory = historyRaw[1]
                    ? (JSON.parse(historyRaw[1]) as Measurement[])
                    : [];

                setSettings(parsedSettings);
                setHistory(parsedHistory);
            } catch (error) {
                Alert.alert(
                    "Falha ao carregar dados",
                    "Não foi possivel recuperar as configurações locais.",
                );
            } finally {
                setIsHydrated(true);
            }
        }

        hydrate();
    }, []);

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(
            () => {
                Alert.alert(
                    "Falha ao salvar",
                    "As configurações não puderam ser persistidas localmente.",
                );
            },
        );
    }, [isHydrated, settings]);

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(() => {
            Alert.alert(
                "Falha ao salvar",
                "O histórico não pôde ser persistido localmente.",
            );
        });
    }, [history, isHydrated]);

    const latestMeasurement = history[0] ?? null;
    const averageDensity = useMemo(() => {
        if (!history.length) {
            return 0;
        }

        return (
            history.reduce((sum, item) => sum + item.densityKgM3, 0) /
            history.length
        );
    }, [history]);
    const highestDensity = useMemo(() => {
        if (!history.length) {
            return 0;
        }

        return Math.max(...history.map((item) => item.densityKgM3));
    }, [history]);
    const chartItems = useMemo(() => history.slice(0, 7).reverse(), [history]);

    const saveMeasurement = () => {
        const depthCm = parseLocalizedNumber(depthValue);
        const massG = parseLocalizedNumber(massValue);

        if (!Number.isFinite(depthCm) || !Number.isFinite(massG)) {
            Alert.alert(
                "Dados inválidos",
                "Informe profundidade e massa usando números válidos.",
            );
            return;
        }

        try {
            const nextResult = calculateDensityMeasurement({
                diameterMm: settings.diameterMm,
                depthCm,
                massG,
            });
            const nextMeasurement = createMeasurement(
                nextResult,
                settings,
                depthCm,
                massG,
            );

            setResult(nextResult);
            setHistory((current) => [nextMeasurement, ...current]);
            setActiveTab("historico");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Não foi possível concluir o cálculo.";
            Alert.alert("Falha no cálculo", message);
        }
    };

    const runPreview = () => {
        const depthCm = parseLocalizedNumber(depthValue);
        const massG = parseLocalizedNumber(massValue);

        if (!Number.isFinite(depthCm) || !Number.isFinite(massG)) {
            Alert.alert(
                "Dados inválidos",
                "Informe profundidade e massa usando números válidos.",
            );
            return;
        }

        try {
            const nextResult = calculateDensityMeasurement({
                diameterMm: settings.diameterMm,
                depthCm,
                massG,
            });
            setResult(nextResult);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Não foi possível concluir o cálculo.";
            Alert.alert("Falha no cálculo", message);
        }
    };

    const clearForm = () => {
        setDepthValue("");
        setMassValue("");
        setResult(null);
    };

    const updateDiameter = (value: string) => {
        const parsed = parseLocalizedNumber(value);

        if (!Number.isFinite(parsed)) {
            setSettings(DEFAULT_SETTINGS);
            return;
        }

        setSettings({ diameterMm: parsed });
    };

    const removeMeasurement = (id: string) => {
        setHistory((current) => current.filter((entry) => entry.id !== id));
    };

    const clearHistory = () => {
        Alert.alert(
            "Limpar histórico.",
            "Deseja remover todas as medições salvas ?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: () => setHistory([]),
                },
            ],
        );
    };

    const handleExport = async (type: "csv" | "pdf") => {
        if (!history.length) {
            Alert.alert(
                "Sem dados",
                "Salve ao menos uma medição antes de exportar.",
            );
            return;
        }

        try {
            setIsExporting(true);
            if (type === "csv") {
                await exportHistoryAsCsv(history);
            } else {
                await exportHistoryAsPdf(history, settings.diameterMm);
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Falha ao exportar relatório.";
            Alert.alert("Exportação indisponível", message);
        } finally {
            setIsExporting(false);
        }
    };

    if (!bootFinished || !isHydrated) {
        return <SplashGate onFinish={() => setBootFinished(true)} />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.content}>
                <LinearGradient
                    colors={[theme.colors.forest, "#1C4A39", "#9AAC79"]}
                    style={styles.hero}
                >
                    <BrandLogo compact />
                    <View style={styles.heroTextWrap}>
                        <Text style={styles.heroTitle}>
                            Painel administrativo da densidade de silagem
                        </Text>
                        <Text style={styles.heroText}>
                            Controle parâmetros da sonda, registre medições em
                            campo e gere relatórios compartilháveis.
                        </Text>
                    </View>
                </LinearGradient>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsWrap}
                >
                    {TABS.map((tab) => {
                        const selected = activeTab === tab.key;
                        return (
                            <Pressable
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key)}
                                style={[
                                    styles.tabPill,
                                    selected && styles.tabPillActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        selected && styles.tabLabelActive,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {activeTab === "painel" ? (
                    <View style={styles.sectionGap}>
                        <View style={styles.metricsGrid}>
                            <MetricCard
                                label="Última densidade"
                                value={
                                    latestMeasurement
                                        ? `${formatInteger(latestMeasurement.densityKgM3)} kg/m³`
                                        : "--"
                                }
                                hint={
                                    latestMeasurement
                                        ? formatDateTime(
                                              latestMeasurement.createdAt,
                                          )
                                        : "Nenhuma medição salva"
                                }
                                tone="accent"
                            />
                            <MetricCard
                                label="Média geral"
                                value={`${formatInteger(averageDensity)} kg/m³`}
                                hint={`${history.length} registro(s)`}
                            />
                            <MetricCard
                                label="Maior valor"
                                value={`${formatInteger(highestDensity)} kg/m³`}
                                hint="Pico observado"
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Configuração da sonda
                            </Text>
                            <Text style={styles.sectionText}>
                                O diâmetro é configurável em milímetros e a área
                                interna é recalculada automaticamente.
                            </Text>
                            <Text style={styles.inputLabel}>
                                Diâmetro da sonda (mm)
                            </Text>
                            <TextInput
                                value={settings.diameterMm
                                    .toString()
                                    .replace(".", ",")}
                                onChangeText={updateDiameter}
                                style={styles.input}
                                keyboardType="decimal-pad"
                                placeholder="48,0"
                                placeholderTextColor="#7B877E"
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Nova medição
                            </Text>
                            <Text style={styles.sectionText}>
                                Use valores positivos. O sistema converte cm³
                                para m³ e g para kg antes do cálculo da
                                densidade.
                            </Text>
                            <View style={styles.twoColumns}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>
                                        Profundidade (cm)
                                    </Text>
                                    <TextInput
                                        value={depthValue}
                                        onChangeText={setDepthValue}
                                        style={styles.input}
                                        keyboardType="decimal-pad"
                                        placeholder="17,0"
                                        placeholderTextColor="#7B877E"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>
                                        Massa (g)
                                    </Text>
                                    <TextInput
                                        value={massValue}
                                        onChangeText={setMassValue}
                                        style={styles.input}
                                        keyboardType="decimal-pad"
                                        placeholder="240,0"
                                        placeholderTextColor="#7B877E"
                                    />
                                </View>
                            </View>

                            <View style={styles.actionsRow}>
                                <Pressable
                                    style={[styles.button, styles.buttonGhost]}
                                    onPress={runPreview}
                                >
                                    <Text style={styles.buttonGhostText}>
                                        Pré-visualizar
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={styles.button}
                                    onPress={saveMeasurement}
                                >
                                    <Text style={styles.buttonText}>
                                        Calcular e salvar
                                    </Text>
                                </Pressable>
                            </View>
                            <Pressable
                                style={styles.linkButton}
                                onPress={clearForm}
                            >
                                <Text style={styles.linkButtonText}>
                                    Limpar campos
                                </Text>
                            </Pressable>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Resultado atual
                            </Text>
                            {result ? (
                                <View style={styles.resultGrid}>
                                    <MetricCard
                                        label="Raio"
                                        value={`${formatDecimal(result.radiusCm, 2)} cm`}
                                    />
                                    <MetricCard
                                        label="Área"
                                        value={`${formatDecimal(result.areaCm2, 4)} cm²`}
                                    />
                                    <MetricCard
                                        label="Volume"
                                        value={`${formatVolume(result.volumeM3)} m³`}
                                    />
                                    <MetricCard
                                        label="Densidade"
                                        value={`${formatInteger(result.densityKgM3)} kg/m³`}
                                        tone="accent"
                                    />
                                </View>
                            ) : (
                                <Text style={styles.sectionText}>
                                    Execute uma pré-visualização ou salve uma
                                    medição para ver os resultados detalhados.
                                </Text>
                            )}
                        </View>
                    </View>
                ) : null}

                {activeTab === "historico" ? (
                    <View style={styles.sectionGap}>
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Histórico de medições
                            </Text>
                            <Text style={styles.sectionText}>
                                Registros persistidos localmente no dispositivo.
                            </Text>
                            <Pressable
                                style={styles.dangerButtonBlock}
                                onPress={clearHistory}
                            >
                                <Text style={styles.smallDangerButtonText}>
                                    Limpar todo o histórico
                                </Text>
                            </Pressable>
                        </View>

                        {history.length ? (
                            history.map((entry) => (
                                <View key={entry.id} style={styles.card}>
                                    <View style={styles.rowBetween}>
                                        <View style={styles.historyMain}>
                                            <Text style={styles.historyDensity}>
                                                {formatInteger(
                                                    entry.densityKgM3,
                                                )}{" "}
                                                kg/m³
                                            </Text>
                                            <Text style={styles.historyMeta}>
                                                {formatDateTime(
                                                    entry.createdAt,
                                                )}
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() =>
                                                removeMeasurement(entry.id)
                                            }
                                        >
                                            <Text style={styles.deleteText}>
                                                Remover
                                            </Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.historyGrid}>
                                        <Text style={styles.historyInfo}>
                                            Diâmetro:{" "}
                                            {formatDecimal(entry.diameterMm, 1)}{" "}
                                            mm
                                        </Text>
                                        <Text style={styles.historyInfo}>
                                            Profundidade:{" "}
                                            {formatDecimal(entry.depthCm, 1)} cm
                                        </Text>
                                        <Text style={styles.historyInfo}>
                                            Massa:{" "}
                                            {formatDecimal(entry.massG, 1)} g
                                        </Text>
                                        <Text style={styles.historyInfo}>
                                            Volume:{" "}
                                            {formatVolume(entry.volumeM3)} m³
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.card}>
                                <Text style={styles.sectionText}>
                                    Nenhuma medição foi registrada ainda.
                                </Text>
                            </View>
                        )}
                    </View>
                ) : null}

                {activeTab === "analises" ? (
                    <View style={styles.sectionGap}>
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Tendência das últimas medições
                            </Text>
                            <Text style={styles.sectionText}>
                                Leitura rápida das últimas sete densidades
                                salvas.
                            </Text>
                            <SimpleBarChart items={chartItems} />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Exportação</Text>
                            <Text style={styles.sectionText}>
                                Gere saídas para compartilhamento administrativo
                                e uso em planilhas.
                            </Text>
                            <View style={styles.actionsRow}>
                                <Pressable
                                    style={[styles.button, styles.buttonGhost]}
                                    onPress={() => handleExport("csv")}
                                    disabled={isExporting}
                                >
                                    <Text style={styles.buttonGhostText}>
                                        Exportar CSV
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={styles.button}
                                    onPress={() => handleExport("pdf")}
                                    disabled={isExporting}
                                >
                                    <Text style={styles.buttonText}>
                                        {isExporting
                                            ? "Processando..."
                                            : "Exportar PDF"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                ) : null}

                {activeTab === "sobre" ? (
                    <View style={styles.sectionGap}>
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Perfil do criador
                            </Text>
                            <Text style={styles.sectionText}>
                                Área institucional para identificação do
                                responsável pelo projeto.
                            </Text>
                            <Image
                                source={require("./ozeias.jpg")}
                                style={styles.profileImage}
                            />
                            <View style={styles.profileBox}>
                                <Text style={styles.profileName}>
                                    Ozeias Meira Santos de Souza
                                </Text>
                                <Text style={styles.profileInfo}>
                                    Nascimento: 12/08/1998
                                </Text>
                                <Text style={styles.profileInfo}>
                                    Especialista em arquitetura de sistema
                                </Text>
                            </View>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Como os cálculos são feitos
                            </Text>
                            <Text style={styles.sectionText}>
                                1) Convertemos o diâmetro da sonda de mm para cm
                                e calculamos o raio: r = d/2.
                            </Text>
                            <Text style={styles.sectionText}>
                                2) Calculamos a área interna da sonda com A = π
                                × r², em cm².
                            </Text>
                            <Text style={styles.sectionText}>
                                3) Calculamos o volume coletado com V = A × h,
                                onde h é a profundidade em cm, obtendo cm³.
                            </Text>
                            <Text style={styles.sectionText}>
                                4) Convertendo unidades: V(m³) =
                                V(cm³)/1.000.000 e M(kg) = M(g)/1000.
                            </Text>
                            <Text style={styles.sectionText}>
                                5) Densidade final: ρ = M/V, com saída em kg/m³.
                                O app exibe também o valor arredondado para uso
                                operacional.
                            </Text>
                        </View>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.sand,
    },
    content: {
        padding: 18,
        paddingTop: 34,
        gap: 16,
    },
    hero: {
        borderRadius: theme.radius.xl,
        padding: 22,
        gap: 16,
    },
    heroTextWrap: {
        gap: 8,
    },
    heroTitle: {
        color: theme.colors.white,
        fontSize: 29,
        lineHeight: 34,
        fontWeight: "800",
        maxWidth: 320,
    },
    heroText: {
        color: "#E3F4EA",
        fontSize: 15,
        lineHeight: 22,
        maxWidth: 360,
    },
    tabsWrap: {
        gap: 10,
        paddingVertical: 4,
    },
    tabPill: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: "#E3D8C8",
    },
    tabPillActive: {
        backgroundColor: theme.colors.ink,
    },
    tabLabel: {
        color: theme.colors.ink,
        fontWeight: "700",
    },
    tabLabelActive: {
        color: theme.colors.white,
    },
    sectionGap: {
        gap: 16,
    },
    metricsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 14,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: 20,
        gap: 14,
        borderWidth: 1,
        borderColor: theme.colors.line,
        ...theme.shadow,
    },
    sectionTitle: {
        color: theme.colors.ink,
        fontSize: 20,
        fontWeight: "800",
    },
    sectionText: {
        color: theme.colors.textMuted,
        lineHeight: 21,
    },
    twoColumns: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    inputGroup: {
        flex: 1,
        minWidth: 140,
        gap: 8,
    },
    inputLabel: {
        color: theme.colors.ink,
        fontSize: 13,
        fontWeight: "700",
    },
    input: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.line,
        backgroundColor: "#FBF7EF",
        paddingHorizontal: 16,
        color: theme.colors.ink,
        fontSize: 16,
        fontWeight: "600",
    },
    actionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    button: {
        minHeight: 52,
        paddingHorizontal: 18,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.forest,
    },
    buttonGhost: {
        backgroundColor: "#E8DDCB",
    },
    buttonText: {
        color: theme.colors.white,
        fontWeight: "800",
    },
    buttonGhostText: {
        color: theme.colors.ink,
        fontWeight: "800",
    },
    linkButton: {
        alignSelf: "flex-start",
    },
    linkButtonText: {
        color: theme.colors.accent,
        fontWeight: "800",
    },
    resultGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    rowBetween: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    smallDangerButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: "#F5D3CF",
    },
    dangerButtonBlock: {
        alignSelf: "flex-start",
        marginTop: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: "#F5D3CF",
    },
    smallDangerButtonText: {
        color: theme.colors.danger,
        fontWeight: "800",
    },
    historyMain: {
        gap: 4,
    },
    historyDensity: {
        color: theme.colors.ink,
        fontSize: 24,
        fontWeight: "800",
    },
    historyMeta: {
        color: theme.colors.textMuted,
    },
    historyGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    historyInfo: {
        color: theme.colors.ink,
        minWidth: 140,
    },
    deleteText: {
        color: theme.colors.danger,
        fontWeight: "700",
    },
    profileImage: {
        width: "100%",
        height: 320,
        borderRadius: 24,
        backgroundColor: "#D9D9D9",
    },
    profileBox: {
        gap: 6,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#F6F1E7",
    },
    profileName: {
        color: theme.colors.ink,
        fontSize: 21,
        fontWeight: "800",
    },
    profileInfo: {
        color: theme.colors.textMuted,
        fontSize: 15,
    },
});
