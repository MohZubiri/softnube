 <?php
        $queryString =  $_SERVER['QUERY_STRING'];   
        header("Location:../YE?".$queryString);
        die();
      ?>