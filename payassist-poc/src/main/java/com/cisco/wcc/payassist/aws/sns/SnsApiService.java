package com.cisco.wcc.payassist.aws.sns;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.amazonaws.services.sns.model.MessageAttributeValue;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import com.cisco.wcc.payassist.aws.config.AwsClientConfig;
import com.cisco.wcc.payassist.braintree.pojo.SendLinkRequest;

@Service
public class SnsApiService {
	
	private static final Logger logger = LoggerFactory.getLogger(SnsApiService.class);

	@Autowired
	private AwsClientConfig awsClientConfig;
	
	@Autowired
	private SnsApiClient snsApiClient;
	
	public String send(SendLinkRequest request) {
		logger.info("Send payment link to phone number " + request.getPhoneNumber());
		
		String messageId = null;
		
		try {
			Map<String, MessageAttributeValue> attributes = new HashMap<String, MessageAttributeValue>();
	        attributes.put("AWS.SNS.SMS.SenderID", new MessageAttributeValue()
	        			.withStringValue("WebexCCPS")
	        			.withDataType("String"));
	        //attributes.put("AWS.SNS.SMS.OriginationNumber", new MessageAttributeValue()
			//			.withStringValue("+14084335870")
			//			.withDataType("String"));
	        attributes.put("AWS.SNS.SMS.MaxPrice", new MessageAttributeValue()
						.withStringValue("0.50")
						.withDataType("Number"));
	        attributes.put("AWS.SNS.SMS.SMSType", new MessageAttributeValue()
						.withStringValue("Transactional")
						.withDataType("String"));
			
			PublishRequest sms = new PublishRequest()
					.withMessage("Your payment request URL: " + request.getPaymentUrl())
					.withPhoneNumber(request.getPhoneNumber())
					.withMessageAttributes(attributes);
			PublishResult result = snsApiClient.client().publish(sms);
			messageId = result.getMessageId();
			
			logger.info("SMS messageId is " + messageId);
		} catch(Exception e) {
			logger.error("Exception occurred while sending SMS.", e);
		}
		
		//return messageId;
		return request.getPhoneNumber();
	}
}
