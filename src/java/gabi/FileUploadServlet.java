/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gabi;

 import java.io.File;  
import java.io.FileInputStream;
import java.io.FileOutputStream;
 import java.io.IOException;  
 import java.io.PrintWriter;  
 import java.util.Iterator;  
 import java.util.List;  
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
 import javax.servlet.ServletException;  
 import javax.servlet.http.HttpServlet;  
 import javax.servlet.http.HttpServletRequest;  
 import javax.servlet.http.HttpServletResponse;  
 import org.apache.commons.fileupload.FileItem;  
 import org.apache.commons.fileupload.FileItemFactory;  
 import org.apache.commons.fileupload.FileUploadException;  
 import org.apache.commons.fileupload.disk.DiskFileItemFactory;  
 import org.apache.commons.fileupload.servlet.ServletFileUpload; 

/**
 *
 * @author ingokarn.2011
 */
public class FileUploadServlet extends HttpServlet {

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
            throws Exception{
        System.out.println("inside file upload");
        boolean isMultipart = ServletFileUpload.isMultipartContent(request);  
         response.setContentType("text/html");  
         PrintWriter out = response.getWriter();  
        if (isMultipart) {  
           // Create a factory for disk-based file items  
           FileItemFactory factory = new DiskFileItemFactory();  
           // Create a new file upload handler  
           ServletFileUpload upload = new ServletFileUpload(factory); 
           boolean status = false;
          try {  
             // Parse the request  
             List /* FileItem */ items = upload.parseRequest(request);  
            Iterator iterator = items.iterator();  
            while (iterator.hasNext()) {  
              FileItem item = (FileItem) iterator.next();  
              if (!item.isFormField())  
               {  
                String fileName = item.getName();      
                String root = getServletContext().getRealPath("/"); 
                System.out.println("root path"+root);
                File path = new File(root + "/uploads");
                System.out.println("final path"+path);
                if (!path.exists())  
                 {  
                  status = path.mkdirs();  
                }  
                File uploadedFile = new File(path + "/" + fileName);  
                System.out.println(uploadedFile.getAbsolutePath());  
                 if(fileName!="")  {
                item.write(uploadedFile);  
                unzip(uploadedFile.getAbsolutePath(), root+"/uploads");
                 out.println("true");
                 }else { 
                 System.out.println("File Uploaded Not Successful....");  
                 }
              }  
               else  
               {  
                 String abc = item.getString();  
 //        out.println("<br><br><h1>"+abc+"</h1><br><br>");  
               }  
            }  
          } catch (FileUploadException e) {  
                System.out.println(e);  
          }  
        }  
         else  
         {  
           out.println("false");
           System.out.println("Not Multipart");  
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
        try{
            processRequest(request, response);
        }catch(Exception e){
            e.printStackTrace();
        }
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
        try{
            processRequest(request, response);
        }catch(Exception e){
            e.printStackTrace();
        }
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

    private static void unzip(String zipFilePath, String destDir) {
        File dir = new File(destDir);
        // create output directory if it doesn't exist
        if(!dir.exists()) dir.mkdirs();
        FileInputStream fis;
        //buffer for read and write data to file
        byte[] buffer = new byte[1024];
        try {
            fis = new FileInputStream(zipFilePath);
            ZipInputStream zis = new ZipInputStream(fis);
            ZipEntry ze = zis.getNextEntry();
            while(ze != null){
                String fileName = ze.getName();
                File newFile = new File(destDir + File.separator + fileName);
                System.out.println("Unzipping to "+newFile.getAbsolutePath());
                //create directories for sub directories in zip
                new File(newFile.getParent()).mkdirs();
                FileOutputStream fos = new FileOutputStream(newFile);
                int len;
                while ((len = zis.read(buffer)) > 0) {
                fos.write(buffer, 0, len);
                }
                fos.close();
                //close this ZipEntry
                zis.closeEntry();
                ze = zis.getNextEntry();
            }
            //close last ZipEntry
            zis.closeEntry();
            zis.close();
            fis.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
         
    }

}
