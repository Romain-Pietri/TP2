// Auteur: Anya LALLART, Edouard LAMBERT, Baptiste LIBERT, Romain PIETRI - groupe Zariel - groupe de travail 2

var renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
const posz_camera = 50;
camera.position.z = posz_camera;
var scene = new THREE.Scene();
scene.add(camera);
scene.background = new THREE.Color(0x000000); //fond noir



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// B-spline avec De Boor /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function BSpline(controlPoints, t, degree) {
    // Applique l'algorithme de De Boor
    const n = controlPoints.length - 1;
    const d = degree;
    const p = degree + 1;
    const knots = generateKnots(n, d);

    const points = controlPoints.map(p => ({ x: p.x, y: p.y })); // Fait une copie de controlPoints dans un tableau d'objets

    // Find span of the parameter value
    let span = findSpan(n, d, t, knots);

    // Initialize the matrix
    const N = new Array(p);
    for (let i = 0; i <= d; i++) {
        N[i] = new Array(p + 1).fill(0);
        N[i][0] = 1;
    }

    // Calculate the basis functions
    for (let j = 1; j <= d; j++) {
        const saved = j <= span ? j : span;
        const jmin = span - j + 1;
        const jmax = (j >= span) ? 1 : d - saved + 1;

        for (let r = jmin; r <= jmax; r++) {
            const alpha = (t - knots[r]) / (knots[r + p - j + 1] - knots[r]);

            N[r][j] = (1 - alpha) * N[r - 1][j - 1] + alpha * N[r][j - 1];
        }
    }

    // Calculate the final point on the B-spline curve
    let C = { x: 0, y: 0 };
    for (let i = 0; i <= d; i++) {
        C.x += points[span - d + i].x * N[span - d + i][d];
        C.y += points[span - d + i].y * N[span - d + i][d];
    }

    return C;
}

function bSplineBasis(controlPoints, t) {
    const n = controlPoints.length - 1;
    const d = n - 2; // Le degré de la B-spline est n - 2
    const p = d + 1;
    const knots = generateKnots(n, d);

    // Find span of the parameter value
    let span = findSpan(n, d, t, knots);

    console.log('n:', n);
    console.log('d:', d);
    console.log('t:', t);
    console.log('knots:', knots);
    console.log('span:', span);

    // Initialize the matrix
    const N = new Array(p);
    for (let i = 0; i <= d; i++) {
        N[i] = new Array(p + 1).fill(0);
        N[i][0] = 1;
    }

    // Calculate the basis functions
    for (let j = 1; j <= d; j++) {
        const saved = j <= span ? j : span;
        const jmin = span - j + 1;
        const jmax = j >= span ? d : d - saved + 1;

        for (let r = jmin; r <= jmax; r++) {
            const alpha = (t - knots[r]) / (knots[r + p - j + 1] - knots[r]);

            N[r][j] = (1 - alpha) * N[r - 1][j - 1] + alpha * N[r][j - 1];
        }
    }

    // Calculate the final point on the B-spline curve
    let C = { x: 0, y: 0 };
    console.log('controlPoints:', controlPoints)
    console.log('N:', N)
    console.log('d',d); 
    for (let i = 0; i <d; i++) {

        console.log('i:', i, 'N:', N);
        console.log('span - d + i:', span - d + i);
        console.log('controlPoints[span - d + i]:', controlPoints[span - d + i]);
        console.log('N[span - d + i][d]:', N[span - d + i])
        C.x += controlPoints[span - d + i].x * N[span - d + i][d];
        C.y += controlPoints[span - d + i].y * N[span - d + i][d];
    }

    return C;
}


function generateKnots(n, d) {
    // Generate the knot vector
    const knots = [];
    for (let i = 0; i <= n + d + 1; i++) {
        knots[i] = i;
    }
    return knots;
}

function findSpan(n, d, t, knots) {
    // Find the span of the parameter value
    let span = d;
    while (t >= knots[span + 1] && span < n) {
        span++;
    }
    return span;
}

function Draw_BSpline(point_control) {
    // fonction qui trace la courbe B-spline
    scene.remove.apply(scene, scene.children);
    scene.add(plan_obj);
    affiche_point_control();
    affiche_trait();
    renderer.render(scene, camera);
    
    // Échantillonnez la courbe B-spline en utilisant les fonctions de base de B-spline
    const numberOfPoints = 1000; // Nombre de points à placer
    const pointsOnBSplineCurve = [];
    
    for (let i = 0; i <= numberOfPoints; i++) { // pour chaque point à tracer : on calcule les points de la courbe B-spline
        const t = i / numberOfPoints;
        const point = bSplineBasis(point_control, t);
        pointsOnBSplineCurve.push(new THREE.Vector3(point.x, point.y, 0));
    }
    console.log(pointsOnBSplineCurve)
    //DrawBSplineFunctions(point_control.length - 1);
    // if (boolean_construction) {
        
    // 
    // on trace la courbe B-spline
    const bSplineGeometry = new THREE.BufferGeometry().setFromPoints(pointsOnBSplineCurve);
    const bSplineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const bSplineLine = new THREE.Line(bSplineGeometry, bSplineMaterial);
    const bezierGeometry2 = new THREE.BufferGeometry().setFromPoints(pointsOnBSplineCurve);
    const lineMaterial2 = new THREE.LineBasicMaterial({ color: 0xff0f00 }); 
    const bSplineLine2 = new THREE.Line(bezierGeometry2, lineMaterial2);
    // Ajoute la ligne à la scène
    scene.add(bSplineLine2);
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
});


function cleanScene() {
    //supprime tous les points de controle
    point_control = [];
    scene.remove.apply(scene, scene.children);
    scene.add(plan_obj);
    renderer.render(scene, camera);

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

    if (point_control.length > 2) {
        Draw_BSpline(point_control);
    }
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
            Draw_BSpline(point_control);
            break;
        case 13: // entrée
            console.log("enter");
            //Draw_Calsteljau(point_control);
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