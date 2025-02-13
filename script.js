let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();

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
    ctx.drawImage(img, 0, 0);
};

function addText() {
    const text = document.getElementById("textInput").value;
    const font = document.getElementById("fontSelect").value;
    let fontSize = parseInt(document.getElementById("fontSize").value);
    const color = document.getElementById("colorPicker").value;
    const position = document.getElementById("positionSelect").value;

    if (!text) return;

    ctx.drawImage(img, 0, 0); // Piirretään kuva uudelleen
    ctx.fillStyle = color;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";

    let maxWidth = canvas.width * 0.8; // Teksti mahtuu 80% kuvan leveydestä
    let lines = getWrappedText(ctx, text, maxWidth, font, fontSize);

    let textHeight = lines.length * fontSize * 1.2; // Kokonaiskorkeus kaikille riveille
    let x = canvas.width / 2;
    let y;

    // Tekstin sijoitus kuvan eri kohtiin
    if (position === "top") {
        y = fontSize + 10;
    } else if (position === "center") {
        y = (canvas.height - textHeight) / 2 + fontSize;
    } else {
        y = canvas.height - textHeight;
    }

    // Piirretään jokainen rivi erikseen
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    lines.forEach((line, i) => {
        let lineY = y + i * fontSize * 1.2;
        ctx.font = `${fontSize}px ${font}`;
        ctx.strokeText(line, x, lineY);
        ctx.fillText(line, x, lineY);
    });
}

function getWrappedText(ctx, text, maxWidth, font, fontSize) {
    ctx.font = `${fontSize}px ${font}`;
    let words = text.split(" ");
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        let testLine = currentLine + " " + words[i];
        let testWidth = ctx.measureText(testLine).width;

        if (testWidth <= maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines;
}

function downloadImage() {
    const link = document.createElement("a");
    link.download = "muokattu-kuva.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
} 