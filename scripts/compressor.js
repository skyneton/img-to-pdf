class Compressor {

    constructor(file, options) {
        if(typeof file === "undefined" || typeof options === "undefined") {
            throw new Error("옵션값을 입력해주세요");
        }
        this.image = new Image();
        this.file = file;
        if(typeof options.quality === "undefined")
            options.quality = 1;
        this.options = options;
        this.#init();
    }

    #init = () => {
        if(!this.#isType(this.file)) {
            this.#fail(new Error("첫번째 파라미터는 File/Blob/URL/Base64(Image) 여야 합니다."));
            return;
        }

        if(!URL) {
            this.#fail(new Error("지원하지 않는 브라우저입니다."));
            return;
        }

        if(this.options.quality <= 0) {
            this.#fail(new Error("퀄리티는 0 초과의 수여야 합니다."));
        }

        if(this.#isBase64(this.file)) {
            this.type = this.file.split(",")[0].split(";")[0].replaceAll("data:", "");
            this.size = this.file.split(",")[1].length;
        }if(this.#isBlob(this.file) || this.#isFile(this.file)) {
            this.type = this.file.type;
            this.size = this.file.size;
        }
        if(typeof this.type === "undefined")
            this.type = "image/jpeg";

        this.url = this.file;
        if(this.#isBlob(this.file) || this.#isFile(this.file)) {
            this.url = URL.createObjectURL(this.file);
            this.createURL = true;
        }

        if(!this.size) {
            fetch(this.file).then(r => r.blob()).then(blob => {
                this.size = blob.size;
            });
        }
        

        if(this.options.quality >= 1) {
            if(this.#isBlob(this.file)) {
                this.#done(this.file);
            }else if(this.#isBase64(this.file)) {
                this.#done(new Blob([this.file.split(",")[1]], this.type));
            }else if(this.#isBlobURL(this.file)) {
                fetch(this.file).then(r => r.blob()).then(blob => {
                    this.#done(blob);
                });
            }
        }else
            this.#load();
    }

    #load() {
        const image = this.image;
        image.onload = () => {
            this.#draw();
        }
        image.onerror = () => {
            this.#fail(new Error("이미지 로드 실패"));
        }
        image.src = this.url;
    }

    #draw() {
        const image = this.image,
            canvas = document.createElement("canvas"),
            context = canvas.getContext("2d"),
            options = this.options,
            aspectRatio = options.scale || (options.quality + 0.2 < 0.7 ? 0.7 : Math.min(1, options.quality + 0.2));

        let width = image.naturalWidth, height = image.naturalHeight;

        if(aspectRatio >= 1) {
            width = Math.floor(width / aspectRatio);
            height = Math.floor(height / aspectRatio);
        }else {
            width = Math.floor(width * aspectRatio);
            height = Math.floor(height * aspectRatio);
        }

        canvas.width = width;
        canvas.height = height;

        const fillStyle = "transparent";
        context.fillStyle = fillStyle;
        context.fillRect(0, 0, width, height);

        context.save();
        context.translate(width/2, height/2);
        context.drawImage(image, -width/2, -height/2, width, height);
        context.restore();

        if(canvas.toBlob) {
            canvas.toBlob(done, this.type, options.quality);
        }else {
            this.#done(canvas.toDataURL(this.type, options.quality));
        }

        const _this = this;
        function done(result) {
            _this.#done(result);
        }
    }

    #done(result) {
        const image = this.image;
        const options = this.options, file = this.file;
        if(this.createURL && this.#isBlobURL(image.src)) URL.revokeObjectURL(image.src);

        if(result) {
            if(!this.size || result.size > this.size) {
                (async () => {
                    result = await this.#getBlob(result);
                })();
            }else if(this.#isFile(file)) {
                const date = new Date();
                result.lastModified = date.getTime();
                result.lastModifiedDate = date;
                result.name = file.name;
            }
        }else {
            result = file;
        }
        if(options.success) {
            options.success(result);
        }
    }

    #getBlob(value) {
        return new Promise(resolve => {
            if(this.#isFile(value)) resolve(new Blob(value, {type: this.type}));
            else if(this.#isBase64(value)) resolve(new Blob(value.split(",")[1], {type: this.type}));
            else if(this.#isBlobURL(value)) fetch(value).then(r => r.blob()).then(blob => resolve(blob));
            else resolve(value);
        });
    }

    #fail(err) {
        const options = this.options;
        if(options.error) {
            options.error(this, err);
        }else {
            throw err;
        }
    }

    #isType(value) {
        if(typeof Blob === "undefined") return false;
        return this.#isFile(value) || this.#isBlob(value) || this.#isBlobURL(value) || this.#isBase64(value);
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
}