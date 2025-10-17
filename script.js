// Get references to the DOM elements
const modelViewer = document.querySelector('model-viewer');
const heightInput = document.getElementById('height-input');
const widthInput = document.getElementById('width-input');

// A variable to hold the original loaded model as a template
let templateModel;
// A THREE.Group to hold our manipulated models
let modelContainer;
// Variables to store the original dimensions of the model in meters
let templateWidth = 0;
let templateHeight = 0;


// --- Main Functionality ---

// Wait for the <model-viewer> to be loaded and ready
modelViewer.addEventListener('load', () => {
    const THREE = modelViewer.constructor.THREE;
    const scene = modelViewer.model.scene;

    // --- THIS IS THE KEY CHANGE ---
    // Find the specific model in the scene by the name you gave it in your 3D software.
    // Replace 'Lath_Mesh' with the actual name of your model.
    const modelName = 'Lath_Mesh'; // <--- IMPORTANT: SET YOUR MODEL'S NAME HERE
    templateModel = scene.getObjectByName(modelName);

    // If the model isn't found, log an error and stop.
    if (!templateModel) {
        console.error(`Could not find a model with the name "${modelName}".`);
        console.log("Please check the model's name in your 3D software (e.g., Blender) before exporting.");
        return;
    }
    // --- END OF KEY CHANGE ---

    // Calculate the original model's dimensions
    const box = new THREE.Box3().setFromObject(templateModel);
    templateWidth = box.max.x - box.min.x;
    templateHeight = box.max.y - box.min.y;
    
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

// The core function to update the model based on input values (No changes needed here)
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
        modelClone.scale.set(scale, scale, scale);
        modelClone.position.y = i * scaledModelHeight;
        modelContainer.add(modelClone);
    }
    
    const group_box = new THREE.Box3().setFromObject(modelContainer);
    const center = group_box.getCenter(new THREE.Vector3());
    
    modelContainer.position.x -= center.x;
    modelContainer.position.y -= group_box.min.y;
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