# Canva API Text Editor

A simple and user-friendly web application for adding text to images. The application allows you to add text to images and freely position text boxes using drag and drop functionality.

## Features

- 🖼️ Image upload
- ✏️ Text addition to images
- 🎨 Text customization:
  - Font selection
  - Font size adjustment
  - Color selection
- 📱 Mobile-friendly interface
- 🖱️ Drag and drop functionality for text boxes (works with both mouse and touch screens)
- 💾 Save modified image in PNG format

## Usage Instructions

1. Open the application in a browser
2. Upload an image using the "Choose Image" button
3. Add text:
   - Type your text in the text field
   - Select font, size, and color
   - Choose text position (top, center, or bottom)
   - Click "Add Text" button
4. Edit text:
   - Move text boxes by dragging
   - Change styles by selecting a text box and using the editing tools
   - Delete text box by clicking its X button
5. Save the final image using the "Download Image" button

## Technical Details

- Built with pure JavaScript
- Responsive user interface
- Utilizes Canvas API for image processing
- Touch screen support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/[username]/canva_api.git
```

2. Open the project directory:
```bash
cd canva_api
```

3. Open `canva.html` in your browser or start a local server using Python:
```bash
python -m http.server
```

## License

MIT License 