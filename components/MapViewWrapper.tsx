/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { Platform } from "react-native";

let MapViewComponent: any;
let MarkerComponent: any;
let PolylineComponent: any;
let providerGoogle: any;

if (Platform.OS === "web") {
  const webModule = require("./MapViewWrapper.web");
  MapViewComponent = webModule.default;
  MarkerComponent = webModule.Marker;
  PolylineComponent = webModule.Polyline;
  providerGoogle = webModule.PROVIDER_GOOGLE;
} else {
  const nativeModule = require("./MapViewWrapper.native");
  MapViewComponent = nativeModule.default;
  MarkerComponent = nativeModule.Marker;
  PolylineComponent = nativeModule.Polyline;
  providerGoogle = nativeModule.PROVIDER_GOOGLE;
}

export const PROVIDER_GOOGLE = providerGoogle;
export const Marker = MarkerComponent;
export const Polyline = PolylineComponent;

export default function MapViewWrapper(props: any) {
  const Component = MapViewComponent;
  return <Component {...props} />;
}
