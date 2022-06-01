class AccountDetail extends HTMLElement {
		
    constructor() {
        super();
        const shadow = this.attachShadow({
            mode: 'open'
        });
		
		// properties passed over from agent desktop
		this.accessToken = null;
		this.serviceUrl = null;
		this.profile = null;
		this.ani = null;
		this.isDarkMode = false;
		this.textColor = '#000000';
    }

    connectedCallback() {
		const self = this;
		
		if(this.attributes) {
			if(this.attributes.accessToken) {
				this.accessToken = this.attributes.accessToken.value;
				console.log('Token', this.accessToken);
			}	
			this.serviceUrl = this.attributes.serviceUrl.value;
			this.profile = this.attributes.profile.value;
			this.ani = this.attributes.ani.value;
			if(this.attributes.isDarkMode) {
				console.log('PAYASSIST [Account]', 'isDarkMode', this.attributes.isDarkMode.value);
				this.isDarkMode = JSON.parse(this.attributes.isDarkMode.value);
				if(this.isDarkMode) {
					this.textColor = '#ffffff';
				}				
				console.log('PAYASSIST [Account]', 'isDarkMode', this.isDarkMode, 'textColor', this.textColor);				
			}
		}		
        console.log('PAYASSIST [Account]', 'connectedCallback()', this.serviceUrl, this.profile, this.ani);			
		
		this.connectStompClient(self);
    }
	
	connectStompClient(self) {
		var Stomp = require('stompjs');
		var client = new Stomp.client(self.serviceUrl.replace('http', 'ws')+'/message-broker');
		var endpoint = '/desktop/account/' + self.ani;		
		client.connect('', '', function(sessionId) {
			console.log('PAYASSIST [Account]', 'client connected', sessionId);
		    client.subscribe(endpoint, function(message) {
				console.log('PAYASSIST [Account]', 'Headers', message.headers);
		   		console.log('PAYASSIST [Account]', 'Body', message.body);
	
				self.account = JSON.parse(message.body);
				self.popAccount(self, self.account);
		    });

			if(self.ani) {							
				setTimeout(() => {	
					fetch(self.serviceUrl + '/desktop/account/async/ani/' + self.ani, {
						method: 'get',
						headers: {					
							'authorization': self.accessToken
						}	
					})
					.then(response => response.text())
					.then(data => {
						console.log('PAYASSIST [Account]', 'async data', data)
					})
					.catch(error => console.log('PAYASSIST [Account]', 'error', error));	
				}, 3000);
			}
		}, function(error) {
			console.log('PAYASSIST [Account]', 'client error', error);
			self.connectStompClient(self);
		});
	}
	
    attributeChangedCallback(name, oldVal, newVal) {
        console.log('PAYASSIST [Account]', 'attributeChangeCallback()', name, oldVal, newVal);
    }

    disconnectedCallback() {
        console.log('PAYASSIST [Account]', 'disconnectedCallback()');
    }

	setReadOnly(self, readOnly) {
		self.accountContainer.querySelectorAll('input').forEach(child => {
			child.readOnly = readOnly;
			child.style.backgroundColor = readOnly ? '#f0f5f5' : '#ffffff';
			child.style.outline = readOnly ? 'none' : '';
		});			
	}

	enableEdit(self, container) {
		var edit = document.createElement('button');
		edit.innerText = 'Edit';
		edit.style.width = '50px';
		edit.style.height= '25px';
		edit.style.marginRight = '20px';
		container.appendChild(edit);			
		edit.onclick = (() => {		
			console.log('PAYASSIST [Account]', 'edit account');	
			self.setReadOnly(self, false);
			self.edit.hidden = true;
			self.save.hidden = false;
			self.cancel.hidden = false;
		});			
		
		self.edit = edit;
	} 
	
	enableSave(self, container) {
		var save = document.createElement('button');
		save.innerText = 'Save';
		save.style.width = '50px';
		save.style.height= '25px';
		save.style.marginRight = '10px';
		container.appendChild(save);	
		save.onclick = (() => {		
			console.log('PAYASSIST [Account]', 'save account');	
			
			self.account.firstName = self.firstName.value;
			self.account.lastName = self.lastName.value;
			self.account.phoneNumber = self.phoneNumber.value;
			self.account.emailAddress = self.emailAddress.value;
			self.account.streetAddress = self.streetAddress.value;
			self.account.city = self.city.value;
			self.account.state = self.state.value;
			self.account.zipCode = self.zipCode.value;
			self.account.currentBalance = self.currentBalance.value;
			
			fetch(self.serviceUrl + '/desktop/account/async', {
				method: 'post',
				headers: {
					'authorization': self.accessToken,
					'content-type': 'application/json'
				},
				body: JSON.stringify(self.account)
			})
			.then(response => response.text())
			.then(data => {
				console.log('PAYASSIST [Account]', 'async data', data)
			})
			.catch(error => console.log('PAYASSIST [Account]', 'error', error));				
		});	
		
		self.save = save;
	}
	
	enableCancel(self, container) {
		var cancel = document.createElement('button');
		cancel.innerText = 'Cancel';
		cancel.style.width = '60px';
		cancel.style.height= '25px';
		cancel.style.marginRight = '20px';
		container.appendChild(cancel);	
		cancel.onclick = (() => {		
			console.log('PAYASSIST [Account]', 'cancel edit');	
			
			fetch(self.serviceUrl + '/desktop/account/async/ani/' + self.ani, {
				method: 'get',
				headers: {
					'authorization': self.accessToken
				}	
			})
			.then(response => response.text())
			.then(data => {
				console.log('PAYASSIST [Account]', 'async data', data)
			})
			.catch(error => console.log('PAYASSIST [Account]', 'error', error));	
		});	
		
		self.cancel = cancel;
	}

	popAccount(self, account) {
		self.shadowRoot.innerHTML = '';
		
		var div = document.createElement('div');
		div.style.textAlign = 'right';
		div.style.width = '100%';
		self.shadowRoot.appendChild(div);
					
		var h4 = document.createElement('h4');
		h4.style.color = self.textColor;		
		self.shadowRoot.appendChild(h4);
			
		self.accountContainer = document.createElement('div');
		self.shadowRoot.appendChild(self.accountContainer);
		self.accountForm = document.createElement('form');
		self.accountContainer.appendChild(self.accountForm);
				
		var table = document.createElement('table');
		table.style.width = '100%';
		self.accountForm.appendChild(table);
		
		var tr = document.createElement('tr');
		//tr.style.display = 'flex';
		table.appendChild(tr);
		
		self.firstName = self.createInputField(self, 'fisrt-name', 'First Name', 'text', tr, '', '200px', account.firstName);
		self.lastName = self.createInputField(self, 'last-name', 'Last Name', 'text', tr, '', '200px', account.lastName);
		
		tr = document.createElement('tr');
		table.appendChild(tr);
		self.phoneNumber = self.createInputField(self, 'phone-number', 'Phone Number', 'tel', tr, '', '200px', account.phoneNumber);
		self.emailAddress = self.createInputField(self, 'email-address', 'Email Address', 'email', tr, '', '200px', account.emailAddress);
		
		tr = document.createElement('tr');
		table.appendChild(tr);
		self.streetAddress = self.createInputField(self, 'street-address', 'Street Address', 'text', tr, '', '265px', account.streetAddress);
		self.city = self.createInputField(self, 'city', 'City', 'text', tr, '', '200px', account.city);
		
		tr = document.createElement('tr');
		table.appendChild(tr);
		self.state = self.createInputField(self, 'state', 'State', 'text', tr, '', '200px', account.state);
		self.zipCode = self.createInputField(self, 'zip-code', 'Zip Code', 'number', tr, '', '200px', account.zipCode);
		
		tr = document.createElement('tr');
		table.appendChild(tr);
		self.currentBalance = self.createInputField(self, 'current-balance', 'Current Balance', 'number', tr, '0.00', '100px', account.currentBalance);
		self.createdDate = self.createInputField(self, 'created-date', 'Created Date', 'date', tr, '', '200px', account.createdDate);
		
		self.enableEdit(self, div);
		self.enableSave(self, div);
		self.enableCancel(self, div);
		
		if(!self.nullOrEmpty(account.id)) {			
			h4.innerText = account.id;
			self.accountId = account.id;
			self.setReadOnly(self, true);
			self.edit.hidden = false;
			self.save.hidden = true;
			self.cancel.hidden = true;
		} else {
			h4.innerText = 'New Account';
			self.setReadOnly(self, false);
			self.edit.hidden = true;
			self.save.hidden = false;
			self.cancel.hidden = false;			
			
			self.currentBalance.readOnly = true;
			self.currentBalance.style.backgroundColor = '#f0f5f5';
			self.currentBalance.style.outline = 'none';
		}
	}

	createInputField(self, id, name, type, tr, placeholder, width, value) {
		var td = document.createElement('td');		
		td.style.paddingRight = '20px';
		
		var label = document.createElement('label');				
        label.htmlFor = id;
        label.innerText = name;
		label.style.color = self.textColor;
		label.style.lineHeight = '24px';
		td.appendChild(label);
		
		var input = document.createElement('input');
		input.type = type;
		input.style.height = '25px';
		input.style.width = '100%';
		input.style.border = '1px solid lightgray';
		input.value = value !== undefined ? value : '';
		
		if(id === 'current-balance') {
			input.pattern = '^\$\d{1,3}(,\d{3})*(\.\d+)?$';
			input.step = '0.01';
			input.placeholder = placeholder;
			if(value !== undefined && value !== null) {
				input.value = value.toFixed(2);
			}
		}
		td.appendChild(input);
		tr.appendChild(td);
		
		return input;
	}
	
	createTitleDropdown(id, name, tr, width, value) {
		console.log('PAYASSIST [Account]', 'createTitleDropdown()');
		var td = document.createElement('td');
		var label = document.createElement('label');
        var div = document.createElement('div');		
		var select = document.createElement('select');
		select.style.border = 'none';
		select.style.outline = 'none';
		select.style.width = width;
		
		var option = document.createElement('option');
		select.appendChild(option);
		
		option = document.createElement('option');
		option.value = 'Mr';
		option.text = 'Mr.';
		select.appendChild(option);
		
		option = document.createElement('option');
		option.value = 'Mrs';
		option.text = 'Mrs.';
		select.appendChild(option);
		
		option = document.createElement('option');
		option.value = 'Ms';
		option.text = 'Ms.';
		select.appendChild(option);
		
		select.value = value !== undefined ? value : '';
		
		td.appendChild(label);		
        label.htmlFor = id;
        label.innerText = name;
		label.style.lineHeight = '24px';
        div.id = id;
		div.style.height = '20px';
		div.style.border = '1px solid gray';
		div.style.padding = '5px 5px 5px 5px';
		div.style.borderRadius = '5px'; 		
		div.appendChild(select);
        td.appendChild(div);
		tr.appendChild(td);

		return div;
	}
	
	nullOrEmpty(param) {
	    if (param === undefined || param === 'undefined'
	        || param === null || param === 'null') {
	        return true;
	    } else if (typeof param === 'number') {
	        return false;
	    } else if (param.length && param.length > 0) {
	        return false;
	    } else if (param.length == 0) {
	        return true;
	    } else {
	        for (var key in param) {
	            if (hasOwnProperty.call(param, key)) {
	                return false;
	            }
	        }
	    }
	
	    return true;
	}
}
customElements.define('account-detail', AccountDetail);
