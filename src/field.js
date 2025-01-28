import * as THREE from "three";

export function createField() {
    const textureLoader = new THREE.TextureLoader();
    const grassAlbedo = textureLoader.load('/textures/field/brown_mud_leaves_01_diff_4k.jpg');
    grassAlbedo.colorSpace = THREE.SRGBColorSpace;
    grassAlbedo.repeat.set(1000, 1000);
    grassAlbedo.wrapS = THREE.RepeatWrapping;
    grassAlbedo.wrapT = THREE.RepeatWrapping;

    const grassMaterial = new THREE.MeshStandardMaterial({
        map: grassAlbedo,
        roughnessMap: textureLoader.load('/textures/field/brown_mud_leaves_01_rough_4k.exr'),
        //metalnessMap: textureLoader.load('/textures/whispy-grass-meadow-bl/wispy-grass-meadow_metallic.png'),
        normalMap: textureLoader.load('/textures/field/brown_mud_leaves_01_nor_gl_4k.exr'),
        displacementMap: textureLoader.load('/textures/field/brown_mud_leaves_01_disp_4k.png'),
        //aoMap: textureLoader.load('/textures/whispy-grass-meadow-bl/wispy-grass-meadow_ao.png'),
        displacementScale: 0.1
    });

    const circleGeometry = new THREE.CircleGeometry(1000, 64);
    circleGeometry.rotateX(-Math.PI / 2);

    const field = new THREE.Mesh(circleGeometry, grassMaterial);
    return field;
}