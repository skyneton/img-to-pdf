const Compressor = function() {
    let i = 0;
    const jpegURL = URL.createObjectURL(new Blob(["("+jpeg_worker.toString()+")()"], {type: 'text/javascript'}));
    const worker = new Worker(jpegURL);

    this.encode = (a) => {
        if(!a.image) return;
        const imageData = a.image;
        const quality = a.quality || 1;

        const code = ++i;

        const packet = {
            image: imageData,
            quality: Math.floor(quality * 100),
            return: a.return,
            code: code
        }
        worker.postMessage(packet);

        worker.addEventListener("message", message);

        function message(e) {
            if(e.data.code == code) {
                if(a.success) {
                    a.success(e.data);
                }

                worker.removeEventListener("message", message);
            }
        }
    }

    this.stop = () => {
        worker.terminate();
        URL.revokeObjectURL(jpegURL);
    }
}