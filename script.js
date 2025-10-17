const modelViewer = document.querySelector('model-viewer');

console.log("--- ISOLATION TEST SCRIPT LOADED ---");
console.log("Waiting for 'model-is-visible' event...");

modelViewer.addEventListener('model-is-visible', (event) => {
    console.log("✅ 'model-is-visible' event fired. Running test...");
    
    const scene = event.detail.scene;

    // --- 1. FIND THE MESH ---
    const modelName = 'Lath_Mesh'; // <--- Ensure this name is 100% correct
    const mesh = scene.getObjectByName(modelName);

    if (!mesh) {
        console.error(`❌ TEST FAILED: Could not find any object named "${modelName}".`);
        console.error("➡️ FIX: Open your .glb in Blender, select the mesh, and confirm its name in the Outliner panel. The names must match exactly (case-sensitive).");
        return;
    }
    console.log(`✅ Found the mesh: "${modelName}".`);

    // --- 2. FIND THE ROOT OBJECT TO MANIPULATE ---
    let modelRoot = mesh;
    while (modelRoot.parent && modelRoot.parent !== scene) {
        modelRoot = modelRoot.parent;
    }
    console.log("✅ Determined the model's root object is:", modelRoot);

    // --- 3. THE ACTUAL TEST ---
    // Instead of hiding it and cloning it, we will make the original visible
    // and apply a very obvious scale transformation.
    console.log("➡️ ACTION: Making the root object visible and scaling it by 2x.");
    
    modelRoot.visible = true;
    modelRoot.scale.set(4, 2, 2);

    console.log("--- TEST COMPLETE ---");
    console.log("If the model on screen is NOT twice its normal size, the problem is with the model file's internal structure or unapplied transforms.");

}, { once: true });


// Progress bar logic - unchanged
const onProgress = (event) => {
  const progressBar = event.target.querySelector('.progress-bar');
  const updatingBar = event.target.querySelector('.update-bar');
  updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
  if (event.detail.totalProgress === 1) {
    progressBar.classList.add('hide');
  } else {
    progressBar.classList.remove('hide');
  }
};
modelViewer.addEventListener('progress', onProgress);