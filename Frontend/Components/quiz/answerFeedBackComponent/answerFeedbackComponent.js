//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/quiz/answerFeedBackComponent/style.css';
    </style>

    <div class="container">
        <svg width="200" height="100" viewBox="0 0 200 100">
            <g id="background-container">

            </g>
            <g id="arrow-container">

            </g>
        </svg>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define('answer-feedback-component-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$circleSectionContainer = this.shadowRoot.querySelector('svg #background-container')
        this.$arrowContainer = this.shadowRoot.querySelector('svg #arrow-container')

        this._angle = 0;

        this.originX = 0;
        this.originY = 0;
    }

    // component attributes
    static get observedAttributes() {
        return ["width", "height", "error"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "error") {
            console.log("changed error", newValue);
            this._angle = this.calculateAngle(parseInt(newValue));
            this.setArrow(this._angle);
        }

        const svgElement = this._shadowRoot.querySelector('svg');

        if (name === "width") {
            svgElement.setAttribute("width", newValue);
        } else if (name === "height") {
            svgElement.setAttribute("height", newValue);
        }

        // Update the viewBox to match the new width and height
        const width = this.getAttribute("width") || 200;
        const height = this.getAttribute("height") || 100;
        svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);

        this.originX = parseInt(width) / 2;
        this.originY = parseInt(height) * 0.8;

        this.$circleSectionContainer.innerHTML = this.getSVG();
        this.$arrowContainer.innerHTML = this.getArrowSVG();
        this.setArrow(this._angle);
    }

    connectedCallback() { }

    calculateAngle(error) {
        return error * 18 / (7 * 4) + 1800 / (7 * 4) + 180 / 7;


    }

    setArrow(angle = 0) {
        if (angle < 180 / 7) angle = 180 / 7;
        if (angle > 6 * 180 / 7) angle = 6 * 180 / 7;

        console.log("angle", angle);
        this.$arrowContainer.setAttribute("transform", `rotate(${angle}, ${this.originX}, ${this.originY})`);

    }

    getSVG() {
        let combinedCircleSectionsPaths = "";
        const sectionColors = [
            "#98FBB0", // lighter green
            "#90EE90", // light green
            "#00D000", // green
            "#FFA500", // orange
            "#FF0000"  // red
        ];
        for (let i = 1; i < 6; i++) {
            const angle = (180 / 7);
            let circleSectionString = this.getCircleSection(i * angle - 90, (i + 1) * angle - 90, sectionColors[i - 1]);
            combinedCircleSectionsPaths += circleSectionString;
        }
        return combinedCircleSectionsPaths;
    }

    getCircleSection(start, end, sectionColor) {
        const startAngle = start || 0;
        const endAngle = end;
        const width = this.getAttribute("width") || 200;
        const height = this.getAttribute("height") || 100;
        const svgWidth = parseInt(width);
        const svgHeight = parseInt(height);

        // Dynamically calculate radii based on SVG dimensions
        const outerRadius = Math.min(svgWidth, svgHeight) * 0.6; // 20% of the smaller dimension
        const innerRadius = Math.min(svgWidth, svgHeight) * 0.20; // 7.5% of the smaller dimension

        const startX = this.originX + outerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
        const startY = this.originY + outerRadius * Math.sin((startAngle - 90) * Math.PI / 180);

        const endX = this.originX + outerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
        const endY = this.originY + outerRadius * Math.sin((endAngle - 90) * Math.PI / 180);

        const innerStartX = this.originX + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
        const innerStartY = this.originY + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180);

        const innerEndX = this.originX + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
        const innerEndY = this.originY + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180);

        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        return `
            <path d="M ${startX} ${startY}
                     A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}
                     L ${innerEndX} ${innerEndY}
                     A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
                     Z"
                  fill="${sectionColor}" stroke="black" stroke-width="1"></path>
        `;
    }

    getArrowSVG() {
        const width = this.getAttribute("width") || 200;
        const height = this.getAttribute("height") || 100;
        const svgWidth = parseInt(width);
        const svgHeight = parseInt(height);

        const indicatorLength = Math.min(svgWidth, svgHeight) * 0.50; // 30% of the smaller dimension
        const indicatorWidth = 4;

        const indicatorPivotRadius = 5;

        const arrowLength = 10;
        const arrowWidth = 5;

        return `
            <path d="M ${this.originX} ${this.originY - indicatorWidth / 2}
                        L ${this.originX} ${this.originY + indicatorWidth / 2}
                        L ${this.originX - indicatorLength} ${this.originY + indicatorWidth / 4}
                        L ${this.originX - indicatorLength} ${this.originY - indicatorWidth / 4}
                        Z"
                  fill="black"></path>
            <circle cx="${this.originX}" cy="${this.originY}" r="${indicatorPivotRadius}" fill="black"></circle>
            <path d="M ${this.originX} ${this.originY}
                     L ${this.originX + arrowLength + indicatorPivotRadius} ${this.originY - arrowWidth}
                     L ${this.originX + arrowLength + indicatorPivotRadius} ${this.originY + arrowWidth}
                     Z"
                  fill="black"></path>
        `;

        // return `
        //     <path d="M ${this.originX} ${this.originY}
        //              L ${this.originX - indicatorLength} ${this.originY}
        //              "
        //           stroke="black" stroke-width="3"></path>
        //     <circle cx="${this.originX}" cy="${this.originY}" r="5" fill="black"></circle>
        //     <path d="M ${this.originX - indicatorLength - arrowLength} ${this.originY}
        //              L ${this.originX - indicatorLength} ${this.originY - arrowWidth}
        //              L ${this.originX - indicatorLength} ${this.originY + arrowWidth}
        //              Z"
        //           fill="black"></path>
        // `;
    }

});
//#endregion CLASS