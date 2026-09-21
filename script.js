
document.addEventListener('DOMContentLoaded', () => {
    window.isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';

    const introScreen = document.getElementById('intro-screen');
    window.splashDismissed = !introScreen;

    if (introScreen) {
        const introCanvas = document.getElementById('intro-canvas');

        if (introCanvas) {
            const ctx = introCanvas.getContext('2d');
            let width = introCanvas.width = window.innerWidth;
            let height = introCanvas.height = window.innerHeight;
            let mouseX = width / 2;
            let mouseY = height / 2;

            const particles = Array.from({ length: 75 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.2 + 0.8,
                vx: (Math.random() - 0.5) * 0.7,
                vy: -Math.random() * 0.9 - 0.25,
                alpha: Math.random() * 0.65 + 0.2,
                color: Math.random() > 0.4 ? '212, 175, 55' : '230, 57, 70'
            }));

            window.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });

            function renderIntroParticles() {
                if (introScreen.style.display === 'none') return;
                ctx.clearRect(0, 0, width, height);

                particles.forEach(p => {
                    const dx = (mouseX - width / 2) * 0.00015;
                    const dy = (mouseY - height / 2) * 0.00015;
                    p.x += p.vx + dx;
                    p.y += p.vy + dy;

                    if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
                    if (p.x < -10) p.x = width + 10;
                    if (p.x > width + 10) p.x = -10;

                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
                    ctx.shadowColor = `rgba(${p.color}, 0.8)`;
                    ctx.shadowBlur = p.radius * 6;
                    ctx.fill();
                    ctx.restore();
                });

                requestAnimationFrame(renderIntroParticles);
            }

            window.addEventListener('resize', () => {
                width = introCanvas.width = window.innerWidth;
                height = introCanvas.height = window.innerHeight;
            });

            requestAnimationFrame(renderIntroParticles);
        }

        function dismissSplash() {
            if (introScreen.classList.contains('fade-out')) return;
            introScreen.classList.add('fade-out');
            window.splashDismissed = true;
            document.dispatchEvent(new CustomEvent('splashDismissed'));
            setTimeout(() => {
                introScreen.style.display = 'none';
            }, 950);
        }

        const splashTimer = setTimeout(() => {
            dismissSplash();
        }, 4200);

        introScreen.addEventListener('click', () => {
            clearTimeout(splashTimer);
            dismissSplash();
        });
    }

    const lanyard = document.getElementById('lanyard');

    if (lanyard) {
        let currentScrollY = window.scrollY;
        let lastScrollY = window.scrollY;

        let posY = 0;              
        let targetPosY = 0;        
        let velY = 0;              

        let rotDeg = 0;            
        let rotVel = 0;            

        const STIFFNESS = 0.09;     
        const DAMPING = 0.74;       
        const MAX_DROP_PX = 135;    

        function lanyardPhysicsLoop() {
            if (lanyard.classList.contains('lanyard-user-disabled')) {
                lanyard.classList.remove('lanyard-visible');
                lanyard.classList.add('lanyard-hidden');
                requestAnimationFrame(lanyardPhysicsLoop);
                return;
            }

            currentScrollY = window.scrollY;

            if (currentScrollY <= 15) {
                targetPosY = -200;
                lanyard.classList.remove('lanyard-visible');
                lanyard.classList.add('lanyard-hidden');
            } else {
                lanyard.classList.add('lanyard-visible');
                lanyard.classList.remove('lanyard-hidden');

                targetPosY = Math.min((currentScrollY - 15) * 0.55, MAX_DROP_PX);
            }

            const forceY = (targetPosY - posY) * STIFFNESS;
            velY = (velY + forceY) * DAMPING;
            posY += velY;

            const scrollDelta = currentScrollY - lastScrollY;
            const targetRot = Math.max(Math.min(scrollDelta * 0.38, 14), -14);
            const rotForce = (targetRot - rotDeg) * 0.12;
            rotVel = (rotVel + rotForce) * 0.80;
            rotDeg += rotVel;

            lanyard.style.setProperty('--lanyard-offset', `${posY}px`);
            lanyard.style.setProperty('--lanyard-rotation', `${rotDeg}deg`);

            lastScrollY = currentScrollY;

            requestAnimationFrame(lanyardPhysicsLoop);
        }

        requestAnimationFrame(lanyardPhysicsLoop);
    }

    function initLanyardToggle() {
        const lanyard = document.getElementById('lanyard');
        const lanyardBtn = document.getElementById('lanyard-toggle');
        const cardCloseBtn = document.getElementById('card-close-btn');
        if (!lanyard) return;

        function updateBtnState(isDisabled) {
            if (lanyardBtn) {
                lanyardBtn.classList.toggle('is-disabled', isDisabled);
                lanyardBtn.setAttribute('title', isDisabled ? 'ID Sling: HIDDEN (Click to Show)' : 'ID Sling: ACTIVE (Click to Hide)');
            }
        }

        const savedDisabled = localStorage.getItem('portfolio-lanyard-disabled');
        if (savedDisabled === 'true') {
            lanyard.classList.add('lanyard-user-disabled');
            updateBtnState(true);
        } else {
            updateBtnState(false);
        }

        function toggleLanyard(e) {
            if (e) e.stopPropagation();
            const isDisabled = lanyard.classList.toggle('lanyard-user-disabled');
            updateBtnState(isDisabled);
            localStorage.setItem('portfolio-lanyard-disabled', isDisabled ? 'true' : 'false');
        }

        if (lanyardBtn) lanyardBtn.addEventListener('click', toggleLanyard);
        if (cardCloseBtn) cardCloseBtn.addEventListener('click', toggleLanyard);
    }

    initLanyardToggle();

    function initCard3DFlipAndTilt() {
        const card3D = document.getElementById('lanyard-card-3d');
        const flipBtn = document.getElementById('card-flip-btn');
        const flipBackBtn = document.getElementById('card-flip-back-btn');
        const cardCloseBackBtn = document.getElementById('card-close-btn-back');
        const heroPortraitCard = document.getElementById('hero-portrait-card');

        function toggleFlip(e) {
            if (e) e.stopPropagation();
            if (card3D) {
                card3D.classList.toggle('is-flipped');
            }
        }

        if (flipBtn) flipBtn.addEventListener('click', toggleFlip);
        if (flipBackBtn) flipBackBtn.addEventListener('click', toggleFlip);

        if (cardCloseBackBtn) {
            cardCloseBackBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const lanyard = document.getElementById('lanyard');
                const lanyardBtn = document.getElementById('lanyard-toggle');
                if (lanyard) {
                    lanyard.classList.add('lanyard-user-disabled');
                    localStorage.setItem('portfolio-lanyard-disabled', 'true');
                }
                if (lanyardBtn) {
                    lanyardBtn.classList.add('is-disabled');
                    lanyardBtn.setAttribute('title', 'ID Sling: HIDDEN (Click to Show)');
                }
            });
        }

        const tiltElements = [card3D, heroPortraitCard].filter(Boolean);

        tiltElements.forEach(elem => {
            elem.addEventListener('mousemove', (e) => {
                const rect = elem.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = -((y - centerY) / centerY) * 12;
                const rotateY = ((x - centerX) / centerX) * 12;

                elem.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
            });

            elem.addEventListener('mouseleave', () => {
                elem.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }

    initCard3DFlipAndTilt();

    function initHeroBoxesCanvas() {
        const canvas = document.getElementById('hero-boxes-canvas');
        const heroSection = document.getElementById('hero');
        if (!canvas || !heroSection) return;

        const ctx = canvas.getContext('2d');

        let width = 0;
        let height = 0;
        let dpr = 1;

        const TILE_SIZE = 56;    
        const GAP = 10;          
        const RADIUS = 14;       

        let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };

        function resize() {
            dpr = window.devicePixelRatio || 1;
            const rect = heroSection.getBoundingClientRect();
            width = rect.width;
            height = rect.height;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.scale(dpr, dpr);
        }

        function drawRoundedRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x, y, w, h, r);
            } else {
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
            }
        }

        function render() {

            mouse.x += (mouse.targetX - mouse.x) * 0.12;
            mouse.y += (mouse.targetY - mouse.y) * 0.12;

            ctx.clearRect(0, 0, width, height);

            const totalCellSize = TILE_SIZE + GAP;
            const cols = Math.ceil(width / totalCellSize) + 1;
            const rows = Math.ceil(height / totalCellSize) + 1;

            const spotlightX = width * 0.75;
            const spotlightY = height * 0.45;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = c * totalCellSize;
                    const y = r * totalCellSize;
                    const centerX = x + TILE_SIZE / 2;
                    const centerY = y + TILE_SIZE / 2;

                    const distToMouse = Math.hypot(centerX - mouse.x, centerY - mouse.y);
                    const mouseInfluenceRadius = 240;
                    let mouseIntensity = 0;

                    if (distToMouse < mouseInfluenceRadius) {
                        mouseIntensity = 1 - (distToMouse / mouseInfluenceRadius);
                        mouseIntensity = Math.pow(mouseIntensity, 2); 
                    }

                    const distToSpotlight = Math.hypot(centerX - spotlightX, centerY - spotlightY);
                    const spotlightRadius = 650;
                    let spotlightIntensity = 0;
                    if (distToSpotlight < spotlightRadius) {
                        spotlightIntensity = Math.max(0, 1 - (distToSpotlight / spotlightRadius));
                        spotlightIntensity = Math.pow(spotlightIntensity, 1.8);
                    }

                    drawRoundedRect(ctx, x, y, TILE_SIZE, TILE_SIZE, RADIUS);

                    const isLight = window.isLightTheme;

                    let strokeColor = isLight 
                        ? `rgba(184, 134, 11, ${0.45 + spotlightIntensity * 0.35})` 
                        : `rgba(179, 46, 51, ${0.16 + spotlightIntensity * 0.22})`;
                    let strokeWidth = isLight ? 1.6 : 1.2;

                    const grad = ctx.createLinearGradient(x, y, x + TILE_SIZE, y + TILE_SIZE);

                    if (mouseIntensity > 0.01) {
                        if (isLight) {
                            grad.addColorStop(0, `rgba(214, 40, 50, ${0.45 + mouseIntensity * 0.45})`);
                            grad.addColorStop(1, `rgba(184, 134, 11, ${0.35 + mouseIntensity * 0.45})`);
                            strokeColor = `rgba(179, 46, 51, ${0.75 + mouseIntensity * 0.25})`;
                            ctx.shadowColor = `rgba(179, 46, 51, ${mouseIntensity * 0.65})`;
                        } else {
                            const redVal = Math.round(179 + mouseIntensity * 76);    
                            const greenVal = Math.round(46 + mouseIntensity * 180);  
                            const blueVal = Math.round(51 + mouseIntensity * 80);    

                            grad.addColorStop(0, `rgba(${redVal}, ${greenVal}, ${blueVal}, ${0.4 + mouseIntensity * 0.55})`);
                            grad.addColorStop(1, `rgba(179, 46, 51, ${0.25 + mouseIntensity * 0.45})`);

                            strokeColor = `rgba(230, 57, 70, ${0.4 + mouseIntensity * 0.6})`;
                            ctx.shadowColor = `rgba(230, 57, 70, ${mouseIntensity * 0.85})`;
                        }
                        strokeWidth = 1.6 + mouseIntensity * 1.5;
                        ctx.shadowBlur = mouseIntensity * 24;
                    } else {

                        const baseAlpha = 0.08 + spotlightIntensity * 0.28;
                        if (isLight) {
                            grad.addColorStop(0, `rgba(236, 226, 210, ${0.92 + spotlightIntensity * 0.08})`);
                            grad.addColorStop(1, `rgba(220, 206, 186, ${0.88 + spotlightIntensity * 0.10})`);
                        } else {
                            grad.addColorStop(0, `rgba(92, 16, 16, ${baseAlpha * 1.2})`);
                            grad.addColorStop(1, `rgba(20, 8, 9, ${baseAlpha * 0.8})`);
                        }
                        ctx.shadowColor = 'transparent';
                        ctx.shadowBlur = 0;
                    }

                    ctx.fillStyle = grad;
                    ctx.fill();

                    ctx.lineWidth = strokeWidth;
                    ctx.strokeStyle = strokeColor;
                    ctx.stroke();

                    ctx.save();
                    drawRoundedRect(ctx, x, y, TILE_SIZE, TILE_SIZE, RADIUS);
                    ctx.clip();
                    ctx.beginPath();
                    ctx.moveTo(x, y + TILE_SIZE);
                    ctx.lineTo(x, y);
                    ctx.lineTo(x + TILE_SIZE, y);
                    ctx.strokeStyle = mouseIntensity > 0.01 
                        ? (isLight ? `rgba(179, 46, 51, ${0.5 + mouseIntensity * 0.4})` : `rgba(255, 224, 130, ${0.3 + mouseIntensity * 0.6})`)
                        : (isLight ? `rgba(184, 134, 11, ${0.35 + spotlightIntensity * 0.25})` : `rgba(212, 175, 55, ${0.12 + spotlightIntensity * 0.25})`);
                    ctx.lineWidth = 1.6;
                    ctx.stroke();
                    ctx.restore();
                }
            }

            requestAnimationFrame(render);
        }

        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            mouse.targetX = e.clientX - rect.left;
            mouse.targetY = e.clientY - rect.top;
            mouse.active = true;
        });

        heroSection.addEventListener('mouseleave', () => {
            mouse.targetX = -1000;
            mouse.targetY = -1000;
            mouse.active = false;
        });

        window.addEventListener('resize', resize);

        resize();
        render();
    }

    initHeroBoxesCanvas();

    function initThemeToggle() {
        const themeBtn = document.getElementById('theme-toggle');
        if (!themeBtn) return;

        const sunIcon = themeBtn.querySelector('.theme-icon-sun');
        const moonIcon = themeBtn.querySelector('.theme-icon-moon');

        function applyTheme(theme) {
            window.isLightTheme = (theme === 'light');
            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
                if (sunIcon && moonIcon) {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                }
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                if (sunIcon && moonIcon) {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                }
            }
        }

        const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
        applyTheme(savedTheme);

        themeBtn.addEventListener('click', (e) => {
            const currentTheme = window.isLightTheme ? 'light' : 'dark';
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

            const x = e.clientX || window.innerWidth / 2;
            const y = e.clientY || window.innerHeight / 2;
            const maxRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            themeBtn.classList.add('theme-toggle-animating');
            setTimeout(() => themeBtn.classList.remove('theme-toggle-animating'), 650);

            if (document.startViewTransition) {
                document.documentElement.style.setProperty('--toggle-x', `${x}px`);
                document.documentElement.style.setProperty('--toggle-y', `${y}px`);
                document.documentElement.style.setProperty('--toggle-r', `${maxRadius}px`);

                document.startViewTransition(() => {
                    applyTheme(nextTheme);
                });
            } else {

                performOverlayFallback(nextTheme, x, y, maxRadius, () => {
                    applyTheme(nextTheme);
                });
            }

            localStorage.setItem('portfolio-theme', nextTheme);
        });

        function performOverlayFallback(nextTheme, x, y, maxRadius, callback) {
            const overlay = document.createElement('div');
            overlay.className = 'theme-transition-fallback-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: ${y}px;
                left: ${x}px;
                width: 1px;
                height: 1px;
                border-radius: 50%;
                background-color: ${nextTheme === 'light' ? '#f6f3ed' : '#060505'};
                transform: translate(-50%, -50%) scale(0);
                transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease 0.65s;
                z-index: 999999;
                pointer-events: none;
            `;
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.style.transform = `translate(-50%, -50%) scale(${maxRadius * 2.5})`;
                setTimeout(() => {
                    callback();
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.remove(), 300);
                }, 350);
            });
        }
    }

    initThemeToggle();

    function initTimelineScroll() {
        const progressBar = document.getElementById('timeline-progress-bar');
        const timelineContainer = document.querySelector('.timeline-container');
        const timelineItems = document.querySelectorAll('.timeline-item');
        if (!progressBar || !timelineContainer) return;

        function updateTimelineProgress() {
            const rect = timelineContainer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const totalHeight = rect.height;
            const scrollOffset = (viewportHeight * 0.5) - rect.top;
            let progressPct = (scrollOffset / totalHeight) * 100;
            progressPct = Math.max(0, Math.min(100, progressPct));

            progressBar.style.height = `${progressPct}%`;

            timelineItems.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                if (itemRect.top <= viewportHeight * 0.58) {
                    item.classList.add('active-node');
                } else {
                    item.classList.remove('active-node');
                }
            });
        }

        window.addEventListener('scroll', updateTimelineProgress, { passive: true });
        updateTimelineProgress();
    }

    initTimelineScroll();

    function initProjectProjections() {
        const projectsSection = document.getElementById('projects');
        const projectCards = document.querySelectorAll('.project-row-card[data-project]');
        const ambientLayers = document.querySelectorAll('.ambient-layer');
        const stageLayers = document.querySelectorAll('.stage-layer');
        const defaultStageLayer = document.querySelector('.stage-layer.stage-default');
        const stageTitle = document.getElementById('stage-window-title');
        const stageFrame = document.querySelector('.stage-window-frame');
        const stageCard = document.querySelector('.stage-sticky-card');
        const stageColumn = document.querySelector('.projects-stage-column');
        if (!projectsSection || !projectCards.length) return;

        const titlesMap = {
            'questkarte': 'QUESTKARTE — LIVE WEB PLATFORM',
            'wildnest': 'WILDNEST — RESORT GUI SYSTEM',
            'apartlink': 'APARTLINK — PROPERTY MANAGEMENT SYSTEM'
        };

        projectsSection.addEventListener('mousemove', (e) => {
            const rect = projectsSection.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            projectsSection.style.setProperty('--mouse-x', `${x.toFixed(1)}%`);
            projectsSection.style.setProperty('--mouse-y', `${y.toFixed(1)}%`);

            if (stageFrame && projectsSection.classList.contains('ambient-active')) {
                const tiltX = (y - 50) * -0.12;
                const tiltY = (x - 50) * 0.12;
                stageFrame.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale(1.02)`;
            }
        }, { passive: true });

        projectCards.forEach(card => {
            const projectKey = card.getAttribute('data-project');
            const targetAmbientLayer = document.querySelector(`.ambient-layer.ambient-${projectKey}`);
            const targetStageLayer = document.querySelector(`.stage-layer.stage-${projectKey}`);

            card.addEventListener('mouseenter', () => {
                projectsSection.classList.add('ambient-active');

                ambientLayers.forEach(layer => layer.classList.remove('active'));
                if (targetAmbientLayer) targetAmbientLayer.classList.add('active');

                stageLayers.forEach(layer => layer.classList.remove('active'));
                if (targetStageLayer) targetStageLayer.classList.add('active');

                if (stageTitle && titlesMap[projectKey]) {
                    stageTitle.textContent = titlesMap[projectKey];
                }

                if (stageFrame) {
                    stageFrame.classList.remove('glow-questkarte', 'glow-wildnest', 'glow-apartlink');
                    stageFrame.classList.add(`glow-${projectKey}`);
                }

                if (stageCard && stageColumn) {
                    const cardRect = card.getBoundingClientRect();
                    const columnRect = stageColumn.getBoundingClientRect();
                    const desiredY = cardRect.top - columnRect.top;
                    const maxAllowedY = Math.max(0, stageColumn.offsetHeight - stageCard.offsetHeight);
                    const clampedY = Math.min(Math.max(0, desiredY), maxAllowedY);
                    stageCard.style.transform = `translateY(${clampedY}px)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                projectsSection.classList.remove('ambient-active');

                if (targetAmbientLayer) targetAmbientLayer.classList.remove('active');

                stageLayers.forEach(layer => layer.classList.remove('active'));
                if (defaultStageLayer) defaultStageLayer.classList.add('active');

                if (stageTitle) stageTitle.textContent = 'SYSTEM SHOWCASE STAGE';

                if (stageFrame) {
                    stageFrame.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
                    stageFrame.classList.remove('glow-questkarte', 'glow-wildnest', 'glow-apartlink');
                }
            });
        });
    }

    initProjectProjections();

    function initProjectsParticleCanvas() {
        const canvas = document.getElementById('projects-canvas');
        const projectsSection = document.getElementById('projects');
        if (!canvas || !projectsSection) return;

        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let dpr = 1;

        let activeMode = 'idle'; 
        let mouse = { x: -1000, y: -1000 };
        let time = 0;

        const clusterConfigs = [
            { relX: 0.82, relY: 0.28, baseRadius: 210, nodeCount: 20, rotSpeed: 0.0012 },  
            { relX: 0.18, relY: 0.35, baseRadius: 230, nodeCount: 22, rotSpeed: -0.0009 }, 
            { relX: 0.76, relY: 0.72, baseRadius: 190, nodeCount: 18, rotSpeed: 0.0014 },  
            { relX: 0.22, relY: 0.78, baseRadius: 200, nodeCount: 18, rotSpeed: -0.0011 }, 
            { relX: 0.50, relY: 0.15, baseRadius: 170, nodeCount: 15, rotSpeed: 0.0010 },  
            { relX: 0.48, relY: 0.55, baseRadius: 180, nodeCount: 16, rotSpeed: -0.0013 }, 
            { relX: 0.88, relY: 0.92, baseRadius: 160, nodeCount: 14, rotSpeed: 0.0015 }   
        ];

        class ConstellationCluster {
            constructor(config) {
                this.relX = config.relX;
                this.relY = config.relY;
                this.baseRadius = config.baseRadius;
                this.rotSpeed = config.rotSpeed;
                this.angle = Math.random() * Math.PI * 2;
                this.nodeCount = config.nodeCount;
                this.nodes = [];
                this.initNodes();
            }

            initNodes() {
                this.nodes = [];
                for (let i = 0; i < this.nodeCount; i++) {
                    const rad = (Math.random() * 0.75 + 0.25) * this.baseRadius;
                    const nodeAngle = (i / this.nodeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
                    this.nodes.push({
                        lx: Math.cos(nodeAngle) * rad,
                        ly: Math.sin(nodeAngle) * rad,
                        ox: Math.cos(nodeAngle) * rad,
                        oy: Math.sin(nodeAngle) * rad,
                        size: Math.random() * 2.2 + 1.8,
                        pulse: Math.random() * Math.PI * 2
                    });
                }
            }

            update(w, h, mouseX, mouseY) {
                this.angle += this.rotSpeed;

                const driftX = Math.sin(time * 0.02 + this.relX * 10) * 35;
                const driftY = Math.cos(time * 0.015 + this.relY * 10) * 35;

                const cx = w * this.relX + driftX;
                const cy = h * this.relY + driftY;

                const cosA = Math.cos(this.angle);
                const sinA = Math.sin(this.angle);

                return this.nodes.map(n => {
                    n.pulse += 0.03;
                    n.lx = n.ox + Math.sin(n.pulse) * 6;
                    n.ly = n.oy + Math.cos(n.pulse * 0.8) * 6;

                    let rx = n.lx * cosA - n.ly * sinA;
                    let ry = n.lx * sinA + n.ly * cosA;

                    let wx = cx + rx;
                    let wy = cy + ry;

                    const dx = mouseX - wx;
                    const dy = mouseY - wy;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 180) {
                        const force = (180 - dist) / 180;
                        wx -= (dx / dist) * force * 28;
                        wy -= (dy / dist) * force * 28;
                    }

                    return {
                        x: wx,
                        y: wy,
                        size: n.size,
                        pulse: n.pulse
                    };
                });
            }
        }

        let clusters = [];

        function resize() {
            dpr = window.devicePixelRatio || 1;
            const rect = projectsSection.getBoundingClientRect();
            width = rect.width;
            height = rect.height;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            clusters = clusterConfigs.map(cfg => new ConstellationCluster(cfg));
        }

        function getThemeColors() {
            const isLight = window.isLightTheme;

            if (activeMode === 'questkarte') {
                return isLight ? {
                    primary: 'rgba(0, 140, 200, ',
                    secondary: 'rgba(0, 90, 180, ',
                    facet: 'rgba(0, 140, 200, 0.08)',
                    glow: '#008cc8'
                } : {
                    primary: 'rgba(0, 210, 255, ',
                    secondary: 'rgba(0, 160, 255, ',
                    facet: 'rgba(0, 210, 255, 0.05)',
                    glow: '#00d2ff'
                };
            } else if (activeMode === 'wildnest') {
                return isLight ? {
                    primary: 'rgba(10, 145, 95, ',
                    secondary: 'rgba(30, 160, 110, ',
                    facet: 'rgba(10, 145, 95, 0.08)',
                    glow: '#0a915f'
                } : {
                    primary: 'rgba(16, 185, 129, ',
                    secondary: 'rgba(52, 211, 153, ',
                    facet: 'rgba(16, 185, 129, 0.05)',
                    glow: '#10b981'
                };
            } else if (activeMode === 'apartlink') {
                return isLight ? {
                    primary: 'rgba(0, 150, 190, ',
                    secondary: 'rgba(130, 70, 210, ',
                    facet: 'rgba(0, 150, 190, 0.08)',
                    glow: '#0096c8'
                } : {
                    primary: 'rgba(0, 229, 255, ',
                    secondary: 'rgba(192, 132, 252, ',
                    facet: 'rgba(0, 229, 255, 0.06)',
                    glow: '#00e5ff'
                };
            } else {
                return isLight ? {
                    primary: 'rgba(122, 21, 21, ',
                    secondary: 'rgba(184, 134, 11, ',
                    facet: 'rgba(184, 134, 11, 0.16)',
                    glow: '#7a1515'
                } : {
                    primary: 'rgba(212, 175, 55, ',
                    secondary: 'rgba(235, 195, 75, ',
                    facet: 'rgba(212, 175, 55, 0.04)',
                    glow: '#d4af37'
                };
            }
        }

        function render() {
            time += 1;
            ctx.clearRect(0, 0, width, height);

            const theme = getThemeColors();
            const worldClusters = clusters.map(c => c.update(width, height, mouse.x, mouse.y));

            worldClusters.forEach((nodes) => {

                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const d1 = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                        if (d1 > 140) continue;

                        for (let k = j + 1; k < nodes.length; k++) {
                            const d2 = Math.hypot(nodes[j].x - nodes[k].x, nodes[j].y - nodes[k].y);
                            const d3 = Math.hypot(nodes[i].x - nodes[k].x, nodes[i].y - nodes[k].y);

                            if (d2 < 140 && d3 < 140) {
                                ctx.beginPath();
                                ctx.moveTo(nodes[i].x, nodes[i].y);
                                ctx.lineTo(nodes[j].x, nodes[j].y);
                                ctx.lineTo(nodes[k].x, nodes[k].y);
                                ctx.closePath();
                                ctx.fillStyle = theme.facet;
                                ctx.fill();
                            }
                        }
                    }
                }

                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const dx = nodes[i].x - nodes[j].x;
                        const dy = nodes[i].y - nodes[j].y;
                        const dist = Math.hypot(dx, dy);
                        const maxDist = 160;

                        if (dist < maxDist) {
                            const alpha = (1 - dist / maxDist) * 0.35;
                            ctx.beginPath();
                            ctx.moveTo(nodes[i].x, nodes[i].y);
                            ctx.lineTo(nodes[j].x, nodes[j].y);
                            ctx.strokeStyle = theme.primary + alpha + ')';
                            ctx.lineWidth = 0.95;
                            ctx.stroke();

                            const pulsePos = (time * 0.02 + i + j) % 1;
                            const px = nodes[i].x + (nodes[j].x - nodes[i].x) * pulsePos;
                            const py = nodes[i].y + (nodes[j].y - nodes[i].y) * pulsePos;
                            ctx.beginPath();
                            ctx.arc(px, py, 1.2, 0, Math.PI * 2);
                            ctx.fillStyle = theme.secondary + (alpha * 1.5) + ')';
                            ctx.fill();
                        }
                    }
                }

                nodes.forEach(n => {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.size * 2.8, 0, Math.PI * 2);
                    ctx.fillStyle = theme.primary + '0.12)';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
                    ctx.fillStyle = theme.primary + '0.95)';
                    ctx.shadowColor = theme.glow;
                    ctx.shadowBlur = 12;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
            });

            for (let i = 0; i < worldClusters.length; i++) {
                for (let j = i + 1; j < worldClusters.length; j++) {
                    const nodesA = worldClusters[i];
                    const nodesB = worldClusters[j];
                    let minDist = 9999;
                    let pair = null;
                    nodesA.forEach(na => {
                        nodesB.forEach(nb => {
                            const d = Math.hypot(na.x - nb.x, na.y - nb.y);
                            if (d < minDist) {
                                minDist = d;
                                pair = [na, nb];
                            }
                        });
                    });

                    if (pair && minDist < 360) {
                        const alpha = (1 - minDist / 360) * 0.18;
                        ctx.beginPath();
                        ctx.moveTo(pair[0].x, pair[0].y);
                        ctx.lineTo(pair[1].x, pair[1].y);
                        ctx.strokeStyle = theme.primary + alpha + ')';
                        ctx.setLineDash([4, 6]);
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                }
            }

            requestAnimationFrame(render);
        }

        const projectCards = document.querySelectorAll('.project-row-card[data-project]');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                activeMode = card.getAttribute('data-project');
            });
            card.addEventListener('mouseleave', () => {
                activeMode = 'idle';
            });
        });

        projectsSection.addEventListener('mousemove', (e) => {
            const rect = projectsSection.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        projectsSection.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        window.addEventListener('resize', resize);
        resize();
        render();
    }

    initProjectsParticleCanvas();

    initProjectProjections();

    function initContactCanvas() {
        const canvas = document.getElementById('contact-canvas');
        const contactSection = document.getElementById('contact');
        if (!canvas || !contactSection) return;

        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let dpr = 1;
        let time = 0;
        let mouse = { x: -1000, y: -1000 };
        const shockwaves = [];

        function resize() {
            dpr = window.devicePixelRatio || 1;
            const rect = contactSection.getBoundingClientRect();
            width = rect.width;
            height = rect.height;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        }

        contactSection.addEventListener('mousemove', (e) => {
            const rect = contactSection.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        contactSection.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        contactSection.addEventListener('click', (e) => {
            const rect = contactSection.getBoundingClientRect();
            shockwaves.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                radius: 10,
                maxRadius: 280,
                alpha: 1
            });
        });

        function render() {
            time += 0.02;
            ctx.clearRect(0, 0, width, height);

            const isLight = window.isLightTheme;

            const waveCount = 8;
            for (let w = 0; w < waveCount; w++) {
                ctx.beginPath();
                const baseHeight = height * (0.10 + (w / (waveCount - 1)) * 0.80);
                const freq = 0.005 + (w % 3) * 0.003;
                const speed = time * (0.8 + (w % 4) * 0.35);

                const color = isLight
                    ? (w % 2 === 0 ? 'rgba(184, 134, 11, ' : 'rgba(179, 46, 51, ')
                    : (w % 2 === 0 ? 'rgba(212, 175, 55, ' : 'rgba(179, 46, 51, ');

                const amplitude = 34 + (w % 3) * 16;

                for (let x = 0; x <= width; x += 12) {
                    let y = baseHeight + Math.sin(x * freq + speed) * amplitude + Math.cos(x * 0.004 - speed * 0.6) * (amplitude * 0.4);

                    const dx = mouse.x - x;
                    const dy = mouse.y - y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 220) {
                        const push = Math.sin((1 - dist / 220) * Math.PI) * 50;
                        y += (dy / (dist || 1)) * push;
                    }

                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                const opacity = isLight ? (0.42 - (w % 3) * 0.06) : (0.24 - (w % 3) * 0.04);
                ctx.strokeStyle = color + opacity.toFixed(2) + ')';
                ctx.lineWidth = isLight ? (2.8 - (w % 3) * 0.4) : (2.2 - (w % 3) * 0.4);
                ctx.stroke();
            }

            for (let i = shockwaves.length - 1; i >= 0; i--) {
                const sw = shockwaves[i];
                sw.radius += 6;
                sw.alpha = 1 - sw.radius / sw.maxRadius;

                if (sw.alpha <= 0) {
                    shockwaves.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
                ctx.strokeStyle = isLight 
                    ? `rgba(179, 46, 51, ${sw.alpha * 0.75})` 
                    : `rgba(212, 175, 55, ${sw.alpha * 0.6})`;
                ctx.lineWidth = isLight ? 2.5 : 2;
                ctx.shadowColor = isLight ? '#b32e33' : '#d4af37';
                ctx.shadowBlur = 15;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            requestAnimationFrame(render);
        }

        window.addEventListener('resize', resize);
        resize();
        render();
    }

    function initContactCards3D() {
        const contactCards = document.querySelectorAll('.contact-card');
        const toast = document.getElementById('contact-copy-toast');
        let toastTimeout = null;

        function showToast(msg) {
            if (!toast) return;
            toast.textContent = msg || 'COPIED TO CLIPBOARD!';
            toast.classList.add('toast-active');
            if (toastTimeout) clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.remove('toast-active');
            }, 2600);
        }

        contactCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -12;
                const rotateY = ((x - centerX) / centerX) * 12;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
            });

            card.addEventListener('click', (e) => {
                const copyText = card.getAttribute('data-copy');
                if (copyText && copyText !== '#') {
                    navigator.clipboard.writeText(copyText).then(() => {
                        showToast(`COPIED: ${copyText.length > 25 ? copyText.substring(0, 22) + '...' : copyText}`);
                    }).catch(() => {
                        showToast('COPIED TO CLIPBOARD!');
                    });
                }
            });
        });
    }

    function initKineticSignature() {
        const clockEl = document.getElementById('live-pht-clock');
        const signatureContainer = document.getElementById('footer-kinetic-signature');
        const letters = document.querySelectorAll('.kinetic-letter');

        function updateClock() {
            if (!clockEl) return;
            const now = new Date();
            const options = {
                timeZone: 'Asia/Manila',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            clockEl.textContent = `${now.toLocaleTimeString('en-US', options)} PHT`;
        }

        setInterval(updateClock, 1000);
        updateClock();

        if (signatureContainer && letters.length) {
            document.addEventListener('mousemove', (e) => {
                const isLight = window.isLightTheme;

                letters.forEach(letter => {
                    const rect = letter.getBoundingClientRect();
                    const letterX = rect.left + rect.width / 2;
                    const letterY = rect.top + rect.height / 2;
                    const dist = Math.hypot(e.clientX - letterX, e.clientY - letterY);
                    const maxDist = 220;

                    if (dist < maxDist) {
                        const intensity = (1 - dist / maxDist);
                        letter.style.color = isLight 
                            ? `rgba(184, 134, 11, ${intensity.toFixed(2)})`
                            : `rgba(212, 175, 55, ${intensity.toFixed(2)})`;

                        letter.style.webkitTextStroke = isLight
                            ? `1.5px rgba(122, 21, 21, ${(0.45 + intensity * 0.55).toFixed(2)})`
                            : `1.5px rgba(212, 175, 55, ${(0.4 + intensity * 0.6).toFixed(2)})`;

                        letter.style.textShadow = isLight
                            ? `0 0 ${(intensity * 25).toFixed(0)}px rgba(184, 134, 11, ${(intensity * 0.7).toFixed(2)})`
                            : `0 0 ${(intensity * 25).toFixed(0)}px rgba(212, 175, 55, ${(intensity * 0.8).toFixed(2)})`;
                    } else {
                        letter.style.color = 'transparent';
                        letter.style.webkitTextStroke = isLight 
                            ? '1.5px rgba(122, 21, 21, 0.45)' 
                            : '1.5px rgba(212, 175, 55, 0.4)';
                        letter.style.textShadow = 'none';
                    }
                });
            });
        }
    }

    function initAboutSectionUI() {

        const canvas = document.getElementById('about-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let width = (canvas.width = canvas.parentElement.offsetWidth);
            let height = (canvas.height = canvas.parentElement.offsetHeight);
            let time = 0;

            let mouseX = -1000;
            let mouseY = -1000;
            const shockwaves = [];

            const section = canvas.parentElement;
            if (section) {
                section.addEventListener('mousemove', (e) => {
                    const rect = canvas.getBoundingClientRect();
                    mouseX = e.clientX - rect.left;
                    mouseY = e.clientY - rect.top;
                });
                section.addEventListener('mouseleave', () => {
                    mouseX = -1000;
                    mouseY = -1000;
                });

                section.addEventListener('click', (e) => {
                    const rect = canvas.getBoundingClientRect();
                    shockwaves.push({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                        radius: 5,
                        maxRadius: 280,
                        alpha: 1
                    });
                });
            }

            const particles = [];
            const particleCount = 35;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.5 + 0.4,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: -Math.random() * 0.4 - 0.15,
                    alpha: Math.random() * 0.5 + 0.2,
                    pulseSpeed: Math.random() * 0.03 + 0.01
                });
            }

            let pcbTraces = [];
            let pcbVias = [];
            let pcbPulses = [];

            function generatePCBNetwork() {
                pcbTraces = [];
                pcbVias = [];
                pcbPulses = [];

                if (width < 400 || height < 300) return;

                const layout = [

                    { start: { x: 30, y: 35 }, mid: { x: 260, y: 35 }, end: { x: 300, y: 70 }, color: 'rgba(212, 175, 55, ' },
                    { start: { x: 50, y: 70 }, mid: { x: 180, y: 70 }, end: { x: 220, y: 110 }, color: 'rgba(179, 46, 51, ' },

                    { start: { x: width - 30, y: 40 }, mid: { x: width - 280, y: 40 }, end: { x: width - 320, y: 80 }, color: 'rgba(212, 175, 55, ' },
                    { start: { x: width - 60, y: 80 }, mid: { x: width - 200, y: 80 }, end: { x: width - 240, y: 120 }, color: 'rgba(179, 46, 51, ' },

                    { start: { x: width * 0.52, y: 40 }, mid: { x: width * 0.52, y: 220 }, end: { x: width * 0.56, y: 280 }, color: 'rgba(212, 175, 55, ' },
                    { start: { x: width * 0.48, y: height - 40 }, mid: { x: width * 0.48, y: height - 200 }, end: { x: width * 0.44, y: height - 260 }, color: 'rgba(179, 46, 51, ' },

                    { start: { x: 35, y: height - 35 }, mid: { x: 280, y: height - 35 }, end: { x: 320, y: height - 75 }, color: 'rgba(212, 175, 55, ' },
                    { start: { x: 60, y: height - 75 }, mid: { x: 200, y: height - 75 }, end: { x: 240, y: height - 115 }, color: 'rgba(179, 46, 51, ' },

                    { start: { x: width - 35, y: height - 35 }, mid: { x: width - 280, y: height - 35 }, end: { x: width - 320, y: height - 75 }, color: 'rgba(212, 175, 55, ' },
                    { start: { x: width - 60, y: height - 75 }, mid: { x: width - 220, y: height - 75 }, end: { x: width - 260, y: height - 115 }, color: 'rgba(179, 46, 51, ' }
                ];

                layout.forEach((route, idx) => {
                    const vStart = { x: route.start.x, y: route.start.y, radius: 4, glow: 0 };
                    const vEnd = { x: route.end.x, y: route.end.y, radius: 3.5, glow: 0 };
                    pcbVias.push(vStart, vEnd);

                    pcbTraces.push({
                        path: [route.start, route.mid, route.end],
                        color: route.color,
                        baseWidth: 1.3,
                        alpha: 0.22,
                        vias: [vStart, vEnd]
                    });

                    pcbPulses.push({
                        traceIdx: idx,
                        progress: Math.random(),
                        speed: 0.003 + Math.random() * 0.002,
                        color: idx % 2 === 0 ? '#ffd700' : '#00e676'
                    });
                });
            }

            function resizeCanvas() {
                if (!canvas.parentElement) return;
                width = canvas.width = canvas.parentElement.offsetWidth;
                height = canvas.height = canvas.parentElement.offsetHeight;
                generatePCBNetwork();
            }

            generatePCBNetwork();

            function renderAboutCanvas() {
                time += 0.008;
                ctx.clearRect(0, 0, width, height);

                const grad1X = width * 0.2 + Math.sin(time) * 60;
                const grad1Y = height * 0.3 + Math.cos(time * 0.8) * 40;
                const radGrad1 = ctx.createRadialGradient(grad1X, grad1Y, 10, grad1X, grad1Y, width * 0.45);
                radGrad1.addColorStop(0, 'rgba(179, 46, 51, 0.14)');
                radGrad1.addColorStop(0.5, 'rgba(92, 16, 16, 0.05)');
                radGrad1.addColorStop(1, 'transparent');
                ctx.fillStyle = radGrad1;
                ctx.fillRect(0, 0, width, height);

                const grad2X = width * 0.8 - Math.cos(time * 0.7) * 70;
                const grad2Y = height * 0.7 + Math.sin(time * 0.9) * 50;
                const radGrad2 = ctx.createRadialGradient(grad2X, grad2Y, 10, grad2X, grad2Y, width * 0.4);
                radGrad2.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
                radGrad2.addColorStop(0.5, 'rgba(179, 46, 51, 0.04)');
                radGrad2.addColorStop(1, 'transparent');
                ctx.fillStyle = radGrad2;
                ctx.fillRect(0, 0, width, height);

                for (let i = shockwaves.length - 1; i >= 0; i--) {
                    const sw = shockwaves[i];
                    sw.radius += 6;
                    sw.alpha = 1 - sw.radius / sw.maxRadius;

                    if (sw.alpha <= 0) {
                        shockwaves.splice(i, 1);
                        continue;
                    }

                    ctx.beginPath();
                    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(0, 230, 118, ${sw.alpha * 0.75})`;
                    ctx.lineWidth = 1.8;
                    ctx.shadowColor = '#00e676';
                    ctx.shadowBlur = 12 * sw.alpha;
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    for (let j = 0; j < pcbVias.length; j++) {
                        const v = pcbVias[j];
                        const dist = Math.hypot(v.x - sw.x, v.y - sw.y);
                        if (Math.abs(dist - sw.radius) < 22) {
                            v.glow = Math.min(1, v.glow + 0.6);
                        }
                    }
                }

                const isLight = window.isLightTheme;

                for (let i = 0; i < pcbTraces.length; i++) {
                    const trace = pcbTraces[i];
                    const p = trace.path;

                    const distStart = Math.hypot(mouseX - p[0].x, mouseY - p[0].y);
                    const distEnd = Math.hypot(mouseX - p[2].x, mouseY - p[2].y);
                    const isNearMouse = distStart < 160 || distEnd < 160;

                    const baseAlpha = isLight ? 0.48 : 0.22;
                    const targetAlpha = isNearMouse ? (isLight ? 0.85 : 0.65) : baseAlpha;
                    trace.alpha += (targetAlpha - trace.alpha) * 0.1;

                    ctx.beginPath();
                    ctx.moveTo(p[0].x, p[0].y);
                    ctx.lineTo(p[1].x, p[1].y);
                    ctx.lineTo(p[2].x, p[2].y);

                    const strokeColor = isLight
                        ? (i % 2 === 0 ? `rgba(184, 134, 11, ${trace.alpha.toFixed(2)})` : `rgba(179, 46, 51, ${trace.alpha.toFixed(2)})`)
                        : trace.color + trace.alpha.toFixed(2) + ')';

                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = isNearMouse ? 2.2 : (isLight ? 1.6 : trace.baseWidth);
                    if (isNearMouse) {
                        ctx.shadowColor = isLight ? '#b32e33' : '#00e676';
                        ctx.shadowBlur = 6;
                    }
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }

                for (let i = 0; i < pcbVias.length; i++) {
                    const via = pcbVias[i];
                    const distToMouse = Math.hypot(mouseX - via.x, mouseY - via.y);

                    if (distToMouse < 160) {
                        via.glow = Math.min(1, via.glow + 0.1);
                    } else {
                        via.glow = Math.max(0, via.glow - 0.04);
                    }

                    const isGlowing = via.glow > 0.3;
                    const ringColor = isLight
                        ? (isGlowing ? '#b32e33' : 'rgba(184, 134, 11, 0.65)')
                        : (isGlowing ? '#00e676' : 'rgba(212, 175, 55, 0.4)');

                    ctx.beginPath();
                    ctx.arc(via.x, via.y, via.radius + (isGlowing ? 1 : 0), 0, Math.PI * 2);
                    ctx.strokeStyle = ringColor;
                    ctx.lineWidth = isGlowing ? 2.0 : 1.4;
                    if (isGlowing) {
                        ctx.shadowColor = isLight ? '#b32e33' : '#00e676';
                        ctx.shadowBlur = 10 * via.glow;
                    }
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    ctx.beginPath();
                    ctx.arc(via.x, via.y, via.radius * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = isLight 
                        ? (isGlowing ? '#7a1515' : 'rgba(184, 134, 11, 0.85)') 
                        : (isGlowing ? '#ffffff' : 'rgba(212, 175, 55, 0.7)');
                    ctx.fill();
                }

                for (let i = 0; i < pcbPulses.length; i++) {
                    const pulse = pcbPulses[i];
                    const trace = pcbTraces[pulse.traceIdx];
                    if (!trace) continue;

                    const p = trace.path;
                    const distToMouse = Math.hypot(mouseX - p[1].x, mouseY - p[1].y);
                    const speedMultiplier = distToMouse < 180 ? 2.5 : 1.0;

                    pulse.progress += pulse.speed * speedMultiplier;
                    if (pulse.progress > 1) pulse.progress = 0;

                    const len1 = Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y);
                    const len2 = Math.hypot(p[2].x - p[1].x, p[2].y - p[1].y);
                    const totalLen = len1 + len2;
                    const targetDist = pulse.progress * totalLen;

                    let currX, currY;
                    if (targetDist <= len1) {
                        const ratio = targetDist / (len1 || 1);
                        currX = p[0].x + (p[1].x - p[0].x) * ratio;
                        currY = p[0].y + (p[1].y - p[0].y) * ratio;
                    } else {
                        const ratio = (targetDist - len1) / (len2 || 1);
                        currX = p[1].x + (p[2].x - p[1].x) * ratio;
                        currY = p[1].y + (p[2].y - p[1].y) * ratio;
                    }

                    ctx.beginPath();
                    ctx.arc(currX, currY, distToMouse < 180 ? 3.2 : 2.4, 0, Math.PI * 2);
                    const pulseColor = isLight 
                        ? (pulse.traceIdx % 2 === 0 ? '#b8860b' : '#b32e33') 
                        : pulse.color;
                    ctx.fillStyle = pulseColor;
                    ctx.shadowColor = pulseColor;
                    ctx.shadowBlur = distToMouse < 180 ? 12 : 6;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                for (let i = 0; i < particles.length; i++) {
                    const pt = particles[i];
                    pt.x += pt.vx;
                    pt.y += pt.vy;
                    pt.alpha += Math.sin(time * 10 * pt.pulseSpeed) * 0.005;

                    if (pt.y < -10) {
                        pt.y = height + 10;
                        pt.x = Math.random() * width;
                    }
                    if (pt.x < -10) pt.x = width + 10;
                    if (pt.x > width + 10) pt.x = -10;

                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
                    const particleColor = isLight 
                        ? `rgba(184, 134, 11, ${Math.max(0.2, Math.min(0.85, pt.alpha)).toFixed(2)})`
                        : `rgba(212, 175, 55, ${Math.max(0.1, Math.min(0.7, pt.alpha)).toFixed(2)})`;
                    ctx.fillStyle = particleColor;
                    ctx.fill();
                }

                requestAnimationFrame(renderAboutCanvas);
            }

            window.addEventListener('resize', resizeCanvas);
            renderAboutCanvas();
        }

        const tiltCards = document.querySelectorAll('#about-parallax-card, .stat-card[data-tilt]');

        tiltCards.forEach(card => {
            const glare = card.querySelector('.photo-card-glare, .stat-card-glare');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const maxTilt = card.classList.contains('about-photo-card') ? 14 : 10;
                const rotateX = ((y - centerY) / centerY) * -maxTilt;
                const rotateY = ((x - centerX) / centerX) * maxTilt;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;

                if (glare) {
                    const glareX = (x / rect.width) * 100;
                    const glareY = (y / rect.height) * 100;
                    glare.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 215, 0, 0.28), transparent 60%)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                if (glare) {
                    glare.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.2), transparent 65%)';
                }
            });
        });
    }

    function initSkillsFluidCanvas() {
        const canvas = document.getElementById('skills-fluid-canvas');
        const skillsSection = document.getElementById('skills');
        if (!canvas || !skillsSection) return;

        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let time = 0;
        let mouse = { x: -1000, y: -1000 };
        let shockwave = 0;

        function resize() {
            width = canvas.width = skillsSection.offsetWidth;
            height = canvas.height = skillsSection.offsetHeight;
        }

        skillsSection.addEventListener('mousemove', (e) => {
            const rect = skillsSection.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        skillsSection.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        skillsSection.addEventListener('click', () => {
            shockwave = 1.0;
        });

        const blobs = [
            {
                baseXRatio: 0.15,
                baseYRatio: 0.25,
                baseRadius: 180,
                colorDark: ['#ffd700', '#e63946', '#5c1010'],
                colorLight: ['#e63946', '#ffb703', '#d4af37'],
                freq: 3,
                speed: 0.9
            },
            {
                baseXRatio: 0.85,
                baseYRatio: 0.28,
                baseRadius: 210,
                colorDark: ['#00f2fe', '#4facfe', '#6b11ff'],
                colorLight: ['#00b4d8', '#7209b7', '#3a0ca3'],
                freq: 4,
                speed: 0.7
            },
            {
                baseXRatio: 0.12,
                baseYRatio: 0.78,
                baseRadius: 200,
                colorDark: ['#e066ff', '#b32e33', '#d4af37'],
                colorLight: ['#d62828', '#f77f00', '#fcbf49'],
                freq: 5,
                speed: 1.1
            },
            {
                baseXRatio: 0.88,
                baseYRatio: 0.75,
                baseRadius: 190,
                colorDark: ['#ffd700', '#ff4d56', '#2b090a'],
                colorLight: ['#fb8500', '#d62828', '#003049'],
                freq: 3,
                speed: 0.85
            }
        ];

        function drawFluidBlob(blob) {
            const isLight = window.isLightTheme;
            const colors = isLight ? blob.colorLight : blob.colorDark;

            let cx = width * blob.baseXRatio;
            let cy = height * blob.baseYRatio;

            const dx = mouse.x - cx;
            const dy = mouse.y - cy;
            const dist = Math.hypot(dx, dy);
            const maxDist = 350;

            if (dist < maxDist) {
                const pull = (1 - dist / maxDist) * 45;
                cx += (dx / dist) * pull;
                cy += (dy / dist) * pull;
            }

            const R = blob.baseRadius * (width < 768 ? 0.65 : 1.0);
            const points = [];
            const numPoints = 64;

            if (shockwave > 0) shockwave = Math.max(0, shockwave - 0.02);

            for (let i = 0; i < numPoints; i++) {
                const theta = (i / numPoints) * Math.PI * 2;

                const n1 = Math.sin(theta * blob.freq + time * blob.speed) * (20 + shockwave * 35);
                const n2 = Math.cos(theta * (blob.freq + 1) - time * blob.speed * 0.8) * 16;
                const r = R + n1 + n2;

                points.push({
                    x: cx + Math.cos(theta) * r,
                    y: cy + Math.sin(theta) * r
                });
            }

            ctx.beginPath();
            ctx.moveTo((points[0].x + points[numPoints - 1].x) / 2, (points[0].y + points[numPoints - 1].y) / 2);

            for (let i = 0; i < numPoints; i++) {
                const next = points[(i + 1) % numPoints];
                const midX = (points[i].x + next.x) / 2;
                const midY = (points[i].y + next.y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
            }
            ctx.closePath();

            const grad = ctx.createRadialGradient(
                cx - R * 0.35, cy - R * 0.35, R * 0.1,
                cx, cy, R * 1.3
            );
            grad.addColorStop(0, colors[0]);
            grad.addColorStop(0.5, colors[1]);
            grad.addColorStop(1, colors[2]);

            ctx.fillStyle = grad;
            ctx.globalAlpha = isLight ? 0.82 : 0.72;
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(cx - R * 0.3, cy - R * 0.3, R * 0.25, R * 0.12, Math.PI / 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.globalAlpha = isLight ? 0.6 : 0.35;
            ctx.fill();

            ctx.globalAlpha = 1.0;
        }

        function render() {
            time += 0.015;
            ctx.clearRect(0, 0, width, height);

            blobs.forEach(blob => drawFluidBlob(blob));

            requestAnimationFrame(render);
        }

        window.addEventListener('resize', resize);
        resize();
        render();
    }

    function initScrollTypewriterAndReveals() {

        const revealElements = document.querySelectorAll('.reveal-on-scroll');

        function scheduleReveal(target) {
            if (!window.splashDismissed && target.closest('#hero')) {
                document.addEventListener('splashDismissed', () => {
                    setTimeout(() => target.classList.add('is-revealed'), 200);
                }, { once: true });
            } else {
                target.classList.add('is-revealed');
            }
        }

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scheduleReveal(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));

        const typewriterHeadings = document.querySelectorAll('[data-typewriter="true"]');

        function parseHTMLTokens(container) {
            const tokens = [];

            function traverse(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    for (let i = 0; i < text.length; i++) {
                        tokens.push({ type: 'char', value: text[i] });
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();
                    const attrs = Array.from(node.attributes)
                        .map(attr => `${attr.name}="${attr.value}"`)
                        .join(' ');
                    const openTag = `<${tagName}${attrs ? ' ' + attrs : ''}>`;
                    const closeTag = `</${tagName}>`;

                    tokens.push({ type: 'tag-open', value: openTag });
                    Array.from(node.childNodes).forEach(child => traverse(child));
                    tokens.push({ type: 'tag-close', value: closeTag });
                }
            }

            Array.from(container.childNodes).forEach(child => traverse(child));
            return tokens;
        }

        function animateTypewriter(heading) {
            if (heading.dataset.typewriterStarted === 'true') return;
            heading.dataset.typewriterStarted = 'true';

            const originalHTML = heading.innerHTML;
            const fullTokens = parseHTMLTokens(heading);
            const computedHeight = heading.offsetHeight;
            if (computedHeight > 0) {
                heading.style.minHeight = `${computedHeight}px`;
            }

            heading.innerHTML = '';
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            heading.appendChild(cursor);

            let tokenIdx = 0;
            let currentHTML = '';
            let openTagsStack = [];

            function typeNext() {
                if (tokenIdx >= fullTokens.length) {
                    heading.innerHTML = originalHTML;
                    const finalCursor = document.createElement('span');
                    finalCursor.className = 'typing-cursor done';
                    heading.appendChild(finalCursor);
                    setTimeout(() => {
                        heading.style.minHeight = '';
                    }, 1200);
                    return;
                }

                const token = fullTokens[tokenIdx];
                tokenIdx++;

                if (token.type === 'tag-open') {
                    currentHTML += token.value;
                    const tagMatch = token.value.match(/<([a-z0-9]+)/i);
                    if (tagMatch) openTagsStack.push(tagMatch[1]);
                    typeNext();
                } else if (token.type === 'tag-close') {
                    currentHTML += token.value;
                    openTagsStack.pop();
                    typeNext();
                } else if (token.type === 'char') {
                    currentHTML += token.value;

                    let closingSnippet = '';
                    for (let i = openTagsStack.length - 1; i >= 0; i--) {
                        closingSnippet += `</${openTagsStack[i]}>`;
                    }

                    heading.innerHTML = currentHTML + closingSnippet;
                    heading.appendChild(cursor);

                    const delay = Math.floor(Math.random() * 18) + 16;
                    setTimeout(typeNext, delay);
                }
            }

            typeNext();
        }

        function scheduleTypewriter(heading) {
            if (!window.splashDismissed && heading.closest('#hero')) {
                document.addEventListener('splashDismissed', () => {
                    setTimeout(() => animateTypewriter(heading), 300);
                }, { once: true });
            } else {
                animateTypewriter(heading);
            }
        }

        const typewriterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scheduleTypewriter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -20px 0px'
        });

        typewriterHeadings.forEach(heading => {
            typewriterObserver.observe(heading);
        });
    }

    function initSmoothScrollNavigation() {
        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (!targetId || targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();

                    const navbar = document.querySelector('.navbar');
                    const navHeight = navbar ? navbar.offsetHeight : 80;

                    if (targetId === '#contact') {

                        const contactGrid = document.querySelector('.contact-grid') || targetElement;
                        const targetY = contactGrid.getBoundingClientRect().top + window.pageYOffset - navHeight - 30;

                        window.scrollTo({
                            top: Math.max(0, targetY),
                            behavior: 'smooth'
                        });

                        setTimeout(() => {
                            const grid = document.querySelector('.contact-grid');
                            if (grid) {
                                grid.classList.add('highlight-pulse');
                                setTimeout(() => grid.classList.remove('highlight-pulse'), 1400);
                            }
                        }, 400);
                    } else {
                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                        window.scrollTo({
                            top: Math.max(0, targetPosition),
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    initSmoothScrollNavigation();
    initSkillsFluidCanvas();
    if (typeof initAboutSectionUI === 'function') initAboutSectionUI();
    if (typeof initContactCanvas === 'function') initContactCanvas();
    if (typeof initContactCards3D === 'function') initContactCards3D();
    if (typeof initKineticSignature === 'function') initKineticSignature();
    initScrollTypewriterAndReveals();

});

