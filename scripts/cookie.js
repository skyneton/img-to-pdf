const setCookie = (name, value, day) => {
    const time = new Date();
    time.setTime(time.getTime() + (100 * 24 * 60 * 60 * day));
    document.cookie = `${name}=${value};expires=${day.toUTCString()};path=/img-to-pdf`;
};

const getCookie = (name) => {
    const cookieArr = document.cookie.split(";");

    for(const i in cookieArr) {
        if(cookieArr[i].split("=")[0] == name) {
            return cookieArr[i].split("=")[1];
        }
    }
    return null;
};

const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1999 00:00:10 GMT;`;
};