function PDFBuilder() {
    "use strict";
    if(typeof new.target === "undefined")
        throw new Error("Constructor must be called with new.");

    let currentPage = 0;
    let pageContent = [];
    let defaultData;
    let content = [];
    let offsets = [];
    let objectNumber = 0;
    let rootDirectoryObjId;
    let resourceObjId;
    let contentLength = 0;
    let imageContent = [];

    const initializer = () => {
        let orientation, format, rotate;
        if(arguments.length >= 1) {
            if(typeof arguments[0] == "number") {
                orientation = arguments[0];
                format = arguments[1];
                rotate = arguments[2];
            }else {
                orientation = arguments[0].orientation;
                format = arguments[0].format;
                rotate = arguments[0].rotate;
            }
        }
        const init = getPageInfo(orientation, format);
        defaultData = {
            orientation: init.orientation,
            width: init.width,
            height: init.height,
            format: init.format,
            rotate: rotate
        };

        pageContent[0] = {
            media: {
                width: init.width,
                height: init.height,
                format: init.format,
                rotate: rotate
            }
        };
    };

    const newObjectDeferred = () => {
        objectNumber++;
        offsets[objectNumber - 1] = contentLength;
        return objectNumber;
    };

    const newObjectDeferredBegin = oid => {
        write(`${oid} 0 obj`);
    };

    this.addPage = () => {
        let orientation, format, rotate;
        if(arguments.length > 1) {
            if(typeof arguments[0] == "number") {
                orientation = arguments[0];
                format = arguments[1];
                rotate = arguments[2];
            }else {
                orientation = arguments[0].orientation;
                format = arguments[0].format;
                rotate = arguments[0].rotate;
            }
        }

        currentPage = pageContent.length;

        if(typeof orientation == "undefined" && typeof format == "undefined" && typeof rotate == "undefined") {
            pageContent[currentPage] = {
                media: {
                    width: defaultData.width,
                    height: defaultData.height,
                    format: defaultData.format,
                    rotate: defaultData.rotate
                }
            }
        }else {
            orientation = orientation || defaultData.orientation;
            format = format || defaultData.format;
            rotate = rotate || defaultData.rotate;
            const init = getPageInfo(orientation, format);

            pageContent[currentPage] = {
                media: {
                    width: init.width,
                    height: init.height,
                    format: init.format,
                    rotate: rotate
                }
            };
        }
    };

    this.setPageWidth = function() {
        if(arguments.length == 0) throw new Error("너비를 입력해주세요.");
        let page, width;
        if(arguments.length >= 2) {
            page = arguments[0];
            width = arguments[1];
        }else width = arguments[0];
        page = page | currentPage;
        if(isNaN(page) || isNaN(width)) throw new Error("숫자 형태로 입력해주세요.");
        pageContent[page].media.width = width;
    };

    this.setPageHeight = function() {
        if(arguments.length == 0) throw new Error("너비를 입력해주세요.");
        let page, height;
        if(arguments.length >= 2) {
            page = arguments[0];
            height = arguments[1];
        }else height = arguments[0];
        page = page | currentPage;
        if(isNaN(page) || isNaN(height)) throw new Error("숫자 형태로 입력해주세요.");
        pageContent[page].media.height = height;
    };

    this.getPageWidth = function() {
        let page = arguments[0];
        if(typeof page == "undefined") page = currentPage;
        if(isNaN(page)) throw new Error("숫자를 입력해주세요.");
        if(page < 0 || Math.floor(page) != page) throw new Error("0 이상의 정수여야 합니다.");
        return pageContent[page].media.width;
    };

    this.getPageHeight = function() {
        let page = arguments[0];
        if(typeof page == "undefined") page = currentPage;
        if(isNaN(page)) throw new Error("숫자를 입력해주세요.");
        if(page < 0 || Math.floor(page) != page) throw new Error("0 이상의 정수여야 합니다.");
        return pageContent[page].media.height;
    };

    this.removePage = page => {
        pageContent = pageContent.splice(page, 1);
    };

    this.setPage = page => {
        currentPage = page;
    };

    this.getNumberOfPages = () => {
        return pageContent.length;
    };

    this.getNowPage = () => {
        return currentPage;
    };

    const getPageInfo = (orientation, format) => {
        const pageFormats = {
            a0: [2384, 3370], a1: [1684, 2384], a2: [1191, 1684], a3: [842, 1191], a4: [595, 842], a5: [420, 595], a6: [298, 420], a7: [210, 298], a8: [147, 210], a9: [105, 147], a10: [74, 105],
            b0: [2835, 4008], b1: [2004, 2835], b2: [1417, 2004], b3: [1001, 1417], b4: [709, 1001], b5: [499, 709], b6: [354, 499], b7: [249, 354], b8: [176, 249], b9: [125, 176], b10: [88, 125],
            c0: [2599, 3677], c1: [1837, 2599], c2: [1298, 1837], c3: [918, 1298], c4: [649, 918], c5: [459, 649], c6: [323, 459], c7: [230, 323], c8: [162, 230], c9: [113, 162], c10: [79, 113],
            dl: [312, 624],
            letter: [612, 792],
            "government-letter": [576, 756],
            legal: [612, 1008],
            "junior-legal": [576, 360],
            ledger: [1224, 792],
            tabloid: [792, 1224],
            "credit-card": [153, 243]
        };

        format = (format || "auto").toLowerCase();
        
        let pageHeight, pageWidth;
        if(format == "auto") {
            format = "auto";
        }else if(pageFormats[format.toLowerCase()]) {
            pageWidth = pageFormats[format.toLowerCase()][0];
            pageHeight = pageFormats[format.toLowerCase()][1];
        }else {
            format = "custom";
            pageWidth = format[0];
            pageHeight = format[1];
        }

        orientation = (orientation || "p").toLowerCase();

        if((orientation == "l" || orientation == "landscape") && pageHeight > pageWidth) {
            const tmp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = tmp;
        }else if((orientation == "p" || orientation == "portrait") && pageWidth > pageHeight) {
            const tmp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = tmp;
        }

        return {
            width: pageWidth,
            height: pageHeight,
            format: format,
            orientation: orientation
        };
    };

    const toBlob = () => {
        resetDocument();
        putHeader();
        putPages();
        putResources();
        putCatalog();

        const offsetOfXRef = contentLength;
        putXRef();
        putTrailer();
        write("startxref");
        write(`${offsetOfXRef}`);
        write("%%EOF");

        let size = 0;
        for(let i = 0; i < content.length; i++) {
            size += content[i].length + 1;
        }
        size--;

        const arrayBuffer = new ArrayBuffer(size);
        const uInt = new Uint8Array(arrayBuffer);

        let len = 0;
        for(let i = 0; i < content.length; i++) {
            const tmp = content[i];
            for(let j = 0; j < tmp.length; j++) {
                uInt[len++] = tmp.charCodeAt(j);
            }
            uInt[len++] = 10;
        }

        return new Blob([arrayBuffer], {type: "appliocation/pdf"});
    };

    const putResources = () => {
        const resources = [];
        if(Object.keys(imageContent).length > 0) {
            for(const key in imageContent) {
                const data = imageContent[key];
                const objId = newObjectDeferred();
                newObjectDeferredBegin(objId);
                write("<<");
                write("/Type /XObject");
                write("/Subtype /Image");
                write(`/Width ${data.width}`);
                write(`/Height ${data.height}`);
                write(`/BitsPerComponent ${data.bitsPerComponent}`);
                write(`/ColorSpace /${data.colorSpace}`);
                write("/Filter /DCTDecode");
                write(`/Length ${data.data.length}`);
                write(">>");
                write("stream");
                write(data.data);
                write("endstream");
                write("endobj");
                resources.push(objId);
            }
        }

        newObjectDeferredBegin(resourceObjId);
        write("<<");
        write("/XObject <<");
        for(let i = 0; i < resources.length; i++) {
            write(`/I${i} ${resources[i]} 0 R`);
        }
        write(">>");
        write(">>");
        write("endobj");
    };

    const putTrailer = () => {
        write("trailer");
        write("<<");
        write(`/Size ${objectNumber + 1}`);
        write(`/Root ${objectNumber} 0 R`);
        let fileId = "00000000000000000000000000000000";
        fileId = fileId.split("").map(() => {
            return "ABCDEF0123456789".charAt(Math.floor(Math.random() * 16));
        }).join("");
        write(`/ID [<${fileId}><${fileId}>]`);
        write(">>");
    };

    const putXRef = () => {
        const p = "0000000000";
        write("xref");
        write(`0 ${objectNumber + 1}`);
        write("0000000000 65535 f");
        for(let i = 0; i < objectNumber; i++) {
            const offset = offsets[i];
            write(`${(p + offset).slice(-10)} 00000 n`);
        }
    };

    const putCatalog = () => {
        const tmpRootDictionaryObjId = rootDirectoryObjId;
        newObjectDeferredBegin(newObjectDeferred());
        write("<<");
        write("/Type /Catalog");
        write(`/Pages ${tmpRootDictionaryObjId} 0 R`);
        write(">>");
        write("endobj");
    };

    const putPages = () => {
        let kids = "/Kids [ ";
        for(let i = 0; i < pageContent.length; i++) {
            kids += putPage(pageContent[i], newObjectDeferred(), resourceObjId, newObjectDeferred()) + " 0 R ";
        }
        newObjectDeferredBegin(rootDirectoryObjId);
        write("<<");
        write("/Type /Pages");
        write(kids + "]");
        write(`/Count ${pageContent.length}`);
        write(">>");
        write("endobj");
    };

    const putPage = (data, objId, resourcesObjectId, contentsObjId) => {
        newObjectDeferredBegin(objId);
        write("<<");
        write("/Type /Page");
        write(`/Parent ${rootDirectoryObjId} 0 R`);
        if(typeof data.image != "undefined") {
            write(`/Resources ${resourcesObjectId} 0 R`);
        }
        if(data.media.format != "auto") {
            write(`/MediaBox [0 0 ${data.media.width} ${data.media.height}]`);
        }else if(data.image) {
            let width = data.image[0].width, height = data.image[0].height;
            for(let i = 1; i < data.image.length; i++) {
                if(data.image[i].width > width) width = data.image[i].width;
                if(data.image[i].height > height) height = data.image[i].height;
            }
            write(`/MediaBox [ 0 0 ${width} ${height} ]`);
        }
        if(data.rotate) {
            write(`/Rotate ${data.media.rotate}`);
        }
        write(`/Contents ${contentsObjId} 0 R`);
        write(">>");
        write("endobj");

        newObjectDeferredBegin(contentsObjId);
        if(data.image) {
            write("<<");
            let str = "";
            for(let i = 0; i < data.image.length; i++) {
                if(i != 0) str += "\n";
                str += "q";
                str += "\n" + [data.image[i].width, "0", "0", data.image[i].height, data.image[i].x, data.image[i].y, "cm" ].join(" ");
                str += `\n/I${getImageContentIndex(data.image[i].hash)} Do`;
                str += "\nQ";
            }
            write(`/Length ${str.length}`);
            write(">>");
            write("stream");
            write(str);
            write("endstream");
        }
        write("endobj");

        return objId;
    };

    const resetDocument = () => {
        objectNumber = 0;
        content = [];
        contentLength = 0;
        offsets = [];

        rootDirectoryObjId = newObjectDeferred();
        resourceObjId = newObjectDeferred();
    };

    const putHeader = () => {
        write("%PDF-1.4");
        write("%\xBA\xDF\xAC\xE0");
    };

    const write = function() {
        if(arguments.length == 0) throw new Error("작성 오류");
        const data = arguments.length == 1 ? arguments[0] : arguments.join(" ");
        contentLength += data.length + 1;
        content.push(data);
    };

    this.drawImage = function() {
        let imageData = arguments[0], x, y, w, h;
        if(typeof imageData == "undefined") throw new Error("이미지를 입력해주세요.");
        x = arguments[1] || "0";
        y = arguments[2] || "0";
        w = arguments[3];
        h = arguments[4];

        if(typeof imageData == "object" && "src" in imageData) {
            w = w || imageData.naturalWidth;
            h = h || imageData.naturalHeight;
            imageData = imageData.src;
        }

        if(isNaN(x) || isNaN(y)) throw new Error("x, y는 숫자 형태여야 합니다.");
        if(typeof x != "undefined") x = NumberRound(x, 5);
        if(typeof y != "undefined") y = NumberRound(y, 5);
        if(typeof w != "undefined") w = NumberRound(w, 5);
        if(typeof h != "undefined") h = NumberRound(h, 5);

        return drawImageToPDF(currentPage, imageData, x, y, w, h);
    };

    const drawImageToPDF = (page, imageData, x, y, w, h) => {
        return new Promise(resolve => {
            convertBase64ToBinaryString(imageData).then(base64 => {
                const format = getImageFileTypeByImageData(base64);
                if(this.isImageNotSupported(format)) throw new Error(`${format} 형식은 지원하지 않는 이미지입니다.`);

                const index = getImageHashCode(base64).toString();
                if(imageContent[index] != undefined) {
                    imageContent[index].connection++;
                    if(pageContent[page].image == undefined) {
                        pageContent[page].image = [];
                    }
                    pageContent[page].image.push({
                        hash: index,
                        width: w || imageContent[index].width,
                        height: h || imageContent[index].height,
                        x: x,
                        y: y
                    });

                    resolve("drawing finish");
                    return;
                }

                writeImageToPDF(page, base64, x, y, w, h, index, format);

                resolve("drawing finish");
            });
        });
    };

    const writeImageToPDF = (page, imageData, x, y, width, height, hash, format) => {
        const imageInfo = getImageInfo(imageData, format);
        if("data" in imageInfo) {
            imageData = imageInfo.data;
        }
        // const dims = determineWidthAndHeight(width, height, imageInfo);
        const colorSpace = getColorSpace(imageInfo.numComponents);
        if(typeof colorSpace === "undefined") throw new Error("Color Space를 가져오는데 실패하였습니다.");
        imageContent[hash] = {
            data: imageData,
            width: imageInfo.width,
            height: imageInfo.height,
            colorSpace: colorSpace,
            bitsPerComponent: 8,
            connection: 1
        }

        if(pageContent[page].image == undefined) {
            pageContent[page].image = [];
        }
        pageContent[page].image.push({
            hash: hash,
            x: x,
            y: y,
            width: width || imageInfo.width,
            height: height || imageInfo.height
        });
    };

    const markers = [0xc0, 0xc1, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7];

    const getImageInfo = (imgData, format) => {
        switch(format) {
            case "JPEG": return dataFromJPEG(imgData);
            // case "PNG": return PNGDataManager(imgData);
        }
    };

    const PNGDataManager = imgData => {
        const image = dataFromPNG(imgData);
        image.data = imgData;

        return image;
    };

    const dataFromPNG = imgData => {
        const width = imgData.charCodeAt(18) * 256 + imgData.charCodeAt(19);
        const height = imgData.charCodeAt(22) * 256 + imgData.charCodeAt(23);
        const bits = imgData.charCodeAt(24);
        let numComponents = imgData.charCodeAt(25);
        const hasAlphasChannel = numComponents == 4 || numComponents == 6;
        switch(numComponents) {
            case 0: case 3: case 4:
                numComponents = 1;
                break;
            // case 2: case 6:
            default:
                numComponents = 3;
                break;
        }

        return {
            width: width,
            height: height,
            bits: bits,
            numComponents: numComponents,
            hasAlphasChannel: hasAlphasChannel,
        };
    };

    const dataFromJPEG = imgData => {
        let blockLength = imgData.charCodeAt(4) * 256 + imgData.charCodeAt(5);
        let width, height, numComponents;
        for(let i = 4; i < imgData.length; i+=2) {
            i += blockLength;
            if(markers.indexOf(imgData.charCodeAt(i + 1)) != -1) {
                height = imgData.charCodeAt(i + 5) * 256 + imgData.charCodeAt(i + 6);
                width = imgData.charCodeAt(i + 7) * 256 + imgData.charCodeAt(i + 8);
                numComponents = imgData.charCodeAt(i + 9);
                if(imgData.length > i + 420) {
                    if(height == 1 && height < imgData.charCodeAt(i + 425) * 256 + imgData.charCodeAt(i + 426)) {
                        height = imgData.charCodeAt(i + 425) * 256 + imgData.charCodeAt(i + 426);
                        if(imgData.length > i + 427) {
                            width = imgData.charCodeAt(i + 427) * 256 + imgData.charCodeAt(i + 428);
                        }
                    }
                    if(numComponents == 1 && imgData.length > i + 429 && !(imgData.charCodeAt(i + 429) != 1 && imgData.charCodeAt(i + 429) != 3 && imgData.charCodeAt(i + 429) != 4))
                        numComponents = imgData.charCodeAt(i + 429);
                }
                return { width: width, height: height, numComponents: numComponents };
            }else
                blockLength = imgData.charCodeAt(i + 2) * 256 + imgData.charCodeAt(i + 3);
        }
    };

    this.isImageNotSupported = value => {
        return !getImageFileTypeHeaders()[value];
    };

    const color_spaces = {
        DEVICE_RGB: "DeviceRGB",
        DEVICE_GRAY: "DeviceGray",
        DEVICE_CMYK: "DeviceCMYK",
        CAL_GREY: "CalGray",
        CAL_RGB: "CalRGB",
        LAB: "Lab",
        ICC_BASED: "ICCBased",
        INDEXED: "Indexed",
        PATTERN: "Pattern",
        SEPARATION: "Separation",
        DEVICE_N: "DeviceN"
    };

    const determineWidthAndHeight = (width, height, image) => {
        if(!width && !height) {
            width = -96;
            height = -96;
        }
        if(width < 0)
            width = -image.width * 72 / width;
        if(height < 0)
            height = -image.height * 72 / height;
        if(width === 0)
            width = height * image.width / image.height;
        if(height === 0)
            height = width * image.height / image.width;
        
        return [width, height];
    };

    const getColorSpace = numComponents => {
        let colorSpace;
        switch(numComponents) {
            case 1:
                colorSpace = color_spaces.DEVICE_GRAY;
                break;
            case 3:
                colorSpace = color_spaces.DEVICE_RGB;
                break;
            case 4:
                colorSpace = color_spaces.DEVICE_CMYK;
                break;
        }

        return colorSpace;
    };

    const convertBase64ToBinaryString = async value => {
        if(isBase64(value)) return value.split(",")[1];
        if(typeof value == "object" && "src" in value) value = value.src;
        if(isBlobURL(value)) {
            value = await fetch(value).then(r => r.blob());
        }
        if(isBlob(value) || isFile(value)) {
            value = await value.arrayBuffer();
            value = new Uint8Array(value);
        }if(value instanceof Uint8Array) {
            return arrayToBinaryString(value);
        }
    };

    const arrayToBinaryString = value => {
        let result = "";
        const len = value.byteLength || value.length;
        for(let i = 0; i < len; i++) {
            result += String.fromCharCode(value[i]);
        }

        return result;
    };

    const getImageFileTypeByImageData = imageData => {
        const imageFileTypeHeader = getImageFileTypeHeaders();
        for(const fileType in imageFileTypeHeader) {
            const headerData = imageFileTypeHeader[fileType];
            for(let i = 0; i < headerData.length; i++) {
                let isFindFileType = true;
                for(let j = 0; j < headerData[i].length; j++) {
                    if(headerData[i][j] === undefined) continue;
                    if(headerData[i][j] !== imageData.charCodeAt(j)) {
                        isFindFileType = false;
                        break;
                    }
                }
                if(isFindFileType) return fileType;
            }
        }
        return "UNKNOWN";
    };

    const isFile = value => {
        return value instanceof File;
    };

    const isBlob = value => {
        return value instanceof Blob;
    };

    const isBlobURL = value => {
        return typeof value === "string" && value.startsWith("blob:");
    };

    const isBase64 = value => {
        return typeof value === "string" && value.startsWith("data:image");
    };

    const getImageFileTypeHeaders = () => {
      return {
        PNG: [[0x89, 0x50, 0x4e, 0x47]],
        TIFF: [
            [0x4d, 0x4d, 0x00, 0x2a], //Motorola
            [0x49, 0x49, 0x2a, 0x00] //Intel
        ],
        JPEG: [
            [ 0xff, 0xd8, 0xff, 0xe0, undefined, undefined, 0x4a, 0x46, 0x49, 0x46, 0x00 ], //JFIF
            [ 0xff, 0xd8, 0xff, 0xe1, undefined, undefined, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00 ], //Exif
            [0xff, 0xd8, 0xff, 0xdb], //JPEG RAW
            [0xff, 0xd8, 0xff, 0xee] //EXIF RAW
        ],
        JPEG2000: [[0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50, 0x20, 0x20]],
        GIF87a: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61]],
        GIF89a: [[0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
        WEBP: [[ 0x52, 0x49, 0x46, 0x46, undefined, undefined, undefined, undefined, 0x57, 0x45, 0x42, 0x50 ]],
        BMP: [
            [0x42, 0x4d], //BM - Windows 3.1x, 95, NT, ... etc.
            [0x42, 0x41], //BA - OS/2 struct bitmap array
            [0x43, 0x49], //CI - OS/2 struct color icon
            [0x43, 0x50], //CP - OS/2 const color pointer
            [0x49, 0x43], //IC - OS/2 struct icon
            [0x50, 0x54] //PT - OS/2 pointer
        ]};
    };

    const getImageHashCode = data => {
        let hash = 0;
        for(let i = 0; i < data.length; i++) {
            hash = (hash << 5) - hash + data.charCodeAt(i);
            hash |= 0;
        }

        return hash;
    };

    const getImageContentIndex = key => {
        return Object.keys(imageContent).indexOf(key);
    };

    const NumberRound = (value, num) => {
        return Math.round(value * 10**num)/10**num;
    };

    initializer();
}
