import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();

  scene.fog = new THREE.FogExp2(0x0d0407, 0.024);
  scene.background = new THREE.Color(0x070305);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0x0d0d18, 0x040408, 0.18);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(4, 7, 4);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 25;
  dirLight.shadow.camera.left = -4;
  dirLight.shadow.camera.right = 4;
  dirLight.shadow.camera.top = 5;
  dirLight.shadow.camera.bottom = -1;
  dirLight.shadow.bias = -0.0003;
  dirLight.shadow.normalBias = 0.03;
  dirLight.shadow.radius = 4;
  scene.add(dirLight);

  const redLight1 = new THREE.PointLight(0xe6173c, 2.0, 20);
  redLight1.position.set(-3, 3, 2);
  scene.add(redLight1);

  const redLight2 = new THREE.PointLight(0xd91438, 1.6, 18);
  redLight2.position.set(3, 2.5, -2);
  scene.add(redLight2);

  const rimLight = new THREE.DirectionalLight(0xe6173c, 1.6);
  rimLight.position.set(-3, 4, -4);
  scene.add(rimLight);

  const groundGeometry = new THREE.CircleGeometry(80, 128);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x0e0e14,
    roughness: 0.75,
    metalness: 0.2,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  const groundMistMaterial = new THREE.ShaderMaterial({
    uniforms: {
      innerRadius: { value: 5.0 },
      outerRadius: { value: 80.0 },
      color:       { value: new THREE.Color(0x050509) },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float innerRadius;
      uniform float outerRadius;
      uniform vec3  color;
      varying vec2  vUv;

      void main() {
        vec2 centered = vUv - 0.5;
        float dist = length(centered) * 2.0;

        float worldR = dist * outerRadius;

        float alpha = smoothstep(innerRadius / outerRadius, 1.0, dist);

        alpha = pow(alpha, 0.65);

        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite:  false,
    side:        THREE.FrontSide,
  });

  const groundMistGeometry = new THREE.CircleGeometry(80, 128);
  const groundMist = new THREE.Mesh(groundMistGeometry, groundMistMaterial);
  groundMist.rotation.x = -Math.PI / 2;
  groundMist.position.y = 0.01;
  groundMist.renderOrder = 1;
  scene.add(groundMist);

  const groundMistMaterial2 = groundMistMaterial.clone();
  groundMistMaterial2.uniforms = {
    innerRadius: { value: 8.0 },
    outerRadius: { value: 80.0 },
    color:       { value: new THREE.Color(0x050509) },
  };
  groundMistMaterial2.fragmentShader = /* glsl */`
    uniform float innerRadius;
    uniform float outerRadius;
    uniform vec3  color;
    varying vec2  vUv;

    void main() {
      vec2 centered = vUv - 0.5;
      float dist = length(centered) * 2.0;
      float alpha = smoothstep(innerRadius / outerRadius, 1.0, dist);
      alpha = pow(alpha, 1.4) * 0.55;
      gl_FragColor = vec4(color, alpha);
    }
  `;
  groundMistMaterial2.needsUpdate = true;

  const groundMist2 = new THREE.Mesh(
    new THREE.CircleGeometry(80, 128),
    groundMistMaterial2
  );
  groundMist2.rotation.x = -Math.PI / 2;
  groundMist2.position.y = 0.02;
  groundMist2.renderOrder = 2;
  scene.add(groundMist2);

  return {
    scene,
    dirLight,
    redLight1,
    redLight2,
    rimLight,
    ground,
  };
}
