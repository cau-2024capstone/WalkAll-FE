import React from "react";
import { WebView } from "react-native-webview";

const TMapView = ({ latitude, longitude }) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>TMap Example</title>
      <script src="https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=(키값)"></script>
      <style>
        html, body, #map_div {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
      <div id="map_div"></div>
      <script>
        var map;
        function initTmap(){
          map = new Tmapv2.Map("map_div", {
            center: new Tmapv2.LatLng(${latitude}, ${longitude}),
            width: "100%",
            height: "100%",
            zoom: 15
          });
          
          var marker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(${latitude}, ${longitude}),
            map: map
            
          });
        }
        initTmap();
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html: htmlContent }}
      style={{ flex: 1 }}
    />
  );
};

export default TMapView;
