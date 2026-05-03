export function downloadQrAsPng(svgString: string, title: string) {
    if (!svgString) return;

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const canvasWidth = 1024;
        const canvasHeight = 1200; // Extra space for title
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Draw QR Code
            const qrSize = 900;
            const x = (canvasWidth - qrSize) / 2;
            const y = 50;
            ctx.drawImage(img, x, y, qrSize, qrSize);

            // Draw Title
            ctx.fillStyle = 'black';
            ctx.font = 'bold 60px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(title, canvasWidth / 2, y + qrSize + 100);

            try {
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } catch (e) {
                console.error('Failed to convert QR to PNG', e);
            }
        }
        URL.revokeObjectURL(url);
    };
    img.src = url;
}

export function printQr(svgString: string, title: string, subtitle?: string) {
    if (!svgString) return;

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    @page {
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        font-family: sans-serif;
                        -webkit-print-color-adjust: exact;
                    }
                    .container {
                        text-align: center;
                        width: 100%;
                        max-width: 400px;
                    }
                    svg {
                        width: 100%;
                        height: auto;
                    }
                    h1 { font-size: 24px; margin: 20px 0 0; }
                    p { font-size: 16px; color: #666; margin: 10px 0 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    ${svgString}
                    <h1>${title}</h1>
                    ${subtitle ? `<p>${subtitle}</p>` : ''}
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                    };
                </script>
            </body>
        </html>
    `);
    doc.close();

    // Remove the iframe after printing
    iframe.contentWindow?.addEventListener('afterprint', () => {
        document.body.removeChild(iframe);
    });
}
