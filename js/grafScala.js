$(document).ready(function() {

    fillCountries(); 
    $('#selPais').select2();
    $("#selPais").select2({
      placeholder: "Seleccione un país ..."
  });

    grafInicial();

    function grafInicial(){    
        var type = document.querySelector("#scale").value;
        var config = {
            type: 'line',
            data: {                
                datasets: []
            },
            options: {
                responsive: true,
                legend: {
                  position: 'top',
                },
                scales: {
                    x: {
                        display: true,
                        ticks: {
                          callback: function(dataLabel, index) {
                            return index % 3 === 0 ? dataLabel : '';
                          }
                        }
                    },
                    y: {
                        display: true,
                        type: type,

                    }
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                }
            }
        };

        var ctx = document.getElementById('canvas').getContext('2d');
        window.myLine = new Chart(ctx, config);    
        addDataset(config);
    
        // selección en combo
        $('#selPais').on('select2:select', function (e) {
          addDataset(config);
          window.myLine.update();
        });

        // selección de dato a desplegar
        $("input[name=rdDato]").change(function () {      
            addDataset(config);
            window.myLine.update();
        });    
        
        // graficar incrementos
        $("#chkIncremento").change(function () {      
          addDataset(config);
          window.myLine.update();
        });

        // selección de scala
        $('input[type=radio][id=scale]').change(function() {
          window.myLine.options.scales.y.type = this.value; 
          window.myLine.update();
        });    

        $("#btnClear").click(function () {      
          $('#chkIncremento')[0].checked = false;
          $('#chkMantener')[0].checked = false;
          $('input:radio[name="rdDato"][value="confirmed"]')[0].checked = true;
          $('#selPais').val("");
          $('#selPais').select2().trigger('change');
      
          addDataset(config);
          window.myLine.update();
        });
    }
    
    
    function addDataset(config){

    var pais = $('#selPais').select2('data')[0].id;
    var dato = $("input:radio[name=rdDato]:checked").val();

    if(pais){
      rDatos(pais, dato, function(r){ds(config,pais, dato, r)}); 

    }
    else{
      rDatosT(dato, function(r){ds(config,pais, dato, r)});
      pais = 'Mundial';
    }
   
    }  

    function ds(config, pais, dato, r){
      var colorNames = Object.keys(window.chartColors);
      var colorName = colorNames[config.data.datasets.length % colorNames.length];
      var newColor = window.chartColors[colorName];
      var colorName = colorNames[config.data.datasets.length % colorNames.length];
      var newColor = window.chartColors[colorName];
  
      var conf = $('#chkIncremento')[0].checked?" (ID)":"";
      var newDataset = {
        label: pais + "-" + dato + conf,
        backgroundColor: newColor,
        borderColor: newColor,
        data: r[1],
        fill: false,
        pointRadius: 1.5     
      };

      if(!$('#chkMantener')[0].checked)
        config.data.datasets = [];
      config.data.labels = r[0];
      config.data.datasets.push(newDataset);
      window.myLine.update();
    }
  });

  function rDatos(pais, dato, callback ){
    var fecha = [];
    var valor = [];
    showLoader();
    setTimeout(function(){}, 5000);
    fetch("https://pomber.github.io/covid19/timeseries.json").then(function(respuesta) {
       return respuesta.json();
    }).then(function(j){
      var anterior=0;
      var incremento=$('#chkIncremento')[0].checked;
      for (var i in j[pais]) {
          fecha.push(j[pais][i].date);
          if(incremento){
            valor.push(j[pais][i][dato]-anterior);
            anterior=j[pais][i][dato];
          }
            
          else
            valor.push(j[pais][i][dato]);
      }
      return(callback([fecha,valor]));   
    }).then(hideLoader());
  }
  
  function rDatosT(dato, callback){
    var fecha = [];
    var valor = [];
    var incremento=$('#chkIncremento')[0].checked;
    showLoader();
    setTimeout(function(){}, 5000);
    fetch("https://pomber.github.io/covid19/timeseries.json").then(function(respuesta) {
       return respuesta.json();
    }).then(function(datosJ){
  
      var z = 0;
      for (var p in datosJ){
        pais = datosJ[p];
        var anterior=0;
        for (var i in pais) {
          if(z==0){
            fecha.push(pais[i].date);
            valor.push(pais[i][dato]);
            anterior=pais[i][dato];
          }
          else{
            if(incremento){
              valor[i]+=pais[i][dato]-anterior;
              anterior=pais[i][dato];
            }
            else
              valor[i]+=pais[i][dato];            
          }
        }
        z=1; 
      }
    }).then(function(){
      return(callback([fecha,valor]))
    }).then(hideLoader());
  }
  
  function fillCountries(){
    fetch("https://pomber.github.io/covid19/timeseries.json").then(function(respuesta) {
       return respuesta.json();
    }).then(function(k){
      var data = []
      for (var p in k){
        data.push({id:p,text:p});
      }
      $('#selPais').select2({data: data});  
    });
  }
