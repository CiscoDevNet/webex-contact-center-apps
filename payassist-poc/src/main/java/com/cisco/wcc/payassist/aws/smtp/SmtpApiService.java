package com.cisco.wcc.payassist.aws.smtp;

import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

@Service
public class SmtpApiService {
	
	private static final Logger logger = LoggerFactory.getLogger(SmtpApiService.class);

    // Replace sender@example.com with your "From" address.
    // This address must be verified.
    static final String FROM = "";
    static final String FROMNAME = "";
	
    // Replace recipient@example.com with a "To" address. If your account 
    // is still in the sandbox, this address must be verified.
    static final String TO = "";
    
    // Replace smtp_username with your Amazon SES SMTP user name.
    static final String SMTP_USERNAME = "";
    
    // Replace smtp_password with your Amazon SES SMTP password.
    static final String SMTP_PASSWORD = "";
    
    // The name of the Configuration Set to use for this message.
    // If you comment out or remove this variable, you will also need to
    // comment out or remove the header below.
    //static final String CONFIGSET = "ConfigSet";
    
    // Amazon SES SMTP host name. This example uses the US West (Oregon) region.
    // See https://docs.aws.amazon.com/ses/latest/DeveloperGuide/regions.html#region-endpoints
    // for more information.
    static final String HOST = "email-smtp.us-east-2.amazonaws.com";
    
    // The port you will connect to on the Amazon SES SMTP endpoint. 
    static final int PORT = 587;
    
    static final String SUBJECT = "Amazon SES test (SMTP interface accessed using Java)";
    
    static final String BODY = String.join(
    	    System.getProperty("line.separator"),
    	    "<h1>Amazon SES SMTP Email Test</h1>",
    	    "<p>This email was sent with Amazon SES using the ", 
    	    "<a href='https://github.com/javaee/javamail'>Javamail Package</a>",
    	    " for <a href='https://www.java.com'>Java</a>."
    	);
    
	public void send(String email, String message) {
		// Create a Properties object to contain connection configuration information.
    	Properties props = System.getProperties();
    	props.put("mail.transport.protocol", "smtp");
    	props.put("mail.smtp.port", PORT); 
    	props.put("mail.smtp.starttls.enable", "true");
    	props.put("mail.smtp.auth", "true");

    	try {
            // Create a Session object to represent a mail session with the specified properties. 
        	Session session = Session.getDefaultInstance(props);
        	
        	// Create a transport.
            Transport transport = session.getTransport();
            // Send the message.
            
            try {

                // Create a message with the specified information. 
                MimeMessage msg = new MimeMessage(session);
                msg.setFrom(new InternetAddress(FROM,FROMNAME));
                msg.setRecipient(Message.RecipientType.TO, new InternetAddress(TO));
                msg.setSubject(SUBJECT);
                msg.setContent(BODY,"text/html");
                
                // Add a configuration set header. Comment or delete the 
                // next line if you are not using a configuration set
               // msg.setHeader("X-SES-CONFIGURATION-SET", CONFIGSET);
                    
                
                logger.info("Sending...");
                
                // Connect to Amazon SES using the SMTP username and password you specified above.
                transport.connect(HOST, SMTP_USERNAME, SMTP_PASSWORD);
            	
                // Send the email.
                transport.sendMessage(msg, msg.getAllRecipients());
                logger.info("Email sent!");
            }
            catch (Exception ex) {
                logger.info("The email was not sent.");
                logger.info("Error message: " + ex.getMessage());
            }
            finally
            {
                // Close and terminate the connection.
                transport.close();
            }
    	} catch(Exception e) {
    		
    	}
	}
}
