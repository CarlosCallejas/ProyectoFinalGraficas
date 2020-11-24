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
//objeto THREE vacio con el cual vamos a aÃ±adir todas las pistas a la escena
let pistas = new THREE.Object3D;

//xilofono
let xilofonoG = new THREE.Object3D;


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

    // Animar al bailarin en el centro de la escena
    animate();

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
    //con esto ponemos que rote automaticamente al rededor del bailarÃ­n
        //estaria bueno que con cada click del mouse lo detuvieramos
    orbitControls.autoRotate = false;
    //con esto quitamos el pan para que la camara no salga del skybox (y por que siento que se ve mas guapo asÃ­)
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
        /*se declaran las texturas y se agregan a una lista con la que se le pondrÃ¡n las texturas al cubo "skybox"*/
        var skymateriales = [
            //estamos creando 6 texturas basicas(las cuales no van a recibir sombras) y le estamos pasando como imagen las diferentes partes del skybox
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/baseIzqIzq.jpg"),side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/base.jpg"),side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/baseArriba.jpg"),side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/baseAbajo.jpg"),side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/baseDer.jpg"),side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../images/skybox/baseIzq.jpg"),side: THREE.DoubleSide})

        ];
        //se crea el material del cubo normal y se le aÃ±ade al cubo para despues agregarlo a la escena y presto
        var cubeMaterial = new THREE.MeshFaceMaterial(skymateriales);
        var cube = new THREE.Mesh(skyGeometry,cubeMaterial)
        
        scene.add(cube)
    //fin de crear el skybox


    //crear las pistas
        //definimos el tamaÃ±o de los lados de cada plano con lado 
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
            //aqui le decimos a los planos que puedan recibir sombras del bailarÃ­n pero que no mande sombras
            plane.castShadow = false;
            plane.receiveShadow = true;
            //aÃ±adimos ese mesh al objeto vacio pistas, ya que este es el objeto que agregaremos a la escena y no cada pista por separado
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

    //crear el xilofono
    var geometry = new THREE.BoxGeometry( 5,8,10 );
    var material = new THREE.MeshBasicMaterial( {color: 0xC8C8C8} );
    var posxbox = -32
    var scaleybox = .8
    for(i=0;i<8;i++){
        posxbox+=7
        scaleybox+=.2
        box = new THREE.Mesh( geometry, material );
        box.position.set(posxbox, -17, -50);
        box.scale.set(1,scaleybox,1)
        xilofonoG.add(box)   
    }
    xilofonoG.children[0].rotation.set(0,0.4,0)
    xilofonoG.children[1].rotation.set(0,0.335,0)
    xilofonoG.children[2].rotation.set(0,0.25,0)    
    xilofonoG.children[3].rotation.set(0,0.110,0) 
    xilofonoG.children[4].rotation.set(0,0,0) 
    xilofonoG.children[5].rotation.set(0,-0.110,0)
    xilofonoG.children[6].rotation.set(0,-0.25,0)
    xilofonoG.children[7].rotation.set(0,-0.335,0)
    camera.add(xilofonoG)
    //fin de crear el xilofono
    ///aqui termina la creaciÃ³n de objetos    
    
    // Now add the group to our scene
    scene.add( root );
}