let styleCache = {};
let templateCache = {};


export async function getStyle(cssFile) {
    if (styleCache[cssFile] == undefined) {
        let response = await fetch(cssFile);
        styleCache[cssFile] = await response.text();
    }

    let style = document.createElement('style');
    style.textContent = styleCache[cssFile];
    return style;
}

export async function getTemplate(htmlFile) {
    if (templateCache[htmlFile] == undefined) {
        let response = await fetch(htmlFile);
        templateCache[htmlFile] = await response.text();
    }

    return templateCache[htmlFile];
}