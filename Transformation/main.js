import * as THREE from "./three.module.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
console.log(window.innerWidth);
console.log(window.innerHeight);
const scene = new THREE.Scene();
// let ttt = new THREE.Vector3().crossVectors(
//   new THREE.Vector3(1, 0, -1),
//   new THREE.Vector3(-1, -1, -1)
// );
// console.log(ttt);
//camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight
);
camera.position.set(0, 50, 0);

// camera.position.set(0, 50, 0);
camera.lookAt(0, 0, 0); //box position

console.log("cam:", camera);
console.log("cam.up:", camera.up);
// console.log("cam.Worldup:", camera_world_up);

//light
const ambientLight = new THREE.AmbientLight(0x404040);
ambientLight.position.set(15, 50, 15);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 20, 20);

//floor
const plane_geo = new THREE.PlaneGeometry(100, 100, 1, 1);
const plane_material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
const plane = new THREE.Mesh(plane_geo, plane_material);
plane.position.set(0, -5, 0);
plane.lookAt(0, 100, 0);
plane.up.set(0, 1, 0);

//box
const box_side = 10;
const box_geo = new THREE.BoxGeometry(box_side, box_side, box_side);
const texture = new THREE.TextureLoader();
const material = new THREE.MeshPhongMaterial({
  map: texture.load("./image.PNG"),
});
/*
 - 'r' :  큐브의 x 축 방향으로 3도 rotation
 - 't' :  큐브의 y 축 방향으로 3도 rotation
 - 'y' :  큐브의 z 축 방향으로 3도 rotation
 - 'f' :  큐브의 x 축 방향으로 -3도 rotation
 - 'g' :  큐브의 y 축 방향으로 -3도 rotation
 - 'h' :  큐브의 z 축 방향으로 -3도 rotation
(40점)
 - 'a' :  큐브를 화면의 왼쪽 방향으로 10 pix 만큼 평행 이동
 - 'd' :  큐브를 화면의 오른쪽 방향으로 10 pix 만큼 평행 이동
 - 'w' :  큐브를 화면의 위쪽 방향으로 10 pix 만큼 평행 이동
 - 's' :  큐브를 화면의 아래쪽 방향으로 10 pix 만큼 평행 이동
*/
const box = new THREE.Mesh(box_geo, material);
box.position.set(0, 0, 0);
box.lookAt(0, 1, 0);
box.up.set(0, 1, 0);
box.matrixAutoUpdate = false;

let box_world_position = new THREE.Vector3();
box.getWorldPosition(box_world_position);

let current_matrix = new THREE.Matrix4();
current_matrix.copy(box.matrix);

// Rotation
// key 'r' > x 3 degree
let mat_r = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(3));
// key 't' > y 3 degree
let mat_t = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(3));
// key 'y' > z 3 degree
let mat_y = new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(3));
// key 'f' > x 3 degree
let mat_f = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(-3));
// key 'g' > y 3 degree
let mat_g = new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(-3));
// key 'h' > z 3 degree
let mat_h = new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(-3));

// Translation
let degree_v_10pixel = (camera.fov * 10) / window.innerHeight;

let vec_to_camera = new THREE.Vector3(
  box_world_position.x - camera.position.x,
  box_world_position.y - camera.position.y,
  box_world_position.z - camera.position.z
);

let mat_trans_to_camera;

let mat_rota_by_camera;

let Vec_by_camera_X = new THREE.Vector3();

function Rota_by_camera_X(degree) {
  if (vec_to_camera.x == 0) {
    mat_rota_by_camera = new THREE.Matrix4().makeRotationX(
      THREE.MathUtils.degToRad(degree)
    );
    return mat_rota_by_camera;
  } else if (vec_to_camera.z == 0) {
    mat_rota_by_camera = new THREE.Matrix4().makeRotationZ(
      THREE.MathUtils.degToRad(degree)
    );
    return mat_rota_by_camera;
  } else {
    console.log("none case");
  }
  // 50 100 50
  // 50 0 -50
  mat_rota_by_camera = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(-vec_to_camera.z, 0, vec_to_camera.x).normalize(),
    THREE.MathUtils.degToRad(degree)
  );
  console.log(
    "not x z는 0이 아님, vec",
    new THREE.Vector3(vec_to_camera.z, 0, -vec_to_camera.x)
  );
  return mat_rota_by_camera;
}
// function Rota_by_camera_X(degree) {
//   mat_rota_by_camera = new THREE.Matrix4().makeRotationX(
//     THREE.MathUtils.degToRad(degree)
//   );
//   return mat_rota_by_camera;
// }

function Rota_by_camera_Z(degree) {
  if (vec_to_camera.x == 0) {
    mat_rota_by_camera = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(10, 0, 0)
        .cross(
          new THREE.Vector3(vec_to_camera.x, vec_to_camera.y, vec_to_camera.z)
        )
        .normalize(),
      THREE.MathUtils.degToRad(degree)
    );

    console.log(
      "vec_to_camera.x == 0",
      new THREE.Vector3(10, 0, 0).cross(
        new THREE.Vector3(vec_to_camera.x, vec_to_camera.y, vec_to_camera.z)
      )
    );
    return mat_rota_by_camera;
  } else if (vec_to_camera.z == 0) {
    mat_rota_by_camera = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 10)
        .cross(
          new THREE.Vector3(vec_to_camera.x, vec_to_camera.y, vec_to_camera.z)
        )
        .normalize(),
      THREE.MathUtils.degToRad(degree)
    );
    console.log(
      "vec_to_camera.z == 0",
      new THREE.Vector3(0, 0, 10).cross(
        new THREE.Vector3(vec_to_camera.x, vec_to_camera.y, vec_to_camera.z)
      )
    );
    return mat_rota_by_camera;
  } else {
    console.log("none case");
  }

  mat_rota_by_camera = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(-vec_to_camera.z, 0, vec_to_camera.x)
      .cross(
        new THREE.Vector3(vec_to_camera.x, vec_to_camera.y, vec_to_camera.z)
      )
      .normalize(),
    THREE.MathUtils.degToRad(degree)
  );
  console.log(
    "dmat",
    new THREE.Vector3(0, 0, 1).cross(
      new THREE.Vector3(vec_to_camera.x, vec_to_camera.y, vec_to_camera.z)
    )
    // 50 0 -50
    // -50 -100 -50
    // 100 -50 0
  );
  return mat_rota_by_camera;
}
console.log(vec_to_camera.y);
console.log(vec_to_camera.x);

const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);
// scene.add(plane);
scene.add(ambientLight);
scene.add(light);
scene.add(box);

document.addEventListener("keydown", (event) => {
  box.getWorldPosition(box_world_position);

  vec_to_camera = new THREE.Vector3(
    box_world_position.x - camera.position.x,
    box_world_position.y - camera.position.y,
    box_world_position.z - camera.position.z
  );

  mat_trans_to_camera = new THREE.Matrix4().makeTranslation(
    vec_to_camera.x,
    vec_to_camera.y,
    vec_to_camera.z
  );
  //rotation
  switch (event.key) {
    case "r":
      console.log(camera.position);
      box.matrix.multiply(mat_r);
      break;
    case "t":
      box.matrix.multiply(mat_t);
      // box.applyMatrix4(mat_r);
      break;
    case "y":
      box.matrix.multiply(mat_y);
      break;
    case "f":
      box.matrix.multiply(mat_f);
      break;
    case "g":
      box.matrix.multiply(mat_g);
      break;
    case "h":
      box.matrix.multiply(mat_h);
      break;

    case "r":
      box.matrix.multiply(mat_r);
      break;
    case "r":
      box.matrix.multiply(mat_r);
      break;

    //translation
    case "a":
      //y기준 시계반대, 즉 우측 봄
      // mat_trans_to_camera = new THREE.Matrix4().makeTranslation(0, 15, 0);
      mat_rota_by_camera = Rota_by_camera_Z(degree_v_10pixel);
      box.matrix.premultiply(mat_trans_to_camera);
      console.log(mat_trans_to_camera);
      break;

    case "b":
      mat_rota_by_camera = Rota_by_camera_Z(5);
      box.matrix.premultiply(mat_rota_by_camera);
      break;

    case "c":
      mat_trans_to_camera = new THREE.Matrix4().makeTranslation(0, -50, 0);
      mat_rota_by_camera = Rota_by_camera_Z(degree_v_10pixel);
      box.matrix.premultiply(mat_trans_to_camera.invert());
      break;

    case "d":
      mat_rota_by_camera = Rota_by_camera_Z(-degree_v_10pixel);
      box.matrix
        .premultiply(mat_trans_to_camera)
        .premultiply(mat_rota_by_camera)
        .premultiply(mat_trans_to_camera.invert());
      break;
    case "w":
      mat_rota_by_camera = Rota_by_camera_X(degree_v_10pixel);
      box.matrix
        // .premultiply(mat_trans_to_camera)
        .premultiply(mat_rota_by_camera);
      // .premultiply(mat_trans_to_camera.invert());
      break;
    case "s":
      mat_rota_by_camera = Rota_by_camera_X(-degree_v_10pixel);
      box.matrix
        .premultiply(mat_trans_to_camera)
        .premultiply(mat_rota_by_camera)
        .premultiply(mat_trans_to_camera.invert());
      break;

    //test@@@@@@@@@@@@@@@@@@@@@@@@@@

    case "z":
      mat_rota_by_camera = Rota_by_camera_Z(degree_v_10pixel);
      box.matrix
        .premultiply(mat_trans_to_camera)
        .premultiply(mat_rota_by_camera)
        .premultiply(mat_trans_to_camera.invert());

      break;

    case "x":
      mat_rota_by_camera = Rota_by_camera_Z(15);
      // mat_rota_by_camera = Rota_by_camera_Z(degree_h_10pixel);
      box.matrix
        // .premultiply(mat_trans_to_camera)
        .premultiply(mat_rota_by_camera);
      // .premultiply(mat_trans_to_camera.invert());
      console.log(mat_trans_to_camera);
      break;
  }
});

animate();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
