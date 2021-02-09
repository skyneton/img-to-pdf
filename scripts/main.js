// import {jsPDF} from "jspdf";
let pdfBlockMove;

const fileDragOverEvent = event => {
    event.stopPropagation();
    event.preventDefault();
}

document.getElementsByClassName("fileAddBox")[0].onclick = () => {
    document.getElementsByClassName("inpFile")[0].click();
}

window.ondragover = () => {
    if(pdfBlockMove) return;
    event.stopPropagation();
    event.preventDefault();
}

window.ondrop = () => {
    event.stopPropagation();
    event.preventDefault();
    const files = (() => {
        if(document.getElementsByClassName("orderByCommandBtn")[0].innerText == "오름차순")
            return [...(event.target.files || event.dataTransfer.files)].sort((a, b) => {
                return ((a.name == b.name) ? 0 :
                    (a.name > b.name) ? 1 : -1);
            });
        return [...(event.target.files || event.dataTransfer.files)].sort((a, b) => {
            return ((a.name == b.name) ? 0 :
                (a.name < b.name) ? 1 : -1);
        });
    })();
    for(let i = 0; i < files.length; i++) {
        imageFileAdd(files[i]);
    }
    pdfBlockMove = undefined;
}

document.getElementsByClassName("inpFile")[0].onchange = () => {
    const files = (() => {
        if(document.getElementsByClassName("orderByCommandBtn")[0].innerText == "오름차순") {
            return [...(event.target.files || event.dataTransfer.files)].sort((a, b) => {
                return ((a.name == b.name) ? 0 :
                    (a.name > b.name) ? 1 : -1);
            });
        }
        return [...(event.target.files || event.dataTransfer.files)].sort((a, b) => {
            return ((a.name == b.name) ? 0 :
                (a.name < b.name) ? 1 : -1);
        });
    })();
    for(let i = 0; i < files.length; i++) {
        imageFileAdd(files[i]);
    }
}

document.getElementsByClassName("orderByCommandBtn")[0].onclick = () => {
    const loc = document.getElementsByClassName("imageListBox")[0];
    const plusBtn = document.getElementsByClassName("fileAddBox")[0];
    const list = [...document.getElementsByClassName("imageBox")];
    (() => {
        if(document.getElementsByClassName("orderByCommandBtn")[0].innerText == "오름차순") {
            return list.sort((a, b) => {
                return ((a.getElementsByClassName("imageName")[0].innerText == b.getElementsByClassName("imageName")[0].innerText) ? 0 :
                    (a.getElementsByClassName("imageName")[0].innerText > b.getElementsByClassName("imageName")[0].innerText) ? 1 : -1);
            });
        }
        return list.sort((a, b) => {
            return ((a.getElementsByClassName("imageName")[0].innerText == b.getElementsByClassName("imageName")[0].innerText) ? 0 :
                (a.getElementsByClassName("imageName")[0].innerText < b.getElementsByClassName("imageName")[0].innerText) ? 1 : -1);
        });
    })().forEach(item => {
        loc.insertBefore(item, plusBtn);
    });
}

document.getElementsByClassName("pdfOptionFormat")[0].onchange = () => {
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
}


document.getElementsByClassName("pdfOptionOrientation")[0].onchange = () => {
    if(document.getElementsByClassName("pdfOptionFormat")[0].value != "auto") {
        document.getElementsByClassName("imageListBox")[0].setAttribute("format", (() => {
            if(event.target.value == "landscape")
                return "b";
            return "a";
        })());
    }
}

document.getElementsByClassName("orderByTypeBtn")[0].onclick = () => {
    if(!document.getElementsByClassName("orderByTypeBtn")[0].time) {
        document.getElementsByClassName("orderByTypeBtn")[0].getElementsByTagName("svg")[0].getElementsByTagName("path")[0].setAttribute("d", "M13.3333 12L7.99992 6.5L2.66659 12L1.33325 10.6667L7.99992 4L14.6666 10.6667L13.3333 12Z");
        document.getElementsByClassName("orderByTypeBtn")[0].setAttribute("active", true);
    }
    document.getElementsByClassName("orderByTypeBtn")[0].time = undefined;
}

document.getElementsByClassName("orderByOptionItem")[0].onclick = () => {
    const temp = document.getElementsByClassName("orderByCommandBtn")[0].innerText;
    document.getElementsByClassName("orderByCommandBtn")[0].innerText = document.getElementsByClassName("orderByOptionItem")[0].innerText;
    document.getElementsByClassName("orderByOptionItem")[0].innerText = temp;
}

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
}

document.getElementsByClassName("clear")[0].onclick = () => {
    while(document.getElementsByClassName("imageBox").length > 0)
        document.getElementsByClassName("imageBox")[0].remove();
}

document.getElementsByClassName("transform")[0].onclick = () => {
    if(document.getElementsByClassName("imageBox").length <= 0) return;

    const orientation = document.getElementsByClassName("pdfOptionOrientation")[0].value;
    const util = document.getElementsByClassName("pdfOptionUtil")[0].value;
    const format = document.getElementsByClassName("pdfOptionFormat")[0].value;
    const doc = new jspdf.jsPDF({
        orientation: orientation,
        unit: util,
    });
    doc.addFileToVFS("malgun.ttf", malgun);
    doc.addFont("malgun.ttf", "malgun", "normal");
    doc.setFont("malgun");

    //https://www.giftofspeed.com/base64-encoder/
    const multiple = (() => {
        switch(util) {
            case "pt":
                return 0.75;
            case "mm":
                return 0.2645833333;
            case "cm":
                return 0.02645833333333;
            case "in":
                return 0.01041666666667;
        }
    })();

    const downloadPage = createLoadingPage("PDF를 생성중입니다.");
    document.body.appendChild(downloadPage);

    setTimeout(() => {
        try {
            for(let i = 0; i < document.getElementsByClassName("imageBox").length; i++) {
                const item = document.getElementsByClassName("imageBox")[i];
                const img = item.getElementsByClassName("imageContainer")[0].getElementsByTagName("img")[0];
                const width = img.naturalWidth * multiple;
                const height = img.naturalHeight * multiple;
                
                let src = img.src;
                if(document.getElementsByClassName("pdfOptionCompress")[0].value != 0)
                    src = imgCompress(image.src);
                if(document.getElementsByClassName("imgCompress")[0].checked && img.compressSrc)
                    src = img.compressSrc;
                
                if(format == "auto") {
                    doc.setPageWidth(i + 1, width);
                    doc.setPageHeight(i + 1, height);
                    doc.addImage(src, "JPEG", 0, 0, doc.getPageWidth(i + 1), doc.getPageHeight(i + 1));
                }else {
                    const persentage = ((doc.getPageWidth(i + 1)/width > doc.getPageHeight(i + 1)/height) ?
                            doc.getPageHeight(i + 1)/height :
                            doc.getPageWidth(i + 1)/width);
                    const subWidth = (doc.getPageWidth(i + 1) - width * persentage)/2;
                    const subHeight = (doc.getPageHeight(i + 1) - height * persentage)/2;
                    doc.addImage(src, "JPEG", subWidth, subHeight, doc.getPageWidth(i + 1) - subWidth, doc.getPageHeight(i + 1) - subHeight);
                }
                if(i < document.getElementsByClassName("imageBox").length - 1)
                    doc.addPage();
            }

            doc.save(`${document.getElementsByClassName("imageBox")[0].getElementsByClassName("imageName")[0].innerText}.pdf`);
        }catch {}
        downloadPage.remove();
    });
}

const imageFileAdd = file => {
    if(!file.type.startsWith("image/") || file.type.includes("svg")) return;
    const imageDivBox = document.createElement("div");
    imageDivBox.setAttribute("class", "imageBox");
    imageDivBox.setAttribute("draggable", true);
    const loc = document.getElementsByClassName("imageListBox")[0];
    const plusBtn = document.getElementsByClassName("fileAddBox")[0];
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
    let checked = false;
    image.src = URL.createObjectURL(file);
    image.setAttribute("draggable", false);

    canvas.appendChild(image);
    imageItem.appendChild(canvas);

    const fileName = document.createElement("div");
    fileName.setAttribute("class", "imageName");
    fileName.setAttribute("draggable", false);
    fileName.innerText = file.name;
    imageDivBox.appendChild(fileName);

    loc.insertBefore(imageDivBox, plusBtn);

    imageDivBox.ondragstart = () => {
        const target = event.target;
        pdfBlockMove = target;
        event.dataTransfer.setDragImage(target, target.offsetWidth / 2, target.offsetHeight / 2);
    }

    imageDivBox.ondragover = () => {
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
    }

    imageDivBox.ondragleave = () => {
        if(!pdfBlockMove) return;
        if(imageDivBox.hasAttribute("dragLoc"))
            imageDivBox.removeAttribute("dragLoc");
    }

    imageDivBox.ondrop = () => {
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
    }

    deleteBtn.onclick = () => {
        imageDivBox.remove();
    }
}

const dragDivLocation = e => {
    return (e.target.offsetWidth / 2 < e.offsetX) ? 1 : 0;
}

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

const imgCompress = image => {
    let result = image.src;
    if(!!document.createElement("canvas").getContext && !checked) {
        checked = true;
        setTimeout(() => {
            try {
                const canvas = document.createElement("canvas");
                const width = image.naturalWidth * 0.7;
                const height = image.naturalHeight * 0.7;
                canvas.width = width;
                canvas.height = height;
                canvas.getContext("2d").drawImage(image, 0, 0, width, height);
                const dataUrl = canvas.toDataURL("image/jpeg", (() => {
                    switch(document.getElementsByClassName("pdfOptionCompress")[0].value) {
                        case 1: return 0.9;
                        case 2: return 0.75;
                        case 3: return 0.6;
                        default: return 1;
                    }
                })());
                result = URL.createObjectURL(dataURLToBlob(dataUrl));
            }catch(e) { }
        });
    }
    return result;
}