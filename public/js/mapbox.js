/* eslint-disable */

export const displayMap = locationsString => {
  const locations =
    locationsString && Array.isArray(JSON.parse(locationsString))
      ? JSON.parse(locationsString)
      : [];

  mapboxgl.accessToken =
    'pk.eyJ1IjoidGhhbmd0cmFuY29kZSIsImEiOiJjanl2ZTI4dmIwMWZxM21teG5pc3o0Y2EyIn0.9EW5KrDuVwgZxFHPm575Ig';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/thangtrancode/ck1w9b9c80ezi1cnydv9a3m9t',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  if (locations && locations.length > 0) {
    locations.forEach(location => {
      // Add marker
      const element = document.createElement('div');
      element.className = 'marker';
      new mapboxgl.Marker({
        element: element,
        anchor: 'bottom'
      })
        .setLngLat(location.coordinates)
        .addTo(map);

      // Add popup
      new mapboxgl.Popup({
        offset: 30,
        closeButton: false
      })
        .setLngLat(location.coordinates)
        .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
        .addTo(map);

      // Extend map bounds to include current location
      bounds.extend(location.coordinates);
    });
    map.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
      }
    });
  }
};
