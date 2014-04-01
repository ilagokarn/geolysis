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
        System.out.println("inside rservlet");
        initRConnect();
        response.setContentType("text/html;charset=UTF-8");
        System.out.println("processing request");
        PrintWriter out = response.getWriter();
        try {
            String algo = (String) request.getParameter("algo");
            System.out.println(algo);
            if (algo.equals("kde")){
                String fileName = request.getParameter("fileName")+".shp";
                int radius = Integer.parseInt(request.getParameter("kdeRadius"));
                String kernelType = request.getParameter("kdeType").toLowerCase();
                String root = getServletContext().getRealPath("/"); 
                System.out.println("root path"+root);
                File path = new File(root + "/uploads/"+fileName);
                System.out.println("final path"+path.getAbsolutePath().replace("\\", "\\\\"));
                System.out.println(path.getAbsolutePath().replace("\\", "\\\\")+" "+radius+" "+kernelType+" calling method now");
                String output = getKdeHeatmap(path.getAbsolutePath().replace("\\", "\\\\"), radius, kernelType);
                out.println(output);
            }
            if(algo.equals("kfunc")){
                String fileName = request.getParameter("fileName")+".shp";
                int nsim = Integer.parseInt(request.getParameter("knsim"));
                String root = getServletContext().getRealPath("/"); 
                System.out.println("root path"+root);
                File path = new File(root + "/uploads/"+fileName);
                System.out.println("final path"+path.getAbsolutePath().replace("\\", "\\\\"));
                System.out.println(path.getAbsolutePath().replace("\\", "\\\\")+" "+nsim+" calling method now");
                String output = getRipleyK(path.getAbsolutePath().replace("\\", "\\\\"), nsim);
                out.println(output);
            }
            if(algo.equals("nni")){
                String fileName = request.getParameter("fileName")+".shp";
                int k = Integer.parseInt(request.getParameter("k"));
                String root = getServletContext().getRealPath("/"); 
                System.out.println("root path"+root);
                File path = new File(root + "/uploads/"+fileName);
                System.out.println("final path"+path.getAbsolutePath().replace("\\", "\\\\"));
                System.out.println(path.getAbsolutePath().replace("\\", "\\\\")+" "+k+" calling method now");
                String output = doNNI(path.getAbsolutePath().replace("\\", "\\\\"));
                out.println(output);
            }
            if(algo.equals("quad")){
                String fileName = request.getParameter("fileName")+".shp";
                int r = Integer.parseInt(request.getParameter("r"));
                int c = Integer.parseInt(request.getParameter("c"));
                String root = getServletContext().getRealPath("/"); 
                System.out.println("root path"+root);
                File path = new File(root + "/uploads/"+fileName);
                System.out.println("final path"+path.getAbsolutePath().replace("\\", "\\\\"));
                System.out.println(path.getAbsolutePath().replace("\\", "\\\\")+" "+r+c+" calling method now");
                String[] tempOutput = doQuadrat(path.getAbsolutePath().replace("\\", "\\\\"),r,c);
                out.println(tempOutput[0]+";;"+tempOutput[1]);
            }
        } finally {
            out.close();
        }
    }
            
    public String getRipleyK(String shp, int nSim)
    {
        String fileName ="";
        try
        {
            if(c==null){
                System.out.println("c was null, resetting connection");
                initRConnect();
            }
            c.eval("pts = readShapeSpatial(\"" + shp + "\")");
            c.eval("ptsppp = as(as(pts, \"SpatialPoints\"), \"ppp\")");
            c.eval("envK = envelope(ptsppp, Kest, nsim = " + nSim + ")");
            
            fileName = "temp_" + nSim + "ripleyk.jpeg";
            String root = getServletContext().getRealPath("/");
            File path = new File(root + "/tempoutput");
            if(!path.exists())  
            {  
                path.mkdirs();  
            }
            String outFilepath = path.getAbsolutePath().replace("\\", "\\\\") + "\\\\" + fileName;
            System.out.println(outFilepath);
            c.eval("jpeg(file = \"" + outFilepath + "\", bg = \"white\")");
            c.eval("plot(envK)");
            c.eval("dev.off()");
        }
        catch(RserveException rse)
        {
            System.out.println(rse);
        }
        return fileName;
    }
    
    public String getKdeHeatmap(String shp, int radius, String kernelType)
    {
        String fileName = "";
        try
        {   
            if(c==null){
                System.out.println("c was null, resetting connection");
                initRConnect();
            }
            c.eval("pts = readShapeSpatial(\"" + shp + "\")");
            c.eval("ptsppp = as(as(pts, \"SpatialPoints\"), \"ppp\")");
            c.eval("kde = density(ptsppp, width = " + radius + ", kernel = \"" + kernelType + "\")");
            
            fileName = "temp_kde_" + radius + kernelType + "heatmap.jpeg";
            String root = getServletContext().getRealPath("/");
            File path = new File(root + "/tempoutput");
            if(!path.exists())  
            {  
                path.mkdirs();  
            }
            String outFilepath = path.getAbsolutePath().replace("\\", "\\\\") + "\\\\" + fileName;
            System.out.println(outFilepath);
            c.eval("jpeg(file = \"" + outFilepath + "\", bg = \"white\")");
            c.eval("plot(kde, main = \""+radius+" "+kernelType+"\")");
            c.eval("dev.off()");
            
        }
        catch(RserveException rse)
        {
            System.out.println(rse);
        }
        return fileName;
    }
    
    public String[] doQuadrat(String ptsShp, int xQuadrats, int yQuadrats)
    {
        try
        {
            String[] results = new String[2];
            c.eval("pts = readShapeSpatial(\"" + ptsShp + "\")");
            c.eval("preppp = as(pts, \"SpatialPoints\")");
            c.eval("finalppp = as(preppp, \"ppp\")");
            c.eval("qc = quadratcount(finalppp, " + xQuadrats + ", " + yQuadrats + ")");

            String fileName = "temp_quadrat" + xQuadrats + yQuadrats + "plot.jpeg";
            String root = getServletContext().getRealPath("/");
            File path = new File(root + "/tempoutput");
            if(!path.exists())  
            {  
                path.mkdirs();  
            }
            String outFilepath = path.getAbsolutePath().replace("\\", "\\\\") + "\\\\" + fileName;
            c.eval("jpeg(file = \"" + outFilepath + "\", bg = \"white\")");
            c.eval("plot(qc)");
            c.eval("dev.off()");
            
            results[0] = fileName;
            
            results[1] = c.eval("paste(capture.output(print(quadrat.test(qc))),collapse='\\n')").asString();
            
            return results;
        }
        catch(RserveException rse)
        {
            System.out.println(rse);
            return null;
        }
        catch (REXPMismatchException e)
        {
            System.out.println(e);
            return null;
        }
    }
    
    public String doNNI(String shp)
    {
        try
        {
             if(c==null){
                System.out.println("c was null, resetting connection");
                initRConnect();
            }
            c.eval("pts = readShapeSpatial(\"" + shp + "\")");
            c.eval("ppp = as(as(pts, \"SpatialPoints\"), \"ppp\")");
            return c.eval("paste(capture.output(print(clarkevans.test(ppp))),collapse='\\n')").asString();
        }
        catch(RserveException rse)
        {
            System.out.println(rse);
            return null;
        }
        catch (REXPMismatchException e)
        {
            System.out.println(e);
            return null;
        }
    }
    
    private void initRConnect()
    {
        if(c == null)
        {
            try
            {
                c = new RConnection();
                c.eval("library(spatstat)");
                c.eval("library(maptools)");
                System.out.println(">>" + c.eval("R.version$version.string").asString() + "<<");
                
            }
            catch (REngineException e) 
            {
                System.out.println("REngineException");
                e.printStackTrace();
            }
            catch (REXPMismatchException mme) 
            {
                System.out.println("R Expression Exception");
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
