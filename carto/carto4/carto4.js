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





d3.json("reg2016.json").then(function(carto){
	console.log(carto);


	
	const featureCollection = topojson.feature(carto, carto.objects.reg2016); //renvoie le GeoJSON

	/*PROJECTION, CENTRAGE
	------------------------------------------------------
	------------------------------------------------------
	*/

	let projection = d3.geoConicConformal() //projection associée
		.scale(1)
		.translate([0, 0]);
	
	let path = d3.geoPath() //générateur de chemin
		.projection(projection);

	let bounds = path.bounds(featureCollection);	//calcul de la hauteur et de la largeur
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

	svg.selectAll("path")
		.append("g")
		.data(featureCollection.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "feature");

});


