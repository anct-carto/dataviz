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

/*Initiate svg*/
let svg = d3.select(".c_map")
	.append("svg");

let width = "640";
let height = "460";
const margin = {top:20, right:20, bottom:20, left:50};

svg
	.attr("width","100%")
	.attr("height",height);

/*Initiate format number*/
d3.formatDefaultLocale({
	"decimal": ",",
	"thousands": "\u2009",
	"grouping": [3]
});






const promise1 = d3.json("reg2016.json");
const promise2 = d3.json("reg2016_ctr.json");
const promise3 = d3.json("ze.json");

Promise.all([promise1, promise2, promise3]).then(function(carto){
	console.log(carto);


	
	const featureCollectionReg = topojson.feature(carto[0], carto[0].objects.reg2016); //renvoie le GeoJSON
	const featureCollectionZe = topojson.feature(carto[2], carto[2].objects.ze);


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
	console.log(bounds)
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

	/*Génération des ZE*/
	svg.selectAll(".ze")
		.append("g")
		.data(featureCollectionZe.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "ze");

	/*Génération des régions*/
	svg.selectAll(".region")
		.append("g")
		.data(featureCollectionReg.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "region");

	/*Génération des centroïdes de région*/
	svg.selectAll(".regionCtr")
		.append("g")
		.data(carto[1].features)
		.enter()
		.append("path")
		.attr("d", path.pointRadius(2))
		.attr("class", "regionCtr");

});


