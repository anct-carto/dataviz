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

/*INITIATE
------------------------------------------------------
------------------------------------------------------
*/

let width = "640";
let height = "460";
const margin = {top:20, right:20, bottom:20, left:50};



/*SVG GEOJSON
------------------------------------------------------
------------------------------------------------------
*/

/*Initiate svg*/
let svgGeo = d3.select(".c_map_geojson")
	.append("svg");


svgGeo
	.attr("width","100%")
	.attr("height",height);


/*PROJECTION GEOJSON
------------------------------------------------------
------------------------------------------------------
*/


console.time("load_geojson");
let startLoadGeojson = (new Date).getTime();

d3.json("reg2016.geojson").then(function(carto){
	console.log(carto);

	let diffLoadGeojson = (new Date).getTime() - startLoadGeojson;
	console.timeEnd("load_geojson");

	const projection = d3.geoConicConformal() //projection associée
		.fitSize([width,height],carto);


	const path = d3.geoPath() //générateur de chemin
		.projection(projection); //associe la projection au chemin




/*PATH GEOJSON
------------------------------------------------------
------------------------------------------------------
*/

	console.time("render_geojson");
	let startRenderGeojson = (new Date).getTime();

	svgGeo.selectAll("path")
		.append("g")
		.data(carto.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "feature");
	
	let diffRenderGeojson = (new Date).getTime() - startRenderGeojson;
	console.timeEnd("render_geojson");


	let timeGeo = document.querySelectorAll(".c_1 span");
	timeGeo[0].innerHTML = diffLoadGeojson + " ms";
	timeGeo[1].innerHTML = diffRenderGeojson + " ms";



});



/*SVG TOPOJSON
------------------------------------------------------
------------------------------------------------------
*/

/*Initiate svg*/
let svgTopo = d3.select(".c_map_topojson")
	.append("svg");

svgTopo
	.attr("width","100%")
	.attr("height",height);





/*PROJECTION TOPOJSON
------------------------------------------------------
------------------------------------------------------
*/

console.time("load_topojson");
let startLoadTopojson = (new Date).getTime();

d3.json("reg2016.json").then(function(carto){
	console.log(carto);

	let diffLoadTopojson = (new Date).getTime() - startLoadTopojson;
	console.timeEnd("load_topojson");

	const featureCollection = topojson.feature(carto, carto.objects.reg2016); //renvoie le GeoJSON

	const projection = d3.geoConicConformal() //projection associée
		.fitSize([width,height],featureCollection);

	const path = d3.geoPath() //générateur de chemin
		.projection(projection); //associe la projection au chemin


	/*PATH TOPOJSON
------------------------------------------------------
------------------------------------------------------
*/

	console.time("render_topojson");
	let startRenderTopojson = (new Date).getTime();

	svgTopo.selectAll("path")
		.append("g")
		.data(featureCollection.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "feature");
	
	let diffRenderTopojson = (new Date).getTime() - startRenderTopojson;
	console.timeEnd("render_topojson");


	let timeTopo = document.querySelectorAll(".c_2 span");
	timeTopo[0].innerHTML = diffLoadTopojson + " ms";
	timeTopo[1].innerHTML = diffRenderTopojson + " ms";

});