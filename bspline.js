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
function generateKnots(n, d) {
    // Generate the knot vector
    const knots = [];
    for (let i = 0; i <= n + d + 1; i++) {
        knots[i] = i;
    }
    return knots;
}

function N(i, degree, knots, t) {
    let res, tmp1, tmp2;
    if (degree == 0) {
        if ((knots[i] <= t) && (t < knots[i + 1])) {
            res = 1;
        } else {
            res = 0;
        }
        return res;
    } else {
        if ((knots[i + degree] - knots[i]) == 0) {
            tmp1 = 0;
        } else {
            tmp1 = ((t - knots[i]) / (knots[i + degree] - knots[i])) * N(i, degree - 1, knots, t);
        }
        if ((knots[i + degree + 1] - knots[i + 1]) == 0) {
            tmp2 = 0;
        } else {
            tmp2 = ((knots[i + degree + 1] - t) / (knots[i + degree + 1] - knots[i + 1])) * N(i + 1, degree - 1, knots, t);
        }
        return tmp1 + tmp2;
    }
}

function BSpline(point_control, degree, knots) {
    let n = point_control.length - 1;
    let curvePoints = [];

    for (let t = knots[degree]; t <= knots[point_control.length]; t += 0.1) {
        let p = { x: 0, y: 0 }
        for (let i = 0; i < n + 1; i++) {
            console.log("N: ", N(i, degree, knots, t));
            let px = point_control[i].x * N(i, degree, knots, t);
            let py = point_control[i].y * N(i, degree, knots, t);
            console.log("px:", px, "py:", py);
            
            //Rentrée des points de la courbes B spline dans l'objet p
            p.y += py;
            p.x += px;
        }
        curvePoints.push(p);
    }
    console.log(curvePoints);
    return curvePoints;
}

function createBspline(point_control, degre, knots) {
    //Calcul de la courbe Bspline en fonction des points de l'utilisateur
    const pointsSpline = BSpline(point_control, degre, knots);
    const geometry = new THREE.BufferGeometry().setFromPoints(pointsSpline); //Utilisation de cette géométrie ainsi que le matériel pour créer le tracé de la courbe Bspline
    const couleur = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const curve = new THREE.Line(geometry, couleur); //Ajout du tracé à la scène
    scene.add(curve);
    //lignestrace.push(curve);
    return curve;
}

function Afficher_Bspline() {
    let d = document.getElementById("degree").value;
    d = parseInt(d);
    console.log("Afficher_Bspline");
    let vecteurNoeuds = generateKnots(point_control.length, d);
    // for (let i = 1; i <= d; i++) {
        createBspline(point_control, d, vecteurNoeuds);
    // }
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
let checkContruct = document.getElementById('construction_line');

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
var lignestrace = [];

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
        // trace bspline
        Afficher_Bspline();
    }
}

function createLine() {
    // trace un trait entre les points de controle
    console.log("create line");
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
            //point_control[indice_point].deg= prompt("Entrez le degré de la courbe");
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
            Afficher_Bspline(point_control);
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