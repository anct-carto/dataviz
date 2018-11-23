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
const promise2 = d3.json("ze.json");
const promise3 = d3.csv("empl.csv");

Promise.all([promise1, promise2, promise3]).then(function(carto){
	console.log(carto);



	const featureCollectionReg = topojson.feature(carto[0], carto[0].objects.reg2016); //renvoie le GeoJSON
	const featureCollectionZe = topojson.feature(carto[1], carto[1].objects.ze);

	/*JOIN JSON & CSV
	------------------------------------------------------
	------------------------------------------------------
	*/

	featureCollectionZe.features.forEach((d)=>{
		carto[2].forEach((e)=>{
			if (d.properties.id_ze === e.codgeo){
				d.properties.empl_tot_2015 = +e.empl_tot_2015;
			}
		});
	});

	console.log(featureCollectionZe.features);

	/*PROJECTION, CENTER
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



	/*PROPORTIONNAL SYMBOL
	------------------------------------------------------
	------------------------------------------------------
	*/
	//featureCollectionZe.features //objet
	//featureCollectionZe.features.length //nombre d'entités
	console.log(featureCollectionZe.features);

	let rMax = d3.max(featureCollectionZe.features,(d)=>{return d.properties.empl_tot_2015;});

	let propCircle = g.attr("class","prop_circle")
		.selectAll(".prop_circle")
		.data(featureCollectionZe.features)
		.enter()
		.append("circle")
		.attr("transform", (d)=>{return "translate(" + path.centroid(d) + ")";})
		.attr("r",(d)=>{return(Math.sqrt(d.properties.empl_tot_2015/rMax))*30;})
		.attr("fill","#ffa500")
		.attr("fill-opacity",0.8)
		.attr("stroke-width",1)
		.attr("stroke","#e6e6e6")
		.attr("pointer-events","none");


	/*LEGEND PROPORTINNAL SYMBOL
	------------------------------------------------------
	------------------------------------------------------
	*/


	let legend = svg.append("g")
		.attr("class", "legend")
		.attr("transform", "translate(" + (width - 600) + "," + (height - 50) + ")")
		.selectAll(".legend")
		.data([6e6,2e6,5e5])
		.enter()
		.append("g");

	legend.append("circle")
		.attr("cy", function(d) { return 10; })
		.attr("r", 10);


		
	/*MOUSE EVENT
	------------------------------------------------------
	------------------------------------------------------
	*/


	
	svgZe
		.on("mouseover", function(e){
			//div information
			document.getElementById("name").innerHTML=e.properties.nom_ze,
			document.getElementById("pop").innerHTML=e.properties.pop,
			document.getElementById("empl").innerHTML=e.properties.empl_tot_2015,

			//geographical unit
			d3.select(this)
				.attr("stroke-width",1)
				.attr("stroke","#646464");

		
		}
		)
		.on("mouseout", function(e){
			document.getElementById("name").innerHTML="&nbsp",
			document.getElementById("pop").innerHTML="&nbsp",
			document.getElementById("empl").innerHTML="&nbsp",

			d3.select(this)
				.attr("stroke-width",0);

		}
		)
		.on("click",
			(e)=>{console.log(e.properties.nom_ze)}
		);





	/*ZOOM
	------------------------------------------------------
	------------------------------------------------------
	*/

	svg
		.call(d3.zoom()
			.on("zoom", function(){
				g.attr("transform", d3.event.transform);

				propCircle
					.attr("r",(d)=>{return(Math.sqrt(d.properties.empl_tot_2015/rMax))*30/d3.event.transform.k;})
					.attr("stroke-width",1/d3.event.transform.k);


			})
			.scaleExtent([1,6]) //profondeur de zoom
			.translateExtent([[0,0],[width, height]]) //étendu du zoom [[x0,y0],[x1,y1]]
		)







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

		width = parseInt(d3.select(".c_map").style("width"), 10); //update width
		height = parseInt(d3.select(".c_map").style("height"),10); //update height
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

		propCircle
			.attr("transform", (d)=>{return "translate(" + path.centroid(d) + ")";});


	}







});


