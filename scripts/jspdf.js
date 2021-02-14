class PDFBuilder {
    constructor() {}

    #pagesContext = [];
    #currentPage = 0;

    drawImage() {
        let imageData = arguments[0], format, x, y, w, h;
        if(typeof imageData == "undefined") throw new Error("이미지를 입력해주세요.");
        if(typeof arguments[1] == "number") {
            format = "UNKNOWN";
            x = arguments[1] || "0";
            y = arguments[2] || "0";
            w = arguments[3];
            h = arguments[4];
        }else {
            format = arguments[1];
            x = arguments[2];
            y = arguments[3];
            w = arguments[4];
            h = arguments[5];
        }

        if(typeof imageData == "object" && "imageData" in imageData) {
            const options = imageData;
            imageData = options.imageData;
            format = options.format || format || "UNKNOWN";
            x = options.x || x || "0";
            y = options.y || y || "0";
            w = options.w || options.width || w;
            h = options.h || options.height || h;
        }
        if(typeof imageData == "object" && "src" in imageData) {
            w = w || imageData.naturalWidth;
            h = h || imageData.naturalHeight;
            imageData = imageData.src;
        }
        if(isNaN(x) || isNaN(y)) throw new Error("x, y는 숫자 형태여야 합니다.");
        this.#drawImageToPDF(imageData, format, x, y, w, h);
    }

    #drawImageToPDF(imageData, format, x, y, w, h) {
        this.#convertBase64ToBinaryString(imageData, format).then(base64 => {
            format = this.#getImageFileTypeByImageData(base64, format);
            if(isImageNotSupported(format)) throw new Error(`${format} 형식은 지원하지 않는 이미지입니다.`);
            const result = {
                data: base64,
                format: format,
                width: w,
                height: h,
                startX: x,
                startY: y
            }
            this.#writeImageToPDF(result);
        });
    }

    #getHorizontalCoodinateString(value) {
        return this.#getHorizontalCoordinate(value);
    }

    #getHorizontalCoodinateString(value) {
        return this.#getVerticalCoordinate(value);
    }

    static isImageNotSupported(value) {
        return !this.getImageFileTypeHeaders()[value];
    }

    #writeImageToPDF(json) {
        console.log(json.format);
    }

    async #convertBase64ToBinaryString(value, type) {
        if(this.#isBase64(value)) return value;
        if(typeof value == "object" && "src" in value) value = value.src;
        if(this.#isBlobURL(value)) {
            if(type !== "UNKNOWN")
                value = await fetch(value).then(r => r.blob({type: type}));
            else
                value = await fetch(value).then(r => r.blob());
        }
        if(this.#isBlob(value) || this.#isFile(value)) {
            value = await value.arrayBuffer();
            value = new Uint8Array(value);
        }if(value instanceof Uint8Array) {
            let result = "";
            for(let i = 0; i < value.byteLength; i++) {
                result += String.fromCharCode(value[i]);
            }
            return result;
        }
    }

    #getImageFileTypeByImageData(imageData, format) {
        const imageFileTypeHeader = this.#getImageFileTypeHeaders();
        console.log(imageFileTypeHeader);
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
        if(format != undefined && format !== "UNKNOWN") return format;
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
}