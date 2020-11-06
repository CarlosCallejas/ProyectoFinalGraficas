let renderer = null, 
scene = null, 
camera = null,
root = null,
dancer = null,
group = null,
orbitControls = null,
mixer = null;

let duration = 20000; // ms
let currentTime = Date.now();
let dancers = [];
let listener, audioLoader, sound =  null;
let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let mapUrl = "../images/checker_large.gif";

//pista
let pistas = new THREE.Object3D;

let anim1 = "../models/dancer/fbx/Hip Hop Dancing.fbx"
let anim2 = "../models/dancer/fbx/Breakdance Uprock Var 2.fbx"
let anim3 = "../models/dancer/fbx/Brooklyn Uprock.fbx"
let anim4 = "../models/dancer/fbx/Capoeira.fbx"
let anim5 = "../models/dancer/fbx/Dancing Twerk.fbx"
let anim6 = "../models/dancer/fbx/Flair.fbx"
let anim7 = "../models/dancer/fbx/Samba Dancing.fbx"
let anim8 = "../models/dancer/fbx/Silly Dancing.fbx"


let SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

async function loadFBX()
{
    let loader = promisifyLoader(new THREE.FBXLoader());

    try{
        let object = await loader.load( anim5);
        object.mixer = new THREE.AnimationMixer( scene );
        let action = object.mixer.clipAction( object.animations[ 0 ], object );
        object.scale.set(0.3, 0.3, 0.3);
        object.position.y -= 4;
        action.play();
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        console.log(object.animations);
        dancer = object;
        dancers.push(dancer);
        scene.add( object );
    }
    catch(err)
    {
        console.error( err );
    }
}

function onKeyDown(event)
{
    switch(event.keyCode)
    {
        case 65:
            console.log("Cloning dancer");
            let newDancer = cloneFbx(dancer);
            newDancer.mixer =  new THREE.AnimationMixer( scene );
            let action = newDancer.mixer.clipAction( newDancer.animations[ 0 ], newDancer );
            action.play();
            dancers.push(newDancer);
            scene.add(newDancer);
            console.log(dancers);
            break;
    }
}

function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    if ( dancers.length > 0) 
    {
        for(dancer_i of dancers)
            dancer_i.mixer.update( ( deltat ) * 0.001 );
    }
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );

    // Spin the cube for next frame
    animate();

    // Update the camera controller
    orbitControls.update();
}
function setBackgroundMusic(){
    //Cargar un sonido y configurarlo como el Audio Object's buffer
    //Como es musica para background se reproduce en bucle
    audioLoader.load( '../sounds/background.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.5 );
        sound.play();
    }); 
}
function createScene(canvas) {
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-5, 30, 80);
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.target = new THREE.Vector3(0,20,0);
        
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    let spotLights = [];

    spotLight = new THREE.SpotLight (0x00fa00);
    spotLight.position.set(40, 70, -10);
    spotLight.target.position.set(-2, 0, -2);
    spotLights.push(spotLight);
    root.add(spotLight);

    spotLight = new THREE.SpotLight (0x5500ff);
    spotLight.position.set(0, 70, -40);
    spotLight.target.position.set(-2, 0, -2);
    spotLights.push(spotLight);
    root.add(spotLight);

    spotLight = new THREE.SpotLight (0xfaf600);
    spotLight.position.set(0, 70, 40);
    spotLight.target.position.set(-2, 0, -2);
    spotLights.push(spotLight);
    root.add(spotLight);

    for(let sp of spotLights)
    {
        sp.castShadow = true;

        sp.shadow.camera.near = 1;
        sp.shadow.camera.far = 200;
        sp.shadow.camera.fov = 45;
        
        sp.shadow.mapSize.width = SHADOW_MAP_WIDTH;
        sp.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    }

    ambientLight = new THREE.AmbientLight ( 0x222222 );
    root.add(ambientLight);
    listener = new THREE.AudioListener();
    audioLoader = new THREE.AudioLoader();
    camera.add( listener ); //Se añade el listener a la camara
    sound = new THREE.Audio( listener );
    // Set background music
    setBackgroundMusic();
    // Create the objects
    loadFBX();

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);


    //crear las pistas
    let lado = 40
    let otroLado = lado+(lado/2)
        // Create a texture map
        let map = new THREE.TextureLoader().load(mapUrl);
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(8, 8);
    for(i = 0; i<4; i++){
        var geometry = new THREE.PlaneGeometry( lado, lado, 50, 50 );
        var material = new THREE.MeshPhongMaterial( {color: 0xffffff,side: THREE.DoubleSide} );
        var plane = new THREE.Mesh( geometry, material );
        plane.position.set(-otroLado+lado*i,0,-lado/2);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -4.02;
        plane.castShadow = false;
        plane.receiveShadow = true;
        pistas.add(plane);
        var planes = new THREE.Mesh( geometry, material );
        planes.position.set(-otroLado+lado*i,0,lado/2);
        planes.rotation.x = -Math.PI / 2;
        planes.position.y = -4.02;
        pistas.add(planes);
    }
    group.add( pistas );

    // Now add the group to our scene
    scene.add( root );
}