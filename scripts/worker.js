const worker_function = () => {
    // importScripts("main.js");
    // importScripts("https://skyneton.github.io/scripts/jspdf.umd.min.js");

    const addImage = (page, src, width, height) => {
        width = width * self.multiple;
        height = height * self.multiple;

        try {
            self.doc.setPage(page);
            if(self.format == "auto") {
                self.doc.setPageWidth(page, width);
                self.doc.setPageHeight(page, height);
                self.doc.addImage(src, "JPEG", 0, 0, width, height);
            }else {
                const persentage = ((self.doc.getPageWidth(page)/width > self.doc.getPageHeight(page)/height) ?
                    self.doc.getPageHeight(page)/height :
                    self.doc.getPageWidth(page)/width);
                const subWidth = (self.doc.getPageWidth(page) - width * persentage)/2;
                const subHeight = (self.doc.getPageHeight(page) - height * persentage)/2;
                self.doc.addImage(src, "JPEG", subWidth, subHeight, self.doc.getPageWidth(page) - subWidth, self.doc.getPageHeight(page) - subHeight);
            }
        }catch(e) { console.log(e); }
    }

    self.addEventListener("message", (data) => {
        const packet = data.data;
        switch(packet.type) {
            case "build": {
                importScripts(packet.url);

                self.doc = new jspdf.jsPDF({
                    orientation: packet.orientation,
                    unit: packet.util,
                    format: packet.format
                });
                self.doc.addFileToVFS("malgun.ttf", packet.font);
                self.doc.addFont("malgun.ttf", "malgun", "normal");
                self.doc.setFont("malgun");

                self.format = packet.format;
                self.compress = packet.compress;
                self.len = packet.len;
                self.now = 0;
                self.name = packet.name;
                self.multiple = (() => {
                    switch(packet.util) {
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
                break;
            }
            case "data": {
                if(packet.page > 1) packet.addPage();
                addImage(packet.page,packet.src,packet.width,packet.height);
                if(++self.now >= self.len) {
                    self.postMessage(URL.createObjectURL(new Blob([self.doc.output()], {type: "application/pdf"})));
                }
                break;
            }
        }
    });
}