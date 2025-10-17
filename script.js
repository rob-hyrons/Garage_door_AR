const modelViewer = document.querySelector('model-viewer');

console.log("--- FINAL TEST SCRIPT: 'Build-a-Box' ---");
console.log("This test IGNORES your GLB file entirely.");
console.log("Waiting for 'model-is-visible' event...");

modelViewer.addEventListener('model-is-visible', (event) => {
    console.log("✅ 'model-is-visible' event fired. Running test...");
    
    // Get the three.js scene and library from the event
    const THREE = modelViewer.constructor.THREE;
    const scene = event.detail.scene;

    // --- HIDE THE ORIGINAL MODEL ---
    // Find the original model's root and hide it so it doesn't get in the way.
    const originalModelRoot = scene.children[0];
    if (originalModelRoot) {
        originalModelRoot.visible = false;
        console.log("✅ Original GLB model found and hidden.");
    } else {
        console.warn("Could not find original GLB model to hide, proceeding anyway.");
    }

    // --- BUILD A NEW OBJECT FROM SCRATCH ---
    console.log("➡️ ACTION: Creating a new test cube from scratch.");
    
    // 1. Create the shape (a 1x1x1 meter box)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    
    // 2. Create a simple red material
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red
    
    // 3. Combine them into a mesh object
    const testCube = new THREE.Mesh(geometry, material);
    testCube.name = "TestCube";

    // --- THE TEST ---
    // We will now apply a scale and add it to the scene.
    console.log("➡️ ACTION: Scaling the new cube to half size (0.5) and adding it to the scene.");
    testCube.scale.set(0.5, 0.5, 0.5);

    // Add our brand new cube to the scene
    scene.add(testCube);

    console.log("--- TEST COMPLETE ---");
    console.log("Look at the viewer. You should see a small red cube.");
    console.log("If you see the red cube, it means we CAN control the scene, but your GLB model is the problem.");
    console.log("If you DO NOT see a red cube, the issue is with the <model-viewer> environment itself.");

}, { once: true });


// Progress bar logic - unchanged
const onProgress = (event) => {
  const progressBar = event.target.querySelector('.progress-bar');
  if (!progressBar) return;
  const updatingBar = progressBar.querySelector('.update-bar');
  updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
  if (event.detail.totalProgress === 1) {
    progressBar.classList.add('hide');
  } else {
    progressBar.classList.remove('hide');
  }
};
modelViewer.addEventListener('progress', onProgress);
