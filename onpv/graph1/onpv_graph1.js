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
let height = "460";
const margin = {top:20, right:20, bottom:80, left:50};

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
d3.csv("onpv_graph1.csv", function(d){
	return{
		lieu: d.lieu_de_residence,
		cat1: +d.pub_pub,
		cat2: +d.pub_priv,
		cat3: +d.priv_pub,
		cat4: +d.priv_priv
	};
}).then(function(data){

	console.log(data);
	
	let format = d3.format(",.1f");

	data.columns = ["lieu", "cat1", "cat2", "cat3", "cat4"];

	/*Initiate x Axis*/
	const x = d3.scaleBand()
		.padding(0.3)
		.align(0.3)
		.rangeRound([margin.left, width-margin.right])
		.domain(data.map(d=>d.lieu));


	const xAxis = d3.axisBottom(x)
		.ticks(10) //10 by default
		.tickSize(6) //6 by default
		.tickSizeOuter(0); //delete first and last tick


	/*Initiate y Axis*/
	const y = d3.scaleLinear()
		.rangeRound([height - margin.bottom, margin.top]);

	const yAxis = d3.axisRight(y)
		.ticks(10, " %")   //10 by default
		.tickSize(width); //6 by default


	/*Initiate z Axis*/
	const color = ["#33b0e6","#e2e8a0","#e73b26","#ece42c"];

	const z = d3.scaleOrdinal()
		.range(color)
		.domain(data.columns.slice(1)); //remove columns you don't need


	/*Initiate stack */
	const stack = d3.stack()
		.offset(d3.stackOffsetExpand);


	/*CHART
------------------------------------------------------
------------------------------------------------------
*/



	/*Call Axis*/

	svg
		.append("g")
		.attr("class","axis x_axis")
		.attr("transform", `translate(0,${height-margin.bottom})`)
		.call(customXAxis)
		.selectAll(".tick text")
		.call(wrap, x.bandwidth()+50);

	svg
		.append("g")
		.attr("class","axis y_axis")
		.attr("transform",`translate(${margin.left},0)`)
		.call(customYAxis);


	/*Initiate Serie*/
	const serie = svg.selectAll(".serie")
		.data(stack.keys(data.columns.slice(1))(data))
		.enter().append("g")
		.attr("class","serie")
		.attr("fill",d=>z(d.key));

	/*Call Serie*/
	serie.selectAll("rect")
		.data(function(d) { return d; })
		.enter()
		.append("rect")
		.attr("x", function(d) { return x(d.data.lieu); })
		.attr("y", function(d) { return y(d[1]); })
		.attr("height", function(d) { return y(d[0]) - y(d[1]); })
		.attr("width", x.bandwidth());


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



	/*LEGEND
------------------------------------------------------
------------------------------------------------------
*/

	const legendText = ["Scolarisée dans une école publique puis dans un collège public","Scolarisée dans une école publique puis dans un collège privé","Scolarisée dans une école privée puis dans un collège public","Scolarisée dans une école privée puis dans un collège privé"];

	let svgLegend = d3.select(".c_legend")
		.append("svg")
		.attr("width","100%")
		.attr("height",100);



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
	

	/*LEGEND
------------------------------------------------------
------------------------------------------------------
*/

	console.log(d3.sum(data[0], function(d){
		return d;
	}));
	console.log(d3.keys(data[0])); //first row
	console.log(data.columns.slice(1)); //delete header



	let popup = d3.select("body")
		.append("div")
		.attr("class", "c_popup");

	svg.selectAll("rect")
		.on("mousemove", function(d){
			popup
				.style("display","block")
				.style("left", d3.event.pageX - 20 + "px")
				.style("top", d3.event.pageY - 50 + "px")
				.style("text-align", "left");
			//d3.select(this).style("cursor","crosshair");
			d3.select(this).style("opacity",0.8);


			popup
				.html(`<div>${(d.data.lieu)}</div><hr>
					<div><p> <span id="popup_rect1"></span>${(legendText[0])} </p> ${format(d.data.cat1/(d.data.cat1+d.data.cat2+d.data.cat3+d.data.cat4)*100)} % </div>
					<div><p> <span id="popup_rect2"></span>${(legendText[1])} </p> ${format(d.data.cat2/(d.data.cat1+d.data.cat2+d.data.cat3+d.data.cat4)*100)} % </div>
					<div><p> <span id="popup_rect3"></span>${(legendText[2])} </p> ${format(d.data.cat3/(d.data.cat1+d.data.cat2+d.data.cat3+d.data.cat4)*100)} % </div>
					<div><p> <span id="popup_rect4"></span>${(legendText[3])} </p> ${format(d.data.cat4/(d.data.cat1+d.data.cat2+d.data.cat3+d.data.cat4)*100)} % </div>`);

		}) //mousemove
		.on("mouseout", function(d){
			popup
				.style("display","none");
			//d3.select(this).style("cursor","none");
			d3.select(this).style("opacity",1);
		}); //mouseout

	/* FUNCTIONS
------------------------------------------------------
------------------------------------------------------
*/
	/*Custom Axis*/

	function customXAxis(g){
		g.call(xAxis);
		g.select(".domain").remove();
	}

	function customYAxis(g){
		g.call(yAxis);
		g.select(".domain").remove();
		g.selectAll(".tick:not(:first-of-type) line")
			.attr("stroke","#777")
			.attr("stroke-dasharray", "2,2");
		g.selectAll(".tick text").attr("x", -30).attr("dy", 3);
			
	}

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
		x.range([margin.left, width-margin.right]);
		x.rangeRound([margin.left, width-margin.right]);
		y.rangeRound([height - margin.bottom, margin.top]);

		yAxis.tickSize(width);

		svg.select(".x_axis")
			.style("width", width);

		d3.select(svg.node().parentNode)
			.style("width", width);

		svg.selectAll("rect")
			.attr("x", function(d) { return x(d.data.lieu); })
			.attr("width", x.bandwidth());
			
		svg.selectAll(".x_axis")
			.call(customXAxis)	
			.selectAll("text")
			.call(wrap, x.bandwidth());


	}

	/*Resize legend*/


	function resize_legend(){
		width = parseInt(d3.select(".c_legend").style("width"), 10);
		height = parseInt(d3.select(".c_legend").style("height"),10);

		svg.selectAll(".legend")
			.selectAll("text")
			.attr("y",width);

		if (width < 420){
			console.log("< à 420px");
		} else {
			console.log("> 420px");
		}

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


d3.csv("onpv_graph1.csv", function(d){

	let format = d3.format(",");

	return{
		"Mouvement entre public / privé": d.lieu_de_residence,
		"D'une école publique vers un collège publique": format(+d.pub_pub),
		"D'une école publique vers un collège privé": format(+d.pub_priv),
		"D'une école privée vers un collège publique": format(+d.priv_pub),
		"D'une école privée vers un collège privé": format(+d.priv_priv)
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

	let nameFirstRow = document.querySelectorAll("[data-th='Lieu de résidence']");

		d3.select(nameFirstRow[0])
			.text("Nombre d'élèves résidant en quartiers prioritaires")

		d3.select(nameFirstRow[1])
			.text("Nombre d'élèves résidant hors quartiers prioritaires")

	}); //data



/*
Développeur : B.Miroux
*/
