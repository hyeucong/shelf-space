import{t as e}from"./createLucideIcon-lcVMu8HJ.js";var t=e(`Download`,[[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`polyline`,{points:`7 10 12 15 17 10`,key:`2ggqvy`}],[`line`,{x1:`12`,x2:`12`,y1:`15`,y2:`3`,key:`1vk2je`}]]),n=e(`Printer`,[[`path`,{d:`M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`,key:`143wyd`}],[`path`,{d:`M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6`,key:`1itne7`}],[`rect`,{x:`6`,y:`14`,width:`12`,height:`8`,rx:`1`,key:`1ue0tg`}]]);function r(e,t){if(!e)return;let n=new Blob([e],{type:`image/svg+xml;charset=utf-8`}),r=URL.createObjectURL(n),i=new Image;i.onload=()=>{let e=document.createElement(`canvas`),n=1024,a=1200;e.width=n,e.height=a;let o=e.getContext(`2d`);if(o){o.fillStyle=`white`,o.fillRect(0,0,n,a),(n-900)/2,o.drawImage(i,62,50,900,900),o.fillStyle=`black`,o.font=`bold 60px Inter, sans-serif`,o.textAlign=`center`,o.fillText(t,n/2,1050);try{let n=e.toDataURL(`image/png`),r=document.createElement(`a`);r.href=n,r.download=`${t.replace(/[^a-z0-9]/gi,`_`).toLowerCase()}_qr.png`,document.body.appendChild(r),r.click(),document.body.removeChild(r)}catch(e){console.error(`Failed to convert QR to PNG`,e)}}URL.revokeObjectURL(r)},i.src=r}function i(e,t,n){if(!e)return;let r=document.createElement(`iframe`);r.style.position=`fixed`,r.style.right=`0`,r.style.bottom=`0`,r.style.width=`0`,r.style.height=`0`,r.style.border=`0`,document.body.appendChild(r);let i=r.contentWindow?.document;i&&(i.write(`
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
                    ${e}
                    <h1>${t}</h1>
                    ${n?`<p>${n}</p>`:``}
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                    };
                <\/script>
            </body>
        </html>
    `),i.close(),r.contentWindow?.addEventListener(`afterprint`,()=>{document.body.removeChild(r)}))}export{t as i,i as n,n as r,r as t};