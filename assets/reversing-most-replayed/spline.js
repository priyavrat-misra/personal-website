(function () {
    const intensityData = [0.5279266562267951, 0.12480357722391544, 0.0, 0.026860087867167863, 0.02093585840785508, 0.07226272586274855, 0.04300692905583681, 0.060931159115314666, 0.0766022194404571, 0.09533412165015988, 0.10005036885395328, 0.1244830890736497, 0.1306733417026353, 0.14898677881351266, 0.15401166090733256, 0.1765162007810248, 0.18904599710150277, 0.2165362582978448, 0.2411788862526638, 0.2563927708316172, 0.2714743190114441, 0.28734058302736165, 0.31838112072725605, 0.35631935563876843, 0.4065510718723185, 0.45425309231304073, 0.5130269580648157, 0.6310929321109772, 0.673111989452699, 0.6610459706942394, 0.6401047108007057, 0.5941065590090554, 0.5514129161225795, 0.5179744188639085, 0.5146366007970492, 0.5279260560617198, 0.5537925706465563, 0.56710513226663, 0.6283048652531878, 0.6201156127993005, 0.5691351906341839, 0.5449407359494229, 0.5326001416689661, 0.5216348256587975, 0.5322490450998547, 0.5177853668651563, 0.5186520052340396, 0.5143716279162583, 0.5142227869775582, 0.5031536424093447, 0.49735544761586675, 0.4851786984009952, 0.4820914492531171, 0.47682710129421096, 0.4760549889247037, 0.47592295260811485, 0.4771610931586733, 0.47838753049026134, 0.48015771738016544, 0.483628171928689, 0.48753254582672967, 0.49134899554122363, 0.498566580738032, 0.5059903226382416, 0.5173880575852389, 0.5259515129636406, 0.5370941777535911, 0.5427597360654048, 0.5585314740819463, 0.5669661940516739, 0.576686467612917, 0.5752268661495344, 0.5715187462311508, 0.5755551564457804, 0.9184945819347612, 0.5872760802858826, 0.5863029126161151, 0.584826806613159, 0.5813572523122484, 0.5865882911094696, 0.5910676231497474, 0.5942920100173553, 0.600944239713133, 0.6103296211623007, 0.620023487460226, 0.6231227399096121, 0.6265172735760971, 0.6271660520226088, 0.6339608209237951, 1.0, 0.9952214856696334, 0.6297503628372983, 0.6146493092925209, 0.6030382156612176, 0.5869615937863709, 0.5717062978172146, 0.5543432221032395, 0.5589017759334705, 0.5913743075032788, 0.641098284083037];

    const GRAPH_Y = 10;
    const GRAPH_HEIGHT = 80;

    // Theme color logic reused from seek-visualization.js
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

    // Wait for the DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {

        function setupCanvas(id) {
            const canvas = document.getElementById(id);
            return { canvas, ctx: canvas.getContext('2d') };
        }

        const maCanvas = setupCanvas('canvasMovingAvg');
        const csCanvas = setupCanvas('canvasCardinal');

        function movingAverage(data, windowSize) {
            const smoothed = [];
            for (let i = 0; i < data.length; i++) {
                const start = Math.max(0, i - Math.floor(windowSize / 2));
                const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
                const window = data.slice(start, end);
                smoothed.push(window.reduce((a, b) => a + b, 0) / window.length);
            }
            return smoothed;
        }

        function drawMovingAvg() {
            const slider = document.getElementById('windowSizeSlider');
            const checkbox = document.getElementById('showPointsMA');

            const windowSize = parseInt(slider.value);
            const showPoints = checkbox.checked;

            document.getElementById('windowSizeValue').textContent = windowSize;

            const smoothedData = movingAverage(intensityData, windowSize);
            const { canvas, ctx } = maCanvas;
            const colors = getThemeColors();

            // Adjust canvas width on draw in case of resize
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = 100 * dpr;
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, canvas.offsetWidth, 100);

            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 2;
            ctx.beginPath();

            const xStep = canvas.offsetWidth / (smoothedData.length - 1);

            smoothedData.forEach((val, i) => {
                const x = i * xStep;
                const y = (GRAPH_Y + GRAPH_HEIGHT) - (val * GRAPH_HEIGHT);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });

            ctx.stroke();

            // Draw points
            if (showPoints) {
                ctx.fillStyle = colors.fg;
                smoothedData.forEach((val, i) => {
                    const x = i * xStep;
                    const y = (GRAPH_Y + GRAPH_HEIGHT) - (val * GRAPH_HEIGHT);
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, 2 * Math.PI);
                    ctx.fill();
                });
            }
        }

        /**
         * Calculates a control point for a knot in the spline.
         */
        function getControlPoint(current, prev, next, invert = false, tension) {
            const p1 = prev || current;
            const p2 = next || current;

            const vectorX = p2.x - p1.x;
            const vectorY = p2.y - p1.y;
            const dir = invert ? -1 : 1;

            return {
                x: current.x + (vectorX * dir * tension),
                y: current.y + (vectorY * dir * tension)
            };
        }

        function drawCardinal() {
            const slider = document.getElementById('tensionSlider');
            const checkbox = document.getElementById('showPointsCardinal');

            const tension = parseFloat(slider.value);
            const showPoints = checkbox.checked;

            const valDisplay = document.getElementById('tensionValue');
            valDisplay.textContent = tension;

            const { canvas, ctx } = csCanvas;
            const colors = getThemeColors();

            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = 100 * dpr;
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, canvas.offsetWidth, 100);

            const xStep = canvas.offsetWidth / (intensityData.length - 1);
            const points = [];

            // Prepend dummy point for start fill
            points.push({
                x: -xStep,
                y: 100
            });

            for (let i = 0; i < intensityData.length; i++) {
                const centerX = i * xStep;

                const val = intensityData[i];
                const y = (GRAPH_Y + GRAPH_HEIGHT) - (val * GRAPH_HEIGHT);

                points.push({
                    x: centerX,
                    y: y
                });
            }

            // Append dummy point for end fill
            points.push({
                x: canvas.offsetWidth + xStep,
                y: 100
            });

            // Draw curve
            ctx.beginPath();
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 2;

            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i - 1]; // Prev
                const p1 = points[i];     // Current
                const p2 = points[i + 1]; // Next
                const p3 = points[i + 2]; // Next Next

                const cp1 = getControlPoint(p1, p0, p2, false, tension);
                const cp2 = getControlPoint(p2, p1, p3, true, tension);

                ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
            }

            ctx.stroke();

            if (showPoints) {
                ctx.fillStyle = colors.fg;

                points.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
                    ctx.fill();
                });
            }
        }

        drawMovingAvg();
        drawCardinal();

        document.getElementById('windowSizeSlider').addEventListener('input', drawMovingAvg);
        document.getElementById('showPointsMA').addEventListener('change', drawMovingAvg);
        document.getElementById('tensionSlider').addEventListener('input', drawCardinal);
        document.getElementById('showPointsCardinal').addEventListener('change', drawCardinal);

        // Resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                drawMovingAvg();
                drawCardinal();
            }, 250);
        });

        // Theme changes
        document.getElementById('dark').addEventListener('change', () => {
            setTimeout(() => {
                drawMovingAvg();
                drawCardinal();
            }, 50);
        });
    });
})();
