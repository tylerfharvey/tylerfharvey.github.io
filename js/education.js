const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
const colors = ["#00ccff","#3399ff","#6666ff","#9933ff","#cc00ff"]
const dataSources = ['https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
                     'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'];

const jsonData = []

function tooltipData(id, education) {
  return getCountyName(id, education) + '<br>' + getBachelorPercent(id, education)
}

function getCountyName(id, education) {
  let countyName = education.filter(function (o) {
    return o.fips === id
  })
  if (countyName[0]) {
    return countyName[0].area_name
  }
  return "countyName"
}

function getBachelorPercent(id, education) {
  let bachelorPercent = education.filter(function (o) {
    return o.fips === id
  })
  if (bachelorPercent[0]) {
    return bachelorPercent[0].bachelorsOrHigher
  }
  return 0
}

function createChart(jData) {
  let userEd = jData[0]
  let counties = jData[1]//.arcs
  //console.log(userEd[0])
  //console.log(counties)//[0])
  
  let mapW = 1000
  let mapH = 700

  var path = d3.geoPath();
  
  var color = d3
  .scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 6))
  .range(d3.schemeBlues[7]);
  
//add tooltip
  const tooltip = d3.select("body")
    .append("div")
    .attr('id', 'tooltip')
    .style('opacity', 0)
  
//define the graph area
  const svg = d3.select("svg")
  svg.attr("width", mapW)
     .attr("height", mapH)
  
//add legend\\
  var g = svg
    .append('g')
    .attr('class', 'key')
    .attr('id', 'legend')
  
  g.selectAll("rect")
    .data(color.range())
    .enter()
    .append('rect')
    .attr("x", function (d , i) {return 700 + i * 20})
    .attr("y", 50)
    .attr("width", 20)
    .attr("height", 10)
    .attr('fill', function (d , i) {return color.range()[i]})

//add counties
  svg.append('g')
     .attr('class', 'counties')
     .selectAll('path')
     .data(topojson.feature(counties, counties.objects.counties).features)
     .enter()
     .append('path')
     .attr('class', 'county')
     .attr('data-fips', function (d) {
        return d.id;
     })
     .attr('data-education', function (d) {
        return getBachelorPercent(d.id, userEd)
     })
     .attr('fill', function (d) {
         return color(getBachelorPercent(d.id, userEd))
      })
     .attr('d', path)
     .on("mouseover", function (event, d) {
       tooltip.transition().duration(200).style('opacity', 0.9)
      //console.log(event) 
      //console.log(d)
       tooltip
         .html( tooltipData(d.id, userEd) )
         .attr('data-education', function () {
            return getBachelorPercent(d.id, userEd)
          })
         .style('left', event.pageX + 10 + 'px')
         .style('top', event.pageY - 28 + 'px')
      })
      .on('mouseout', function () {
        tooltip.transition().duration(200).style('opacity', 0);
      })

  //add state outlines
  svg
    .append('path')
    .datum(
      topojson.mesh(counties, counties.objects.states, function (a, b) {
        return a !== b;
      })
    )
    .attr('class', 'states')
    .attr('d', path);
  
}

function getData() {
  const data = ['', ''];

  const dataRecieved = function(i) {
    return function() {
      const json = JSON.parse(data[i].responseText)
      jsonData[i] = json
      if (jsonData[0] && jsonData[1]) {
        createChart(jsonData)
      }
    }
  }

  for(let i = 0; i < dataSources.length; i++) {
    let dataSource = dataSources[i]; 
    data[i] = new XMLHttpRequest();
    data[i].open('GET', dataSource, true);
    data[i].onload=dataRecieved(i);
    data[i].send();
  }
}

getData()
