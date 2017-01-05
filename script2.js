(function(){
    let margin = {
            top: 50,
            right: 0,
            bottom: 70,
            left: 180
        },
        width = 960 - margin.left - margin.right,
        height = 430 - margin.top - margin.bottom,
        gridRowSize,
        gridColumnSize,

        colors = ["#ffffff","#e20000", "#34BB00","#00ff0d"],

        data = [
            {src:"webapp:ux",srcInst:"inst1", dest:"webapp:websvc", destInst:"inst2", reqCount:"310"},
            {src:"webapp:ux",srcInst:"inst2", dest:"webapp:websvc", destInst:"inst1", reqCount:"410"},
            {src:"webapp:ux",srcInst:"inst2", dest:"webapp:websvc", destInst:"inst3", reqCount: "310"},

            {src:"webapp:websvc",srcInst:"inst1", dest:"webapp:mongo", destInst:"inst1", reqCount:"100001"},
            {src:"webapp:websvc",srcInst:"inst2", dest:"webapp:mongo", destInst:"inst1", reqCount:"100001"},
            {src:"webapp:websvc",srcInst:"inst3", dest:"webapp:mongo", destInst:"inst2", reqCount: "100001"},

            {src:"infra:logsvc",srcInst:"inst1", dest:"webapp:mongo", destInst:"inst1", reqCount:"1"},
            {src:"infra:logsvc",srcInst:"inst1", dest:"webapp:mongo", destInst:"inst2", reqCount:"45"},
            {src:"infra:logsvc",srcInst:"inst2", dest:"webapp:mongo", destInst:"inst1", reqCount:"45"},

            {src:"infra:dope",srcInst:"inst1", dest:"webapp:mongo", destInst:"inst1", reqCount:"6100"},
            {src:"infra:dope",srcInst:"inst1", dest:"webapp:mongo", destInst:"inst2", reqCount:"6100"},

            {src:"infra:kds",srcInst:"inst1", dest:"webapp:mongo", destInst:"inst1", reqCount:"9100"},
            {src:"infra:kds",srcInst:"inst1", dest:"webapp:mongo", destInst:"inst2", reqCount:"9100"},

            {src:"webapp:mongo",srcInst:"inst1", dest:"infra:logsvc", destInst:"inst1", reqCount:"1"},
            {src:"webapp:mongo",srcInst:"inst1", dest:"infra:logsvc", destInst:"inst2", reqCount:"45"},
            {src:"webapp:mongo",srcInst:"inst2", dest:"infra:logsvc", destInst:"inst1", reqCount:"45"},

            {src:"webapp:mongo",srcInst:"inst1", dest:"infra:dope", destInst:"inst1", reqCount:"6100"},
            {src:"webapp:mongo",srcInst:"inst1", dest:"infra:dope", destInst:"inst2", reqCount:"6100"},

            {src:"webapp:mongo",srcInst:"inst1", dest:"infra:kds", destInst:"inst1", reqCount:"9100"},
            {src:"webapp:mongo",srcInst:"inst1", dest:"infra:kds", destInst:"inst2", reqCount:"10001"}];


    // array containing buttons
    let buttonNames = ["Back"];
    d3.select("body")
        .selectAll("input")
        .data(buttonNames)
        .enter()
        .append("input")
        .attr("type","button")
        .attr("class", function(d){ return 'button '+d})
        .classed('hidden', true)
        .attr("value", function (d){return d;} );


    let draw = function( data , detailed = false){
        console.log(detailed);

        let scrLabel, destLabel;
        // show the back button for detailed view else hide it
        if(detailed){
            d3.select('.Back').classed('hidden', false);
            srcLabel = data[0].src;
            destLabel = data[0].dest;
        }
        else{
            d3.select('.Back').classed('hidden', true);
            srcLabel = null;
            destLabel = null;
        }


        let   sourceLabels =[],
            destinationLabels=[],

            // matrix for storing reqCount values
            reqCountMatrix= [];

        // get unique labels for the table
        if(detailed){
            sourceLabels = getUnique(data, 'srcInst');
            destinationLabels = getUnique(data, 'destInst');

        }else{
            sourceLabels = getUnique(data, 'src');
            destinationLabels = getUnique(data, 'dest');

        }


        // get unique labels for table
        function getUnique(data, labelFor){

            let tempArr =[];
            if(labelFor == 'src')
                tempArr = data.map(function(value){ return value.src});
            else if(labelFor == 'dest' )
                tempArr = data.map(function(value){ return value.dest});
            else if(labelFor == 'srcInst' )
                tempArr = data.map(function(value){ return value.srcInst});
            else
                tempArr = data.map(function(value){ return value.destInst});

            console.log(tempArr);
            tempArr = tempArr.filter(function(value, index, self){

                if(self.indexOf(value) == index)
                {
                    return value;
                }
            });
            return tempArr;
        };


        gridRowSize = Math.floor(height/ destinationLabels.length);
        gridColumnSize = Math.floor(width/ sourceLabels.length);

        // constructing matrix containing reqCount values for services
        function createMatrix( data, array ){

            // set up the matrix
            for( let i = 0; i< destinationLabels.length; i++) {
                let subarray = [];
                for(let j = 0; j< sourceLabels.length; j++){
                    subarray.push(0);
                }
                array.push(subarray);
            }

            for(let obj of data){
                let src, dest;
                if(!detailed){
                     src = obj.src;
                     dest = obj.dest;

                }
                else{
                    src = obj.srcInst;
                    dest = obj.destInst;

                }
                let srcIndex =  sourceLabels.indexOf(src);
                let destIndex =  destinationLabels.indexOf(dest);

                if(array[destIndex][srcIndex]< parseInt(obj.reqCount, 10)){
                    array[destIndex][srcIndex] = parseInt(obj.reqCount, 10);
                }

            }

        }

        createMatrix(data, reqCountMatrix);

        let svg = d3.select("#chart")
            .append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', ' translate('+margin.left+','+margin.top+')');



        // creating the row labels
        let rowLabel =  svg.selectAll('.rowLabel')
            .data(destinationLabels)
            .enter()
            .append('text')
            .text(function(d){
                if(!(destLabel === undefined || destLabel === null) ){
                    return destLabel+' : '+d;
                }
                else{
                    return d;

                }
            })
            .attr('x', 0)
            .attr('y', function(d, i){
                return i * gridRowSize;
            })
            .style('text-anchor', 'end')
            .attr('transform', 'translate( -6 '+gridRowSize/1.5+')')
            .attr('class', function(d, i){ return 'rowLabel r'+i})
            .on('mouseover', function(d) {d3.select(this).classed('text-hover', true)})
            .on('mouseout', function(d) {d3.select(this).classed('text-hover', false)});


        // creating the column labels
        let colLabel = svg.selectAll('.colLabel')
                .data(sourceLabels)
                .enter()
                .append('text')
                .text(function(d){
                    if(!(srcLabel === undefined || srcLabel === null) ){
                        return srcLabel+' : '+d;
                    }
                    else{
                        return d;

                    }
                })
                .attr('x', function (d,i) {
                        return i*gridColumnSize;
                    }

                )
                .attr('y', 0)
                .style('text-anchor', 'middle')
                .attr('transform', 'translate(' + gridColumnSize/2  + ',-6)')
                .attr('class', function(d, i){ return 'colLabel c'+i})
                .on('mouseover', function(d) {d3.select(this).classed('text-hover', true)})
                .on('mouseout', function(d) {d3.select(this).classed('text-hover', false)})
            ;


        // color scale for reqCount values below 10000
        let colorScale = d3.scale.linear()
            .domain([0, d3.max(data, function(d){ if(d.reqCount<10000){ return d.reqCount}})])
            .range([colors[3], colors[2]]);

        // creating nodes representing a source and destination
        let cards = svg.selectAll('g')
            .data(reqCountMatrix)
            .enter()
            .append('g')
            .attr('transform', function(d, i){
                return 'translate(0,'+gridRowSize*i+')';
            })
            .attr('id', function(d, i){
                // console.log(d);
                return i;
            })
            .on('mouseover', function(d, i) {
                d3.selectAll('.r'+i).classed('text-highlight', true);

            })
            .on('mouseout', function(d, i){
                d3.selectAll('.r'+i).classed('text-highlight', false);
            });
        // .on('click', function(d, i){ console.log( d);});

        cards.selectAll('rect')
            .data(function(d){
                return d;
            })
            .enter()
            .append('rect')
            .attr('x', function(d, j , self){

                return j * gridColumnSize;
            })
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('class', 'source bordered')
            .attr('width', gridColumnSize)
            .attr('height',gridRowSize)
            .on('mouseover', function(d, j) {

                d3.select(this).classed('cell-hover' , true);
                d3.selectAll('.c'+j).classed('text-highlight', true);
                d3.select("#tooltip")
                    .style("left", (d3.event.pageX ) + "px")
                    .style("top", (d3.event.pageY) + "px")
                    .select("#value")
                    .text("reqCount value : "+d);
                d3.select("#tooltip").classed("hidden", false);


            })
            .on('mouseout', function(d, j) {
                d3.select(this).classed("cell-hover", false);
                d3.selectAll('.c'+j).classed('text-highlight', false);
                d3.select("#tooltip").classed("hidden", true);

            })


            .on('click', function(d, col , row){
                if(!detailed && d > 0){
                    let src = sourceLabels[col];
                    let dest = destinationLabels[row];
                    let detailedData = [];
                    for (let value of data){
                        // console.log(value);
                        if(value.src === src  && value.dest === dest){
                            detailedData.push(value);

                        }
                    }
                    console.log(detailedData);
                    d3.select('svg').remove();
                    draw(detailedData, true);
                }
            })
            .style('fill', colors[0])
            .transition()
            .duration(2000)
            .style('fill', function(d){
                if(d<=0) {
                    return colors[0];
                }
                if(d> 10000 ){
                    return colors[1];
                }
                return colorScale(d);

            });
    }

    // draw graph on load
    draw(data, false);

    // click action for back button
    d3.select('.Back')
        .on('click', function(){
            d3.select('svg').remove();

            draw(data, false);
        })





})();