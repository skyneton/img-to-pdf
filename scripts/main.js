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
    if(event.target.value != "auto")
        document.getElementsByClassName("pdfOptionOrientation")[0].disabled = false;
    else
        document.getElementsByClassName("pdfOptionOrientation")[0].disabled = true;
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

    for(let i = 0; i < document.getElementsByClassName("imageBox").length; i++) {
        const item = document.getElementsByClassName("imageBox")[i];
        const img = item.getElementsByClassName("imageContainer")[0].getElementsByTagName("img")[0];
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
        const width = img.naturalWidth * multiple;
        const height = img.naturalHeight * multiple;
        if(format == "auto") {
            doc.setPageWidth(i + 1, width);
            doc.setPageHeight(i + 1, height);
            doc.addImage(img.src, "JPEG", 0, 0, doc.getPageWidth(i + 1), doc.getPageHeight(i + 1));
        }else {
            const persentage = (() => {
                if(width > doc.getPageWidth(i + 1) || height > doc.getPageHeight(i + 1))
                    return ((doc.getPageWidth(i + 1)/width > doc.getPageHeight(i + 1)/height) ?
                        doc.getPageHeight(i + 1)/height :
                        doc.getPageWidth(i + 1)/width);

                return ((doc.getPageWidth(i + 1)/width > doc.getPageHeight(i + 1)/height) ?
                    doc.getPageHeight(i + 1)/height :
                    doc.getPageWidth(i + 1)/width);
            })();
            const subWidth = (doc.getPageWidth(i + 1) - width * persentage)/2;
            const subHeight = (doc.getPageHeight(i + 1) - height * persentage)/2;
            doc.addImage(img.src, "JPEG", subWidth / 2, subHeight / 2, doc.getPageWidth(i + 1) - subWidth, doc.getPageHeight(i + 1) - subHeight);
        }
        if(i < document.getElementsByClassName("imageBox").length - 1)
            doc.addPage();
    }

    doc.save(`${document.getElementsByClassName("imageBox")[0].getElementsByClassName("imageName")[0].innerText}.pdf`);
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

    const image = document.createElement("img");
    image.src = URL.createObjectURL(file);
    image.setAttribute("draggable", false);
    imageItem.appendChild(image);

    // const reader = new FileReader();
    // reader.onload = () => {
    //     image.src = reader.result;
    // }
    // reader.readAsDataURL(file);

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