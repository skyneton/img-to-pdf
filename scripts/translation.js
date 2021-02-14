const lang = {
    ko: {
        title: "이미지 PDF 변환",
        description: "이미지를 PDF로 변환합니다. 드래그 앤 드롭을 통해 이미지를 추가할 수 있습니다. 정렬: 이미지의 이름을 통해 정렬합니다. 압축: 변환된 PDF 사이즈를 줄입니다.",
        topbarTopMenu: ["초기화", "변환하기"],
        orderByBox: ["오름차순", "내림차순"],
        pdfOptionCompress: {
            title: "압축",
            child: ["무손실", "저손실", "손실", "고손실"],
        },
        pdfOptionFormat: {
            title: "페이지",
            child: ["문자", "자동"],
        },
        pdfOptionOpientation: ["가로", "세로"],
        pdfOptionUtil: ["인치"],
        imageListBox: ["파일추가<br>(혹은 드래그 드롭)"]
    },
    jp: {
        title: "イメージを PDF に変換",
        description: "画像をPDFに変換します。 ドラッグ&ドロップで画像を追加できます。 並べ替え:画像の名前を通して並べ替えます。 圧縮:変換されたPDF サイズを小さくします。",
        topbarTopMenu: ["しょきか", "へんかん"],
        orderByBox: ["しょうじゅん", "こうじゅん"],
        pdfOptionCompress: {
            title: "あっしゅく",
            child: ["しないこと", "じゃっかん", "ふつう", "たくさん"],
        },
        pdfOptionFormat: {
            title: "ペイジ",
            child: ["もじ", "じどう"],
        },
        pdfOptionOpientation: ["横向き", "たて"],
        pdfOptionUtil: ["inch"],
        imageListBox: ["ファイル追加<br>(あるいはドラッグアンドドロップ)"]
    },
    en: {
        title: "Image to PDF",
        description: "Convert the image to PDF. You can add images through drag and drop. Sort — Sorts through the name of the image. Compression: Reduce the converted PDF size.",
        topbarTopMenu: ["Clear", "Convert"],
        orderByBox: ["Ascending", "Descending"],
        pdfOptionCompress: {
            title: "Compress",
            child: ["Not", "Low", "Middle", "High"],
        },
        pdfOptionFormat: {
            title: "page",
            child: ["Text", "Auto"],
        },
        pdfOptionOpientation: ["Landscape", "Portrait"],
        pdfOptionUtil: ["inch"],
        imageListBox: ["File Add<br>(or Drag and Drop)"]
    },
};

const languageSetting = () => {
    const userLang = navigator.language || navigator.userLanguage;
    switch(userLang) {
        case "ko": case "ko-KR": {
            const topbarTopMenu = document.querySelectorAll(".topbarTopMenu [data-lang]");
            for(const i in topbarTopMenu) {
                topbarTopMenu[i].innerText = lang.ko.topbarTopMenu[i];
            }

            const orderByBox = document.querySelectorAll(".orderByBox [data-lang]");
            for(const i in orderByBox) {
                orderByBox[i].innerText = lang.ko.orderByBox[i];
            }

            const pdfOptionCompress = document.querySelectorAll(".pdfOptionCompress [data-lang]");
            document.getElementsByClassName("pdfOptionCompress")[0].setAttribute("title", lang.ko.pdfOptionCompress.title);
            for(const i in pdfOptionCompress) {
                pdfOptionCompress[i].innerText = lang.ko.pdfOptionCompress.child[i];
            }

            const pdfOptionFormat = document.querySelectorAll(".pdfOptionFormat [data-lang]");
            document.getElementsByClassName("pdfOptionFormat")[0].setAttribute("title", lang.ko.pdfOptionFormat.title);
            for(const i in pdfOptionFormat) {
                pdfOptionFormat[i].innerText = lang.ko.pdfOptionFormat.child[i];
            }

            const pdfOptionOrientation = document.querySelectorAll(".pdfOptionOrientation [data-lang]");
            for(const i in pdfOptionOrientation) {
                pdfOptionOrientation[i].innerText = lang.ko.pdfOptionOpientation[i];
            }

            const pdfOptionUtil = document.querySelectorAll(".pdfOptionUtil [data-lang]");
            for(const i in pdfOptionUtil) {
                pdfOptionUtil[i].innerText = lang.ko.pdfOptionUtil[i];
            }

            const imageListBox = document.querySelectorAll(".imageListBox [data-lang]");
            for(const i in imageListBox) {
                imageListBox[i].innerHTML = lang.ko.imageListBox[i];
            }
            document.title = lang.ko.title;
            document.head.querySelector("meta[name=\"og:title\"]").setAttribute("content", lang.ko.title);
            document.head.querySelector("meta[name=\"og:description\"]").setAttribute("content", lang.ko.description);
            break;
        }
        case "ja": case "ja-JP": {
            const topbarTopMenu = document.querySelectorAll(".topbarTopMenu [data-lang]");
            for(const i in topbarTopMenu) {
                topbarTopMenu[i].innerText = lang.jp.topbarTopMenu[i];
            }

            const orderByBox = document.querySelectorAll(".orderByBox [data-lang]");
            for(const i in orderByBox) {
                orderByBox[i].innerText = lang.jp.orderByBox[i];
            }

            const pdfOptionCompress = document.querySelectorAll(".pdfOptionCompress [data-lang]");
            document.getElementsByClassName("pdfOptionCompress")[0].setAttribute("title", lang.jp.pdfOptionCompress.title);
            for(const i in pdfOptionCompress) {
                pdfOptionCompress[i].innerText = lang.jp.pdfOptionCompress.child[i];
            }

            const pdfOptionFormat = document.querySelectorAll(".pdfOptionFormat [data-lang]");
            document.getElementsByClassName("pdfOptionFormat")[0].setAttribute("title", lang.jp.pdfOptionFormat.title);
            for(const i in pdfOptionFormat) {
                pdfOptionFormat[i].innerText = lang.jp.pdfOptionFormat.child[i];
            }

            const pdfOptionOrientation = document.querySelectorAll(".pdfOptionOrientation [data-lang]");
            for(const i in pdfOptionOrientation) {
                pdfOptionOrientation[i].innerText = lang.jp.pdfOptionOpientation[i];
            }

            const pdfOptionUtil = document.querySelectorAll(".pdfOptionUtil [data-lang]");
            for(const i in pdfOptionUtil) {
                pdfOptionUtil[i].innerText = lang.jp.pdfOptionUtil[i];
            }

            const imageListBox = document.querySelectorAll(".imageListBox [data-lang]");
            for(const i in imageListBox) {
                imageListBox[i].innerHTML = lang.jp.imageListBox[i];
            }
            document.title = lang.jp.title;
            document.head.querySelector("meta[name=\"og:title\"]").setAttribute("content", lang.jp.title);
            document.head.querySelector("meta[name=\"og:description\"]").setAttribute("content", lang.jp.description);
            break;
        }
        default: {
            const topbarTopMenu = document.querySelectorAll(".topbarTopMenu [data-lang]");
            for(const i in topbarTopMenu) {
                topbarTopMenu[i].innerText = lang.en.topbarTopMenu[i];
            }

            const orderByBox = document.querySelectorAll(".orderByBox [data-lang]");
            for(const i in orderByBox) {
                orderByBox[i].innerText = lang.en.orderByBox[i];
            }

            const pdfOptionCompress = document.querySelectorAll(".pdfOptionCompress [data-lang]");
            document.getElementsByClassName("pdfOptionCompress")[0].setAttribute("title", lang.en.pdfOptionCompress.title);
            for(const i in pdfOptionCompress) {
                pdfOptionCompress[i].innerText = lang.en.pdfOptionCompress.child[i];
            }

            const pdfOptionFormat = document.querySelectorAll(".pdfOptionFormat [data-lang]");
            document.getElementsByClassName("pdfOptionFormat")[0].setAttribute("title", lang.en.pdfOptionFormat.title);
            for(const i in pdfOptionFormat) {
                pdfOptionFormat[i].innerText = lang.en.pdfOptionFormat.child[i];
            }

            const pdfOptionOrientation = document.querySelectorAll(".pdfOptionOrientation [data-lang]");
            for(const i in pdfOptionOrientation) {
                pdfOptionOrientation[i].innerText = lang.en.pdfOptionOpientation[i];
            }

            const pdfOptionUtil = document.querySelectorAll(".pdfOptionUtil [data-lang]");
            for(const i in pdfOptionUtil) {
                pdfOptionUtil[i].innerText = lang.en.pdfOptionUtil[i];
            }

            const imageListBox = document.querySelectorAll(".imageListBox [data-lang]");
            for(const i in imageListBox) {
                imageListBox[i].innerHTML = lang.en.imageListBox[i];
            }
            document.title = lang.en.title;
            document.head.querySelector("meta[name=\"og:title\"]").setAttribute("content", lang.en.title);
            document.head.querySelector("meta[name=\"og:description\"]").setAttribute("content", lang.en.description);
            break;
        }
    }   
};

languageSetting();

window.onlanguagechange = () => {
    languageSetting();
};