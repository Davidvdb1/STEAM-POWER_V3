//#region IMPORTS
//#endregion IMPORTS

//#region WORKSHOPFORUM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/workshop/workshopForm/style.css';
    </style>

    <div id="toolbar">
        <img id="bold-image" src="../Frontend/Assets/SVGs/textIcons/Bold_Idle.svg" alt="Bold Icon">
        <img id="underline-image" src="../Frontend/Assets/SVGs/textIcons/Underline_Idle.svg" alt="Underline Icon">
        <img id="italic-image" src="../Frontend/Assets/SVGs/textIcons/Italic_Idle.svg" alt="Italics Icon" class='toolbar-button'>
        <img id="link-image" src="../Frontend/Assets/SVGs/textIcons/Link_Idle.svg" alt="Link Icon" class='toolbar-button'>
        <img id="list-image" src="../Frontend/Assets/SVGs/textIcons/List_Idle.svg" alt="Bullet List Icon" class='toolbar-button'>
        <img id="image-image" src="../Frontend/Assets/SVGs/textIcons/Image_Idle.svg" alt="Link Icon" class='toolbar-button'>
        <input type="file" id="image-input" class="image-input">
        <select id="heading-select">
            <option value="P">P</option>
            <option value="H4">H4</option>
            <option value="H3">H3</option>
            <option value="H2">H2</option>
            <option value="H1">H1</option>
        </select>
    </div>
      
    <div id="text-editor"> 
        <p contenteditable="true" class="editor" id="text-editor-p-tag"></p> 
    </div>
 
    <button>Save</button>
`;
//#endregion WORKSHOPFORUM

//#region CLASS
window.customElements.define('workshopforum-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.boldImage = this._shadowRoot.querySelector('#bold-image');
        this.underlineImage = this._shadowRoot.querySelector('#underline-image');
        this.italicImage = this._shadowRoot.querySelector('#italic-image');
        this.linkImage = this._shadowRoot.querySelector('#link-image');
        this.imageButton = this._shadowRoot.querySelector('#image-image');
        this.headingSelect = this._shadowRoot.querySelector('#heading-select');
        this.imageInput = this._shadowRoot.querySelector('#image-input');
        this.textEditor = this._shadowRoot.querySelector('#text-editor-p-tag');
        this.bulletListImage = this._shadowRoot.querySelector('#list-image');
        this.saveButton = this._shadowRoot.querySelector('button');
        this.boldImage.classList.add('toolbar-button');
        this.underlineImage.classList.add('toolbar-button');
        this.italicImage.classList.add('toolbar-button');

    }

    connectedCallback() {
        this.boldImage.addEventListener('click', this.toggleBold.bind(this));
        this.underlineImage.addEventListener('click', this.toggleUnderline.bind(this));
        this.italicImage.addEventListener('click', this.toggleItalic.bind(this));
        this.linkImage.addEventListener('click', this.insertLink.bind(this));
        this.imageInput.addEventListener('change', this.insertImage.bind(this));
        this.saveButton.addEventListener('click', this.saveContent.bind(this));
        this.textEditor.addEventListener('input', this.previewHandler.bind(this));
        this.headingSelect.addEventListener('change', this.changeHeading.bind(this));
        this.bulletListImage.addEventListener('click', this.insertBulletList.bind(this));
    
        document.addEventListener('selectionchange', () => {
            this.updateButtonState();
        });
    
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && ['b', 'i', 'u'].includes(event.key.toLowerCase())) {
                setTimeout(() => this.updateButtonState(), 10);
            }
        });
    
        this.imageButton.addEventListener("click", () => {
            this.imageInput.click();
        });

        this.textEditor.addEventListener('keydown', (event) => {
            if (event.key === "Enter") {
                setTimeout(() => {
                    document.execCommand('formatBlock', false, this.currentHeading || 'P');
                }, 10); 
            }
        });       
    }
    

    toggleBold() {
        this.textEditor.focus(); 
        document.execCommand('bold', false, null);
        this.updateButtonState();
    }
    
    toggleUnderline() {
        this.textEditor.focus(); 
        document.execCommand('underline', false, null);
        this.updateButtonState();
    }
    
    toggleItalic() {
        this.textEditor.focus();
        document.execCommand('italic', false, null);
        this.updateButtonState();
    }

    changeHeading() {
        const headingTag = this.headingSelect.value;
        document.execCommand('formatBlock', false, headingTag);
        this.currentHeading = headingTag;
        this.textEditor.focus();
    }
    
    insertBulletList() {
        document.execCommand('insertUnorderedList', false, null);
        this.textEditor.focus();
    }
    
    insertLink() {
        const link = prompt("Enter the link URL");
        if (link) {
            document.execCommand('createLink', false, link); 
        }
    }

    insertImage(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
    
        reader.onload = (e) => {
            const imgElement = new Image();
            imgElement.src = e.target.result;
            imgElement.style.maxWidth = '685px';
            imgElement.style.height = 'auto';
            imgElement.classList.add('resizable'); 
            imgElement.style.cursor = "move"; // Zet de standaard cursor naar 'move'
    
            const imgWrapper = document.createElement('div');
            imgWrapper.classList.add('image-wrapper');
            imgWrapper.appendChild(imgElement);
    
            this.textEditor.appendChild(imgWrapper);
    
            const newParagraph = document.createElement('p');
            newParagraph.innerHTML = "<br>"; 
            newParagraph.contentEditable = "true"; 
    
            this.textEditor.appendChild(newParagraph);
            newParagraph.focus(); 
    
            // Voeg event listener toe voor resizing direct op de afbeelding
            imgElement.addEventListener('mousedown', this.startResize.bind(this, imgElement));
    
            // **✅ Voeg hier de cursor wijziging toe!**
            imgElement.addEventListener('mousemove', (e) => {
                const boundingBox = imgElement.getBoundingClientRect();
                const isNearEdge = (e.clientX >= boundingBox.right - 15) && (e.clientY >= boundingBox.bottom - 15);
    
                if (isNearEdge) {
                    imgElement.style.cursor = "se-resize"; // Resize cursor
                } else {
                    imgElement.style.cursor = "move"; // Drag cursor
                }
            });
    
            this.previewHandler();
        };
    
        if (file) {
            reader.readAsDataURL(file);
        }
    }
    

    startResize(imgElement, e) {
        e.preventDefault();
    
        const boundingBox = imgElement.getBoundingClientRect();
        const isNearEdge = (e.clientX >= boundingBox.right - 15) && (e.clientY >= boundingBox.bottom - 15);
    
        if (isNearEdge) {
            this.isResizing = true;
            this.currentElement = imgElement;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.startWidth = imgElement.offsetWidth;
            this.startHeight = imgElement.offsetHeight;
            this.aspectRatio = this.startWidth / this.startHeight;
    
            document.addEventListener('mousemove', this.resize.bind(this));
            document.addEventListener('mouseup', this.stopResize.bind(this));
        } else {
            // Als we niet in de resize-zone zitten, start een drag-beweging
            this.startDrag(imgElement, e);
        }
    }

    resize(e) {
        if (this.isResizing) {
            const deltaX = e.clientX - this.startX;
    
            // Bereken de nieuwe breedte en hoogte met de aspect ratio
            let newWidth = this.startWidth + deltaX;
            let newHeight = newWidth / this.aspectRatio;
    
            // Maximale en minimale breedte instellen
            newWidth = Math.max(50, Math.min(newWidth, 685));
            newHeight = newWidth / this.aspectRatio;
    
            // Pas de afmetingen toe
            this.currentElement.style.width = `${newWidth}px`;
            this.currentElement.style.height = `${newHeight}px`;
        }
    }
    
    stopResize() {
        this.isResizing = false;
        this.currentElement = null;
        document.removeEventListener('mousemove', this.resize.bind(this));
        document.removeEventListener('mouseup', this.stopResize.bind(this));
        this.previewHandler();
    }

    
    startDrag(imgElement, e) {
        e.preventDefault();
    
        this.isDragging = true;
        this.dragElement = imgElement;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.initialLeft = imgElement.offsetLeft;
        this.initialTop = imgElement.offsetTop;
    
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
    }
    
    drag(e) {
        if (this.isDragging) {
            const deltaX = e.clientX - this.dragStartX;
            const deltaY = e.clientY - this.dragStartY;
    
            this.dragElement.style.position = "relative";
            this.dragElement.style.left = `${this.initialLeft + deltaX}px`;
            this.dragElement.style.top = `${this.initialTop + deltaY}px`;
        }
    }

    stopDrag() {
        this.isDragging = false;
        this.dragElement = null;
        document.removeEventListener('mousemove', this.drag.bind(this));
        document.removeEventListener('mouseup', this.stopDrag.bind(this));
    }
    
    saveContent() {
        console.log("Saved content:", this.textEditor.innerHTML);
    }

    updateButtonState() {
        this.boldImage.classList.toggle('active', document.queryCommandState('bold'));
        this.underlineImage.classList.toggle('active', document.queryCommandState('underline'));
        this.italicImage.classList.toggle('active', document.queryCommandState('italic'));
    }

    previewHandler() {
        this.dispatchEvent(new CustomEvent('preview', {
            bubbles: true,
            composed: true,
            detail: this.textEditor.innerHTML
        })); 
    }
    
});
//#endregion CLASS
