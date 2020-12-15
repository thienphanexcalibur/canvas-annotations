import BaseDrawing from "./BaseDrawing";
import { fabric } from "fabric";
import { defaultLineOptions } from "../constants";

export default class PolygonDrawing extends BaseDrawing {
  constructor(canvas, fabric, type) {
    super(canvas, fabric, type);
    this.points = [];
    this.anchorPoint = null;
    this.points = [];
    this.lines = [];
    this._onMouseDblClickCallback = this._onMouseDblClickCallback.bind(this);
    this.__removeAllLinesAndPoints = this.__removeAllLinesAndPoints.bind(this);
    this.showControlPoints = this.showControlPoints.bind(this);
  }

  __registerEvents() {
    super.__registerEvents();
    this.canvas.on("mouse:dblclick", this._onMouseDblClickCallback);
  }

  __removeEvents() {
    super.__removeEvents();
    this.canvas.off("mouse:dblclick", this._onMouseDblClickCallback);
    this.__removeAllLinesAndPoints();
  }

  __removeAllLinesAndPoints() {
    this.lines.forEach((line) => this.canvas.remove(line));
    this.points.forEach((point) => this.canvas.remove(point));
    this.__resetDrawings();
  }

  __resetDrawings() {
    this.points = [];
    this.lines = [];
    this.anchorPoint = [];
  }

  _onMouseMoveCallback(e) {
    if (!this.activeObject) {
      return;
    }
    const pointer = this.canvas.getPointer(e);

    const { x, y } = pointer;

    this.activeObject.set("x2", x);
    this.activeObject.set("y2", y);

    this.activeObject.setCoords();

    this.canvas.renderAll();
  }

  _onMouseDownCallback(e) {
    const pointer = this.canvas.getPointer(e);
    const { x, y } = pointer;
    const line = new this.fabric.Line([x, y], defaultLineOptions);
    this.lines.push(line);
    if (!this.anchorPoint) {
      this.anchorPoint = { x, y };
    }
    this.points.push({ x, y });
    this.canvas.add(line);
    this.canvas.setActiveObject(line);
  }

  _onMouseDblClickCallback(e) {
    const polyline = new this.fabric.Polygon(this.points, {
      originX: "left",
      originY: "top",
      strokeWidth: 2,
      stroke: "red",
      fill: "transparent",
      objectCaching: false
    });
    this.canvas.add(polyline);
    polyline.setCoords();
    this.canvas.setActiveObject(polyline);
    // polyline.on("selected", () => {
    //   this.showControlPoints();
    //   polyline.edit = true;
    // });
    // polyline.on("deselected", (e) => {
    //   polyline.edit = false;
    // });
    this.unsubscribe();
    this.subscribe();
  }
  // define a function that can locate the controls.
  // this function will be used both for drawing and for interaction.
  static polygonPositionHandler(dim, finalMatrix, fabricObject) {
    var x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
      y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;
    return fabric.util.transformPoint(
      { x: x, y: y },
      fabric.util.multiplyTransformMatrices(
        fabricObject.canvas.viewportTransform,
        fabricObject.calcTransformMatrix()
      )
    );
  }

  // define a function that will define what the control does
  // this function will be called on every mouse move after a control has been
  // clicked and is being dragged.
  // The function receive as argument the mouse event, the current trasnform object
  // and the current position in canvas coordinate
  // transform.target is a reference to the current object being transformed,
  static actionHandler(eventData, transform, x, y) {
    const polygon = transform.target,
      currentControl = polygon.controls[polygon.__corner],
      mouseLocalPosition = polygon.toLocalPoint(
        new fabric.Point(x, y),
        "center",
        "center"
      ),
      polygonBaseSize = polygon._getNonTransformedDimensions(),
      size = polygon._getTransformedDimensions(0, 0),
      finalPointPosition = {
        x:
          (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
          polygon.pathOffset.x,
        y:
          (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
          polygon.pathOffset.y
      };
    polygon.points[currentControl.pointIndex] = finalPointPosition;
    return true;
  }

  // define a function that can keep the polygon in the same position when we change its
  // width/height/top/left.
  static anchorWrapper(anchorIndex, fn) {
    return function (eventData, transform, x, y) {
      const fabricObject = transform.target,
        absolutePoint = fabric.util.transformPoint(
          {
            x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
            y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y
          },
          fabricObject.calcTransformMatrix()
        ),
        actionPerformed = fn(eventData, transform, x, y),
        newDim = fabricObject._setPositionDimensions({}),
        polygonBaseSize = fabricObject._getNonTransformedDimensions(),
        newX =
          (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) /
          polygonBaseSize.x,
        newY =
          (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) /
          polygonBaseSize.y;
      fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
      return actionPerformed;
    };
  }

  showControlPoints() {
    // clone what are you copying since you
    // may want copy and paste on different moment.
    // and you do not want the changes happened
    // later to reflect on the copy.
    let poly = this.activeObject;
    poly.hasControls = true;
    if (!poly.edit) {
      const lastControl = poly.points.length - 1;
      poly.cornerStyle = "circle";
      poly.cornerColor = "rgba(0,0,255,0.5)";
      poly.controls = poly.points.reduce(function (acc, point, index) {
        acc["p" + index] = new fabric.Control({
          positionHandler: PolygonDrawing.polygonPositionHandler,
          actionHandler: PolygonDrawing.anchorWrapper(
            index > 0 ? index - 1 : lastControl,
            PolygonDrawing.actionHandler
          ),
          actionName: "modifyPolygon",
          pointIndex: index
        });
        return acc;
      }, {});
    } else {
      poly.cornerColor = "blue";
      poly.cornerStyle = "rect";
      poly.controls = fabric.Object.prototype.controls;
    }
    poly.hasBorders = !poly.edit;
    poly.edit = !poly.edit;
    this.canvas.requestRenderAll();
  }
}
