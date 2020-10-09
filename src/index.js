import 'regenerator-runtime/runtime';
import "./styles.css";
import { fabric } from "fabric";
import testImg from "../testocr.png";
import { RectangleDrawing, PolygonDrawing } from "./drawing";
import { waitImageLoad } from './utils';


(async function init() {

  let type = 'rect';

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
  const imageNode = document.createElement("img");
  imageNode.src = testImg;


  // Wait for image to load
  await waitImageLoad(imageNode);

  // INIT CANVAS with image
  const canvas = new fabric.Canvas("c", {
    width: imageNode.naturalWidth,
    height: imageNode.narualHeight,
    selectable: true
  });
  const imgInstance = new fabric.Image(imageNode, {
    selectable: false
  });
  canvas.add(imgInstance);


  // Init Instance
  const drawRectangle = new RectangleDrawing(canvas, fabric);
  const drawPolygon = new PolygonDrawing(canvas, fabric);

  // Default to draw rectangle
  drawInstance = drawRectangle;

  const drawRectangleBtn = document.querySelector('.draw-rectangle');
  const drawPolygonBtn = document.querySelector('.draw-polygon');


  // Events
  drawRectangleBtn.addEventListener('click', (e) => {
    drawInstance.unsubscribe();
    drawInstance = drawRectangle;
  });


  drawPolygonBtn.addEventListener('click', (e) => {
    drawInstance.unsubscribe();
    drawInstance = drawPolygon;
  });


  buttonControl.addEventListener("click", () => {
    // Drawing on
    toggleIsDrawing(true);
    drawInstance.subscribe();
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
