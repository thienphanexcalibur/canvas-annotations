import BaseDrawing from "./BaseDrawing";
import { defaultRectOptions } from "../constants";

export default class RectangleDrawing extends BaseDrawing {
  constructor(canvas, fabric, type) {
    super(canvas, fabric, type);
  }
  // MOuse move cb
  _onMouseMoveCallback(e) {
    if (!this.activeObject) {
      return;
    }
    const pointer = this.canvas.getPointer(e);
    if (pointer.x < this.origX) {
      this.activeObject.set("left", pointer.x);
    }
    if (pointer.y < this.origY) {
      this.activeObject.set("top", pointer.y);
    }
    this.activeObject.set({
      width: Math.abs(pointer.x - this.origX),
      height: Math.abs(pointer.y - this.origY)
    });
    this.activeObject.setCoords();
    this.canvas.renderAll();
  }

  // mouse down cb
  _onMouseDownCallback(e) {
      const pointer = this.canvas.getPointer(e);
      this.origX = pointer.x;
      this.origY = pointer.y;
      const rect = new this.fabric.Rect({
        ...defaultRectOptions,
        left: this.origX,
        top: this.origY,
        width: 0,
        height: 0,
        selectionBackgroundColor: "rgba(245, 245, 220, 0.5)"
      });

      this.canvas.add(rect);
      this.canvas.setActiveObject(rect);
      return;
  }

  // mouse up cb
  _onMouseUpCallback(e) {
    this.__lockObjects(this.objects, true);
    this.activeObject.set("thien", "deptrai");
    this.canvas.discardActiveObject(this.activeObject).renderAll();
    setTimeout(() => {
      if (this.activeObject && this.activeObject.get("width") === 0) {
        this.canvas.remove(this.activeObject);
      }
    }, 100);
  }
}
