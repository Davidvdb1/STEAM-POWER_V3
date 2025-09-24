import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";

const template = await getTemplate("/components/card/card.html");

define('card-χ', class extends componentBase {
    async created() {
        this.shadow.appendChild(await getStyle('/components/card/card.css'));

        if (this.getAttribute('horizontal') != undefined) {
          this.shadow.getElementById('card').classList.add('horizontal');
          this.shadow.getElementById('card-img').classList.add('img-horizontal');
        }

        if (this.getAttribute('odd-color') != undefined) {
            this.shadow.getElementById('card-img').classList.add('odd-color');
        } else if (this.getAttribute('even-color') != undefined) {
            this.shadow.getElementById('card-img').classList.add('even-color');
        }

        if (this.getAttribute('no-margin') != undefined) {
          this.shadow.getElementById('card').classList.add('no-margin');
        }

        if (this.getAttribute('full-height') != undefined) {
            this.shadow.getElementById('card').classList.add('full-height');

        }

        if (this.getAttribute('rounded') != undefined) {
          this.shadow.getElementById('card').classList.add('card-rounded');
          if (this.getAttribute('horizontal') != undefined){
            this.shadow.getElementById('card-img').classList.add('img-rounded-horizontal');
          } else {
            this.shadow.getElementById('card-img').classList.add('img-rounded');
          }
        }
      
        if (this.getAttribute('img-src') != undefined) {
            const imgSrc = this.getAttribute('img-src');
            this.find('img').src = imgSrc;
        }

        if (this.getAttribute('img-id') != undefined) {
            this.imgId = this.getAttribute('img-id');
        }
        
        if (this.getAttribute('img-alt') != undefined) {
            const imgAlt = this.getAttribute('img-alt');
            this.find('img').setAttribute("alt", imgAlt);
        } else {
          this.shadow.getElementById('card-img').remove();
        }

        if (this.getAttribute('img-center') != undefined) {
          this.shadow.getElementById('card-img').classList.add('img-center');
        }

        if (this.getAttribute('img-cover') != undefined) {
            this.find('#card-img').classList.add('img-cover');
        }

        if (this.getAttribute('img-width') != undefined) {
          const imgWidth = this.getAttribute('img-width');
          this.shadow.getElementById('card-img').style.width = imgWidth;
        }

        if (this.getAttribute('img-height') != undefined) {
          const imgHeight = this.getAttribute('img-height');
          this.shadow.getElementById('card-img').style.height = imgHeight;
        }

        if (this.getAttribute('title') != undefined) {
          const title = this.getAttribute('title');
          this.shadow.getElementById("title").innerHTML = title;
        } else {
            this.shadow.querySelector(".title").style.display = "none";
        }

        if (this.getAttribute('link') != undefined) {
          this.shadow.getElementById('card').classList.add('card-link');
        }

        if (this.getAttribute('local-link') != undefined) {
          const route = this.getAttribute('local-link');
          this.shadow.getElementById('link').setAttribute('route', route);
        } else if (this.getAttribute('extern-link') != undefined) {
          const route = this.getAttribute('extern-link');
          this.shadow.getElementById('link').setAttribute('href', route);
        } else {
          const linkElement = this.shadow.getElementById('link');
          const cardElement = this.shadow.getElementById('card');
          linkElement.replaceWith(cardElement);
        }
        
        if (this.getAttribute('width') != undefined) {
          const width = this.getAttribute('width');
          this.shadow.getElementById('card').style.width = width;
        }
        
        if (this.getAttribute('height') != undefined) {
          const height = this.getAttribute('height');
          this.shadow.getElementById('card').style.height = height;
        }

        if (this.getAttribute('background-color') != undefined) {
          const height = this.getAttribute('background-color');
          this.shadow.getElementById('card').style.backgroundColor = height;
        }
    }
}, template);