//#region LIVELINEGRAPH
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
        #energylive {
            width: 100%;
            height: 420px;
            border: 1px solid #ddd;
            background-color: #fafafa;
            border-radius: 10px;
        }

        #energylive > div {
            width: 100% !important;
            height: 100% !important;
        }
    </style>

    <div id="energylive"></div>
`;
//#endregion LIVELINEGRAPH

//#region CLASS
window.customElements.define('livelinegraph-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$liveEnergy = this._shadowRoot.querySelector('#energylive');
        this.chart = null;
        this.$data = [];
    }

    static get observedAttributes() {
        return ["range", "mode"];
    }
    

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "range") {
            this.updateXAxis(newValue);
        }
        if (name === "mode") {
            const isVoltage = newValue === 'voltage';
            this.chart.setOption({
                yAxis: {
                    max: isVoltage ? 3 : 1200,
                    axisLabel: {
                        formatter: isVoltage ? (val) => `${val} V` : '{value}'
                    }
                }
            });
        
            this.updateGraph(this.$data);
        }              
    }
    

    connectedCallback() {
        this.resizeObserver = new ResizeObserver(() => {
            if (this.$liveEnergy.offsetWidth > 0 && !this.chart) {
                this.initChart();
                // Start je interval ná init
                this.xAxisInterval = setInterval(() => {
                    this.updateXAxis(this.getAttribute("range") || "oneDay");
                }, 1000);
            }
        });
    
        this.resizeObserver.observe(this.$liveEnergy);
        this.chartObserver = new ResizeObserver(() => {
            if (this.chart) {
                this.chart.resize();
            }
        });
        this.chartObserver.observe(this.$liveEnergy);
        
    }    

    disconnectedCallback() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        if (this.chartObserver) {
            this.chartObserver.disconnect();
        }
        
        if (this.xAxisInterval) {
            clearInterval(this.xAxisInterval);
        }
    }    
    
    updateXAxis(range) {
        if (!this.chart) return;
    
        const now = new Date();
        let minTime, interval, formatter;
    
        switch (range) {
            case 'minute':
                minTime = new Date(now.getTime() - 60 * 1000); // 30 seconden geleden
                formatter = (value) => {
                    let date = new Date(value);
                    let hours = date.getHours();
                    let minutes = date.getMinutes();
                    let seconds = date.getSeconds();
                
                    // Laat enkel labels zien als de seconden een veelvoud van 10 zijn (10, 20, 30, etc.)
                    if (seconds % 10 === 0) {
                        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}'${seconds.toString().padStart(2, '0')}"`;
                    }
                    return ''; // Geen label tonen als het niet op een 10-seconde mark is
                };
                
                break;
            case 'tenMinutes':
                minTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minuten geleden
                formatter = '{HH}:{mm}';
                break;
            case 'oneHour':
                minTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 uur geleden
                formatter = '{HH}:{mm}';
                break;
            case 'sixHour':
                minTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 uur geleden
                formatter = '{HH}:{mm}';
                break;
            case 'oneDay':
                minTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 uur geleden
                formatter = '{HH}:{mm}';
                break;
            default:
                console.error(`Ongeldige range: ${range}`);
                return;
        }
    
        // Update de X-as instellingen
        this.chart.setOption({
            xAxis: {
                min: minTime.getTime(), // Nieuwe minimale tijd
                max: now.getTime(), // Huidige tijd als maximum
                axisLabel: {
                    formatter: formatter, // Gebruik de dynamische formatter
                    interval: interval // Pas de label-interval aan
                },
                axisTick: {
                    interval: interval // Pas de tick-interval aan
                }
            }
        });
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
                tooltip: {
                    trigger: 'axis',
                    confine: true,
                    backgroundColor: '#fff',
                    borderColor: '#ccc',
                    borderWidth: 1,
                    padding: 10,
                    textStyle: {
                        color: '#333',
                        fontSize: 13
                    },
                    extraCssText: `
                        width: auto !important;
                        height: auto !important;
                        max-width: 100%;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        white-space: nowrap;
                        border-radius: 8px;
                    `,
                    formatter: function (params) {
                        const time = echarts.format.formatTime('yyyy-MM-dd hh:mm:ss', params[0].value[0]);
                        const mode = this.getAttribute('mode'); // ⬅️ Hier gebruik je je componentcontext
                    
                        const seen = new Set();
                        const uniqueParams = params.filter(p => {
                            const key = p.seriesName + p.value[0];
                            if (seen.has(key)) return false;
                            seen.add(key);
                            return true;
                        });
                    
                        let content = `<strong>${time}</strong><br/>`;
                        uniqueParams.forEach(p => {
                            let value = p.value[1];
                            if (mode === 'voltage') {
                                value = `${parseFloat(value).toFixed(2)} V`;
                            }
                            content += `
                                <span style="color:${p.color}; font-weight:bold;">●</span> 
                                ${p.seriesName}: ${value}<br/>
                            `;
                        });
                        return content;
                    }.bind(this)  
                },
                color: ['#f39c12', '#BAB9B6', '#3EA4F0'],
                legend: {
                    data: [
                      {
                        name: 'ZON',
                        icon: 'image://Assets/SVGs/solar.png'
                      },
                      {
                        name: 'WIND',
                        icon: 'image://Assets/SVGs/wind.png'
                      },
                      {
                        name: 'WATER',
                        icon: 'image://Assets/SVGs/water.png'
                      }
                    ],
                    top: '5%',
                    itemWidth: 24,    // breedte van het icoon
                    itemHeight: 24,   // hoogte van het icoon
                    textStyle: {
                      fontWeight: 'bold',
                      fontSize: 14,
                      color: '#333'
                    }
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
                    max: this.getAttribute('mode') === 'voltage' ? 3 : 1200,
                    axisLabel: {
                        formatter: this.getAttribute('mode') === 'voltage'
                            ? (val) => `${val} V`
                            : '{value}'
                    }
                },                
                series: [
                    {
                        name: 'ZON',
                        type: 'line',
                        data: [],
                        smooth: true,
                        showSymbol: false,
                        lineStyle: { width: 2 },
                        label: {
                            show: true,
                            position: 'right',
                            formatter: function (params) {
                                return params.value[1]; // toon de y-waarde
                            }
                        },
                        endLabel: {
                            show: true,
                            formatter: (params) => {
                                const mode = this.getAttribute('mode');
                                return mode === 'voltage'
                                    ? `${params.value[1]} V`
                                    : `${params.value[1]}`;
                            },
                            color: '#f39c12',
                            fontWeight: 'bold'
                        }
                    }
                    ,
                    {
                        name: 'WIND',
                        type: 'line',
                        data: [],
                        smooth: true,
                        showSymbol: false,
                        lineStyle: { width: 2 },
                        label: {
                            show: true,
                            position: 'right',
                            formatter: function (params) {
                                return params.value[1]; // toon de y-waarde
                            }
                        },
                        endLabel: {
                            show: true,
                            formatter: (params) => {
                                const mode = this.getAttribute('mode');
                                return mode === 'voltage'
                                    ? `${params.value[1]} V`
                                    : `${params.value[1]}`;
                            },
                            color: '#BAB9B6',
                            fontWeight: 'bold'
                        }
                    },
                    {
                        name: 'WATER',
                        type: 'line',
                        data: [],
                        smooth: true,
                        showSymbol: false,
                        lineStyle: { width: 2 },
                        label: {
                            show: true,
                            position: 'right',
                            formatter: function (params) {
                                return params.value[1]; // toon de y-waarde
                            }
                        },
                        endLabel: {
                            show: true,
                            formatter: (params) => {
                                const mode = this.getAttribute('mode');
                                return mode === 'voltage'
                                    ? `${params.value[1]} V`
                                    : `${params.value[1]}`;
                            },                            
                            color: '#3EA4F0',
                            fontWeight: 'bold'
                        }
                    }
                ]
            });

            this.chart.resize();

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
    
        const threshold = 5000; // 5 seconden in milliseconden
        let solarData = [], windData = [], waterData = [];
    
        // Sorteer de data op tijd
        this.$data.sort((a, b) => new Date(a.time) - new Date(b.time));
    
        for (let i = 0; i < this.$data.length; i++) {
            let current = this.$data[i];
            let previous = this.$data[i - 1];
    
            let time = new Date(current.time).getTime();
            let value = this.getAttribute('mode') === 'voltage'
                ? (current.value / 341).toFixed(3)
                : current.value;

    
            if (previous) {
                let prevTime = new Date(previous.time).getTime();
                if (time - prevTime > threshold) {
                    // Voeg een gat in de grafiek toe door een null-waarde
                    solarData.push([prevTime + 1, null]);
                    windData.push([prevTime + 1, null]);
                    waterData.push([prevTime + 1, null]);
                }
            }
    
            if (current.type === 'SOLAR') solarData.push([time, value]);
            if (current.type === 'WIND') windData.push([time, value]);
            if (current.type === 'WATER') waterData.push([time, value]);
        }
    
        this.chart.setOption({
            series: [
                { name: 'ZON', data: solarData },
                { name: 'WIND', data: windData },
                { name: 'WATER', data: waterData }
            ]
        });
    }
});
//#endregion CLASS
