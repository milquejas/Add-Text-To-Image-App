let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let currentText = [];
let isDragging = false;
let draggedTextIndex = -1;
let dragStartX, dragStartY;

// Kuvan lataus
document.getElementById("imageUpload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    redrawCanvas();
};

// Canvas-tapahtumankäsittelijät
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentText.forEach((text, index) => {
        const textWidth = ctx.measureText(text.content).width;
        const textHeight = parseInt(text.fontSize);

        if (x >= text.x - textWidth / 2 && x <= text.x + textWidth / 2 &&
            y >= text.y - textHeight && y <= text.y + textHeight) {
            isDragging = true;
            draggedTextIndex = index;
            dragStartX = x - text.x;
            dragStartY = y - text.y;
        }
    });
}

function handleMouseMove(e) {
    if (isDragging && draggedTextIndex !== -1) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        currentText[draggedTextIndex].x = x - dragStartX;
        currentText[draggedTextIndex].y = y - dragStartY;

        redrawCanvas();
    }
}

function handleMouseUp() {
    isDragging = false;
    draggedTextIndex = -1;
}

function addText() {
    const text = document.getElementById("textInput").value;
    const font = document.getElementById("fontSelect").value;
    const fontSize = parseInt(document.getElementById("fontSize").value);
    const color = document.getElementById("colorPicker").value;
    const position = document.getElementById("positionSelect").value;

    if (!text) return;

    let x = canvas.width / 2;
    let y;

    switch (position) {
        case "top":
            y = fontSize + 10;
            break;
        case "center":
            y = canvas.height / 2;
            break;
        case "bottom":
            y = canvas.height - fontSize - 10;
            break;
    }

    currentText.push({
        content: text,
        x: x,
        y: y,
        font: font,
        fontSize: fontSize,
        color: color
    });

    redrawCanvas();
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    currentText.forEach(text => {
        ctx.font = `${text.fontSize}px ${text.font}`;
        ctx.fillStyle = text.color;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";

        // Varjoefekti
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.strokeText(text.content, text.x, text.y);
        ctx.fillText(text.content, text.x, text.y);
    });
}

function downloadImage() {
    const link = document.createElement("a");
    link.download = "muokattu-kuva.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

function removeLastText() {
    if (currentText.length > 0) {
        currentText.pop();
        redrawCanvas();
    }
}

function clearAllText() {
    currentText = [];
    redrawCanvas();
} 