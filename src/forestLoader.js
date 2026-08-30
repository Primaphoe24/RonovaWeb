import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/**
 * HORROR FOREST SYSTEM
 * Scans for horror tree GLB models, instances each model multiple times (> 1),
 * and scatters them randomly across the full view distance around the character
 * to create a dense, ominous dark wilderness environment.
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

    // List of candidate paths for 3 horror tree GLB models
    this.candidateTreeSets = [
      ['/models/tree1.glb', '/models/tree2.glb', '/models/tree3.glb'],
      ['/models/tree_1.glb', '/models/tree_2.glb', '/models/tree_3.glb'],
      ['/models/horror_tree1.glb', '/models/horror_tree2.glb', '/models/horror_tree3.glb'],
      ['/models/pohon1.glb', '/models/pohon2.glb', '/models/pohon3.glb'],
      ['/models/pohon_1.glb', '/models/pohon_2.glb', '/models/pohon_3.glb'],
    ];

    this.loadedTreesCount = 0;
    this.instancesPerTree = 22; // Each tree model is instanced > 1 times (22 instances per model)
  }

  async loadForest() {
    let loadedAny = false;

    // Try loading candidate tree sets
    for (const treeSet of this.candidateTreeSets) {
      const loadPromises = treeSet.map((path) => this._loadSingleTreeGLB(path));
      const results = await Promise.allSettled(loadPromises);

      const successfulTreeModels = results
        .filter((r) => r.status === 'fulfilled' && r.value)
        .map((r) => r.value);

      if (successfulTreeModels.length > 0) {
        loadedAny = true;
        this.loadedTreesCount += successfulTreeModels.length;

        // Instance each loaded GLB tree model multiple times (> 1)
        successfulTreeModels.forEach((treeModel) => {
          this._scatterTreeInstances(treeModel, this.instancesPerTree);
        });

        console.info(`[HorrorForestSystem] Successfully loaded ${successfulTreeModels.length} GLB tree model(s) into horror forest.`);
        break; // Stop after first matching set
      }
    }

    // If no GLB files are present yet, generate procedural dark horror trees
    if (!loadedAny || this.loadedTreesCount === 0) {
      console.info('[HorrorForestSystem] Generating procedural dark horror forest wilderness...');
      this._generateProceduralHorrorForest(55);
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
          // Soft resolve null on missing path
          resolve(null);
        }
      );
    });
  }

  _scatterTreeInstances(baseModel, count) {
    for (let i = 0; i < count; i++) {
      const clone = baseModel.clone(true);

      // Random position across full view distance (minRadius: 4.5m away from character, maxRadius: 36.0m)
      const radius = 4.5 + Math.random() * 31.5;
      const angle = Math.random() * Math.PI * 2;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0;

      clone.position.set(x, y, z);

      // Random Y-axis rotation so trees don't look identical
      clone.rotation.y = Math.random() * Math.PI * 2;

      // Random scale variation for organic forest density (0.85x to 1.35x)
      const scaleVar = 0.85 + Math.random() * 0.5;
      clone.scale.multiplyScalar(scaleVar);

      this.forestGroup.add(clone);
    }
  }

  _generateProceduralHorrorForest(count) {
    // 3 distinct procedural horror tree geometry types
    const treeTypes = [
      this._createGnarledHorrorTreeGeo(1),
      this._createGnarledHorrorTreeGeo(2),
      this._createGnarledHorrorTreeGeo(3),
    ];

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
      const typeIdx = i % treeTypes.length;
      const group = new THREE.Group();

      const trunkMesh = new THREE.Mesh(treeTypes[typeIdx].trunk, barkMaterial);
      trunkMesh.castShadow = true;
      trunkMesh.receiveShadow = true;
      group.add(trunkMesh);

      if (treeTypes[typeIdx].foliage) {
        const foliageMesh = new THREE.Mesh(treeTypes[typeIdx].foliage, foliageMaterial);
        foliageMesh.castShadow = true;
        foliageMesh.receiveShadow = true;
        group.add(foliageMesh);
      }

      // Random scatter position across view distance (4.5m to 36.0m)
      const radius = 4.5 + Math.random() * 31.5;
      const angle = Math.random() * Math.PI * 2;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0;

      group.position.set(x, y, z);
      group.rotation.y = Math.random() * Math.PI * 2;

      const scaleVar = 0.85 + Math.random() * 0.55;
      group.scale.set(scaleVar, scaleVar * (0.9 + Math.random() * 0.3), scaleVar);

      this.forestGroup.add(group);
    }
  }

  _createGnarledHorrorTreeGeo(type) {
    const trunkGeo = new THREE.CylinderGeometry(
      type === 1 ? 0.25 : (type === 2 ? 0.35 : 0.2),
      type === 1 ? 0.65 : (type === 2 ? 0.85 : 0.5),
      type === 1 ? 5.5 : (type === 2 ? 7.0 : 4.8),
      8,
      5
    );

    // Deform trunk vertices for gnarled, twisted horror tree shape
    const pos = trunkGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const angle = Math.atan2(pos.getZ(i), pos.getX(i));
      const twist = Math.sin(y * 0.8 + type) * 0.25;

      pos.setX(i, pos.getX(i) + Math.cos(angle + twist) * (0.08 + Math.sin(y * 2) * 0.05));
      pos.setZ(i, pos.getZ(i) + Math.sin(angle + twist) * (0.08 + Math.cos(y * 2) * 0.05));
    }
    trunkGeo.computeVertexNormals();
    trunkGeo.translate(0, (type === 1 ? 5.5 : (type === 2 ? 7.0 : 4.8)) / 2, 0);

    // Dark foliage clusters / bare branch canopy
    const foliageGeo = new THREE.DodecahedronGeometry(
      type === 1 ? 2.2 : (type === 2 ? 2.8 : 1.8),
      1
    );
    foliageGeo.scale(1.2, 0.8, 1.2);
    foliageGeo.translate(0, type === 1 ? 5.2 : (type === 2 ? 6.5 : 4.5), 0);

    return { trunk: trunkGeo, foliage: foliageGeo };
  }

  dispose() {
    if (this.forestGroup) {
      this.scene.remove(this.forestGroup);
    }
  }
}
