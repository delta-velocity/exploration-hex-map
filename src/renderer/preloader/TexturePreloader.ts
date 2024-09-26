import { MappedTextureType } from "@react-three/drei";
import { create } from "zustand";

// Helper function to set value in nested object using slash notation
function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const parts = path.split('/').filter(part => part);
    const fileName = parts[parts.length - 1];
    const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');
    let current = obj;

    parts.slice(0, -1).forEach(part => {
        if (!current[part]) {
            current[part] = {};
        }
        current = current[part];
    });

    current[fileNameWithoutExt] = value;
}

interface TextureState {
    textures: Record<string, any>;
    textureCount: number;
    setTexture: (key: string, texture: MappedTextureType<any>) => void;
}

export const useTextureStore = create<TextureState>((set) => ({
    textures: {},
    textureCount: 0,
    setTexture: (path: string, texture: MappedTextureType<any>) =>
        set((state) => {
            setNestedValue(state.textures, path, texture);
            return { textures: { ...state.textures }, textureCount: state.textureCount + 1 };
        }),
}));