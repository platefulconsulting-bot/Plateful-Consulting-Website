"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type * as THREE from "three";

/**
 * Compiles every shader and uploads every texture in the scene up front.
 *
 * three.js compiles a material the first time an object using it is drawn, and
 * uploads a texture the first time it is sampled. With each chapter hidden until
 * its section arrives, that work would otherwise land mid-scroll — a dropped
 * frame the first time every chapter appears. Doing it once at load, while the
 * hero is on screen and nobody is scrolling yet, moves the cost out of the way.
 */
export function Prewarm() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    // Next frame, so every chapter has been added to the scene graph.
    const id = requestAnimationFrame(() => {
      const hidden: THREE.Object3D[] = [];

      scene.traverse((obj) => {
        // The compiler skips what it would not draw, so briefly show everything.
        if (!obj.visible) {
          hidden.push(obj);
          obj.visible = true;
        }
        const material = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        const list = material ? (Array.isArray(material) ? material : [material]) : [];
        for (const m of list) {
          const map = (m as THREE.MeshBasicMaterial).map;
          if (map) gl.initTexture(map);
        }
      });

      // Parallel compile where the driver supports it; never blocks a frame.
      gl.compileAsync(scene, camera).catch(() => {});

      for (const obj of hidden) obj.visible = false;
    });

    return () => cancelAnimationFrame(id);
  }, [gl, scene, camera]);

  return null;
}
