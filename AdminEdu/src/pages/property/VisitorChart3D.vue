<template>
  <div ref="Ref3D" class="three-divs">
    <!-- <div class="canvas-box">
      <canvas class="can1"></canvas>
      <canvas class="can2"></canvas>
    </div> -->
  </div>
</template>
  
<script lang="ts" setup>
import * as THREE from "three";
import { ref, onMounted } from "vue";
import imgs from "@/assets/vue.svg";
const Ref3D = ref<any>(null);

onMounted(() => {
  //创建场景
  const scene = new THREE.Scene();
  //创建相机
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  //设置场景的背景颜色
  scene.background = new THREE.Color("#0272fe");
  //设置场景的背景图
  // const loader = new THREE.TextureLoader()
  // loader.load(imgs,function(t){
  //   scene.background =  t
  // })
  //设置相机位置 x:1,y:1,z:8
  camera.position.set(2, 200, 20);
  camera.lookAt(0, 0, 0);
  //创建渲染器
  const renderer = new THREE.WebGLRenderer({
    // canvas: document.querySelector(".can2"),
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  Ref3D.value.appendChild(renderer.domElement);

  const cude = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshBasicMaterial()
  );

  scene.add(cude);
  // let angle = 0;
  const gridHelper = new THREE.GridHelper( 100,10 );
  scene.add(gridHelper)
  const animate = () => {
    requestAnimationFrame(animate);
    // cude.rotation.x += 0.01;
    // cude.rotation.y += 0.01;
    // const radius = 3;
    // angle += 0.01;
    // camera.position.x = radius + Math.cos(angle);
    // camera.position.z = radius + Math.sin(angle);
    // camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  animate();

  renderer.domElement.addEventListener('mousedown',()=>{})
  renderer.domElement.addEventListener('mousemove',()=>{})
  renderer.domElement.addEventListener('mouseup',()=>{})
});
</script>
  
<style scoped>
* {
  margin: 0;
  padding: 0;
}
.three-divs {
  width: 1000vw;
  height: 100vh;
  overflow: hidden;
}
.canvas-box {
  display: flex;
}
.can1,
.can2 {
  width: 500px;
  height: 500px;
  margin: 0px 20px;
  border: 1px solid black;
}
</style>
  