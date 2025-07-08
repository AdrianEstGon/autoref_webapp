import React from "react";
import { LoadScript } from "@react-google-maps/api";

const GoogleMapsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LoadScript googleMapsApiKey="AIzaSyC24LaFVU6RgtEswKeAvrryUFBg7CBgONQ">
      {children}
    </LoadScript>
  );
};

export default GoogleMapsWrapper;
