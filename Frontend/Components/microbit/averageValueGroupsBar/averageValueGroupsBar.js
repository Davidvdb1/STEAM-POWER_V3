//#region IMPORTS
//#endregion IMPORTS

//#region AVERAGEVALUEGROUPSBAR
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        :host {
            display: block;
            width: 100%;
            max-width: 700px;
        }

        #chart {
            width: 100%;
            height: 420px;
            border: 1px solid #ddd;
            background-color: #fafafa;
            border-radius: 10px;
        }
    </style>

    <div id="chart" style= "width: 100%"></div>
`;
//#endregion AVERAGEVALUEGROUPSBAR

//#region CLASS
window.customElements.define('averagevaluegroupsbar-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.chart = null;
        this.range = 'oneDay';
        this.mode = 'microbit';
    }

    static get observedAttributes() {
        return ["range", "mode"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "range") {
            this.range = newValue;
            this.loadAndRenderData();
        }
        if (name === "mode") {
            this.mode = newValue;
            if (this.chart) this.loadAndRenderData();
        }
    }

    connectedCallback() {
        this.initChart();
        this.loadAndRenderData();
    
        this._interval = setInterval(() => {
            this.loadAndRenderData();
        }, 5000);
    
        this.resizeObserver = new ResizeObserver(() => {
            if (this.chart) {
                this.chart.resize();
            }
        });
    
        this.resizeObserver.observe(this._shadowRoot.querySelector('#chart'));
    }
    
    disconnectedCallback() {
        if (this._interval) clearInterval(this._interval);
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }    

    async loadAndRenderData() {
        const session = JSON.parse(sessionStorage.getItem('loggedInUser'));
        const currentGroupId = session?.groupId || this.getAttribute('groupId');

        const response = await fetch(`${window.env.BACKEND_URL}/groups/`);
        const groups = await response.json();

        const now = new Date();
        const fromTime = this.getStartTime(this.range);
        const titleMap = {
            minute: 'Gemiddelde waarde (afgelopen minuut)',
            tenMinutes: 'Gemiddelde waarde (afgelopen 10 minuten)',
            oneHour: 'Gemiddelde waarde (afgelopen uur)',
            sixHour: 'Gemiddelde waarde (afgelopen 6 uur)',
            oneDay: 'Gemiddelde waarde (afgelopen 24 uur)'
        };

        const groupResults = await Promise.all(groups.map(async group => {
            const res = await fetch(`${window.env.BACKEND_URL}/energydata/${group.id}`);
            const data = await res.json();

            const filtered = data.filter(d => new Date(d.time) >= fromTime && d.value > 0);
            if (!filtered.length) return { name: group.name, avg: 0, id: group.id };

            const rawAvg = filtered.reduce((sum, d) => sum + d.value, 0) / filtered.length;
            const avg = this.mode === 'voltage' ? rawAvg / 341 : rawAvg;

            return { name: group.name, avg: parseFloat(avg.toFixed(2)), id: group.id };
        }));

        const sorted = groupResults.sort((a, b) => b.avg - a.avg);

        this.chart.setOption({
            title: {
                text: titleMap[this.range],
                left: 'center',
                top: 10,
                textStyle: { fontSize: 18, fontWeight: 'bold' }
            },
            tooltip: {
                trigger: 'axis',
                formatter: params => {
                    return params.map(p => `${p.name}: ${p.value}${this.mode === 'voltage' ? ' V' : ''}`).join('<br/>')
                }
            },
            xAxis: {
                type: 'value',
                axisLabel: {
                    formatter: val => this.mode === 'voltage' ? `${val.toFixed(2)} V` : `${val}`
                }
            },
            yAxis: {
                type: 'category',
                data: sorted.map(g => g.name),
                inverse: true
            },
            series: [
                {
                    type: 'bar',
                    data: sorted.map(g => ({
                        value: g.avg,
                        itemStyle: {
                            color: g.id === currentGroupId ? '#9FDAF9' : '#002757'
                        }
                    })),
                    label: {
                        show: true,
                        position: 'right',
                        formatter: val => this.mode === 'voltage' ? `${val.value} V` : `${val.value}`
                    }
                }
            ]
        });
    }

    getStartTime(range) {
        const now = new Date();
        switch (range) {
            case 'minute': return new Date(now.getTime() - 60 * 1000);
            case 'tenMinutes': return new Date(now.getTime() - 10 * 60 * 1000);
            case 'oneHour': return new Date(now.getTime() - 60 * 60 * 1000);
            case 'sixHour': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
            case 'oneDay': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
    }

    initChart() {
        const el = this._shadowRoot.querySelector('#chart');
        this.chart = echarts.init(el);
    
        setTimeout(() => {
            this.chart.resize();
        }, 100);
    }    
});
//#endregion CLASS