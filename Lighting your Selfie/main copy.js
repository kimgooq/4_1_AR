const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

document.addEventListener("mousedown", MouseDown, false);
document.addEventListener("mousemove", MouseMove, false);
document.addEventListener("mouseup", MouseUp, false);

// document.addEventListener("mousewheel", MouseWheel, false);

import * as THREE from "three";
import { TRIANGULATION } from "./triangulation.js";
import { OrbitControls } from "https://unpkg.com/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/Line2.js";
import { LineMaterial } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "https://unpkg.com/three@0.133.1/examples/jsm/lines/LineGeometry.js";

const renderer = new THREE.WebGLRenderer();
const r_width = 640;
const r_height = 480;
renderer.setSize(r_width, r_height);
renderer.setViewport(0, 0, r_width, r_height);
document.body.appendChild(renderer.domElement);

const camera_ar = new THREE.PerspectiveCamera(45, r_height / r_width, 1, 500);
camera_ar.position.set(0, 0, 100);
// camera_ar.lookAt(0, 0, 0);
camera_ar.up.set(0, 1, 0);
const camera_helper = new THREE.CameraHelper(camera_ar);

const renderer_world = new THREE.WebGLRenderer();
renderer_world.setSize(r_width, r_height);
renderer_world.setViewport(0, 0, r_width, r_height);
document.body.appendChild(renderer_world.domElement);

const camera_world = new THREE.PerspectiveCamera(
  45,
  r_height / r_width,
  1,
  500
);
camera_world.position.set(50, 50, 150);
// camera_ar.lookAt(0, 0, 0);
camera_world.up.set(0, 1, 0);

const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(0, 0, camera_ar.position.z - camera_ar.near);
// light.position.set(50, 0, 99);
const ambientlight = new THREE.AmbientLight(0xffffff, 0.4);
ambientlight.position.set(0, 0, camera_ar.near);

const light_helper = new THREE.DirectionalLightHelper(light, 1);
console.log("light_position", light.position);
const controls = new OrbitControls(camera_world, renderer_world.domElement);
controls.update();

let mouseX = 0,
  mouseY = 0;
let HalfX = r_width / 2;
let HalfY = r_height / 2;

const mouse = new THREE.Vector2();
const rayCast = new THREE.Raycaster();

const scene = new THREE.Scene();
const texture_bg = new THREE.VideoTexture(videoElement);
scene.background = texture_bg;
scene.add(light);
scene.add(ambientlight);
scene.add(light_helper);
scene.add(camera_helper);

let oval_point_mesh = null;
let oval_line = null;
let face_mesh = null; // value for THREE

function ProjScale(p_ms, cam_pos, src_d, dst_d) {
  let vec_cam2p = new THREE.Vector3().subVectors(p_ms, cam_pos);
  return new THREE.Vector3().addVectors(
    cam_pos,
    vec_cam2p.multiplyScalar(dst_d / src_d)
  );
}

function onResults2(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
        color: "#C0C0C070",
        lineWidth: 1,
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
        color: "#E0E0E0",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: "#E0E0E0" });

      if (oval_point_mesh == null) {
        let oval_point_geo = new THREE.BufferGeometry();
        let oval_line_geo = new LineGeometry();
        const num_oval_points = FACEMESH_FACE_OVAL.length;
        const oval_vertices = []; //new Float32Array(num_oval_points);
        for (let i = 0; i < num_oval_points; i++) {
          const index = FACEMESH_FACE_OVAL[i][0];
          const pos_ns = landmarks[index];
          // 0 ~ 1 -> -1 ~ 1
          const pos_ps = new THREE.Vector3(
            (pos_ns.x - 0.5) * 2,
            -(pos_ns.y - 0.5) * 2,
            pos_ns.z
          );
          let pos_ws = new THREE.Vector3(
            pos_ps.x,
            pos_ps.y,
            pos_ps.z
          ).unproject(camera_ar);
          //oval_vertices[i] = pos_ws;
          oval_vertices.push(pos_ws.x, pos_ws.y, pos_ws.z);
          // oval_vertices_line.push(pos_ws.x, pos_ws.y, pos_ws.z);
        }
        const oval_vertices_line = oval_vertices.slice();
        oval_vertices_line.push(
          oval_vertices_line[0],
          oval_vertices_line[1],
          oval_vertices_line[2]
        );
        // console.log(oval_vertices);
        // oval_vertices_line = oval_vertices;
        // oval_vertices_line.push(oval_vertices[0]);
        const point_mat = new THREE.PointsMaterial({
          color: 0xff0000,
          size: 3,
        });
        const line_mat = new LineMaterial({
          color: 0x00ff00,
          linewidth: 0.01, // in world units with size attenuation, pixels otherwise
          // vertexColors: true,
          //resolution:  // to be set by renderer, eventually
          dashed: false,
          //   alphaToCoverage: true,
        });
        // oval_point_geo.setFromPoints(oval_vertices);
        oval_point_geo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(oval_vertices, 3)
        );
        oval_line_geo.setPositions(oval_vertices_line);
        oval_point_mesh = new THREE.Points(oval_point_geo, point_mat);
        oval_line = new Line2(oval_line_geo, line_mat);
        oval_line.computeLineDistances();

        let face_geometry = new THREE.BufferGeometry();
        face_geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(landmarks.length * 3), 3) // x, y, z -> length*3
        );
        face_geometry.setAttribute(
          "normal",
          new THREE.BufferAttribute(new Float32Array(landmarks.length * 3), 3) // x, y, z -> length*3
        );
        face_geometry.setAttribute(
          "uv",
          new THREE.BufferAttribute(new Float32Array(landmarks.length * 2), 2) // x, y, z -> length*3
        );
        let face_material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          specular: new THREE.Color(0, 0, 0),
          shininess: 100,
        });
        face_mesh = new THREE.Mesh(face_geometry, face_material);
        face_mesh.geometry.setIndex(TRIANGULATION);

        scene.add(oval_point_mesh);
        scene.add(oval_line);
        scene.add(face_mesh);
      }

      const p_c = new THREE.Vector3(0, 0, 0).unproject(camera_ar);
      const vec_cam2center = new THREE.Vector3().subVectors(
        p_c,
        camera_ar.position
      );
      const center_dist = vec_cam2center.length();

      const num_oval_points = FACEMESH_FACE_OVAL.length;
      let positions = oval_point_mesh.geometry.attributes.position.array;
      let positions_line = new Float32Array(positions.length + 9);

      for (let i = 0; i < num_oval_points; i++) {
        const index = FACEMESH_FACE_OVAL[i][0];
        const pos_ns = landmarks[index];
        // 0 ~ 1 -> -1 ~ 1
        const pos_ps = new THREE.Vector3(
          (pos_ns.x - 0.5) * 2,
          -(pos_ns.y - 0.5) * 2,
          pos_ns.z
        );
        let pos_ws = new THREE.Vector3(pos_ps.x, pos_ps.y, pos_ps.z).unproject(
          camera_ar
        );
        //oval_vertices[i] = pos_ws;
        pos_ws = ProjScale(pos_ws, camera_ar.position, center_dist, 100.0);
        positions[3 * i + 0] = pos_ws.x;
        positions[3 * i + 1] = pos_ws.y;
        positions[3 * i + 2] = pos_ws.z;

        positions_line[3 * i + 0] = pos_ws.x;
        positions_line[3 * i + 1] = pos_ws.y;
        positions_line[3 * i + 2] = pos_ws.z;
        if (i == num_oval_points - 1) {
          positions_line[3 * i + 3] = positions_line[0];
          positions_line[3 * i + 4] = positions_line[1];
          positions_line[3 * i + 5] = positions_line[2];

          positions_line[3 * i + 6] = positions_line[3];
          positions_line[3 * i + 7] = positions_line[4];
          positions_line[3 * i + 8] = positions_line[5];

          positions_line[3 * i + 9] = positions_line[6];
          positions_line[3 * i + 10] = positions_line[7];
          positions_line[3 * i + 11] = positions_line[8];
        }
      }
      oval_point_mesh.geometry.attributes.position.needsUpdate = true;
      oval_line.geometry.setPositions(positions_line);
      // oval_line.geometry.attributes.position.needsUpdate = positions;
      // oval_line.geometry.attributes.position.needsUpdate = true;

      const num_points = landmarks.length; // type script 에서는.. compiled language 에선 필요 X 48:45
      for (let i = 0; i < num_points; i++) {
        // const index = landmarks[i];
        const pos_ns = landmarks[i];
        // 0 ~ 1 -> -1 ~ 1
        const pos_ps = new THREE.Vector3(
          (pos_ns.x - 0.5) * 2,
          -(pos_ns.y - 0.5) * 2,
          pos_ns.z
        );
        let pos_ws = new THREE.Vector3(pos_ps.x, pos_ps.y, pos_ps.z).unproject(
          camera_ar
        );
        pos_ws = ProjScale(pos_ws, camera_ar.position, center_dist, 100.0);
        // console.log(pos_ws);
        //oval_vertices[i] = pos_ws;
        face_mesh.geometry.attributes.position.array[3 * i + 0] = pos_ws.x;
        face_mesh.geometry.attributes.position.array[3 * i + 1] = pos_ws.y;
        face_mesh.geometry.attributes.position.array[3 * i + 2] = pos_ws.z;
        face_mesh.geometry.attributes.uv.array[2 * i + 0] = pos_ns.x;
        face_mesh.geometry.attributes.uv.array[2 * i + 1] = 1.0 - pos_ns.y;
      }
      face_mesh.geometry.attributes.position.needsUpdate = true;
      face_mesh.geometry.attributes.uv.needsUpdate = true;
      face_mesh.geometry.computeVertexNormals();

      let texure_frame = new THREE.CanvasTexture(results.image);
      face_mesh.material.map = texure_frame;

      light.target = face_mesh;
    }
  }
  renderer.render(scene, camera_ar);
  renderer_world.render(scene, camera_world);
  canvasCtx.restore();
}

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
faceMesh.onResults(onResults2);

/*const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});*/
// camera.start();
let IsPressed = false;
function MouseDown(e) {
  IsPressed = true;
}
function MouseUp(e) {
  IsPressed = false;
}

function MouseMove(e) {
  if (IsPressed == true) {
    mouse.x = (e.clientX / r_width) * 2 - 1;
    mouse.y = -(e.clientY / r_height) * 2 + 1;

    rayCast.setFromCamera(mouse, camera_ar);

    // let intersects = rayCast.intersectObjects(scene.children);
    // console.log(intersects[0]);
    // if (intersects.length == 0) {
    //   return;
    // }
    // console.log(rayCast.ray);
    let n;
    n = -camera_ar.near / rayCast.ray.direction.z;
    // console.log(n);

    light.position.set(
      rayCast.ray.direction.x * n,
      rayCast.ray.direction.y * n,
      camera_ar.position.z + rayCast.ray.direction.z * n
    );

    console.log(light.position);
    // if (INTERSECTED != intersects[0].object) {
    //   INTERSECTED = intersects[0].object;
    //   scene.remove(INTERSECTED);
    //   audio.play();
    //   //console.log(INTERSECTED);
    // }
  }
  // MouseMove(e);
}

videoElement.muted = true;
videoElement.play();

async function detectFrame(now, metadata) {
  await faceMesh.send({ image: videoElement });
  videoElement.requestVideoFrameCallback(detectFrame);
}
detectFrame();
