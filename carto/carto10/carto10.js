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

let width = "660";
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

	let g = svg.append("g"); //conteneur pour le zoom

	//Génération de la France
	let svgFr = g.selectAll(".fr")
		.data(featureCollectionFr.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "fr");

	//Génération des ZE
	let svgZe = g.selectAll(".ze")
		.data(featureCollectionZe.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "ze");

	//Génération des Régions
	let svgReg = g.selectAll(".reg")
		.data(featureCollectionReg.features)
		.enter()
		.append("path")
		.attr("d",path)
		.attr("class","reg");



	/*CENTROIDE
	------------------------------------------------------
	------------------------------------------------------
	*/
	let ctrSquare = g.attr("class","ctr_square")
		.selectAll(".ctr_square")
		.data(featureCollectionZe.features)
		.enter()
		.append("rect")
		.attr("x", (d)=>{return path.centroid(d)[0] - 7/2;})
		.attr("y", (d)=>{return path.centroid(d)[1] - 7/2;})
		.attr("width",7)
		.attr("height",7)
		.attr("fill","#e8e8e8")
		.attr("stroke","#000");

	let ctrCircle = g.attr("class","ctr_circle")
		.selectAll(".ctr_circle")
		.data(featureCollectionZe.features)
		.enter()
		.append("circle")
		.attr("transform", (d)=>{return "translate(" + path.centroid(d) + ")";})
		.attr("r",1);

	/*ZOOM
	------------------------------------------------------
	------------------------------------------------------
	*/

	svg
		.call(d3.zoom()
			.on("zoom", function(){
				g.attr("transform", d3.event.transform);
			})
			.scaleExtent([1,6]) //profondeur de zoom
			.translateExtent([[0,0],[width, height]]) //étendu du zoom [[x0,y0],[x1,y1]]
		)
		.append("g");






	/*RESPONSIVE
	------------------------------------------------------
	------------------------------------------------------
	*/

	//Resize SVG, responsive

	console.log("Etat du document : " + document.readyState);
	if (document.readyState == "loading") {
		document.addEventListener("DOMContentLoaded", ()=>{
			resize();
		});
	} else {
		resize();
	}

	d3.select(window)
		.on("resize", ()=>{
			resize();
		});

	

	function resize(){

		/*Update width and height*/
		width = parseInt(d3.select(".c_map").style("width"), 10);
		height = parseInt(d3.select(".c_map").style("height"),10);
		console.log("width window : " + window.innerWidth);
		
		svg
			.attr("width","100%");

		scale = 0.95/Math.max(dx/width, dy/height);
		translate = [width/2 - scale * x, height/2-scale * y];

		projection
			.scale(scale)
			.translate(translate);

		svg
			.selectAll("path")
			.attr("d", path);

		ctrSquare
			.attr("x", (d)=>{return path.centroid(d)[0] - 7/2;})
			.attr("y", (d)=>{return path.centroid(d)[1] - 7/2;});

		ctrCircle
			.attr("transform", (d)=>{return "translate(" + path.centroid(d) + ")";});
	}


});


