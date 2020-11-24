let renderer = null, 
scene = null, 
camera = null,
root = null,
dancer = null,
group = null,
raycaster =null,
orbitControls = null,
mixer = null;
let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
let box = null


let duration = 20000; // ms
let currentTime = Date.now();
let dancers = [];

let objSonidos = [];
let notasPath = [];
let listener, audioLoader, soundBackground =  null;

let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let mapUrl = "../images/checker_large.gif";

let spotLights = [];
let spotlightHelper=null
let spotlightHelper2=null
let spotlightHelper3=null

//pista
//objeto THREE vacio con el cual vamos a aÃ±adir todas las pistas a la escena
let pistas = new THREE.Object3D;

//xilofono
let xilofonoG = new THREE.Object3D;

//Son todos los archivos que contienen las animaciones del personaje del proyecto, sus diferentes bailes
let anim1 = "../models/dancer/fbx/Hip Hop Dancing.fbx"
let anim2 = "../models/dancer/fbx/Breakdance Uprock Var 2.fbx"
let anim3 = "../models/dancer/fbx/Brooklyn Uprock.fbx"
let anim4 = "../models/dancer/fbx/Capoeira.fbx"
let anim5 = "../models/dancer/fbx/Dancing Twerk.fbx"
let anim6 = "../models/dancer/fbx/Flair.fbx"
let anim7 = "../models/dancer/fbx/Samba Dancing.fbx"
let anim8 = "../models/dancer/fbx/Silly Dancing.fbx"


let SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

//Función encargada de cargar los archivos de las animaciones en el proyecto, para que pueda visualizarse
//al personaje con su animación especificada
async function loadFBX()
{
    let loader = promisifyLoader(new THREE.FBXLoader());

    try{
        let object = await loader.load( anim4);
        object.mixer = new THREE.AnimationMixer( scene );
        let action = object.mixer.clipAction( object.animations[ 0 ], object );
        object.scale.set(0.2, 0.2, 0.2);
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
        case 83:
            if(objSonidos[0].isPlaying){
                objSonidos[0].stop();
            }
            objSonidos[0].play();
            break;
        case 68: 
            if(objSonidos[1].isPlaying){
                objSonidos[1].stop();
            }
            objSonidos[1].play();
            break;
        case 70: 
            if(objSonidos[2].isPlaying){
                objSonidos[2].stop();
            }
            objSonidos[2].play();
            break;
        case 71: 
            if(objSonidos[3].isPlaying){
                objSonidos[3].stop();
            }
            objSonidos[3].play();
            break;
        case 72: 
            if(objSonidos[4].isPlaying){
                objSonidos[4].stop();
            }
            objSonidos[4].play();
            break;
        case 74: 
            if(objSonidos[5].isPlaying){
                objSonidos[5].stop();
            }
            objSonidos[5].play();
            break;
        case 75: 
            if(objSonidos[6].isPlaying){
                objSonidos[6].stop();
            }
            objSonidos[6].play();
            break;
        case 76: 
            if(objSonidos[7].isPlaying){
                objSonidos[7].stop();
            }
            objSonidos[7].play();
            break;
    }
}
function notasPathLoader(nota_path, index){
    cargarPista(objSonidos[index], nota_path);
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
function reproducirNota(){
    console.log("Hola soy una nota");
}
function cargarPista(objSonido, path, setLoop = false, volumen = 0.8){
    //Cargar un sonido como background y configurarlo como el Audio Object's buffer
    //Como es musica para background se reproduce en bucle
    console.log(objSonido);
    console.log(path);

    audioLoader.load( path, function( buffer ) {
        objSonido.setBuffer( buffer );
        objSonido.setLoop( setLoop );
        objSonido.setVolume( volumen );
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
    
    //Luces del ambiente, que cambiarán a través del tiempo

    spotLight1 = new THREE.SpotLight (0x00fa00);
    spotLight1.position.set(40, 70, -10);
    spotLight1.target.position.set(-2, 0, -2);
    spotLights.push(spotLight1);
    root.add(spotLight1);

    spotLight2 = new THREE.SpotLight (0x5500ff);
    spotLight2.position.set(0, 70, -40);
    spotLight2.target.position.set(-2, 0, -2);
    spotLights.push(spotLight2);
    root.add(spotLight2);

    spotLight3 = new THREE.SpotLight (0xfaf600);
    spotLight3.position.set(0, 70, 40);
    spotLight3.target.position.set(-2, 0, -2);
    spotLights.push(spotLight3);
    root.add(spotLight3);
  
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

    //Se inicializa el raycaster para detectar la colision de la baqueta y la tecla del xilofono
    raycaster = new THREE.Raycaster();
    //Se incializa un listener para el audio
    listener = new THREE.AudioListener(); 
     //Se inicializa el loader para cargar los sonidos
    audioLoader = new THREE.AudioLoader();
    //Se inicializa una variable global llamada Sound que controla un sonido del background
    soundBackground = new THREE.Audio( listener ); 
    //Se inicializan todos los objetos Audio de las 8 notas 
    objSonidos = [
        new THREE.Audio( listener ), new THREE.Audio( listener ),  new THREE.Audio( listener ), new THREE.Audio( listener ), new THREE.Audio( listener ),  new THREE.Audio( listener ), 
        new THREE.Audio( listener ), new THREE.Audio( listener )
    ];
    //cargar pista del backgroud
    cargarPista(soundBackground, "../sounds/background.mp3", true, 0.1);
    soundBackground.play();
    //Se añade el listener a la camara
    camera.add( listener ); 
    // Set background music
    setBackgroundMusic();
    // Create the objects
     loadFBX();

    // Cargar notas musicales 
    notasPath = [
        "../sounds/notas/nota1.mp3", "../sounds/notas/nota2.mp3", "../sounds/notas/nota3.mp3", "../sounds/notas/nota4.mp3", 
        "../sounds/notas/nota5.mp3", "../sounds/notas/nota6.mp3", "../sounds/notas/nota7.mp3", "../sounds/notas/nota8.mp3"  
    ];
    //Cargar las 8 notas musicales
    notasPath.forEach(notasPathLoader);

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
    
    //Inicia Events listeners   
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mousedown', onDocumentMouseDown);
    //Termina Event listeners

    ///aqui termina la creación de objetos    
    //Llamo la función del cambio de luces para que se repita cada 5000 milisegundos
    setInterval(luces, 5000)
    
    // Now add the group to our scene
    scene.add( root );
}

//Esta funcion tiene como objetivo cambiar las luces spotlight del programa, haciendo parecer que es una discoteca 
function luces( ){
    var color=Math.random();
    var colorHex
    var colorHex2
    var colorHex3

    if(color<=0.4){
        colorHex="#242DD8"
        colorHex2="#FFE307"
        colorHex3="#FF9507"
    }else if(color<=0.7 && color>0.4){
        colorHex="#45EC07"
        colorHex2="#FF6107"
        colorHex3="#E10699"
    }else if(color<1 && color>0.7){
        colorHex="#FF6B07"
        colorHex2="#1866D3"
        colorHex3="#25E907"
    }
    spotLights[0].color.set(colorHex)
    spotLights[1].color.set(colorHex2)
    spotLights[2].color.set(colorHex3)
    console.log("hola")
    // Now add the group to our scene
    scene.add( root );
}
function onDocumentMouseMove( event ) 
{
    event.preventDefault();
    // console.log(event.clientX)
    // console.log(event.clientY)
    // console.log("....")
  
   //AQUI VA EL CODIGO PARA QUE LA BAQUETA SIGA AL MOUSE 
    // box.position.x = ( event.clientX / 800 )*2 -1;
    // box.position.y =  - ( event.clientY / 600 )*2 +1 + camera.position.y;
    // box.position.z = 200;
    // console.log(box.position)
    // find intersections
    
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( scene.children );

    console.log("intersects", intersects);
    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ intersects.length - 1 ].object;
        //CLICKED.material.emissive.setHex( 0x00ff00 );
        console.log(CLICKED);
        if(!animator.running)
        {
           //aqui va lo de hacer la animacion para mover la baqueta y generar el sonido
        }
    } 
    else 
    {
        if ( CLICKED ) 
           //Resetear valores

        CLICKED = null;
    }
}