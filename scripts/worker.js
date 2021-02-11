const worker_function = () => {
    // importScripts("main.js");
    // importScripts("https://skyneton.github.io/scripts/jspdf.umd.min.js");

    let doc;

    const addImage = (page, src, width, height, format, max, revoke = false) => {
        console.log(page, width, height);
        setTimeout(() => {
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

            if(revoke) URL.revokeObjectURL(src);

            if(index.add() >= max) {
                self.postMessage(URL.createObjectURL(doc.output("blob")));
            }
        });
    }
    
    const index = new function() {
        let i = 0;
        this.get = () => { return i; }
        this.add = () => { return ++i; }
    };

    self.addEventListener("message", data => {
        const packet = data.data;
        switch(packet.type) {
            case "start": {
                importScripts(packet.url);
                doc = PDFCreate(packet.orientation, packet.util, packet.format);
                break;
            }
            case "image": {
                if(packet.page > 1) doc.addPage();
                addImage(packet.page, packet.src, packet.width, packet.height, packet.format, packet.max);
                break;
            }
        }
    });

    const PDFCreate = (orientation, util, format) => {
        const doc = new jspdf.jsPDF({
            orientation: orientation,
            unit: util,
            format: (() => {
                if(format == "auto") return "a4";
                return format;
            })()
        });
        // doc.addFileToVFS("malgun.ttf", font);
        // doc.addFont("malgun.ttf", "malgun", "normal");
        // doc.setFont("malgun");
    
        return doc;
    }
}
const addImage = (doc, page, src, width, height, format, name, index, max, loadingPage, revoke) => {
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

        if(revoke) URL.revokeObjectURL(src);

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
    // doc.addFileToVFS("malgun.ttf", malgun);
    // doc.addFont("malgun.ttf", "malgun", "normal");
    // doc.setFont("malgun");

    return doc;
}
const imgCompress = (url, compress) => {
    return new Promise(resolve => {
        fetch(url).then(r => r.blob()).then(blob => {
            new Compressor(blob, {
                quality: compress,
                success(result) {
                    resolve(URL.createObjectURL(result));
                },
            });
        });
    });
}

const getImageSrc = (url, compress, percent) => {
    return new Promise(resolve => {
        if(compress == 0)
            resolve(url);
        else
            imgCompress(url, percent).then(result => { resolve(result); });
    });
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

const getImageData = img => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const content = canvas.getContext("2d");
    content.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

    return content.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
}

const imageListPDF = (downloadPage, orientation, util, format, multiple, imageList, compress) => {
    return new Promise(() => {
        setTimeout(() => {
            const doc = PDFCreate(orientation, util, format);
            const name = `${imageList[0].getElementsByClassName("imageName")[0].innerText.substring(imageList[0].getElementsByClassName("imageName")[0].innerText.lastIndexOf("."), 0)}.pdf`;
            const compressPercent = (() => {
                switch(parseInt(compress)) {
                    case 1: return 0.9;
                    case 2: return 0.75;
                    case 3: return 0.6;
                    default: return 1;
                }
            })();

            const compressor = new Compressor();

            const index = new function() {
                let i = 0;
                this.get = () => { return i; }
                this.add = () => { return ++i; }
            };

            const compressLength = new function() {
                let i = 0;
                this.get = () => { return i; }
                this.add = () => { return ++i; }
            };
    
            for(let i = 0; i < imageList.length; i++) {
                if(i > 0) doc.addPage();
                const img = imageList[i].getElementsByTagName("img")[0];
                if(compressPercent != 1) {
                    const data = {
                        page: i + 1,
                        width: img.naturalWidth * multiple,
                        height: img.naturalHeight * multiple
                    }

                    compressor.encode({
                        image: getImageData(img),
                        quality: compressPercent,
                        success: message,
                        return: data
                    });
                    continue;
                }
                addImage(doc, i + 1, img.src, img.naturalWidth * multiple, img.naturalHeight * multiple, format, name, index, imageList.length, downloadPage);
            }

            function message(packet) {
                const result = packet.result;
                const back = packet.return;

                addImage(doc, back.page, URL.createObjectURL(new Blob([result.data], {type: "image/jpeg"})), back.width, back.height, format, name, index, imageList.length, downloadPage, true);

                if(compressLength.add() >= imageList.length) {
                    compressor.stop();
                }
            }
        }, 700);
    });
}

const imageListPDFByThread = (downloadPage, orientation, util, format, multiple, imageList, compress) => {
    return new Promise(() => {
        setTimeout(() => {
            const workerURL = URL.createObjectURL(new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'}));
            const jspdfURL = URL.createObjectURL(new Blob(["("+jspdf_worker.toString()+")()"], {type: 'text/javascript'}));
            const worker = new Worker(workerURL);
            const compressPercent = (() => {
                switch(parseInt(compress)) {
                    case 1: return 0.9;
                    case 2: return 0.75;
                    case 3: return 0.6;
                    default: return 1;
                }
            })();
            const packet = {
                url: jspdfURL,
                orientation: orientation,
                util: util,
                format: format,
                type: "start"
            }

            worker.addEventListener("message", e => {
                const link = document.createElement("a");
                link.href = e.data;
                link.download = `${imageList[0].getElementsByClassName("imageName")[0].innerText.substring(imageList[0].getElementsByClassName("imageName")[0].innerText.lastIndexOf("."), 0)}.pdf`;
                link.click();
                downloadPage.remove();
                worker.terminate();
                URL.revokeObjectURL(workerURL);
                URL.revokeObjectURL(jspdfURL);
                URL.revokeObjectURL(jpegURL);
            });
            worker.postMessage(packet);

            
            for(let i = 0; i < imageList.length; i++) {
                const img = imageList[i].getElementsByTagName("img")[0];

                getImageSrc(img.src, compress, compressPercent).then(url => {
                    const data = {
                        page: i + 1,
                        src: url,
                        width: img.naturalWidth * multiple,
                        height: img.naturalHeight * multiple,
                        format: format,
                        max: imageList.length,
                        type: "image"
                    }
                    
                    worker.postMessage(data);
                });
            }
        });
    });
}