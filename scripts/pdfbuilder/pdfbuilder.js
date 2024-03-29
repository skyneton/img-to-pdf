class PDFBuilder {
    #currentPage = 0;
    #pageContent = [];
    #defaultData;
    #content = [];
    #offsets = [];
    #objectNumber = 0;
    #rootDirectoryObjId;
    #resourceObjId;
    #contentLength = 0;
    #imageContent = [];

    constructor() {
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
        const init = this.#getPageInfo(orientation, format);
        this.#defaultData = {
            orientation: init.orientation,
            width: init.width,
            height: init.height,
            format: init.format,
            rotate: rotate
        };

        this.#pageContent[0] = {
            media: {
                width: init.width,
                height: init.height,
                format: init.format,
                rotate: rotate
            }
        };
    }

    #newObjectDeferred() {
        this.#objectNumber++;
        this.#offsets[this.#objectNumber - 1] = this.#contentLength;
        return this.#objectNumber;
    }

    #newObjectDeferredBegin(oid) {
        this.#write(`${oid} 0 obj`);
    }

    addPage() {
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

        this.#currentPage = this.#pageContent.length;

        if(typeof orientation == "undefined" && typeof format == "undefined" && typeof rotate == "undefined") {
            this.#pageContent[this.#currentPage] = {
                media: {
                    width: this.#defaultData.width,
                    height: this.#defaultData.height,
                    format: this.#defaultData.format,
                    rotate: this.#defaultData.rotate
                }
            }
        }else {
            orientation = orientation || this.#defaultData.orientation;
            format = format || this.#defaultData.format;
            rotate = rotate || this.#defaultData.rotate;
            const init = this.#getPageInfo(orientation, format);

            this.#pageContent[this.#currentPage] = {
                media: {
                    width: init.width,
                    height: init.height,
                    format: init.format,
                    rotate: rotate
                }
            };
        }
    }

    setPageWidth() {
        if(arguments.length == 0) throw new Error("너비를 입력해주세요.");
        let page, width;
        if(arguments.length >= 2) {
            page = arguments[0];
            width = arguments[1];
        }else width = arguments[0];
        page = page | this.#currentPage;
        if(isNaN(page) || isNaN(width)) throw new Error("숫자 형태로 입력해주세요.");
        this.#pageContent[page].media.width = width;
    }

    setPageHeight() {
        if(arguments.length == 0) throw new Error("너비를 입력해주세요.");
        let page, height;
        if(arguments.length >= 2) {
            page = arguments[0];
            height = arguments[1];
        }else height = arguments[0];
        page = page | this.#currentPage;
        if(isNaN(page) || isNaN(height)) throw new Error("숫자 형태로 입력해주세요.");
        this.#pageContent[page].media.height = height;
    }

    getPageWidth() {
        let page = arguments[0];
        if(typeof page == "undefined") page = this.#currentPage;
        if(isNaN(page)) throw new Error("숫자를 입력해주세요.");
        if(page < 0 || Math.floor(page) != page) throw new Error("0 이상의 정수여야 합니다.");
        return this.#pageContent[page].media.width;
    }

    getPageHeight() {
        let page = arguments[0];
        if(typeof page == "undefined") page = this.#currentPage;
        if(isNaN(page)) throw new Error("숫자를 입력해주세요.");
        if(page < 0 || Math.floor(page) != page) throw new Error("0 이상의 정수여야 합니다.");
        return this.#pageContent[page].media.height;
    }

    removePage(page) {
        this.#pageContent = this.#pageContent.splice(page, 1);
    }

    setPage(page) {
        this.#currentPage = page;
    }

    getNumberOfPages() {
        return this.#pageContent.length;
    }

    getNowPage() {
        return this.#currentPage;
    }

    #getPageInfo(orientation, format) {
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
    }

    toBlob() {
        this.#resetDocument();
        this.#putHeader();
        this.#putPages();
        this.#putResources();
        this.#putCatalog();

        const offsetOfXRef = this.#contentLength;
        this.#putXRef();
        this.#putTrailer();
        this.#write("startxref");
        this.#write(`${offsetOfXRef}`);
        this.#write("%%EOF");

        let size = 0;
        for(let i = 0; i < this.#content.length; i++) {
            size += this.#content[i].length + 1;
        }
        size--;

        const arrayBuffer = new ArrayBuffer(size);
        const uInt = new Uint8Array(arrayBuffer);

        let len = 0;
        for(let i = 0; i < this.#content.length; i++) {
            const tmp = this.#content[i];
            for(let j = 0; j < tmp.length; j++) {
                uInt[len++] = tmp.charCodeAt(j);
            }
            uInt[len++] = 10;
        }

        return new Blob([arrayBuffer], {type: "appliocation/pdf"});
    }

    #putResources() {
        const resources = [];
        if(Object.keys(this.#imageContent).length > 0) {
            for(const key in this.#imageContent) {
                const data = this.#imageContent[key];
                const objId = this.#newObjectDeferred();
                this.#newObjectDeferredBegin(objId);
                this.#write("<<");
                this.#write("/Type /XObject");
                this.#write("/Subtype /Image");
                this.#write(`/Width ${data.width}`);
                this.#write(`/Height ${data.height}`);
                this.#write(`/BitsPerComponent ${data.bitsPerComponent}`);
                this.#write(`/ColorSpace /${data.colorSpace}`);
                this.#write("/Filter /DCTDecode");
                this.#write(`/Length ${data.data.length}`);
                this.#write(">>");
                this.#write("stream");
                this.#write(data.data);
                this.#write("endstream");
                this.#write("endobj");
                resources.push(objId);
            }
        }

        this.#newObjectDeferredBegin(this.#resourceObjId);
        this.#write("<<");
        this.#write("/XObject <<");
        for(let i = 0; i < resources.length; i++) {
            this.#write(`/I${i} ${resources[i]} 0 R`);
        }
        this.#write(">>");
        this.#write(">>");
        this.#write("endobj");
    }

    #putTrailer() {
        this.#write("trailer");
        this.#write("<<");
        this.#write(`/Size ${this.#objectNumber + 1}`);
        this.#write(`/Root ${this.#objectNumber} 0 R`);
        let fileId = "00000000000000000000000000000000";
        fileId = fileId.split("").map(() => {
            return "ABCDEF0123456789".charAt(Math.floor(Math.random() * 16));
        }).join("");
        this.#write(`/ID [<${fileId}><${fileId}>]`);
        this.#write(">>");
    }

    #putXRef() {
        const p = "0000000000";
        this.#write("xref");
        this.#write(`0 ${this.#objectNumber + 1}`);
        this.#write("0000000000 65535 f");
        for(let i = 0; i < this.#objectNumber; i++) {
            const offset = this.#offsets[i];
            this.#write(`${(p + offset).slice(-10)} 00000 n`);
        }
    }

    #putCatalog() {
        const tmpRootDictionaryObjId = this.#rootDirectoryObjId;
        this.#newObjectDeferredBegin(this.#newObjectDeferred());
        this.#write("<<");
        this.#write("/Type /Catalog");
        this.#write(`/Pages ${tmpRootDictionaryObjId} 0 R`);
        this.#write(">>");
        this.#write("endobj");
    }

    #putPages() {
        let kids = "/Kids [ ";
        for(let i = 0; i < this.#pageContent.length; i++) {
            kids += this.#putPage(this.#pageContent[i], this.#newObjectDeferred(), this.#resourceObjId, this.#newObjectDeferred()) + " 0 R ";
        }
        this.#newObjectDeferredBegin(this.#rootDirectoryObjId);
        this.#write("<<");
        this.#write("/Type /Pages");
        this.#write(kids + "]");
        this.#write(`/Count ${this.#pageContent.length}`);
        this.#write(">>");
        this.#write("endobj");
    }

    #putPage(data, objId, resourcesObjectId, contentsObjId) {
        this.#newObjectDeferredBegin(objId);
        this.#write("<<");
        this.#write("/Type /Page");
        this.#write(`/Parent ${this.#rootDirectoryObjId} 0 R`);
        if(typeof data.image != "undefined") {
            this.#write(`/Resources ${resourcesObjectId} 0 R`);
        }
        if(data.media.format != "auto") {
            this.#write(`/MediaBox [0 0 ${data.media.width} ${data.media.height}]`);
        }else if(data.image) {
            let width = data.image[0].width, height = data.image[0].height;
            for(let i = 1; i < data.image.length; i++) {
                if(data.image[i].width > width) width = data.image[i].width;
                if(data.image[i].height > height) height = data.image[i].height;
            }
            this.#write(`/MediaBox [ 0 0 ${width} ${height} ]`);
        }
        if(data.rotate) {
            this.#write(`/Rotate ${data.media.rotate}`);
        }
        this.#write(`/Contents ${contentsObjId} 0 R`);
        this.#write(">>");
        this.#write("endobj");

        this.#newObjectDeferredBegin(contentsObjId);
        if(data.image) {
            this.#write("<<");
            let str = "";
            for(let i = 0; i < data.image.length; i++) {
                if(i != 0) str += "\n";
                str += "q";
                str += "\n" + [data.image[i].width, "0", "0", data.image[i].height, data.image[i].x, data.image[i].y, "cm" ].join(" ");
                str += `\n/I${this.#getImageContentIndex(data.image[i].hash)} Do`;
                str += "\nQ";
            }
            this.#write(`/Length ${str.length}`);
            this.#write(">>");
            this.#write("stream");
            this.#write(str);
            this.#write("endstream");
        }
        this.#write("endobj");

        return objId;
    }

    #resetDocument() {
        this.#objectNumber = 0;
        this.#content = [];
        this.#contentLength = 0;
        this.#offsets = [];

        this.#rootDirectoryObjId = this.#newObjectDeferred();
        this.#resourceObjId = this.#newObjectDeferred();
    }

    #putHeader() {
        this.#write("%PDF-1.4");
        this.#write("%\xBA\xDF\xAC\xE0");
    }

    #write() {
        if(arguments.length == 0) throw new Error("작성 오류");
        const data = arguments.length == 1 ? arguments[0] : arguments.join(" ");
        this.#contentLength += data.length + 1;
        this.#content.push(data);
    }

    drawImage() {
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
        if(typeof x != "undefined") x = this.#NumberRound(x, 5);
        if(typeof y != "undefined") y = this.#NumberRound(y, 5);
        if(typeof w != "undefined") w = this.#NumberRound(w, 5);
        if(typeof h != "undefined") h = this.#NumberRound(h, 5);

        return this.#drawImageToPDF(this.#currentPage, imageData, x, y, w, h);
    }

    #drawImageToPDF(page, imageData, x, y, w, h) {
        return new Promise(resolve => {
            this.#convertBase64ToBinaryString(imageData).then(base64 => {
                const format = this.#getImageFileTypeByImageData(base64);
                if(this.isImageNotSupported(format)) throw new Error(`${format} 형식은 지원하지 않는 이미지입니다.`);

                const index = this.#getImageHashCode(base64).toString();
                if(this.#imageContent[index] != undefined) {
                    this.#imageContent[index].connection++;
                    if(this.#pageContent[page].image == undefined) {
                        this.#pageContent[page].image = [];
                    }
                    this.#pageContent[page].image.push({
                        hash: index,
                        width: w || this.#imageContent[index].width,
                        height: h || this.#imageContent[index].height,
                        x: x,
                        y: y
                    });

                    resolve("drawing finish");
                    return;
                }

                this.#writeImageToPDF(page, base64, x, y, w, h, index, format);

                resolve("drawing finish");
            });
        });
    }

    #writeImageToPDF(page, imageData, x, y, width, height, hash, format) {
        const imageInfo = this.#getImageInfo(imageData, format);
        if("data" in imageInfo) {
            imageData = imageInfo.data;
        }
        // const dims = this.#determineWidthAndHeight(width, height, imageInfo);
        const colorSpace = this.#getColorSpace(imageInfo.numComponents);
        if(typeof colorSpace === "undefined") throw new Error("Color Space를 가져오는데 실패하였습니다.");
        this.#imageContent[hash] = {
            data: imageData,
            width: imageInfo.width,
            height: imageInfo.height,
            colorSpace: colorSpace,
            bitsPerComponent: 8,
            connection: 1
        }

        if(this.#pageContent[page].image == undefined) {
            this.#pageContent[page].image = [];
        }
        this.#pageContent[page].image.push({
            hash: hash,
            x: x,
            y: y,
            width: width || imageInfo.width,
            height: height || imageInfo.height
        });
    }

    #markers = [0xc0, 0xc1, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7];

    #getImageInfo(imgData, format) {
        switch(format) {
            case "JPEG": return this.#dataFromJPEG(imgData);
            // case "PNG": return this.#PNGDataManager(imgData);
        }
    }

    #PNGDataManager(imgData) {
        const image = this.#dataFromPNG(imgData);
        image.data = imgData;

        return image;
    }

    #dataFromPNG(imgData) {
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
    }

    #dataFromJPEG(imgData) {
        let blockLength = imgData.charCodeAt(4) * 256 + imgData.charCodeAt(5);
        let width, height, numComponents;
        for(let i = 4; i < imgData.length; i+=2) {
            i += blockLength;
            if(this.#markers.indexOf(imgData.charCodeAt(i + 1)) != -1) {
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
    }

    isImageNotSupported(value) {
        return !this.#getImageFileTypeHeaders()[value];
    }

    #color_spaces = {
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

    #determineWidthAndHeight(width, height, image) {
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
    }

    #getColorSpace(numComponents) {
        let colorSpace;
        switch(numComponents) {
            case 1:
                colorSpace = this.#color_spaces.DEVICE_GRAY;
                break;
            case 3:
                colorSpace = this.#color_spaces.DEVICE_RGB;
                break;
            case 4:
                colorSpace = this.#color_spaces.DEVICE_CMYK;
                break;
        }

        return colorSpace;
    }

    async #convertBase64ToBinaryString(value) {
        if(this.#isBase64(value)) return value.split(",")[1];
        if(typeof value == "object" && "src" in value) value = value.src;
        if(this.#isBlobURL(value)) {
            value = await fetch(value).then(r => r.blob());
        }
        if(this.#isBlob(value) || this.#isFile(value)) {
            value = await value.arrayBuffer();
            value = new Uint8Array(value);
        }if(value instanceof Uint8Array) {
            return this.#arrayToBinaryString(value);
        }
    }

    #arrayToBinaryString(value) {
        let result = "";
        const len = value.byteLength || value.length;
        for(let i = 0; i < len; i++) {
            result += String.fromCharCode(value[i]);
        }

        return result;
    }

    #getImageFileTypeByImageData(imageData) {
        const imageFileTypeHeader = this.#getImageFileTypeHeaders();
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
    }

    #isFile(value) {
        return value instanceof File;
    }

    #isBlob(value) {
        return value instanceof Blob;
    }

    #isBlobURL(value) {
        return typeof value === "string" && value.startsWith("blob:");
    }

    #isBase64(value) {
        return typeof value === "string" && value.startsWith("data:image");
    }

    #getImageFileTypeHeaders() {
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
    }

    #getImageHashCode(data) {
        let hash = 0;
        for(let i = 0; i < data.length; i++) {
            hash = (hash << 5) - hash + data.charCodeAt(i);
            hash |= 0;
        }

        return hash;
    }

    #getImageContentIndex(key) {
        return Object.keys(this.#imageContent).indexOf(key);
    }

    #NumberRound(value, num) {
        return Math.round(value * 10**num)/10**num;
    }
}
