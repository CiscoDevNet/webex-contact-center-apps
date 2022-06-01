package com.cisco.wcc.payassist.aws.ses;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.amazonaws.services.simpleemail.model.Body;
import com.amazonaws.services.simpleemail.model.Content;
import com.amazonaws.services.simpleemail.model.Destination;
import com.amazonaws.services.simpleemail.model.Message;
import com.amazonaws.services.simpleemail.model.SendEmailRequest;
import com.amazonaws.services.simpleemail.model.SendEmailResult;
import com.cisco.wcc.payassist.aws.config.AwsClientConfig;
import com.cisco.wcc.payassist.braintree.pojo.SendLinkRequest;

@Service
public class SesApiService {
	
	private static final Logger logger = LoggerFactory.getLogger(SesApiService.class);

	@Autowired
	private AwsClientConfig awsClientConfig;
	
	@Autowired
	private SesApiClient sesApiClient;
	
	public String send(SendLinkRequest request) {
		logger.info("Send payment link to email address " + request.getEmailAddress());
		
		String messageId = null;
		
		try {
			SendEmailRequest email = new SendEmailRequest()
			          .withDestination(
			              new Destination().withToAddresses(request.getEmailAddress()))
			          .withMessage(new Message()
			              .withBody(new Body()
			                  .withText(new Content()
			                      .withCharset("UTF-8").withData(
			                    		  String.format(
			                    				  "Your payment request URL: " + request.getPaymentUrl()))))
			              .withSubject(new Content()
			                  .withCharset("UTF-8").withData("Payment Request URL")))
			          .withSource(awsClientConfig.getEmailSender());
			SendEmailResult result = sesApiClient.client().sendEmail(email);
			messageId = result.getMessageId();
			
			logger.info("Email messageId is " + messageId);
		} catch(Exception e) {
			logger.error("Exception occurred while sending email.", e);
		}
		
		//return messageId;
		return request.getEmailAddress();
	}
}
