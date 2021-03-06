function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var chartdata;
var piedata;
var plusminusdata;

var processSales = function() 
{
    $.ajaxSetup({ cache: false });    
    
  $.getJSON('http://salesscoreboardadmin.storeapps.fglsports.dmz/files/'+BANNER+'.json', function(data) {
    console.log(data);

    var week =  data.week;
    var banner = data.banner;

    $( "#week" ).text( week );

      var weektotaldollars = 0;
      var lastyeartotaldollars =0;

      //bar chart data
      var actualDollars = [];  
      var lastYearDollars = []; 
      var plusminusdatavalues = [];

      $.each(data.details, function( index, d ){
          
		$( "#"+d.day+" .day" ).text( d.day );
		if(d.data.thisyear > 0) {
          //data table

        $( "#"+d.day+" .thisyear" ).text( "" );
        $( "#"+d.day+" .lastyear" ).text( "" );

        console.log("emptied " + d.day + "!");

        $( "#"+d.day+" .thisyear" ).text( "$" + numberWithCommas(d.data.thisyear) );
        $( "#"+d.day+" .lastyear" ).text( "$" + numberWithCommas(d.data.lastyear) );


        console.log("filled " + d.day + " with " + d.data.thisyear + " and " + d.data.lastyear);

        var diff = parseInt(d.data.thisyear) - parseInt(d.data.lastyear);
        var percentage = (diff / d.data.lastyear) * 100;
        percentage = 100 + parseFloat(percentage);
        percentage = Math.round(percentage * 100) / 100;
			
        if( isNaN(percentage) == true ){
        	$( "#"+d.day+" .percentage" ).text( "" );              
        } else {
            $( "#"+d.day+" .percentage" ).text( "" );              
            console.log("explicitly emptied " + d.day + " percentage" ); 
        	$( "#"+d.day+" .percentage" ).text( percentage + "%" );
            console.log("filled "+ d.day + "% with " + percentage);
        }
          
          weektotaldollars = weektotaldollars + parseInt(d.data.thisyear);
          lastyeartotaldollars = lastyeartotaldollars + parseInt(d.data.lastyear);
          
          //add dollars to 
         

          // var plusminus = percentage - 100;
          // plusminusdatavalues.push( parseFloat(plusminus) );
		}
		
		 var plusminus = percentage - 100;
          plusminusdatavalues.push( parseFloat(plusminus) );
		
		 actualDollars.push( parseInt(d.data.thisyear) );
          lastYearDollars.push( parseInt(d.data.lastyear) );

      });

      //week totals
      $( ".week-total-value" ).text( "$" + numberWithCommas(data.weekTotal) )

      //total %
      var diff = weektotaldollars - lastyeartotaldollars;
      // var totalcompperc = (diff / lastyeartotaldollars) * 100;
      var totalcompperc = data.totalPercentage;
      // weekpercentage = 100 + parseFloat(totalcompperc);
      // weekpercentage = Math.round(weekpercentage * 100) / 100;
      $( ".week-total-comp-value" ).text( totalcompperc + "%" );    



      chartdata = {
        labels: ['Mon', 'Tues','Wed', 'Thurs', 'Fri', 'Sat', 'Sun'],
        series: [
          actualDollars,
          lastYearDollars
        ]
      }

      plusminusdata = {
        labels: ['Mon', 'Tues','Wed', 'Thurs', 'Fri', 'Sat', 'Sun'],
        series: [
              plusminusdatavalues
          ]
      }
  })

  .done( function(){

      new Chartist.Bar('#chart1', chartdata, chartoptions)
      .on('draw', function(data) {
    
        if(data.type === 'bar') {
          data.element.attr({
            style: 'stroke: green; stroke-width: 30px'
          }); 
        }
        if(data.seriesIndex == 1){
         data.element.attr({
            style: 'stroke: #eee; stroke-width: 30px'
          });  
        }
      });

      new Chartist.Bar('#bar', plusminusdata, plusminusoptions)
      .on('draw', function(data) {
        if(data.type === 'bar') {
          data.element.attr({
            style: 'stroke: green; stroke-width: 120px'
          });

          if(data.value.y < 0){
            data.element.attr({
              style: 'stroke-width: 120px; stroke: red;'
            });
          } 
        }
      });
  });

}

var processPie = function()
{
    var pieDollarsArray = [];
    var pieLabelsArray = [];
    $.getJSON('http://salesscoreboardadmin.storeapps.fglsports.dmz/files/pie/'+BANNER+'.json', function(data) {
      
        $.each(data.details, function( index, d ){
            
            pieLabelsArray.push( d.category ); 
            pieDollarsArray.push( parseInt(d.value));

        });

        piedata = {
            labels: pieLabelsArray,
            series: pieDollarsArray
        }

    })
    .done( function() {
        $( ".ct-legend" ).empty();
        new Chartist.Pie('#pie', piedata, pieoptions, pieresponsiveOptions);

        var legend = $('.ct-legend');
        $.each(piedata.labels, function(i, val) {
            var listItem = $('<li />')
                .addClass('ct-series-' + i)
                .html('<strong>' + val + '</strong>: $' + numberWithCommas(piedata.series[i]))
                .appendTo(legend);
        });
    });
}

 

$(document).ready(function(){ 

  processSales();
  processPie();

  setInterval(function(){ 
    console.log("go!");
    processSales(); 
    processPie();
  },60000);

}); 

