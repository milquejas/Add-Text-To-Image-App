let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let textBoxes = [];
let activeTextBox = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// Lisää kuuntelijat kontrolleille
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

    // Päivitä olemassa olevien tekstilaatikoiden maksimikoot
    textBoxes.forEach(updateTextBoxMaxSize);
};

function addTextBox() {
    const text = document.getElementById("textInput").value || "Kaksoisklikkaa muokataksesi";
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

    // Lisää poistopainike
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "×";
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteTextBox(textBox);
    };
    textBox.appendChild(deleteBtn);

    // Aseta tekstilaatikon sijainti
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

    // Päivitä tekstilaatikon maksimikoko
    updateTextBoxMaxSize(textBox);

    // Lisää tapahtumankäsittelijät
    textBox.addEventListener("mousedown", startDragging);
    textBox.addEventListener("click", selectTextBox);
    textBox.addEventListener("dblclick", activateTextBox);
    textBox.addEventListener("blur", deactivateTextBox);
    textBox.addEventListener("input", handleTextInput);
    textBox.addEventListener("resize", handleResize);

    container.appendChild(textBox);
    textBoxes.push(textBox);

    // Aseta uusi tekstilaatikko aktiiviseksi
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

    // Varmista, että laatikko pysyy kuvan rajojen sisällä
    const maxWidth = canvas.width - parseInt(textBox.style.left);
    const maxHeight = canvas.height - parseInt(textBox.style.top);

    textBox.style.width = Math.min(rect.width, maxWidth) + "px";
    textBox.style.height = Math.min(rect.height, maxHeight) + "px";
}

function adjustTextBoxSize(textBox) {
    // Säädä laatikon kokoa tekstin mukaan
    const text = textBox.innerText;
    const style = window.getComputedStyle(textBox);
    const fontSize = parseInt(style.fontSize);
    const maxWidth = Math.min(500, canvas.width * 0.8);

    // Aseta minimi leveys ja korkeus
    textBox.style.width = "auto";
    textBox.style.height = "auto";

    // Rajoita koko canvasin sisälle
    const rect = textBox.getBoundingClientRect();
    if (rect.width > maxWidth) {
        textBox.style.width = maxWidth + "px";
    }

    // Varmista, että laatikko pysyy kuvan rajojen sisällä
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
    // Päivitä tekstilaatikon maksimikoot canvasin koon mukaan
    textBox.style.maxWidth = Math.min(500, canvas.width * 0.8) + "px";
    textBox.style.maxHeight = Math.min(200, canvas.height * 0.6) + "px";
}

function startDragging(e) {
    // Tarkista, ettei olla muokkaamassa tekstiä
    if (document.activeElement === e.target) {
        return;
    }

    const textBox = e.target.closest(".text-box");
    if (textBox) {
        e.preventDefault(); // Estä tekstin valinta raahauksen aikana
        isDragging = true;
        activeTextBox = textBox;
        const rect = activeTextBox.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        activeTextBox.style.cursor = "grabbing";
    }
}

document.addEventListener("mousemove", (e) => {
    if (isDragging && activeTextBox) {
        e.preventDefault(); // Estä tekstin valinta raahauksen aikana
        const container = document.getElementById("canvas-container");
        const containerRect = container.getBoundingClientRect();

        let newX = e.clientX - containerRect.left - dragOffset.x;
        let newY = e.clientY - containerRect.top - dragOffset.y;

        // Rajoita laatikon liikkuminen canvas-alueen sisälle
        newX = Math.max(0, Math.min(newX, canvas.width - activeTextBox.offsetWidth));
        newY = Math.max(0, Math.min(newY, canvas.height - activeTextBox.offsetHeight));

        activeTextBox.style.left = newX + "px";
        activeTextBox.style.top = newY + "px";
    }
});

document.addEventListener("mouseup", () => {
    if (isDragging && activeTextBox) {
        activeTextBox.style.cursor = "move";
        isDragging = false;
    }
});

function selectTextBox(e) {
    // Poista aktiivinen luokka kaikista tekstilaatikoista
    textBoxes.forEach(box => box.classList.remove("active"));

    // Aseta uusi aktiivinen tekstilaatikko
    const textBox = e.target.closest(".text-box");
    if (textBox) {
        activeTextBox = textBox;
        textBox.classList.add("active");
        document.getElementById("deleteButton").disabled = false;

        // Päivitä kontrollit vastaamaan aktiivisen tekstilaatikon tyylejä
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

    // Päivitä fonttikoko
    const fontSize = parseInt(style.fontSize);
    document.getElementById("fontSize").value = fontSize;

    // Päivitä fontti
    const fontFamily = style.fontFamily.replace(/["']/g, "");
    document.getElementById("fontSelect").value = fontFamily;

    // Päivitä väri
    document.getElementById("colorPicker").value = rgbToHex(style.color);
}

function rgbToHex(rgb) {
    // Muunna rgb(r, g, b) muoto hex-muotoon
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
    // Älä poista active-luokkaa täällä, koska haluamme säilyttää valinnan
}

function redrawCanvas() {
    ctx.drawImage(img, 0, 0);
}

function downloadImage() {
    // Luo väliaikainen canvas tekstien renderöintiä varten
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    // Piirrä alkuperäinen kuva
    tempCtx.drawImage(img, 0, 0);

    // Piirrä tekstit
    textBoxes.forEach(textBox => {
        const style = window.getComputedStyle(textBox);
        tempCtx.font = style.font;
        tempCtx.fillStyle = style.color;
        tempCtx.textBaseline = "top";

        // Lisää varjostus
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

    // Lataa kuva
    const link = document.createElement("a");
    link.download = "muokattu-kuva.png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
} 