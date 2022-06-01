package com.cisco.wcc.payassist.aws.controller;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cisco.wcc.payassist.aws.ses.SesApiService;
import com.cisco.wcc.payassist.aws.sns.SnsApiService;
import com.cisco.wcc.payassist.braintree.pojo.SendLinkRequest;

@RestController
@CrossOrigin
@RequestMapping(path="/link")
public class SendLinkController {

	private static final Logger logger = LoggerFactory.getLogger(SendLinkController.class);
	
	@Autowired
	private SesApiService sesApiService;
	
	@Autowired
	private SnsApiService snsApiService;
	
	@PostMapping(path="/email")
	public String email(@RequestBody SendLinkRequest request) throws IOException {
		return sesApiService.send(request);
	}
	
	@PostMapping(path="/sms")
	public String phone(@RequestBody SendLinkRequest request) throws IOException {
		return snsApiService.send(request);
	}
	
	
}
