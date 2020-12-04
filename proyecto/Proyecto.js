//-----variables-----
//---escena---
//variables generales de la escena
//en la variable group se guardan las pistas 
let renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
orbitControls = null

//---interacción con el mouse---
//variables de interaccion con el mouse
let raycaster =null,
mixer = null;
let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;

//---obj (dancer)---
//estas variables se ocupa para crear a los diferentes bailarines
let dancer = null
let dancers = [];
//estas se usan para la animación del dancer
let duration = 20000; // ms
let currentTime = Date.now();
//estas se ocupan para asegurar que cada vez que descansa el dancer empiece con una animación diferente
var bailador = 1
var bailadorOld = 1
//Son todos los archivos que contienen las animaciones del personaje del proyecto, sus diferentes bailes
let animatios = ["../models/dancer/fbx/idle.fbx", 
                "../models/dancer/fbx/Hip Hop Dancing.fbx",
                "../models/dancer/fbx/Breakdance Uprock Var 2.fbx",
                "../models/dancer/fbx/Brooklyn Uprock.fbx",
                "../models/dancer/fbx/Capoeira.fbx",
                "../models/dancer/fbx/Dancing Twerk.fbx",
                "../models/dancer/fbx/Flair.fbx",
                "../models/dancer/fbx/Samba Dancing.fbx",
                "../models/dancer/fbx/Silly Dancing.fbx"
]
var LOADED_ANIMATIONS = 0
var ANIMATIONS_LOADED = false


//---sonidos (notas)---
//guarda los sonidos
let objSonidos = [];
//tiene las referencias a los sonidos
let notasPath = [];
//son necesarios para la reproduccion del sonido, listener para que suene el sonido, cargar sonidos (respectivamente)
let listener, audioLoader;
//se ocupa para elegir si sonara la guitarra o el xilofono
let guitarra = false

//---pista (de baile)---
//se va a colorear cada pista por separado dependiendo de la nota que se toque
//objeto THREE vacio con el cual vamos a aÃ±adir todas las pistas a la escena
let pistas = new THREE.Object3D;
//variable para crear pista por pista
let box = null

//esta variable es para determinar cuanto tiempo va a bailar el dancer y cuanto tiempo se quedaran pintadas las notas y pistas
let timer = 0;

//---Luces---
let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let spotLights = [];
let spotlightHelper=null
let spotlightHelper2=null
let spotlightHelper3=null
let SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;


//---xilofono---
//guarda todas las notas del xilofono que siempre estan en primer plano
let xilofonoG = new THREE.Object3D;

//---pantalla de cargando--- 
//guarda los 3 planos para mostrar la barra de carga
let grupoLoading = new THREE.Object3D;

//---postprocessing---
let composer = null, bloomPass = null, gui = null;

//-----funciones-----
//Función encargada de cargar los archivos de las animaciones en el proyecto, para que pueda visualizarse
//al personaje con su animación especificada
async function loadFBX()
{
    let loader = promisifyLoader(new THREE.FBXLoader());

    //el ciclo es para que desde el inicio se carguen todas la animaciones
    for(var i=0; i<9; i++){
        console.log(i)
        try{
            let object = await loader.load( animatios[i]);
            object.mixer = new THREE.AnimationMixer( scene );
            let action = object.mixer.clipAction( object.animations[0], object );
            object.scale.set(0.2, 0.2, 0.2);
            object.position.y -= 4;
            action.play();
            object.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            } );
            dancer = object;
            //metemos cada dancer en una lista para tenerlos en oren
            dancers.push(dancer);
            //lo agregamos a la escena para que se vea
            scene.add( object );
            //esto es para saber cuantos ya se cargaron 
            LOADED_ANIMATIONS++;
            console.log("progressbar: "+LOADED_ANIMATIONS/9*100+"%")
            //aqui cambiamos la escala de la progressbar para que se vea el progreso
            grupoLoading.children[2].scale.x += 52
        }
        catch(err)
        {
            console.error( err );
        }
    }
    //ya que se termina el ciclo indicamos que se cargaron todas las animaciones
    ANIMATIONS_LOADED = true
}

//funcion para que se puedan tocar las notas y cambiar el instrumento con el teclado
function onKeyDown(event)
{
    //solo te permite empezar a tocar si ya se cargaron todas las animaciones
    if(LOADED_ANIMATIONS){
        var color = ""
        switch(event.keyCode)
        {
            //con la letra 'A' se cambia entre guitarra y xiolofono
            case 65:
                //si guitarra es falso quiere decir que estaba tocando el xilofono por lo tanto hay que cargar la guitarra 
                //(siempre empieza con xilofono)
                if(!guitarra){
                    //limpiamos la variable de los sonidos y la volvemos a inicializar con THREE.Audio
                    objSonidos = []
                    objSonidos = [
                        new THREE.Audio( listener ), new THREE.Audio( listener ),  new THREE.Audio( listener ), new THREE.Audio( listener ), new THREE.Audio( listener ),  new THREE.Audio( listener ), 
                        new THREE.Audio( listener ), new THREE.Audio( listener )
                    ];
                    //cargamos las notas de la guitarra
                    //(guardadas en la variable notasPathG)
                    notasPathG.forEach(notasPathLoader);
                    //indicamos que esta tocando guitarra
                    guitarra=true
                } else {
                    //se hace lo mismo que en el if anterior pero esta vez con las notas del xilofono
                    //(notasPath)
                    objSonidos = []
                    objSonidos = [
                        new THREE.Audio( listener ), new THREE.Audio( listener ),  new THREE.Audio( listener ), new THREE.Audio( listener ), new THREE.Audio( listener ),  new THREE.Audio( listener ), 
                        new THREE.Audio( listener ), new THREE.Audio( listener )
                    ];
                    notasPath.forEach(notasPathLoader);
                    //indicamos que esta tocando xilofono
                    guitarra=false
                }
                break;
           //Detectar qué tecla presionó (de la 's' a la 'l') y reproducir la nota correcta
           //Además, se colorea la tecla del xilofono y la pista de baile de un color aleatorio
           //En todos los casos se hace lo mismo
            case 83:
                //Tecla 1
                if(objSonidos[0].isPlaying){ 
                    //Si se está reproduciendo se detiene y se vuelve a reproducir
                    objSonidos[0].stop();
                }
                //Se reproduce la nota
                objSonidos[0].play();
                //Timer para controlar el tiempo que está bailando el personaje
                timer = 80; 
                //seteamos el color de manera aleatoria con la funcion colorHEX
                color = colorHEX()
                //modificar el color de la nota que tocaste 
                xilofonoG.children[0].material.color.set(color);
                //modificar el color de la pista de baile
                pistas.children[0].material.color.set(color);
                break;
            case 68: 
                if(objSonidos[1].isPlaying){
                    objSonidos[1].stop();
                }
                objSonidos[1].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[1].material.color.set(color);
                pistas.children[1].material.color.set(color);
                break;
            case 70: 
                if(objSonidos[2].isPlaying){
                    objSonidos[2].stop();
                }
                objSonidos[2].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[2].material.color.set(color);
                pistas.children[2].material.color.set(color);
                break;
            case 71: 
                if(objSonidos[3].isPlaying){
                    objSonidos[3].stop();
                }
                objSonidos[3].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[3].material.color.set(color);
                pistas.children[3].material.color.set(color);
                break;
            case 72: 
                if(objSonidos[4].isPlaying){
                    objSonidos[4].stop();
                }
                objSonidos[4].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[4].material.color.set(color);
                pistas.children[4].material.color.set(color);
                break;
            case 74: 
                if(objSonidos[5].isPlaying){
                    objSonidos[5].stop();
                }
                objSonidos[5].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[5].material.color.set(color);
                pistas.children[5].material.color.set(color);
                break;
            case 75: 
                if(objSonidos[6].isPlaying){
                    objSonidos[6].stop();
                }
                objSonidos[6].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[6].material.color.set(color);
                pistas.children[6].material.color.set(color);
                break;
            case 76: 
                if(objSonidos[7].isPlaying){
                    objSonidos[7].stop();
                }
                objSonidos[7].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[7].material.color.set(color);
                pistas.children[7].material.color.set(color);
                break;
        }
    }
}
//funcion para cargar las notas dependiendo del path que se le pase
function notasPathLoader(nota_path, index){
    cargarPista(objSonidos[index], nota_path);
}
//funcion para la animacion del dancer
function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    //Se disminuye el timer para que solo baile un cierto tiempo 
    timer--;
    //si el timer es mayor a 0 sigue bailando
    if(timer > 0){
        if ( dancers.length >= 8) 
        {
            //ponemos invisibles todos los dancers
            for(var dancer_i of dancers)
                dancer_i.visible=false;
            //se pone el dancer elegido (bailador) para mostrar la animacion como visible
            dancers[bailador].visible=true
            //se reproduce la animacion de bailador
            dancers[bailador].mixer.update( ( deltat ) * 0.001 );
        }
    }else{
        //--animacion de idle y eleccion de bailador--
        //aqui elegimos el bailador
        //con el while aseguramos que cada vez sea una animacion diferente
        while(bailadorOld==bailador){
            //generamos un aleatorio de los dancers (8) para ver que animacion se genera despues
            bailador = Math.random() * (8 -1) +1; 
            //se pone ese numero entero en bailador para ser el indice en la parte de la animacion
            bailador = Math.trunc(bailador)
        }
        bailadorOld=bailador
        //con esto empieza la animación de idle 
        //(es lo mismo que en las animaciones de baile pero esta vez se selecciona el indice 0)
        if(dancers.length>1){
            for(var dancer_i of dancers)
                    dancer_i.visible=false;
            dancers[0].visible=true
            dancers[0].mixer.update( ( deltat ) * 0.001 );
        }
        //aca seteamos los colores de las pistas y el xilofono de regreso a sus colores iniciales
        for(i = 0; i<8; i++){
            //rojo
            xilofonoG.children[i].material.color.setHex(0xE14A4A);
            //blanco
            pistas.children[i].material.color.setHex(0xFFFFFF);
        }
    }
    //termina animacion del personaje
}

//funcion para correr todo
function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    if(ANIMATIONS_LOADED){
        //si ya se cargaron todos los dancers se renderiza con el composer para agregar el postprocessing
        composer.render();
    }else{
        //si aun no se han cargado se renderiza con el render normal
        //esto para que se pueda ver bien la pantalla de carga
        renderer.render( scene, camera );
    }

    //si aun no se han terminado de cargar las animaciones se deshabilita el orbitController
    orbitControls.enabled = ANIMATIONS_LOADED
    //las animaciones solo empiezan si ya se cargaron todos los dancers
    if(ANIMATIONS_LOADED){
        // Animar al bailarinen el centro de la escena
        animate();
        // Update the camera controller
        orbitControls.update();
        //se pone como invisible la pantalla de carga
        grupoLoading.visible=false
        //cambia el titulo de 'cargando...' al nombre del proyecto
        document.getElementById("title").textContent = "Pepito el Xilofonito";
    }
}
//con esta funcion se cargan las notas
function cargarPista(objSonido, path,  volumen = 0.8){
   //Recibe un objeto sonido, una ruta y el volumen al que se reproducira un sonido
   //Esencialmente fue diseñado para reproducir notas musicales
   //Carga los path en un objeto especifico para despues manipularlo. 
    audioLoader.load( path, function( buffer ) {
        objSonido.setBuffer( buffer );
        objSonido.setLoop( false );
        objSonido.setVolume( volumen );
    }); 
}
//con esto se setea la musica de fondo (el beat)
function setBackgroundMusic(){
    // create an audio source
    let sound = new THREE.Audio( listener );
    // load a sound and set it as the Audio object's buffer
     //Cargar un sonido como background y configurarlo como el Audio Object's buffer
    //Como es musica para background se reproduce en bucle
    let audioLoader = new THREE.AudioLoader();
    audioLoader.load( '../sounds/background2.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.2 );
        sound.play();
    }); 
}

//funcion para crear la escena
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
    console.log("canvas"+canvas.width)
    camera.position.set(-5, 30, 80);
    scene.add(camera);
    
    //--creacion de la pantalla de carga--
    let planoOfusco = new THREE.PlaneGeometry( canvas.width, canvas.height, 10 );
    //le ponemos transparencia para que se vea un poco de la escena principal
    let materialOfusco = new THREE.MeshPhongMaterial({
        color:0xFFFFFF,
        opacity: 0.5,
        transparent: true,
    });
    let planoOfucoMesh = new THREE.Mesh( planoOfusco, materialOfusco );
    planoOfucoMesh.position.set(0,0,-70)
    //todo se agrega al grupoLoading
    grupoLoading.add(planoOfucoMesh)
    //creacion de la base de la barra de carga
    planoOfusco = new THREE.PlaneGeometry( 5.5, 0.8, 10 );
    materialOfusco = new THREE.MeshPhongMaterial({
        color:0xE0D070,
    });
    planoOfucoMesh = new THREE.Mesh( planoOfusco, materialOfusco );
    planoOfucoMesh.position.set(0,0,-10)
    grupoLoading.add(planoOfucoMesh)
    //creacion de la barra de carga
    planoOfusco = new THREE.PlaneGeometry( 0.01, 0.5, 10 );
    materialOfusco = new THREE.MeshPhongMaterial({
        color:0x1748F7,
    });
    planoOfucoMesh = new THREE.Mesh( planoOfusco, materialOfusco );
    planoOfucoMesh.position.set(0,0,-9)
    grupoLoading.add(planoOfucoMesh)
    //agregamos a la camara el grupo para que este en primer plano
    camera.add(grupoLoading)
    //--fin de crear pantalla de carga--

    //--orbitController--
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.target = new THREE.Vector3(0,20,0);
    //aqui limitamos el zoom del orbit controller para que no salga del skybox
    orbitControls.maxDistance = 400;
    //con esto ponemos que rote automaticamente al rededor del bailarÃ­n
        //estaria bueno que con cada click del mouse lo detuvieramos
    orbitControls.autoRotate = false;
    //con esto quitamos el pan para que la camara no salga del skybox (y por que siento que se ve mas guapo asÃ­)
    orbitControls.enablePan = false;
    //--final de crear orbitController--

    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    //--luces--
    //Luces del ambiente, que cambiarán a través del tiempo
    spotLight1 = new THREE.SpotLight (0xffffff);
    spotLight1.position.set(-5, 30, 80);
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
    //--final de crear luces--

    //--interaccion con el mouse y sonido--
    //Se inicializa el raycaster para detectar la colision de la baqueta y la tecla del xilofono
    raycaster = new THREE.Raycaster();
    //Se incializa un listener para el audio
    listener = new THREE.AudioListener(); 
     //Se inicializa el loader para cargar los sonidos
    audioLoader = new THREE.AudioLoader();
    //Se inicializan todos los objetos Audio de las 8 notas 
    objSonidos = [
        new THREE.Audio( listener ), new THREE.Audio( listener ),  new THREE.Audio( listener ), new THREE.Audio( listener ), new THREE.Audio( listener ),  new THREE.Audio( listener ), 
        new THREE.Audio( listener ), new THREE.Audio( listener )
    ];
    //Se añade el listener a la camara
    camera.add( listener ); 
    // Set background music
    setBackgroundMusic();
    // Cargar notas musicales 
    notasPath = [
        "../sounds/notas/nota1.mp3", "../sounds/notas/nota2.mp3", "../sounds/notas/nota3.mp3", "../sounds/notas/nota4.mp3", 
        "../sounds/notas/nota5.mp3", "../sounds/notas/nota6.mp3", "../sounds/notas/nota7.mp3", "../sounds/notas/nota8.mp3"  
    ];
    notasPathG = [
        "../sounds/notas/nota1_guitar.mp3", "../sounds/notas/nota2_guitar.mp3", "../sounds/notas/nota3_guitar.mp3", "../sounds/notas/nota4_guitar.mp3", 
        "../sounds/notas/nota5_guitar.mp3", "../sounds/notas/nota6_guitar.mp3", "../sounds/notas/nota7_guitar.mp3", "../sounds/notas/nota8_guitar.mp3"  
    ];
    //Cargar las 8 notas musicales
    notasPath.forEach(notasPathLoader);
    //--fin de creacion de interaccion de mouse y sonidos--
   
    //--carga de objetos--
     loadFBX();
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    //--crear el skybox--
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
    //--fin de crear el skybox--


    //--crear las pistas--
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
            var material = new THREE.MeshPhongMaterial( {color: 0xffffff,side: THREE.DoubleSide} );
            var planes = new THREE.Mesh( geometry, material );
            planes.position.set(-desplazamiento+lado*i,0,lado/2);
            planes.rotation.x = -Math.PI / 2;
            planes.position.y = -4.02;
            planes.castShadow = false;
            planes.receiveShadow = true;
            pistas.add(planes);
        }
        group.add( pistas );
    //--fin de crear pistas--

    //--crear el xilofono--
    //seteamos valores generales
    var geometry = new THREE.BoxGeometry( 5,8,10 );
    //se ocupan para cambiar la posicion y la escala (entre más a la derecha más alto)
    var posxbox = -32
    var scaleybox = .8
    for(i=0;i<8;i++){
        var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        //modificación de posicion (más a la derecha)
        posxbox+=7
        //modificación de escala (entre más a la derecha más alto)
        scaleybox+=.2
        box = new THREE.Mesh( geometry, material );
        box.position.set(posxbox, -17, -50);
        box.scale.set(1,scaleybox,1)
        xilofonoG.add(box)   
    }
    //se tuvo que hacer la rotación a manita para que se viera que estaba de frente ya que no habia un numero exacto de rotacion para hacerlo en ciclo
    xilofonoG.children[0].rotation.set(0,0.4,0)
    //se le puso nombre a cada tecla
    xilofonoG.children[0].name = ("tecla1");
    xilofonoG.children[1].rotation.set(0,0.335,0)
    xilofonoG.children[1].name = ("tecla2");
    xilofonoG.children[2].rotation.set(0,0.25,0)    
    xilofonoG.children[2].name = ("tecla3");
    xilofonoG.children[3].rotation.set(0,0.110,0) 
    xilofonoG.children[3].name = ("tecla4");
    xilofonoG.children[4].rotation.set(0,0,0) 
    xilofonoG.children[4].name = ("tecla5");
    xilofonoG.children[5].rotation.set(0,-0.110,0)
    xilofonoG.children[5].name = ("tecla6");
    xilofonoG.children[6].rotation.set(0,-0.25,0)
    xilofonoG.children[6].name = ("tecla7");
    xilofonoG.children[7].rotation.set(0,-0.335,0)
    xilofonoG.children[7].name = ("tecla8");
    camera.add(xilofonoG)
    //fin de crear el xilofono   
    
    //Inicia Events listeners   

    document.addEventListener('click', onDocumentMouseClick);
    //Termina Event listeners
   
    //Llamo la función del cambio de luces para que se repita cada 5000 milisegundos
    setInterval(luces, 5000)
    
    //se agregan los efectos del postprocessing
    addEffects();

    // Now add the group to our scene
    scene.add( root );
}

//Esta funcion tiene como objetivo cambiar las luces spotlight del programa, haciendo parecer que es una discoteca 
function luces( ){
    var color=Math.random();
    var colorHex
    var colorHex2
    var colorHex3

    //se eligieron ciertos colores para el cambio de luces y se seteo a cada rango del random
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
    //spotLights[0].color.set(colorHex)
    spotLights[1].color.set(colorHex2)
    spotLights[2].color.set(colorHex3)
    console.log("cambio de luces")
    // Now add the group to our scene
    scene.add( root );
}


//FUNCION PARA DETECTAR CUANDO DA CLICK A UNA TECLA DEL XILOFONO
function onDocumentMouseClick( event ) {
    event.preventDefault();
    //Calculos para unificar coordenadas del mouse
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    //mandar raycast cuando da click
    raycaster.setFromCamera( mouse, camera );
    //mandar el raycast hacia todos los hijos del xilofono (que son las teclas)
    const intersects = raycaster.intersectObjects( xilofonoG.children );
    console.log("intersects"+intersects);
    if ( intersects.length > 0 ) {
        const object = intersects[ intersects.length -1 ].object;
        console.log(object)
        switch(object.name)
        {
          //reproducir la nota adecuada
           //Además, se colorea la tecla del xilofono y la pista de baile de un color aleatorio
           //En todos los casos se hace lo mismo
            case "tecla1":      
                //Si ya se está reproduciendo la nota, se detiene y de vuelve a ejecutar      
                if(objSonidos[0].isPlaying){
                    objSonidos[0].stop(); 
                }
                //esto es muy parecido al switch case del teclado
                objSonidos[0].play();
                timer = 80;
                color = colorHEX()
                //se colorea la tecla y la pista de baile
                xilofonoG.children[0].material.color.set(color);
                pistas.children[0].material.color.set(color);
                break;
            case "tecla2": 
                if(objSonidos[1].isPlaying){
                    objSonidos[1].stop();
                }
                objSonidos[1].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[1].material.color.set(color);
                pistas.children[1].material.color.set(color);
                break;
            case "tecla3": 
                if(objSonidos[2].isPlaying){
                    objSonidos[2].stop();
                }
                objSonidos[2].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[2].material.color.set(color);
                pistas.children[2].material.color.set(color);
                break;
            case "tecla4": 
                if(objSonidos[3].isPlaying){
                    objSonidos[3].stop();
                }
                objSonidos[3].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[3].material.color.set(color);
                pistas.children[3].material.color.set(color);
                break;
            case "tecla5": 
                if(objSonidos[4].isPlaying){
                    objSonidos[4].stop();
                }
                objSonidos[4].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[4].material.color.set(color);
                pistas.children[4].material.color.set(color);
                break;
            case "tecla6": 
                if(objSonidos[5].isPlaying){
                    objSonidos[5].stop();
                }
                objSonidos[5].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[5].material.color.set(color);
                pistas.children[5].material.color.set(color);
                break;
            case "tecla7": 
                if(objSonidos[6].isPlaying){
                    objSonidos[6].stop();
                }
                objSonidos[6].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[6].material.color.set(color);
                pistas.children[6].material.color.set(color);
                break;
            case "tecla8": 
                if(objSonidos[7].isPlaying){
                    objSonidos[7].stop();
                }
                objSonidos[7].play();
                timer = 80;
                color = colorHEX()
                xilofonoG.children[7].material.color.set(color);
                pistas.children[7].material.color.set(color);
                break;
        }

    }

}

//esta funcion se utiliza para generar un color hexadecimal aleatorio	
function colorHEX(){
    var color = "";
    //se corre 6 veces la funcion de generarvalor para completar el color hexadecimal
	for(var i=0;i<6;i++){
		color = color + generarValor() ;
	}
	return "#" + color;
}

//esta funcion genera un valor entre a y 9 de manera aleatoria
function generarValor(){
	var valores = ["a","b","c","d","e","f","0","1","2","3","4","5","6","7","8","9"];
	var numero = (Math.random()*15).toFixed(0);
	return valores[numero];
}

//funcion para agregar el post processing
//tiene partes del codigo usado en clase y partes de ThreeJs.org
function addEffects()
{
    // First, we need to create an effect composer: instead of rendering to the WebGLRenderer, we render using the composer.
    composer = new THREE.EffectComposer(renderer);

    // The effect composer works as a chain of post-processing passes. These are responsible for applying all the visual effects to a scene. They are processed in order of their addition. The first pass is usually a Render pass, so that the first element of the chain is the rendered scene.
    const renderPass = new THREE.RenderPass(scene, camera);

    // There are several passes available. Here we are using the UnrealBloomPass.
    bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = 0;
        bloomPass.strength = 0.3;
        bloomPass.radius = 0;

    renderer.toneMappingExposure = Math.pow( 0.5, 1.0 );
    // After the passes are configured, we add them in the order we want them.
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
}