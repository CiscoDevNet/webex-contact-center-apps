package com.cisco.wcc.payassist.braintree.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import com.braintreegateway.BraintreeGateway;
import com.braintreegateway.Environment;
import com.braintreegateway.PaymentMethodNonce;
import com.braintreegateway.PaymentMethodNonceRequest;
import com.braintreegateway.Result;
import com.braintreegateway.Transaction;
import com.braintreegateway.TransactionRequest;
import com.cisco.wcc.payassist.account.AccountService;
import com.cisco.wcc.payassist.braintree.config.BraintreeClientConfig;
import com.cisco.wcc.payassist.braintree.pojo.CardPaymentRequest;
import com.cisco.wcc.payassist.braintree.pojo.ClientToken;
import com.cisco.wcc.payassist.braintree.pojo.NoncePaymentRequest;
import com.cisco.wcc.payassist.braintree.pojo.PaymentResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BraintreeGatewayService {
	
	private static final Logger logger = LoggerFactory.getLogger(BraintreeGatewayService.class);

	@Autowired
	private BraintreeClientConfig braintreeClientConfig;
	
	@Autowired
	private BraintreeGateway gateway;
	
	@Autowired
	private AccountService accountService;
	
	@Autowired
	private ObjectMapper objectMapper;
	
	public PaymentResponse makeMethodNonceTransaction(NoncePaymentRequest request) {
		logger.info("Method nonce transaction request");
		
		try {
			logger.info("Request data: " + objectMapper.writeValueAsString(request));
		} catch (JsonProcessingException e) {
		}
		
		TransactionRequest transaction = new TransactionRequest()
				  .amount(request.getAmount())
				  .paymentMethodNonce(request.getMethodNonce())
				  .options()
				  .submitForSettlement(true)
				  .done();
		
		Result<Transaction> result = gateway.transaction().sale(transaction);		
		
		try {
			logger.info("Result: " + objectMapper.writeValueAsString(result));
		} catch (JsonProcessingException e) {
		}
		
		PaymentResponse response = new PaymentResponse();;
		if(result != null) {
			response.setSuccess(result.isSuccess());
			
			if(result.isSuccess()) {
				logger.info("Authorized Transaction ID: " + result.getTarget().getAuthorizedTransactionId());
				logger.info("Network Transaction ID: " + result.getTarget().getNetworkTransactionId());
				logger.info("Retrieval Reference Number: " + result.getTarget().getRetrievalReferenceNumber());
				
				response.setTransactionId(result.getTarget().getNetworkTransactionId());
				response.setReferenceNumber(result.getTarget().getRetrievalReferenceNumber());
				response.setAccountId(request.getAccountId());
				response.setPaymentAmount(request.getAmount());
				
				accountService.payOrder(response);
				
			} else {
				response.setMessage(result.getMessage());
			}
		}
		
		return response;
	}

	public PaymentResponse makeCreditCardTransaction(CardPaymentRequest request) {
		logger.info("Credit card transaction request");
		
		try {
			logger.info("Request data: " + objectMapper.writeValueAsString(request));
		} catch (JsonProcessingException e) {
		}

		TransactionRequest transction = new TransactionRequest()
				  .amount(request.getAmount())
				  .creditCard()
				  	.cardholderName("")
				  	.number(request.getCardNumber())
				  	.cvv(request.getCvvCode())
				  	.expirationDate(request.getExpirationDate())
				  .done();
		
		Result<Transaction> result = gateway.transaction().sale(transction);
		
		try {
			logger.info("Result: " + objectMapper.writeValueAsString(result));
		} catch (JsonProcessingException e) {
		}
		
		PaymentResponse response = new PaymentResponse();;
		if(result != null) {
			response.setSuccess(result.isSuccess());
			
			if(result.isSuccess()) {
				logger.info("Authorized Transaction ID: " + result.getTarget().getAuthorizedTransactionId());
				logger.info("Network Transaction ID: " + result.getTarget().getNetworkTransactionId());
				logger.info("Retrieval Reference Number: " + result.getTarget().getRetrievalReferenceNumber());
				
				response.setTransactionId(result.getTarget().getNetworkTransactionId());
				response.setReferenceNumber(result.getTarget().getRetrievalReferenceNumber());
				response.setAccountId(request.getAccountId());
				response.setPaymentAmount(request.getAmount());
				
				accountService.payOrder(response);
				
			} else {
				response.setMessage(result.getMessage());
			}
		}
		
		return response;
	}
	
	
	public String getPaymentMethodNonce(String customerId) {		
		logger.info("Get payment method nonce for customerId " + customerId);
		
		try {

			ClientToken token = getClientToken(customerId);		
			logger.info("Client token: " + token.getClientToken());
					
			try {
				Thread.sleep(5000L);
			} catch (InterruptedException e) {
			}
			
			PaymentMethodNonceRequest request = new PaymentMethodNonceRequest().paymentMethodToken(token.getClientToken());
			Result<PaymentMethodNonce> result = gateway.paymentMethodNonce().create(request);
			return result.getTarget().getNonce();
		} catch(Exception e) {
			logger.error("Exception", e);
		}
	
		return null;
	}
	
	public ClientToken getClientToken(String customerId) {		
		logger.info("Get client token for customerId " + customerId);
		return new ClientToken(gateway.clientToken().generate());
	}
	
	@Bean
	public BraintreeGateway gateway() {
		return new BraintreeGateway(
				  Environment.SANDBOX,
				  braintreeClientConfig.getMerchantId(),
				  braintreeClientConfig.getPublicKey(),
				  braintreeClientConfig.getPrivateKey()
		);
	}
}
