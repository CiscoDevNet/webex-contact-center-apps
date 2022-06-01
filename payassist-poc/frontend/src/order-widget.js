class OrderDetail extends HTMLElement {
		
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
				this.isDarkMode = JSON.parse(this.attributes.isDarkMode.value);
				if(this.isDarkMode) {
					this.textColor = '#ffffff';
				}
				console.log('PAYASSIST [Order]', 'isDarkMode', this.isDarkMode, 'textColor', this.textColor);				
			}
		}		
        console.log('PAYASSIST [Order]', 'connectedCallback()', this.serviceUrl, this.profile, this.ani);

		this.orders = {};
		this.orderControl = document.createElement('div');
		this.orderControl.style.textAlign = 'right';
		this.orderControl.style.width = '100%';
		this.shadowRoot.appendChild(this.orderControl);		
		this.orderListContainer = document.createElement('div');
		this.orderListContainer.style.float = 'left';
		this.orderListContainer.style.width = '10%';	
			
		var h4 = document.createElement('h4');
		h4.innerText = 'Order History';
		h4.style.color = this.textColor;
		
		this.orderListContainer.appendChild(h4);
		this.shadowRoot.appendChild(this.orderListContainer);
		
		this.orderContainer = document.createElement('div');		
		this.orderContainer.style.float = 'right';
		this.orderContainer.style.width = '90%';
		this.shadowRoot.appendChild(this.orderContainer);
		
		this.enableCreate(self, this.orderControl);		
		this.enableEdit(self, this.orderControl);
		this.enableSave(self, this.orderControl);
		this.enableCancel(self, this.orderControl);			
		
		this.connectStompClient(self);
    }

	connectStompClient(self) {
		var Stomp = require('stompjs');
		var client = new Stomp.client(self.serviceUrl.replace('http', 'ws')+'/message-broker');
		var endpoint = '/desktop/order/' + self.ani;		
		client.connect('', '', function(sessionId) {
			console.log('PAYASSIST [Order]', 'client connected', sessionId);
		    client.subscribe(endpoint, function(message) {
				console.log('PAYASSIST [Order]', 'Headers', message.headers);
		   		console.log('PAYASSIST [Order]', 'Body', message.body);
	
				self.order = JSON.parse(message.body);
				self.popOrder(self, self.order);							
		    });

			if(self.ani) {					
				setTimeout(() => {				
					fetch(self.serviceUrl + '/desktop/order/ani/' + self.ani, {
						method: 'get',
						headers: {
							'authorization': self.accessToken,
							'content-type': 'application/json'
						}	
					})
					.then(response => response.json())
					.then(data => {
						console.log('PAYASSIST [Order]', 'async data', data)
						
						data.forEach(order => {
							console.log('PAYASSIST [Order]', 'order', order);					
							self.popOrderList(self, order);
						});
					})
					.catch(error => console.log('PAYASSIST [Order]', 'error', error));	
				}, 3000);
			}
		}, function(error) {
			console.log('PAYASSIST [Order]', 'client error', error);
			self.connectStompClient(self);
		});
	}

    attributeChangedCallback(name, oldVal, newVal) {
        console.log('PAYASSIST [Order]', 'attributeChangeCallback()', name, oldVal, newVal);
    }

    disconnectedCallback() {
        console.log('PAYASSIST [Order]', 'disconnectedCallback()');
    }

	setReadOnly(self, readOnly) {
		self.orderContainer.querySelectorAll('input').forEach(child => {
			child.readOnly = readOnly;
			child.style.backgroundColor = readOnly ? '#f0f5f5' : '#ffffff';
		});			
	}
	
	enableCreate(self, container) {
		var create = document.createElement('button');
		create.innerText = 'New';
		create.style.width = '50px';
		create.style.height= '25px';
		create.style.marginRight = '10px';
		container.appendChild(create);			
		create.onclick = (() => {		
			console.log('PAYASSIST [Order]', 'create order');
			self.create.hidden = true;
			self.edit.hidden = true;
			
			fetch(self.serviceUrl + '/desktop/order/async/ani/' + self.ani, {
				method: 'post',
				headers: {
					'authorization': self.accessToken,
					'content-type': 'application/json'
				}
			})
			.then(response => response.text())
			.then(data => {
				console.log('PAYASSIST [Order]', 'async data', data)
			})
			.catch(error => console.log('PAYASSIST [Order]', 'error', error));	
			
		});			
		
		self.create = create;
	} 

	enableEdit(self, container) {
		var edit = document.createElement('button');
		edit.innerText = 'Edit';
		edit.style.width = '50px';
		edit.style.height= '25px';
		edit.style.marginRight = '20px';
		container.appendChild(edit);			
		edit.onclick = (() => {		
			console.log('PAYASSIST [Order]', 'edit order');	
			self.setReadOnly(self, false);
			self.edit.hidden = true;
			self.create.hidden = false;
			self.save.hidden = false;
			self.cancel.hidden = false;
		});			
		edit.hidden = true;		
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
			console.log('PAYASSIST [Order]', 'save order');	
			self.save.hidden = true;			
			self.cancel.hidden = true;
			
			self.order.orderAmount = self.orderAmount.value;						
			fetch(self.serviceUrl + '/desktop/order/async', {
				method: 'post',
				headers: {
					'authorization': self.accessToken,
					'content-type': 'application/json'
				},
				body: JSON.stringify(self.order)
			})
			.then(response => response.text())
			.then(data => {
				console.log('PAYASSIST [Order]', 'async data', data)
			})
			.catch(error => console.log('PAYASSIST [Order]', 'error', error));				
		});	
				
		save.hidden = true;	
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
			console.log('PAYASSIST [Order]', 'cancel edit');	
			self.setReadOnly(self, true);
			self.cancel.hidden = true;
			self.edit.hidden = false;
			self.save.hidden = true;
			self.create.hidden = false;
		});	
				
		cancel.hidden = true;	
		self.cancel = cancel;
	}
	
	popOrderList(self, order) {	
		var oid = 'ord-' + order.id;
		self.orders[order.id] = order;
		if(!self.orderListContainer.querySelector('#'+oid)) {			
			var p = document.createElement('p');
			var b = document.createElement('button');
			b.innerText = order.id;
			b.style.color = self.textColor;
			b.id = oid;
			b.style.border = 'none';
			b.style.backgroundColor = 'transparent';
			b.style.cursor = 'pointer';
			p.appendChild(b);
			self.orderListContainer.appendChild(p);
			
			b.onclick = (() => {			
				self.order = self.orders[b.innerText];				
				console.log('PAYASSIST [Order]', 'select order', self.order);	
				self.popOrder(self, self.order);
			});
		}
	}

	popOrder(self, order) {		
		self.orderContainer.innerHTML = '';
		var h4 = document.createElement('h4');
		h4.style.color = self.textColor;
		self.orderContainer.appendChild(h4);	
			
		if(order.error) {
			console.log('PAYASSIST [Order]', 'error', order.error);
			h4.innerText = order.error;
			h4.style.color = 'red';
		} else {
			
			self.shadowRoot.appendChild(self.orderContainer);
			self.orderForm = document.createElement('form');
			self.orderContainer.appendChild(self.orderForm);
					
			var table = document.createElement('table');
			table.style.width = '100%';
			self.orderForm.appendChild(table);
			
			var tr = document.createElement('tr');
			table.appendChild(tr);
			
			self.accountId = self.createInputField(self, 'account-id', 'Account ID', 'text', tr, '', '200px', order.accountId);
			self.orderDate = self.createInputField(self, 'order-date', 'Order Date', 'date', tr, '', '200px', order.orderDate);
			
			tr = document.createElement('tr');
			table.appendChild(tr);
			self.orderAmount = self.createInputField(self, 'order-amount', 'Order Amount', 'number', tr, '0.00', '200px', order.orderAmount);
			self.orderStatus = self.createInputField(self, 'order-status', 'Order Status', 'text', tr, '', '200px', order.orderStatus);
			
			tr = document.createElement('tr');
			table.appendChild(tr);
			self.paidDate = self.createInputField(self, 'paid-date', 'Paid Date', 'date', tr, '', '200px', order.paidDate);
			self.transactionId = self.createInputField(self, 'transaction-id', 'Transaction ID', 'text', tr, '', '200px', order.transactionId);
			
			if(!self.nullOrEmpty(order.id)) {			
				h4.innerText = order.id;
				self.popOrderList(self, order);
				self.setReadOnly(self, true);			
				self.create.hidden = false;
				self.edit.hidden = false;
				self.save.hidden = true;
				self.cancel.hidden = true;
			} else {
				h4.innerText = 'New Order';
				self.setReadOnly(self, false);
				self.edit.hidden = true;
				self.save.hidden = false;
				self.cancel.hidden = false;
			}
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
		
		if(id === 'order-amount') {
			console.log('PAYASSIST [Order]', 'amount', value);
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
customElements.define('order-detail', OrderDetail);
