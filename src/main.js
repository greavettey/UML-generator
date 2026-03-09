import { batchParseJavaFiles } from './parser/index.js';
import mermaid from 'mermaid';
import panzoom from 'panzoom'; // Import the new library

mermaid.initialize({ startOnLoad: false, theme: 'default' });

const fileInput = document.getElementById('file-upload');
const uploadBox = document.getElementById('upload-box');
const outputDiv = document.getElementById('uml-output');
const toolbar = document.getElementById('toolbar');

let currentPanZoom = null; // Track the panzoom instance
let rawMermaidSvg = "";    // Store the raw SVG string for exports

uploadBox.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    outputDiv.innerHTML = '<p>Parsing files...</p>';
    toolbar.style.display = 'none';

    try {
        const fileContents = [];
        for (const file of files) {
            fileContents.push(await file.text());
        }

        const mermaidSyntax = batchParseJavaFiles(fileContents);
        const { svg } = await mermaid.render('generated-diagram', mermaidSyntax);

        rawMermaidSvg = svg;
        outputDiv.innerHTML = svg;

        const svgElement = outputDiv.querySelector('svg');
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';

        if (currentPanZoom) currentPanZoom.dispose();
        currentPanZoom = panzoom(svgElement, {
            maxZoom: 5,
            minZoom: 0.1
        });

        toolbar.style.display = 'flex';

    } catch (error) {
        console.error(error);
        outputDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
});

document.getElementById('btn-download-svg').addEventListener('click', () => {
    if (!rawMermaidSvg) return;

    const blob = new Blob([rawMermaidSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'uml-diagram.svg');
});

document.getElementById('btn-download-png').addEventListener('click', () => {
    const svgElement = outputDiv.querySelector('svg');
    if (!svgElement) return;

    const clonedSvg = svgElement.cloneNode(true);

    const bbox = svgElement.getBoundingClientRect();
    const exportWidth = bbox.width * 2;   // 2x scale for crisp Retina displays
    const exportHeight = bbox.height * 2;

    clonedSvg.setAttribute('width', exportWidth);
    clonedSvg.setAttribute('height', exportHeight);

    clonedSvg.style.transform = '';
    const firstGroup = clonedSvg.querySelector('g');
    if (firstGroup) firstGroup.removeAttribute('transform');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = exportWidth;
    canvas.height = exportHeight;

    // 4. Serialize to a URI-encoded string (Bypasses the Blob tainting issue)
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

    const img = new Image();
    img.onload = () => {
        ctx.fillStyle = '#ffffff'; // Ensure white background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
            const pngUrl = canvas.toDataURL('image/png');
            triggerDownload(pngUrl, 'uml-diagram.png');
        } catch (err) {
            console.error("Canvas export blocked:", err);
            alert("Export failed: Your browser blocked the PNG generation due to strict canvas security rules.");
        }
    };

    img.onerror = (err) => {
        console.error("Failed to load SVG into Image:", err);
        alert("Export failed: Could not process the SVG data.");
    };

    img.src = svgUrl;
});

// Helper function to force a file download in the browser
function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}