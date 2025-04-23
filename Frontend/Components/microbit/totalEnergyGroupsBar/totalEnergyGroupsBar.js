//#region IMPORTS
//#endregion IMPORTS

//#region TOTALENERGYGROUPSBAR
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
//#endregion TOTALENERGYGROUPSBAR

//#region CLASS
window.customElements.define('totalenergygroupsbar-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
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

    //services
    async loadAndRenderData() {
        try {
            const session = JSON.parse(sessionStorage.getItem('loggedInUser'));
            const currentGroupId = session?.groupId || this.getAttribute('groupId');
            
            const response = await fetch(`${window.env.BACKEND_URL}/groups/`);
            const groups = await response.json();
    
            const sorted = groups.sort((a, b) => b.energy - a.energy);
            const groupNames = sorted.map(g => g.name);
            const energyValues = sorted.map(g => g.energy);

            const barColors = sorted.map(g => g.id === currentGroupId ? '#9FDAF9' : '#002757');
    
            if (!this._chart) {
                const chartEl = this._shadowRoot.querySelector('#chart');
                this._chart = echarts.init(chartEl);
            }

            const formatEnergy = (val) => {
                return val >= 1000
                    ? `${(val / 1000).toFixed(3)} kWh`
                    : `${val.toFixed(5)} Wh`;
            };
    
            this._chart.setOption({
                title: {
                    text: 'Totaal opgeleverde energie',
                    left: 'center',
                    top: 10,
                    textStyle: {
                        fontSize: 18,
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: params =>
                        params.map(p => `${p.name}: ${formatEnergy(p.value)}`).join('<br/>')
                },
                xAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: val => formatEnergy(val)
                    }
                },
                yAxis: {
                    type: 'category',
                    data: groupNames,
                    inverse: true,
                },
                series: [
                    {
                        type: 'bar',
                        data: energyValues.map((val, index) => ({
                            value: val,
                            itemStyle: { color: barColors[index] }
                        })),
                        name: 'Energie',
                        label: {
                            show: true,
                            position: 'right',
                            formatter: val => formatEnergy(val.value)
                        }
                    }
                ]                
            });

            setTimeout(() => {
                this.chart.resize();
            }, 100);
    
        } catch (error) {
            console.error('Fout bij ophalen groepsdata:', error);
        }
    }
    
});
//#endregion CLASS
