import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/**
 * HORROR FOREST SYSTEM - SINGLE TREE1 DENSE WILDERNESS
 * Focuses exclusively on tree1.glb, instancing it massively (85+ instances)
 * across the full view distance as far as the eye can see.
 */
export class HorrorForestSystem {
  constructor(scene) {
    this.scene = scene;
    this.forestGroup = new THREE.Group();
    this.scene.add(this.forestGroup);

    this.loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.loader.setDRACOLoader(dracoLoader);

    // Single target: tree1.glb (and common alias names for tree 1)
    this.candidateTree1Paths = [
      '/models/tree1.glb',
      '/models/tree_1.glb',
      '/models/tree.glb',
      '/models/horror_tree1.glb',
      '/models/pohon1.glb',
      '/models/pohon.glb',
    ];

    this.instancesCount = 85; // Massively multiplied as far as the eye can see!
  }

  async loadForest() {
    let tree1Model = null;

    // Scan for tree1 GLB model
    for (const path of this.candidateTree1Paths) {
      tree1Model = await this._loadSingleTreeGLB(path);
      if (tree1Model) {
        console.info(`[HorrorForestSystem] Successfully loaded tree1 GLB model from '${path}'.`);
        break;
      }
    }

    if (tree1Model) {
      // Scatter tree1 GLB model 85+ times across the full view distance
      this._scatterTree1Instances(tree1Model, this.instancesCount);
    } else {
      console.info('[HorrorForestSystem] tree1.glb slot ready at /models/tree1.glb. Generating 75 procedural horror trees as far as the eye can see...');
      this._generateProceduralHorrorForest(75);
    }
  }

  _loadSingleTreeGLB(path) {
    return new Promise((resolve) => {
      this.loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.dithering = true;
              }
            }
          });
          resolve(model);
        },
        undefined,
        () => {
          resolve(null);
        }
      );
    });
  }

  _scatterTree1Instances(baseModel, count) {
    for (let i = 0; i < count; i++) {
      const clone = baseModel.clone(true);

      // Random position across full view distance (minRadius: 4.5m away from character, maxRadius: 42.0m)
      const radius = 4.5 + Math.random() * 37.5;
      const angle = Math.random() * Math.PI * 2;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0;

      clone.position.set(x, y, z);

      // Random Y-axis rotation so trees look distinct & organic
      clone.rotation.y = Math.random() * Math.PI * 2;

      // Random scale variation for natural forest density (0.75x to 1.45x)
      const scaleVar = 0.75 + Math.random() * 0.70;
      clone.scale.multiplyScalar(scaleVar);

      this.forestGroup.add(clone);
    }
  }

  _generateProceduralHorrorForest(count) {
    // Single organic horror tree geometry pattern representing tree 1
    const treeGeo = this._createTree1Geo();

    const barkMaterial = new THREE.MeshStandardMaterial({
      color: 0x120d0e,
      roughness: 0.9,
      metalness: 0.1,
    });

    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f080c,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      const trunkMesh = new THREE.Mesh(treeGeo.trunk, barkMaterial);
      trunkMesh.castShadow = true;
      trunkMesh.receiveShadow = true;
      group.add(trunkMesh);

      if (treeGeo.foliage) {
        const foliageMesh = new THREE.Mesh(treeGeo.foliage, foliageMaterial);
        foliageMesh.castShadow = true;
        foliageMesh.receiveShadow = true;
        group.add(foliageMesh);
      }

      // Random scatter position across full view distance (4.5m to 42.0m)
      const radius = 4.5 + Math.random() * 37.5;
      const angle = Math.random() * Math.PI * 2;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0;

      group.position.set(x, y, z);
      group.rotation.y = Math.random() * Math.PI * 2;

      const scaleVar = 0.75 + Math.random() * 0.70;
      group.scale.set(scaleVar, scaleVar * (0.9 + Math.random() * 0.3), scaleVar);

      this.forestGroup.add(group);
    }
  }

  _createTree1Geo() {
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.75, 6.0, 8, 5);

    // Deform trunk vertices for gnarled, twisted horror tree shape
    const pos = trunkGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const angle = Math.atan2(pos.getZ(i), pos.getX(i));
      const twist = Math.sin(y * 0.8) * 0.25;

      pos.setX(i, pos.getX(i) + Math.cos(angle + twist) * (0.08 + Math.sin(y * 2) * 0.05));
      pos.setZ(i, pos.getZ(i) + Math.sin(angle + twist) * (0.08 + Math.cos(y * 2) * 0.05));
    }
    trunkGeo.computeVertexNormals();
    trunkGeo.translate(0, 3.0, 0);

    // Bare branch horror foliage canopy
    const foliageGeo = new THREE.DodecahedronGeometry(2.5, 1);
    foliageGeo.scale(1.2, 0.8, 1.2);
    foliageGeo.translate(0, 5.8, 0);

    return { trunk: trunkGeo, foliage: foliageGeo };
  }

  dispose() {
    if (this.forestGroup) {
      this.scene.remove(this.forestGroup);
    }
  }
}
