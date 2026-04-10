export type Measurement = {
    id: string;
    diameterMm: number;
    depthCm: number;
    massG: number;
    volumeM3: number;
    densityKgM3: number;
    createdAt: string;
};

export type AppSettings = {
    diameterMm: number;
};
