function JPEG() {
    "use strict";
    if(typeof new.target === "undefined")
        throw new Error("Constructor must be called with new.");

    let worker;
    let WORKER_URL;
    const idx = [];
    let number = 0;

    this.start = (file, options) => {
        if(typeof file === "undefined" || typeof options === "undefined") {
            fail(new Error("옵션값을 입력해주세요"), options);
        }
        if(!file instanceof File && !file instanceof Blob) {
            fail(new Error("파일은 Blob나 File 형태여야 합니다."), options);
        }

        if(number > 120 && (!worker || Object.keys(idx).length > 120)) {
            const a = setInterval(() => {
                if(number <= 120 || !worker && Object.keys(idx).length <= 120) {
                    if(!worker || number <= Object.keys(idx).length)
                        init(file, options);
                    else {
                        const id = idx.length;
                        idx[id] = options;
                        worker.postMessage({file: file, return: id});
                    }
                    clearInterval(a);
                }
            }, 1e3);
        }else {
            if(!worker || number <= Object.keys(idx).length)
                init(file, options);
            else {
                const id = idx.length;
                idx[id] = options;
                worker.postMessage({file: file, return: id});
            }
        }
    };

    const init = (file, options) => {
        number++;
        const temp = new Image();
        temp.onload = () => {
            draw(temp, options);
        };
        temp.onerror = () => {
            number--;
            fail(new Error("이미지 로드 실패"), options);
        };

        temp.src = URL.createObjectURL(file);
    };

    const draw = (image, options) => {
        const canvas = document.createElement("canvas"),
            context = canvas.getContext("2d");

        const width = image.naturalWidth;
        const height = image.naturalHeight;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = "white";
        context.fillRect(0, 0, width, height);
        
        context.save();
        context.translate(width/2, height/2);
        context.drawImage(image, -width/2, -height/2, width, height);
        context.restore();

        if(canvas.toBlob)
            canvas.toBlob(done, "image/jpeg");
        else
            done(canvas.toDataURL("image/jpeg"));

        canvas.remove();
        
        function done(result) {
            number--;
            URL.revokeObjectURL(image.src);
            image.remove();
            if(typeof result == "string") {
                result = new Blob(result.split(",")[1], "image/jpeg");
            }

            if(options.success) {
                options.success(result);
            }
        }
    }

    const fail = (err, options, id) => {
        if(id != undefined && id != null) delete idx[id];
        if(options.error) {
            options.error(this, err);
        }else {
            throw err;
        }
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
            getBitMap(packet);
        });

        const getBitMap = packet => {
            createImageBitmap(packet.file).then(canvasDraw(packet)).catch(err => {
                self.postMessage({type: "error", result: err, return: packet.return});
            });
        };

        const canvasDraw = packet => bitmap => {
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height),
                context = canvas.getContext("2d");
    
            const width = bitmap.width, height = bitmap.height;

            context.fillStyle = "white";
            context.fillRect(0, 0, width, height);
    
            context.save();
            context.translate(width/2, height/2);
            context.drawImage(bitmap, -width/2, -height/2, width, height);
            context.restore();

            canvas.convertToBlob({
                type: "image/jpeg"
            }).then(result => {
                self.postMessage({type: "success", result: result, return: packet.return});
            });
        }
    };
    
    if(createImageBitmap && Worker && OffscreenCanvas) {
        WORKER_URL = URL.createObjectURL(new Blob([`(${threadWorker.toString()})()`]));
        worker = new Worker(WORKER_URL);
        worker.addEventListener("message", getThreadMessage);
    }
}