const modelViewer = document.querySelector('model-viewer');
const heightInput = document.getElementById('height-input');
const widthInput = document.getElementById('width-input');

let templateModel;
let modelContainer;
let templateWidth = 0;
let templateHeight = 0;

console.log("Script loaded. Waiting for model-viewer 'load' event...");

modelViewer.addEventListener('load', () => {
    console.log("✅ Model-viewer 'load' event fired!");
    
    const THREE = modelViewer.constructor.THREE;
    const scene = modelViewer.model.scene;

    // --- DIAGNOSTIC: Log the entire scene structure ---
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

    // --- DIAGNOSTIC: Check the most important values ---
    console.log("📏 Initial model dimensions (in meters):");
    console.log(`   - Width (X-axis): ${templateWidth}`);
    console.log(`   - Height (Y-axis): ${templateHeight}`);

    if (templateWidth === 0) {
        console.error("❌ CRITICAL: The calculated model width is zero!");
        console.error("➡️ LIKELY CAUSE: The model's origin/pivot point is far from the geometry, or its scale is not applied. See Step 3 for the fix.");
        return;
    }

    templateModel.visible = false;

    modelContainer = new THREE.Group();
    modelContainer.name = "ModelContainer";
    scene.add(modelContainer);

    console.log("🚀 Setup complete. Performing initial model update.");
    updateModel();

    heightInput.addEventListener('input', updateModel);
    widthInput.addEventListener('input', updateModel);
});

const updateModel = () => {
    console.log("🔄 Update triggered.");
    if (!templateModel || !modelContainer || !templateWidth || !templateHeight) {
        console.warn("Update skipped: template model not ready.");
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
    
    // --- DIAGNOSTIC: Check the calculated values ---
    console.log("🧮 Calculations:");
    console.log(`   - Desired Width: ${desiredWidthM}m`);
    console.log(`   - Scale Factor: ${scale}`);
    console.log(`   - Stack Count: ${count}`);

    for (let i = 0; i < count; i++) {
        const modelClone = templateModel.clone();
        modelClone.visible = true;
        modelClone.scale.set(scale, scale, scale);
        modelClone.position.y = i * scaledModelHeight;
        modelContainer.add(modelClone);
    }
    
    // Centering logic...
    const THREE = modelViewer.constructor.THREE;
    const groupBox = new THREE.Box3().setFromObject(modelContainer);
    const center = groupBox.getCenter(new THREE.Vector3());
    modelContainer.position.x -= center.x;
    modelContainer.position.y -= groupBox.min.y;
    modelContainer.position.z -= center.z;
    console.log("✅ Update complete.");
};

// Progress bar logic remains the same
const onProgress = (event) => { /* ... */ };
modelViewer.addEventListener('progress', onProgress);