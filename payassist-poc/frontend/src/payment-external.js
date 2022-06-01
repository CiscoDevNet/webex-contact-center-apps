const braintree = require('braintree-web/client');
const fields = require('braintree-web/hosted-fields');

class CustomerPayment extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({
            mode: 'open'
        });
		
		// properties passed from agent desktop
		this.accessToken = null;
		this.serviceUrl = null;
		this.profile = null;
		this.ani = null;
		this.interactionId = null;
		this.isDarkMode = false;
		this.textColor = '#000000';
    }

    connectedCallback() {
		const self = this;		
		
		this.enableProcessPayment(self, this.shadowRoot);
		this.enablePaymentResult(self, this.shadowRoot);				
						
		if(this.attributes) {						
			this.serviceUrl = this.attributes.serviceUrl.value;
			this.profile = this.attributes.profile.value;			
		}		
		console.log('PAYASSIST [Payment]', 'connectedCallback()', this.serviceUrl, this.profile);		
    }

    attributeChangedCallback(name, oldVal, newVal) {
        console.log('PAYASSIST [Payment]', 'attributeChangeCallback()', name, oldVal, newVal);
    }

    disconnectedCallback() {
        console.log('PAYASSIST [Payment]', 'disconnectedCallback()');
    }

	enableProcessPayment(self, parent) {		
		self.makePaymentContainer = document.createElement('div');	
		self.makePaymentContainer.id = 'payment-container';			
		parent.appendChild(self.makePaymentContainer);
				
		self.paymentForm = document.createElement('form');
		self.paymentForm.id = 'payment-form';
		self.paymentForm.method = 'post';
		self.paymentForm.action = '/';
		self.paymentForm.hidden = true;
		self.makePaymentContainer.appendChild(self.paymentForm);
		
		var table = document.createElement('table');
		table.style.width = '100%';
		self.paymentForm.appendChild(table);
		
		var tr = document.createElement('tr');
		if(self.isMobileDevice()) {
			tr.style.display = 'grid'
		}
		table.appendChild(tr);
		
        self.cardNumElement = self.createInputField(self, 'card-number', 'Card Number', 'text', tr);	
        self.cvvCodeElement = self.createInputField(self, 'cvv-code', 'CVV', 'number', tr);		
        self.expDateElement = self.createInputField(self, 'expiration-date', 'Expiration Date', 'text', tr);		
		self.postalCodeElement = self.createInputField(self, 'postal-code', 'Postal Code', 'number', tr);
		
		tr = document.createElement('tr');
		if(self.isMobileDevice()) {
			tr.style.display = 'grid'
		}
		table.appendChild(tr);		
		self.accountIdElement = self.createInputField(self, 'account-id', 'Account ID', 'number', tr);
		self.payAmountElement = self.createInputField(self, 'pay-amount', 'Amount', 'text', tr, '00.00');
		
		tr = document.createElement('tr');
		table.appendChild(tr);
        self.payButton = self.createFormButton('make-payment', 'Pay', 'submit', tr);
		self.payButton.style.cursor = 'pointer';
		
		self.startButton = self.createFormButton('start-payment', 'Start', 'button');	
		self.startButton.disabled = false;	
		self.startButton.style.cursor = 'pointer';
		self.makePaymentContainer.appendChild(self.startButton);
				
		self.startButton.addEventListener('click', () => {
			console.log('PAYASSIST [Payment]', 'start payment', self.ani);
			
			if(self.attributes.external) {
				const accountId = self.getParam('acct');
				console.log('PAYASSIST [Payment]', 'accountId', accountId);
				
				if(accountId) {					
					fetch(self.serviceUrl + '/desktop/account/id/' + accountId, {
						method: 'get',
						headers: {					
							'authorization': self.accessToken
						}	
					})
					.then(response => response.json())
					.then(data => {
						console.log('PAYASSIST [Payment]', 'async data', data)
						
						self.account = data;
						self.accountIdElement.firstElementChild.value = self.account.id;
						self.payAmountElement.firstElementChild.value = self.account.currentBalance.toFixed(2);
					})
					.catch(error => console.log('PAYASSIST [Payment]', 'error', error));	
				}
			}			
			
			self.paymentForm.hidden = false;
			self.startButton.hidden = true;
			self.processPayment(self);	
		});
	}
	
	getParam(param) {
		var params = window.location.search.substring(1).split('&');
		for(var i in params) {
			var pair = params[i].split('=');	
			if(pair[0] === param) {
				return pair[1];
			}
		}
	}

	enablePaymentResult(self, parent) {
		self.paymentStatusContainer = document.createElement('div');
		self.paymentStatusContainer.style.paddingLeft = '5px';	
		self.paymentStatusContainer.hidden = true;				
		parent.appendChild(self.paymentStatusContainer);
	}
	
	showPaymentStatus(self, message) {													
		self.makePaymentContainer.hidden = true;
		self.paymentStatusContainer.innerHTML = message;
		self.paymentStatusContainer.hidden = false;	
	}

	createInputOption(self, id, name, group, div) {
        var input = document.createElement('input');
		var label = document.createElement('label');
		input.type = 'radio';
		input.id = id;
		input.value = id;
		input.name = group;
		label.htmlFor = id;
		label.innerText = name;
		label.style.color = self.textColor;
		label.style.paddingRight = '20px';
		div.appendChild(input);
		div.appendChild(label);
		
		return input;
	}

	createInputField(self, id, name, type, tr, placeholder) {
		var td = document.createElement('td');
		var label = document.createElement('label');
        var div = document.createElement('div');		
		var input = document.createElement('input');
		input.type = type;		
		
		if(id === 'pay-amount' || id === 'account-id' || id === 'email-address' || id === 'phone-number') {	
			input.placeholder = placeholder;
			input.style.height = '100%';
			input.style.width = '100%';
			input.style.border = 'none';
			input.style.outline = 'none';
			div.appendChild(input);
			
			if(id === 'pay-amount' || id === 'account-id') {	
				if(id === 'pay-amount') {
					input.step = '0.01';
				}
				td.appendChild(label);
			} else {
				td.style.paddingLeft = '5px';
			}			
		} else {
			td.appendChild(label);
		}
		
        label.htmlFor = id;
        label.innerText = name;
		label.style.color = self.textColor;
		label.style.lineHeight = '24px';
        div.id = id;
		div.style.height = '20px';
		div.style.border = '1px solid gray';
		div.style.padding = '5px 5px 5px 5px';
		td.appendChild(div);
		tr.appendChild(td);

		return div;
	}
	
	createFormButton(id, name, type, tr) {
		var td = document.createElement('td');
		var input = document.createElement('input');
		input.type = type;
		input.id = id;
        input.value = name;
        input.disabled = true;
		input.style.height = '25px';
		input.style.width = '50px';
		if(tr) {				
        	td.appendChild(input);
			td.style.paddingTop = '20px';	
			tr.appendChild(td);
		}
		
		return input;	
	}
	
	isMobileDevice() {
		return navigator.userAgent.match(/Android/i)
			 || navigator.userAgent.match(/webOS/i)
			 || navigator.userAgent.match(/iPhone/i)
			 || navigator.userAgent.match(/iPad/i)
			 || navigator.userAgent.match(/iPod/i)
			 || navigator.userAgent.match(/BlackBerry/i)
			 || navigator.userAgent.match(/Windows Phone/i);
	}
	
	sendPaymentLink(self) {
		console.log('PAYASSIST [Payment]', 'sendPaymentLink()');
		
		var requestUrl = self.serviceUrl + '/link';
		var request = {};
		request.paymentUrl = self.serviceUrl + '/' + self.profile + '?acct=' 
							+ self.accountIdElement.firstElementChild.value;
		if(self.emailOption.checked) {
			console.log('PAYASSIST [Payment]', 'emailOption selected');	
			request.emailAddress = self.emailAddress.firstElementChild.value;
			requestUrl += '/email';
				
		} else {
			console.log('PAYASSIST [Payment]', 'emailOption selected');
			request.phoneNumber = self.phoneNumber.firstElementChild.value;
			requestUrl += '/sms';
		}
		
		console.log('PAYASSIST [Payment]', 'request', request);
		
		fetch(requestUrl, {
			method: 'post',
			headers: {
				'authorization': self.accessToken,
				'content-type': 'application/json'
			},
			body: JSON.stringify(request)
		})
		.then(response => response.text())
		.then(data => {
			console.log('PAYASSIST [Payment]', 'response data', data);
			self.showPaymentStatus(self, `<p style="color:green;">Payment link has been sent to ${data}</p>`);
		})
		.catch(error => console.log('PAYASSIST [Payment]', 'error', error));
	}
	
	processPayment(self) {
		const requestUrl = self.serviceUrl + '/' + self.profile;
		
		fetch(requestUrl + '/token', {
			headers: {
				'authorization': self.accessToken
			}	
		})
		.then(response => response.json())
		.then(data => {
			console.log('PAYASSIST [Payment]', 'token', data.clientToken);
			
			braintree.create({
				authorization: data.clientToken
	        }, function(clientError, clientInstance) {
	            if (clientError) {
	                console.error('PAYASSIST [Payment]', 'client error', clientError);
	                return;
	            }
	            fields.create({
	                client: clientInstance,
	                styles: {
	                    'input': {
	                        'font-size': '14px',
							'color': self.textColor
	                    },
	                    'input.invalid': {
	                        'color': 'red'
	                    },
	                    'input.valid': {
	                        'color': 'green'
	                    }
	                },
	                fields: {
	                    number: {
	                        container: self.cardNumElement,
	                        placeholder: '0000 0000 0000 0000'
	                    },
	                    cvv: {
	                        container: self.cvvCodeElement,
	                        placeholder: '000'
	                    },
	                    expirationDate: {
	                        container: self.expDateElement,
	                        placeholder: 'MM/YYYY'
	                    },
	                    postalCode: {
	                        container: self.postalCodeElement,
	                        placeholder: '00000'
	                    }
	                }
	            }, function(hostedFieldsError, hostedFieldsInstance) {
	                if (hostedFieldsError) {
	                    console.error('PAYASSIST [Payment]', 'hostfields error', hostedFieldsError);
	                    return;
	                }

					self.payButton.disabled = false;
										
					hostedFieldsInstance.on('focus', (e) => {
						console.log('PAYASSIST [Payment]', 'hostedField focus', e);
						if(e.emittedBy === 'number') {
							//self.pauseRecording(self.interactionId);
						}
					});
					
	                self.paymentForm.addEventListener('submit', function(event) {
	                    event.preventDefault();						
	
	                    hostedFieldsInstance.tokenize(function(tokenizeError, payload) {
	                        if (tokenizeError) {
	                            console.error(tokenizeError);
								self.showPaymentStatus(self, `<p style="color:red;">Error: ${tokenizeError.message}</p>`);
	                            return;
	                        }

							if(!self.payAmountElement.firstElementChild.value || isNaN(self.payAmountElement.firstElementChild.value)) {
								console.log('PAYASSIST [Payment]', 'Invalid amount');
								self.showPaymentStatus(self, `<p style="color:red;">Error: Invalid amount</p>`);
								return;
							}
	
	                        console.log('PAYASSIST [Payment]', 'Nonce', payload.nonce);

							self.showPaymentStatus(self, `<p style="color:blue;">Please wait while your payment is being processed...</p>`);
							self.payButton.disabled = true;

							var request = {};
							request.methodNonce = payload.nonce;
							request.accountId = self.accountIdElement.firstElementChild.value;
							request.amount = self.payAmountElement.firstElementChild.value;

							fetch(requestUrl + '/checkout/nonce', {
								method: 'post',
								headers: {
									'authorization': self.accessToken,
									'content-type': 'application/json'
								},
								body: JSON.stringify(request)
							})
							.then(response => response.json())
							.then(data => {
								console.log('PAYASSIST [Payment]', 'result', data);
								if(data.success) {									
									self.showPaymentStatus(self, `<p style="color:green;">Payment transaction completed. Transaction ID: ${data.transactionId}</p>`);
								} else {
									self.showPaymentStatus(self, `<p style="color:red;">Payment transaction failed. Message: ${data.message}</p>`);
									self.payButton.disabled = false;
								}
								
								//self.resumeRecording(self.interactionId);							
							});
	                    });
	                }, false);
	            });
	        });
		}).catch(error => console.log('PAYASSIST [Payment]', 'error', error));
	}
}
customElements.define('customer-payment', CustomerPayment);
