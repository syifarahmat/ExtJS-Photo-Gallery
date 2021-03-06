
ExtJS Photo Gallery
-------------------------------------



![preview](gallery-screenshot.PNG)

**Source at GitHub**

[https://github.com/wencywww/ExtJS-Photo-Gallery.git](https://github.com/wencywww/ExtJS-Photo-Gallery.git)




**Features:**

  * Organize and browse your photos/videos in a hierarchical (tree) view using browser
  * Items are automatically arranged by Year, Month and Day based on the EXIF information (if available)  
  * The data view can display items for particular day/month/year or all available items
  * Slideshow available via jquery/fancybox
  * File uploading via the DropZone.js
  * Automatic rotation and thumbnail creation
  * Ability to delete, rotate and change the date of the item/items manually
  * Ability to recursively traverse the uploads directory for photos/videos in subdirs
  * No database required
  * The GUI supports English and Bulgarian Language


**Cons:**

  * The EXIF information is NOT PRESERVED and removed after the items are processed

 
**Installation**

  * **Requirements**
    * Linux/Windows-based PC (instructions below use Raspbian Buster and a Raspberry Pi board)
    * Apache webserver (nginx is also supported)
    * PHP 7.x (instructions below use php 7.3)
  
  * **Sample steps on Raspbian**
  
    ````
    sudo apt update
    sudo apt upgrade
    sudo apt install git apache2 php php-gd
    ````
    
    Instruct Apache to parse PHP code within the HTML files:
    ````
    sudo nano /etc/apache2/mods-available/php7.3.conf
    ````    
    
    Insert the following code after the first FilesMatch directive:
    ````
    <FilesMatch ".+\.html$">
        SetHandler application/x-httpd-php    
    </FilesMatch>
    ````      
    And continue with:
    ````
    sudo apachectl restart
    sudo chown -R pi:pi /var/www/html
    cd /var/www/html
    git clone https://github.com/wencywww/ExtJS-Photo-Gallery.git .
    sudo chmod -R 777 /var/www/html/data/photos
    sudo chmod -R 777 /var/www/html/data/upload
    ````
    
    By default, the gallery runs within the root directory of the virtual host. 
    If it should live in a subdirectory instead, for example /var/www/html/gallery, the variable **$glob['paths']['appRootPrefix']** should be adjusted this way:
    ````
    nano /var/www/html/inc/globals/paths.inc.php
        
    //should be empty if the application is running on a separate virtual host, or string with a leading slash if it lives in a subdirectory, e.g. "/gallery"
    //$glob['paths']['appRootPrefix'] = "/gallery";
    $glob['paths']['appRootPrefix'] = "";
    ````
    
    Set your timezone and change the default username/password:
    ````
    nano /var/www/html/inc/globals/globals.inc.php
    
    The settings are kept in the following 3 rows:
    ini_set('date.timezone', 'Europe/Sofia');
    $glob['usr'] = "admin";
    $glob['pass'] = "admin";   
    ````


**Usage**

  * Login with the GUI using your browser
  * Use the File Uploader button (bottom left) to upload files via the GUI or manually upload some photos/videos via SFTP/FTP/Samba within `/var/www/html/data/upload` directory making sure they are writable by the webserver
  * The New Files button in the bottom left of the screen should indicate the number of the new items
  * Click the button. The system will process photos, will refresh the tree above and will delete the originals from the upload directory
  * Use the tree nodes to view the items
  * Double click an item to start the fancybox slideshow
  * Sort items asc/desc using the two arrow buttons on the top of the tree panel 
  * To delete items - select them (using shift key), right click and choose "Erasing.."
  * To change the date for items - select them, right click and choose "Change Date..". This can be done for an entire day also - just right click the tree node for the day on the left
  * To rotate items - select them, right click and choose the desired rotation angle (this does not affect videos)
  

**List of Changes**

  * **2020-04-14**, added support for autoplay for video files (audio muted) instead of the static thumbnail
  * **2020-04-02**, added uploader component via DropZone.js, and some styling via Font Awesome, updated symfony/http-foundation to v. 4.4.7
  * **2018-03-10**, initial commit
