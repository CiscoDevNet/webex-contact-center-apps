package com.cisco.wcc.payassist.dialogflow.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.cisco.wcc.payassist.account.AccountService;
import com.cisco.wcc.payassist.account.pojo.AccountDetail;
import com.cisco.wcc.payassist.account.repo.AccountRepository;
import com.cisco.wcc.payassist.account.repo.OrderRepository;
import com.cisco.wcc.payassist.braintree.pojo.PaymentResponse;
import com.cisco.wcc.payassist.dialogflow.pojo.DialogflowRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@CrossOrigin
@RequestMapping(path="/dialogflow")
public class DialogflowController {

	private static final Logger logger = LoggerFactory.getLogger(DialogflowController.class);

	@Autowired
	private AccountRepository accountRepository;
	
	@Autowired
	private OrderRepository orderRepository;
	
	@Autowired
	private AccountService accountService;
	
	@Autowired
	private ObjectMapper objectMapper;
	
	@RequestMapping(path="/account/id/{id}", method=RequestMethod.GET, produces="application/json")
	public ResponseEntity<AccountDetail> getAccountById(@PathVariable Long id) {
		logger.info("Get account by id " + id);		
		return new ResponseEntity<AccountDetail>(accountService.getAccount(id), HttpStatus.OK);		
	}
	
	@RequestMapping(path="/account/ani/{ani}", method=RequestMethod.GET, produces="application/json")
	public ResponseEntity<AccountDetail> getAccountByAni(@PathVariable String ani) {
		logger.info("Get account by ani " + ani);		
		return new ResponseEntity<AccountDetail>(accountService.getAccountByPhone(ani), HttpStatus.OK);		
	}	
	
	@RequestMapping(path="/account/agent", method=RequestMethod.POST, consumes=MediaType.ALL_VALUE)
	public ResponseEntity<AccountDetail> getAccountByCallerId(@RequestBody String data) {		
		logger.info("Get account by callerId: " + data);
		//return new ResponseEntity<AccountDetail>(accountService.getAccountByPhone("+14085551001"), HttpStatus.OK);
		
		AccountDetail account = null;
		try {
			//objectMapper.configure(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES, false);
			DialogflowRequest request = objectMapper.readValue(data, DialogflowRequest.class);	
			
			if(request != null && request.getPayload() != null && request.getPayload().getTelephony() != null) {
				logger.info(String.format("DialogflowRequest - source: %s, callerId: %s", 
						request.getSource(), 
						request.getPayload().getTelephony().getCallerId()));
				
				String callerId = request.getPayload().getTelephony().getCallerId();
				
				if(callerId != null) {
					account = accountService.getAccountByPhone(callerId);
				}

			} 			
		} catch(Exception e) {
			logger.error("Exception occurred while getting account info", e);
		}
		
		return new ResponseEntity<AccountDetail>(account, HttpStatus.OK);
	}
	
	@RequestMapping(path="/payment/response", method=RequestMethod.POST, consumes="application/json")
	public ResponseEntity<String> paymentResponse(@RequestBody PaymentResponse response) {
		logger.info("Payment response for " + response.getAccountId());
		
		accountService.payOrder(response);
		return new ResponseEntity<String>("OK", HttpStatus.OK);		
	}
	
}
