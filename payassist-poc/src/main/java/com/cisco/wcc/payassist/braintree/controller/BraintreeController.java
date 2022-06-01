package com.cisco.wcc.payassist.braintree.controller;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cisco.wcc.payassist.braintree.pojo.CardPaymentRequest;
import com.cisco.wcc.payassist.braintree.pojo.ClientToken;
import com.cisco.wcc.payassist.braintree.pojo.NoncePaymentRequest;
import com.cisco.wcc.payassist.braintree.pojo.PaymentResponse;
import com.cisco.wcc.payassist.braintree.service.BraintreeGatewayService;

@RestController
@CrossOrigin
@RequestMapping(path="/braintree")
public class BraintreeController {

	private static final Logger logger = LoggerFactory.getLogger(BraintreeController.class);
	
	@Autowired
	private BraintreeGatewayService braintreeGatewayService;
	
	@GetMapping(path="/token")
	public ResponseEntity<ClientToken> token() {
		return new ResponseEntity<ClientToken>(braintreeGatewayService.getClientToken(null), HttpStatus.OK);
	}
	
	@PostMapping(path="/checkout")
	public void checkout(HttpServletRequest request, HttpServletResponse response) throws IOException {
		
	}
	
	@PostMapping(path="/checkout/card")
	public ResponseEntity<PaymentResponse> cardCheckout(@RequestBody CardPaymentRequest request) throws IOException {
		return new ResponseEntity<PaymentResponse>(
				braintreeGatewayService.makeCreditCardTransaction(request), HttpStatus.OK);
	}
	
	@PostMapping(path="/checkout/nonce")
	public ResponseEntity<PaymentResponse> nonceCheckout(@RequestBody NoncePaymentRequest request) throws IOException {
		return new ResponseEntity<PaymentResponse>(
				braintreeGatewayService.makeMethodNonceTransaction(request), HttpStatus.OK);
	}
	
	@PostMapping(path="/test")
	public String test(@RequestBody String data) {
		logger.info("Request: " + data);
		
		return "{\r\n"
				+ "  \"fulfillmentMessages\": [\r\n"
				+ "    {\r\n"
				+ "      \"text\": {\r\n"
				+ "        \"text\": [\r\n"
				+ "          \"1000100020003\"\r\n"
				+ "        ]\r\n"
				+ "      }\r\n"
				+ "    }\r\n"
				+ "  ]\r\n"
				+ "}";
	}
	
}
