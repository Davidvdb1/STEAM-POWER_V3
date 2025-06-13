//#region RANGEINDICATORBAR
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        :host {
            display: block;
            width: 100%;
            max-width: 700px;
        }
        h1 {
            font-size: 1.5rem;
            text-align: center;
        }
        #barindicator {
            width: 100%;
            height: 125px;
            border: 1px solid #ddd;
            border-radius: 10px;
            background-color: #fafafa;
        }

        .nodata {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            font-size: 1.2rem;
            color: #999;
            font-style: italic;
            text-align: center;
            padding: 10px;
        }
    </style>

    <div id="barindicator"></div>
`;
//#endregion RANGEINDICATORBAR

//#region CLASS
window.customElements.define('rangeindicatorbar-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$liveEnergy = this._shadowRoot.querySelector('#barindicator');
        this.chart = null;
        this.$icon = 'https://img.icons8.com/?size=100&id=648&format=png&color=000000'
        this.$data = [];
        this.$allData = []; // <--- bewaar alle data
        this.$isChartReady = false;

    }

    static get observedAttributes() {
        return ["range", "mode"];
    }
    

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "range") {
            this.updateRange(newValue);
        }
        if (name === "mode") {
            this.updateRange(this.getAttribute("range") || "oneDay");
        }
    }
    
    connectedCallback() {
        setTimeout(() => {
            this.initChart();
            const canvas = this.$liveEnergy.querySelector('canvas');
            this.showNoDataMessage(`Niet genoeg ${this.id} data beschikbaar in deze tijdsrange.`);
        }, 50); 
    }

    setFullData(data) {
        this.$allData = data;
    
        const tryUpdate = () => {
            if (this._isChartReady) {
                this.updateRange(this.getAttribute('range') || 'oneDay');
            } else {
                setTimeout(tryUpdate, 50); // wacht tot chart klaar is
            }
        };
    
        tryUpdate();
    }    

    initChart() {

        if (this.chart) {
            this.chart.dispose();
        }
        this.chart = echarts.init(this.$liveEnergy);        
        this.$isChartReady = true;

        const min = 137.22;
        const max = 141.36;
        const current = 139.4;

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
                xAxis: {
                    min: min,
                    max: max,
                    show: false,
                    type: 'value'
                },
                yAxis: {
                    type: 'category',
                    data: ['Day Range'],
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false }
                },
                grid: {
                    left: '10%',
                    right: '10%',
                    top: '20%',
                    bottom: '10%'
                },
                tooltip: {
                    show: false
                }
            });

            this.chart.resize();

        } catch (error) {
            console.error("Failed to initialize ECharts:", error);
        }
    }

    getDataForCurrentRange() {
        const now = new Date();
        let minTime;
    
        switch (this.getAttribute('range')) {
            case 'minute':
                minTime = new Date(now.getTime() - 60 * 1000); break;
            case 'tenMinutes':
                minTime = new Date(now.getTime() - 10 * 60 * 1000); break;
            case 'oneHour':
                minTime = new Date(now.getTime() - 60 * 60 * 1000); break;
            case 'sixHour':
                minTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); break;
            case 'oneDay':
            default:
                minTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
        }
    
        return this.$allData.filter(d => new Date(d.time) >= minTime && d.value > 0);
    }
    

    updateBar(dataList = null, newData = null) {
        let dataToUse;
    
        if (newData) {
            this.$allData.push(newData);
            dataToUse = this.getDataForCurrentRange();
            if (newData.value === 0) {
                this.showNoDataMessage(`Niet genoeg ${this.id} data beschikbaar in deze tijdsrange.`);
                return;
            }
        } else if (dataList) {
            dataToUse = dataList;
            console.log(`data geladen voor bar ${this.id}`, dataToUse);
        } else {
            console.warn('Geen geldige data ontvangen');
            return;
        }

        const validData = dataToUse.filter(d => d.value > 0);
        if (validData.length === 0) {
            console.warn(`Geen geldige meetwaarden voor ${this.id}`);
            return;
        }
    
        const min = Math.min(...validData.map(d => this.convertValue(d.value)));
        const max = Math.max(...validData.map(d => this.convertValue(d.value)));
        const latest = validData.reduce((a, b) => new Date(a.time) > new Date(b.time) ? a : b);
        const current = this.convertValue(latest.value);
        
    
        if (!this.chart) {
            this.initChart();
        }
    
        this.chart.setOption({
            xAxis: {
                min: min,
                max: max
            },
            series: [
                {
                    type: 'bar',
                    stack: 'range',
                    data: [min],
                    barWidth: 30,
                    itemStyle: {
                        color: 'transparent'
                    }
                },
                {
                    type: 'bar',
                    stack: 'range',
                    data: [max - min],
                    barWidth: 30,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                            { offset: 0, color: '#1ebd58' },
                            { offset: 1, color: '#d62424' }
                        ])
                    },
                    markPoint: {
                        symbolSize: 25,
                        data: [
                            {
                                xAxis: min,
                                yAxis: 'Day Range',
                                label: {
                                    show: true,
                                    formatter: () => {
                                        const mode = this.getAttribute('mode');
                                        return mode === 'voltage' ? `${min} V` : `${min}`;
                                    },
                                    position: 'left',
                                    fontWeight: 'bold',
                                    color: '#000'
                                },
                                itemStyle: {
                                    color: 'transparent'
                                }
                            },
                            {
                                xAxis: max,
                                yAxis: 'Day Range',
                                label: {
                                    show: true,
                                    formatter: () => {
                                        const mode = this.getAttribute('mode');
                                        return mode === 'voltage' ? `${max} V` : `${max}`;
                                    },
                                    position: 'right',
                                    fontWeight: 'bold',
                                    color: '#000'
                                },
                                itemStyle: {
                                    color: 'transparent'
                                }
                            },
                            {
                                symbol: `image://Assets/SVGs/${this.id}.png`,
                                xAxis: current,
                                yAxis: 'Day Range',
                                label: {
                                    show: true,
                                    formatter: () => {
                                        const mode = this.getAttribute('mode');
                                        return mode === 'voltage' ? `${current} V` : `${current}`;
                                    },
                                    position: 'top'
                                },
                                symbolOffset: [0, '-30px'],
                            }
                        ]
                    }                    
                }
            ]
        });
    }    
    
    updateRange(range) {
        if (!this.chart) return;
    
        const now = new Date();
        let minTime;
    
        switch (range) {
            case 'minute':
                minTime = new Date(now.getTime() - 60 * 1000);
                break;
            case 'tenMinutes':
                minTime = new Date(now.getTime() - 10 * 60 * 1000);
                break;
            case 'oneHour':
                minTime = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case 'sixHour':
                minTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
                break;
            case 'oneDay':
                minTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            default:
                console.error(`Ongeldige range: ${range}`);
                return;
        }
    
        const filtered = this.$allData.filter(d =>
            new Date(d.time) >= minTime && d.value > 0
        );
        
    
        if (filtered.length < 2) {
            this.showNoDataMessage(`Niet genoeg ${this.id} data beschikbaar in deze tijdsrange.`);
            return;
        }
        
        const values = filtered.map(d => this.convertValue(d.value));
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        if (min === max) {
            this.showNoDataMessage(`Niet genoeg ${this.id} data beschikbaar in deze tijdsrange.`);
            return;
        }        
    
        this.updateBar(filtered); // <- Deze regel zorgt ervoor dat de grafiek wordt aangepast
    }

    showNoDataMessage(message) {
        this.clearChart(); // dispose de chart & maak inhoud leeg
    
        const msgDiv = document.createElement('div');
        msgDiv.className = 'nodata';
        msgDiv.textContent = message;
    
        this.$liveEnergy.appendChild(msgDiv); // voeg de melding toe in bestaande container
    }
    
    
    
    clearChart() {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
        this.$liveEnergy.innerHTML = '';
    }

    convertValue(value) {
        const mode = this.getAttribute('mode');
        return mode === 'voltage' ? parseFloat((value / 341).toFixed(3)) : value;
    }
    
});
//#endregion CLASS
