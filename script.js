document.addEventListener('DOMContentLoaded', () => {
    const doorsGrid = document.getElementById('doors-grid');
    const modal = document.getElementById('miracle-modal');
    const closeBtn = document.querySelector('.close-btn');
    const cardsContainer = document.querySelector('.cards-container');
    const nextBtn = document.getElementById('next-card');
    const prevBtn = document.getElementById('prev-card');
    const dots = document.querySelectorAll('.dot');

    let miracles = [];
    let currentCardIndex = 0;

    // Fetch Miracle Data
    fetch('quran_miracles.json')
        .then(response => response.json())
        .then(data => {
            miracles = data;
            renderDoors();
        })
        .catch(err => console.error('Error loading miracles:', err));

    // Render 30 Doors
    function renderDoors() {
        doorsGrid.innerHTML = ''; // Clear existing
        for (let i = 1; i <= 30; i++) {
            const door = document.createElement('div');
            door.className = 'door-item';

            const miracle = miracles.find(m => m.id === i);

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
    }

    // Open Door & Show Modal
    function openMiracle(miracle) {
        // Populate Card 1
        document.querySelector('.arabic-title').textContent = miracle.title_ar;
        document.querySelector('.english-title').textContent = miracle.title_en;
        document.querySelector('.arabic-ayah').textContent = miracle.ayah_ar;

        // Include reference in English Ayah
        document.querySelector('.english-ayah').textContent = `${miracle.ayah_en} (${miracle.reference})`;

        // Populate Card 2 & 3 (Split Description)
        const fullDescription = miracle.description;

        // Simple heuristic to split text roughly in half at a sentence boundary
        let splitIndex = Math.floor(fullDescription.length / 2);

        // Search for nearest period or newline around the middle
        const nearestPeriod = fullDescription.indexOf('. ', splitIndex);
        const nearestNewline = fullDescription.indexOf('\n', splitIndex);

        let finalSplitIndex = splitIndex;

        if (nearestPeriod !== -1 && (nearestNewline === -1 || nearestPeriod < nearestNewline)) {
            finalSplitIndex = nearestPeriod + 1;
        } else if (nearestNewline !== -1) {
            finalSplitIndex = nearestNewline;
        }

        // If no good split point found, just split at space near middle
        if (finalSplitIndex === splitIndex) {
            const nearestSpace = fullDescription.indexOf(' ', splitIndex);
            if (nearestSpace !== -1) finalSplitIndex = nearestSpace;
        }

        const part1 = fullDescription.substring(0, finalSplitIndex).trim();
        const part2 = fullDescription.substring(finalSplitIndex).trim();

        document.querySelector('.miracle-description-1').textContent = part1;
        document.querySelector('.miracle-description-2').textContent = part2;

        // Update titles to just be "The Miracle" without Part 1/2 if generic
        // Or keep them as is. Let's simplify to just "The Miracle" for cleaner look
        // actually let's hide the (Part 1) / (Part 2) text in JS if desired, 
        // but for now keeping them is clear.

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
        // Translate X: 0%, -100%, -200% for index 0, 1, 2
        // Only apply transform on mobile OR desktop if we want carousel behavior everywhere
        // Originally only mobile had swipe/nav? 
        // CSS says .cards-container has display: flex and overflow-x hidden on mobile
        // Let's enforce transform logic for both but tailored

        const offset = currentCardIndex * -100;

        // Check if narrow screen (mobile/tablet) where we want carousel
        // or just always carousel now that we have 3 cards?
        // Let's make it always carousel to support the "Story" feel
        // The CSS for desktop might show them side-by-side?
        // Original CSS: .cards-container displayed flex with gap=40px.
        // If we want "3 stories", we probably want to see ONE card at a time even on desktop? 
        // Or maybe 3 cards side-by-side on desktop?
        // User asked for "stories", implying sequential viewing.
        // Let's assume carousel behavior for all screen sizes for the story vibe.

        // Wait, original CSS had media query: 
        // @media (max-width: 900px) { ... width: var(--card-width); overflow: hidden; }
        // On desktop it showed all cards. 
        // Now we have 3 cards. 3 cards of 320px + gap 40px = ~1040px width.
        // Fits in 1200px container.
        // But user wants "stories".
        // Let's keep desktop behavior as "show all" (or scrollable layout) 
        // BUT logic here applies transform only on mobile (<=900px) in original code.
        // If user wants "3 stories", maybe they want only 1 card visible at a time ALWAYS?
        // The implementation below keeps original logic: distinct behavior for mobile vs desktop.
        // Mobile: Carousel. Desktop: Grid/Flex row.

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
        // Max index is now 2 (0, 1, 2)
        if (currentCardIndex < 2) {
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
            if (currentCardIndex < 2) {
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
