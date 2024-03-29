class JPEG {
    #worker;
    #WORKER_URL;
    #idx = [];
    #toggle = 1;
    #number = 0;
    
    constructor() {
        if(createImageBitmap && Worker && OffscreenCanvas) {
            this.#WORKER_URL = URL.createObjectURL(new Blob([`(${this.#threadWorker.toString()})()`]));
            this.#worker = new Worker(this.#WORKER_URL);
            this.#worker.addEventListener("message", this.#getThreadMessage(this));
        }
    }

    start(file, options) {
        if(typeof file === "undefined" || typeof options === "undefined") {
            this.#fail(new Error("옵션값을 입력해주세요"), options);
        }
        if(!file instanceof File && !file instanceof Blob) {
            this.#fail(new Error("파일은 Blob나 File 형태여야 합니다."), options);
        }

        if(this.#number > 100 || Object.keys(this.#idx).length > 100) {
            const a = setInterval(() => {
                if(this.#number < 100 && Object.keys(this.#idx).length < 100) {
                    if(!this.#worker || this.#toggle === 1)
                        this.#init(file, options);
                    else {
                        this.#toggle *= -1;
                        const id = this.#idx.length;
                        this.#idx[id] = options;
                        this.#worker.postMessage({file: file, return: id});
                    }
                    clearInterval(a);
                }
            }, 1e3);
        }else {
            if(!this.#worker || this.#toggle === 1)
                this.#init(file, options);
            else {
                this.#toggle *= -1;
                const id = this.#idx.length;
                this.#idx[id] = options;
                this.#worker.postMessage({file: file, return: id});
            }
        }
    }

    #init(file, options) {
        this.#number++;
        this.#toggle *= -1;
        const temp = new Image();
        temp.onload = () => {
            this.#draw(temp, options);
        };

        temp.src = URL.createObjectURL(file);
    }

    #draw(image, options) {
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
        
        const _this = this;
        function done(result) {
            _this.#number--;
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

    #fail(err, options, id) {
        if(id != undefined && id != null) delete this.#idx[id];
        if(options.error) {
            options.error(this, err);
        }else {
            throw err;
        }
    }

    #getThreadMessage = me => e => {
        const packet = e.data,
            options = me.#idx[packet.return];
        if(!options) return;
        switch(packet.type) {
            case "success": {
                if(options.success) {
                    options.success(packet.result);
                    delete me.#idx[packet.return];
                }
                break;
            }
            case "error": {
                me.#fail(packet.result, options, packet.return);
                break;
            }
        }
    };

    #threadWorker = () => {
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
}