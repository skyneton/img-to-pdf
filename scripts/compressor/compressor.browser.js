function Compressor() {
    "use strict";
    if(typeof new.target === "undefined")
        throw new Error("Constructor must be called with new.");

    let worker;
    let WORKER_URL;
    const idx = [];
    let single = 0;
    
    this.start = (file, options) => {
        if(typeof file === "undefined" || typeof options === "undefined") {
            throw new Error("옵션값을 입력해주세요");
        }
        if(typeof options.quality === "undefined")
            options.quality = 1;
        if(!worker || Object.keys(idx).length >= single)
            init(file, options);
        else {
            const id = idx.length;
            idx[id] = options;
            worker.postMessage({file: file, return: id, options: {
                scale: options.scale,
                quality: options.quality
            }});
        }
    };

    const init = (file, options) => {
        let type, size = {}, url, createURL;
        if(!isType(file)) {
            fail(new Error("첫번째 파라미터는 File/Blob/URL/Base64(Image) 여야 합니다."), options);
            return;
        }

        if(!URL) {
            fail(new Error("지원하지 않는 브라우저입니다."), options);
            return;
        }

        if(options.quality <= 0) {
            fail(new Error("퀄리티는 0 초과의 수여야 합니다."), options);
        }

        if(isBase64(file)) {
            type = file.split(",")[0].split(";")[0].replaceAll("data:", "");
            size.size = atob(file.split(",")[1]).length;
        }if(isBlob(file) || isFile(file)) {
            type = file.type;
            size.size = file.size;
        }
        if(typeof type === "undefined")
            type = "image/jpeg";

        url = file;
        if(isBlob(file) || isFile(file)) {
            url = URL.createObjectURL(file);
            createURL = true;
        }

        if(!size.size) {
            fetch(file).then(r => r.blob()).then(blob => {
                size.size = blob.size;
            });
        }

        single++;
        

        if(options.quality >= 1) {
            if(isBlob(file)) {
                done(file, options, file, type, size, url, createURL);
            }else if(isBase64(file)) {
                done(file, options, new Blob([base64ToUInt(atob(file.split(",")[1]))], type), type, size, url, createURL);
            }else if(isBlobURL(file)) {
                fetch(file).then(r => r.blob()).then(blob => {
                    done(file, options, blob, type, size, url, createURL);
                });
            }
        }else
            load(file, options, type, size, url, createURL);
    };

    const base64ToUInt = data => {
        const arr = new Uint8Array(data.length);
        for(let i = 0; i < data.length; i++) {
            arr[i] = data.charCodeAt(i);
        }

        return arr;
    };

    const load = (file, options, type, size, url, createURL) => {
        const image = new Image();
        image.onload = () => {
            draw(file, options, image, type, size, url, createURL);
        };
        image.onerror = () => {
            single--;
            fail(new Error("이미지 로드 실패"), options);
        };
        image.src = url;
    };

    const draw = (file, options, image, type, size, url, createURL) => {
        const canvas = document.createElement("canvas"),
            context = canvas.getContext("2d"),
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
            canvas.toBlob(d, type, options.quality);
        }else {
            d(canvas.toDataURL(type, options.quality));
        }

        function d(result) {
            done(file, options, result, type, size, url, createURL);
        }
    };

    const done = (file, options, result, type, size, url, createURL) => {
        if(createURL && isBlobURL(url)) URL.revokeObjectURL(url);

        if(result) {
            if(!size.size || result.size > size.size) {
                getBlob(file, type).then(blob => {result = blob});
            }else if(isFile(file)) {
                const date = new Date();
                result.lastModified = date.getTime();
                result.lastModifiedDate = date;
                result.name = file.name;
            }
        }else {
            result = file;
        }
        single--;
        if(options.success) {
            options.success(result);
        }
    };

    const getBlob = (value, type) => {
        return new Promise(resolve => {
            if(isFile(value)) resolve(new Blob(value, {type: type}));
            else if(isBase64(value)) resolve(new Blob([base64ToUInt(atob(value.split(",")[1]))], {type: type}));
            else if(isBlobURL(value)) fetch(value).then(r => r.blob()).then(blob => resolve(blob));
            else resolve(value);
        });
    };

    const fail = (err, options, id) => {
        if(id != undefined && id != null) delete idx[id];
        if(options.error) {
            options.error(this, err);
        }else {
            throw err;
        }
    };

    const isType = value => {
        if(typeof Blob === "undefined") return false;
        return isFile(value) || isBlob(value) || isBlobURL(value) || isBase64(value);
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

    const getThreadMessage = e => {
        const packet = e.data,
            options = idx[packet.return];
        if(!options) return;
        switch(packet.type) {
            case "success": {
                if(options.success) {
                    options.success(packet.result);
                    delete idx[packet.return];
                }
                break;
            }
            case "error": {
                fail(packet.result, options, packet.return);
                break;
            }
        }
    };

    const threadWorker = () => {
        self.addEventListener("message", e => {
            const packet = e.data;
            getBlob(packet.file).then(getBitMap(packet));
        });

        const getBlob = value => {
            return new Promise(resolve => {
                if(typeof value === "string" && value.startsWith("data:image")) resolve(new Blob(value.split(",")[1], {type: file.split(",")[0].split(";")[0].replaceAll("data:", "")}));
                else if(typeof value === "string" && value.startsWith("blob:")) fetch(value).then(r => r.blob()).then(blob => resolve(blob));
                else resolve(value);
            });
        };

        const getBitMap = packet => blob => {
            createImageBitmap(blob).then(canvasDraw(packet, blob)).catch(err => {
                self.postMessage({type: "error", result: err, return: packet.return});
            });
        };

        const canvasDraw = (packet, blob) => bitmap => {

            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height),
                context = canvas.getContext("2d"),
                aspectRatio = packet.options.scale || (packet.options.quality + 0.2 < 0.7 ? 0.7 : Math.min(1, packet.options.quality + 0.2));
    
            let width = bitmap.width, height = bitmap.height;
    
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
            context.drawImage(bitmap, -width/2, -height/2, width, height);
            context.restore();

            canvas.convertToBlob({
                quality: packet.options.quality,
                type: "image/jpeg"
            }).then(result => {
                if(result.size > blob.size) result = blob;
                if(packet.file instanceof File) {
                    const date = new Date();
                    result.lastModified = date.getTime();
                    // result.lastModifiedDate = date;
                    result.name = packet.file.name;
                }

                self.postMessage({type: "success", result: result, return: packet.return});
            });
        }
    };
    
    if(createImageBitmap && Worker && OffscreenCanvas && location.protocol.startsWith("http")) {
        WORKER_URL = URL.createObjectURL(new Blob([`(${threadWorker.toString()})()`]));
        worker = new Worker(WORKER_URL);
        worker.addEventListener("message", getThreadMessage);
    }
}