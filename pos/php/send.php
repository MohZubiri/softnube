<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
 $subject = $_POST['subject'];
 $email = $_POST['email'];
 $msg = $_POST['msg'];
 $name = $_POST['from_name'];
 if(!empty($subject) || !empty($email) || !empty($msg) || !empty($name)){
    $to = 'info@softnube.site';
    $headers = 'From:' . $email;
    $msg = $_POST['msg'] . "\nFrom: " . $email;
    $headers = 'From: My contact form'.$name;


    mb_language("uni");
    mb_internal_encoding("UTF-8");
   if( mb_send_mail($to,$subject,$msg,$headers))
   {
    if (isset($_SERVER["HTTP_REFERER"])) {
        echo  $_SERVER["HTTP_REFERER"];
        header("Location: " . $_SERVER["HTTP_REFERER"]);
    }else{
        echo  $_SERVER["HTTP_REFERER"];
    }
   }
 $respondMsg = 'message body.';
 $respondSubject = 'message subject';
 $respondHeaders = 'From: noreply@mail.com';
          mb_send_mail($email,$respondSubject,$respondMsg,$respondHeaders);

}else {
  echo '403';
 }

?>
