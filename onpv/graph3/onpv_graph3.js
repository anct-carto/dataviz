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
let svg = d3.select(".c_chart")
	.append("svg");

let width = "640";
let height = "360";
const margin = {top:20, right:20, bottom:50, left:50};

svg
	.attr("width","100%")
	.attr("height",height);

/*Initiate format number*/
d3.formatDefaultLocale({
	"decimal": ",",
	"thousands": "\u2009",
	"grouping": [3]
});


/*DATA, AXIS
------------------------------------------------------
------------------------------------------------------
*/
/*Initiate data*/
d3.csv("onpv_graph3_chart.csv", function(d,i,columns){
	for (let i=1, n=columns.length ; i<n ; ++i) d[columns[i]] = +d[columns[i]];
	return d;
}).then(function(data){

	console.log(data);

	let format = d3.format(",.1f");
	let keys = data.columns.slice(1); //delete first columns
	console.log(keys);

	/* Initiate xAxis */
	/*x0 inter-grouped bar chart and x1 intra-grouped bar chart */
	const x0 = d3.scaleBand()
		.rangeRound([margin.left, width-margin.right])
		.paddingInner(0.1)
		.domain(data.map((d)=> {return d.categorie;}));

	const xAxis = d3.axisBottom(x0)
		.tickSizeOuter(0);

	const x1 = d3.scaleBand()
		.padding(0.05)
		.domain(keys)
		.rangeRound([0,x0.bandwidth()]);

	/* Initiate yAxis */
	const y = d3.scaleLinear()
		.rangeRound([height-margin.bottom, margin.top])
		.domain([0, d3.max(data, (d)=>{return d3.max(keys, (key)=>{return d[key]; }); })]).nice();

	const yAxis = d3.axisRight(y)
		.tickSize(width)
		.tickFormat((d)=>{return d+"%";}); //add unit

	/* Initiate zAxis */
	const z = d3.scaleOrdinal()
		.range(["#ba3c51","#fa9150"]);


	
	/*CHART
------------------------------------------------------
------------------------------------------------------
*/

	/*Call Axis*/

	svg
		.append("g")
		.attr("class","axis x_axis")
		.attr("transform", `translate(0,${height-margin.bottom})`)
		.call(xAxis)
		.selectAll(".tick text")
		.call(wrap, x0.bandwidth()+50); //text wrap



	svg
		.append("g")
		.attr("class","axis y_axis")
		.attr("transform",`translate(${margin.left},0)`)
		.call(yAxis)
		.select(".domain").remove();

	svg.select(".y_axis")
		.selectAll(".tick:not(:first-of-type) line")
		.attr("stroke","#777")
		.attr("stroke-dasharray", "2,2");

	svg.select(".y_axis")
		.selectAll("text")
		.attr("x",-10)
		.attr("dy",3);
			

	

	/*Initiate & Call Serie*/

	svg
		.append("g")
		.selectAll("g")
		.data(data)
		.enter().append("g")
		.attr("class","gbar")
		.attr("transform", function(d) { return "translate(" + x0(d.categorie) + ",0)"; })
		.selectAll("rect")
		.data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
		.enter().append("rect")
		.attr("x", function(d) { return x1(d.key); })
		.attr("y", function(d) { return y(d.value); })
		.attr("width", x1.bandwidth())
		.attr("height", function(d) { return height-margin.bottom - y(d.value); })
		.attr("fill", function(d) { return z(d.key); });


	/*LEGEND
------------------------------------------------------
------------------------------------------------------
*/

	const legendText = ["Résidant en quartiers prioritaires", "Résidant en dehors des quartiers prioritaires"];

	let svgLegend = d3.select(".c_legend")
		.append("svg")
		.attr("width","100%")
		.attr("height",60);



	let legend = svgLegend.selectAll(".legend")
		.data(z.range())
		.enter()
		.append("g")
		.attr("class","legend");

	

	
	legend
		.append("rect")
		.attr("x", 10)
		.attr("y", function(d, i) {
			return i * 20;
		})
		.attr("width", 23)
		.attr("height", 12)
		.style("stroke", "black")
		.style("stroke-width", 0.1)
		.style("fill", function(d){return d;});

	legend
		.append("text")
		.attr("x", 40) //leave 5 pixel space after the <rect>
		.attr("y", function(d, i) {
			return 3 + i * 20;
		})
		.attr("dy", "0.5em")
		.text(function(d,i){
			return legendText[i];
		});	 


	/*POPUP
------------------------------------------------------
------------------------------------------------------
*/

	let popup = d3.select("body")
		.append("div")
		.attr("class", "c_popup");

	svg.selectAll("rect")
		.on("mousemove", function(d){
			popup
				.style("display","block")
				.style("left", d3.event.pageX - 20 + "px")
				.style("top", d3.event.pageY - 40 + "px")
				.style("text-align", "left");
			//d3.select(this).style("cursor","crosshair");
			d3.select(this).style("opacity",0.8);



			popup
				.html(`<div><p></p>${format(d.value)} %</div>`);

		}) //mousemove
		.on("mouseout", function(d){
			popup
				.style("display","none");
			//d3.select(this).style("cursor","none");
			d3.select(this).style("opacity",1);
		}); //mouseout



	/*RESPONSIVE
------------------------------------------------------
------------------------------------------------------
*/

	/*Resize SVG, responsive*/

	console.log("Etat du document : " + document.readyState);
	if (document.readyState == "loading") {
		document.addEventListener("DOMContentLoaded", ()=>{
			resize();
			resize_legend();
		});
	} else {
		resize();
		resize_legend();
	}

	d3.select(window)
		.on("resize", ()=>{
			resize();
			resize_legend();
		});


	/*Wrap Long Label*/
	function wrap(text, width) {
		text.each(function() {
			let text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, // ems
				y = text.attr("y"),
				dy = parseFloat(text.attr("dy")),
				tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
				}
			}
		});
	}


	/*Resize SVG*/
	function resize(){

		/*Update width and height*/
		width = parseInt(d3.select(".c_chart").style("width"), 10);
		height = parseInt(d3.select(".c_chart").style("height"),10);
		console.log("width window : " + window.innerWidth);
		/*Resize chart*/
		x0.range([margin.left, width-margin.right]);
		x0.rangeRound([margin.left, width-margin.right]);
		x1.rangeRound([0,x0.bandwidth()]);

		svg.selectAll(".gbar")
			.attr("transform", function(d) { return "translate(" + x0(d.categorie) + ",0)"; });

		yAxis.tickSize(width);

		d3.select(svg.node().parentNode)
			.style("width", width);

		svg
			.attr("width",width);

		svg.selectAll("rect")
			.attr("x", function(d) { return x1(d.key); })
			.attr("width", x1.bandwidth());
		
		svg.selectAll(".x_axis")
			.call(xAxis)	
			.selectAll("text")
			.call(wrap, x0.bandwidth());

	}

	/*Resize legend*/


	function resize_legend(){
		width = parseInt(d3.select(".c_legend").style("width"), 10);
		height = parseInt(d3.select(".c_legend").style("height"),10);

		svg.selectAll(".legend")
			.selectAll("text")
			.attr("y",width);


	}





	/*
TEST NAVIGATION
*/
	console.log("Largueur Window : " + window.innerWidth);

	const tabLinks = document.querySelectorAll(".tab_links");



	Array.from(tabLinks).forEach((el,i)=>{
		el.addEventListener("click", function(){
			switch (i) {
			case 0:
				openTab(0,1);
				styleButton(0,1);
				resize();
				break;
			case 1:
				openTab(1,0);
				styleButton(1,0);
				break;
			}
		});
	});



	Array.from(tabLinks).forEach((el,i)=>{
		el.addEventListener("mouseover",function(){
			tabLinks[i].style.color = "#333";
		});
	});

	Array.from(tabLinks).forEach((el,i)=>{
		el.addEventListener("mouseout",function(){
			tabLinks[i].style.color = "#666";
		});
	});


	function openTab(i,j){
		document.querySelectorAll(".tab_content")[i].style.display = "block";
		document.querySelectorAll(".tab_content")[j].style.display = "none";
	}

	function styleButton(i,j){
		tabLinks[i].style.backgroundColor = "#eee";
		tabLinks[j].style.backgroundColor = "#fff";
		tabLinks[i].style.color = "#333";
		tabLinks[j].style.color = "#666";
		tabLinks[i].style.borderBottomWidth = "1px";
		tabLinks[j].style.borderBottomWidth = "3px";
	}


	tabLinks[0].style.backgroundColor = "#eee";
	tabLinks[0].style.borderBottomWidth = "1px";


}); //data



/*TABLE
------------------------------------------------------
------------------------------------------------------
*/


d3.csv("onpv_graph3_table.csv", function(d){

	let format = d3.format(",");

	return{
		"": d.categorie,
		"Quartiers prioritaires": format(+d.qpv),
		"Hors quartiers prioritaires": format(+d.h_qpv)
	};
}).then(function(data){
	
	

	let sortAscending = true;
	let table = d3.select(".c_table").append("table");
	let titles = d3.keys(data[0]);
	let headers = table.append("thead").append("tr")
		.selectAll("th")
		.data(titles).enter()
		.append("th")
		.text(function (d) {
			return d;
		})
		.on("click", function (d) {
			headers.attr("class", "header");
			
			if (sortAscending) {
				rows.sort(function(a, b) { return b[d] < a[d]; });
				sortAscending = false;
				this.className = "aes";
			} else {
				rows.sort(function(a, b) { return b[d] > a[d]; });
				sortAscending = true;
				this.className = "des";
			}
			
		});
	
	let rows = table.append("tbody").selectAll("tr")
		.data(data).enter()
		.append("tr");
	rows.selectAll("td")
		.data(function (d) {
			return titles.map(function (k) {
				return { "value": d[k], "name": k};
			});
		}).enter()
		.append("td")
		.attr("data-th", function (d) {
			return d.name;
		})
		.text(function (d) {
			return d.value;
		});



}); //data


/*RESPONSIVE IFRAME
------------------------------------------------------
------------------------------------------------------
*/

let documentHeight = document.getElementsByClassName("main-element")[0].scrollHeight; // Get height of the main element in the iframe document
let message = "documentHeight:"+documentHeight; // Add some unique identifier to the string being passed

parent.postMessage(message,"*"); // Pass message to (any*) parent document

// On resize of the window, recalculate the height of the main element, and pass to the parent document again
window.onresize = function() {
	let newDocumentHeight = document.getElementsByClassName("main-element")[0].scrollHeight;
	let heightDiff = documentHeight - newDocumentHeight;

	// If difference between current height and new height is more than 10px
	if ( heightDiff > 10 | heightDiff < -10 ) {
		documentHeight = newDocumentHeight;
		message = "documentHeight:"+documentHeight;
		parent.postMessage(message,"*");
	}
	
} ;