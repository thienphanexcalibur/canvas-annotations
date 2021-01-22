import "regenerator-runtime/runtime";
import "./styles.css";
import { fabric } from "fabric";
import testImg from "../testocr.png";
import { RectangleDrawing, PolygonDrawing } from "./drawing";
import { waitImageLoad } from "./utils";
import mockJSON from "./mock.json";

const mock = false;

// This one gives me a fucking hardship fuckkkkkk
// Override behaviour of Polygon prototype
fabric.util.object.extend(fabric.Polygon.prototype, {
  initialize(points, options) {
    this.callSuper("initialize", points, options);

    this.on("selected", () => {
      const lastControl = points.length - 1;
      this.cornerStyle = "circle";
      this.cornerColor = "rgb(0,0,255)";
      this.controls = points.reduce(function (acc, point, index) {
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
    });
    this.on("deselected", () => {
      this.cornerColor = "blue";
      this.cornerStyle = "rect";
      this.controls = fabric.Object.prototype.controls;
    });
  }
});

(async function init() {
  let type = "rect";

  let drawInstance = null;
  // Control Button
  const buttonControl = document.createElement("button");
  buttonControl.innerText = "Start Drawing";

  function toggleIsDrawing(value) {
    const statusNode = document.querySelector(".status");
    if (value) {
      statusNode.innerHTML = "Drawing... Press ESC to quit drawing";
    } else {
      statusNode.innerHTML = "";
      statusNode.appendChild(buttonControl);
    }
  }

  // Image tag
  const imageNode = document.querySelector("#static_image");
  imageNode.src = testImg;

  // Wait for image to load
  await waitImageLoad(imageNode);

  // INIT CANVAS with image
  const canvas = new fabric.Canvas("c", {
    width: imageNode.naturalWidth,
    height: imageNode.narualHeight,
    selectable: true
  });

  if (mock) {
    canvas.loadFromJSON(mockJSON, canvas.requestRenderAll.bind(canvas));
  }

  // Init Instance
  const drawRectangle = new RectangleDrawing(canvas, fabric, 'rect', (object) => console.log(object));
  const drawPolygon = new PolygonDrawing(canvas, fabric, 'polygon', (object) => console.log(object));

  // Default to draw rectangle
  drawInstance = drawRectangle;

  // Button selectors
  const drawRectangleBtn = document.querySelector(".draw-rectangle");
  const drawPolygonBtn = document.querySelector(".draw-polygon");
  const serializeBtn = document.querySelector(".serialize");

  // Events
  drawRectangleBtn.addEventListener("click", (e) => {
    drawInstance.unsubscribe();
    drawInstance = drawRectangle;
  });

  drawPolygonBtn.addEventListener("click", (e) => {
    drawInstance.unsubscribe();
    drawInstance = drawPolygon;
  });

  buttonControl.addEventListener("click", () => {
    // Drawing on
    toggleIsDrawing(true);
    drawInstance.subscribe();
  });

  serializeBtn.addEventListener("click", () => {
    console.log(canvas.toObject());
  });

  toggleIsDrawing(false);

  window.addEventListener("keydown", (e) => {
    switch (e.which) {
      case 27: // ESC - Quit Drawing Mode
        // Drawing off
        toggleIsDrawing(false);
        drawInstance.unsubscribe();
        break;
      case 8: // BACKSPACE - Delete Objects
        drawInstance.__removeSelectedObjects();
        break;
      default:
        break;
    }
  });

  function toggleIsDrawing(value) {
    const statusNode = document.querySelector(".status");
    if (value) {
      statusNode.innerHTML = "Drawing... Press ESC to quit drawing";
    } else {
      statusNode.innerHTML = "";
      statusNode.appendChild(buttonControl);
    }
  }
})();
