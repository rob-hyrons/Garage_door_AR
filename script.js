// Get references to the DOM elements
const modelViewer = document.querySelector('model-viewer');
const heightInput = document.getElementById('height-input');
const widthInput = document.getElementById('width-input');

// A variable to hold the topmost group of the original model as a template
let templateModel;
// A THREE.Group to hold our manipulated models
let modelContainer;
// Variables to store the original dimensions of the model in meters
let templateWidth = 0;
let templateHeight = 0;


// --- Main Functionality ---

modelViewer.addEventListener('load', () => {
    const THREE = modelViewer.constructor.THREE;
    const scene = modelViewer.model.scene;

    // --- REVISED MODEL FINDING LOGIC ---
    // 1. Find the specific mesh by name.
    //    Replace 'Lath_Mesh' with the actual name of your model mesh.
    const modelName = 'Lath_Mesh'; // <--- IMPORTANT: SET YOUR MODEL'S MESH NAME HERE
    const mesh = scene.getObjectByName(modelName);

    // If the mesh isn't found, the process stops.
    if (!mesh) {
        console.error(`Could not find a mesh with the name "${modelName}".`);
        console.log("Please check the mesh's name in your 3D software before exporting.");
        return;
    }

    // 2. Traverse up to find the main model group.
    //    This is the object we will clone and scale.
    let modelRoot = mesh;
    while (modelRoot.parent && modelRoot.parent !== scene) {
        modelRoot = modelRoot.parent;
    }
    templateModel = modelRoot;
    // --- END OF REVISED LOGIC ---

    // Calculate the original model's dimensions using the root object
    const box = new THREE.Box3().setFromObject(templateModel);
    templateWidth = box.max.x - box.min.x;
    templateHeight = box.max.y - box.min.y;

    if (templateWidth === 0 || templateHeight === 0) {
        console.error("Model dimensions are zero. The model may be empty or failed to load correctly.");
        return;
    }
    
    // Hide the original template model; we will only use it for cloning
    templateModel.visible = false;

    // Create a container group for our arrayed/scaled models
    modelContainer = new THREE.Group();
    modelContainer.name = "ModelContainer";
    scene.add(modelContainer);

    // Perform the initial update based on default input values
    updateModel();

    // Add event listeners to call updateModel whenever the inputs change
    heightInput.addEventListener('input', updateModel);
    widthInput.addEventListener('input', updateModel);
});

// The core function to update the model (no changes from previous correct version)
const updateModel = () => {
    if (!templateModel || !modelContainer || !templateWidth || !templateHeight) {
        return;
    }

    const THREE = modelViewer.constructor.THREE;

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
        
        // Apply the scale to the entire cloned group
        modelClone.scale.set(scale, scale, scale);
        
        // Position the clone based on its scaled height
        modelClone.position.y = i * scaledModelHeight;
        
        modelContainer.add(modelClone);
    }
    
    // Center the final container group
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