(() => {
    const canvas = document.createElement("canvas");
    const classSupported = (() => {
        try {
            return !!JPEG;
        }catch { return false; }
    })();
    if(!(canvas && canvas.getContext && canvas.getContext("2d") && classSupported)) {
        document.getElementsByClassName("version_not_supported")[0].style.display = "block";
        document.getElementsByClassName("img_to_pdf_info")[0].style.display = "none";
        return;
    }
    if(getCookie("beforeVisited")) {
        document.getElementsByClassName("img_to_pdf_info")[0].style.display = "none";
    }
    setCookie("beforeVisited", true, 365);
})();

let pdfBlockMove;
const jpeg = new JPEG();

const fileDragOverEvent = event => {
    event.stopPropagation();
    event.preventDefault();
};

document.getElementsByClassName("info")[0].onclick = () => {
    if(document.getElementsByClassName("img_to_pdf_info")[0].style.display == "none") {
        document.getElementsByClassName("img_to_pdf_info")[0].style.display = null;
    }
};

document.getElementsByClassName("img_to_pdf_info")[0].onclick = () => {
    document.getElementsByClassName("img_to_pdf_info")[0].style.display = "none";
};

document.getElementsByClassName("fileAddBox")[0].onclick = () => {
    if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
    document.getElementsByClassName("inpFile")[0].click();
};

window.ondragover = () => {
    if(pdfBlockMove) return;
    event.stopPropagation();
    event.preventDefault();
};

window.ondrop = async () => {
    event.stopPropagation();
    event.preventDefault();
    if(document.getElementsByClassName("downloadLoadingPage").length > 0) return false;
    const files = (() => {
        const collator = new Intl.Collator("en", {numeric: true, sensitivity: "base"});
        const sortResult = [...(event.target.files || event.dataTransfer.files)].sort((a, b) => collator.compare(a.name, b.name));
        if(document.getElementsByClassName("orderByCommandBtn")[0].getAttribute("data-type") == "up")
            return sortResult;
        return sortResult.reverse();
    })();
    for(let i = 0; i < files.length; i++) {
        if(files[i].type === "application/pdf") pdfFileAdd(files[i]);
        else imageFileAdd(files[i]);
    }
    pdfBlockMove = undefined;
};

document.getElementsByClassName("inpFile")[0].onchange = async () => {
    if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
    const files = (() => {
        const collator = new Intl.Collator("en", {numeric: true, sensitivity: "base"});
        const sortResult = [...(event.target.files || event.dataTransfer.files)].sort((a, b) => collator.compare(a.name, b.name));
        if(document.getElementsByClassName("orderByCommandBtn")[0].getAttribute("data-type") == "up")
            return sortResult;
        return sortResult.reverse();
    })();
    for(let i = 0; i < files.length; i++) {
        if(files[i].type === "application/pdf") pdfFileAdd(files[i]);
        imageFileAdd(files[i]);
    }
    document.getElementsByClassName("inpFile")[0].value = null;
};

document.getElementsByClassName("orderByCommandBtn")[0].onclick = () => {
    if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
    const loc = document.getElementsByClassName("imageListBox")[0];
    const plusBtn = document.getElementsByClassName("fileAddBox")[0];
    const list = [...document.getElementsByClassName("imageBox")];
    (() => {
        const collator = new Intl.Collator("en", {numeric: true, sensitivity: "base"});
        const sortResult = list.sort((a, b) => collator.compare(a.getElementsByClassName("imageName")[0].innerText, b.getElementsByClassName("imageName")[0].innerText));
        if(document.getElementsByClassName("orderByCommandBtn")[0].getAttribute("data-type") == "up")
            return sortResult;
        return sortResult.reverse();
    })().forEach(item => {
        loc.insertBefore(item, plusBtn);
    });
};

document.getElementsByClassName("pdfOptionFormat")[0].onchange = () => {
    if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
    if(event.target.value != "auto") {
        document.getElementsByClassName("pdfOptionOrientation")[0].disabled = false;
        document.getElementsByClassName("imageListBox")[0].setAttribute("format", (() => {
            if(document.getElementsByClassName("pdfOptionOrientation")[0].value == "landscape")
                return "b";
            return "a";
        })());
    }else {
        document.getElementsByClassName("pdfOptionOrientation")[0].disabled = true;
        if(document.getElementsByClassName("imageListBox")[0].hasAttribute("format"))
            document.getElementsByClassName("imageListBox")[0].removeAttribute("format");
    }
};


document.getElementsByClassName("pdfOptionOrientation")[0].onchange = () => {
    if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
    if(document.getElementsByClassName("pdfOptionFormat")[0].value != "auto") {
        document.getElementsByClassName("imageListBox")[0].setAttribute("format", (() => {
            if(event.target.value == "landscape")
                return "b";
            return "a";
        })());
    }
};

document.getElementsByClassName("orderByTypeBtn")[0].onclick = () => {
    if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
    if(!document.getElementsByClassName("orderByTypeBtn")[0].time) {
        document.getElementsByClassName("orderByTypeBtn")[0].getElementsByTagName("svg")[0].getElementsByTagName("path")[0].setAttribute("d", "M13.3333 12L7.99992 6.5L2.66659 12L1.33325 10.6667L7.99992 4L14.6666 10.6667L13.3333 12Z");
        document.getElementsByClassName("orderByTypeBtn")[0].setAttribute("active", true);
    }
    document.getElementsByClassName("orderByTypeBtn")[0].time = undefined;
};

document.getElementsByClassName("orderByOptionItem")[0].onclick = () => {
    if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
    const temp = document.getElementsByClassName("orderByCommandBtn")[0].innerText;
    document.getElementsByClassName("orderByCommandBtn")[0].innerText = document.getElementsByClassName("orderByOptionItem")[0].innerText;
    document.getElementsByClassName("orderByOptionItem")[0].innerText = temp;
    const dataTemp = document.getElementsByClassName("orderByCommandBtn")[0].getAttribute("data-type");
    document.getElementsByClassName("orderByCommandBtn")[0].setAttribute("data-type", document.getElementsByClassName("orderByOptionItem")[0].getAttribute("data-type"));
    document.getElementsByClassName("orderByOptionItem")[0].setAttribute("data-type", dataTemp);
};

window.onmouseup = () => {
    if(document.getElementsByClassName("orderByTypeBtn")[0].hasAttribute("active")) {
        let parent = event.target;
        for(let i = 0; i < 4; i++) {
            if(parent == document.getElementsByClassName("orderByTypeBtn")[0]) {
                parent.time = true;
                break;
            }
            if(!parent.parentElement) break;
            parent = parent.parentElement;
        }
        document.getElementsByClassName("orderByTypeBtn")[0].removeAttribute("active");
        document.getElementsByClassName("orderByTypeBtn")[0].getElementsByTagName("svg")[0].getElementsByTagName("path")[0].setAttribute("d", "M13.3333 4L14.6666 5.33333L7.99992 12L1.33325 5.33333L2.66659 4L7.99992 9.5L13.3333 4Z");
    }
};

document.getElementsByClassName("clear")[0].onclick = () => {
    if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
    while(document.getElementsByClassName("imageBox").length > 0) {
        URL.revokeObjectURL(document.getElementsByClassName("imageBox")[0].getElementsByTagName("img")[0].src);
        document.getElementsByClassName("imageBox")[0].remove();
    }
};

document.getElementsByClassName("transform")[0].onclick = () => {
    if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
    if(document.getElementsByClassName("imageBox").length <= 0) return;

    const downloadPage = createLoadingPage((() => {
        if(document.title.includes("이미지 PDF 변환"))
            return "PDF를 생성중입니다.";
        if(document.title.includes("イメージを PDF に変換 - イメージを無料でPDF変換"))
            return "PDFを作成中です。";
        else
            return "Generating PDF.";
    })());
    document.body.appendChild(downloadPage);

    const orientation = document.getElementsByClassName("pdfOptionOrientation")[0].value;
    const format = document.getElementsByClassName("pdfOptionFormat")[0].value;
    const imageList = document.getElementsByClassName("imageBox");
    const compress = document.getElementsByClassName("pdfOptionCompress")[0].value;

    if(location.protocol.startsWith("http") && !!Worker) {
        imageListPDFByThread(downloadPage, orientation, format, imageList, compress).catch((e) => {
            console.error(e);
            downloadPage.remove();
            alert((() => {
                if(document.title.includes("이미지 PDF 변환"))
                    return "알수없는 오류!";
                if(document.title.includes("イメージを PDF に変換"))
                    return "不明なエラーです。";
                else
                    return "Unknown error!";
            })());
        });
    }else {
        imageListPDF(downloadPage, orientation, format, imageList, compress).catch((e) => {
            console.error(e);
            downloadPage.remove();
            alert((() => {
                if(document.title.includes("이미지 PDF 변환"))
                    return "알수없는 오류!";
                if(document.title.includes("イメージを PDF に変換"))
                    return "不明なエラーです。";
                else
                    return "Unknown error!";
            })());
        });
    }
};

const createImageBox = name => {
    const imageDivBox = document.createElement("div");
    imageDivBox.setAttribute("class", "imageBox");
    imageDivBox.setAttribute("draggable", true);
    const copyDeleteBtnLoc = document.querySelector("body>.deleteBtn");
    const deleteBtn = copyDeleteBtnLoc.cloneNode();
    for(let i = 0; i < copyDeleteBtnLoc.children.length; i++) {
        deleteBtn.appendChild(copyDeleteBtnLoc.children[i].cloneNode());
    }
    deleteBtn.setAttribute("draggable", false);
    imageDivBox.appendChild(deleteBtn);

    const imageItem = document.createElement("div");
    imageItem.setAttribute("class", "imageContainer");
    imageDivBox.appendChild(imageItem);

    const canvas = document.createElement("div");
    canvas.setAttribute("class", "imageCanvas");

    const image = document.createElement("img");

    canvas.appendChild(image);
    imageItem.appendChild(canvas);

    const fileName = document.createElement("div");
    fileName.setAttribute("class", "imageName");
    fileName.setAttribute("draggable", false);
    fileName.innerText = name;
    imageDivBox.appendChild(fileName);

    image.ondragstart = () => {
        if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
        const target = imageDivBox;
        pdfBlockMove = target;
        event.dataTransfer.setDragImage(image, image.offsetWidth / 2, image.offsetHeight / 2);
    };

    imageDivBox.ondragstart = () => {
        if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
        const target = imageDivBox;
        pdfBlockMove = target;
        event.dataTransfer.setDragImage(image, image.offsetWidth / 2, image.offsetHeight / 2);
    };

    imageDivBox.ondragover = () => {
        if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
        if(!pdfBlockMove) return;
        event.preventDefault();
        switch(dragDivLocation(event)) {
            case 0: {
                imageDivBox.setAttribute("dragLoc", 0);
                break;
            }
            case 1: {
                imageDivBox.setAttribute("dragLoc", 1);
                break;
            }
        }
    };

    imageDivBox.ondragleave = () => {
        if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
        if(!pdfBlockMove) return;
        if(imageDivBox.hasAttribute("dragLoc"))
            imageDivBox.removeAttribute("dragLoc");
    };

    imageDivBox.ondrop = () => {
        if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
        if(!pdfBlockMove) return;
        if(imageDivBox.hasAttribute("dragLoc"))
            imageDivBox.removeAttribute("dragLoc");
        const target = pdfBlockMove;
        pdfBlockMove = undefined;
        switch(dragDivLocation(event)) {
            case 0: {
                imageDivBox.insertAdjacentElement("beforebegin", target);
                break;
            }
            case 1: {
                imageDivBox.insertAdjacentElement("afterend", target);
            }
        }
    };

    deleteBtn.onclick = () => {
        if(document.getElementsByClassName("downloadLoadingPage").length > 0) { event.preventDefault(); return false; }
        URL.revokeObjectURL(image.src);
        imageDivBox.remove();
    };

    return imageDivBox;
};

const pdfPageConvertImage = (imageDivBox, reader, page, fileName) => {
    const image = imageDivBox.getElementsByClassName("imageContainer")[0].getElementsByTagName("img")[0];

    const finishCheck = () => {
        if(reader.numImageConverts >= reader.numPages) {
            reader.close();
            console.log(fileName, reader.pdfLoadedTime - Date.now(), "ms");
        }
    };

    let maxPixels = 268435456;
    if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) maxPixels = 3145728;

    reader.getPageImage({
        success(blob) {
            image.src = URL.createObjectURL(blob);
            finishCheck();
        },
        error(e) {
            imageDivBox.remove();
            alert((() => {
                if(document.title.includes("이미지 PDF 변환"))
                    return `알수없는 오류!\n${fileName} ${page}Page`;
                if(document.title.includes("イメージを PDF に変換\n${file.name}"))
                    return `不明なエラーです。\n${fileName} ${page}Page`;
                else
                    return `Unknown error!\n${fileName} ${page}Page`;
            })());
            console.error(e);
            finishCheck();
        },
        scale: 96.0 / 72.0,
        // maxWidth: 1024,
        // maxHeight: 1024,
        maxPixels,
        page,
    });
}

const pdfFileAdd = async file => {
    try {
        const reader = await loadendPdfReader(file);

        const loc = document.getElementsByClassName("imageListBox")[0];
        const plusBtn = document.getElementsByClassName("fileAddBox")[0];

        for(let i = 0; i < reader.numPages; i++) {
            const imageDivBox = createImageBox(`${file.name.substring(0, file.name.lastIndexOf("."))} ${i + 1}`);
            loc.insertBefore(imageDivBox, plusBtn);
            pdfPageConvertImage(imageDivBox, reader, i + 1, file.name);
        }
    }catch(e) {
        console.error(e);
    }

    return true;
};

const loadendPdfReader = file => {
    return new Promise((resolve, reject) => {
        const reader = new PDFReader({
            numWorkers: 3,
            success() {
                resolve(reader);
            },
            error(e) {
                reject(e);
            },
            file,
        });
    });
};

const imageFileAdd = file => {
    if(!file.type.startsWith("image/") || file.type.includes("dds")) return;
    const loc = document.getElementsByClassName("imageListBox")[0];
    const plusBtn = document.getElementsByClassName("fileAddBox")[0];

    const imageDivBox = createImageBox(file.name);
    loc.insertBefore(imageDivBox, plusBtn);

    const image = imageDivBox.getElementsByClassName("imageContainer")[0].getElementsByTagName("img")[0];

    if(file.type == "image/jpeg") {
        image.src = URL.createObjectURL(file);
        return;
    }
    
    jpeg.start(file, {
        success(result) {
            image.src = URL.createObjectURL(result);
        },
        error() {
            alert((() => {
                if(document.title.includes("이미지 PDF 변환"))
                    return `알수없는 오류!\n${file.name}`;
                if(document.title.includes("イメージを PDF に変換\n${file.name}"))
                    return `不明なエラーです。\n${file.name}`;
                else
                    return `Unknown error!\n${file.name}`;
            })());
            imageDivBox.remove();
        }
    });
};

const dragDivLocation = e => {
    return (e.target.offsetWidth / 2 < e.offsetX) ? 1 : 0;
};

const createLoadingPage = (msg) => {
    const box = document.createElement("div");
    box.setAttribute("class", "downloadLoadingPage");

    const message = document.createElement("div");
    message.setAttribute("class", "loadingPageMessage");
    message.innerHTML = msg;

    const progressBar = document.createElement("div");
    progressBar.setAttribute("class", "loadingPageProgressBar");

    box.appendChild(message);
    box.appendChild(progressBar);

    return box;
};