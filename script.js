// Get references to the DOM elements
const modelViewer = document.querySelector('model-viewer');
const heightInput = document.getElementById('height-input');
const widthInput = document.getElementById('width-input');

// A variable to hold the original loaded model as a template
let templateModel;
// A THREE.Group to hold our manipulated models
let modelContainer;

// Wait for the <model-viewer> to be loaded and ready
modelViewer.addEventListener('load', () => {
    // The THREE object is available on the modelViewer instance
    const THREE = modelViewer.constructor.THREE;
    
    // Access the internal THREE.js scene
    const scene = modelViewer.model.scene;
    
    // The loaded model is the first child of the scene, we'll use it as a template
    templateModel = scene.children[0];

    // If the template model is not found, do nothing.
    if (!templateModel) {
        console.error("Could not find a model in the scene.");
        return;
    }

    // Hide the original model, we will only use it for cloning
    templateModel.visible = false;

    // Create a container group for our arrayed/scaled models
    modelContainer = new THREE.Group();
    modelContainer.name = "ModelContainer";
    // Add our container to the scene
    scene.add(modelContainer);

    // Perform the initial update based on default input values
    updateModel();

    // Add event listeners to call updateModel whenever the inputs change
    heightInput.addEventListener('input', updateModel);
    widthInput.addEventListener('input', updateModel);
});

// Function to update the model based on input values
const updateModel = () => {
    // Ensure the template and container are ready
    if (!templateModel || !modelContainer) {
        return;
    }

    const THREE = modelViewer.constructor.THREE;

    // Clear any existing models from our container
    while (modelContainer.children.length) {
        modelContainer.remove(modelContainer.children[0]);
    }

    // Get the desired height and width, with fallback default values
    const heightCount = parseInt(heightInput.value, 10) || 1;
    const desiredWidth = parseFloat(widthInput.value) || 1;

    // Use THREE.Box3 to calculate the size of the template model
    const box = new THREE.Box3().setFromObject(templateModel);
    const modelHeight = box.max.y - box.min.y;

    // Create a temporary group to hold the stacked models before scaling
    const arrayGroup = new THREE.Group();

    // Array the model vertically based on the 'height' input
    for (let i = 0; i < heightCount; i++) {
        const modelClone = templateModel.clone();
        modelClone.visible = true; // Make sure the clone is visible
        // Position the clone vertically on top of the previous one
        modelClone.position.y = i * modelHeight;
        arrayGroup.add(modelClone);
    }

    // Now, calculate the width of the entire array and scale it
    const arrayBox = new THREE.Box3().setFromObject(arrayGroup);
    const currentWidth = arrayBox.max.x - arrayBox.min.x;

    // Avoid division by zero if the model has no width
    if (currentWidth > 0) {
        const scaleFactor = desiredWidth / currentWidth;
        arrayGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
    
    // After scaling, re-center the group so it's easy to control and view
    const scaledBox = new THREE.Box3().setFromObject(arrayGroup);
    const offsetX = -(scaledBox.min.x + scaledBox.max.x) / 2;
    const offsetY = -scaledBox.min.y; // Place the bottom of the model at y=0
    arrayGroup.position.set(offsetX, offsetY, 0);

    // Add the final, manipulated group to our main container in the scene
    modelContainer.add(arrayGroup);
};


// --- Keep the original progress bar logic ---
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