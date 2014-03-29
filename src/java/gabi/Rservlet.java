/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gabi;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.rosuda.REngine.*;
import org.rosuda.REngine.Rserve.*;

/**
 *
 * @author ingokarn.2011
 */
public class Rservlet extends HttpServlet 
{
    private static RConnection c = null;
    
    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException 
    {
        initRConnect();
        
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();
        try {
            /* TODO output your page here. You may use following sample code. */
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<title>Servlet Rservlet</title>");            
            out.println("</head>");
            out.println("<body>");
            out.println("<h1>Servlet Rservlet at " + request.getContextPath() + "</h1>");
            out.println("</body>");
            out.println("</html>");
        } finally {
            out.close();
        }
    }
            
    public void getRipleyK(String shp, int nSim)
    {
        try
        {
            c.eval("pts = readShapeSpatial(" + shp + ")");
            c.eval("ptsppp = as(as(pts, \"SpatialPoints\"), \"ppp\")");
            c.eval("envK = envelope(ptsppp, Kest, nsim = " + nSim + ")");
            
            String fileName = "temp_" + shp + "ripleyk.jpeg";
            String root = getServletContext().getRealPath("/");
            File path = new File(root + "/tempoutput");
            if(!path.exists())  
            {  
                path.mkdirs();  
            }
            String outFilepath = path + "/" + fileName;
            System.out.println(outFilepath);
            c.eval("jpeg(file = \"" + outFilepath + "\", bg = \"white\")");
            c.eval("plot(envK)");
            c.eval("dev.off()");
        }
        catch(RserveException rse)
        {
            System.out.println(rse);
        }
    }
    
    public void getKdeHeatmap(String shp, int radius, String kernelType)
    {
        try
        {
            c.eval("pts = readShapeSpatial(" + shp + ")");
            c.eval("ptsppp = as(as(pts, \"SpatialPoints\"), \"ppp\")");
            c.eval("kde = density(ptsppp, width = " + radius + ", kernel = \"" + kernelType + "\")");
            
            String fileName = "temp_kde" + radius + kernelType + "heatmap.jpeg";
            String root = getServletContext().getRealPath("/");
            File path = new File(root + "/tempoutput");
            if(!path.exists())  
            {  
                path.mkdirs();  
            }
            String outFilepath = path + "/" + fileName;
            System.out.println(outFilepath);
            c.eval("jpeg(file = \"" + outFilepath + "\", bg = \"white\")");
            c.eval("plot(kde)");
            c.eval("dev.off()");
        }
        catch(RserveException rse)
        {
            System.out.println(rse);
        }
    }
    
    private void initRConnect()
    {
        if(c == null)
        {
            try
            {
                c = new RConnection();
                System.out.println(">>" + c.eval("R.version$version.string").asString() + "<<");
                c.eval("library(spatstat)");
                c.eval("library(maptools)");
            }
            catch (REngineException e) 
            {
            }
            catch (REXPMismatchException mme) 
            {
            }
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
