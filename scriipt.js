// Notification system
function showNotification(message, isSuccess = true) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    notificationMessage.textContent = message;
    notification.style.backgroundColor = isSuccess ? '#4CAF50' : '#FF5252';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Instructions modal
function showInstructions(tool) {
    const modal = document.getElementById('instructionsModal');
    const title = document.getElementById('instructionsTitle');
    const content = document.getElementById('instructionsContent');
    
    let instructions = '';
    
    switch(tool) {
        case 'code':
            title.innerHTML = '<i class="fas fa-code"></i> Code Converter Instructions';
            instructions = `
                <p><strong>How to use the Code Converter:</strong></p>
                <ol>
                    <li>Enter your code in the input field (either AOB or Byte format)</li>
                    <li>Click the appropriate conversion button</li>
                    <li>Copy the result using the copy button</li>
                </ol>
                <p><strong>Formats:</strong></p>
                <ul>
                    <li>AOB: <code>00 00 00 ?? ??</code></li>
                    <li>Byte: <code>0x00, 0x00, 0x00, '?'</code></li>
                </ul>
            `;
            break;
            
        case 'image':
            title.innerHTML = '<i class="fas fa-image"></i> Image Converter Instructions';
            instructions = `
                <p><strong>How to use the Image Converter:</strong></p>
                <ol>
                    <li>Drag & drop an image file or click to select one</li>
                    <li>The image will be previewed</li>
                    <li>Click "Convert to C++" to generate byte array</li>
                    <li>Copy or download the result</li>
                </ol>
                <p><strong>Supported formats:</strong> JPG, PNG, GIF, BMP</p>
            `;
            break;
            
        case 'font':
            title.innerHTML = '<i class="fas fa-font"></i> Font Converter Instructions';
            instructions = `
                <p><strong>How to use the Font Converter:</strong></p>
                <ol>
                    <li>Drag & drop a font file (TTF/OTF) or click to select one</li>
                    <li>The font info will be displayed</li>
                    <li>Click "Convert to C++" to generate byte array</li>
                    <li>Copy or download the result</li>
                </ol>
            `;
            break;
            
        case 'offset':
            title.innerHTML = '<i class="fas fa-cubes"></i> Offset Extractor Instructions';
            instructions = `
                <p><strong>How to use the Offset Extractor:</strong></p>
                <ol>
                    <li>Drag & drop a .cs file or click to select one</li>
                    <li>The file info will be displayed</li>
                    <li>Click "Extract Offsets" to process the file</li>
                    <li>Copy or download the result</li>
                </ol>
                <p><strong>Note:</strong> The file should contain offset comments in the format <code>// 0x12345678</code></p>
            `;
            break;
            
        case 'color':
            title.innerHTML = '<i class="fas fa-palette"></i> Color Picker Instructions';
            instructions = `
                <p><strong>How to use the Color Picker:</strong></p>
                <ol>
                    <li>Click the color picker to select a color</li>
                    <li>Different color formats will be displayed</li>
                    <li>Click "Show More" to see advanced color formats</li>
                    <li>Click any copy button to copy that format</li>
                </ol>
                <p><strong>Supported formats:</strong> HEX, RGBA, Float, CMYK, HSV, HSL</p>
            `;
            break;
            
        default:
            title.innerHTML = '<i class="fas fa-info-circle"></i> Instructions';
            instructions = '<p>No instructions available for this tool.</p>';
    }
    
    content.innerHTML = instructions;
    modal.style.display = 'block';
}

function closeInstructionsModal() {
    document.getElementById('instructionsModal').style.display = 'none';
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    const instructionsModal = document.getElementById('instructionsModal');
    if (event.target === instructionsModal) {
        instructionsModal.style.display = 'none';
    }
    
    const colorPickerModal = document.getElementById('colorPickerModal');
    if (event.target === colorPickerModal) {
        colorPickerModal.style.display = 'none';
    }
});

// Code Converter
document.getElementById('aobToByte').addEventListener('click', function() {
    const inputField = document.getElementById('inputField');
    const outputField = document.getElementById('outputField');

    if (inputField.value === "") {
        showNotification("No codes to convert", false);
        return;
    }

    let text = inputField.value.trim();
    let array = text.split(/\s+/).filter(Boolean);
    let list = [];
    let flag = false;

    array = array.map(item => item.toUpperCase());

    for (let item of array) {
        if (item.startsWith("0X") || item === "?" || item === "'?'") {
            flag = true;
            break;
        }
    }

    if (flag) {
        showNotification("This text is already in BYTE format.", false);
        return;
    }
    
    for (let item of array) {
        if (item === "??" || item === "?") {
            list.push("'?'");
        } else {
            list.push("0x" + item);
        }
    }

    let result = list.join(", ");
    outputField.value = result;
    showNotification("Text converted from AOB to BYTE successfully.");
});

document.getElementById('clearAll').addEventListener('click', function() {
    const inputField = document.getElementById('inputField');
    const outputField = document.getElementById('outputField');
    inputField.value = "";
    outputField.value = "";
    showNotification("Fields cleared.");
});

document.getElementById('byteToAob').addEventListener('click', function() {
    const inputField = document.getElementById('inputField');
    const outputField = document.getElementById('outputField');

    if (inputField.value === "") {
        showNotification("No codes to convert", false);
        return;
    }

    let text = inputField.value.trim();
    let array = text.split(/[,\s]+/).filter(Boolean);
    let result = "";

    for (let item of array) {
        if (item === "'?'") {
            result += "?? ";
        } else {
            let str = item.replace(/^0x/i, ""); 
            result += str + " ";
        }
    }

    let aobText = result.trim();

    if (aobText === text) {
        showNotification("This text is already in AOB format.", false);
        return;
    }
    
    outputField.value = aobText;
    showNotification("Text converted from BYTE to AOB successfully.");
});

document.getElementById('outputIconButton3').addEventListener('click', function() {
    const outputField = document.getElementById('outputField');

    if (outputField.value === "") {
        showNotification("Nothing to copy", false);
        return;
    }

    navigator.clipboard.writeText(outputField.value)
        .then(() => {
            showNotification("Text copied to clipboard");
        })
        .catch(() => {
            showNotification("Failed to copy", false);
        });
});

document.getElementById('outputIconButton4').addEventListener('click', function() {
    const outputField = document.getElementById('outputField');
    outputField.value = "";
    showNotification("Output cleared.");
});

document.getElementById('inputIconButton2').addEventListener('click', function() {
    const inputField = document.getElementById('inputField');
    inputField.value = "";
    showNotification("Input cleared.");
});

document.getElementById("inputIconButton1").addEventListener("click", function() {
    navigator.clipboard.readText().then(text => {
        if (text) {
            document.getElementById("inputField").value = text;
            showNotification("Text pasted successfully");
        } else {
            showNotification("Clipboard is empty", false);
        }
    }).catch(() => {
        showNotification("Failed to read clipboard", false);
    });
});

// Image Converter
const dropArea = document.getElementById('dropArea');
const imageInput = document.getElementById('imageInput');
const addImageButton = document.getElementById('addImageButton');
const clearImageButton = document.getElementById('clearImageButton');
const convertImageButton = document.getElementById('convertImageButton');
const imagePreview = document.getElementById('imagePreview');
const imageInfo = document.getElementById('imageInfo');
const imageResult = document.getElementById('imageResult');
const imageActions = document.getElementById('imageActions');
const copyImageButton = document.getElementById('copyImageButton');
const downloadImageButton = document.getElementById('downloadImageButton');

let selectedImage = null;
let imageByteArray = null;

addImageButton.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handleImage(file);
});

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    handleImage(file);
});

function handleImage(file) {
    if (file && file.type.startsWith('image/')) {
        selectedImage = file;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
        
        imageInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        imageInfo.style.display = 'block';
        
        imageResult.style.display = 'none';
        imageActions.style.display = 'none';
        showNotification("Image loaded successfully.");
    } else {
        showNotification("Please select a valid image file.", false);
    }
}

clearImageButton.addEventListener('click', () => {
    selectedImage = null;
    imageInput.value = "";
    imagePreview.style.display = 'none';
    imageInfo.style.display = 'none';
    imageResult.style.display = 'none';
    imageActions.style.display = 'none';
    showNotification("Image cleared.");
});

convertImageButton.addEventListener('click', () => {
    if (!selectedImage) {
        showNotification("Please upload an image first.", false);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const array = new Uint8Array(e.target.result);
        imageByteArray = array;
        
        let byteText = "";
        for (let i = 0; i < array.length; i++) {
            byteText += `0x${array[i].toString(16).padStart(2, '0')}`;
            if (i < array.length - 1) {
                byteText += `, `;
                if ((i + 1) % 16 === 0) byteText += `\n`;
            }
        }
        
        let fullContent = `byte[] imageBytes = {\n${byteText}\n};`;
        
        imageResult.textContent = fullContent;
        imageResult.style.display = 'block';
        imageActions.style.display = 'flex';
        showNotification("Image converted to C++ byte array.");
    };

    reader.onerror = function() {
        showNotification("Error reading the image.", false);
    };

    reader.readAsArrayBuffer(selectedImage);
});

copyImageButton.addEventListener('click', () => {
    if (!imageByteArray) return;
    
    let byteText = "";
    for (let i = 0; i < imageByteArray.length; i++) {
        byteText += `0x${imageByteArray[i].toString(16).padStart(2, '0')}`;
        if (i < imageByteArray.length - 1) {
            byteText += `, `;
        }
    }
    
    navigator.clipboard.writeText(byteText)
        .then(() => {
            showNotification("Byte array copied to clipboard");
        })
        .catch(() => {
            showNotification("Failed to copy to clipboard", false);
        });
});

downloadImageButton.addEventListener('click', () => {
    if (!imageResult.textContent) return;
    
    const blob = new Blob([imageResult.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ImageConvertedByRataLife.txt';
    a.click();
    URL.revokeObjectURL(url);
    showNotification("File downloaded successfully.");
});

// Font Converter
const fontDropArea = document.getElementById('fontDropArea');
const fontInput = document.getElementById('fontInput');
const addFontButton = document.getElementById('addFontButton');
const clearFontButton = document.getElementById('clearFontButton');
const convertFontButton = document.getElementById('convertFontButton');
const fontInfo = document.getElementById('fontInfo');
const fontResult = document.getElementById('fontResult');
const fontActions = document.getElementById('fontActions');
const copyFontButton = document.getElementById('copyFontButton');
const downloadFontButton = document.getElementById('downloadFontButton');

let selectedFont = null;
let fontByteArray = null;

addFontButton.addEventListener('click', () => {
    fontInput.click();
});

fontInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handleFont(file);
});

fontDropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    fontDropArea.classList.add('dragover');
});

fontDropArea.addEventListener('dragleave', () => {
    fontDropArea.classList.remove('dragover');
});

fontDropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    fontDropArea.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    handleFont(file);
});

function handleFont(file) {
    if (file && (file.type === "font/ttf" || file.type === "font/otf" || file.name.endsWith('.ttf') || file.name.endsWith('.otf'))) {
        selectedFont = file;
        
        fontInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        fontInfo.style.display = 'block';
        
        fontResult.style.display = 'none';
        fontActions.style.display = 'none';
        showNotification("Font file loaded successfully.");
    } else {
        showNotification("Please select a valid font file (TTF/OTF).", false);
    }
}

clearFontButton.addEventListener('click', () => {
    selectedFont = null;
    fontInput.value = "";
    fontInfo.style.display = 'none';
    fontResult.style.display = 'none';
    fontActions.style.display = 'none';
    showNotification("Font cleared.");
});

convertFontButton.addEventListener('click', () => {
    if (!selectedFont) {
        showNotification("Please upload a font first.", false);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const array = new Uint8Array(e.target.result);
        fontByteArray = array;
        
        let byteText = "";
        for (let i = 0; i < array.length; i++) {
            byteText += `0x${array[i].toString(16).padStart(2, '0')}`;
            if (i < array.length - 1) {
                byteText += `, `;
                if ((i + 1) % 16 === 0) byteText += `\n`;
            }
        }
        
        let fullContent = `byte[] fontBytes = {\n${byteText}\n};`;
        
        fontResult.textContent = fullContent;
        fontResult.style.display = 'block';
        fontActions.style.display = 'flex';
        showNotification("Font converted to C++ byte array.");
    };

    reader.onerror = function() {
        showNotification("Error reading the font.", false);
    };

    reader.readAsArrayBuffer(selectedFont);
});

copyFontButton.addEventListener('click', () => {
    if (!fontByteArray) return;
    
    let byteText = "";
    for (let i = 0; i < fontByteArray.length; i++) {
        byteText += `0x${fontByteArray[i].toString(16).padStart(2, '0')}`;
        if (i < fontByteArray.length - 1) {
            byteText += `, `;
        }
    }
    
    navigator.clipboard.writeText(byteText)
        .then(() => {
            showNotification("Byte array copied to clipboard");
        })
        .catch(() => {
            showNotification("Failed to copy to clipboard", false);
        });
});

downloadFontButton.addEventListener('click', () => {
    if (!fontResult.textContent) return;
    
    const blob = new Blob([fontResult.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FontConvertedByRataLife.txt';
    a.click();
    URL.revokeObjectURL(url);
    showNotification("File downloaded successfully.");
});

// Color Picker
const colorPicker = document.getElementById('colorPicker');
const hexValue = document.getElementById('hexValue');
const rgbaValue = document.getElementById('rgbaValue');
const rgbFloatValue = document.getElementById('rgbFloatValue');
const cmykValue = document.getElementById('cmykValue');
const hsvValue = document.getElementById('hsvValue');
const hslValue = document.getElementById('hslValue');
const colorPreviewBox = document.getElementById('colorPreviewBox');
const toggleAdvancedColors = document.getElementById('toggleAdvancedColors');
const advancedColorValues = document.getElementById('advancedColorValues');

let showAdvancedColors = false;

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = hex.length > 7 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
    return { r, g, b, a };
}

function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);

    c = (c - k) / (1 - k) || 0;
    m = (m - k) / (1 - k) || 0;
    y = (y - k) / (1 - k) || 0;

    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}

function rgbToHsv(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function updateColorValues(hex) {
    const { r, g, b, a } = hexToRgb(hex);
    const alphaPercent = Math.round(a * 100);

    // Update preview box
    colorPreviewBox.style.background = hex.length > 7 ? hex : `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`;

    // Update values
    hexValue.textContent = hex.toUpperCase();
    rgbaValue.textContent = `${r}, ${g}, ${b}, ${a.toFixed(2)}`;
    
    // Update float values
    const rFloat = (r / 255).toFixed(2);
    const gFloat = (g / 255).toFixed(2);
    const bFloat = (b / 255).toFixed(2);
    rgbFloatValue.textContent = `${rFloat}f, ${gFloat}f, ${bFloat}f`;

    // Update CMYK
    const { c, m, y, k } = rgbToCmyk(r, g, b);
    cmykValue.textContent = `${c}%, ${m}%, ${y}%, ${k}%`;

    // Update HSV
    const { h: hHsv, s: sHsv, v: vHsv } = rgbToHsv(r, g, b);
    hsvValue.textContent = `${hHsv}°, ${sHsv}%, ${vHsv}%`;

    // Update HSL
    const { h: hHsl, s: sHsl, l: lHsl } = rgbToHsl(r, g, b);
    hslValue.textContent = `${hHsl}°, ${sHsl}%, ${lHsl}%`;
}

colorPicker.addEventListener('input', (event) => {
    const selectedColor = event.target.value;
    updateColorValues(selectedColor);
});

// Toggle advanced colors
toggleAdvancedColors.addEventListener('click', () => {
    showAdvancedColors = !showAdvancedColors;
    
    if (showAdvancedColors) {
        advancedColorValues.style.display = 'block';
        toggleAdvancedColors.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
    } else {
        advancedColorValues.style.display = 'none';
        toggleAdvancedColors.innerHTML = '<i class="fas fa-chevron-down"></i> Show More';
    }
});

// Initialize with default color
updateColorValues(colorPicker.value);

// Copy to clipboard for color values
document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            navigator.clipboard.writeText(targetElement.textContent)
                .then(() => {
                    showNotification(`${targetId.replace('Value', '')} value copied`);
                })
                .catch(() => {
                    showNotification("Failed to copy", false);
                });
        }
    });
});

// CS to Offsets Converter
const csDropArea = document.getElementById('csDropArea');
const csInput = document.getElementById('csInput');
const addCsButton = document.getElementById('addCsButton');
const clearCsButton = document.getElementById('clearCsButton');
const extractOffsetsButton = document.getElementById('extractOffsetsButton');
const csFileInfo = document.getElementById('csFileInfo');
const csStatus = document.getElementById('csStatus');
const csResult = document.getElementById('csResult');
const csActions = document.getElementById('csActions');
const copyCsButton = document.getElementById('copyCsButton');
const downloadCsButton = document.getElementById('downloadCsButton');

let csFileContent = "";
const searchSections = [
    {
        section: "Bones - C#",
        entries: {
            "Head": "protected ITransformNode OLCJOGDHJJJ;",
            "Root": "protected ITransformNode MPJBGDJJJMJ;",
            "Spine": "protected ITransformNode HCLMADAFLPD;",
            "Hip": "protected ITransformNode CENAIGAFGAG;",
            "RightCalf": "protected ITransformNode JPBJIMCDBHN;",
            "LeftCalf": "protected ITransformNode BMGCHFGEDDA;",
            "RightFoot": "protected ITransformNode AGHJLIMNPJA;",
            "LeftFoot": "protected ITransformNode FDMBKCKMODA;",
            "LeftWrist": "protected ITransformNode GCMICMFEAKI;",
            "RightWrist": "protected ITransformNode CKABHDJDMAP;",
            "LeftHand": "protected ITransformNode KOCDBPLKMBI;",
            "LeftSholder": "protected ITransformNode LIBEIIIAGIK;",
            "RightSholder": "protected ITransformNode HDEPJIBNIIK;",
            "RightWristJoint": "protected ITransformNode NJDDAPKPILB;",
            "LeftWristJoint": "protected ITransformNode JHIBMHEMJOL;",
            "LeftElbow": "protected ITransformNode JBACCHNMGNJ;",
            "RightElbow": "protected ITransformNode FGECMMJKFNC;"
        }
    },
    {
        section: "Bones - C++",
        entries: {
            "uintptr_t Head": "protected ITransformNode OLCJOGDHJJJ;",
            "uintptr_t Root": "protected ITransformNode MPJBGDJJJMJ;",
            "uintptr_t Cuello": "protected ITransformNode HCLMADAFLPD;",
            "uintptr_t Cadera": "protected ITransformNode OLJBCONDGLO;",
            "uintptr_t HombroDerecho": "protected ITransformNode HDEPJIBNIIK;",
            "uintptr_t HombroIzquierdo": "protected ITransformNode LIBEIIIAGIK;",
            "uintptr_t CodoDerecho": "protected ITransformNode JBACCHNMGNJ;",
            "uintptr_t CodoIzquierdo": "protected ITransformNode FGECMMJKFNC;",
            "uintptr_t ManoDerecha": "protected ITransformNode GCMICMFEAKI;",
            "uintptr_t ManoIzquierda": "protected ITransformNode KOCDBPLKMBI;",
            "uintptr_t PieDerecho": "protected ITransformNode CKABHDJDMAP;",
            "uintptr_t PieIzquierdo": "protected ITransformNode FDMBKCKMODA;"        
        }
    }
];

addCsButton.addEventListener('click', () => {
    csInput.click();
});

csInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handleCsFile(file);
});

csDropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    csDropArea.classList.add('dragover');
});

csDropArea.addEventListener('dragleave', () => {
    csDropArea.classList.remove('dragover');
});

csDropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    csDropArea.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    handleCsFile(file);
});

extractOffsetsButton.addEventListener('click', extractOffsets);
clearCsButton.addEventListener('click', clearCsFile);
copyCsButton.addEventListener('click', copyCsResult);
downloadCsButton.addEventListener('click', downloadCsResult);

function handleCsFile(file) {
    if (file && file.name.endsWith('.cs')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            csFileContent = e.target.result;
            csFileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
            csFileInfo.style.display = 'block';
            csStatus.textContent = "File loaded. Ready to extract.";
            csStatus.style.color = "#4CAF50";
            
            csResult.style.display = 'none';
            csActions.style.display = 'none';
            showNotification(".cs file loaded successfully.");
        };
        reader.readAsText(file);
    } else {
        csStatus.textContent = "Please select a valid .cs file.";
        csStatus.style.color = "#FF5252";
        showNotification("Please select a valid .cs file.", false);
    }
}

function extractOffsets() {
    if (!csFileContent) {
        csStatus.textContent = "Please load a .cs file first.";
        csStatus.style.color = "#FF5252";
        showNotification("Please load a .cs file first.", false);
        return;
    }

    const lines = csFileContent.split('\n');
    let result = "Extracted Offsets from Matches\nBy RataLife\n";

    for (const section of searchSections) {
        result += `\n// ====== ${section.section} ======\n\n`;

        for (const key in section.entries) {
            const search = section.entries[key];
            const line = lines.find(l => l.includes(search));

            if (line) {
                const match = line.match(/\/\/\s*(0x[0-9a-fA-F]+)/);
                if (match) {
                    result += `${key} = ${match[1]}\n`;
                } else {
                    result += `${key}: Offset not found\n`;
                }
            } else {
                result += `${key}: Line not found\n`;
            }
        }
    }

    csResult.textContent = result;
    csResult.style.display = 'block';
    csActions.style.display = 'flex';
    csStatus.textContent = "Offsets extracted successfully.";
    csStatus.style.color = "#4CAF50";
    showNotification("Offsets extracted successfully.");
}

function clearCsFile() {
    csFileContent = "";
    csInput.value = "";
    csFileInfo.style.display = 'none';
    csResult.style.display = 'none';
    csActions.style.display = 'none';
    csStatus.textContent = "File cleared.";
    csStatus.style.color = "#ffffff";
    showNotification("File cleared.");
}

function copyCsResult() {
    if (!csResult.textContent) return;
    
    navigator.clipboard.writeText(csResult.textContent)
        .then(() => {
            showNotification("Offsets copied to clipboard");
        })
        .catch(() => {
            showNotification("Failed to copy to clipboard", false);
        });
}

function downloadCsResult() {
    if (!csResult.textContent) return;
    
    const blob = new Blob([csResult.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'OffsetsByRataLife.txt';
    a.click();
    URL.revokeObjectURL(url);
    showNotification("File downloaded successfully.");
}

// Web Cloner
const cloneWebsiteBtn = document.getElementById('cloneWebsiteBtn');
const clearCloneBtn = document.getElementById('clearCloneBtn');
const cloneUrlInput = document.getElementById('cloneUrlInput');
const pasteCloneUrl = document.getElementById('pasteCloneUrl');
const cloneResult = document.getElementById('cloneResult');
const cloneActions = document.getElementById('cloneActions');
const downloadCloneBtn = document.getElementById('downloadCloneBtn');
const cloneStatus = document.getElementById('cloneStatus');

let clonedSiteContent = null;

// Restricted domains (same as in your example)
const restrictedDomains = [
    'google.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'linkedin.com', 'github.com', 'youtube.com', 'whatsapp.com',
    'twentyfox.lat', 'novablaze.shop', 'ratalittleyt.github.io'
];

pasteCloneUrl.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            cloneUrlInput.value = text;
            showNotification("URL pasted successfully");
        } else {
            showNotification("Clipboard is empty", false);
        }
    } catch (error) {
        showNotification("Failed to read clipboard", false);
        console.error("Clipboard read error:", error);
    }
});

cloneWebsiteBtn.addEventListener('click', async () => {
    const url = cloneUrlInput.value.trim();
    
    if (!url) {
        showNotification("Please enter a URL", false);
        return;
    }
    
    try {
        // Parse URL and extract domain
        let parsedUrl;
        try {
            parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
            domain = parsedUrl.hostname.replace('www.', '');
        } catch (e) {
            showNotification("Invalid URL", false);
            return;
        }
        
        // Check restricted domains
        if (restrictedDomains.some(d => domain.includes(d))) {
            showNotification(`Cannot clone ${domain} - restricted`, false);
            return;
        }
        
        cloneWebsiteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cloning...';
        cloneWebsiteBtn.disabled = true;
        cloneStatus.textContent = "Cloning website...";
        cloneStatus.style.color = "#f5f5f5";
        
        // Use CORS proxy (you should replace this with your own backend in production)
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = encodeURIComponent(parsedUrl.href);
        
        const response = await fetch(proxyUrl + targetUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const html = await response.text();
        clonedSiteContent = {
            'index.html': html
        };
        
        cloneResult.textContent = `Successfully cloned: ${domain}\n\nFiles:\n- index.html (${(html.length / 1024).toFixed(2)} KB)`;
        cloneResult.style.display = 'block';
        cloneActions.style.display = 'flex';
        cloneStatus.textContent = "Website cloned successfully!";
        cloneStatus.style.color = "#10b981";
        showNotification("Website cloned successfully");
        
    } catch (error) {
        console.error("Cloning error:", error);
        cloneStatus.textContent = `Error: ${error.message}`;
        cloneStatus.style.color = "#dc2626";
        showNotification(`Cloning failed: ${error.message}`, false);
    } finally {
        cloneWebsiteBtn.innerHTML = '<i class="fas fa-copy"></i> Clone Website';
        cloneWebsiteBtn.disabled = false;
    }
});

downloadCloneBtn.addEventListener('click', async () => {
    if (!clonedSiteContent) return;
    
    try {
        downloadCloneBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        downloadCloneBtn.disabled = true;
        
        // Dynamically load JSZip
        const JSZip = await loadJSZip();
        const zip = new JSZip();
        
        // Add HTML file
        zip.file('index.html', clonedSiteContent['index.html']);
        
        // Generate ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        
        // Create download link
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cloned_site_${new Date().getTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification("ZIP file downloaded");
    } catch (error) {
        console.error("ZIP creation error:", error);
        showNotification("Failed to create ZIP file", false);
    } finally {
        downloadCloneBtn.innerHTML = '<i class="fas fa-download"></i> Download as ZIP';
        downloadCloneBtn.disabled = false;
    }
});

clearCloneBtn.addEventListener('click', () => {
    cloneUrlInput.value = '';
    cloneResult.style.display = 'none';
    cloneActions.style.display = 'none';
    clonedSiteContent = null;
    cloneStatus.textContent = "Ready to clone websites";
    cloneStatus.style.color = "#f5f5f5";
    showNotification("Cleared cloner");
});

// Helper function to load JSZip
async function loadJSZip() {
    if (window.JSZip) return window.JSZip;
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => resolve(window.JSZip);
        script.onerror = () => reject(new Error('Failed to load JSZip'));
        document.head.appendChild(script);
    });
}

// QR Generator
const qrInput = document.getElementById('qrInput');
const pasteQrInput = document.getElementById('pasteQrInput');
const generateQrBtn = document.getElementById('generateQrBtn');
const downloadQrBtn = document.getElementById('downloadQrBtn');
const clearQrBtn = document.getElementById('clearQrBtn');
const qrPreview = document.getElementById('qrPreview');
const qrColor = document.getElementById('qrColor');
const qrBgColor = document.getElementById('qrBgColor');

let currentQrDataUrl = null;

// Load QR code library dynamically
function loadQRCodeJS() {
    return new Promise((resolve, reject) => {
        if (window.QRCode) return resolve();
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

pasteQrInput.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            qrInput.value = text;
            showNotification("Text pasted successfully");
        } else {
            showNotification("Clipboard is empty", false);
        }
    } catch (error) {
        showNotification("Failed to read clipboard", false);
    }
});

generateQrBtn.addEventListener('click', async () => {
    const text = qrInput.value.trim();
    if (!text) {
        showNotification("Please enter text or URL", false);
        return;
    }
    
    try {
        generateQrBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        generateQrBtn.disabled = true;
        
        await loadQRCodeJS();
        
        QRCode.toDataURL(text, {
            color: {
                dark: qrColor.value,
                light: qrBgColor.value
            },
            width: 200,
            margin: 1
        }, (err, url) => {
            if (err) {
                showNotification("Error generating QR code", false);
                console.error("QR error:", err);
                return;
            }
            
            currentQrDataUrl = url;
            qrPreview.innerHTML = `<img src="${url}" alt="Generated QR Code" style="max-width: 100%; height: auto;">`;
            downloadQrBtn.disabled = false;
            showNotification("QR code generated");
        });
    } catch (error) {
        showNotification("Error loading QR library", false);
        console.error("QR lib error:", error);
    } finally {
        generateQrBtn.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR';
        generateQrBtn.disabled = false;
    }
});

downloadQrBtn.addEventListener('click', () => {
    if (!currentQrDataUrl) return;
    
    const a = document.createElement('a');
    a.href = currentQrDataUrl;
    a.download = `qr_code_${new Date().getTime()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification("QR code downloaded");
});

clearQrBtn.addEventListener('click', () => {
    qrInput.value = '';
    qrPreview.innerHTML = '<p style="color: var(--text-secondary);">QR will appear here</p>';
    downloadQrBtn.disabled = true;
    currentQrDataUrl = null;
    showNotification("QR cleared");
});

// IP Tracker
const ipInput = document.getElementById('ipInput');
const pasteIpInput = document.getElementById('pasteIpInput');
const trackIpBtn = document.getElementById('trackIpBtn');
const clearIpBtn = document.getElementById('clearIpBtn');
const ipStatus = document.getElementById('ipStatus');
const ipBasicInfo = document.getElementById('ipBasicInfo');
const ipAdvancedInfo = document.getElementById('ipAdvancedInfo');
const toggleIpInfo = document.getElementById('toggleIpInfo');
const ipMap = document.getElementById('ipMap');

let map = null;
let showAdvancedIpInfo = false;

// Load Leaflet.js for maps
function loadLeaflet() {
    return new Promise((resolve, reject) => {
        if (window.L) return resolve();
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js';
        script.onload = resolve;
        script.onerror = reject;
        
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css';
        
        document.head.appendChild(script);
        document.head.appendChild(css);
    });
}

pasteIpInput.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            ipInput.value = text;
            showNotification("IP pasted successfully");
        } else {
            showNotification("Clipboard is empty", false);
        }
    } catch (error) {
        showNotification("Failed to read clipboard", false);
    }
});

trackIpBtn.addEventListener('click', () => {
    const ip = ipInput.value.trim();
    trackIP(ip || ''); // If empty, track current IP
});

clearIpBtn.addEventListener('click', () => {
    ipInput.value = '';
    ipBasicInfo.style.display = 'none';
    ipAdvancedInfo.style.display = 'none';
    toggleIpInfo.style.display = 'none';
    if (map) {
        map.remove();
        map = null;
    }
    ipMap.style.display = 'none';
    ipStatus.textContent = "Ready to track IP";
    ipStatus.style.color = "#f5f5f5";
    showNotification("IP tracker cleared");
});

toggleIpInfo.addEventListener('click', () => {
    showAdvancedIpInfo = !showAdvancedIpInfo;
    
    if (showAdvancedIpInfo) {
        ipAdvancedInfo.style.display = 'block';
        toggleIpInfo.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
    } else {
        ipAdvancedInfo.style.display = 'none';
        toggleIpInfo.innerHTML = '<i class="fas fa-chevron-down"></i> Show More Details';
    }
});

async function trackIP(ip = '') {
    try {
        trackIpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
        trackIpBtn.disabled = true;
        ipStatus.textContent = "Tracking IP...";
        ipStatus.style.color = "#f5f5f5";
        
        // Clear previous results
        ipBasicInfo.style.display = 'none';
        ipAdvancedInfo.style.display = 'none';
        toggleIpInfo.style.display = 'none';
        if (map) {
            map.remove();
            map = null;
        }
        ipMap.style.display = 'none';
        
        // Get IP data
        const response = await fetch(`https://ipapi.co/${ip || ''}/json/`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.reason || "Unknown error from IP API");
        }
        
        // Update basic info
        document.getElementById('ipAddressValue').textContent = data.ip || '-';
        document.getElementById('ipLocationValue').textContent = 
            `${data.city || ''}${data.city && data.country_name ? ', ' : ''}${data.country_name || ''}`;
        document.getElementById('ipIspValue').textContent = data.org || '-';
        
        // Update advanced info
        document.getElementById('ipCountryCode').textContent = data.country_code || '-';
        document.getElementById('ipRegion').textContent = data.region || '-';
        document.getElementById('ipCity').textContent = data.city || '-';
        document.getElementById('ipZip').textContent = data.postal || '-';
        document.getElementById('ipTimezone').textContent = data.timezone || '-';
        document.getElementById('ipCoordinates').textContent = 
            data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : '-';
        
        // Show map if coordinates available
        if (data.latitude && data.longitude) {
            await loadLeaflet();
            
            ipMap.style.display = 'block';
            map = L.map('ipMap').setView([data.latitude, data.longitude], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            L.marker([data.latitude, data.longitude]).addTo(map)
                .bindPopup(`<b>${data.city || 'Unknown location'}</b><br>${data.ip}`)
                .openPopup();
        }
        
        // Show results
        ipBasicInfo.style.display = 'block';
        toggleIpInfo.style.display = 'block';
        ipStatus.textContent = "IP tracked successfully";
        ipStatus.style.color = "#10b981";
        showNotification("IP information retrieved");
        
    } catch (error) {
        console.error("IP tracking error:", error);
        ipStatus.textContent = `Error: ${error.message}`;
        ipStatus.style.color = "#dc2626";
        showNotification(`IP tracking failed: ${error.message}`, false);
    } finally {
        trackIpBtn.innerHTML = '<i class="fas fa-search"></i> Track IP';
        trackIpBtn.disabled = false;
    }
}

// Particles animation
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = document.body.scrollHeight;

const particleCount = 300;
const drawCount = 60;
const particles = [];
const speedMultiplier = 3;


window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = document.body.scrollHeight;
});