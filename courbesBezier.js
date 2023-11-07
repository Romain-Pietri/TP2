// Auteur: Anya LALLART, Edouard LAMBERT, Baptiste LIBERT, Romain PIETRI - groupe Zariel - groupe de travail 2

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
var boolean_construction = false;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Courbe de Bézier avec De Casteljau /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Casteljau(controlPoints, t) {
    //applique l'algorithme de Casteljau
    const n = controlPoints.length - 1;
    const points = controlPoints.map(p => ({ x: p.x, y: p.y })); //fait une copie de controlPoints et le met dans un tableau d'object
    const steps = []
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n - k; i++) {
            points[i].x = (1 - t) * points[i].x + t * points[i + 1].x;//applique la formule de Casteljau
            points[i].y = (1 - t) * points[i].y + t * points[i + 1].y;
            steps.push(points.map(p => ({ x: p.x, y: p.y })));
        }
    }
    return { finalPoints: points, steps: steps };
}

function Draw_Calsteljau(point_control) {
    scene.remove.apply(scene, scene.children);
    scene.add(plan_obj);
    affiche_point_control();
    affiche_trait();
    renderer.render(scene, camera);
    // Échantillonnez la courbe de Bézier en utilisant Casteljau
    const numberOfPoints = 3000; // Nombre de points à placer
    const pointsOnBezierCurve = [];
    var temp_point = [];
    const construction_points = [];
    for (let i = 0; i <= numberOfPoints; i++) {
        // Calculez le point sur la courbe de Bézier en utilisant Casteljau
        const t = i / numberOfPoints;
        const temp_point = Casteljau(point_control, t);//recupere tous les points
        const point = temp_point.finalPoints[0];// recupere le point final
        pointsOnBezierCurve.push(new THREE.Vector3(point.x, point.y, 0));//ajoute le point final dans le tableau pour tracer la courbe
        construction_points.push(temp_point.steps);//ajoute les points de construction dans le tableau
    }
    if(boolean_construction){
    // affiche les ligne de construction
        for (let i = 0; i < construction_points.length; i += 50) {
            for (let j = 0; j < construction_points[i].length; j++) {
                const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([construction_points[i][j][0], construction_points[i][j][1]]);
                const line = new THREE.Line(lineGeometry, lineMaterial);
                scene.add(line);
            }
        }
    }   

    // la géométrie pour la courbe de Bézier
    const bezierGeometry2 = new THREE.BufferGeometry().setFromPoints(pointsOnBezierCurve);
    const lineMaterial2 = new THREE.LineBasicMaterial({ color: 0xff0f00 }); 
    const bezierLine2 = new THREE.Line(bezierGeometry2, lineMaterial2);

    // Ajoutez la ligne à la scène
    scene.add(bezierLine2);
    renderer.render(scene, camera);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// Courbe de Bézier avec les fonctions de base de Bernstein /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function binomialCoeff(n, k) {
    // fonction qui calcule les coefficients binomiaux
    if (Number.isNaN(n) || Number.isNaN(k)) return NaN; // si pas des entiers
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k === 1 || k === n - 1) return n;
    let res = n;
    for (let i = 2; i <= k; i++) {
        res *= (n - i + 1) / i;
    }
    return Math.round(res); // arrondi à l'entier le plus proche
}


function bernstein(n, i, t) {
    // fonction qui calcule les fonctions de base de Bernstein
    let b = binomialCoeff(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i)
    return b;
}

function bezierBernstein(point, t) {
    // fonction qui calcule la courbe de Bézier avec les fonctions de base de Bernstein
    var x = 0;
    var y = 0;
    const tab_poly = [];
    var n = point.length - 1;
    for (let i = 0; i <= point.length - 1; i++) {
        const coefficient = bernstein(n, i, t); // calcule les coefficients de Bernstein
        x += point[i].x * coefficient;
        y += point[i].y * coefficient;
        tab_poly.push(coefficient);
    }

    return { x: x, y: y, coef: tab_poly };
}

function DrawBernsteinFunctions(n) {
    // fonction qui trace les fonctions de base de Bernstein
    const numberOfPoints = 100; // Nombre de points à placer sur chaque fonction de base de Bernstein

    for (let i = 0; i <= n; i++) { //pour chaque point de controle
        const pointsOnBernsteinFunction = [];
        for (let j = 0; j <= numberOfPoints; j++) { // on calcule les points de la fonction de base de Bernstein
            const t = j / numberOfPoints;
            const coefficient = bernstein(n, i, t) //on applique la formule du polynome de Bernstein
            const x = t * 20 - 40; // on ajuste les coordonnée pour que la courbe soit visible et placé correctement
            const y = coefficient * 20 - 20;
            pointsOnBernsteinFunction.push(new THREE.Vector3(x, y, 0));
        }
        //on affiche toutes les courbes des polynome de Bernstein
        const bezierGeometry = new THREE.BufferGeometry().setFromPoints(pointsOnBernsteinFunction);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 }); 
        const bezierLine = new THREE.Line(bezierGeometry, lineMaterial);
        scene.add(bezierLine);
        renderer.render(scene, camera);

    }
}


function Draw_Bernstein(point_control) {
    // fonction qui trace la courbe de Bézier avec les fonctions de base de Bernstein
    scene.remove.apply(scene, scene.children);
    scene.add(plan_obj);
    affiche_point_control();
    affiche_trait();
    renderer.render(scene, camera);
    // Échantillonnez la courbe de Bézier en utilisant Bernstein
    const numberOfPoints = 1000; // Nombre de points à placer
    const pointsOnBezierCurve = [];
    const tableau_fonction_base = [];

    for (let i = 0; i <= numberOfPoints; i++) { //pour chaque point a tracer : on calcule les points de la courbe de Bézier 
        const t = i / numberOfPoints;
        const point = bezierBernstein(point_control, t);
        pointsOnBezierCurve.push(new THREE.Vector3(point.x, point.y, 0));
    }
    if(boolean_construction){
        DrawBernsteinFunctions(point_control.length - 1);
    }
    // on trace la courbe de Bézier
    const bezierGeometry1 = new THREE.BufferGeometry().setFromPoints(pointsOnBezierCurve);
    const lineMaterial1 = new THREE.LineBasicMaterial({ color: 0xff0000}); 
    const bezierLine1 = new THREE.Line(bezierGeometry1, lineMaterial1);

    console.log(bezierLine1)
    // Ajoute la ligne à la scène
    scene.add(bezierLine1);
    renderer.render(scene, camera);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// Affichage des points de contrôle /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var point_control = [];

function affiche_point_control() {
    //affiche les points de controle
    for (let i = 0; i < point_control.length; i++) {
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.position.set(point_control[i].x, point_control[i].y, 1);
        scene.add(sphereMesh);
    }
}
function affiche_trait() {
    for (let i = 0; i < point_control.length; i++) {
        //trace un trait entre les points de controle
        if (i < point_control.length - 1) {
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([point_control[i], point_control[i + 1]]);
            //creer une ligne entre les points de controle
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
        }
    }
}

var plan = new THREE.PlaneGeometry(100, 100, 1);
var material_plan = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
var plan_obj = new THREE.Mesh(plan, material_plan);
scene.add(plan_obj);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// Gestion des événements avec bouton ///////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let material = new THREE.PointsMaterial({ color: 0x00ff00, size: 0.5 });

// on récupère les inputs
const xInput = document.getElementById('x_coordinate');
const yInput = document.getElementById('y_coordinate');
const xTranslate = document.getElementById('x_translation');
const yTranslate = document.getElementById('y_translation');
const addPointButton = document.getElementById('add_btn');
const resetButton = document.getElementById('reset_btn');
const translateButton = document.getElementById('translate_btn');
let checkDecasteljau = document.getElementById('show_decasteljau');
let checkBernstein = document.getElementById('show_bernstein');
let checkContruct= document.getElementById('construction_line');
addPointButton.addEventListener('click', e => {
    // ajoute un point de controle
    e.preventDefault();
    const x = parseFloat(xInput.value);
    const y = parseFloat(yInput.value);
    createPoint(x, y);
    xInput.value = '';
    yInput.value = '';
});

resetButton.addEventListener('click', e => {
    // supprime tous les points de controle
    e.preventDefault();
    cleanScene();
});

translateButton.addEventListener('click', e => {
// translate les points de controle
    e.preventDefault();
    // si la valeur est NaN, on met 0
    if (isNaN(parseFloat(xTranslate.value))) xTranslate.value = 0;
    if (isNaN(parseFloat(yTranslate.value))) yTranslate.value = 0;
    const x = parseFloat(xTranslate.value);
    const y = parseFloat(yTranslate.value);
    for (let i = 0; i < point_control.length; i++) {
        point_control[i].x += x;
        point_control[i].y += y;
    }
    scene.remove.apply(scene, scene.children);
    scene.add(plan_obj);
    affiche_point_control();
    affiche_trait();
    renderer.render(scene, camera);
    if (checkDecasteljau.checked) Draw_Calsteljau(point_control);
    if (checkBernstein.checked) Draw_Bernstein(point_control);
});

checkBernstein.addEventListener('click', e => {
    // si case est coché, affiche la courbe de Bézier avec les fonctions de base de Bernstein
    if (checkBernstein.checked) {
        if (checkDecasteljau.checked) checkDecasteljau.checked = false;
        Draw_Bernstein(point_control)
    } else {
        scene.remove.apply(scene, scene.children);
        scene.add(plan_obj);
        affiche_point_control();
        affiche_trait();
        renderer.render(scene, camera);
    }
});

checkDecasteljau.addEventListener('click', e => {
    // si case est coché, affiche la courbe de Bézier avec l'algorithme de Casteljau
    if (checkDecasteljau.checked) {
        if (checkBernstein.checked) checkBernstein.checked = false;
        Draw_Calsteljau(point_control)
    } else {
        scene.remove.apply(scene, scene.children);
        scene.add(plan_obj);
        affiche_point_control();
        affiche_trait();
        renderer.render(scene, camera);
    }
});
checkContruct.addEventListener('click',e=>{
    //Si case est coché, affiche les courbes de construction
    boolean_construction=checkContruct.checked
    if (checkDecasteljau.checked) {
        if (checkBernstein.checked) checkBernstein.checked = false;
        Draw_Calsteljau(point_control)
    }
    else if(checkBernstein.checked) {
        if (checkDecasteljau.checked) checkDecasteljau.checked = false;
        Draw_Bernstein(point_control)
    }
})

function cleanScene() {
    //supprime tous les points de controle
    point_control = [];
    scene.remove.apply(scene, scene.children);
    scene.add(plan_obj);
    renderer.render(scene, camera);
    // on remet les cases à coché à false

    if (checkDecasteljau.checked) checkDecasteljau.checked = false;
    if (checkBernstein.checked) checkBernstein.checked = false;

    xInput.value = '';
    yInput.value = '';
    xTranslate.value = '';
    yTranslate.value = '';

    // on remet les boutons à leur état initial
    bool_placer_point = false;
    indice_point = 0;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// Gestion des événements ///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var pointplacerx;
var pointplacery;
var bool_placer_point = false;
var indice_point;

function createPoint(x, y) {
    //créer un point de controle
    console.log("create point");
    console.log(point_control.length);
    console.log(point_control);

    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(x, y, 1);
    sphereMesh.material.color.setHex(0x00ffff);
    scene.add(sphereMesh);
    renderer.render(scene, camera);
    point_control.push({ x, y });
    if (checkDecasteljau.checked) Draw_Calsteljau(point_control);
    if (checkBernstein.checked) Draw_Bernstein(point_control);
}

function createLine() {
    // trace un trait entre les points de controle
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([point_control[point_control.length - 2], point_control[point_control.length - 1]]);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    renderer.render(scene, camera);
}


window.addEventListener('mousedown', onclick, false); //quand on click on place un point de controle

window.addEventListener('mouseup', function (event) {
    //quand on relache la souris on place un point de controle
    if (bool_placer_point == true) {
        // vérifie qu'on est pas en train de cliquer sur un input
        console.log(event.target.nodeName);
        if (event.target.nodeName == "INPUT" || event.target.nodeName == "BUTTON" || event.target.nodeName == "LABEL" || event.target.nodeName == "DIV" || event.target.nodeName == "H1" || event.target.nodeName == "FORM") {
            return;
        }
        createPoint(pointplacerx, pointplacery);
        console.log("on place un point de controle");
        // trace un trait entre les points de controle
        if (point_control.length > 1) {
            createLine();
            bool_placer_point = false;
        }
    }
    else {
        // si on est dans l'état drag and drop on déplace le point de controle
        console.log("drag and drop")
        var mouse = new THREE.Vector2(); // On cree une variable mouse qui permet de recuperer les coordonnees x et y de la souris
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        console.log("x : " + mouse.x + " y: " + mouse.y);

        var raycaster = new THREE.Raycaster(); // On cree un "laser" qui permet de trouver le point de croisement avec le plan en z=0
        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(scene.children);//on regarde si le laser croise un objet

        if (intersects.length > 0) {
            var pointIntersection = intersects[0].point; // On recupere le point d'intersection entre le laser et le plan en z=0
            point_control[indice_point].x = pointIntersection.x;
            point_control[indice_point].y = pointIntersection.y;
        }
        // On met a jour l'affichage
        scene.remove.apply(scene, scene.children);
        scene.add(plan_obj);


        affiche_point_control();
        affiche_trait();
        renderer.render(scene, camera);
        if (checkDecasteljau.checked) Draw_Calsteljau(point_control);
        if (checkBernstein.checked) Draw_Bernstein(point_control);
        bool_placer_point = false;
    }
}, false);


function onclick(event) {
    // quand on click on place un point de controle ou on drag and drop un point de controle

    var click = event;

    console.log(click.clientX + " " + click.clientY);

    let mouse = new THREE.Vector2(); // On cree une variable mouse qui permet de recuperer les coordonnees x et y de la souris
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log("x : " + mouse.x + " y: " + mouse.y);

    let raycaster = new THREE.Raycaster(); // On cree un "laser" qui permet de trouver le point de croisement avec le plan en z=0
    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(scene.children);
    console.log("intersect", intersects.length);
    if (intersects.length > 0) {
        var pointIntersection = intersects[0].point; // On recupere le point d'intersection entre le laser et le plan en z=0

        pointplacerx = pointIntersection.x;
        pointplacery = pointIntersection.y;

        const pointControlLength = point_control.length;
        for (let i = 0; i < pointControlLength; i++) {
            // si on click sur un point de controle on l'affiche pas
            // on doit prendre en compte le diametre de la sphere
            if (pointIntersection.x < point_control[i].x + 0.5 && pointIntersection.x > point_control[i].x - 0.5 && pointIntersection.y < point_control[i].y + 0.5 && pointIntersection.y > point_control[i].y - 0.5) {
   
                bool_placer_point = false;
                indice_point = i;
                // si point de controle bouge, on le met en jaune
                const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
                const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
                const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphereMesh.position.set(point_control[i].x, point_control[i].y, 1);
                scene.add(sphereMesh);
                renderer.render(scene, camera);
                return;
            }
        }
        bool_placer_point = true;
    }
};

// quand appuie sur entré ou espace on trace la courbe
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 32: // espace
            console.log("space");
            Draw_Bernstein(point_control);
            break;
        case 13: // entrée
            console.log("enter");
            Draw_Calsteljau(point_control);
            break;
        case 27: // echap
            console.log("escape");
            cleanScene();
            break;
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Affichage //////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
renderer.render(scene, camera);