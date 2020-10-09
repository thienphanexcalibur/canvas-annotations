export const defaultRectOptions = {
  strokeWidth: 2,
  stroke: "red",
  fill: "transparent",
  width: 20,
  height: 20,
  strokeUniform: true,
  noScaleCache: false,
  objectCaching: false
};

export const defaultPolygonOptions = {
  strokeWidth: 2,
  stroke: "red",
  fill: "transparent",
  strokeUniform: true,
  noScaleCache: false
};

export const drawingMode = {
  RECTANGLE: "RECTANGLE",
  POLYGON: "POLYGON"
};

export default class initDrawings {
  /**
   *
   * @param {fabric.Canvas} canvas
   * @param {fabric} fabric
   * @param {*} type
   * @returns {void}
   * @constructor
   */
  constructor(canvas, fabric, type) {
    this.canvas = canvas;
    this.fabric = fabric;
    this.origX = null;
    this.origY = null;
    this.subscribed = false;
    this.type = type;
    this.setDrawingMode = this.setDrawingMode.bind(this);
    this.drawing = false;
    this._onMouseDownCallback = this._onMouseDownCallback.bind(this);
    this._onMouseMoveCallback = this._onMouseMoveCallback.bind(this);
    this._setDrawing = this._setDrawing.bind(this);
    this._lockObjects = this._lockObjects.bind(this);
    this._onMouseUpCallback = this._onMouseUpCallback.bind(this);
    this._registerEvents = this._registerEvents.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  setDrawingMode(type) {
    this.type = type;
  }

  subscribe() {
    this.subscribed = true;
    this.canvas.discardActiveObject().renderAll();
    this._registerEvents();
    this._setDrawing(true);
    this._lockObjects(this.objects, true);
  }

  unsubscribe() {
    if (!this.subscribed) {
      return;
    }
    this.subscribed = false;
    this.canvas.discardActiveObject().renderAll();
    this._removeEvents();
    this._setDrawing(false);
    this._lockObjects(this.objects, false);
  }

  /**
   * Set Drawing Status
   * @param {Boolean} value
   */
  _setDrawing(value) {
    this.drawing = value;
    return;
  }

  /**
   * Lock current active object
   * @param {Array<fabric.Object> | fabric.Object} objects
   * @param {Boolean} value
   */
  _lockObjects(object, value) {
    if (Array.isArray(object)) {
      console.log(object);
      object.forEach((fabricObject) => {
        fabricObject.set("lockMovementX", value);
        fabricObject.set("lockMovementY", value);
        fabricObject.evented = !value;
      });
      return;
    }
    object.set("lockMovementX", value);
    object.set("lockMovementY", value);
    object.evented = !value;
  }

  /**
   * (Computed)
   * Returns current canvas objects
   * @param {void}
   * @returns {Array<fabric.Object>}
   */
  get objects() {
    return this.canvas.getObjects(this.type);
  }

  /**
   *
   * (Computed)
   * Returns current canvas active object
   * @param {void}
   * @returns {Array<fabric.Object>}
   */
  get activeObject() {
    return this.canvas.getActiveObject();
  }

  /**
   * (Computed)
   * Returns current canvas active objects
   * @returns {Array<fabric.Object>}
   */
  get activeObjects() {
    return this.canvas.getActiveObjects();
  }

  /**
   * (Computed)
   * Returns current canvas active group
   * @returns {fabric.Group}
   */
  get activeGroup() {
    return this.canvas.getActiveGroup();
  }

  _removeSelectedObjects() {
    this.activeObjects.forEach((object) => {
      this.canvas.fxRemove(object);
    });
  }

  _removeEvents() {
    this.canvas.off("mouse:move", this._onMouseMoveCallback);
    this.canvas.off("mouse:down", this._onMouseDownCallback);
    this.canvas.off("mouse:up", this._onMouseUpCallback);
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
    if (this.type) {
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
  }

  // mouse up cb
  _onMouseUpCallback(e) {
    this._lockObjects(this.objects, true);
    this.activeObject.set("thien", "deptrai");
    this.canvas.discardActiveObject(this.activeObject).renderAll();
    setTimeout(() => {
      if (this.activeObject && this.activeObject.get("width") === 0) {
        this.canvas.remove(this.activeObject);
      }
    }, 100);
  }

  _registerEvents() {
    // On mose move create start to draw Rect
    this.canvas.on("mouse:move", this._onMouseMoveCallback);
    this.canvas.on("mouse:down", this._onMouseDownCallback);
    this.canvas.on("mouse:up", this._onMouseUpCallback);
  }
}
