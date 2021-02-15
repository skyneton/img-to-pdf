const { abort } = require("process");

const worker_function = () => {

    let doc;

    const addImage = (page, src, width, height, format, max, revoke = false) => {
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
                try {
                    console.log(URL.createObjectURL([doc.output()], { type: "application/pdf" }));
                    self.postMessage({data: URL.createObjectURL(doc.output("blob")), type: "finish"});
                }catch {
                    self.postMessage({type: "error"});
                }
            }
        });
    }

    const getArrayBuffer = data => {
        let len = data.length;
        const ab = new ArrayBuffer(len);
        const u8 = new Uint8Array(ab);
        while(len--) u8[len] = data.charCodeAt(len);
        return ab;
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
                while(doc.getNumberOfPages() < packet.page) doc.addPage();
                addImage(packet.page, packet.src, packet.width, packet.height, packet.format, packet.max, packet.revoke);
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
    
        return doc;
    }
}

const addImage = (doc, page, src, width, height, format, name, index, max, loadingPage, revoke = false) => {
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
            const url = URL.createObjectURL(doc.output("blob"));
            saveAs(url, name);
            URL.revokeObjectURL(url);
            loadingPage.remove();
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

    return doc;
}

const imageCompress = (url, quality) => {
    return new Promise(resolve => {
        new Compressor(url, {
            quality: quality,
            success(result) {
                resolve(URL.createObjectURL(result));
            },
        });
    });
}

const getImageSrc = (url, compress, percent) => {
    return new Promise(resolve => {
        if(compress == 0)
            resolve(url);
        else
            imageCompress(url, percent).then(result => { resolve(result); });
    });
}

const imageListPDF = (downloadPage, orientation, util, format, multiple, imageList, compress) => {
    return new Promise(() => {
        const doc = PDFCreate(orientation, util, format);
        const name = `${imageList[0].getElementsByClassName("imageName")[0].innerText.substring(imageList[0].getElementsByClassName("imageName")[0].innerText.lastIndexOf("."), 0)}.pdf`;
        const quality = (() => {
            switch(parseInt(compress)) {
                case 1: return 0.8;
                case 2: return 0.65;
                case 3: return 0.5;
                default: return 1;
            }
        })();

        const index = new function() {
            let i = 0;
            this.get = () => { return i; }
            this.add = () => { return ++i; }
        };

        compressTime = 0;

        for(let i = 0; i < imageList.length; i++) {
            while(doc.getNumberOfPages() < i + 1) doc.addPage();
            const img = imageList[i].getElementsByTagName("img")[0];

            getImageSrc(img.src, compress, quality).then(result => {
                addImage(doc, i + 1, result, img.naturalWidth * multiple, img.naturalHeight * multiple, format, name, index, imageList.length, downloadPage, compress != 0);
            });
        }
    });
}

const imageListPDFByThread = (downloadPage, orientation, util, format, multiple, imageList, compress) => {
    return new Promise(() => {
        const workerURL = URL.createObjectURL(new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'}));
        const jspdfURL = URL.createObjectURL(new Blob(["("+jspdf_worker.toString()+")()"], {type: 'text/javascript'}));
        const worker = new Worker(workerURL);
        const quality = (() => {
            switch(parseInt(compress)) {
                case 1: return 0.8;
                case 2: return 0.65;
                case 3: return 0.5;
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
            worker.terminate();
            URL.revokeObjectURL(workerURL);
            URL.revokeObjectURL(jspdfURL);
            switch(e.data.type) {
                case "finish": {
                    saveAs(e.data.data, `${imageList[0].getElementsByClassName("imageName")[0].innerText.substring(imageList[0].getElementsByClassName("imageName")[0].innerText.lastIndexOf("."), 0)}.pdf`);
                    downloadPage.remove();
                    break;
                }
                case "error": {
                    downloadPage.remove();
                    alert((() => {
                        if(document.title == "이미지 PDF 변환")
                            return "알수없는 오류!";
                        if(document.title == "イメージを PDF に変換")
                            return "不明なエラーです。";
                        else
                            return "Unknown error!";
                    })());
                }
            }
        });
        worker.postMessage(packet);

        
        for(let i = 0; i < imageList.length; i++) {
            const img = imageList[i].getElementsByTagName("img")[0];

            getImageSrc(img.src, compress, quality).then(result => {
                const data = {
                    page: i + 1,
                    src: result,
                    width: img.naturalWidth * multiple,
                    height: img.naturalHeight * multiple,
                    format: format,
                    max: imageList.length,
                    revoke: compress != 0,
                    type: "image"
                }
                
                worker.postMessage(data);
            });
        }
    });
}

const saveAs = (url, name) => {
    const link = document.createElement("a");
    link.target = "_blank";
    link.href = url;
    link.download = name;
    link.click();
    link.remove();
}