let renderer = null, 
scene = null, 
camera = null,
root = null,
dancer = null,
group = null,
orbitControls = null,
mixer = null;


let box = null


let duration = 20000; // ms
let currentTime = Date.now();
let dancers = [];

let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let mapUrl = "../images/checker_large.gif";

//pista
//objeto THREE vacio con el cual vamos a añadir todas las pistas a la escena
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
        let object = await loader.load( anim4);
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
    //intento de hacer que el rectangulo siga la camara
    //creo que sera mejor con una UI
    //encontre esto https://github.com/poki/three-ui 
    //note to self: alch ya me estrese supongo que lo vere despues
    box.position.set(camera.position.x,camera.position.y,camera.position.z-100)
    console.log("camera: ")
    console.log(camera.position)
    console.log("box: ")
    console.log(box.position)

    // Update the camera controller
    orbitControls.update();
}
function setBackgroundMusic(){
    const listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    const sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
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
    //aqui limitamos el zoom del orbit controller para que no salga del skybox
    orbitControls.maxDistance = 400;
    //con esto ponemos que rote automaticamente al rededor del bailarín
        //estaria bueno que con cada click del mouse lo detuvieramos
    orbitControls.autoRotate = false;
    //con esto quitamos el pan para que la camara no salga del skybox (y por que siento que se ve mas guapo así)
    orbitControls.enablePan = false;
        
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
    // Set background music
    setBackgroundMusic();
    // Create the objects
    loadFBX();

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);




    ///Aqui se crean todos lo objetos(excepto luces y camara) que iran en la escena

    //crear el skybox
        //El skybox es basicamente un mega cubo que encierra todo asi que por eso es tan grande 
        var skyGeometry = new THREE.CubeGeometry(1000,1000,1000)
        /*se declaran las texturas y se agregan a una lista con la que se le pondrán las texturas al cubo "skybox"*/
        var skymateriales = [
            //estamos creando 6 texturas basicas(las cuales no van a recibir sombras) y le estamos pasando como imagen las diferentes partes del skybox
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/baseIzqIzq.jpg"),side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/base.jpg"),side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/baseArriba.jpg"),side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/baseAbajo.jpg"),side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/baseDer.jpg"),side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/baseIzq.jpg"),side: THREE.DoubleSide})

        ];
        //se crea el material del cubo normal y se le añade al cubo para despues agregarlo a la escena y presto
        var cubeMaterial = new THREE.MeshFaceMaterial(skymateriales);
        var cube = new THREE.Mesh(skyGeometry,cubeMaterial)
        scene = new THREE.Scene(); 
        scene.add(cube)
    //fin de crear el skybox


    //crear las pistas
        //definimos el tamaño de los lados de cada plano con lado 
        let lado = 60
        //desplazamiento se refiere a la cantidad de espacio que se mueve cada plano
        let desplazamiento = lado+(lado/2)
        //se hace un ciclo 4 veces para crear 8 planos y creamos 2 por cada ciclo
        for(i = 0; i<4; i++){
            var geometry = new THREE.PlaneGeometry( lado, lado, 50, 50 );
            var material = new THREE.MeshPhongMaterial( {color: 0xffffff,side: THREE.DoubleSide} );
            var plane = new THREE.Mesh( geometry, material );
            /*aqui se utilizo el desplazamiento descrito arriba sumando "lado" multiplicado por el numero de ciclo
            de esta manera logramos que se creen los planos centrales uno a lado del otro sin encimarse*/
            plane.position.set(-desplazamiento+lado*i,0,-lado/2);
            //aqui se rotan los planos para que queden en horizontal y lo bajamos un poco del 0,0,0 para que se vea mejor
            plane.rotation.x = -Math.PI / 2;
            plane.position.y = -4.02;
            //aqui le decimos a los planos que puedan recibir sombras del bailarín pero que no mande sombras
            plane.castShadow = false;
            plane.receiveShadow = true;
            //añadimos ese mesh al objeto vacio pistas, ya que este es el objeto que agregaremos a la escena y no cada pista por separado
            pistas.add(plane);
            /*aqui rehacemos lo mismo de arriba solo para otro plano por debajo de el otro*/
            var planes = new THREE.Mesh( geometry, material );
            planes.position.set(-desplazamiento+lado*i,0,lado/2);
            planes.rotation.x = -Math.PI / 2;
            planes.position.y = -4.02;
            planes.castShadow = false;
            planes.receiveShadow = true;
            pistas.add(planes);
        }
        group.add( pistas );
    //fin de crear pistas
    var geometry = new THREE.BoxGeometry( 10,10,10 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    box = new THREE.Mesh( geometry, material );
    //box.position.set(-4.999999999999999,30,79.99999999999999)
    //box.position.set(camera.position.x +5,camera.position.y +5,camera.position.z +5)
    scene.add(box)
    //crear el xilofono

    //fin de crear el xilofono
    ///aqui termina la creación de objetos    
    
    
    
    // Now add the group to our scene
    scene.add( root );
}