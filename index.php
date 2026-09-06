 <?php
        $queryString =  $_SERVER['QUERY_STRING'];   
        header("Location:../ye?".$queryString);
        die();
      ?>