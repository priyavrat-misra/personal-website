(function () {
    'use strict';

    // Wait for the DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
        // Layout constants
        const seekHeight = 30, seekY = 20, animSpeed = 0.5;
        const gridY = 60;
        const buttonSize = 24, buttonGap = 5, buttonOffset = 3, handleSize = 6;

        // State shared across canvases
        let canvasWidth, seekWidth, segmentWidth, seekX, playButtonX, resetButtonX;
        // Text vertical offset
        const buttonY = seekY + buttonOffset;

        // Canvas configurations
        const canvasConfigs = [
            { id: 'canvasBool', name: 'Bool' },
            { id: 'canvasAccumulate', name: 'Accumulate' },
            { id: 'canvasRaw', name: 'Raw' },
            { id: 'canvasHisto', name: 'Histo' },
            { id: 'canvasPrefix', name: 'Prefix' }
        ];

        // Initialize objects
        const canvases = [];

        canvasConfigs.forEach(config => {
            const canvasEl = document.getElementById(config.id);
            canvases.push({
                name: config.name,
                canvas: canvasEl,
                ctx: canvasEl.getContext('2d'),
                position: 0,
                segments: config.name === 'Prefix' ? new Array(11).fill(0) : new Array(10).fill(0),
                lastPos: 0,
                isAnimating: false
            });
        });

        // Calculate responsive dimensions
        function updateDimensions() {
            canvasWidth = canvases[0].canvas.offsetWidth;
            seekWidth = canvasWidth * 0.8;
            segmentWidth = seekWidth / 10;

            const totalControlWidth = buttonSize + buttonGap + seekWidth + buttonGap + buttonSize;
            seekX = (canvasWidth - totalControlWidth) / 2 + buttonSize + buttonGap;
            playButtonX = seekX - buttonSize - buttonGap;
            resetButtonX = seekX + seekWidth + buttonGap;

            canvases.forEach(c => {
                const dpr = window.devicePixelRatio || 1;
                c.canvas.width = canvasWidth * dpr;
                c.canvas.height = 100 * dpr;
                c.ctx.scale(dpr, dpr);
            });
        }

        // Update logic
        const updateFns = {
            Bool: (c) => {
                for (let i = 0; i < 10; i++) {
                    c.segments[i] = c.position >= (i + 1) * segmentWidth ? 1 : 0;
                }
            },
            Accumulate: (c) => {
                for (let i = 0; i < 10; i++) {
                    const currPos = (i + 1) * segmentWidth;
                    if (c.position >= currPos && c.lastPos < currPos) {
                        c.segments[i]++;
                    }
                }
            },
            Raw: (c) => updateFns.Accumulate(c),
            Histo: (c) => updateFns.Accumulate(c),
            Prefix: (c) => {
                if (c.position >= segmentWidth && c.lastPos < segmentWidth && !c.segments[0]) {
                    c.segments[0]++;
                }
                if (c.position >= seekWidth) {
                    c.segments[10]--;
                }
            }
        };

        function getThemeColors() {
            const computed = getComputedStyle(document.body);
            return {
                bg: computed.getPropertyValue('--color-canvas-default'),
                fg: computed.getPropertyValue('--color-fg-default'),
                muted: computed.getPropertyValue('--color-fg-muted'),
                accent: computed.getPropertyValue('--color-accent-fg'),
                border: computed.getPropertyValue('--color-border-default'),
                canvasSubtle: computed.getPropertyValue('--color-canvas-subtle')
            };
        }

        function drawChart(ctx, segments, isHisto, colors) {
            const maxVal = Math.max(...segments, 1);
            const minVal = Math.min(...segments);
            const range = maxVal - minVal || 1;

            ctx.strokeStyle = colors.border;
            ctx.fillStyle = colors.border;
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let i = 0; i < 10; i++) {
                const x = seekX + i * segmentWidth + segmentWidth / 2;
                const y = isHisto ? 15 - ((segments[i] - minVal) / range) * 10 : 15 - segments[i] * 2;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.fillStyle = colors.fg;
            for (let i = 0; i < 10; i++) {
                const x = seekX + i * segmentWidth + segmentWidth / 2;
                const y = isHisto ? 15 - ((segments[i] - minVal) / range) * 10 : 15 - segments[i] * 2;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fill();
            }

            ctx.lineWidth = 1;
        }

        function draw(c) {
            const colors = getThemeColors();
            c.ctx.clearRect(0, 0, canvasWidth, 100);

            // Draw charts
            if (c.name === 'Raw') drawChart(c.ctx, c.segments, false, colors);
            if (c.name === 'Histo') drawChart(c.ctx, c.segments, true, colors);

            // Draw control buttons
            // Play Button
            c.ctx.fillStyle = colors.canvasSubtle;
            c.ctx.fillRect(playButtonX, buttonY, buttonSize, buttonSize);
            c.ctx.strokeStyle = colors.fg;
            c.ctx.lineWidth = 1;
            c.ctx.strokeRect(playButtonX, buttonY, buttonSize, buttonSize);

            // Reset Button
            c.ctx.fillStyle = colors.canvasSubtle;
            c.ctx.fillRect(resetButtonX, buttonY, buttonSize, buttonSize);
            c.ctx.strokeRect(resetButtonX, buttonY, buttonSize, buttonSize);

            // Icons
            c.ctx.fillStyle = colors.fg;
            c.ctx.font = '16px Arial';
            c.ctx.textAlign = 'center';
            c.ctx.textBaseline = 'middle';
            const textY = buttonY + buttonSize / 2 + 1;

            c.ctx.fillText(c.isAnimating ? '⏸' : '▶', playButtonX + buttonSize / 2, textY);
            c.ctx.fillText('↻', resetButtonX + buttonSize / 2, textY);

            // Draw seek bar background
            c.ctx.fillStyle = colors.border;
            c.ctx.fillRect(seekX, seekY, seekWidth, seekHeight);

            // Draw seek bar progress
            c.ctx.fillStyle = colors.accent;
            c.ctx.fillRect(seekX, seekY, c.position, seekHeight);

            // Draw handle
            c.ctx.fillStyle = colors.fg;
            c.ctx.fillRect(seekX + c.position - handleSize / 2, seekY - buttonOffset, handleSize, seekHeight + handleSize);

            // Draw segment grid
            c.ctx.textBaseline = 'alphabetic';

            for (let i = 0; i < 10; i++) {
                const x = seekX + i * segmentWidth;
                c.ctx.strokeStyle = colors.fg;
                c.ctx.strokeRect(x, gridY, segmentWidth, 30);
                c.ctx.fillStyle = colors.fg;
                c.ctx.textAlign = 'center';
                c.ctx.fillText(c.segments[i], x + segmentWidth / 2, gridY + 20);
            }

            if (c.name === 'Prefix') {
                const extraX = seekX + 10 * segmentWidth;
                c.ctx.strokeRect(extraX, gridY, segmentWidth, 30);
                c.ctx.fillText(c.segments[10], extraX + segmentWidth / 2, gridY + 20);
            }
        }

        function animate() {
            let needsAnimation = false;
            canvases.forEach(c => {
                if (c.isAnimating && c.position < seekWidth) {
                    needsAnimation = true;
                    c.lastPos = c.position;
                    c.position += animSpeed;

                    // Boundary check
                    if (c.position > seekWidth) c.position = seekWidth;

                    updateFns[c.name](c);

                    if (c.position >= seekWidth) {
                        c.isAnimating = false;
                    }
                }
                draw(c);
                if (c.isAnimating) needsAnimation = true;
            });

            if (needsAnimation) {
                requestAnimationFrame(animate);
            }
        }

        // Event Handling
        function setupEventListeners() {
            canvases.forEach(c => {
                // Add keyboard accessibility
                c.canvas.tabIndex = 0;
                c.canvas.setAttribute('role', 'application');
                c.canvas.setAttribute('aria-label', `Visualization for ${c.name} algorithm`);

                // Mouse interaction
                c.canvas.addEventListener('mousedown', (e) => {
                    handleInteraction(c, e.offsetX, e.offsetY);
                });

                // Keyboard interaction
                c.canvas.addEventListener('keydown', (e) => {
                    if (e.key === ' ') {
                        togglePlay(c);
                        e.preventDefault();
                    }
                });
            });
        }

        function togglePlay(c) {
            c.isAnimating = !c.isAnimating;
            if (c.isAnimating) animate();
        }

        function reset(c) {
            c.isAnimating = false;
            c.position = 0;
            c.segments.fill(0);
            c.lastPos = 0;
            draw(c);
        }

        function handleInteraction(c, x, y) {
            // Play/Pause
            if (x >= playButtonX && x <= playButtonX + buttonSize && y >= buttonY && y <= buttonY + buttonSize) {
                togglePlay(c);
                return;
            }

            // Reset
            if (x >= resetButtonX && x <= resetButtonX + buttonSize && y >= buttonY && y <= buttonY + buttonSize) {
                reset(c);
                return;
            }

            // Seek bar
            const seekBarX = x - seekX;
            if (seekBarX >= 0 && seekBarX <= seekWidth) {
                if (c.name === 'Prefix') {
                    // Logic from original script for Prefix seek behavior
                    const fromSegment = Math.floor(c.position / segmentWidth);
                    // Safe guard
                    if (fromSegment < 11) c.segments[fromSegment + 1]--;

                    c.position = Math.max(0, Math.min(seekWidth, seekBarX));

                    const toSegment = Math.floor(c.position / segmentWidth);
                    if (toSegment < 11) c.segments[toSegment]++;
                } else {
                    c.position = Math.max(0, Math.min(seekWidth, seekBarX));
                }
                draw(c);
            }
        }

        // Initialization
        updateDimensions();
        // Initial draw
        canvases.forEach(draw);
        setupEventListeners();

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateDimensions();
                canvases.forEach(draw);
            }, 250);
        });

        document.getElementById('dark').addEventListener('change', () => {
            setTimeout(() => canvases.forEach(draw), 50);
        });
    });
})();
