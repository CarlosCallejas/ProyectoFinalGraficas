let pistas = new THREE.Object3D;
var planePrueba;
function createScene(canvas){
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize(canvas.width, canvas.height);
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 0, 0);
    scene.add(camera);

    var prueba = new THREE.PlaneGeometry(60,60,50,50)
    var material = new THREE.MeshBasicMaterial( {color: 0xff3f4f,side: THREE.DoubleSide} );
     planePrueba = new THREE.Mesh( prueba, material );
    planePrueba.position.set(0,0,0);
    scene.add(planePrueba)
}

function run(){
    renderer.render(scene, camera);
}