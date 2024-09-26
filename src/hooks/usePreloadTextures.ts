import { textureUrls } from '@/config/textureUrls';
import { useTextureStore } from '@/renderer/preloader/TexturePreloader';
import getConfig from 'next/config';
import { useEffect } from 'react';
import * as THREE from 'three';

const usePreloadTextures = () => {
    const setTexture = useTextureStore((state) => state.setTexture);
  
    useEffect(() => {
      const preloadTextures = async () => {
        await Promise.all(
          textureUrls.map(async (url: string) => {
            const texture = await loadTexture(url);
            setTexture(url, texture);
          })
        );
      };
  
      preloadTextures();
    }, [setTexture]);
  };
  
  const loadTexture = async (url: string): Promise<THREE.Texture> => {
    // Implement your texture loading logic here
    // This is a placeholder implementation
    console.log('here?');
    console.log(process.env.basePath);
    console.log('here!');
    return new Promise((resolve) => {
      const texture = new THREE.Texture();
      texture.image = new Image();
      texture.image.src = `${process.env.basePath}/${url}`;
      texture.needsUpdate = true;
  
      texture.image.onload = () => {
        resolve(texture);
      };
    });
  };
  
  export default usePreloadTextures;