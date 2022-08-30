import { Desktop } from '@wxcc-desktop/sdk';

class AgentOutdialWidget extends HTMLElement {

	constructor() {	
		console.log('[AgentOutdial]', 'constructor');
		super();	
		this.attachShadow({
			mode: 'open'
		});
		
		this.serviceUrl = null;
		this.agentLogin = null;
		this.outdialAniList = null;
		this.outdialEp = null;
		this.aniListName = null;
		this.outdialEp = null;
		this.interactionId = null;
		this.eventSource = null;
	}

	connectedCallback() {
		console.log('[AgentOutdial]', 'connectedCallback');
		
		try {
			this.initDesktopConfig();
						
			console.log('[AgentOutdial]', 'serviceUrl', this.serviceUrl);
			console.log('[AgentOutdial]', 'agentLogin', this.agentLogin);	
			console.log('[AgentOutdial]', 'aniListName', this.aniListName);		
			console.log('[AgentOutdial]', 'outdialEp', this.outdialEp);
			
			Desktop.agentContact.addEventListener("eAgentOfferContact", msg => {
				console.log('[AgentOutdial]', 'eAgentOfferContact', msg);			
				console.log('[AgentOutdial]', 'interactionId', msg.data.interactionId);	
			});
			Desktop.agentContact.addEventListener("eAgentContactAssigned", msg => {
				console.log('[AgentOutdial]', 'eAgentContactAssigned', msg);			
				console.log('[AgentOutdial]', 'interactionId', msg.data.interactionId);	
			});
			
			this.postOutdialAniList();
			this.listenForOutdialRequest();
			
		} catch (error) {
			console.log('[AgentOutdial]', 'connectedCallback:error:', error);
		}
	}
	
	attributeChangedCallback(name, oldVal, newVal) {
		console.log('[AgentOutdial]', 'attributeChangedCallback', name, oldVal, newVal);
	}

	disconnectedCallback() {
		console.log('[AgentOutdial]', 'disconnectedCallback');		
		Desktop.agentContact.removeAllEventListeners();
		this.eventSource.close();
	}

	initDesktopConfig() {
		console.log('[AgentOutdial]', 'initDesktopConfig');
		if (AGENTX_SERVICE) {
			Desktop.config.init();
		}
	}
	
	postOutdialAniList() {
		console.log('[AgentOutdial]', 'postOutdialAniList', this.serviceUrl);
		
		const aniList = {};
		aniList.name = this.aniListName;			
		aniList.anis = this.outdialAniList;
		/*
		const anis = [];
		this.outdialAniList.forEach(ani => {
			anis.push(ani);			
		});
		aniList.anis = anis;
		*/	
		console.log('[AgentOutdial]', 'aniList', aniList);
		
		fetch(this.serviceUrl + '/outdial/anis', {
			method: 'post',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(aniList)			
		})
		.then(resp => resp.text())
		.then(data => {
			console.log('[AgentOutdial]', 'response', data);
		})
		.catch(error => {
			console.log('[AgentOutdial]', 'error', error);
		});
	}
	
	listenForOutdialRequest() {
		console.log('[AgentOutdial]', 'listenForOutdialRequest', this.serviceUrl);
		
		const self = this;		
		this.eventSource = new EventSource(this.serviceUrl + '/outdial/listen/' + this.agentLogin);
		this.eventSource.onopen = (e) => {
			console.log('[AgentOutdial]', 'eventsource onopen');
		};
		this.eventSource.onmessage = (e) => {
			console.log('[AgentOutdial]', 'eventsource onmessage', e.data);
			
			if(e.data) {
				const data = JSON.parse(e.data);
				if(data.login === self.agentLogin) {
					const request = {};
					request.destination = data.dnis;
					request.entryPointId = self.outdialEp;
					request.direction = 'OUTBOUND';
					request.mediaType = 'telephony';
					request.outboundType = 'OUTDIAL';
					request.attributes = {};
					
					if(data.ani) {
						request.origin = data.ani;
					}					
					
					console.log('[AgentOutdial]', 'outdial request', request);
					
					Desktop.dialer.startOutdial({data: request});
				}
				
			}
		};
		this.eventSource.onerror = (e) => {
			console.log('[AgentOutdial]', 'eventsource onerror', e);
		};
	}
}
customElements.define('agent-outdial', AgentOutdialWidget);
