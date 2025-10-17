// Get references to the DOM elements
const modelViewer = document.querySelector('model-viewer');
const heightInput = document.getElementById('height-input');
const widthInput = document.getElementById('width-input');

// Module-level variables to hold our 3D objects
let THREE; // The THREE.js library instance
let templateModel; // The original model to clone
let modelContainer; // The group to hold the clones
let templateWidth = 0;
let templateHeight = 0;

console.log("Script loaded. Waiting for model-viewer 'model-is-visible' event...");

// --- THE CRITICAL FIX ---
// We use the 'model-is-visible' event. This event guarantees that the 3D scene
// graph is loaded and ready for manipulation. We also use { once: true } so this
// setup code only ever runs one time.
modelViewer.addEventListener('model-is-visible', (event) => {
    console.log("✅ Model-viewer 'model-is-visible' event fired!");
    
    // The THREE.js library and the scene are provided in the event's detail property
    THREE = modelViewer.constructor.THREE;
    const scene = event.detail.scene;

    console.log("🔍 Full Scene Object:", scene);

    const modelName = 'Lath_Mesh'; // <--- Make sure this is your mesh's name
    const mesh = scene.getObjectByName(modelName);

    if (!mesh) {
        console.error(`❌ CRITICAL: Could not find a mesh named "${modelName}".`);
        console.error("➡️ FIX: Check the mesh name in Blender and in the script. The names must match exactly.");
        return;
    }
    console.log(`✅ Found mesh named "${modelName}".`, mesh);

    let modelRoot = mesh;
    while (modelRoot.parent && modelRoot.parent !== scene) {
        modelRoot = modelRoot.parent;
    }
    templateModel = modelRoot;
    console.log("✅ Determined the model's root object to be:", templateModel);

    const box = new THREE.Box3().setFromObject(templateModel);
    templateWidth = box.max.x - box.min.x;
    templateHeight = box.max.y - box.min.y;

    console.log("📏 Initial model dimensions (in meters):");
    console.log(`   - Width (X-axis): ${templateWidth}`);
    console.log(`   - Height (Y-axis): ${templateHeight}`);

    if (templateWidth === 0) {
        console.error("❌ CRITICAL: The calculated model width is zero!");
        console.error("➡️ FIX: Go to Blender, select the model, and apply its scale (Ctrl+A -> Scale) and set its origin (Object -> Set Origin -> Origin to Geometry), then re-export.");
        return;
    }

    templateModel.visible = false;

    modelContainer = new THREE.Group();
    modelContainer.name = "ModelContainer";
    scene.add(modelContainer);

    console.log("🚀 Setup complete. Performing initial model update.");
    updateModel();

    // Now that setup is complete, we can listen for input changes
    heightInput.addEventListener('input', updateModel);
    widthInput.addEventListener('input', updateModel);

}, { once: true }); // The { once: true } is important!

// The function to update the model - no changes needed here
const updateModel = () => {
    if (!templateModel || !modelContainer || !templateWidth || !templateHeight) {
        return;
    }

    while (modelContainer.children.length) {
        modelContainer.remove(modelContainer.children[0]);
    }

    const desiredWidthM = (parseFloat(widthInput.value) || 1000) / 1000;
    const desiredHeightM = (parseFloat(heightInput.value) || 80) / 1000;

    const scale = desiredWidthM / templateWidth;
    const scaledModelHeight = templateHeight * scale;
    const count = Math.max(1, Math.round(desiredHeightM / scaledModelHeight));
    
    for (let i = 0; i < count; i++) {
        const modelClone = templateModel.clone();
        modelClone.visible = true;
        modelClone.scale.set(scale, scale, scale);
        modelClone.position.y = i * scaledModelHeight;
        modelContainer.add(modelClone);
    }
    
    const groupBox = new THREE.Box3().setFromObject(modelContainer);
    const center = groupBox.getCenter(new THREE.Vector3());
    modelContainer.position.x -= center.x;
    modelContainer.position.y -= groupBox.min.y;
    modelContainer.position.z -= center.z;
};

// --- Progress Bar Logic (Unchanged) ---
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