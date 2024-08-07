let map;
let markers = [];
let businesses = [];

async function initMap() {
    await loadBusinesses();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const mapOptions = {
                    center: { lat: latitude, lng: longitude },
                    zoom: 14,
                    styles: getMapStyles()
                };
                map = new google.maps.Map(document.getElementById("map"), mapOptions);
                await addMarkers(businesses);
                google.maps.event.addListener(map, 'bounds_changed', updateVisibleCards);
            },
            (error) => {
                console.error("Error getting location: ", error);
                alert("Geolocation permission denied. Using default location.");
                initializeMapWithDefaultLocation();
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
        alert("Geolocation is not supported by this browser.");
        initializeMapWithDefaultLocation();
    }
}

function getMapStyles() {
    return [
        { featureType: "poi.business", stylers: [{ visibility: "off" }] },
        { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
        { featureType: "poi.place_of_worship", stylers: [{ visibility: "off" }] },
        { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] },
        { featureType: "poi.school", stylers: [{ visibility: "off" }] },
        { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
        { featureType: "poi.government", stylers: [{ visibility: "off" }] },
    ];
}

function initializeMapWithDefaultLocation() {
    const defaultLocation = { lat: 37, lng: -95 };
    const mapOptions = {
        center: defaultLocation,
        zoom: 8,
        styles: getMapStyles()
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    addMarkers(businesses);
    google.maps.event.addListener(map, 'bounds_changed', updateVisibleCards);
}

async function loadBusinesses() {
    try {
        const response = await fetch('../dataFiles/businesses.json');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        businesses = await response.json();
    } catch (error) {
        console.error('Failed to load businesses:', error);
        alert('Failed to load businesses. Check console for details.');
    }
}

async function addMarkers(businesses) {
    for (const product of businesses) {
        const position = await geocodeAddress(product.address);
        if (position) {
            const marker = new google.maps.Marker({
                map: map,
                position: position,
                title: product.title
            });
            const infoWindow = new google.maps.InfoWindow({
                content: `<div><h3>${product.title}</h3><p>${product.description}</p></div>`
            });
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
            markers.push({ marker, product });
        }
    }
    updateVisibleCards();
}

async function geocodeAddress(address) {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK") {
                resolve(results[0].geometry.location);
            } else {
                console.error(`Geocode was not successful for the following reason: ${status}`);
                resolve(null);
            }
        });
    });
}

function createCard(product) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <div>
            <img src="${product.image}" alt="${product.title}" loading="lazy">
            <h3>${product.title}</h3>
            <p><b>Description:</b> ${product.description}</p>
            <p><b>Address:</b> ${product.address}</p>
            <h4><a href="bought-item.html">BUY NOW</a></h4>
        </div>
    `;
    return card;
}

function displayCards(businesses) {
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML = '';
    businesses.forEach(product => {
        const card = createCard(product);
        cardContainer.appendChild(card);
    });
}

function updateVisibleCards() {
    const bounds = map.getBounds();
    const visibleProducts = markers.filter(({ marker }) => bounds.contains(marker.getPosition())).map(({ product }) => product);
    displayCards(visibleProducts);
}

async function addNewMarker() {
    const title = document.getElementById('markerTitle').value;
    const description = document.getElementById('markerDescription').value;
    const address = document.getElementById('markerAddress').value;
    const newProduct = { title, description, image: "", address, type: "" };
    businesses.push(newProduct);
    const position = await geocodeAddress(address);
    if (position) {
        const marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title
        });
        const infoWindow = new google.maps.InfoWindow({
            content: `<div><h3>${title}</h3><p>${description}</p></div>`
        });
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        markers.push({ marker, product: newProduct });
        updateVisibleCards();
    }
}

document.addEventListener("DOMContentLoaded", initMap);
