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

/*GLOBAL
------------------------------------------------------
------------------------------------------------------
*/

/*Initiate dimension*/

let width = "640";
let height = "460";
const margin = {top:20, right:20, bottom:20, left:50};

/*Initiate format number*/
d3.formatDefaultLocale({
	"decimal": ",",
	"thousands": "\u2009",
	"grouping": [3]
});


/*DATA, PROJECTION
------------------------------------------------------
------------------------------------------------------
*/

d3.json("reg2016.json").then(function(carto){
	console.log(carto);

	const featureCollection = topojson.feature(carto, carto.objects.reg2016); //renvoie le GeoJSON
	const projection = d3.geoConicConformal(); //projection associée
		
	/*CAS 1 Utilisation de fitSize
------------------------------------------------------
------------------------------------------------------
*/

	let svg1 = d3.select(".c_map1")
		.append("svg");
	svg1
		.attr("width","100%")
		.attr("height",height);


	const projection1 = projection
		.fitSize([width,height],featureCollection);

	const path1 = d3.geoPath() //générateur de chemin
		.projection(projection1); //associe la projection au chemin


	/*PATH
------------------------------------------------------
------------------------------------------------------
*/

	svg1.selectAll("path")
		.append("g")
		.data(featureCollection.features)
		.enter()
		.append("path")
		.attr("d", path1)
		.attr("class", "feature");
	

	/*CAS 2 Utilisation de center, scale et rotate
	------------------------------------------------------
	------------------------------------------------------
	*/

	let svg2 = d3.select(".c_map2")
		.append("svg");
	svg2
		.attr("width","100%")
		.attr("height",height);

	const b = topojson.bbox(carto);

	const projection2 = projection
		.center([(b[0]+b[2])/2, (b[1]+b[3])/2])
		.scale(2550)
		.translate([width/2, height/2]); //centrer dans le conteneur

	const path2 = d3.geoPath() //générateur de chemin
		.projection(projection2); //associe la projection au chemin


	/*PATH
	------------------------------------------------------
	------------------------------------------------------
	*/

	svg2.selectAll("path")
		.append("g")
		.data(featureCollection.features)
		.enter()
		.append("path")
		.attr("d", path2)
		.attr("class", "feature");


	/*CAS 3 Utilisation de path.bounds
	------------------------------------------------------
	------------------------------------------------------
	*/

	let svg3 = d3.select(".c_map3")
		.append("svg");
	svg3
		.attr("width","100%")
		.attr("height",height);

	const path3 = d3.geoPath() //générateur de chemin
		.projection(projection); //associe la projection au chemin


	projection
		.scale(1)
		.translate([0,0]);

	let c = path3.bounds(featureCollection),
		scale = 0.95 / Math.max((c[1][0] - c[0][0]) / width, (c[1][1] - c[0][1]) / height),
		translate = [(width - scale * (c[1][0] + c[0][0])) / 2, (height - scale * (c[1][1] + c[0][1])) / 2];

	projection
		.scale(scale)
		.translate(translate);

	console.log(c);
	/*PATH
	------------------------------------------------------
	------------------------------------------------------
	*/

	svg3.selectAll("path")
		.append("g")
		.data(featureCollection.features)
		.enter()
		.append("path")
		.attr("d", path3)
		.attr("class", "feature");






});