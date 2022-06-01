'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const braintree = require('braintree');
const axios = require('axios');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
	console.log('Dialogflow request starts');
	
	const agent = new WebhookClient({ request, response });
	console.log('Dialogflow request headers', JSON.stringify(request.headers));
	console.log('Dialogflow request body', JSON.stringify(request.body));
		
	function retrieveAccountByCallerId(agent) {		
		console.log('retrieveAccountByCallerId()', agent.contexts[0].name);		
		return axios({
			url: 'https://ccaipayassist.pstestsite.com/dialogflow/account/agent',
			method: 'POST',
			data: request.body.originalDetectIntentRequest
		}).then(result => {
			var account = result.data;
			if(account && account.id > 0) {
				processAccountResponse(agent, account);
			} else {
				agent.add(`Hello, I could not find your account record associated with your phone number. 
					What is your 10 digit account ID?`);
				agent.setContext({
						name: 'collectaccountid',
						lifespan: 20
					}
				);
			}	
		}).catch(error => {
			console.log('Error', error);
		});
	}
	
	function retrieveAccountById(agent) {		
		console.log('retrieveAccountById()', agent.contexts[0].name);		
		const accountId = agent.getContext('collectaccountid').parameters['account-id'];
		console.log('account-id', accountId);		
		return axios({
			url: 'https://ccaipayassist.pstestsite.com/dialogflow/account/id/' + accountId,
			method: 'GET',
		}).then(result => {
			var account = result.data;
			if(account && account.id > 0) {
				processAccountResponse(agent, account)
			} else {
				agent.add(`Hello, I could not find your account record associated with the ID you provided.
						Would you like to speak to an agent?`);
				setConnectAgentContexts(agent);
			}
		}).catch(error => {
			console.log('Error', error);
		});		
	}
	
	function processAccountResponse(agent, account) {
		console.log(`Account ID: ${account.id}`)
		console.log(`Current balance: ${account.currentBalance}`);
		if(account.currentBalance > 0) {					
			agent.add(`<speak>Hello ${account.firstName}, 
					I see that you have a balance of <say-as interpret-as="unit">
					$${account.currentBalance}</say-as>. 				
					Would you like to pay this balance now?</speak>`);
			agent.setContext({
					'name': 'retrieveaccountinfo',
					'lifespan': 20,
					'parameters': {
						'account-id': account.id,
						'cardholder-name': account.firstName + ' ' + account.lastName,
						'current-balance': account.currentBalance
					}
				}
			);
		} else {
			agent.add(`I don't see an outstanding balance on your account. Would you like to speak to an agent?'`);
			setConnectAgentContexts(agent);				
		}
	}
	
	function collectAccountId(agent) {
		console.log('collectAccountId()', agent.contexts[0].name);		
		const accountId = agent.getContext('collectaccountid').parameters['account-id'];
		console.log('account-id', accountId);
		
		if(accountId.length == 10) {
			console.log('makePayment()', agent.contexts[0].name);
			agent.add(`Please wait while I retrieve your account infomation...`);
			agent.setFollowupEvent({name: 'retrieve-account-info', parameters: {received: false}});
		} else {	
			agent.add(`You have provided an invalid account ID. Please say the valid 10 digit account ID.`);
			agent.setContext({
				'name': 'collectaccountid',
				'lifespan': 20
			});
		}
	}
	function collectCardNumber(agent) {
		console.log('collectCardNumber()', agent.contexts[0].name);		
		const cardNumber = agent.getContext('collectcardnumber').parameters['card-number'];
		//const cardNumberStr = cardNumber.split('').join(' ');
		console.log('card-number', cardNumber);
		
		if(cardNumber.length == 16) {	
			agent.add(`<speak>Thanks. You said <say-as interpret-as="verbatim">${cardNumber}</say-as>. Is that correct?</speak>`);
		} else {			
			agent.add(`You have provided an invalid credit card number. Please say the valid 16 digit credit card number.`);
			agent.setContext({
				'name': 'collectcardnumber',
				'lifespan': 20
			});
		}
	}
	function collectExpirationDate(agent) {
		console.log('collectExpirationDate()', agent.contexts[0].name);
		
		const expDate = agent.getContext('collectexpirationdate').parameters['exp-date'];
		const expMnY = expDate.startDate.substr(5, 2) + '-' + expDate.startDate.substr(0, 4);
		console.log('exp-date', expMnY);
		agent.add(`<speak>You said <say-as interpret-as="date" format="mmyyyy" detail="1">${expMnY}</say-as>.
				 What is the card's 3 or 4 digit verification code?</speak>`);
	}
	function collectVerificationCode(agent) {
		console.log('collectVerificationCode()', agent.contexts[0].name);
		
		const cvvCode = agent.getContext('collectverificationcode').parameters['verification-code'];
		const cvvCodeStr = cvvCode.split('').join(' ');
		console.log('verification-code', cvvCodeStr);
		agent.add(`You said ${cvvCodeStr}. What is the card holder's zip code?`);
	}
	function collectZipCode(agent) {
		console.log('collectZipCode()', agent.contexts[0].name);
		
		const zipCode = agent.getContext('collectzipcode').parameters['zip-code'];
		const zipCodeStr = zipCode.split('').join(' ');
		console.log('zip-code', zipCodeStr);
		agent.add(`You said ${zipCodeStr}. What dollar amount would you like to pay?`);
	}
	function collectPaymentAmount(agent) {
		console.log('collectPaymentAmount()', agent.contexts[0].name);
		
		const payAmount = agent.getContext('collectpaymentamount').parameters['payment-amount'];
		console.log('payment-amount', payAmount);
	}	
	function processPaymentRequest(agent) {
		console.log('processPaymentRequest()', agent.contexts[0].name);
		console.log('context', agent.getContext('retrieveaccountinfo'));
		console.log('parameters', agent.getContext('retrieveaccountinfo').parameters);
		
		const accountId = agent.getContext('retrieveaccountinfo').parameters['account-id'];	
		console.log('account-id', accountId);
		
		const cardholderName = agent.getContext('retrieveaccountinfo').parameters['cardholder-name'];	
		console.log('cardholder-name', cardholderName);
		
		var cardNumber = agent.getContext('retrieveaccountinfo').parameters['card-number'];
		if(cardNumber != '4111111111111111') {
			console.log('Use valid sanbdox card-number');
			cardNumber = '4111111111111111';
		}	
		console.log('card-number', cardNumber);
		
		const expMonth = agent.getContext('retrieveaccountinfo').parameters['expiration-month'];
		const expYear = agent.getContext('retrieveaccountinfo').parameters['expiration-year'];
		console.log('expiration-date', expMonth, expYear);
		
		const cvvCode = agent.getContext('retrieveaccountinfo').parameters['verification-code'];
		console.log('verification-code', cvvCode);
		
		const zipCode = agent.getContext('retrieveaccountinfo').parameters['zip-code'];
		console.log('zip-code', zipCode);
		
		var payAmount = agent.getContext('retrieveaccountinfo').parameters['payment-amount'];
		if(payAmount) {
			payAmount = payAmount.amount;
			console.log('payment-amount', payAmount);
		} else {
			payAmount = agent.getContext('retrieveaccountinfo').parameters['current-balance'];			
			console.log('current-balance', payAmount);
		}
		
		clearContexts(agent);
		
		return new Promise((resolve, reject) => {					
			try {	
				const gateway = new braintree.BraintreeGateway({
					environment: braintree.Environment.Sandbox,
					merchantId: 'fd2wsyp3cfyftqbt',
					publicKey: 'h3yp3swzrjqdvd8t',
					privateKey: 'f74faff05e963bd751d6d7fa3c3c391b'
				});									
				gateway.transaction.sale({
					amount: payAmount,
					creditCard: {
						cardholderName: cardholderName,
						number: cardNumber,
						cvv: cvvCode,
						expirationMonth: expMonth,
						expirationYear: expYear
					}
				}, (error, result) => {
					if (result) {
						console.log('Transaction result', result.success);
						if(result.success) {						
							console.log('Transaction status', result.transaction.status);						
							console.log('Payment transaction succeeded for', cardholderName);
							console.log(`Transaction ID ${result.transaction.networkTransactionId}`);
							console.log(`Response type ${result.transaction.processorResponseType}`);
							console.log(`Reference # ${result.transaction.retrievalReferenceNumber}`);
							agent.add(`<speak>Your payment transaction completed. The transaction ID is 
									<say-as interpret-as="verbatim">${result.transaction.networkTransactionId}</say-as>. 
									Is there anything else I can assist you with?</speak>`);
									
							var response = {};
							response.success = result.success;
							response.accountId = accountId;
							response.transactionId = result.transaction.networkTransactionId;
							response.referenceNumber = result.transaction.retrievalReferenceNumber;
							response.paymentAmount = payAmount;							
							sendPaymentResponse(response);
						} else {
							agent.add(`Your payment transaction did not go through. Would you like to speak to an agent?`);
							setConnectAgentContexts(agent)	
						}
						resolve('Success');
					} else {
						console.error('Error', error);
						agent.add(`There was an error with the payment transaction. Would you like to speak to an agent?`);
						setConnectAgentContexts(agent);
						reject('Failure');
					}
				});
			} catch(e) {
				console.error('Exception', e);
				agent.add(`Your payment request failed. Would you like to speak to an agent?`);
				setConnectAgentContexts(agent)
				reject('Failure');
			}
		});
	}
	function processRefundRequest(agent) {
		console.log('processRefundRequest()', agent.contexts[0].name);
		
		const transactionId = agent.getContext('collecttransactionid').parameters['transaction-id'];	
		console.log('transaction-id', transactionId);
		
		return new Promise((resolve, reject) => {					
			try {	
				const gateway = new braintree.BraintreeGateway({
					environment: braintree.Environment.Sandbox,
					merchantId: 'fd2wsyp3cfyftqbt',
					publicKey: 'h3yp3swzrjqdvd8t',
					privateKey: 'f74faff05e963bd751d6d7fa3c3c391b'
				});									
				gateway.transaction.refund(transactionId, (error, result) => {
					console.log('Result', result);
					if (result) {
						console.log('Transaction result', result.success);
						if(result.success) {						
							console.log('Transaction status', result.transaction.status);
							agent.add(`<speak>Your refund transaction completed. Your reference number is ...`);
							//		<say-as interpret-as="verbatim">${result.transaction.retrievalReferenceNumber}</say-as>. 
							//		Is there anything else I can assist you with?</speak>`);
						} else {
							agent.add(`Your refund request did not go through. Would you like to speak to an agent?`);
							setConnectAgentContexts(agent);
						}
						resolve('Success');
					} else {
						console.error('Error', error);
						agent.add(`There was an error with the refund request. Would you like to speak to an agent?`);
						setConnectAgentContexts(agent);
						reject('Failure');
					}
				});
			} catch(e) {
				console.error('Exception', e);
				agent.add(`Your refund request failed. Would you like to speak to an agent?`);
				setConnectAgentContexts(agent);
				reject('Failure');
			}
		});
	}
	
	function createNewOrder(phone, amount) {
		axios({
			url: 'https://ccaipayassist.pstestsite.com/order/ani/' + phone,	
			method: 'POST'
		}).then(result => {
			console.log('Result', result.data);
			var order = result.data;
			if(order.error !== null) {
				console.log('Error', order.error)
			} else {				
				order.amount = amount;			
				saveOrder(order);
			}
		}).catch(error => {
			console.log('Error', error);
		});
	}
	
	function saveOrder(order) {
		axios({
			url: 'https://ccaipayassist.pstestsite.com/order',	
			method: 'POST',
			data: order
		}).then(result => {
			console.log('Result', result.data);
		}).catch(error => {
			console.log('Error', error);
		});
	}
	
	function sendPaymentResponse(response) {
		console.log("sendPaymentResponse()");
		axios({
			url: 'https://ccaipayassist.pstestsite.com/dialogflow/payment/response',	
			method: 'POST',
			data: response
		}).then(result => {
			console.log('Result', result.data);
		}).catch(error => {
			console.log('Error', error);
		});
	}
	
	function setConnectAgentContexts(agent) {	
		clearContexts(agent);
			
		agent.setContext({
			'name': 'connecttoagent',
			'lifespan': 5
		});
		agent.setContext({
			'name': 'disconnectcall',
			'lifespan': 5
		});		
	}
	
	function clearContexts(agent) {		
		agent.setContext({
			'name': 'beginpaymentassistant-followup',
			'lifespan': -1
		});
		agent.setContext({
			'name': 'beginpaymentassistant-yes',
			'lifespan': -1
		});
		agent.setContext({
			'name': 'collectaccountid',
			'lifespan': -1
		});
		agent.setContext({
			'name': 'retrieveaccountinfo',
			'lifespan': -1
		});
		agent.setContext({
			'name': 'collectpaymentamount',
			'lifespan': -1
		});
		agent.setContext({
			'name': 'collectcardnumber',
			'lifespan': -1
		})
		agent.setContext({
			'name': 'collectexpirationdate',
			'lifespan': -1
		});
		agent.setContext({
			'name': 'collectverificationcode',
			'lifespan': -1
		});
		agent.setContext({
			'name': 'collectzipcode',
			'lifespan': -1
		});
		agent.setContext({
			'name': 'collecttransactionid',
			'lifespan': -1
		});
		agent.setContext({
			'name': 'processpaymentrequest',
			'lifespan': -1
		});				
	}
	
	let intentMap = new Map();
	intentMap.set('Begin Payment Assistant', retrieveAccountByCallerId);
	intentMap.set('Collect Account ID - yes', collectAccountId);
	intentMap.set('Retrieve Account Info', retrieveAccountById);
	intentMap.set('Collect Card Number', collectCardNumber);
	intentMap.set('Collect Expiration Date', collectExpirationDate);
	intentMap.set('Collect Verification Code', collectVerificationCode);
	intentMap.set('Collect Zip Code', collectZipCode);
	intentMap.set('Collect Payment Amount', collectPaymentAmount);
  	intentMap.set('Process Payment Request', processPaymentRequest);
  	intentMap.set('Process Refund Request', processRefundRequest);

  	agent.handleRequest(intentMap);

	console.log('Dialogflow request ends');
});