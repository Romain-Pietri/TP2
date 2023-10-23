// Auteur: Anya LALLART, Edouard LAMBERT, Baptiste LIBERT, Romain PIETRI - groupe 4 - groupe de travail 2

var renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
const posz_camera = 50;
camera.position.z = posz_camera; // Recule la camera
var scene = new THREE.Scene();
scene.add(camera);
//fond noir
scene.background = new THREE.Color(0x000000);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Courbe de Bézier avec De Casteljau /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Casteljau(controlPoints, t) {
    //applique l'algorithme de Casteljau
    const n = controlPoints.length - 1;
    const points = controlPoints.map(p => ({ x: p.x, y: p.y }));//fait une copie de controlPoints et le met dans un tableau d'object

    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n - k; i++) {
            points[i].x = (1 - t) * points[i].x + t * points[i + 1].x;//applique la formule de Casteljau
            points[i].y = (1 - t) * points[i].y + t * points[i + 1].y;
        }
    }

    return points[0];//retourne le point final
}

function Draw_Calsteljau(point_control){
    // Échantillonnez la courbe de Bézier en utilisant Casteljau
    const numberOfPoints = 1000; // Nombre de points à échantillonner
    const pointsOnBezierCurve = [];

    for (let i = 0; i <= numberOfPoints; i++) {
        // Calculez le point sur la courbe de Bézier en utilisant Casteljau
        const t = i / numberOfPoints;
        const point = Casteljau(point_control, t);//recupere le point final
        pointsOnBezierCurve.push(new THREE.Vector3(point.x, point.y, 0));//ajoute le point final dans le tableau pour tracer la courbe
        console.log(point)//debug
    }
    
    
    // Créez la géométrie pour la courbe de Bézier
    const bezierGeometry = new THREE.BufferGeometry().setFromPoints(pointsOnBezierCurve);

    // Créez un matériau pour la ligne
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Par exemple, utilisez la couleur que vous préférez

    // Créez la ligne en utilisant la géométrie et le matériau
    const bezierLine = new THREE.Line(bezierGeometry, lineMaterial);

    // Ajoutez la ligne à la scène
    scene.add(bezierLine);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// Courbe de Bézier avec les fonctions de base de Bernstein /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function binomialCoeff (n, k){ 
    // fonction qui calcule les coefficients binomiaux
    if(Number.isNaN(n) || Number.isNaN(k)) return NaN; // si pas des entiers
    if(k < 0 || k > n) return 0;
    if(k === 0 || k === n) return 1; 
    if(k === 1 || k === n - 1) return n;
    
    let res = n; 
    for(let i = 2; i <= k; i++){ 
      res *= (n - i + 1) / i; 
    } 
    
    return Math.round(res); 
  } 


function bernstein (n, i, t){
    // fonction qui calcule les fonctions de base de Bernstein
    b = binomialCoeff(n,i) * Math.pow(t,i) * Math.pow(1 - t, n-i);
    return b;
}


function bezierBernstein (point, t){
    // fonction qui calcule la courbe de Bézier avec les fonctions de base de Bernstein
    var x = 0;
    var y = 0;  
    var n = point.length - 1;
    for (let i = 0; i <= point.length-1; i++){
        const coefficient = bernstein(n, i, t); // calcule les coefficients de Bernstein
        x += point[i].x * coefficient ; 
        y += point[i].y * coefficient;
       
    }
    
    return {x: x, y: y};
}


function Draw_Bernstein (point_control){
    // Échantillonnez la courbe de Bézier en utilisant Bernstein
    const numberOfPoints = 1000; // Nombre de points à échantillonner
    const pointsOnBezierCurve = [];

    for (let i = 0; i <= numberOfPoints; i++) {
        const t = i / numberOfPoints;
        const point = bezierBernstein(point_control, t);
        pointsOnBezierCurve.push(new THREE.Vector3(point.x, point.y, 0));
        console.log(point)
    }
    
    // Créez la géométrie pour la courbe de Bézier
    const bezierGeometry = new THREE.BufferGeometry().setFromPoints(pointsOnBezierCurve);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); 
    const bezierLine = new THREE.Line(bezierGeometry, lineMaterial);

    // Ajoutez la ligne à la scène
    scene.add(bezierLine);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// Affichage des points de contrôle /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var point_control= [
    
];
function affiche_point_control(){
    //affiche les points de controle
    for(let i = 0; i < point_control.length; i++){
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.position.set(point_control[i].x, point_control[i].y, 1);
        //couleur du point de controle en bleu clair
        sphereMesh.material.color.setHex(0x00ffff);
        scene.add(sphereMesh);
    }
}
function affiche_trait(){
    for(let i = 0; i < point_control.length; i++){
        //trace un trait entre les points de controle
        if(i < point_control.length-1){
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 }); 
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([point_control[i],point_control[i+1]]);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
        }
    }
}

var plan= new THREE.PlaneGeometry(100,100,1);
var material_plan = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide});
var plan_obj = new THREE.Mesh(plan, material_plan);
scene.add(plan_obj);


var pointplacerx;
var pointplacery;
var bool_placer_point = false;
var indice_point ;

window.addEventListener('mousedown', onclick, false);

window.addEventListener('mouseup', function(event) {
    if(bool_placer_point == true){
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.position.set(pointplacerx, pointplacery, 1);
        //couleur du point de controle en bleu clair
        sphereMesh.material.color.setHex(0x00ffff);
        scene.add(sphereMesh);
        renderer.render(scene, camera);
        
        point_control.push({x : pointplacerx, y : pointplacery});
        
        console.log("point de controle",point_control);
        //trace un trait entre les points de controle
        if(point_control.length > 1){
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 }); 
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([point_control[point_control.length-2],point_control[point_control.length-1]]);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
            renderer.render(scene, camera);
            bool_placer_point = false;

        }
    }
    else{
        console.log("drag and drop")
        var mouse = new THREE.Vector2(); // On cree une variable mouse qui permet de recuperer les coordonnees x et y de la souris
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        console.log("x : " + mouse.x + " y: " + mouse.y);
        
        var raycaster = new THREE.Raycaster(); // On cree un "laser" qui permet de trouver le point de croisement avec le plan en z=0
        raycaster.setFromCamera(mouse, camera);
        
        var intersects = raycaster.intersectObjects(scene.children);
        console.log("intersect",intersects.length);
        if (intersects.length > 0) {
            var pointIntersection = intersects[0].point; // On recupere le point d'intersection entre le laser et le plan en z=0
            point_control[indice_point].x = pointIntersection.x;
            point_control[indice_point].y = pointIntersection.y;
        }    
        //efface tout et affiche les points de controle
        scene.remove.apply(scene, scene.children);
        scene.add(plan_obj);
        renderer.render(scene, camera);
        affiche_point_control();
        affiche_trait();
        renderer.render(scene, camera);
        bool_placer_point = false;
    }
}, false);


function onclick(event) {
    var click = event;
    
    //tab_coord.push({x : click.clientX, y : click.clientY});
    console.log(click.clientX +" "+ click.clientY);
    
    var mouse = new THREE.Vector2(); // On cree une variable mouse qui permet de recuperer les coordonnees x et y de la souris
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log("x : " + mouse.x + " y: " + mouse.y);
    
    var raycaster = new THREE.Raycaster(); // On cree un "laser" qui permet de trouver le point de croisement avec le plan en z=0
    raycaster.setFromCamera(mouse, camera);
    
    var intersects = raycaster.intersectObjects(scene.children);
    console.log("intersect",intersects.length);
    if (intersects.length > 0) {
        var pointIntersection = intersects[0].point; // On recupere le point d'intersection entre le laser et le plan en z=0
        
        
        console.log(pointIntersection);
        pointplacerx = pointIntersection.x;
        pointplacery = pointIntersection.y;
        //affiche les points
        for(let i = 0; i < point_control.length; i++){
            
            //si on click sur un point de controle on l'affiche pas
            //on doit prendre en compte le diametre de la sphere
            if(pointIntersection.x < point_control[i].x + 0.5 && pointIntersection.x > point_control[i].x - 0.5 && pointIntersection.y < point_control[i].y + 0.5 && pointIntersection.y > point_control[i].y - 0.5){
                console.log("drag and drop");
                bool_placer_point = false;
                indice_point = i;


                return;
            }
        }
       

        bool_placer_point=true;
    }
    
};

//quand appuie sur entré on trace la courbe
document.addEventListener('keydown', function(event) {
    //si espace on trace la courbe
    if(event.keyCode == 32) {
        //Draw_Bernstein(point_control);
        Draw_Calsteljau(point_control);
        renderer.render(scene, camera);
    }
    //si appuie sur echap on reset tout
    else if(event.keyCode == 27) {
        point_control= [];
        scene.remove.apply(scene, scene.children);
        scene.add(plan_obj);
        renderer.render(scene, camera);
    }
    //si espace on trace la courbe
    else if( event.keyCode== 13){
        
    }


});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Affichage //////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
Draw_Bernstein(point_control)
Draw_Calsteljau(point_control);
affiche_point_control(point_control);
*/
renderer.render(scene, camera);
