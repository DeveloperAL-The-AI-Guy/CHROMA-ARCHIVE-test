document.addEventListener('DOMContentLoaded', () => {
    
    // --- THEME TOGGLE LOGIC ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-label');
    const themeIndicator = document.getElementById('theme-indicator');
    const htmlEl = document.documentElement;
    
    // Check localStorage
    const savedTheme = localStorage.getItem('chroma-theme') || 'mono';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = htmlEl.getAttribute('data-theme');
        let next = 'mono';
        
        if (current === 'mono') next = 'ultra';
        else if (current === 'ultra') next = 'paper';
        else if (current === 'paper') next = 'mono';
        
        setTheme(next);
    });

    function setTheme(mode) {
        htmlEl.setAttribute('data-theme', mode);
        localStorage.setItem('chroma-theme', mode);
        
        if (mode === 'ultra') {
            themeLabel.innerText = "MODE: ULTRA";
            themeIndicator.style.backgroundColor = "var(--accent-color)";
        } else if (mode === 'paper') {
            themeLabel.innerText = "MODE: PAPER";
            themeIndicator.style.backgroundColor = "var(--accent-color)";
        } else {
            themeLabel.innerText = "MODE: MONO";
            themeIndicator.style.backgroundColor = "var(--text-primary)";
        }
    }

    // --- MOUSE FOLLOWER (MAGNIFIER ORB) ---
    const orb = document.getElementById('magnifier-orb');
    
    // Only enable on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let orbX = 0, orbY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Show orb if it was hidden
            if (orb.style.opacity === '0') orb.style.opacity = '1';
        });

        // Animation Loop for smooth follow
        function animateOrb() {
            // Lerp factor
            const ease = 0.15;
            
            orbX += (mouseX - orbX) * ease;
            orbY += (mouseY - orbY) * ease;

            orb.style.left = `${orbX}px`;
            orb.style.top = `${orbY}px`;

            requestAnimationFrame(animateOrb);
        }
        animateOrb();

        // Hover interactions for tiles
        const tiles = document.querySelectorAll('.tile-trigger');
        tiles.forEach(tile => {
            tile.addEventListener('mouseenter', () => {
                const isPaper = htmlEl.getAttribute('data-theme') === 'paper';
                orb.style.width = '250px';
                orb.style.height = '250px';
                orb.style.mixBlendMode = isPaper ? 'multiply' : 'normal'; 
                orb.style.backgroundColor = isPaper ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.05)';
            });
            tile.addEventListener('mouseleave', () => {
                const isPaper = htmlEl.getAttribute('data-theme') === 'paper';
                orb.style.width = '150px';
                orb.style.height = '150px';
                orb.style.mixBlendMode = isPaper ? 'multiply' : 'overlay';
                orb.style.backgroundColor = '';
            });
        });
    }

    // --- SCROLL SPY (NOW VIEWING PILL) ---
    const sections = ['hero', 'featured', 'archive', 'dossier', 'cta'];
    const viewingPill = document.getElementById('now-viewing');
    
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Trigger when section is in middle of viewport
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                // Update Pill Text
                let label = id.replace('-', ' ').toUpperCase();
                if (id === 'hero') label = 'PORTFOLIO';
                if (id === 'cta') label = 'CONTACT';
                
                viewingPill.innerText = label;
                viewingPill.classList.add('animate-pulse'); // Subtle feedback
                setTimeout(() => viewingPill.classList.remove('animate-pulse'), 500);
            }
        });
    }, observerOptions);

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });

    // --- SCROLL RAIL PROGRESS ---
    const progressBar = document.getElementById('scroll-progress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        
        progressBar.style.height = `${scrolled}%`;
    });

    // --- MODAL LOGIC ---
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalRole = document.getElementById('modal-role');
    const modalHero = document.getElementById('modal-hero');
    let lastFocusedElement;

    // Open Modal
    document.querySelectorAll('.tile-trigger').forEach(tile => {
        tile.addEventListener('click', (e) => {
            // Prevent default if it was a link inside (though these are divs)
            e.preventDefault();
            
            // Get data
            const title = tile.getAttribute('data-title');
            const desc = tile.getAttribute('data-desc');
            const role = tile.getAttribute('data-role');
            const colorClass = tile.getAttribute('data-color'); // Gradient override

            // Set content
            modalTitle.innerText = title;
            modalDesc.innerText = desc;
            modalRole.innerText = role;

            // Update Hero Visual in modal based on tile color
            const heroInner = modalHero.querySelector('.bg-gradient-to-br');
            heroInner.className = `absolute inset-0 bg-gradient-to-br ${colorClass}`;

            // Show Modal
            lastFocusedElement = document.activeElement;
            modalOverlay.classList.remove('invisible', 'opacity-0');
            modalOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // Lock scroll
            
            // Focus trap (simple version)
            modalClose.focus();
        });
    });

    // Close Modal Function
    function closeModal() {
        modalOverlay.classList.remove('open');
        modalOverlay.classList.add('opacity-0');
        
        // Wait for transition
        setTimeout(() => {
            modalOverlay.classList.add('invisible');
            document.body.style.overflow = '';
            if (lastFocusedElement) lastFocusedElement.focus();
        }, 400);
    }

    modalClose.addEventListener('click', closeModal);
    
    // Close on click outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeModal();
        }
    });

});