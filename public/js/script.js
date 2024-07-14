const socket = io();
let markers = {};

if(navigator.geolocation){
    try {
        navigator.geolocation.watchPosition((position) => {
            const {latitude, longitude} = position.coords;
            socket.emit('send-location', {latitude, longitude});
        },(error) => {
            console.error(error);
        },{
            enableHighAccuracy : true,
            timeout: 5000,
            maximumAge: 0
        })
    } catch (error) {
        console.error(error);
    }
}else{
    alert("no geo-location support available")
}

const map = L.map('map').setView([0,0],16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: 'real time location',
}).addTo(map);


try {
    socket.on('recieved-location',(data) => {
        const {id, longitude, latitude} = data;
        map.setView([latitude, longitude])
    
        if(markers[id]){
            markers[id].setLatLng([latitude, longitude],16);
        }else{
            markers[id] = L.marker([latitude, longitude]).addTo(map);
        }    
    })
} catch (error) {
    console.error(error);
}

try {
    socket.on('user-disconnected',(id) => {
        if(markers[id]){
            alert("user disconnected id: " + id);
            map.removeLayer(markers[id]);
            delete markers[id];
        }
    })
} catch (error) {
    console.error(error);
}