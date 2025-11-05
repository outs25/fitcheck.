// --- 1. Loading Screen Functionality ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    // Simulate a minimum loading time of 5 seconds
    setTimeout(() => {
        loader.classList.add('loaded');
        // Hide the loader after the fade-out transition
        loader.addEventListener('transitionend', () => {
            loader.style.display = 'none';
        });
        // Initial page view after load
        showSection('home');
    }, 5000); 
});


// --- Global Closet Data Store ---
// New object to store item data (including image URL) for programmatic access.
// Key: Category (e.g., 'tops', 'bottoms')
// Value: Array of { name: 'Item Name', image_src: 'data:image/jpeg;base64,...' }
const CLOSET_DATA_STORE = {
    tops: [],
    bottoms: [],
    outerwear: [],
    shoes: [],
    dresses: [],
    // Add other relevant categories here based on your HTML structure
};

// --- General Navigation ---
const mainSections = ['home', 'loginpage', 'signuppage', 'closet', 'search', 'saved'];

function showSection(id) {
    mainSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = (sectionId === id) ? 'block' : 'none';
        }
    });
    // Scroll to the top of the new section
    if (id !== 'home' && id !== 'loginpage' && id !== 'signuppage') {
        document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Hide all main sections initially (except the loader is present)
    mainSections.forEach(id => {
        const section = document.getElementById(id);
        if (section && id !== 'home') {
            section.style.display = 'none';
        }
    });

    // Handle Header Menu Clicks
    document.querySelectorAll('#menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // Handle "Get Started" button click (Feature 3)
    document.getElementById('start').addEventListener('click', () => {
        showSection('closet');
    });

    // Display initial home section (this will be overridden by the loader hide logic)
    // showSection('home'); 
});


// --- 2. Login/Sign Up & Google Sign-In (Simulated) ---

function handleGoogleCredentialResponse(response) {
    // This function is the callback for Google Sign-In
    // In a real application, you would send the 'response.credential' (JWT) to your backend
    // for verification and user creation/login.
    console.log("Encoded JWT ID token: " + response.credential);

    // Simulated successful login
    alert('Google Sign-In Successful! (Simulated)');
    // After successful login, redirect user to the closet/home
    showSection('closet'); 
}

// Simulated regular form submission
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Regular Login Attempt (Simulated)');
    showSection('closet'); 
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Regular Sign Up Attempt (Simulated)');
    showSection('closet'); 
});


// --- 4. File Upload, Preview & Categorization ---

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const uploadPreview = document.getElementById('upload-preview');
const uploadActions = document.getElementById('upload-actions');
const uploadBtn = document.getElementById('upload-btn');
const clearBtn = document.getElementById('clear-btn');
const categoryModal = document.getElementById('category-modal');
const modalImagePreview = document.getElementById('modal-image-preview');
const itemCategorySelect = document.getElementById('item-category');
const saveCategoryBtn = document.getElementById('save-category-btn');
const itemNameInput = document.getElementById('item-name-input'); // Assuming you add this input to your modal HTML

let pendingFiles = [];
let currentFileIndex = 0;

// Enable click on the drop zone to open file dialog
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

// Drag and Drop Logic
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('drag-over'), false);
});

uploadArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
});


// Handle files (from input or drop)
function handleFiles(files) {
    const fileArray = [...files].filter(file => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    pendingFiles = fileArray;
    currentFileIndex = 0;

    uploadPreview.innerHTML = ''; // Clear existing previews

    fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            uploadPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });

    uploadActions.style.display = 'flex';
}

// Clear preview
clearBtn.addEventListener('click', () => {
    uploadPreview.innerHTML = '';
    fileInput.value = '';
    pendingFiles = [];
    currentFileIndex = 0;
    uploadActions.style.display = 'none';
});

// Start Categorization process
uploadBtn.addEventListener('click', () => {
    if (pendingFiles.length > 0) {
        processNextFileForCategorization();
    } else {
        alert('Please select files first.');
    }
});

function processNextFileForCategorization() {
    if (currentFileIndex < pendingFiles.length) {
        const file = pendingFiles[currentFileIndex];
        const reader = new FileReader();
        reader.onload = (e) => {
            modalImagePreview.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
            categoryModal.style.display = 'block';
            // Pre-fill name if needed, or leave blank for user input
            // if (itemNameInput) itemNameInput.value = file.name.split('.').slice(0, -1).join('.'); 
        };
        reader.readAsDataURL(file);
    } else {
        // All files processed
        alert('All items added to your closet!');
        clearBtn.click(); // Clear the upload area
        showSection('closet'); // Show the updated closet
    }
}

// Close Modal
function closeCategoryModal() {
    categoryModal.style.display = 'none';
}

// Save Category to Closet (Core Categorization Logic)
saveCategoryBtn.addEventListener('click', () => {
    const file = pendingFiles[currentFileIndex];
    // Convert to lowercase and plural for cleaner category mapping (e.g., 'top' -> 'tops')
    const categorySingular = itemCategorySelect.value.toLowerCase(); 
    const categoryPlural = categorySingular + (categorySingular.endsWith('s') ? '' : 's');
    
    // Fallback item name
    const itemName = itemNameInput ? itemNameInput.value.trim() || file.name : file.name;
    const imageDataURL = modalImagePreview.querySelector('img').src;

    // --- 1. Save data to the Global Store (CRUCIAL FOR OUTFIT FEATURE) ---
    const newItem = {
        name: itemName,
        category: categoryPlural,
        image_src: imageDataURL
    };

    if (CLOSET_DATA_STORE[categoryPlural]) {
        CLOSET_DATA_STORE[categoryPlural].push(newItem);
    } else {
        // Handle categories not initially in the store
        CLOSET_DATA_STORE[categoryPlural] = [newItem];
    }
    console.log(`Item added to ${categoryPlural}:`, newItem);

    // --- 2. Update the DOM for visual confirmation in the Closet section ---
    const newImageContainer = document.createElement('div');
    newImageContainer.classList.add('wardrobe-item');
    
    const newImage = document.createElement('img');
    newImage.src = imageDataURL;
    newImage.alt = itemName;
    newImage.classList.add('wardrobe-item-image');
    
    const itemLabel = document.createElement('span');
    itemLabel.textContent = itemName;

    newImageContainer.appendChild(newImage);
    newImageContainer.appendChild(itemLabel);
    
    // Append to the correct category container in the DOM
    const categoryContainer = document.getElementById(categoryPlural); // Assumes your HTML IDs match the plural categories
    if (categoryContainer) {
        categoryContainer.appendChild(newImageContainer);
    } else {
        console.error('Category container not found for:', categoryPlural);
    }

    // --- 3. Move to the next file
    closeCategoryModal();
    currentFileIndex++;
    processNextFileForCategorization();
});

// --- 5. Rule-Based Outfit Generation (UPDATED FOR CLOSET PICTURES) ---

document.getElementById('find-outfit-btn').addEventListener('click', generateOutfit);

// Utility function to get a random item from a category
function getRandomItem(category) {
    const items = CLOSET_DATA_STORE[category];
    if (items && items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        return items[randomIndex];
    }
    return null; // No item found
}

function generateOutfit() {
    const occasion = document.getElementById('occasion-select').value;
    const weather = document.getElementById('weather-select').value;
    const suggestionsDiv = document.getElementById('outfit-suggestions');

    // Clear previous suggestions
    suggestionsDiv.innerHTML = '';
    
    // Define the required items based on occasion/weather logic (using categories from the store)
    let requiredCategories = [];
    let notes = '';

    if (occasion === 'casual') {
        requiredCategories = ['shirts', 'trousers', 'shoes'];
        notes = 'A simple, comfortable, and classic look for day-to-day.';
        if (weather === 'rainy' || weather === 'cold') {
            requiredCategories.push('outerwear');
            notes = 'Layers added for warmth or rain protection.';
        }
    } else if (occasion === 'formal') {
        // Example: Only draw a dress, or a top/bottom if dresses are unavailable
        if (CLOSET_DATA_STORE.dresses.length > 0) {
            requiredCategories = ['dresses', 'shoes'];
            notes = 'Elegance for a formal setting.';
        } else {
            requiredCategories = ['shirts', 'trousers', 'shoes']; // Fallback
            notes = 'A polished top and bottom ensemble.';
        }
    } else if (occasion === 'workout') {
        requiredCategories = ['shirts', 'trousers', 'shoes']; // Assuming workout-specific sub-categories in shirts/trousers
        notes = 'Ready for the gym! Comfort and mobility first.';
    } else {
        suggestionsDiv.innerHTML = '<p>No specific rules set for this combination. Try another!</p>';
        return;
    }
    
    const generatedFit = {};
    let isComplete = true;

    // 1. Select a random item for each required category from the live CLOSET_DATA_STORE
    requiredCategories.forEach(cat => {
        const item = getRandomItem(cat);
        if (item) {
            generatedFit[cat] = item;
        } else {
            isComplete = false;
        }
    });

    if (!isComplete) {
        suggestionsDiv.innerHTML = `<p>Not enough items in your closet to complete a **${occasion}** outfit. You are missing an item in the **${requiredCategories.find(cat => !generatedFit[cat])}** category.</p>`;
        return;
    }
    
    // 2. Build the HTML with the images
    let outfitImagesHTML = '';
    let outfitDetailsHTML = '';

    Object.keys(generatedFit).forEach(category => {
        const item = generatedFit[category];
        outfitImagesHTML += `
            <div class="fit-item-visual">
                <img src="${item.image_src}" alt="${item.name}" class="fit-image">
                <p><strong>${category.toUpperCase()}:</strong> ${item.name}</p>
            </div>
        `;
        outfitDetailsHTML += `<p><strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong> ${item.name}</p>`;
    });

    // 3. Create the final outfit card HTML
    const outfitHTML = `
        <div class="outfit-card" data-occasion="${occasion}" data-weather="${weather}">
            <h4>Recommended Fit for ${occasion} & ${weather}:</h4>
            <div class="outfit-visual-display">
                ${outfitImagesHTML}
            </div>
            <div class="outfit-details">
                ${outfitDetailsHTML}
                <p><em>Notes: ${notes}</em></p>
            </div>
            <button class="save-outfit-btn">Save This Fit</button>
        </div>
    `;
    
    suggestionsDiv.innerHTML = outfitHTML;

    // Attach event listener to the new save button (Feature 6)
    document.querySelector('.save-outfit-btn').addEventListener('click', saveOutfit);
}


// --- 6. Save Outfits Functionality ---

function saveOutfit(e) {
    const outfitCard = e.target.closest('.outfit-card');
    const savedOutfitsContainer = document.getElementById('saved-outfits');
    const noSavedMessage = document.getElementById('no-saved-message');

    // Extract details from the outfit card
    const occasion = outfitCard.getAttribute('data-occasion');
    const weather = outfitCard.getAttribute('data-weather');

    // Extract all detailed paragraphs from the outfit-details class
    const detailParagraphs = outfitCard.querySelectorAll('.outfit-details p');
    let savedDetailsHTML = '';

    detailParagraphs.forEach(p => {
        // Skip the notes paragraph
        if (!p.textContent.startsWith('Notes:')) {
            savedDetailsHTML += `<p>${p.textContent}</p>`;
        }
    });

    // Create a new saved card
    const savedCard = document.createElement('div');
    savedCard.classList.add('saved-outfit-card');
    savedCard.innerHTML = `
        <h4>Saved Fit: ${occasion} (${weather})</h4>
        <div class="saved-fit-images">
            ${outfitCard.querySelector('.outfit-visual-display').innerHTML}
        </div>
        ${savedDetailsHTML}
    `;

    savedOutfitsContainer.prepend(savedCard); // Add to the start of the list
    
    // Hide the 'No saved outfits' message
    if (noSavedMessage) {
        noSavedMessage.style.display = 'none';
    }

    alert('Outfit Saved Successfully!');
}