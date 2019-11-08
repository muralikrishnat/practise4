var bodyLoaded = false;
var mapLoaded = false;
var map = null;
var allPorts = {};
var _allPorts = [];
var portSearchInProgress = false;

async function makeRequest(opts) {
    if (!opts.headers) {
        opts.headers = {
            'x-api-key': 'wfDVtxVYCd6gtc5VLVc3U5wXpE3iNJeU7qUkHr54'
        }
    }
    return fetch(opts.url, opts).then(resp => resp.json());
}

async function getPorts(portName) {
    return makeRequest({
        url: `https://api.searoutes.com/ps/ports-suggest?name=${portName}`
    });
}

const debounce = (func, delay) => { 
    let debounceTimer 
    return function() { 
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    } 
};

async function bindSearchEvent() {
    document.querySelector('.btn-search').addEventListener('click', async function() {
        var fromPort = document.querySelector('[name="fromport"]').value;
        var destinationPort = document.querySelector('[name="destinationort"]').value;
        fromPort = fromPort.split('|')[1];
        destinationPort = destinationPort.split('|')[1];
        var port1 = _allPorts.find(item => item.port_id == fromPort);
        var port2 = _allPorts.find(item => item.port_id == destinationPort);

        var routesResp = await makeRequest({
            url: `https://api.searoutes.com/gr/route/lon:${port1.lon}lat:${port1.lat}/lon:${port2.lon}lat:${port2.lat}?speed=13&roads=block&rivers=block&blockedAreasCsv=23%2C11%2C35%2C13%2C17&type=graph&multiRoute=true`
        });
        var routes = routesResp.getRouteJson[0].routepoints;
        var flightPlanCoordinates = routes.map(item => {
            return {
                lat: item.lat,
                lng: item.lon
            }
        });
        var flightPath = new google.maps.Polyline({
            path: flightPlanCoordinates,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        flightPath.setMap(map);
    });
}

async function bindEvents() {
    if (bodyLoaded && mapLoaded) {
        document.querySelectorAll('.port-names').forEach(elem => {
            // elem.addEventListener('keyup', debounce(async function(event) {
            //     var target = event.target;
            //     var value = target.value;
            //     var dataListElem = target.closest('.form-field').querySelector('datalist');
            //     if (value.length > 1) {
            //         var ports = [];
            //         if (allPorts[value[0].toLowerCase()]) {
            //             ports = allPorts[value[0]];
            //         } else {
            //             var resp = await getPorts(value);
            //             allPorts[value[0].toLowerCase()] = resp.ports;
            //             ports = resp.ports;
            //         }
            //         var optionsHtmlStr = '';
            //         ports.forEach(item => {
            //             optionsHtmlStr += `<option value="${item.port_name}"></option>`;
            //         });
            //         dataListElem.innerHTML = optionsHtmlStr;
            //     }
            // }, 3000));

            elem.addEventListener('keyup', debounce(async function(event) {
                var target = event.target;
                var value = target.value;
                var dataListElem = target.closest('.form-field').querySelector('datalist');
                if (value.length > 1 && value.indexOf('|') < 0) {
                    var ports = [];
                    var valueToSearch = value[0] + value[1];
                    if (allPorts[valueToSearch.toLowerCase()]) {
                        ports = allPorts[value[0]];
                    } else {
                        var resp = await getPorts(value);
                        allPorts[valueToSearch.toLowerCase()] = resp.ports;
                        _allPorts = _allPorts.concat(resp.ports);
                        ports = resp.ports;
                    }
                    var optionsHtmlStr = '';
                    if (ports) {
                        ports.forEach(item => {
                            optionsHtmlStr += `<option value="${item.port_name}|${item.port_id}"></option>`;
                        });
                        dataListElem.innerHTML = optionsHtmlStr;
                    }
                }
            }, 2000));
        });

        bindSearchEvent();
    }
}

function bodyLoad() {
    bodyLoaded = true;
    bindEvents();
}