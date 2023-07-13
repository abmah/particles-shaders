import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import vertex from './shaders/vertexShader.glsl'
import fragment from './shaders/fragmentShader.glsl'
import gsap from 'gsap'



class Model {
  constructor(obj) {

    this.name = obj.name
    this.file = obj.file
    this.scene = obj.scene
    this.placeOnLoad = obj.placeOnLoad
    this.isActive = false
    this.background = obj.background


    this.color1 = obj.color1
    this.color2 = obj.color2

    this.loader = new GLTFLoader()
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('./draco/')
    this.loader.setDRACOLoader(this.dracoLoader)


    this.init()

  }

  init() {
    this.loader.load(this.file, (gltf) => {

      /*------------------------------
      Mesh
      ------------------------------*/

      this.mesh = gltf.scene.children[0]

      /*------------------------------
      Material
      ------------------------------*/

      this.material = new THREE.MeshBasicMaterial({ color: 'red', wireframe: true })
      this.mesh.material = this.material

      /*------------------------------
      Geometry Mesh
      ------------------------------*/

      this.geometry = this.mesh.geometry

      /*------------------------------
      Particles Material
      ------------------------------*/

      // this.particlesMaterial = new THREE.PointsMaterial({
      //   color: 'red',
      //   size: 0.02,
      // })


      this.particlesMaterial = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 0.02 },
          uColor1: { value: new THREE.Color(this.color1) },
          uColor2: { value: new THREE.Color(this.color2) },
          uScale: { value: 0.0 },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uTime: { value: 0 },
      })

      /*------------------------------
      Particles Geometry
      ------------------------------*/

      const sampler = new MeshSurfaceSampler(this.mesh).build()
      const numParticles = 20000
      this.particlesGeometry = new THREE.BufferGeometry()
      const particlesPositions = new Float32Array(numParticles * 3)

      const particlesRandomness = new Float32Array(numParticles * 3)


      for (let i = 0; i < numParticles; i++) {
        const newPosition = new THREE.Vector3()
        sampler.sample(newPosition)
        particlesPositions.set(newPosition.toArray(), i * 3)

        particlesRandomness.set([
          Math.random() * 2 - 1, // -1 to 1
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
        ], i * 3)

      }


      this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3))
      this.particlesGeometry.setAttribute('aRandom', new THREE.BufferAttribute(particlesRandomness, 3))



      /*------------------------------
      Particles
      ------------------------------*/

      this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial)

      /*------------------------------
      Place on load
      ------------------------------*/
      if (this.placeOnLoad) {
        this.add()
      }

    })
  }

  add() {
    this.scene.add(this.particles)
    this.isActive = true




    gsap.to(this.particlesMaterial.uniforms.uScale, {
      value: 1,
      duration: .8,
      delay: 0.3,
      ease: 'power3.out'
    })

    gsap.to(document.body, {
      background: this.background,
      duration: 0.8
    });



    if (!this.isActive) {


      gsap.fromTo(this.particles.rotation, {
        y: Math.PI
      }, {
        y: 0,
        duration: .8,
        ease: 'power3.out'

      })


    }

    this.isActive = true
  }

  remove() {

    gsap.to(this.particlesMaterial.uniforms.uScale, {
      value: 0,
      duration: .8,
      ease: 'power3.out',
      onComplete: () => {
        this.scene.remove(this.particles)
        this.isActive = false
      }
    })

    gsap.to(this.particles.rotation, {
      y: Math.PI,
      duration: .8,
      ease: 'power3.out'
    })
  }
}

export default Model