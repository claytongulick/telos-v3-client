/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
import {html, svg, render} from 'lit-html';

class ComponentLogo extends HTMLElement {

    constructor() {
        super();
        this.color="white";
    }

    get logo_mode() {
        return this._logo_mode;
    }

    set logo_mode(value) {
        this._logo_mode = value;
        this.render();
    }

    connectedCallback() {
        this.template = () => html`
            <style>
                :host {
                    display: block;
                }
            </style>

            ${this.logo_mode == "text" ?
            svg`
                <svg width="256" height="64" viewBox="0 0 4464 1286" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1044.92 229.36H1129.52V688.08L1321.28 495.38H1438.78L1231.04 697.48L1456.64 940H1336.32L1129.52 708.76V940H1044.92V229.36ZM1538.94 494.44H1623.54V940H1538.94V494.44ZM1519.2 334.64C1519.2 317.72 1525.15 303.307 1537.06 291.4C1549.59 278.867 1564.32 272.6 1581.24 272.6C1598.16 272.6 1612.57 278.867 1624.48 291.4C1637.01 303.307 1643.28 317.72 1643.28 334.64C1643.28 351.56 1637.01 366.287 1624.48 378.82C1612.57 390.727 1598.16 396.68 1581.24 396.68C1564.32 396.68 1549.59 390.727 1537.06 378.82C1525.15 366.287 1519.2 351.56 1519.2 334.64ZM1996.94 567.76H1875.68V769.86C1875.68 782.393 1876 794.927 1876.62 807.46C1877.25 819.367 1879.44 830.333 1883.2 840.36C1887.59 849.76 1893.86 857.593 1902 863.86C1910.78 869.5 1923.31 872.32 1939.6 872.32C1949.63 872.32 1959.97 871.38 1970.62 869.5C1981.28 867.62 1990.99 864.173 1999.76 859.16V936.24C1989.74 941.88 1976.58 945.64 1960.28 947.52C1944.62 950.027 1932.4 951.28 1923.62 951.28C1891.04 951.28 1865.66 946.893 1847.48 938.12C1829.94 928.72 1816.78 916.813 1808 902.4C1799.86 887.987 1794.84 872.007 1792.96 854.46C1791.71 836.287 1791.08 818.113 1791.08 799.94V567.76H1693.32V494.44H1791.08V369.42H1875.68V494.44H1996.94V567.76ZM2106.09 229.36H2190.69V563.06H2192.57C2203.23 539.247 2221.71 520.133 2248.03 505.72C2274.35 490.68 2304.75 483.16 2339.21 483.16C2360.52 483.16 2380.89 486.607 2400.31 493.5C2420.37 499.767 2437.6 509.793 2452.01 523.58C2467.05 537.367 2478.96 555.227 2487.73 577.16C2496.51 598.467 2500.89 623.847 2500.89 653.3V940H2416.29V676.8C2416.29 656.12 2413.47 638.573 2407.83 624.16C2402.19 609.12 2394.67 597.213 2385.27 588.44C2375.87 579.04 2364.91 572.46 2352.37 568.7C2340.47 564.313 2327.93 562.12 2314.77 562.12C2297.23 562.12 2280.93 564.94 2265.89 570.58C2250.85 576.22 2237.69 585.307 2226.41 597.84C2215.13 609.747 2206.36 625.1 2200.09 643.9C2193.83 662.7 2190.69 684.947 2190.69 710.64V940H2106.09V229.36Z" fill="#161925"/>
                    <path d="M3291.88 231.36H3376.48V690.08L3568.24 497.38H3685.74L3478 699.48L3703.6 942H3583.28L3376.48 710.76V942H3291.88V231.36ZM3785.9 496.44H3870.5V942H3785.9V496.44ZM3766.16 336.64C3766.16 319.72 3772.11 305.307 3784.02 293.4C3796.55 280.867 3811.28 274.6 3828.2 274.6C3845.12 274.6 3859.53 280.867 3871.44 293.4C3883.97 305.307 3890.24 319.72 3890.24 336.64C3890.24 353.56 3883.97 368.287 3871.44 380.82C3859.53 392.727 3845.12 398.68 3828.2 398.68C3811.28 398.68 3796.55 392.727 3784.02 380.82C3772.11 368.287 3766.16 353.56 3766.16 336.64ZM4005.14 496.44H4089.74V565.06H4091.62C4102.28 541.247 4120.76 522.133 4147.08 507.72C4173.4 492.68 4203.8 485.16 4238.26 485.16C4259.57 485.16 4279.94 488.607 4299.36 495.5C4319.42 501.767 4336.65 511.793 4351.06 525.58C4366.1 539.367 4378.01 557.227 4386.78 579.16C4395.56 600.467 4399.94 625.847 4399.94 655.3V942H4315.34V678.8C4315.34 658.12 4312.52 640.573 4306.88 626.16C4301.24 611.12 4293.72 599.213 4284.32 590.44C4274.92 581.04 4263.96 574.46 4251.42 570.7C4239.52 566.313 4226.98 564.12 4213.82 564.12C4196.28 564.12 4179.98 566.94 4164.94 572.58C4149.9 578.22 4136.74 587.307 4125.46 599.84C4114.18 611.747 4105.41 627.1 4099.14 645.9C4092.88 664.7 4089.74 686.947 4089.74 712.64V942H4005.14V496.44Z" fill="#161925"/>
                    <path d="M2941.64 942.16V755.84H3127.96V682.52H2941.64V496.2H2868.32V682.52H2682V755.84H2868.32V942.16H2941.64Z" fill="#161925"/>
                    <path d="M258 970.69C387.235 970.69 492 865.924 492 736.69C492 607.455 387.235 502.69 258 502.69C128.765 502.69 24 607.455 24 736.69C24 865.924 128.765 970.69 258 970.69Z" stroke="#161925" stroke-width="48"/>
                    <path d="M521 1062.69C611.022 1062.69 684 989.712 684 899.69C684 809.667 611.022 736.69 521 736.69C430.978 736.69 358 809.667 358 899.69C358 989.712 430.978 1062.69 521 1062.69Z" stroke="#161925" stroke-width="48"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M457 294C290.21 294 155 429.21 155 596C155 762.79 290.21 898 457 898C623.79 898 759 762.79 759 596C759 429.21 623.79 294 457 294ZM81 596C81 388.341 249.341 220 457 220C664.659 220 833 388.341 833 596C833 803.659 664.659 972 457 972C249.341 972 81 803.659 81 596Z" fill="#56AEB8"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M457 294C290.21 294 155 429.21 155 596C155 762.79 290.21 898 457 898C623.79 898 759 762.79 759 596C759 429.21 623.79 294 457 294ZM81 596C81 388.341 249.341 220 457 220C664.659 220 833 388.341 833 596C833 803.659 664.659 972 457 972C249.341 972 81 803.659 81 596Z" fill="url(#paint0_linear)"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M457 294C290.21 294 155 429.21 155 596C155 762.79 290.21 898 457 898C623.79 898 759 762.79 759 596C759 429.21 623.79 294 457 294ZM81 596C81 388.341 249.341 220 457 220C664.659 220 833 388.341 833 596C833 803.659 664.659 972 457 972C249.341 972 81 803.659 81 596Z" fill="url(#paint1_linear)"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M457 294C290.21 294 155 429.21 155 596C155 762.79 290.21 898 457 898C623.79 898 759 762.79 759 596C759 429.21 623.79 294 457 294ZM81 596C81 388.341 249.341 220 457 220C664.659 220 833 388.341 833 596C833 803.659 664.659 972 457 972C249.341 972 81 803.659 81 596Z" fill="url(#paint2_linear)"/>
                    <path d="M258 502.69C128.765 502.69 24 607.455 24 736.69" stroke="#161925" stroke-width="48"/>
                    <path d="M669.887 966.134C678.957 945.841 684 923.354 684 899.69C684 809.667 611.022 736.69 521 736.69" stroke="#161925" stroke-width="48"/>
                    <defs>
                    <linearGradient id="paint0_linear" x1="242.5" y1="327" x2="50.5001" y2="681.5" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#56AEB8"/>
                    <stop offset="0.372693" stop-color="#00646B"/>
                    <stop offset="0.791323" stop-color="#00646B"/>
                    <stop offset="1" stop-color="#57AFB9"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="593.5" y1="785" x2="677" y2="890" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#56AEB8" stop-opacity="0"/>
                    <stop offset="0.863617" stop-color="#02666D"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear" x1="81" y1="569.5" x2="202" y2="596" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#02676E"/>
                    <stop offset="1" stop-color="#58B0BA" stop-opacity="0"/>
                    </linearGradient>
                    </defs>
                </svg>

            `
            :
            svg`
                <svg width="64" height="64" viewBox="0 0 1286 1286" fill="none" style="width: 100%; height: 100%;" xmlns="http://www.w3.org/2000/svg">
                    <path d="M258 970.69C387.235 970.69 492 865.924 492 736.69C492 607.455 387.235 502.69 258 502.69C128.765 502.69 24 607.455 24 736.69C24 865.924 128.765 970.69 258 970.69Z" stroke="#161925" stroke-width="48"/>
                    <path d="M521 1062.69C611.022 1062.69 684 989.712 684 899.69C684 809.667 611.022 736.69 521 736.69C430.978 736.69 358 809.667 358 899.69C358 989.712 430.978 1062.69 521 1062.69Z" stroke="#161925" stroke-width="48"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M457 294C290.21 294 155 429.21 155 596C155 762.79 290.21 898 457 898C623.79 898 759 762.79 759 596C759 429.21 623.79 294 457 294ZM81 596C81 388.341 249.341 220 457 220C664.659 220 833 388.341 833 596C833 803.659 664.659 972 457 972C249.341 972 81 803.659 81 596Z" fill="#56AEB8"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M457 294C290.21 294 155 429.21 155 596C155 762.79 290.21 898 457 898C623.79 898 759 762.79 759 596C759 429.21 623.79 294 457 294ZM81 596C81 388.341 249.341 220 457 220C664.659 220 833 388.341 833 596C833 803.659 664.659 972 457 972C249.341 972 81 803.659 81 596Z" fill="url(#paint0_linear)"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M457 294C290.21 294 155 429.21 155 596C155 762.79 290.21 898 457 898C623.79 898 759 762.79 759 596C759 429.21 623.79 294 457 294ZM81 596C81 388.341 249.341 220 457 220C664.659 220 833 388.341 833 596C833 803.659 664.659 972 457 972C249.341 972 81 803.659 81 596Z" fill="url(#paint1_linear)"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M457 294C290.21 294 155 429.21 155 596C155 762.79 290.21 898 457 898C623.79 898 759 762.79 759 596C759 429.21 623.79 294 457 294ZM81 596C81 388.341 249.341 220 457 220C664.659 220 833 388.341 833 596C833 803.659 664.659 972 457 972C249.341 972 81 803.659 81 596Z" fill="url(#paint2_linear)"/>
                    <path d="M258 502.69C128.765 502.69 24 607.455 24 736.69" stroke="#161925" stroke-width="48"/>
                    <path d="M669.887 966.134C678.957 945.841 684 923.354 684 899.69C684 809.667 611.022 736.69 521 736.69" stroke="#161925" stroke-width="48"/>
                    <defs>
                    <linearGradient id="paint0_linear" x1="242.5" y1="327" x2="50.5001" y2="681.5" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#56AEB8"/>
                    <stop offset="0.372693" stop-color="#00646B"/>
                    <stop offset="0.791323" stop-color="#00646B"/>
                    <stop offset="1" stop-color="#57AFB9"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="593.5" y1="785" x2="677" y2="890" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#56AEB8" stop-opacity="0"/>
                    <stop offset="0.863617" stop-color="#02666D"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear" x1="81" y1="569.5" x2="202" y2="596" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#02676E"/>
                    <stop offset="1" stop-color="#58B0BA" stop-opacity="0"/>
                    </linearGradient>
                    </defs>
                </svg>
            `
            }
            
        `;

        this.render();
    }

    render() {
        render(this.template(), this);
    }


}

customElements.define('app-logo', ComponentLogo);
export default ComponentLogo;