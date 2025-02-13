let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let textBoxes = [];
let activeTextBox = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// Add listeners for controls
document.getElementById("fontSelect").addEventListener("change", updateActiveTextStyle);
document.getElementById("fontSize").addEventListener("input", updateActiveTextStyle);
document.getElementById("colorPicker").addEventListener("input", updateActiveTextStyle);

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

    // Update maximum sizes for existing text boxes
    textBoxes.forEach(updateTextBoxMaxSize);
};

function addTextBox() {
    const text = document.getElementById("textInput").value || "Double click to edit";
    const font = document.getElementById("fontSelect").value;
    const fontSize = document.getElementById("fontSize").value;
    const color = document.getElementById("colorPicker").value;
    const position = document.getElementById("positionSelect").value;

    const container = document.getElementById("canvas-container");
    const textBox = document.createElement("div");
    textBox.className = "text-box";
    textBox.contentEditable = true;
    textBox.style.font = `${fontSize}px ${font}`;
    textBox.style.color = color;
    textBox.innerHTML = text;

    // Add delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "×";
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteTextBox(textBox);
    };
    textBox.appendChild(deleteBtn);

    // Set text box position
    let y;
    if (position === "top") {
        y = 10;
    } else if (position === "center") {
        y = canvas.height / 2 - 20;
    } else {
        y = canvas.height - 60;
    }

    textBox.style.left = (canvas.width / 2 - 50) + "px";
    textBox.style.top = y + "px";

    // Update text box maximum size
    updateTextBoxMaxSize(textBox);

    // Add event listeners
    textBox.addEventListener("mousedown", startDragging);
    textBox.addEventListener("touchstart", startDragging);
    textBox.addEventListener("click", selectTextBox);
    textBox.addEventListener("dblclick", activateTextBox);
    textBox.addEventListener("blur", deactivateTextBox);
    textBox.addEventListener("input", handleTextInput);
    textBox.addEventListener("resize", handleResize);

    container.appendChild(textBox);
    textBoxes.push(textBox);

    // Set new text box as active
    selectTextBox({ target: textBox });
}

function handleTextInput(e) {
    const textBox = e.target;
    adjustTextBoxSize(textBox);
}

function handleResize(e) {
    const textBox = e.target;
    const rect = textBox.getBoundingClientRect();
    const containerRect = canvas.getBoundingClientRect();

    // Ensure box stays within image boundaries
    const maxWidth = canvas.width - parseInt(textBox.style.left);
    const maxHeight = canvas.height - parseInt(textBox.style.top);

    textBox.style.width = Math.min(rect.width, maxWidth) + "px";
    textBox.style.height = Math.min(rect.height, maxHeight) + "px";
}

function adjustTextBoxSize(textBox) {
    // Adjust box size according to text
    const text = textBox.innerText;
    const style = window.getComputedStyle(textBox);
    const fontSize = parseInt(style.fontSize);
    const maxWidth = Math.min(500, canvas.width * 0.8);

    // Set minimum width and height
    textBox.style.width = "auto";
    textBox.style.height = "auto";

    // Limit size within canvas
    const rect = textBox.getBoundingClientRect();
    if (rect.width > maxWidth) {
        textBox.style.width = maxWidth + "px";
    }

    // Ensure box stays within image boundaries
    const left = parseInt(textBox.style.left);
    const top = parseInt(textBox.style.top);
    if (left + rect.width > canvas.width) {
        textBox.style.left = (canvas.width - rect.width) + "px";
    }
    if (top + rect.height > canvas.height) {
        textBox.style.top = (canvas.height - rect.height) + "px";
    }
}

function updateTextBoxMaxSize(textBox) {
    // Update text box maximum sizes according to canvas size
    textBox.style.maxWidth = Math.min(500, canvas.width * 0.8) + "px";
    textBox.style.maxHeight = Math.min(200, canvas.height * 0.6) + "px";
}

function startDragging(e) {
    // Check if we're not editing text
    if (document.activeElement === e.target) {
        return;
    }

    const textBox = e.target.closest(".text-box");
    if (textBox) {
        e.preventDefault(); // Prevent text selection during drag
        isDragging = true;
        activeTextBox = textBox;

        // Handle both mouse and touch events
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        const rect = activeTextBox.getBoundingClientRect();
        dragOffset.x = clientX - rect.left;
        dragOffset.y = clientY - rect.top;
        activeTextBox.style.cursor = "grabbing";
    }
}

// Update mousemove handler to support touch
document.addEventListener("mousemove", handleDrag);
document.addEventListener("touchmove", handleDrag);

function handleDrag(e) {
    if (isDragging && activeTextBox) {
        e.preventDefault(); // Prevent text selection and page scroll
        const container = document.getElementById("canvas-container");
        const containerRect = container.getBoundingClientRect();

        // Handle both mouse and touch events
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        let newX = clientX - containerRect.left - dragOffset.x;
        let newY = clientY - containerRect.top - dragOffset.y;

        // Restrict box movement within canvas area
        newX = Math.max(0, Math.min(newX, canvas.width - activeTextBox.offsetWidth));
        newY = Math.max(0, Math.min(newY, canvas.height - activeTextBox.offsetHeight));

        activeTextBox.style.left = newX + "px";
        activeTextBox.style.top = newY + "px";
    }
}

// Update mouseup handler to support touch
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

function endDrag() {
    if (isDragging && activeTextBox) {
        activeTextBox.style.cursor = "move";
        isDragging = false;
    }
}

function selectTextBox(e) {
    // Remove active class from all text boxes
    textBoxes.forEach(box => box.classList.remove("active"));

    // Set new active text box
    const textBox = e.target.closest(".text-box");
    if (textBox) {
        activeTextBox = textBox;
        textBox.classList.add("active");
        document.getElementById("deleteButton").disabled = false;

        // Update controls to match active text box styles
        updateControlsFromTextBox(textBox);
    }
}

function deleteActiveTextBox() {
    if (activeTextBox) {
        deleteTextBox(activeTextBox);
    }
}

function deleteTextBox(textBox) {
    const container = document.getElementById("canvas-container");
    container.removeChild(textBox);
    textBoxes = textBoxes.filter(box => box !== textBox);
    if (activeTextBox === textBox) {
        activeTextBox = null;
        document.getElementById("deleteButton").disabled = true;
    }
}

function updateControlsFromTextBox(textBox) {
    const style = window.getComputedStyle(textBox);
    const font = style.font;

    // Update font size
    const fontSize = parseInt(style.fontSize);
    document.getElementById("fontSize").value = fontSize;

    // Update font
    const fontFamily = style.fontFamily.replace(/["']/g, "");
    document.getElementById("fontSelect").value = fontFamily;

    // Update color
    document.getElementById("colorPicker").value = rgbToHex(style.color);
}

function rgbToHex(rgb) {
    // Convert rgb(r, g, b) format to hex
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues) return "#ffffff";

    const r = parseInt(rgbValues[0]);
    const g = parseInt(rgbValues[1]);
    const b = parseInt(rgbValues[2]);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function updateActiveTextStyle() {
    if (!activeTextBox) return;

    const font = document.getElementById("fontSelect").value;
    const fontSize = document.getElementById("fontSize").value;
    const color = document.getElementById("colorPicker").value;

    activeTextBox.style.font = `${fontSize}px ${font}`;
    activeTextBox.style.color = color;
}

function activateTextBox(e) {
    const textBox = e.target;
    textBox.focus();
}

function deactivateTextBox(e) {
    // Don't remove active class here as we want to maintain selection
}

function redrawCanvas() {
    ctx.drawImage(img, 0, 0);
}

function downloadImage() {
    // Create temporary canvas for text rendering
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    // Draw original image
    tempCtx.drawImage(img, 0, 0);

    // Draw texts
    textBoxes.forEach(textBox => {
        const style = window.getComputedStyle(textBox);
        tempCtx.font = style.font;
        tempCtx.fillStyle = style.color;
        tempCtx.textBaseline = "top";

        // Add shadow
        tempCtx.shadowColor = "rgba(0, 0, 0, 0.5)";
        tempCtx.shadowBlur = 5;
        tempCtx.shadowOffsetX = 2;
        tempCtx.shadowOffsetY = 2;

        const rect = textBox.getBoundingClientRect();
        const containerRect = canvas.getBoundingClientRect();
        const x = parseInt(textBox.style.left);
        const y = parseInt(textBox.style.top);

        tempCtx.fillText(textBox.innerText, x, y);
    });

    // Download image
    const link = document.createElement("a");
    link.download = "modified-image.png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
} 