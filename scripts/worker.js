const worker_function = () => {
    // importScripts("main.js");
    // importScripts("https://skyneton.github.io/scripts/jspdf.umd.min.js");

    let doc;

    const addImage = (page, src, width, height, format) => {
		try {
        doc.setPage(page);
        if(format == "auto") {
            doc.setPageWidth(page, width);
            doc.setPageHeight(page, height);
            doc.addImage(src, "JPEG", 0, 0, width, height);
        }else {
            const persentage = ((doc.getPageWidth(page)/width > doc.getPageHeight(page)/height) ? self.doc.getPageHeight(page)/height : self.doc.getPageWidth(page)/width);
            const subWidth = (doc.getPageWidth(page) - width * persentage)/2;
            const subHeight = (doc.getPageHeight(page) - height * persentage)/2;
            doc.addImage(src, "JPEG", subWidth, subHeight, doc.getPageWidth(page) - subWidth, doc.getPageHeight(page) - subHeight);
        }
		}catch(e) { console.log(e); }
    }
    
    const index = new function() {
        let i = 0;
        this.get = () => { return i; }
        this.add = () => { return ++i; }
    };

    self.addEventListener("message", (data) => {
        const packet = data.data;
        switch(packet.type) {
            case "start": {
                importScripts(packet.url);
                doc = PDFCreate(packet.orientation, packet.util, packet.format, packet.font);
                break;
            }
            case "image": {
                if(packet.page > 1) doc.addPage();
                addImage(packet.page, packet.src, packet.width, packet.height, packet.format);

                if(index.add() >= packet.max) {
                    self.postMessage(URL.createObjectURL(doc.output("blob")));
                }
                break;
            }
        }
    });

    const PDFCreate = (orientation, util, format, font) => {
        const doc = new jspdf.jsPDF({
            orientation: orientation,
            unit: util,
            format: (() => {
                if(format == "auto") return "a4";
                return format;
            })()
        });
        doc.addFileToVFS("malgun.ttf", font);
        doc.addFont("malgun.ttf", "malgun", "normal");
        doc.setFont("malgun");
    
        return doc;
    }
}
const addImage = (doc, page, src, width, height, format, name, index, max, loadingPage) => {
    setTimeout(() => {
        doc.setPage(page);
        if(format == "auto") {
            doc.setPageWidth(page, width);
            doc.setPageHeight(page, height);
            doc.addImage(src, "JPEG", 0, 0, width, height);
        }else {
            const persentage = ((doc.getPageWidth(page)/width > doc.getPageHeight(page)/height) ? doc.getPageHeight(page)/height : doc.getPageWidth(page)/width);
            const subWidth = (doc.getPageWidth(page) - width * persentage)/2;
            const subHeight = (doc.getPageHeight(page) - height * persentage)/2;
            doc.addImage(src, "JPEG", subWidth, subHeight, doc.getPageWidth(page) - subWidth, doc.getPageHeight(page) - subHeight);
        }

        if(index.add() >= max) {
            doc.save(name, {returnPromise: true}).then(() => {
                loadingPage.remove();
            });
        }
    });
}

const PDFCreate = (orientation, util, format) => {
    const doc = new jspdf.jsPDF({
        orientation: orientation,
        unit: util,
        format: (() => {
            if(format == "auto") return "a4";
            return format;
        })()
    });
    doc.addFileToVFS("malgun.ttf", malgun);
    doc.addFont("malgun.ttf", "malgun", "normal");
    doc.setFont("malgun");

    return doc;
}
const imgCompress = image => {
    let result = image.src;
    if(!!document.createElement("canvas").getContext) {
        try {
            const canvas = document.createElement("canvas");
            const width = image.naturalWidth;
            const height = image.naturalHeight;
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(image, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", (() => {
                switch(parseInt(document.getElementsByClassName("pdfOptionCompress")[0].value)) {
                    case 1: return 0.9;
                    case 2: return 0.75;
                    case 3: return 0.6;
                    default: return 1;
                }
            })());
            result = URL.createObjectURL(dataURLToBlob(dataUrl));
        }catch(e) { }
    }
    return result;
}

const getImageSrc = (img, compress) => {
    if(compress == 0)
        return img.src;
    return imgCompress(img);
}

const dataURLToBlob = url => {
    const BASE64_MARKER = ";base64,";
    if(url.indexOf(BASE64_MARKER) == -1) {
        const parts = url.split(",");
        const contentType = parts[0].split(":")[1];
        const raw = parts[1];

        return new Blob([raw], { type: contentType });
    }

    const parts = url.split(BASE64_MARKER);
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;

    const uInt8Array = new Uint8Array(rawLength);
    for(let i = 0; i < rawLength; i++) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}

const imageListPDF = (downloadPage, orientation, util, format, multiple, imageList, compress) => {
    return new Promise(() => {
        setTimeout(() => {
            const doc = PDFCreate(orientation, util, format);
            const name = `${imageList[0].getElementsByClassName("imageName")[0].innerText}.pdf`;

            const index = new function() {
                let i = 0;
                this.get = () => { return i; }
                this.add = () => { return ++i; }
            };
    
            for(let i = 0; i < imageList.length; i++) {
                if(i > 0) doc.addPage();
                const img = imageList[i].getElementsByTagName("img")[0];
    
                addImage(doc, i + 1, getImageSrc(img, compress), img.naturalWidth * multiple, img.naturalHeight * multiple, format, name, index, imageList.length, downloadPage);
            }
        }, 700);
    });
}

const imageListPDFByThread = (downloadPage, orientation, util, format, multiple, imageList, compress) => {
    return new Promise(() => {
        setTimeout(() => {
            const worker = new Worker(URL.createObjectURL(new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'})));
            const packet = {
                url: URL.createObjectURL(new Blob(["("+jspdf_worker.toString()+")()"], {type: 'text/javascript'})),
                font: malgun,
                orientation: orientation,
                util: util,
                format: format,
                type: "start"
            }

            worker.addEventListener("message", e => {
                const link = document.createElement("a");
                link.href = e.data;
                link.download = `${imageList[0].getElementsByClassName("imageName")[0].innerText}.pdf`;
                link.click();
                downloadPage.remove();
                worker.terminate();
            });
            worker.postMessage(packet);

            
            for(let i = 0; i < imageList.length; i++) {
                const img = imageList[i].getElementsByTagName("img")[0];

                const data = {
                    page: i + 1,
                    src: getImageSrc(img, compress),
                    width: img.naturalWidth * multiple,
                    height: img.naturalHeight * multiple,
                    format: format,
                    max: imageList.length,
                    type: "image"
                }

                worker.postMessage(data);
            }
        });
    });
}