const worker_function = () => {

    let doc;

    const addImage = (page, src, width, height, format, max, revoke = false) => {
        const addData = () => {
            if(revoke) URL.revokeObjectURL(src);

            if(index.add() >= max) {
                try {
                    self.postMessage({data: URL.createObjectURL(doc.toBlob()), type: "finish"});
                }catch(e) {
                    self.postMessage({type: "error"});
                }
            }
        }

        doc.setPage(page);
        if(format == "auto") {
            doc.drawImage(src).then(() => { addData(); });
        }else {
            const persentage = ((doc.getPageWidth(page)/width > doc.getPageHeight(page)/height) ? doc.getPageHeight(page)/height : doc.getPageWidth(page)/width);
            const subWidth = (doc.getPageWidth(page) - width * persentage)/2;
            const subHeight = (doc.getPageHeight(page) - height * persentage)/2;
            doc.drawImage(src, subWidth, subHeight, doc.getPageWidth(page) - subWidth * 2, doc.getPageHeight(page) - subHeight * 2).then(() => { addData(); }).catch(() =>{ addData(); });
        }
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
                doc = PDFCreate(packet.orientation, packet.format);
                break;
            }
            case "image": {
                while(doc.getNumberOfPages() < packet.page + 1) doc.addPage();
                addImage(packet.page, packet.src, packet.width, packet.height, packet.format, packet.max, packet.revoke);
                break;
            }
        }
    });

    const PDFCreate = (orientation, format) => {
        const doc = new PDFBuilder({
            orientation: orientation,
            format: format
        });
    
        return doc;
    }
}

const addImage = (doc, page, src, width, height, format, name, index, max, loadingPage, revoke = false) => {
    const addData = () => {
        if(revoke) URL.revokeObjectURL(src);
        if(index.add() >= max) {
            try {
                const url = URL.createObjectURL(doc.toBlob());
                saveAs(url, name);
                URL.revokeObjectURL(url);
                loadingPage.remove();
            }catch(e) {
                loadingPage.remove();
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
    };
    doc.setPage(page);
    if(format == "auto") {
        doc.drawImage(src).then(() => { addData(); }).catch(() =>{ addData(); });
    }else {
        const persentage = ((doc.getPageWidth(page)/width > doc.getPageHeight(page)/height) ? doc.getPageHeight(page)/height : doc.getPageWidth(page)/width);
        const subWidth = (doc.getPageWidth(page) - width * persentage)/2;
        const subHeight = (doc.getPageHeight(page) - height * persentage)/2;
        doc.drawImage(src, subWidth, subHeight, doc.getPageWidth(page) - subWidth, doc.getPageHeight(page) - subHeight).then(() => { addData(); });
    }
}

const PDFCreate = (orientation, format) => {
    const doc = new PDFBuilder({
        orientation: orientation,
        format: format
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

const imageListPDF = (downloadPage, orientation, format, imageList, compress) => {
    return new Promise(() => {
        const doc = PDFCreate(orientation, format);
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
            if(img.src == "") {
                img.onload = () => {
                    getImageSrc(img.src, compress, quality).then(result => {
                        addImage(doc, i, result, img.naturalWidth, img.naturalHeight, format, name, index, imageList.length, downloadPage, compress != 0);
                    });
                };
                continue;
            }

            getImageSrc(img.src, compress, quality).then(result => {
                addImage(doc, i, result, img.naturalWidth, img.naturalHeight, format, name, index, imageList.length, downloadPage, compress != 0);
            });
        }
    });
}

const imageListPDFByThread = (downloadPage, orientation, format, imageList, compress) => {
    return new Promise(() => {
        const workerURL = URL.createObjectURL(new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'}));
        const jspdfURL = URL.createObjectURL(new Blob([PDFBuilder.toString()], {type: 'text/javascript'}));
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
            format: format,
            type: "start"
        }

        worker.addEventListener("message", e => {
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
            worker.terminate();
            URL.revokeObjectURL(workerURL);
            URL.revokeObjectURL(jspdfURL);
        });
        worker.postMessage(packet);

        
        for(let i = 0; i < imageList.length; i++) {
            const img = imageList[i].getElementsByTagName("img")[0];
            if(img.src == "") {
                img.onload = () => {
                    getImageSrc(img.src, compress, quality).then(result => {
                        const data = {
                            page: i,
                            src: result,
                            width: img.naturalWidth,
                            height: img.naturalHeight,
                            format: format,
                            max: imageList.length,
                            revoke: compress != 0,
                            type: "image"
                        }
                        
                        worker.postMessage(data);
                    });
                };
                continue;
            }
            getImageSrc(img.src, compress, quality).then(result => {
                const data = {
                    page: i,
                    src: result,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
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