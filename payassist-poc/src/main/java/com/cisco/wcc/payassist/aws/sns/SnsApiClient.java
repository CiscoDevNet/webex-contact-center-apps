package com.cisco.wcc.payassist.aws.sns;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import com.cisco.wcc.payassist.aws.config.AwsClientConfig;

@Component
public class SnsApiClient {

	@Autowired
	private AwsClientConfig awsClientConfig;
	
	public AmazonSNSClient client() {
		return (AmazonSNSClient) AmazonSNSClientBuilder.standard().withCredentials(
				new AWSStaticCredentialsProvider(
						new BasicAWSCredentials(
								awsClientConfig.getAccessKey(), 
								awsClientConfig.getSecretKey())))
				.withRegion(awsClientConfig.getRegion()).build();
	}
}
