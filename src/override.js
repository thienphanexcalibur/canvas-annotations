import { fabric } from "fabric";

export const Polygon = fabric.util.createClass(fabric.Polygon, {
  initialize(points, options) {
    this.callSuper("initialize", points, options);
    this.on("selected", () => {});
  }
});
