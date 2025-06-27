class PixelPlayground {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentColor = '#000000';
        this.currentSize = 5;
        this.currentMode = 'brush';
        this.lastX = 0;
        this.lastY = 0;

        this.setupCanvas();
        this.bindEvents();
        this.setupResponsive();
        window.addEventListener('resize', () => this.setupResponsive());
    }

    setupCanvas() {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'source-over';
    }

    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });

        // Color picker
        document.getElementById('colorPicker').addEventListener('change', (e) => {
            this.setColor(e.target.value);
        });

        // Preset colors
        document.querySelectorAll('.preset-color').forEach(color => {
            color.addEventListener('click', () => {
                document.querySelectorAll('.preset-color').forEach(c => c.classList.remove('active'));
                color.classList.add('active');
                this.setColor(color.dataset.color);
                document.getElementById('colorPicker').value = color.dataset.color;
            });
        });

        // Brush size
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.currentSize = e.target.value;
            document.getElementById('sizeDisplay').textContent = `${e.target.value}px`;
        });

        // Drawing modes
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentMode = btn.dataset.mode;
                this.updateDrawingMode();
            });
        });
    }

    setupResponsive() {
        const maxWidth = Math.min(800, window.innerWidth - 100);
        if (maxWidth < 800) {
            const scale = maxWidth / 800;
            this.canvas.width = maxWidth;
            this.canvas.height = 500 * scale;
        } else {
            this.canvas.width = 800;
            this.canvas.height = 500;
        }
        this.drawWelcomeText();
    }

    drawWelcomeText() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#e0e0e0';
        ctx.textAlign = 'center';
        ctx.fillText('🎨 Welcome to Pixel Playground!', this.canvas.width/2, this.canvas.height/2 - 20);
        ctx.font = '16px Arial';
        ctx.fillText('Start drawing to create your masterpiece', this.canvas.width/2, this.canvas.height/2 + 20);
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    draw(e) {
        if (!this.isDrawing) return;
        const pos = this.getMousePos(e);
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.strokeStyle = this.currentMode === 'eraser' ? '#FFFFFF' : this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.globalCompositeOperation = this.currentMode === 'eraser' ? 'destination-out' : 'source-over';
        this.ctx.stroke();
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    setColor(color) {
        this.currentColor = color;
        if (this.currentMode === 'brush') {
            this.updateDrawingMode();
        }
    }

    updateDrawingMode() {
        if (this.currentMode === 'eraser') {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }
}

function clearCanvas() {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    // Add a smooth clear animation
    let alpha = 1;
    const fadeOut = () => {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        alpha -= 0.1;
        if (alpha > 0) {
            requestAnimationFrame(fadeOut);
        } else {
            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    fadeOut();
}

function downloadCanvas() {
    const canvas = document.getElementById('drawingCanvas');
    const link = document.createElement('a');
    link.download = `pixel-playground-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Initialize the app
const app = new PixelPlayground();
