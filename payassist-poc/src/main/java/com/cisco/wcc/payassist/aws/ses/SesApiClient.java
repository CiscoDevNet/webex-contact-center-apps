package com.cisco.wcc.payassist.aws.ses;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import com.cisco.wcc.payassist.aws.config.AwsClientConfig;

@Component
public class SesApiClient {

	@Autowired
	private AwsClientConfig awsClientConfig;
	
	public AmazonSimpleEmailService client() {
		return AmazonSimpleEmailServiceClientBuilder.standard().withCredentials(
				new AWSStaticCredentialsProvider(
						new BasicAWSCredentials(
								awsClientConfig.getAccessKey(), 
								awsClientConfig.getSecretKey())))
				.withRegion(awsClientConfig.getRegion()).build();
	}
}
