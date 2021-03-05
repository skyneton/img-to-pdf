class JPEG {
    constructor(file, options) {
        if(typeof file === "undefined" || typeof options === "undefined") {
            this.#fail(new Error("옵션값을 입력해주세요"), options);
        }
        if(!(file instanceof File || file instanceof Blob)) {
            this.#fail(new Error("파일은 Blob나 File 형태여야 합니다."), options);
        }

        this.#init(file, options);
    }

    #init(file, options) {
        const temp = new Image();
        temp.onload = () => {
            this.#draw(temp, options);
        };

        temp.src = URL.createObjectURL(file);
    }

    #draw(image, options) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

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

    #fail(err, options) {
        if(options.error) {
            options.error(this, err);
        }else {
            throw err;
        }
    }
}