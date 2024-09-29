import React, { useState } from "react";
import { Html } from "@react-three/drei";
import { Vector3 } from "three";
import { ThreeEvent } from "@react-three/fiber";
import useCameraStore from "@/renderer/camera/CameraStore";

export const ObjectWithMenu: React.FC<{
    children: React.ReactNode;
    group: React.ReactNode;
}> = ({ children, group }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const translationOffset = useCameraStore().translationOffset;

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const position = new Vector3(0, 0, 0);
        event.object.getWorldPosition(position);
        translationOffset.x = position.x;
        translationOffset.z = position.z;

        if (event.nativeEvent.detail == 1) {
            const closeMenu = (ev: MouseEvent) => {
                if (ev.detail == 1) {
                    setIsMenuOpen(false);
                    setTimeout(() => {
                        window.removeEventListener("click", closeMenu);
                    }, 0);
                }
            };

            if (!isMenuOpen) {
                setTimeout(() => {
                    window.addEventListener("click", closeMenu);
                }, 0);
            }

            setIsMenuOpen(true);
        }
    };

    return (
        <>
            <group onClick={handleClick}>{group}</group>
            <Html name="menu">{isMenuOpen && <>{children}</>}</Html>
        </>
    );
};
