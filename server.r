# a sample R interface from shiny website
# the basic commands ot plot rnoms have the following structure
# to combine with other plotting options, it is then adapted with a switch statement,
# this structure can be used to implement our splitted codes 
library(maptools)

shinyServer(function(input, output) {


  # optional raw html components 
  htmlOpt<- reactive({  
    rOpt <- switch(input$rOption,
                   nni = "nni",
                   quadrat = "quadrat",
                   "nni")


    if (rOpt== "nni"){
    
        "This part only appears for NNI"
        
     } else if (rOpt == "quadrat"){

        "This part only appears for Quadrat"
     }
  })
  
  output$htmlOpt <- renderUI({
     htmlOpt()
  })
  
  # optional plot
  plotOpt <- reactive({  
    rOpt <- switch(input$rOption,
                   nni = "nni",
                   quadrat = "quadrat",
                   "nni")
    

    if (rOpt== "nni"){
    
        nm <- readShapeSpatial("../data/nniDataIn.shp")
        nmp <- as(nm, "SpatialPoints")
        nm_ppp <- as(nmp, "ppp")
        plotIn <- nnfun(nm_ppp)
        plot(plotIn)
        
     } else if (rOpt == "quadrat"){
        

        
        nm <- readShapeSpatial("../data/nniDataIn.shp")
        nmp <- as(nm, "SpatialPoints")
        nm_ppp <- as(nmp, "ppp")
        opt <- input$quadratOpt
        if (opt == "sixFour"){
           plotIn <- quadratcount(nm_ppp, 6, 4)
        } else if (opt == "fiveFive"){
           plotIn <- quadratcount(nm_ppp, 5, 5)
        }
        plot(plotIn)
        
     }
  })

  output$plotOpt <- renderPlot({
        plotOpt()
  }) 


  # text options
  textOpt <- reactive({  
    rOpt <- switch(input$rOption,
                   nni = "nni",
                   quadrat = "quadrat",
                   "nni")


    if (rOpt== "nni"){

       nm <- readShapeSpatial("../data/nniDataIn.shp")
       nmp <- as(nm, "SpatialPoints")
       nm_ppp <- as(nmp, "ppp")
       clarkevans(nm_ppp)
       clarkevans.test(nm_ppp)

     } else if (rOpt == "quadrat"){

       nm <- readShapeSpatial("../data/nniDataIn.shp")
       nmp <- as(nm, "SpatialPoints")
       nm_ppp <- as(nmp, "ppp")
       
       opt <- input$quadratOpt
       if (opt == "sixFour"){
          quadrat.test(nm_ppp, 6, 4)
       } else if (opt == "fiveFive"){
          quadrat.test(nm_ppp, 5, 5)
       }
     }
  })


  output$textOpt <- renderPrint({
        textOpt()
  }) 
   
})
