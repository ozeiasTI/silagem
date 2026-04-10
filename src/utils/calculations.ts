type MeasurementInput = {
    diameterMm: number;
    depthCm: number;
    massG: number;
};

export function isPositiveNumber(value: number) {
    return Number.isFinite(value) && value > 0;
}

export function calculateDensityMeasurement({
    diameterMm,
    depthCm,
    massG,
}: MeasurementInput) {
    if (
        !isPositiveNumber(diameterMm) ||
        !isPositiveNumber(depthCm) ||
        !isPositiveNumber(massG)
    ) {
        throw new Error(
            "Valores de diâmetro, profundidade e massa devem ser maiores que zero.",
        );
    }

    const diameterCm = diameterMm / 10;
    const radiusCm = diameterCm / 2;
    const areaCm2 = Math.PI * radiusCm * radiusCm;
    const volumeCm3 = areaCm2 * depthCm;
    const volumeM3 = volumeCm3 / 1_000_000;
    const massKg = massG / 1000;

    if (volumeM3 <= 0) {
        throw new Error("O volume calculado é inválido.");
    }

    const densityKgM3 = massKg / volumeM3;

    return {
        diameterCm,
        radiusCm,
        areaCm2,
        volumeCm3,
        volumeM3,
        massKg,
        densityKgM3,
        densityRounded: Math.round(densityKgM3),
    };
}

export function formatDecimal(value: number, digits = 1) {
    return value.toLocaleString("pt-BR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

export function formatInteger(value: number) {
    return Math.round(value).toLocaleString("pt-BR");
}

export function formatVolume(value: number) {
    return value.toLocaleString("pt-BR", {
        minimumFractionDigits: 6,
        maximumFractionDigits: 9,
    });
}

export function formatDateTime(value: string) {
    return new Date(value).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}
