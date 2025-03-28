//#region IMPORTS
//#endregion IMPORTS

//#region WORKSHOPFORUM
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/workshop/workshopForm/style.css';
    </style>

    <h1>Workshop Editor</h1>
    <input type="text" id="title" placeholder="Titel">
    <div id="toolbar">
        <img id="bold-image" src="../Frontend/Assets/SVGs/textIcons/Bold_Idle.svg" alt="Bold Icon" class='toolbar-button'>
        <img id="underline-image" src="../Frontend/Assets/SVGs/textIcons/Underline_Idle.svg" alt="Underline Icon" class='toolbar-button'>
        <img id="italic-image" src="../Frontend/Assets/SVGs/textIcons/Italic_Idle.svg" alt="Italics Icon" class='toolbar-button'>
        <img id="link-image" src="../Frontend/Assets/SVGs/textIcons/Link_Idle.svg" alt="Link Icon" class='toolbar-button'>
        <img id="list-image" src="../Frontend/Assets/SVGs/textIcons/List_Idle.svg" alt="Bullet List Icon" class='toolbar-button'>
        <img id="image-image" src="../Frontend/Assets/SVGs/textIcons/Image_Idle.svg" alt="Link Icon" class='toolbar-button'>
        <img id="html-image" src="../Frontend/Assets/SVGs/textIcons/Modal_Idle.svg" alt="html Icon" class='toolbar-button'>
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
    <p id="statusmessage"></p>
`;
//#endregion WORKSHOPFORUM

//#region CLASS
window.customElements.define('workshopforum-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    
        this.$boldImage = this._shadowRoot.querySelector('#bold-image');
        this.$underlineImage = this._shadowRoot.querySelector('#underline-image');
        this.$italicImage = this._shadowRoot.querySelector('#italic-image');
        this.$linkImage = this._shadowRoot.querySelector('#link-image');
        this.$imageButton = this._shadowRoot.querySelector('#image-image');
        this.$headingSelect = this._shadowRoot.querySelector('#heading-select');
        this.$imageInput = this._shadowRoot.querySelector('#image-input');
        this.$textEditor = this._shadowRoot.querySelector('#text-editor-p-tag');
        this.$bulletListImage = this._shadowRoot.querySelector('#list-image');
        this.$saveButton = this._shadowRoot.querySelector('button');
        this.$htmlEditor = this._shadowRoot.querySelector('#html-image');
        this.$title = this._shadowRoot.querySelector("#title");
    
        // 🔹 Creëer een textarea voor HTML-weergave
        this.$htmlTextarea = document.createElement("textarea");
        this.$htmlTextarea.style.display = "none";  // Verberg standaard
        this.$htmlTextarea.style.width = "100%";
        this.$htmlTextarea.style.height = "300px";
        this.$htmlTextarea.style.fontFamily = "monospace";
        this.$htmlTextarea.style.fontSize = "14px";
        this.$htmlTextarea.style.border = "1px solid #ccc";
        this.$htmlTextarea.style.padding = "10px";
        this.$htmlTextarea.style.resize = "vertical";
    
        // Voeg de textarea toe NA de editor
        this.$textEditor.parentNode.insertBefore(this.$htmlTextarea, this.$textEditor.nextSibling);
    }
    
    static get observedAttributes() {
        return ["workshop"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "workshop") {
            if (newValue) {
                this.fetchWorkshopWithId(newValue);
            }
        }
    }


    connectedCallback() {
        // Check if user is admin
        const user = JSON.parse(sessionStorage.getItem('loggedInUser')) || {};
        const isAdmin = user.role === 'ADMIN';
        
        // Hide HTML editor button if not admin
        if (!isAdmin) {
            this.$htmlEditor.style.display = 'none';
        }
        
        this.$boldImage.addEventListener('click', this.toggleBold.bind(this));
        this.$underlineImage.addEventListener('click', this.toggleUnderline.bind(this));
        this.$italicImage.addEventListener('click', this.toggleItalic.bind(this));
        this.$linkImage.addEventListener('click', this.insertLink.bind(this));
        this.$imageInput.addEventListener('change', this.insertImage.bind(this));
        this.$saveButton.addEventListener('click', this.saveContent.bind(this));
        this.$textEditor.addEventListener('input', this.textPreviewHandler.bind(this));
        this.$htmlTextarea.addEventListener('input', this.htmlPreviewHandler.bind(this));
        this.$headingSelect.addEventListener('change', this.changeHeading.bind(this));
        this.$bulletListImage.addEventListener('click', this.insertBulletList.bind(this));
        this.$htmlEditor.addEventListener('click', () => this.toggleHtmlEditor());

    
        document.addEventListener('selectionchange', () => {
            this.updateButtonState();
        });
    
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && ['b', 'i', 'u'].includes(event.key.toLowerCase())) {
                setTimeout(() => this.updateButtonState(), 10);
            }
        });

        document.addEventListener('selectionchange', () => {
            this.updateButtonState();
            this.updateHeadingSelection();
        });
        
    
        this.$imageButton.addEventListener("click", () => {
            this.$imageInput.click();
        });

        this.$textEditor.addEventListener('keydown', (event) => {
            if (event.key === "Enter") {
                setTimeout(() => {
                    const selection = document.getSelection();
                    const range = selection.getRangeAt(0);
                    const parentBlock = range.commonAncestorContainer.closest('li, p, h1, h2, h3, h4');
        
                    if (parentBlock) {
                        const tagName = parentBlock.tagName.toUpperCase();
        
                        // Blijf in dezelfde heading als je in een lijst zit
                        if (parentBlock.closest('li') && ['H1', 'H2', 'H3', 'H4'].includes(tagName)) {
                            document.execCommand('formatBlock', false, tagName);
                            this.$headingSelect.value = tagName;
                        }
                    } else {
                        // Controleer of de gebruiker dubbel Enter drukt om uit de bulletlist te gaan
                        if (document.getSelection().focusNode.nodeType === Node.TEXT_NODE && document.getSelection().focusNode.textContent.trim() === '') {
                            document.execCommand('formatBlock', false, 'P'); // Reset naar normale tekst
                            this.$headingSelect.value = "P";
                        }
                    }
                }, 10);
            }
        }); 
    }
    

    toggleBold() {
        this.$textEditor.focus(); 
        document.execCommand('bold', false, null);
        this.updateButtonState();
    }
    
    toggleUnderline() {
        this.$textEditor.focus(); 
        document.execCommand('underline', false, null);
        this.updateButtonState();
    }
    
    toggleItalic() {
        this.$textEditor.focus();
        document.execCommand('italic', false, null);
        this.updateButtonState();
    }

    toggleHtmlEditor() {
        const isHtmlMode = this.$textEditor.style.display === "none"; 
    
        if (isHtmlMode) {
            this.$textEditor.innerHTML = this.$htmlTextarea.value;
            this.$textEditor.style.display = "block";
            this.$htmlTextarea.style.display = "none";
        } else {
            this.$htmlTextarea.value = this.$textEditor.innerHTML;
            this.$textEditor.style.display = "none";
            this.$htmlTextarea.style.display = "block";
        }
    }
    
    

    changeHeading() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
    
        const range = selection.getRangeAt(0);
        let listItem = range.commonAncestorContainer.closest('li');
    
        if (listItem) {
            // Haal ALLE tekst op en strip eventuele extra HTML
            let textContent = listItem.textContent.trim();
    
            // Verwijder ALLE bestaande headings binnen het <li>
            listItem.querySelectorAll('h1, h2, h3, h4').forEach(h => h.remove());
    
            // Maak een nieuwe heading-tag en voeg de tekst toe
            const newHeading = document.createElement(this.$headingSelect.value);
            newHeading.textContent = textContent;
    
            // Zorg ervoor dat ALLEEN de heading in het <li> staat
            listItem.innerHTML = ''; 
            listItem.appendChild(newHeading);
    
            this.$textEditor.focus();
        } else {
            // Gebruik standaard formatBlock als het GEEN lijst-item is
            document.execCommand('formatBlock', false, this.$headingSelect.value);
        }
    }    
    
    updateHeadingSelection() {
        const activeBlock = document.queryCommandValue("formatBlock"); // Haal de huidige blokopmaak op
        const tagName = activeBlock.toUpperCase(); // Zet om naar uppercase voor consistentie
    
        // Controleer of het een geldige heading of paragraaf is
        const validHeadings = ['P', 'H1', 'H2', 'H3', 'H4'];
        if (validHeadings.includes(tagName)) {
            this.$headingSelect.value = tagName;
        } else {
            this.$headingSelect.value = 'P'; // Fallback naar paragraaf
        }
    }
    
    insertBulletList() {
        document.execCommand('insertUnorderedList', false, null);
        this.$textEditor.focus();
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
    
            this.$textEditor.appendChild(imgWrapper);
    
            const newParagraph = document.createElement('p');
            newParagraph.innerHTML = "<br>"; 
            newParagraph.contentEditable = "true"; 
    
            this.$textEditor.appendChild(newParagraph);
            newParagraph.focus(); 
    
            imgElement.addEventListener('mousedown', this.startResize.bind(this, imgElement));
    
            imgElement.addEventListener('mousemove', (e) => {
                const boundingBox = imgElement.getBoundingClientRect();
                const isNearEdge = (e.clientX >= boundingBox.right - 15) && (e.clientY >= boundingBox.bottom - 15);
    
                if (isNearEdge) {
                    imgElement.style.cursor = "se-resize"; 
                } else {
                    imgElement.style.cursor = "move";
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
            this.$isResizing = true;
            this.$currentElement = imgElement;
            this.$startX = e.clientX;
            this.$startY = e.clientY;
            this.$startWidth = imgElement.offsetWidth;
            this.$startHeight = imgElement.offsetHeight;
            this.$aspectRatio = this.$startWidth / this.$startHeight;
    
            document.addEventListener('mousemove', this.resize.bind(this));
            document.addEventListener('mouseup', this.stopResize.bind(this));
        } else {
            this.startDrag(imgElement, e);
        }
    }

    resize(e) {
        if (this.$isResizing) {
            const deltaX = e.clientX - this.$startX;
    
            let newWidth = this.$startWidth + deltaX;
            let newHeight = newWidth / this.$aspectRatio;

            newWidth = Math.max(50, Math.min(newWidth, 685));
            newHeight = newWidth / this.$aspectRatio;
    
            this.$currentElement.style.width = `${newWidth}px`;
            this.$currentElement.style.height = `${newHeight}px`;
        }
    }
    
    stopResize() {
        this.$isResizing = false;
        this.$currentElement = null;
        document.removeEventListener('mousemove', this.resize.bind(this));
        document.removeEventListener('mouseup', this.stopResize.bind(this));
        this.previewHandler();
    }

    saveContent() {
        const workshop = this.getAttribute("workshop");
        const camp = this.getAttribute("camp");
    
        const content = this.$textEditor.style.display === "none" 
            ? this.$htmlTextarea.value  
            : this.$textEditor.innerHTML;
    
        if (workshop) {
            this.updateWorkshop(content, this.$title.value);
        } 
        
        if (camp) {
            this.createWorkshop(content, this.$title.value, camp);
        }
    }
    
    updateButtonState() {
        this.$boldImage.classList.toggle('active', document.queryCommandState('bold'));
        this.$underlineImage.classList.toggle('active', document.queryCommandState('underline'));
        this.$italicImage.classList.toggle('active', document.queryCommandState('italic'));
        this.$htmlEditor.classList.toggle('active', document.queryCommandState('html'));
    }

    textPreviewHandler() {
        this.dispatchEvent(new CustomEvent('preview', {
            bubbles: true,
            composed: true,
            detail: this.$textEditor.innerHTML
        })); 
    }

    htmlPreviewHandler() {
        this.dispatchEvent(new CustomEvent('preview', {
            bubbles: true,
            composed: true,
            detail: this.$htmlTextarea.value
        })); 
    }

    fillEditorWithWorkshop(html, title) {
        this.$textEditor.innerHTML = html;
        this.$title.value = title;
        this.previewHandler();
    }

    updateStatusMessage(message, type) {
        const statusMessage = this._shadowRoot.querySelector("#statusmessage");
        statusMessage.textContent = message;
        statusMessage.style.color = type === "success" ? "green" : "red";
    }  
    
    
    //service
    async fetchWorkshopWithId(id) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/workshops/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            this.$workshop = await response.json();
            this.fillEditorWithWorkshop(this.$workshop.html, this.$workshop.title);
    
        } catch (error) {
            console.error("Fout bij ophalen van workshop:", error);
        }
    }

    async createWorkshop(html, title, id) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/workshops`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ html, title, id })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            this.$workshop = await response.json();
    
            // 🔹 Wacht op het ophalen van de workshop voordat we verdergaan
            const workshop = await this.getWorkshopByTitle(title);
    
            if (!workshop || !workshop.id) {
                throw new Error("Workshop ID niet gevonden na aanmaken!");
            }
    
            // 🔹 Voeg de workshop toe aan het kamp
            const campId = this.getAttribute("camp");
            await this.addWorkshopToCamp(campId, workshop.id);
    
            this.updateStatusMessage("✅ Workshop succesvol aangemaakt!", "success");
    
            setTimeout(() => {
                history.back();  // 🔙 Ga terug naar de vorige pagina
            }, 1000);  
    
        } catch (error) {
            console.error("❌ Fout bij aanmaken van workshop:", error);
            this.updateStatusMessage("❌ Fout bij aanmaken van workshop.", "error");
        }
    }
    

    async updateWorkshop(html, title) {
        try {
            const ID = this.getAttribute("workshop");
            const url = window.env.BACKEND_URL;
            const data = { html: html, title: title };
            const response = await fetch(url + `/workshops/${ID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
    
            if (response.ok) {
                const result = await response.json();
                this.updateStatusMessage("✅ Workshop succesvol aangepast!", "success");
                setTimeout(() => {
                    history.back();  // 🔙 Ga terug naar de vorige pagina
                }, 1000);        
            }

        } catch (error) {
            console.error("Fout bij updaten van workshop:", error);
            this.updateStatusMessage("❌ Fout bij aanpassen van workshop.", "error");
        }
    }

    async getWorkshopByTitle(title) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/workshops/title/${title}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const workshop = await response.json();
            return workshop;
        } catch (error) {
            console.error("Fout bij ophalen van workshop:", error);
        }
    }

    async addWorkshopToCamp(campId, workshopId) {
        try {
            const url = window.env.BACKEND_URL;
            const response = await fetch(`${url}/camps/${campId}/workshop/${workshopId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error(`❌ HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
    
            return data;
        } catch (error) {
            console.error("❌ Fout bij toevoegen van workshop aan kamp:", error);
            return null; // Zorgt ervoor dat de functie geen crash veroorzaakt
        }
    }
    
});
//#endregion CLASS
