import React from "react";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, MapViewProps } from "react-native-maps";

export { Marker, Polyline, PROVIDER_GOOGLE };

export default function SmartMapView(props: MapViewProps) {
  return <MapView {...props} />;
}
