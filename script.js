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
    // The THREE object is available on the modelViewer instance
    const THREE = modelViewer.constructor.THREE;
    
    // Access the internal THREE.js scene
    const scene = modelViewer.model.scene;
    
    // The loaded model is the first child of the scene, we'll use it as a template
    templateModel = scene.children[0];

    if (!templateModel) {
        console.error("Could not find a model in the scene.");
        return;
    }

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

// The core function to update the model based on input values
const updateModel = () => {
    // Ensure the template and container are ready
    if (!templateModel || !modelContainer || !templateWidth || !templateHeight) {
        return;
    }

    const THREE = modelViewer.constructor.THREE;

    // Clear any existing models from our container
    while (modelContainer.children.length) {
        modelContainer.remove(modelContainer.children[0]);
    }

    // 1. GET USER INPUT (in millimeters) AND CONVERT TO METERS
    // The 3D scene works in meters, so 1000mm -> 1.0m
    const desiredWidthM = (parseFloat(widthInput.value) || 1000) / 1000;
    const desiredHeightM = (parseFloat(heightInput.value) || 80) / 1000;

    // 2. CALCULATE SCALE FACTOR
    // Determine the scale needed to match the desired width.
    const scale = desiredWidthM / templateWidth;

    // 3. CALCULATE ARRAY COUNT
    // Figure out the height of one model *after* it has been scaled.
    const scaledModelHeight = templateHeight * scale;
    // Calculate how many scaled models are needed to fill the desired total height.
    // Use Math.round to get a whole number, and ensure at least 1.
    const count = Math.max(1, Math.round(desiredHeightM / scaledModelHeight));
    
    // 4. CREATE AND POSITION THE CLONES
    for (let i = 0; i < count; i++) {
        const modelClone = templateModel.clone();
        modelClone.visible = true; // Make the clone visible

        // Apply the calculated scale to the clone
        modelClone.scale.set(scale, scale, scale);
        
        // Position the clone vertically. The position is based on the scaled height.
        modelClone.position.y = i * scaledModelHeight;
        
        // Add the finished clone to our container group
        modelContainer.add(modelClone);
    }
    
    // 5. CENTER THE FINAL GROUP
    // This step ensures the entire stack of models is centered in the viewer.
    const group_box = new THREE.Box3().setFromObject(modelContainer);
    const center = group_box.getCenter(new THREE.Vector3());
    
    // Move the group so its geometric center is at (0, 0, 0)
    // and its bottom rests on the floor (y=0).
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