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
        this.$data = [];
    }

    static get observedAttributes() {
        return ["range"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "range") {
            this.updateXAxis(newValue);
        }
    }
    
    updateXAxis(range) {
        if (!this.chart) return;
    
        const now = new Date();
        let minTime;
    
        switch (range) {
            case 'halfMinute':
                minTime = new Date(now.getTime() - 30 * 1000); // 30 seconden geleden
                break;
            case 'tenMinutes':
                minTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minuten geleden
                break;
            case 'oneHour':
                minTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 uur geleden
                break;
            case 'sixHour':
                minTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 uur geleden
                break;
            case 'oneDay':
                minTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 uur geleden
                break;
            default:
                console.error(`Ongeldige range: ${range}`);
                return;
        }
    
        // Update de X-as limieten in de grafiek
        this.chart.setOption({
            xAxis: {
                min: minTime.getTime(), // Nieuwe minimale tijd
                max: now.getTime(), // Huidige tijd als maximum
                axisLabel: { formatter: '{HH}:{mm}' } // Tijdsaanduiding
            }
        });
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

        try {
            this.chart = echarts.init(this.$liveEnergy);
            this.chart.setOption({
                title: { text: 'Energy Data', left: 'center' },
                tooltip: { trigger: 'axis' },
                legend: {
                    data: ['SOLAR', 'WIND', 'WATER'],
                    top: '10%'
                },
                xAxis: {
                    type: 'time',
                    min: new Date().setHours(0, 0, 0, 0), 
                    max: new Date().setHours(23, 59, 59, 999), 
                    axisLabel: { formatter: '{HH}:{mm}' } 
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    max: 1100 // Max zoals gevraagd
                },
                series: [
                    {
                        name: 'SOLAR',
                        type: 'line',
                        data: [],
                        smooth: true,
                        showSymbol: false,
                        lineStyle: { width: 2 }
                    },
                    {
                        name: 'WIND',
                        type: 'line',
                        data: [],
                        smooth: true,
                        showSymbol: false,
                        lineStyle: { width: 2 }
                    },
                    {
                        name: 'WATER',
                        type: 'line',
                        data: [],
                        smooth: true,
                        showSymbol: false,
                        lineStyle: { width: 2 }
                    }
                ]
            });

        } catch (error) {
            console.error("Failed to initialize ECharts:", error);
        }
    }

    updateGraph(dataList, newData = null) {
        if (newData) {
            this.$data.push(newData);
        } else {
            this.$data = dataList;
        }

        const solarData = this.$data.filter(d => d.type === 'SOLAR')
            .map(d => [new Date(d.time), d.value]);

        const windData = this.$data.filter(d => d.type === 'WIND')
            .map(d => [new Date(d.time), d.value]);

        const waterData = this.$data.filter(d => d.type === 'WATER')
            .map(d => [new Date(d.time), d.value]);

        this.chart.setOption({
            series: [
                { name: 'SOLAR', data: solarData },
                { name: 'WIND', data: windData },
                { name: 'WATER', data: waterData }
            ]
        });
    }
});
//#endregion CLASS
