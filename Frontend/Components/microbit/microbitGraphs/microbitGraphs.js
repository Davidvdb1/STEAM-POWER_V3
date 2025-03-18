//#region MICROBITGRAPHS
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        :host {
            display: block;
            width: 100%;
            max-width: 600px;
        }
        h1 {
            font-size: 1.5rem;
            text-align: center;
        }
        #energylive {
            width: 100%;
            height: 400px;
            border: 1px solid #ddd;
            background-color: #fafafa;
        }
    </style>

    <h1>Energy Data Graph</h1>
    <div id="energylive"></div>
`;
//#endregion MICROBITGRAPHS

//#region CLASS
window.customElements.define('microbitgraphs-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$liveEnergy = this._shadowRoot.querySelector('#energylive');
        this.chart = null;
    }

    connectedCallback() {
        this.initChart();
    }

    initChart() {
        if (!this.$liveEnergy) {
            console.error("Chart container not found!");
            return;
        }

        if (typeof echarts === 'undefined') {
            console.error("ECharts is niet geladen! Voeg een script toe in je HTML.");
            return;
        }

        console.log("Initializing ECharts...");

        try {
            this.chart = echarts.init(this.$liveEnergy);
            this.chart.setOption({
                title: { text: 'Mock Energy Data', left: 'center' },
                tooltip: { trigger: 'axis' },
                legend: { // ✅ Voeg een legenda toe voor de drie lijnen
                    data: ['Zon', 'Wind', 'Water'],
                    top: '10%'
                },
                xAxis: {
                    type: 'category',
                    data: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30']
                },
                yAxis: { type: 'value' },
                series: [
                    {
                        name: 'Zon',
                        type: 'line',
                        data: [12, 19, 3, 5, 2, 3, 15], // ✅ Lijn 1
                        smooth: true,
                        lineStyle: { width: 2 }
                    },
                    {
                        name: 'Wind',
                        type: 'line',
                        data: [8, 15, 6, 9, 4, 7, 12], // ✅ Lijn 2
                        smooth: true,
                        lineStyle: { width: 2 }
                    },
                    {
                        name: 'Water',
                        type: 'line',
                        data: [5, 10, 7, 3, 8, 6, 14], // ✅ Lijn 3
                        smooth: true,
                        lineStyle: { width: 2 }
                    }
                ]
            });

            console.log("ECharts initialized successfully.");
        } catch (error) {
            console.error("Failed to initialize ECharts:", error);
        }
    }
});
//#endregion CLASS
