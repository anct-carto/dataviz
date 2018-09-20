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


/*PROJECTION
------------------------------------------------------
------------------------------------------------------
*/

const promise1 = d3.json("reg2016.json");
const promise2 = d3.csv("data.csv");

Promise.all([promise1, promise2]).then(function(carto){

	console.log(carto); //promise1 + promise2

	console.log(carto[0]); //promise1
	console.log(carto[1]); //promise2

	const featureCollection = topojson.feature(carto[0], carto[0].objects.reg2016); //renvoie le GeoJSON

	const projection = d3.geoConicConformal() //projection associée
		.fitSize([width,height],featureCollection);

	const path = d3.geoPath() //générateur de chemin
		.projection(projection); //associe la projection au chemin


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

