// Global variables - S M Samiul Hasan
let allPlants = [];
let categories = [];
let cart = [];

const categoriesList = document.getElementById('categories-list');
const treesGrid = document.getElementById('trees-grid');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const loadingSpinner = document.getElementById('loading-spinner');
const emptyState = document.getElementById('empty-state');
const emptyCart = document.getElementById('empty-cart');
const treeModal = document.getElementById('tree-modal');
const closeModal = document.getElementById('close-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalCategory = document.getElementById('modal-category');
const modalPrice = document.getElementById('modal-price');
const errorMessage = document.getElementById('error-message');
const donationForm = document.getElementById('donation-form');

// API Endpoints
const PLANTS_API = 'https://openapi.programming-hero.com/api/plants';
const CATEGORIES_API = 'https://openapi.programming-hero.com/api/categories';
const PLANT_DETAILS_API = 'https://openapi.programming-hero.com/api/plant';
const PLANT_BY_CATEGORY_API = 'https://openapi.programming-hero.com/api/category';

// Initialize the application - S M Samiul Hasan
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadPlants();
    setupEventListeners();
    updateCart(); // Initialize cart view
});

// Set up event listeners - S M Samiul Hasan
function setupEventListeners() {
    closeModal.addEventListener('click', () => {
        treeModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === treeModal) {
            treeModal.style.display = 'none';
        }
    });

    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your donation! We will plant the trees soon.');
        donationForm.reset();
    });

    // Event delegation for opening the modal - S M Samiul Hasan
    treesGrid.addEventListener('click', (event) => {
        const card = event.target.closest('.tree-card');
        if (card) {
            const plantId = card.dataset.id;
            showPlantDetails(plantId);
        }
    });

    // Event delegation for category filtering - S M Samiul Hasan
    categoriesList.addEventListener('click', (event) => {
        const target = event.target.closest('.category-item');
        if (target) {
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('category-active');
            });
            target.classList.add('category-active');
            
            const categoryId = target.dataset.id;
            if (categoryId === 'all') {
                loadPlants();
            } else {
                loadPlantsByCategory(categoryId);
            }
        }
    });
}

// Load plant categories from API - S M Samiul Hasan
async function loadCategories() {
    showLoading();
    try {
        const response = await fetch(CATEGORIES_API);
        const data = await response.json();
        
        if (data.status && data.categories && data.categories.length > 0) {
            categories = data.categories;
            renderCategories();
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'API থেকে ক্যাটাগরি লোড করা যায়নি।';
    } finally {
        hideLoading();
    }
}

// Render categories list - S M Samiul Hasan
function renderCategories() {
    categoriesList.innerHTML = '';
    
    // Create 'All Trees' category item
    const allTreesItem = document.createElement('li');
    allTreesItem.className = 'category-item category-active';
    allTreesItem.textContent = 'All Trees';
    allTreesItem.dataset.id = 'all';
    categoriesList.appendChild(allTreesItem);
    
    // Render other categories from the API
    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'category-item';
        li.textContent = category.category_name;
        li.dataset.id = category.id; // ✅ fixed (was category.category_id)
        categoriesList.appendChild(li);
    });
}

// Load all plants from API - S M Samiul Hasan
async function loadPlants() {
    showLoading();
    try {
        const response = await fetch(PLANTS_API);
        const data = await response.json();
        
        if (data.status && data.plants && data.plants.length > 0) {
            allPlants = data.plants;
            renderPlants(allPlants);
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'API থেকে গাছ লোড করা যায়নি। দয়া করে পরে আবার চেষ্টা করুন।';
        renderPlants([]);
    } finally {
        hideLoading();
    }
}

// Load plants by category - S M Samiul Hasan
async function loadPlantsByCategory(categoryId) {
    showLoading();
    try {
        const response = await fetch(`${PLANT_BY_CATEGORY_API}/${categoryId}`);
        const data = await response.json();
        
        if (data.status && data.plants) {
            const plants = data.plants;
            renderPlants(plants);
        } else {
            renderPlants([]);
        }
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'এই ক্যাটাগরির জন্য ডেটা লোড করা যায়নি।';
        renderPlants([]);
    } finally {
        hideLoading();
    }
}

// Render plants in grid - S M Samiul Hasan
function renderPlants(plants) {
    treesGrid.innerHTML = '';
    
    if (!plants || plants.length === 0) {
        showEmptyState();
        return;
    }
    
    plants.forEach(plant => {
        const card = createPlantCard(plant);
        treesGrid.appendChild(card);
    });
    
    emptyState.style.display = 'none';
}

// Create plant card element - S M Samiul Hasan
function createPlantCard(plant) {
    const card = document.createElement('div');
    card.className = 'tree-card';
    card.dataset.id = plant.id; // ✅ API object এ id আছে

    const price = plant.price ? `৳${parseInt(plant.price).toLocaleString()}` : '৳0';
    
    card.innerHTML = `
        <div class="tree-image">
            <img src="${plant.image || 'assets/placeholder-tree.jpg'}" alt="${plant.name || 'Plant'}">
        </div>
        <h3 class="tree-name" data-id="${plant.id}">${plant.name || 'Unnamed Plant'}</h3>
        <p class="tree-description">${plant.description || 'No description available'}</p>
        <div class="tree-details">
            <span class="tree-category">${plant.category || 'General'}</span>
            <span class="tree-price">${price}</span>
        </div>
        <button class="tree-button add-to-cart" 
            data-id="${plant.id}" 
            data-name="${plant.name || 'Plant'}" 
            data-price="${plant.price || 0}">
            <i class="fas fa-cart-plus"></i>
            Add to Cart
        </button>
    `;

    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(plant);
    });

    return card;
}

// Show plant details in modal - S M Samiul Hasan
async function showPlantDetails(plantId) {
    console.log("Plant ID for modal:", plantId);
    showLoading();
    try {
        const response = await fetch(`${PLANT_DETAILS_API}/${plantId}`);
        const data = await response.json();
        console.log("Plant details response:", data); 

        //  API returns plant details in 'plants'
        if (data.status && data.plants) {
            const plant = data.plants;

            modalImage.src = plant.image || 'assets/placeholder-tree.jpg';
            modalTitle.textContent = plant.name || 'Unnamed Plant';
            modalDescription.textContent = plant.description || 'No description available';
            modalCategory.textContent = plant.category || 'General';
            modalPrice.textContent = plant.price ? `৳${parseInt(plant.price).toLocaleString()}` : '৳0';

            treeModal.style.display = 'flex';
        } else {
            alert('Plant details not found');
        }
    } catch (error) {
        console.error(error);
        alert('Error loading plant details. Please try again.');
    } finally {
        hideLoading();
    }
}


// Add plant to cart - S M Samiul Hasan
function addToCart(plant) {
    const existingItemIndex = cart.findIndex(item => item.id === plant.plant_id);
    
    if (existingItemIndex !== -1) {
        cart.splice(existingItemIndex, 1);
    }
    
    cart.push({
        id: plant.plant_id,
        name: plant.name || 'Plant',
        price: plant.price || 0
    });
    
    updateCart();
}

// Update cart display - S M Samiul Hasan
function updateCart() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
    } else {
        emptyCart.style.display = 'none';
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            cartItem.innerHTML = `
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">৳${parseInt(item.price).toLocaleString()}</div>
                </div>
                <div class="cart-item-delete" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </div>
            `;
            
            const deleteBtn = cartItem.querySelector('.cart-item-delete');
            deleteBtn.addEventListener('click', () => {
                removeFromCart(item.id);
            });
            
            cartItems.appendChild(cartItem);
        });
    }
    
    const total = cart.reduce((sum, item) => sum + parseInt(item.price), 0);
    cartTotal.textContent = `৳${total.toLocaleString()}`;
}

// Remove item from cart - S M Samiul Hasan
function removeFromCart(plantId) {
    cart = cart.filter(item => item.id !== plantId);
    updateCart();
}

// Show loading spinner - S M Samiul Hasan
function showLoading() {
    loadingSpinner.style.display = 'block';
}

// Hide loading spinner - S M Samiul Hasan
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Show empty state - S M Samiul Hasan
function showEmptyState() {
    treesGrid.innerHTML = '';
    emptyState.style.display = 'block';
}
