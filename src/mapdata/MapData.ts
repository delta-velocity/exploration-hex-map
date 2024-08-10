import { create } from 'zustand';
import { produce, immerable } from 'immer';

export class TileVector {
    [immerable] = true;

    q: number;
    r: number;
    s: number;
    layer?: number;

    constructor(q: number, r: number, s?: number, layer?: number) {
        this.q = q;
        this.r = r;
        if (s === undefined || s != (-q - r)) {
            this.s = -q - r
        } else {
            this.s = s;
        }
        this.layer = layer;
    }

    toString(): string {
        return `(${this.q}, ${this.r}, ${this.s})`;
    }

    add(other: TileVector): TileVector {
        return new TileVector(
            this.q + other.q,
            this.r + other.r,
            this.s + other.s,

            this.layer !== undefined && other.layer !== undefined
                ? this.layer + other.layer
                : this.layer ?? other.layer
        );
    }

    sub(other: TileVector): TileVector {
        return new TileVector(
            this.q - other.q,
            this.r - other.r,
            this.s - other.s,

            this.layer !== undefined && other.layer !== undefined
                ? this.layer - other.layer
                : this.layer ?? other.layer
        );
    }
}

export class WorldAction {
    [immerable] = true;

    name: string;
    summary: string;
    description: string;
    imagePath: string;

    constructor(name: string, summary: string, description: string, imagePath: string) {
        this.name = name;
        this.summary = summary;
        this.description = description;
        this.imagePath = imagePath;
    }
}

export class TileData {
    [immerable] = true;

    location: TileVector;
    biome: string;
    interactions: WorldAction[];
    tileRenderData: any;

    constructor(location: TileVector, biome: string) {
        this.location = location;
        this.biome = biome;
        this.interactions = [];
        this.tileRenderData = {};
    }

    addAction(action: WorldAction) {
        this.interactions.push(action);
    }
}

export class TileLayer {
    [immerable] = true;

    tiles: { [key: string]: TileData };

    constructor() {
        this.tiles = {};
    }

    addTile(tileData: TileData, overwrite: boolean = false) {
        const tileKey = tileData.location.toString();
        if (this.tiles[tileKey] && !overwrite) {
            throw new Error(`Tile with key '${tileKey}' already exists. Use overwrite=true to force.`);
        }
        this.tiles[tileKey] = tileData;
    }
}

export class HexMapData {
    [immerable] = true;

    layers: { [key: string]: TileLayer };

    constructor() {
        this.layers = {};
    }

    addLayer(layerName: string, overwrite: boolean = false) {
        if (this.layers[layerName] && !overwrite) {
            throw new Error(`Layer with name '${layerName}' already exists. Use overwrite=true to force.`);
        }
        this.layers[layerName] = new TileLayer();
    }

    getTilesInRange(center: TileVector, range: number): TileData[] {
        const tiles: TileData[] = [] as TileData[];

        return tiles;
    }
}

type MapStore = {
    mapData: HexMapData;
    loadMap: (fileData: HexMapData) => void;
    saveMap: () => void;
    addLayer: (layerName: string, overwrite?: boolean) => void;
    addTile: (layerName: string, tileData: TileData, overwrite?: boolean) => void;
    addAction: (layerName: string, tileLocation: TileVector, action: WorldAction) => void;
}


const mapData = new HexMapData();
mapData.addLayer("0");
mapData.addLayer("0", true);
const tile = new TileData(new TileVector(0, 1, 2, 0), "default");
mapData.layers["0"].addTile(tile);
console.log(mapData);



export const useMapStore = create<MapStore>((set, get) => ({
    mapData: mapData, // Initialize with an empty map
    loadMap: (fileData) => set({ mapData: fileData }),
    saveMap: () => { /* serialize mapData to JSON and save */ },

    addLayer: (layerName, overwrite = false) => set(produce((state) => {
        state.mapData.addLayer(layerName, overwrite);
    })),

    addTile: (layerName, tileData, overwrite = false) => set(produce((state) => {
        const layer = state.mapData.layers[layerName];
        if (!layer) { throw new Error(`Layer '${layerName}' does not exist`); }
        layer.addTile(tileData, overwrite);
    })),

    addAction: (layerName, tileLocation, action) => set(produce((state) => {
        const layer = state.mapData.layers[layerName];
        if (!layer) { throw new Error(`Layer '${layerName}' does not exist`); }

        const tile = layer.tiles[tileLocation.toString()];
        if (!tile) { throw new Error(`Tile at location ${tileLocation} does not exist`); }

        tile.addAction(action);
    }))
}));