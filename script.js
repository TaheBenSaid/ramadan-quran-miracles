document.addEventListener('DOMContentLoaded', () => {
    const doorsGrid = document.getElementById('doors-grid');
    const modal = document.getElementById('miracle-modal');
    const closeBtn = document.querySelector('.close-btn');
    const cardsContainer = document.querySelector('.cards-container');
    const nextBtn = document.getElementById('next-card');
    const prevBtn = document.getElementById('prev-card');
    const dots = document.querySelectorAll('.dot');
    const createModal = document.getElementById('create-modal');
    const miracleForm = document.getElementById('miracle-form');
    const closeCreate = document.getElementById('close-create');

    let miracles = [];
    let customMiracles = JSON.parse(localStorage.getItem('customMiracles')) || [];
    let currentCardIndex = 0;

    // Fetch Miracle Data
    fetch('quran_miracles.json')
        .then(response => response.json())
        .then(data => {
            miracles = data;
            renderDoors();
        })
        .catch(err => console.error('Error loading miracles:', err));

    // Render 30 Doors + Add Button
    function renderDoors() {
        doorsGrid.innerHTML = ''; // Clear existing
        const allMiracles = [...miracles, ...customMiracles];

        for (let i = 1; i <= 30; i++) {
            const door = document.createElement('div');
            door.className = 'door-item';

            const miracle = allMiracles.find(m => m.id === i);

            door.innerHTML = `
                <div class="door-number">${i}</div>
                <div class="door-label">Day</div>
            `;

            if (miracle) {
                door.addEventListener('click', () => openMiracle(miracle));
            } else {
                door.style.opacity = '0.5';
                door.style.cursor = 'not-allowed';
            }

            doorsGrid.appendChild(door);
        }

        // Add the "Virgin Door" (Plus Button)
        const plusDoor = document.createElement('div');
        plusDoor.className = 'door-item plus-door';
        plusDoor.innerHTML = `
            <div class="plus-icon">+</div>
            <div class="door-label">Add Your Own</div>
        `;
        plusDoor.addEventListener('click', () => {
            createModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
        doorsGrid.appendChild(plusDoor);
    }

    // Open Door & Show Modal
    function openMiracle(miracle) {
        // Populate Card 1
        document.querySelector('.arabic-title').textContent = miracle.title_ar;
        document.querySelector('.english-title').textContent = miracle.title_en;
        document.querySelector('.arabic-ayah').textContent = miracle.ayah_ar;

        // Include reference in English Ayah
        document.querySelector('.english-ayah').textContent = `${miracle.ayah_en} (${miracle.reference})`;

        // Populate Card 2 (Description stays the same)
        document.querySelector('.miracle-description').textContent = miracle.description;

        // Update Day Numbers
        document.querySelectorAll('.day-number').forEach(el => el.textContent = `Day ${miracle.id}`);

        // Reset Card View
        currentCardIndex = 0;
        updateCardPosition();

        // Show Modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Close Modal
    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);

    // Close on overlay click
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Handle Card Navigation (Mobile-style)
    function updateCardPosition() {
        const offset = currentCardIndex * -100;
        if (window.innerWidth <= 900) {
            cardsContainer.style.transform = `translateX(${offset}%)`;
        } else {
            cardsContainer.style.transform = `translateX(0)`;
        }

        // Update dots
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentCardIndex);
        });
    }

    nextBtn.addEventListener('click', () => {
        if (currentCardIndex < 1) {
            currentCardIndex++;
            updateCardPosition();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            updateCardPosition();
        }
    });

    // Close Creation Modal
    const closeCreateModal = () => {
        createModal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    closeCreate.addEventListener('click', closeCreateModal);

    // Form Submission for New Miracle
    miracleForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Find the first empty slot in the 1-30 range
        const allMiracles = [...miracles, ...customMiracles];
        let nextId = 1;
        while (allMiracles.find(m => m.id === nextId) && nextId <= 30) {
            nextId++;
        }

        const newMiracle = {
            id: nextId <= 30 ? nextId : Date.now(),
            title_ar: document.getElementById('input-title-ar').value,
            title_en: document.getElementById('input-title-en').value,
            ayah_ar: document.getElementById('input-ayah-ar').value,
            ayah_en: document.getElementById('input-ayah-en').value,
            reference: document.getElementById('input-ref').value,
            description: document.getElementById('input-desc').value
        };

        customMiracles.push(newMiracle);
        localStorage.setItem('customMiracles', JSON.stringify(customMiracles));

        miracleForm.reset();
        closeCreateModal();
        renderDoors();
    });

    // Close Create Modal on Escape or Overlay click
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !createModal.classList.contains('hidden')) {
            closeCreateModal();
        }
    });

    createModal.querySelector('.modal-overlay').addEventListener('click', closeCreateModal);


    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    cardsContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    cardsContainer.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchStartX - touchEndX > 50) { // Swipe Left
            if (currentCardIndex < 1) {
                currentCardIndex++;
                updateCardPosition();
            }
        } else if (touchEndX - touchStartX > 50) { // Swipe Right
            if (currentCardIndex > 0) {
                currentCardIndex--;
                updateCardPosition();
            }
        }
    }

    // Handle window resize for card layout
    window.addEventListener('resize', updateCardPosition);
});
