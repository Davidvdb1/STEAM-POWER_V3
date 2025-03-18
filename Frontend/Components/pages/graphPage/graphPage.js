//#region IMPORTS
//#endregion IMPORTS

//#region GRAPHPAGE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './components/pages/graphPage/style.css';
    </style>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>

    <h1>Hello World</h1>
    <canvas id="myChart"></canvas>
`;
//#endregion GRAPHPAGE

//#region CLASS
window.customElements.define('graphpage-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$canvas = this._shadowRoot.querySelector("#myChart");
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        // Chart.js laden als het nog niet aanwezig is
        if (!window.Chart) {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js";
            script.onload = () => this.initializeChart();
            document.head.appendChild(script);
        } else {
            this.initializeChart();
        }
    }

    initializeChart() {
        if (!this.$canvas) return;
        const ctx = this.$canvas.getContext("2d");

        const xValues = [100,200,300,400,500,600,700,800,900,1000];

        new Chart(ctx, {  // Gebruik ctx i.p.v. "myChart"
          type: "line",
          data: {
            labels: xValues,
            datasets: [
              {
                data: [860,1140,1060,1060,1070,1110,1330,2210,7830,2478],
                borderColor: "red",
                fill: false
              },
              {
                data: [1600,1700,1700,1900,2000,2700,4000,5000,6000,7000],
                borderColor: "green",
                fill: false
              },
              {
                data: [300,700,2000,5000,6000,4000,2000,1000,200,100],
                borderColor: "blue",
                fill: false
              }
            ]
          },
          options: {
            legend: { display: false },
            responsive: true,
            maintainAspectRatio: false
          }
        });
    }
});
//#endregion CLASS