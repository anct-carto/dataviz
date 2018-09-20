/* 
-                                                           
`-                                                          
    .                                                       
  ` -/..`                                                   
     -:.:.``                     ``                         
      `.`   ```                ``-.                         
        `-    `.``            ``..     ```                  
         ```.     `.`                 `.`.                  
            -..     .``                .```.   `            
              -``    `.``                ``    `            
               `--`    ` --.`                 `.`.`         
                  `.`.    ``````               `.`.         
                     ``-:.     `.                           
                         `.//`   ````                       
                           .--..`    .                      
                               -/.``.`-                     
                                   `-`     `                
                                          `-:               

*/

/*SVG, FORMAT
------------------------------------------------------
------------------------------------------------------
*/

//Initiate svg
let svg = d3.select(".c_map")
	.append("svg");

let width = "600";
let height = "460";
const margin = {top:20, right:20, bottom:20, left:50};

svg
	.attr("width","100%")
	.attr("height",height);

//Initiate format number
d3.formatDefaultLocale({
	"decimal": ",",
	"thousands": "\u2009",
	"grouping": [3]
});


/*LOAD DATA
	------------------------------------------------------
	------------------------------------------------------
	*/



const promise1 = d3.json("reg2016.json");
const promise2 = d3.json("reg2016_ctr.json");
const promise3 = d3.json("ze.json");
const promise4 = d3.json("france.json");

Promise.all([promise1, promise2, promise3, promise4]).then(function(carto){
	console.log(carto);


	
	const featureCollectionReg = topojson.feature(carto[0], carto[0].objects.reg2016); //renvoie le GeoJSON
	const featureCollectionZe = topojson.feature(carto[2], carto[2].objects.ze);
	const featureCollectionFr = topojson.feature(carto[3], carto[3].objects.france);


	/*PROJECTION, CENTRAGE
	------------------------------------------------------
	------------------------------------------------------
	*/

	let projection = d3.geoConicConformal() //projection associée
		.scale(1)
		.translate([0, 0]);
	
	let path = d3.geoPath() //générateur de chemin
		.projection(projection);

	let bounds = path.bounds(featureCollectionReg);	//calcul de la hauteur et de la largeur
	console.log(bounds);
	let dx = bounds[1][0] - bounds[0][0];
	let dy = bounds[1][1] - bounds[0][1];
	let x = (bounds[0][0] + bounds[1][0])/2;
	let y = (bounds[0][1] + bounds[1][1])/2;
	
	let scale = 0.95/Math.max(dx/width, dy/height);
	let translate = [width/2 - scale * x, height/2-scale * y];

	projection
		.scale(scale)
		.translate(translate);



	/*PATH
	------------------------------------------------------
	------------------------------------------------------
	*/
	//Génération de la France
	let svgFr = svg.selectAll(".fr")
		.data(featureCollectionFr.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "fr");

	//Génération des ZE
	let svgZe = svg.selectAll(".ze")
		.data(featureCollectionZe.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "ze");

	//Centroïdes région
	let svgRegionCtr = svg.selectAll(".regionCtr")
		.append("g")
		.data(carto[1].features)
		.enter()
		.append("path")
		.attr("d", path.pointRadius(2))
		.attr("class", "regionCtr");


	/*FILTRE GAUSSIEN
	------------------------------------------------------
	------------------------------------------------------
	*/



	/*ANIMATION CONTOUR REGION
	------------------------------------------------------
	------------------------------------------------------
	*/

	let animateRegContour = ()=>{
		svg.selectAll(".reg_contour").remove(); //supprime le contour des régions
		//Génération des contours
		let regContour = svg.append("path")
			.attr("class", "reg_contour")
			.datum(topojson.mesh(carto[0], carto[0].objects.reg2016, function(a, b) { return a !== b; }))
			.attr("d", path);
	
		
		//Animation des contours
		let totalLength = regContour.node().getTotalLength();

		regContour
			.attr("stroke-dasharray", `${totalLength} ${totalLength}`) //contôle le motif et l'espacement entre les segments pour tracer le contour
			.attr("stroke-dashoffset", totalLength) //définit l'emplacement de départ du motif ; plus le nombre est elevé, plus il commencera tardivement
			.transition()
			.duration(10000)
			.ease(d3.easeLinear)
			.attr("stroke-dashoffset", 0);
	};

	/*EVENEMENT SURVOL SOURIS
	------------------------------------------------------
	------------------------------------------------------
	*/
	svgZe
		.on("mouseover", function(){
			d3.select(this)
				.attr("stroke-width","1")
				.attr("stroke","#646464");
		})
		.on("mouseout", function(){
			d3.select(this)
				.attr("stroke-width","0");
		});


	/*INTERACTION OBSERVER
	------------------------------------------------------
	------------------------------------------------------
	*/


	if (document.readyState == "loading") {
		document.addEventListener("DOMContentLoaded", ()=>{
			createObserver();
		});
	} else {
		createObserver();
	}

	function createObserver(){
		let observer;

		let observerOptions = {
			root: null, //l'élément utilisé comme zone d'affichage
			rootMargin: "0px", //la marge autour de l'élément
			threshold: 0.8 //seuil d'exécution de la fonction callback (1.0 = 100% de l'élément doit être affiché)
		};
		
		observer = new IntersectionObserver(intersectionCallback, observerOptions);
		observer.observe(document.querySelector(".c_map"));
	}


	function intersectionCallback(entries){
		entries.forEach(function(entry){
			if (entry.intersectionRatio>=0.8){
				console.log("Inside svg map");
				animateRegContour();
				
			} else{
				svg.selectAll(".reg_contour").remove();
				console.log("Outside svg map");
			}
		});
	}


});


