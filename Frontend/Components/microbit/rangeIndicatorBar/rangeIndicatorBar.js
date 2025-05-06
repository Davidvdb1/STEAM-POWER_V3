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
        this.$data = [];
        this.$isChartReady = false;
    }

    static get observedAttributes() {
        return ['mode', 'range'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'mode' || name === 'range') {
            this.updateBar(); 
        }
    }    

    connectedCallback() {
        setTimeout(() => {
            this.initChart();
        }, 50);
    }

    setFullData(data) {
        this.$data = data;
        this.updateBar();
    }

    updateBar(newData = null) {
        if (newData) {
            this.$data.push(newData);
        }

        const rangeMappings = {
            minute: 1,
            tenMinutes: 10,
            oneHour: 60,
            sixHour: 360,
            oneDay: 1440
        };

        let filteredData = [...this.$data];
        const rangeAttr = this.getAttribute('range');
        if (rangeAttr) {
            const rangeMinutes = rangeMappings[rangeAttr] || 1440;
            const rangeMs = rangeMinutes * 60 * 1000;
            const cutoff = Date.now() - rangeMs;
            filteredData = filteredData.filter(d => {
                const rawTs = d.time;
                const ts = (rawTs instanceof Date)
                    ? rawTs.getTime()
                    : typeof rawTs === 'string'
                        ? new Date(rawTs).getTime()
                        : rawTs;                
                return typeof ts === 'number' && !isNaN(ts) && ts >= cutoff;
            });
        }

        const validData = filteredData.filter(d => d.value > 0);
        let min = 0;
        let max = 0;
        let current = 0;

        if (validData.length === 1) {
            max = this.convertValue(validData[0].value);
            current = max;
        } else if (validData.length >= 2) {
            const convertedValues = validData.map(d => this.convertValue(d.value));
            const allSame = convertedValues.every(v => v === convertedValues[0]);
        
            if (allSame) {
                // Behandel als één datapunt: links waarde, rechts 0
                max = convertedValues[0];
                current = max;
                min = 0;
            } else {
                min = Math.min(...convertedValues);
                max = Math.max(...convertedValues);
                current = convertedValues[convertedValues.length - 1];
            }
        }

        if (!this.chart) {
            this.initChart();
        }

        const barWidth = max - min || 1;
        const suffix = this.getAttribute('mode') === 'voltage' ? ' V' : '';

        this.chart.setOption({
            xAxis: {
                min: min,
                max: max || 1
            },
            series: [
                {
                    type: 'bar',
                    stack: 'range',
                    data: [min],
                    barWidth: 30,
                    itemStyle: { color: 'transparent' }
                },
                {
                    type: 'bar',
                    stack: 'range',
                    data: [barWidth],
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
                                    formatter: () => `${min}${suffix}`,
                                    position: 'left',
                                    fontWeight: 'bold',
                                    color: '#000'
                                },
                                itemStyle: { color: 'transparent' }
                            },
                            {
                                xAxis: max || 1,
                                yAxis: 'Day Range',
                                label: {
                                    show: true,
                                    formatter: () => `${max}${suffix}`,
                                    position: 'right',
                                    fontWeight: 'bold',
                                    color: '#000'
                                },
                                itemStyle: { color: 'transparent' }
                            },
                            {
                                symbol: `image://Assets/SVGs/${this.id}.png`,
                                xAxis: current,
                                yAxis: 'Day Range',
                                label: {
                                    show: true,
                                    formatter: () => `${current}${suffix}`,
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

    initChart() {
        if (this.chart) {
            this.chart.dispose();
        }
        this.chart = echarts.init(this.$liveEnergy);
        this.$isChartReady = true;

        this.chart.setOption({
            xAxis: {
                type: 'value',
                show: false
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
    }

    convertValue(value) {
        const mode = this.getAttribute('mode');
        return mode === 'voltage' ? parseFloat((value / 341).toFixed(3)) : value;
    }
});
//#endregion CLASS