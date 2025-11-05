<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // =============================================
    // SECURITY: INPUT VALIDATION & SANITIZATION
    // =============================================
    $firstName = trim(htmlspecialchars($_POST['first_name'] ?? ''));
    $lastName  = trim(htmlspecialchars($_POST['last_name'] ?? ''));
    $email     = trim($_POST['email'] ?? '');
    $phone     = trim(htmlspecialchars($_POST['phone'] ?? ''));
    $service   = trim(htmlspecialchars($_POST['service'] ?? ''));
    $date      = trim(htmlspecialchars($_POST['date'] ?? ''));
    $time      = trim(htmlspecialchars($_POST['time'] ?? ''));
    
    // Validate required fields
    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($service) || empty($date) || empty($time)) {
        die("Error: All fields are required.");
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Error: Invalid email address.");
    }
    
    // =============================================
    // OPTION 1: WITH reCAPTCHA (PRODUCTION)
    // =============================================
    /*
    $recaptchaSecret = "YOUR_SECRET_KEY_HERE";
    $recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';
    
    if (empty($recaptchaResponse)) {
        die("Error: Please complete the reCAPTCHA.");
    }
    
    // Verify reCAPTCHA with Google
    $verifyUrl = "https://www.google.com/recaptcha/api/siteverify?secret={$recaptchaSecret}&response={$recaptchaResponse}";
    $response = file_get_contents($verifyUrl);
    $responseKeys = json_decode($response, true);
    
    if (intval($responseKeys["success"]) !== 1) {
        die("Error: reCAPTCHA verification failed. Please confirm you're not a robot.");
    }
    */
    
    // =============================================
    // EMAIL CONFIGURATION
    // =============================================
    $to = $email;  // Send to customer
    $admin_email = "admin@surveyservices.com"; // Send copy to admin
    $subject = "Appointment Confirmation - Survey Services";
    
    // HTML Email Content
    $message = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <title>Appointment Confirmation</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
            }
            .header { 
                background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); 
                color: white; 
                padding: 20px; 
                text-align: center; 
                border-radius: 10px 10px 0 0;
            }
            .content { 
                padding: 20px; 
                background: #f9f9f9; 
                border-radius: 0 0 10px 10px;
            }
            .appointment-details { 
                background: white; 
                padding: 15px; 
                border-radius: 8px; 
                margin: 15px 0; 
                border-left: 4px solid #6a11cb;
            }
            .detail-row { 
                display: flex; 
                margin-bottom: 8px; 
                padding-bottom: 8px; 
                border-bottom: 1px solid #eee;
            }
            .detail-label { 
                font-weight: bold; 
                width: 120px; 
                color: #555;
            }
            .detail-value { 
                flex: 1; 
                color: #333;
            }
            .footer { 
                text-align: center; 
                margin-top: 20px; 
                padding-top: 20px; 
                border-top: 1px solid #ddd; 
                color: #666; 
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>📅 Appointment Confirmed!</h1>
        </div>
        
        <div class='content'>
            <p>Dear <strong>$firstName $lastName</strong>,</p>
            
            <p>Thank you for booking with Survey Services! Your appointment has been successfully confirmed.</p>
            
            <div class='appointment-details'>
                <h3>Appointment Details:</h3>
                <div class='detail-row'>
                    <span class='detail-label'>Service:</span>
                    <span class='detail-value'>$service</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Date:</span>
                    <span class='detail-value'>$date</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Time:</span>
                    <span class='detail-value'>$time</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Phone:</span>
                    <span class='detail-value'>$phone</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Email:</span>
                    <span class='detail-value'>$email</span>
                </div>
            </div>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
                <li>Please arrive 10 minutes before your scheduled time</li>
                <li>Bring any necessary documents or information</li>
                <li>If you need to reschedule or cancel, please contact us at least 24 hours in advance</li>
            </ul>
            
            <p>We look forward to serving you!</p>
        </div>
        
        <div class='footer'>
            <p>Best regards,<br><strong>Survey Services Team</strong></p>
            <p>Email: admin@surveyservices.com<br>Phone: (555) 123-4567</p>
        </div>
    </body>
    </html>
    ";
    
    // Plain text version for email clients that don't support HTML
    $plain_message = "
    APPOINTMENT CONFIRMATION - Survey Services
    
    Dear $firstName $lastName,
    
    Your appointment has been successfully confirmed!
    
    APPOINTMENT DETAILS:
    Service: $service
    Date: $date
    Time: $time
    Phone: $phone
    Email: $email
    
    Important Notes:
    - Please arrive 10 minutes before your scheduled time
    - Bring any necessary documents or information
    - If you need to reschedule or cancel, contact us 24 hours in advance
    
    Best regards,
    Survey Services Team
    Email: admin@surveyservices.com
    Phone: (555) 123-4567
    ";
    
    // =============================================
    // EMAIL HEADERS
    // =============================================
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Survey Services <no-reply@surveyservices.com>" . "\r\n";
    $headers .= "Reply-To: admin@surveyservices.com" . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // =============================================
    // SEND EMAIL & HANDLE RESPONSE
    // =============================================
    
    // For testing on localhost - show preview
    if ($_SERVER['HTTP_HOST'] == 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
        // Localhost testing mode
        echo "<!DOCTYPE html>
        <html>
        <head>
            <title>Appointment Booked Successfully</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                .success { background: #d4edda; color: #155724; padding: 20px; border-radius: 10px; margin: 20px 0; }
                .preview { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
                .note { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class='success'>
                <h2>✅ Appointment Booked Successfully!</h2>
                <p><strong>Form data received and validated.</strong></p>
            </div>
            
            <div class='preview'>
                <h3>📧 Email Preview (Would be sent on live server):</h3>
                <p><strong>To:</strong> $email</p>
                <p><strong>Subject:</strong> $subject</p>
                <div style='border: 1px solid #ddd; padding: 15px; background: white;'>"
                . $message .
                "</div>
            </div>
            
            <div class='note'>
                <h4>📝 Localhost Notice:</h4>
                <p>Emails are not actually sent from localhost. When deployed to a live server, this confirmation email will be automatically sent to <strong>$email</strong>.</p>
                <p><strong>Collected Data:</strong><br>
                - Name: $firstName $lastName<br>
                - Email: $email<br>
                - Phone: $phone<br>
                - Service: $service<br>
                - Date: $date<br>
                - Time: $time</p>
            </div>
            
            <div style='text-align: center; margin-top: 30px;'>
                <a href='appmnt.html' style='background: #6a11cb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Book Another Appointment</a>
            </div>
        </body>
        </html>";
        
    } else {
        // Live server - actually send email
        $email_sent = mail($to, $subject, $message, $headers);
        
        // Also send copy to admin
        $admin_sent = mail($admin_email, "New Appointment: $firstName $lastName", $message, $headers);
        
        if ($email_sent) {
            echo "<!DOCTYPE html>
            <html>
            <head>
                <title>Appointment Confirmed</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                    .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
                    .success-icon { font-size: 60px; color: #28a745; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='success-icon'>✅</div>
                    <h1>Appointment Confirmed!</h1>
                    <p><strong>$firstName $lastName</strong>, your appointment has been successfully booked.</p>
                    <p>A confirmation email has been sent to <strong>$email</strong> with all the details.</p>
                    <div style='background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;'>
                        <h3>Appointment Summary:</h3>
                        <p><strong>Service:</strong> $service</p>
                        <p><strong>Date:</strong> $date</p>
                        <p><strong>Time:</strong> $time</p>
                        <p><strong>Phone:</strong> $phone</p>
                    </div>
                    <a href='appmnt.html' style='background: #6a11cb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;'>Book Another Appointment</a>
                </div>
            </body>
            </html>";
        } else {
            echo "<!DOCTYPE html>
            <html>
            <head>
                <title>Appointment Error</title>
            </head>
            <body>
                <div style='text-align: center; padding: 50px;'>
                    <h2 style='color: #dc3545;'>⚠️ Appointment Booked - Email Failed</h2>
                    <p>Your appointment was saved, but the confirmation email could not be sent.</p>
                    <p>Please contact us directly to confirm your appointment.</p>
                    <p><strong>Your Reference:</strong> $firstName $lastName - $service - $date</p>
                    <a href='appmnt.html'>Return to Booking</a>
                </div>
            </body>
            </html>";
        }
    }
    
} else {
    // If someone tries to access this page directly
    header("Location: appmnt.html");
    exit();
}
?>

<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // =============================================
    // reCAPTCHA VERIFICATION
    // =============================================
    $recaptchaSecret = "6LcFr9krAAAAANxKki4Odyh6Op6GCjpV5c5VXnLs"; // Your actual secret key
    $recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';
    
    // Verify reCAPTCHA
    if (!empty($recaptchaResponse)) {
        $verifyUrl = "https://www.google.com/recaptcha/api/siteverify?secret={$recaptchaSecret}&response={$recaptchaResponse}";
        $response = file_get_contents($verifyUrl);
        $responseKeys = json_decode($response, true);
        
        if (intval($responseKeys["success"]) !== 1) {
            die("Error: reCAPTCHA verification failed. Please confirm you're not a robot.");
        }
    } else {
        die("Error: Please complete the reCAPTCHA.");
    }
    
    // =============================================
    // INPUT VALIDATION & SANITIZATION
    // =============================================
    $firstName = trim(htmlspecialchars($_POST['first_name'] ?? ''));
    $lastName  = trim(htmlspecialchars($_POST['last_name'] ?? ''));
    $email     = trim($_POST['email'] ?? '');
    $phone     = trim(htmlspecialchars($_POST['phone'] ?? ''));
    $service   = trim(htmlspecialchars($_POST['service'] ?? ''));
    $date      = trim(htmlspecialchars($_POST['date'] ?? ''));
    $time      = trim(htmlspecialchars($_POST['time'] ?? ''));
    
    // Validate required fields
    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($service) || empty($date) || empty($time)) {
        die("Error: All fields are required.");
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Error: Invalid email address.");
    }
    
    // =============================================
    // SUCCESS RESPONSE
    // =============================================
    echo "<!DOCTYPE html>
    <html>
    <head>
        <title>Appointment Booked Successfully</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                max-width: 800px; 
                margin: 50px auto; 
                padding: 20px; 
                background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                min-height: 100vh;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
            }
            .success { 
                background: #d4edda; 
                color: #155724; 
                padding: 20px; 
                border-radius: 10px; 
                margin: 20px 0; 
                border-left: 4px solid #28a745;
            }
            .appointment-info { 
                background: #f0f8ff; 
                padding: 20px; 
                border-radius: 10px; 
                margin: 20px 0; 
                border-left: 4px solid #6a11cb;
            }
            .btn {
                background: linear-gradient(to right, #6a11cb, #2575fc);
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                margin-top: 20px;
                border: none;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='success'>
                <h2>✅ reCAPTCHA Verified Successfully!</h2>
                <p><strong>Appointment booked and reCAPTCHA verified!</strong></p>
            </div>
            
            <div class='appointment-info'>
                <h3>Appointment Details:</h3>
                <p><strong>Name:</strong> $firstName $lastName</p>
                <p><strong>Email:</strong> $email</p>
                <p><strong>Phone:</strong> $phone</p>
                <p><strong>Service:</strong> $service</p>
                <p><strong>Date:</strong> $date</p>
                <p><strong>Time:</strong> $time</p>
            </div>
            
            <div style='text-align: center;'>
                <a href='appmnt.html' class='btn'>Book Another Appointment</a>
            </div>
        </div>
      </body>
      </html>";
    
} else {
    // If someone tries to access this page directly
    header("Location: appmnt.html");
    exit();
}
?>