import BaseDrawing from './BaseDrawing';
import { defaultLineOptions } from '../constants';

export default class PolygonDrawing extends BaseDrawing {
  constructor(canvas, fabric, type) {
    super(canvas, fabric, type);
    this.points = [];
    this.anchorPoint = null;
    this.points = [];
    this.lines = [];
    this._onMouseDblClickCallback = this._onMouseDblClickCallback.bind(this);
    this.__removeAllLines = this.__removeAllLines.bind(this);
  }

  __registerEvents() {
    super.__registerEvents();
    this.canvas.on('mouse:dblclick', this._onMouseDblClickCallback);
  }

  __removeEvents() {
    super.__removeEvents();
    this.canvas.off('mouse:dblclick', this._onMouseDblClickCallback);
    this.__removeAllLines();
  }


  __removeAllLines() {
      this.lines.forEach(line => this.canvas.remove(line));
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

    this.activeObject.set('x2', x);
    this.activeObject.set('y2', y);

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
    this.points.pop();
    this.lines.pop();
    const polyline = new this.fabric.Polygon(this.points, {
      originX: 'left',
      originY: 'top',
      strokeWidth: 2,
      stroke: 'red',
      fill: 'transparent'
    });
    this.__removeAllLines();
    this.unsubscribe();
    this.subscribe();
    this.canvas.add(polyline);
  }
}
