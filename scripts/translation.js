const lang = {
    ko: {
        title: "이미지 PDF 변환",
        description: "이미지를 PDF로 변환합니다. 드래그 앤 드롭을 통해 이미지를 추가할 수 있습니다. 정렬: 이미지의 이름을 통해 정렬합니다. 압축: 변환된 PDF 사이즈를 줄입니다.",
        topbarTopMenu: ["정보", "초기화", "변환하기"],
        orderByBox: ["오름차순", "내림차순"],
        pdfOptionCompress: {
            title: "압축",
            child: ["무손실", "저손실", "손실", "고손실"],
        },
        pdfOptionFormat: {
            title: "페이지",
            child: ["자동"],
        },
        pdfOptionOpientation: ["가로", "세로"],
        imageListBox: ["파일 추가<br>(혹은 드래그 드롭)"],
        versionNotSupported: ["지원하지 않는 브라우저 버전입니다."],
        infoDescription: ["이미지 PDF 변환<br><br>\n변환하고 싶은 이미지 파일을 드래그 혹은, 파일 추가 버튼을 클릭 후 선택합니다.<br>\n자동으로 정렬 버튼에 선택한 옵션대로 정렬됩니다.<br>\n정렬을 다시 하고싶다면, 정렬 버튼 오른쪽 화살표에서 옵션 선택 후 버튼을 클릭시 정렬됩니다.<br>\n만약 올린 이미지의 일부를 제거하고 싶다면\nPC기준으로 이미지에 마우스를 올린 후 생기는 삭제 버튼을 클릭하여 삭제가 가능합니다.<br>\n모바일 기준으로 이미지를 클릭후 생기는 삭제 버튼을 클릭하면 됩니다.<br>\n이미지 위치를 변경하고 싶다면(PC에서만 가능)\n이미지를 드래그 하여 원하는 이미지 위치로 올려놓습니다.\n(주황색으로 추가되는 위치가 보여집니다.)<br>\n상단에서 페이지 사이즈(기본 자동)를 선택시 페이지에 맞는 최대 크기로 이미지가 그려집니다.<br>\n설정 완료 후 변환하기 버튼을 누르면 변환 후 자동으로 파일이 다운로드 됩니다.<br>\n변환후 자동으로 이미지 목록이 초기화 되지 않으며, 상단의 초기화 버튼을 누를경우 초기화됩니다."]
    },
    jp: {
        title: "イメージを PDF に変換",
        description: "画像をPDFに変換します。 ドラッグ&ドロップで画像を追加できます。 並べ替え:画像の名前を通して並べ替えます。 圧縮:変換されたPDF サイズを小さくします。",
        topbarTopMenu: ["使用方法", "しょきか", "へんかん"],
        orderByBox: ["しょうじゅん", "こうじゅん"],
        pdfOptionCompress: {
            title: "あっしゅく",
            child: ["しないこと", "じゃっかん", "ふつう", "たくさん"],
        },
        pdfOptionFormat: {
            title: "ペイジ",
            child: ["じどう"],
        },
        pdfOptionOpientation: ["横向き", "たて"],
        imageListBox: ["ファイル追加<br>(あるいはドラッグアンドドロップ)"],
        versionNotSupported: ["対応していないブラウザのバージョンです。"],
        infoDescription: ["イメージを PDF に変換<br><br>\n変換したい画像ファイルをドラッグするか、ファイル追加ボタンをクリックして選択します。<br>\n自動整列ボタンに選択したオプションの通り整列されます。<br>\n並べ替えをもう一度したい場合は、並び替えボタンの右側の矢印からオプションを選択し、ボタンをクリックすると並び替えられます。<br>\n掲載された画像の一部を削除したい場合は、\nPC基準で画像にマウスをアップロードして生じる削除ボタンをクリックし、削除することができます。<br>\nモバイルを基準に画像をクリックして「削除」ボタンをクリックします。<br>\n画像位置を変更したい場合は（PCでのみ可能）\n画像をドラッグして、希望する画像の位置に移動します。\n(オレンジ色に追加される位置が表示されます。)<br>\n上段にあるページサイズ(基本自動)を選択時、ページに合った最大サイズのイメージが描かれます。<br>\n設定完了後に変換するボタンを押すと、変換後に自動的にファイルがダウンロードされます。<br>\n変換後、自動的にイメージリストが初期化されず、上段の初期化ボタンを押すと初期化されます。"]
    },
    en: {
        title: "Image to PDF",
        description: "Convert the image to PDF. You can add images through drag and drop. Sort — Sorts through the name of the image. Compression: Reduce the converted PDF size.",
        topbarTopMenu: ["How to use", "Clear", "Convert"],
        orderByBox: ["Ascending", "Descending"],
        pdfOptionCompress: {
            title: "Compress",
            child: ["Not", "Low", "Middle", "High"],
        },
        pdfOptionFormat: {
            title: "page",
            child: ["Auto"],
        },
        pdfOptionOpientation: ["Landscape", "Portrait"],
        imageListBox: ["File Add<br>(or Drag and Drop)"],
        versionNotSupported: ["Unsupported browser version."],
        infoDescription: ["Image to PDF<br><br>\nDrag the image file you want to convert, or click the Add File button and select it.<br>\nThe Sort button automatically sorts according to the options you select.<br>\nIf you want to re-align, select an option from the right arrow of the Sort button and click the button to sort.<br>\nIf you want to remove some of the uploaded images,\nYou can delete it by clicking the Delete button that occurs after you mouse over the image based on the PC.<br>\nClick on the delete button that occurs after clicking on the image based on mobile.<br>\nIf you want to reposition the image (only available on PC)\nDrag the image to the desired image position.\n(This shows where it is added in orange.)<br>\nWhen you select the page size (default auto) at the top, the image is drawn to the maximum size that fits the page.<br>\nWhen you press the Convert button after completing the setup, the file is automatically downloaded after the conversion.<br>\nThe image list is not automatically initialized after the conversion; it is initialized when the initialization button at the top is pressed."]
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
            const imageListBox = document.querySelectorAll(".imageListBox [data-lang]");
            for(const i in imageListBox) {
                imageListBox[i].innerHTML = lang.ko.imageListBox[i];
            }
            const versionBox = document.querySelectorAll(".version_not_supported [data-lang]");
            for(const i in versionBox) {
                versionBox[i].innerHTML = lang.ko.versionNotSupported[i];
            }

            const infoBox = document.querySelectorAll(".img_to_pdf_info [data-lang]");
            for(const i in infoBox) {
                infoBox[i].innerHTML = lang.ko.infoDescription[i];
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
            const imageListBox = document.querySelectorAll(".imageListBox [data-lang]");
            for(const i in imageListBox) {
                imageListBox[i].innerHTML = lang.jp.imageListBox[i];
            }
            const versionBox = document.querySelectorAll(".version_not_supported [data-lang]");
            for(const i in versionBox) {
                versionBox[i].innerHTML = lang.jp.versionNotSupported[i];
            }

            const infoBox = document.querySelectorAll(".img_to_pdf_info [data-lang]");
            for(const i in infoBox) {
                infoBox[i].innerHTML = lang.jp.infoDescription[i];
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

            const imageListBox = document.querySelectorAll(".imageListBox [data-lang]");
            for(const i in imageListBox) {
                imageListBox[i].innerHTML = lang.en.imageListBox[i];
            }
            const versionBox = document.querySelectorAll(".version_not_supported [data-lang]");
            for(const i in versionBox) {
                versionBox[i].innerHTML = lang.en.versionNotSupported[i];
            }

            const infoBox = document.querySelectorAll(".img_to_pdf_info [data-lang]");
            for(const i in infoBox) {
                infoBox[i].innerHTML = lang.en.infoDescription[i];
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